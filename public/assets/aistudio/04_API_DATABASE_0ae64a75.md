# 04 — API_DATABASE.md
## API, ডেটাবেস ও অথেনটিকেশন

## 1. Room Database (লোকাল) — `sttv.db`
```kotlin
@Entity(indices=[Index("playlistId"),Index("name"),Index("groupName"),Index("number")])
data class ChannelEntity(
  @PrimaryKey val id: String,          // hash(playlistId + url + tvgId)
  val playlistId: Long, val number: Int, val name: String,
  val url: String,                     // লগে কখনো নয়
  val groupName: String?, val logoUrl: String?, val tvgId: String?,
  val userAgent: String?, val referrer: String?,
  val isFavorite: Boolean=false, val isHidden: Boolean=false,
  val isDuplicate: Boolean=false, val sortOrder: Int)

@Entity data class PlaylistEntity(
  @PrimaryKey(autoGenerate=true) val id: Long=0, val type: String, // URL|FILE
  val label: String, val sourceRef: String,  // FILE: persisted URI; URL: secure store key
  val lastRefresh: Long?, val channelCount: Int, val status: String)

@Entity data class HealthEntity(
  @PrimaryKey val channelId: String, val status: String, // HEALTHY|SLOW|UNAVAILABLE|UNKNOWN
  val httpCode: Int?, val responseMs: Long?, val lastCheck: Long?,
  val lastSuccess: Long?, val lastFailure: Long?, val consecutiveFailures: Int,
  val errorType: String?, val alertState: String, val lastAlertAt: Long?)

@Entity data class WatchSessionEntity(
  @PrimaryKey(autoGenerate=true) val id: Long=0,
  val startAt: Long, val endAt: Long?, val channelId: String, val seconds: Long)

@Entity data class RecentEntity(@PrimaryKey val channelId: String, val lastPlayed: Long, val failed: Boolean, val failedAt: Long?)
@Entity data class ScanRunEntity(@PrimaryKey(autoGenerate=true) val id: Long=0, val startAt: Long, val endAt: Long?, val total: Int, val healthy: Int, val slow: Int, val down: Int, val unknown: Int)
@Entity data class LogEntity(@PrimaryKey(autoGenerate=true) val id: Long=0, val ts: Long, val level: String, val tag: String, val msg: String) // redacted
@Entity data class EpgProgramEntity(@PrimaryKey(autoGenerate=true) val id: Long=0, val tvgId: String, val start: Long, val stop: Long, val title: String, val desc: String?)
```
Retention: logs ৭ দিন/২MB, health history ৩০ দিন, sessions ৯০ দিন।

## 2. DataStore Keys (non-sensitive)
`autoplay`, `startOnChannel1`, `restoreLast`, `lastChannelId`, `fallbackMode`, `reverseUpDown`, `aspect` (FIT/FILL/ZOOM), `bufferMinMs`, `bufferMaxMs`, `maxRetries`, `backoffBaseMs`, `monitorEnabled`, `scanIntervalMin`, `maxChannelsPerScan`, `maxConcurrent`, `slowThresholdMs`, `failThreshold`, `tgEnabled`, `tgCooldownMin`, `tgMinFailures`, `tgDailySummary`, `tgDailyTime`, `tgLaunchMsg`, `tgStartupScanReport`, `tgWatchReport`, `tgCommandsEnabled`, `tgAllowedCommands` (set), `tgNightStart/End`, `language`, `textScale`, `reduceMotion`, `disableNonEssentialNet`, `firebaseSyncSettings/Favorites/History`, `crashlyticsOptIn`, `parentalEnabled`.

## 3. Secure Store (EncryptedSharedPreferences)
`tg_bot_token`, `tg_chat_ids` (JSON list), `parental_pin_hash` (PBKDF2 + salt), `playlist_url_{id}`, `playlist_auth_{id}`। লগ/export/Firestore-এ ডিফল্টে নয়।

## 4. Telegram Bot API (https://api.telegram.org/bot<TOKEN>/METHOD)
| Method | ব্যবহার | নোট |
|---|---|---|
| `getMe` | Token যাচাই | 401 = ভুল token |
| `sendMessage` | সব মেসেজ | `parse_mode=HTML`, escape, ≤4096 অক্ষর |
| `sendDocument` | বড় রিপোর্ট/লগ (.txt) | multipart |
| `getUpdates` | কমান্ড polling | `timeout=25`, `offset`, `allowed_updates` |
| `deleteWebhook` | polling-এর আগে | 409 conflict রোধ |
| `setMyCommands` | `/` মেনু | scope = chat (ঐচ্ছিক) |
| `answerCallbackQuery` | inline button সাড়া | spinner বন্ধ |
| `editMessageText` | pagination/refresh | |
| `sendChatAction` | "typing…" | ঐচ্ছিক |

**Error handling:** 400 (bad chat/format) → লগ + user-এ কারণ; 401 → credentials অবৈধ, polling বন্ধ; 403 (bot blocked) → disable ও সতর্কতা; 409 → deleteWebhook retry; 429 → `parameters.retry_after` অপেক্ষা; 5xx/timeout → backoff।

