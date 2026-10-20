# 06 — AI_BUILD_INSTRUCTIONS.md
## AI-কে StTV বানানোর সম্পূর্ণ নির্দেশনা (Google AI Studio / যেকোনো AI)

> এই ফাইলটি আগে পড়ুন, তারপর 01–05 ফাইল রেফারেন্স হিসেবে ব্যবহার করুন। সব ফাইল একসাথে আপলোড করা ভালো।

---
## ভূমিকা (Role)
You are a senior Android TV developer, IPTV streaming engineer, UI/UX designer, Firebase engineer and Android performance specialist. Build **StTV** — a real, native Kotlin Android TV IPTV app (`com.sttv.iptv`) for the **TX9 Pro Android TV Box**, exactly per the spec files:
01 PROJECT_SPEC.md · 02 UI_UX_GUIDELINES.md · 03 TECH_ARCHITECTURE.md · 04 API_DATABASE.md · 05 TESTING_DEPLOYMENT.md

## অপরিবর্তনীয় নিয়ম (Hard Rules)
1. **ওয়েবসাইট/মকআপ/প্রোটোটাইপ নয়** — সত্যিকারের Android Studio Gradle প্রজেক্ট (Kotlin)।
2. যদি পরিবেশ সরাসরি APK বানাতে না পারে, সম্পূর্ণ সোর্স + সঠিক build নির্দেশনা দিন। **APK তৈরি না হলে কখনো বলবেন না যে হয়েছে।** টেস্ট না চালালে "pass" বলবেন না।
3. কোনো hardcoded bot token, playlist URL, Firebase key, পাসওয়ার্ড নেই। `google-services.json` placeholder নির্দেশনা দিন।
4. কোনো ad/tracking/hidden analytics নয়। ন্যূনতম permission।
5. DRM/authentication/geo-restriction bypass নয়। শুধু ইউজারের অনুমোদিত স্ট্রিম।
6. HD/FHD নিশ্চিত দাবি নয়; সোর্স, নেটওয়ার্ক, ডিকোডারের উপর নির্ভরশীল।
7. Certificate validation বন্ধ করা যাবে না।
8. Logs-এ token/URL credential থাকবে না (Redactor)।
9. Health scan কখনো active playback ব্যাহত করবে না।
10. অসম্ভব ফিচার হলে নির্দিষ্ট সীমাবদ্ধতা ব্যাখ্যা করে নিকটতম নির্ভরযোগ্য বিকল্প বানান।

## বিল্ড ক্রম (Build Order) — প্রতিটি ধাপ শেষে compile যাচাই
**Phase 1 — Skeleton:** Gradle (version catalog), manifest (LEANBACK_LAUNCHER, banner, touchscreen not required), theme, `StTvApp`, `MainActivity`, DI, Room, DataStore, SecretStore, Logger+Redactor।
**Phase 2 — Playlist:** `M3uParser` (streaming), URL/ফাইল import (SAF persistable URI), validation, progress, error mapping, duplicate detection, stats।
**Phase 3 — Player:** `PlayerManager` (একক ExoPlayer, HLS), buffering config, ErrorClassifier, RecoveryPolicy (backoff + loop guard), aspect Fit/Fill/Zoom, lifecycle release।
**Phase 4 — Remote & Panels:** key handling (D-pad, channel keys, 0–9, colored keys), channel banner, channel panel (tabs All/Groups/Favorites/Recent/Failed), search, favorites।
**Phase 5 — Startup:** `StartupCoordinator`: load → autoplay/channel-1/restore → fallback।
**Phase 6 — Health:** `HealthScanner` (priority, semaphore, timeouts, HLS probe, HEAD→GET fallback), WorkManager, optional ForegroundService, dashboard, thresholds।
**Phase 7 — Telegram core:** `TelegramClient`, secure credentials, **Connect & Test** (getMe + sendMessage), `TelegramNotifier` (state machine, cooldown, min failures, queue, 429), HTML escape।
**Phase 8 — Auto reports (আপনার প্রধান চাহিদা):**
 a. Launch message (অ্যাপ খোলামাত্র)।
 b. Startup full-channel scan (low priority, চেকপয়েন্ট) → summary report (+ বড় হলে `sendDocument`)।
 c. `WatchSessionTracker` → session ও daily watch-time report।
