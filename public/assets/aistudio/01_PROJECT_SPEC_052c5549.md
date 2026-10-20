# 01 — PROJECT_SPEC.md
## StTV — Android TV IPTV Application (অ্যাপের সম্পূর্ণ ধারণা ও ফিচার)

**App Name:** StTV  **Package:** `com.sttv.iptv`  **Target Device:** TX9 Pro Android TV Box
**Platform:** Native Android (Kotlin) + AndroidX Media3 ExoPlayer  **Backend:** Firebase (Auth, Firestore, Cloud Messaging optional) + Telegram Bot API

---
## 1. ধারণা (Vision)
StTV হলো একটি পরিষ্কার, minimal, full-screen IPTV অ্যাপ যা traditional TV-র মতো চ্যানেল সুইচ করার অনুভূতি দেয়। কোনো ad, banner, tracking নেই। User নিজের authorized M3U/M3U8 playlist ব্যবহার করবে। অ্যাপ নিজে কোনো playlist বা paid credential embed করবে না।

## 2. Target User
- TX9 Pro বা অন্য Android TV Box ব্যবহারকারী, যিনি রিমোট দিয়ে চালাবেন।
- Bangla ও English দুই ভাষার ইউজার।
- যিনি দূর থেকে (ফোনের Telegram দিয়ে) টিভির অবস্থা দেখতে ও নিয়ন্ত্রণ করতে চান।

## 3. Core Features (Must Have)
| # | Feature | বিবরণ |
|---|---|---|
| 1 | M3U URL import | URL দিয়ে playlist add, validate, progress, error handling |
| 2 | M3U file import | Document picker (USB সহ), persistent URI permission |
| 3 | Live playback | Media3 ExoPlayer, HLS + HTTP streams, full-screen |
| 4 | Remote control | UP/DOWN চ্যানেল, LEFT list, RIGHT settings, OK info, BACK close |
| 5 | Channel list | Side panel, number/name/logo, groups, favorites |
| 6 | Search | নাম দিয়ে live filter, হাজার চ্যানেলেও smooth |
| 7 | Groups/Favorites/Recent | All, Groups, Favorites, Recently Watched, Recently Failed |
| 8 | Startup behavior | Autoplay, channel-1 mode, last-channel restore, fallback policy |
| 9 | Playback recovery | Exponential backoff, max retry, recoverable vs permanent error |
| 10 | Health monitoring | Background scan, dashboard: Healthy/Slow/Unavailable/Unknown |
| 11 | Telegram alerts | Health alerts, cooldown, consecutive-failure threshold |
| 12 | Settings | ২০টি আইটেম (নিচে Section 6) |

## 4. Telegram Integration (নতুন ও উন্নত)
### 4.1 TV Settings → "Telegram Link"
- Fields: **Bot Token**, **Chat ID**, Enable toggle, **Connect** বাটন।
- Connect চাপলে অ্যাপ `getMe` দিয়ে token verify করে, তারপর `sendMessage` দিয়ে test message পাঠায়। সফল হলে status = **Connected ✅** এবং নিচে নতুন অপশন **"Telegram Commands"** দেখা যায়।
- Chat ID auto-detect সহায়তা: user বটকে `/start` দিলে অ্যাপ `getUpdates` থেকে chat id খুঁজে confirm করতে বলবে (user confirm করলে সেভ)।
- Credentials কখনো hardcode বা log হবে না; `EncryptedSharedPreferences` (Android Keystore) এ থাকবে। Clear বাটন থাকবে।

### 4.2 অটো মেসেজ ও রিপোর্ট (আপনার চাওয়া ৩টি)
1. **App Launch Message:** অ্যাপ চালু হলেই Telegram-এ একটি মেসেজ: "📺 StTV চালু হয়েছে — Device: TX9 Pro, Time, Playlist: N channels, Version"।
2. **Startup Full Channel Scan Report:** চালু হওয়ার সাথে সাথে সব চ্যানেল স্ক্যান শুরু (user যে চ্যানেলই দেখুক, playback অগ্রাধিকার পাবে)। শেষে সারাংশ রিপোর্ট: মোট / Healthy / Slow / Unavailable / Unknown এবং সমস্যাযুক্ত চ্যানেলের তালিকা (নাম, HTTP status, কারণ)। বড় তালিকা হলে একাধিক মেসেজে বা `.txt` document হিসেবে (`sendDocument`) পাঠানো হবে।
3. **Watch-Time Report:** কতক্ষণ টিভি দেখা হয়েছে — session শেষে (অ্যাপ বন্ধ/standby) একটি session summary, এবং ঐচ্ছিক daily summary: মোট সময়, কোন চ্যানেল কতক্ষণ, top ৫ চ্যানেল।

> **সততার নোট:** "সব চ্যানেল স্ক্যান" মানে lightweight HTTP/HLS manifest ও segment test — পূর্ণ ভিডিও চালানো নয়। HTTP 200 মানেই playable নিশ্চিত নয়।

### 4.3 Telegram Remote Commands
Link হওয়ার পর Settings-এ **Commands** অপশন কমান্ড তালিকা দেখাবে। Bot-এ `/` চাপলে menu দেখাতে `setMyCommands` ব্যবহার হবে।

