# 03 — TECH_ARCHITECTURE.md
## টেকনোলজি, কোড স্ট্রাকচার ও ডেটাবেস

## 1. Tech Stack
| Layer | Choice |
|---|---|
| Language | Kotlin (JDK 17) |
| Build | Gradle (Kotlin DSL), Android Gradle Plugin stable, version catalog `libs.versions.toml` |
| SDK | `minSdk 21` (TX9 Pro সাধারণত Android 9/10/11; কম সংস্করণ কভার করতে), `targetSdk` = stable সর্বশেষ, `compileSdk` সমান |
| UI | Jetpack Compose for TV (`androidx.tv:tv-material`) **অথবা** Leanback/Views। সুপারিশ: Compose TV; পুরনো ডিভাইসে সমস্যা হলে Views fallback |
| Player | AndroidX Media3 (ExoPlayer, HLS, DataSource OkHttp) |
| Async | Kotlin Coroutines + Flow |
| DI | Hilt (বা হালকা manual DI) |
| Local DB | Room (channels, groups, health, logs, sessions) |
| Settings | Jetpack DataStore (Preferences) |
| Secrets | `EncryptedSharedPreferences` / Android Keystore (bot token, PIN hash, playlist auth) |
| Network | OkHttp + Moshi/kotlinx.serialization |
| Images | Coil (logo cache, bounded) |
| Background | WorkManager (deferrable) + Foreground service (ঐচ্ছিক, user-enabled) |
| Cloud | Firebase BoM: Auth, Firestore (+ ঐচ্ছিক Crashlytics, Remote Config) |
| Telegram | Direct HTTPS to `api.telegram.org` via OkHttp (কোনো তৃতীয় SDK নয়) |

## 2. Module/Package Structure (`com.sttv.iptv`)
```
app/
 ├─ StTvApp.kt                    (Application, DI init)
 ├─ MainActivity.kt               (single activity, key events)
 ├─ ui/
 │   ├─ player/    PlayerScreen, ChannelBanner, InfoBar, PlayerViewModel
 │   ├─ channels/  ChannelPanel, SearchField, GroupTabs
 │   ├─ setup/     SetupScreen, UrlInput, FilePicker
 │   ├─ settings/  SettingsScreen, TelegramSettings, TelegramCommands, FirebaseSettings
 │   ├─ health/    HealthDashboard
 │   └─ theme/     Colors, Typography, Dimens
 ├─ player/        PlayerManager (single ExoPlayer), RecoveryPolicy, ErrorClassifier, StreamStats
 ├─ playlist/      M3uParser, PlaylistRepository, PlaylistImporter, DuplicateDetector
 ├─ epg/           XmltvParser, EpgRepository
 ├─ health/        HealthScanner, HlsProbe, HealthRepository, ScanScheduler (WorkManager)
 ├─ telegram/
 │   ├─ TelegramClient.kt         (sendMessage, sendDocument, getMe, getUpdates, answerCallbackQuery, setMyCommands, deleteWebhook)
 │   ├─ TelegramNotifier.kt       (alert rules, cooldown, dedupe)
 │   ├─ TelegramCommandRouter.kt  (parse & dispatch commands)
 │   ├─ TelegramPoller.kt         (long-polling loop, offset tracking)
 │   └─ ReportBuilder.kt          (launch msg, scan report, watch-time, daily summary)
 ├─ session/       WatchSessionTracker (start/stop, per-channel durations)
 ├─ firebase/      FirebaseSync, AuthManager, CommandRelay (ঐচ্ছিক)
 ├─ data/          db (Room entities/DAOs), prefs (DataStore), secure (SecretStore)
 ├─ service/       MonitorForegroundService, BootReceiver
 ├─ util/          Redactor, Logger, Backoff, NetworkMonitor
 └─ res/           layouts/values/values-bn/drawable/mipmap/xml (banner 320x180)
```