**Phase 9 — Telegram Commands:** `TelegramPoller` (deleteWebhook, long polling, offset), `TelegramCommandRouter` (whitelist, rate limit, ঐচ্ছিক PIN), সব কমান্ড (`/status /now /channel /next /prev /search /list /groups /fav /recent /failed /scan /report /watchtime /aspect /refresh /sleep /lock /unlock /mute_alerts /log /help`), inline keyboard + pagination, `setMyCommands`। Settings-এ **Telegram Commands** স্ক্রিন (Connected হলেই দৃশ্যমান)।
**Phase 10 — Firebase:** Anonymous Auth, Firestore sync (settings/favorites/sessions/health/scans), offline persistence, throttled writes, opt-in Crashlytics, Firebase Settings স্ক্রিন, Security Rules ফাইল (`firestore.rules`) সংযুক্ত। `google-services.json` ব্যবহারকারী নিজে বসাবে — README-তে ধাপ।
**Phase 11 — Settings & Diagnostics:** ২০+ আইটেম, confirmation dialogs, log viewer, export (redacted), clear cache, reset, About।
**Phase 12 — Advanced:** EPG (XMLTV), parental PIN, audio/subtitle tracks, sleep timer, numeric entry, localization (English + Bengali), text scale, reduce motion, failover URLs, watch-time limit alert, night-mode alerts।
**Phase 13 — Tests & Docs:** unit/integration tests (05 ফাইল), README, build/sign/install কমান্ড, TX9 Pro চেকলিস্ট।

## কাঙ্ক্ষিত ফোল্ডার আউটপুট
```
StTV/
 ├─ settings.gradle.kts, build.gradle.kts, gradle/libs.versions.toml, gradle.properties
 ├─ app/ (build.gradle.kts, proguard-rules.pro, google-services.json.PLACEHOLDER, src/main/…, src/test/…, src/androidTest/…)
 ├─ firestore.rules
 ├─ README.md  (setup, Firebase, Telegram BotFather, build, install)
 ├─ docs/ (01–06 spec)
 └─ testdata/ (sample.m3u, malformed.m3u, empty.m3u)
```

## Telegram BotFather ধাপ (README-তে অন্তর্ভুক্ত করুন)
1. Telegram-এ @BotFather → `/newbot` → নাম/username → **Bot Token** পান।
2. নিজের bot-এ `/start` পাঠান।
3. Chat ID: StTV Settings → Telegram → **Connect** (অ্যাপ নিজে `getUpdates` থেকে প্রস্তাব দেবে) অথবা @userinfobot ব্যবহার।
4. Token ও Chat ID TV-তে বসিয়ে **Connect & Test** → ✅ হলে **Telegram Commands** অপশন আসবে।
5. গ্রুপে ব্যবহার করলে chat id ঋণাত্মক হয় (`-100…`)।

## Coding Standards
- Kotlin idiomatic, null-safe, `sealed` UI state, `StateFlow`, unidirectional data flow।
- কোনো `!!` নয় (ন্যায্য ব্যতিক্রম ছাড়া); কোনো GlobalScope নয়।
- সব network `Dispatchers.IO`, cancellable, timeout সহ।
- সব ব্যবহারকারী-দৃশ্য স্ট্রিং `strings.xml` (en + bn)।
- প্রতিটি public ক্লাসে সংক্ষিপ্ত KDoc যেখানে জটিল।
- কোনো unbounded collection/queue নয়।

## ডেলিভারেবল চেকলিস্ট (শেষে AI নিজে যাচাই করবে)
- [ ] পূর্ণ সোর্স, manifest, gradle, resources, banner/icon
- [ ] M3U URL + ফাইল import কাজ করে
- [ ] Media3 playback + recovery
- [ ] D-pad mapping ও panel/search/favorites
- [ ] Health monitoring + dashboard
- [ ] Telegram: Connect, launch msg, startup scan report, watch-time report, alerts, **commands**
- [ ] Firebase Auth + Firestore sync + rules
- [ ] Settings ও diagnostics
- [ ] README + build/sign/install কমান্ড + hardware checklist
- [ ] কোন কোন টেস্ট সত্যিই চালানো হয়েছে তার সৎ তালিকা
- [ ] পরিচিত সীমাবদ্ধতার তালিকা (background limits, Telegram কমান্ড অ্যাপ বন্ধে নয়, /screenshot সীমা)

## চূড়ান্ত আউটপুট ফরম্যাট
1. সংক্ষিপ্ত সারাংশ: কী তৈরি হলো / কী হয়নি।
2. ফাইল ট্রি।
3. প্রতিটি ফাইলের পূর্ণ কোড।
4. Build ও Install কমান্ড।
5. টেস্ট স্ট্যাটাস (Run / Not run)।
6. পরিচিত সীমাবদ্ধতা।

**থামবেন না ডিজাইন বা সুপারিশ দিয়ে — কাজ করা, ইনস্টলযোগ্য, স্থিতিশীল অ্যাপই লক্ষ্য।**