| Command | কাজ |
|---|---|
| `/start`, `/help` | কমান্ড তালিকা |
| `/status` | এখন কী চলছে, uptime, network, বর্তমান চ্যানেল |
| `/now` | বর্তমান চ্যানেল + EPG (থাকলে) |
| `/channel <number>` | নম্বর দিয়ে চ্যানেল পরিবর্তন |
| `/next`, `/prev` | পরের/আগের চ্যানেল |
| `/search <নাম>` | চ্যানেল সার্চ, ফল inline button হিসেবে; ট্যাপ করলে play |
| `/list [group] [page]` | চ্যানেল তালিকা (pagination সহ inline buttons) |
| `/groups` | গ্রুপ তালিকা |
| `/fav`, `/addfav`, `/rmfav` | ফেভারিট দেখা/যোগ/বাদ |
| `/recent` | সাম্প্রতিক দেখা চ্যানেল |
| `/failed` | সাম্প্রতিক ব্যর্থ চ্যানেল |
| `/scan` | এখনই health scan শুরু |
| `/report` | সর্বশেষ health রিপোর্ট |
| `/watchtime` | আজকের/সাপ্তাহিক দেখার সময় |
| `/volume <0-100>`, `/mute` | ভলিউম (সিস্টেম/প্লেয়ার volume যতটা সম্ভব) |
| `/aspect fit\|fill\|zoom` | aspect ratio |
| `/refresh` | playlist refresh |
| `/screenshot` | (ঐচ্ছিক) বর্তমান ফ্রেমের স্ক্রিনশট — DRM/secure surface-এ কাজ নাও করতে পারে |
| `/sleep <minutes>` | sleep timer |
| `/lock`, `/unlock` | parental lock |
| `/mute_alerts <minutes>` | সাময়িক alert বন্ধ |
| `/log` | diagnostic log (redacted) ফাইল |
| `/exit` | প্লেয়ার বন্ধ (অ্যাপ standby-এ) |

**Security:** শুধু whitelisted Chat ID থেকে কমান্ড গ্রহণ। অন্য chat থেকে এলে উপেক্ষা + log। ঐচ্ছিক `/pin` verification বিপজ্জনক কমান্ডের (reset, exit) জন্য। Rate-limit প্রযোজ্য।

**Limitation:** কমান্ড পেতে অ্যাপকে `getUpdates` long-polling চালাতে হয়। অ্যাপ বন্ধ/ডিভাইস deep sleep-এ থাকলে কমান্ড কাজ করবে না। (বিস্তারিত 03_TECH_ARCHITECTURE.md)

## 5. Firebase Integration
- অ্যাপ সেই **Gmail-এর Firebase project**-এর সাথে যুক্ত থাকবে যে Gmail দিয়ে Google AI Studio-তে অ্যাপ বানানো হচ্ছে।
- ব্যবহার: Firebase Auth (Anonymous বা Google), Cloud Firestore (settings backup, favorites, watch sessions, channel health history, command queue), ঐচ্ছিক Remote Config ও Crashlytics (user opt-in সাপেক্ষে)।
- Analytics/ad SDK নেই। Crashlytics শুধু user সম্মতি দিলে।
- বিস্তারিত schema: 04_API_DATABASE.md

## 6. Settings (২০ আইটেম + নতুন)
Playlist management, Add URL, Import file, Refresh, Startup channel, Start on channel 1, Restore last, Autoplay, Switching prefs (UP/DOWN reverse), Aspect ratio, Buffering, Recovery, Health monitoring toggle, Interval & limits, Telegram config, Test Telegram, **Telegram Commands**, **Firebase Sync**, Diagnostic log, Clear cache, Reset, About। (+ Language, Text size, Parental PIN, Export settings, Disable nonessential network)

## 7. অতিরিক্ত উন্নত ফিচার (Advanced Ideas)
**Telegram-ভিত্তিক:** inline keyboard remote (⬆️⬇️ channel buttons), scheduled report (সকাল ৮টা), পরিবারের একাধিক chat ID (admin/viewer role), channel recovered/failed instant alert, weekly digest, bandwidth/buffering stats report, "night mode" — নির্দিষ্ট সময়ে alert বন্ধ।
**Playback:** Picture-in-channel preview, quick-switch (শেষ দুই চ্যানেলে 0/BACK টগল), numeric channel entry (রিমোটের 0-9), sleep timer, audio/subtitle track selection, auto-frame-rate matching (সমর্থিত হলে), stream quality (ABR) cap, failover URL group (একই চ্যানেলের একাধিক সোর্স)।
**Data:** XMLTV EPG, reminders (প্রোগ্রাম শুরুর আগে Telegram/অন-স্ক্রিন), duplicate detection, channel rename/hide/reorder, favorites sync via Firebase, M3U auto-refresh schedule।
**Safety:** Parental control PIN, kids-safe group lock, watch-time limit (দৈনিক সীমা পেরোলে Telegram alert + অপশনাল auto-stop)।
**Diagnostics:** speed test, startup-time stats, error history export, health trend chart (৭ দিন)।
**Device:** auto-start on boot (Android TV সমর্থিত হলে `RECEIVE_BOOT_COMPLETED`), HDMI-CEC wake সহায়তা (সীমিত)।

## 8. Out of Scope / সীমাবদ্ধতা
- DRM/geo-restriction/authentication bypass নয়।
- Embedded playlist/credential নয়।
- Android background limits-এর কারণে continuous monitoring গ্যারান্টি নয়।
- RTSP/MPEG-TS শুধু Media3 সমর্থন অনুযায়ী।

## 9. Success Criteria
- Cold start < ৩ সেকেন্ডে UI (playlist cached), autoplay দ্রুত।
- ৫,০০০+ চ্যানেলে search lag নেই।
- Telegram launch message ও scan report কাজ করে; কমান্ড whitelisted chat থেকে সঠিক সাড়া দেয়।
- Playback কখনো health check দ্বারা বিঘ্নিত হয় না।