## 3. Key Component Design
### 3.1 PlayerManager
- একটাই `ExoPlayer` instance; channel switch = `setMediaItem` + `prepare()` (recreate নয়)।
- `DefaultLoadControl` কাস্টমাইজড (buffer min/max settings থেকে); low-memory ডিভাইসে ছোট buffer।
- `Player.Listener`: `onPlayerError`, `onPlaybackStateChanged`, `onTracksChanged`, `onVideoSizeChanged`।
- Lifecycle: `onStop` → pause/release; `onStart` → restore।
### 3.2 ErrorClassifier
- Recoverable: timeout, DNS, `ERROR_CODE_IO_NETWORK_CONNECTION_*`, 5xx, behind-live-window, decoder init → retry (backoff 1s,2s,4s,8s… সর্বোচ্চ N বার)।
- Permanent: 401/403/404/410, unsupported format, malformed manifest → retry নয়, fallback channel।
- Expired URL: 403/410 + token pattern → playlist refresh একবার ট্রিগার।
### 3.3 RecoveryPolicy
`maxRetries`, `backoffBase`, `fallbackMode` (NextChannel / SameGroup / StayAndShowError), global loop guard (সর্বোচ্চ M ব্যর্থ চ্যানেল পরপর, তারপর থামা)।
### 3.4 M3uParser
- Streaming line parser (পুরো ফাইল মেমরিতে নয়), `#EXTINF` attributes (`tvg-id`, `tvg-name`, `tvg-logo`, `group-title`, `tvg-chno`), `#EXTGRP`, `#EXTVLCOPT` (user-agent/referrer সহায়তা), UTF-8 + BOM হ্যান্ডলিং, Bangla নাম।
- Batch insert Room-এ (500 করে), Flow-এ progress।
### 3.5 HealthScanner
- `Semaphore(maxConcurrent=2..4)`, per-request timeout (5–8s), cancellable `Job`।
- Priority queue: current channel > recently failed > stale > rest।
- HLS probe: master/media playlist GET → `#EXTM3U` যাচাই → একটি segment-এর প্রথম N bytes (Range request) পরীক্ষা।
- HEAD reject হলে lightweight GET (Range: bytes=0-1023)।
- ফল: status, httpCode, responseMs, lastSuccess, lastFailure, consecutiveFailures, errorType।
- Active playback এর সময় scanner কম concurrency (বা পজ) + একই host-এ single-connection সীমা মানে।
- Status rules: Healthy (ok & < slowThreshold), Slow (ok & ≥ threshold), Unavailable (≥ N consecutive failures), Unknown (কখনো check হয়নি)।
### 3.6 Startup Scan (আপনার চাহিদা)
- অ্যাপ চালুর পর `StartupCoordinator`:
  1. Playlist load → 2. autoplay শুরু (সর্বোচ্চ অগ্রাধিকার) → 3. Telegram launch message → 4. ৫–১০ সেকেন্ড পর background full scan (low priority) → 5. শেষে `ReportBuilder.scanSummary()` Telegram-এ।
- বড় playlist-এ scan chunked ও resumable; বন্ধ হলে চেকপয়েন্ট DB-তে।
### 3.7 WatchSessionTracker
- Player `STATE_READY && playWhenReady` হলে timer চলে; pause/stop/buffer দীর্ঘ হলে থামে।
- Session = `{start, end, channelId, seconds}` Room-এ; অ্যাপ বন্ধ/`onStop`/standby-এ session close + Telegram summary (ঐচ্ছিক)।
- Daily aggregate (মোট, per-channel top 5)।

## 4. Telegram Architecture
### 4.1 Outbound (Notifier)
- `sendMessage` JSON body (`chat_id`, `text`, `parse_mode=HTML`, `disable_web_page_preview`)। HTML escape বাধ্যতামূলক (চ্যানেল নামে `<`,`&`)।
- 429: `retry_after` মেনে suspend; অন্য error লগ (token redacted)।
- Dedupe: key = `channelId+status`; state machine: `OK → FAILING(n) → ALERTED → RECOVERED`; একই ব্যর্থতায় cooldown পর্যন্ত পুনরায় নয়; recovery একবার।
- Message queue (bounded, ১০০) + সর্বনিম্ন ব্যবধান (১ msg/sec chat-প্রতি)।
- Long text > 4096 অক্ষর → ভাগ বা `sendDocument` (.txt)।
### 4.2 Inbound (Commands)
**Mode A — Long Polling (ডিফল্ট):** `TelegramPoller` `getUpdates?timeout=25&offset=…&allowed_updates=["message","callback_query"]`। শুরুতে `deleteWebhook` (409 conflict এড়াতে)। শুধু app চালু ও নেটওয়ার্ক থাকলে। ForegroundService অপশনাল চালু থাকলে standby-তেও (ডিভাইস অনুযায়ী)।
**Mode B — Firebase Relay (ঐচ্ছিক, উন্নত):** Cloud Function (Firebase Blaze প্ল্যান লাগতে পারে) Telegram webhook গ্রহণ করে `commands` Firestore collection-এ লেখে; TV অ্যাপ Firestore listener দিয়ে কমান্ড নেয়। সুবিধা: Telegram token ডিভাইস ও function-এ আলাদা; দুর্বলতা: খরচ/জটিলতা। **v1 এ Mode A বাধ্যতামূলক, Mode B ঐচ্ছিক ভবিষ্যৎ।**
- Webhook ও getUpdates একসাথে চলে না — একটি মোড সক্রিয়।
**Router:** `/cmd args` parse → authorize (chat whitelist, PIN যদি দরকার) → UI thread-safe action (`PlayerViewModel` কমান্ড চ্যানেল) → ফলাফল reply।
Inline keyboard: `callback_data` ≤ 64 bytes (যেমন `ch:123`, `pg:2:grp5`)।
### 4.3 Chat ID Auto-detect
Connect সময় `getUpdates` থেকে সর্বশেষ `/start` প্রেরক chat id প্রস্তাব → user confirm।