### 4.1 Message Templates
**Launch:**
```
📺 <b>StTV চালু হয়েছে</b>
Device: TX9 Pro
Time: {time}
Playlist: {count} চ্যানেল
Version: {ver}
```
**Startup scan summary:**
```
🔎 <b>Channel Scan রিপোর্ট</b>
মোট: {total} | ✅ {ok} | 🐢 {slow} | ❌ {down} | ⚪ {unk}
সময় লেগেছে: {dur}
❌ সমস্যাযুক্ত (শীর্ষ {n}):
• {name} — HTTP {code} — {reason}
```
(শুধু প্রাপ্য তথ্য; অনুপস্থিত ফিল্ড বাদ।)
**Health alert / Recovery:** README-র উদাহরণ ফরম্যাট; recovery: "✅ {name} আবার চালু (downtime {dur})"।
**Watch-time:**
```
⏱ <b>দেখার রিপোর্ট</b>
আজ: {h}ঘ {m}মি | সেশন: {sessionDur}
শীর্ষ চ্যানেল: 1) {ch1} {t1} 2) {ch2} {t2}
```
### 4.2 Command Spec (ইনপুট → আউটপুট)
- `/channel 12` → play #12 → "▶️ 12 · {name}"; না থাকলে "চ্যানেল নেই"।
- `/search news` → সর্বোচ্চ ১০টি inline button (`ch:{number}`) + "পরের পাতা" (`sr:{q}:{page}`)।
- `/list sports 2` → গ্রুপ ফিল্টার + পাতা।
- Authorization ব্যর্থ → নীরব উপেক্ষা + লগ (chat id মাস্কড)।
- Rate limit: ১০ কমান্ড/মিনিট/chat।

## 5. Firebase
### 5.1 Auth
Anonymous (ডিফল্ট) → `uid`। ঐচ্ছিক Google Sign-In লিংক (একই Gmail-এ একাধিক ডিভাইস সিঙ্ক)।
### 5.2 Firestore Schema
```
users/{uid}
  profile:   { deviceName, appVersion, lastSeen, language }
users/{uid}/settings/main            { …non-sensitive DataStore snapshot, updatedAt }
users/{uid}/favorites/{channelKey}   { name, group, addedAt }       // channelKey = stable hash
users/{uid}/sessions/{sessionId}     { startAt, endAt, seconds, channelName }
users/{uid}/daily/{yyyyMMdd}         { totalSeconds, topChannels:[{name,seconds}] }
users/{uid}/health/{channelKey}      { status, httpCode, responseMs, lastCheck, lastSuccess, consecutiveFailures }
users/{uid}/scans/{scanId}           { startAt, endAt, total, healthy, slow, down, unknown }
users/{uid}/commands/{cmdId}         { type, args, status: pending|done|error, createdAt }   // Mode B বা ফোন ড্যাশবোর্ড
users/{uid}/diagnostics/{id}         { redacted log excerpt, ts }  // opt-in
```
### 5.3 Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
(Production-এ ফিল্ড validation ও size limit যোগ করুন; commands সংগ্রহে `status` ছাড়া অন্য পরিবর্তন সীমিত।)
### 5.4 Quota রক্ষা
Writes batch + ≥৩০ সেকেন্ড throttle; health শুধু status পরিবর্তনে লেখা; sessions শেষে একবার।
### 5.5 Setup (Gmail-লিংকড Firebase)
1. AI Studio-তে ব্যবহৃত Gmail দিয়ে console.firebase.google.com লগইন → project তৈরি/নির্বাচন।
2. Android অ্যাপ যোগ: package `com.sttv.iptv` + SHA-1 (debug ও release)।
3. `google-services.json` ডাউনলোড → `app/google-services.json`।
4. Authentication → Anonymous চালু; Firestore Database তৈরি; উপরের Rules প্রকাশ।
5. (ঐচ্ছিক) Crashlytics চালু — user opt-in ছাড়া data পাঠাবে না।

## 6. M3U Format রেফারেন্স
```
#EXTM3U
#EXTINF:-1 tvg-id="x" tvg-logo="http://…/l.png" group-title="News",চ্যানেল নাম
http://example/stream.m3u8
```
Parser সহনশীল: অনুপস্থিত attribute, ডুপ্লিকেট কমা, CRLF, BOM।

## 7. XMLTV (EPG)
`<programme start="20261020180000 +0600" stop="…" channel="tvgId"><title>…</title></programme>`। Streaming SAX parse; আজ + ৩ দিন রাখা; gzip সমর্থন।

## 8. Auth & Access (অ্যাপের ভেতরে)
- Parental PIN: ৪–৬ ডিজিট, PBKDF2 hash, ৫ ভুল চেষ্টায় ৩০ সেকেন্ড লক।
- Telegram: chat id whitelist + ঐচ্ছিক PIN।
- Playlist Basic Auth: secure store; OkHttp `Authenticator`; লগ মাস্কড।