## 5. Firebase Architecture (AI Studio / Gmail-লিংকড)
- Firebase project সেই Google অ্যাকাউন্টের যা AI Studio-তে ব্যবহৃত। `google-services.json` সেই project থেকে নামিয়ে `app/` এ রাখতে হবে (**এটি repo/public-এ পুশ করবেন না**)।
- Auth: Anonymous Auth (ডিফল্ট), ঐচ্ছিক Google Sign-In।
- Firestore offline persistence চালু; সীমিত লেখা (batch, throttle) যাতে quota বাঁচে।
- কী সিঙ্ক হবে: non-sensitive settings, favorites, hidden channels, watch sessions summary, health summary। **Bot token ও playlist URL (auth সহ) ডিফল্টে সিঙ্ক নয়**; user স্পষ্ট opt-in করলে encrypted ফিল্ডে।
- Security Rules: `request.auth.uid == userId` (04 ফাইল দেখুন)।
- **AI Studio নোট:** AI Studio সরাসরি নেটিভ APK বানায় না; সম্পূর্ণ Android Studio প্রজেক্ট সোর্স দেবে — build নির্দেশনা 05/06 ফাইলে।

## 6. Background Execution
- WorkManager periodic (সর্বনিম্ন ১৫ মিনিট) health scan।
- ForegroundService (`foregroundServiceType="dataSync"` বা উপযুক্ত) শুধু user "Continuous monitoring" চালু করলে; স্থায়ী notification।
- Doze/App Standby: নিশ্চয়তা নেই — UI-তে স্পষ্ট ব্যাখ্যা।
- `BootReceiver` (ঐচ্ছিক auto-start): কিছু TV box-এ কাজ করে; ওএস-সীমাবদ্ধ হতে পারে।

## 7. Permissions (ন্যূনতম)
`INTERNET`, `ACCESS_NETWORK_STATE`, `RECEIVE_BOOT_COMPLETED` (ঐচ্ছিক), `FOREGROUND_SERVICE` (+type), `POST_NOTIFICATIONS` (API 33+, শুধু service notification), `WAKE_LOCK` (ঐচ্ছিক)। Storage permission নেই — SAF ব্যবহার। Manifest: `android.software.leanback` required=false? → TV-only ডিস্ট্রিবিউশনে `required=true`; `touchscreen required=false`; LEANBACK_LAUNCHER intent filter; banner।

## 8. Performance Rules
- বড় playlist: Paging/lazy, `Room` index (`name`, `groupId`, `number`), FTS ঐচ্ছিক।
- Search: IO dispatcher, debounce, `LIKE` বা FTS4।
- Coil memory cache সীমা (≈ 15% heap), logo size ছোট করে।
- কোনো unbounded list/queue নয়; log rotation (সর্বোচ্চ ~2MB)।
- R8/ProGuard release-এ; Media3/Firebase keep rules।

## 9. Logging & Redaction
`Redactor`: URL query token, `user:pass@`, bot token regex `\d{6,}:[A-Za-z0-9_-]{30,}`, Authorization header মাস্ক। Export-এ আবার redaction।

## 10. Known Constraints (সততার তালিকা)
- কিছু সার্ভার HEAD নেয় না; কিছু একক সংযোগ সীমা রাখে।
- Short-lived token URL স্ক্যান ও প্লে-তে ভিন্ন ফল দিতে পারে।
- Telegram কমান্ড অ্যাপ বন্ধ থাকলে কাজ করবে না (Mode A)।
- `/screenshot` সব ডিভাইস/ফরম্যাটে কাজ নাও করতে পারে।
