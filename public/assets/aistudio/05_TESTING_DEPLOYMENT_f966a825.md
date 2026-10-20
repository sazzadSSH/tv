# 05 — TESTING_DEPLOYMENT.md
## টেস্টিং, বাগ ফিক্স ও রিলিজ

> **নিয়ম:** যে টেস্ট সত্যিই চালানো হয়নি তা "Pass" লেখা যাবে না। নিচের টেবিলে Status শুরুতে সব **Not run**।

## 1. Test Strategy
- **Unit (JUnit + MockK + Turbine):** M3uParser, ErrorClassifier, RecoveryPolicy, Backoff, Redactor, Notifier dedupe state machine, CommandRouter parsing/authorization, ReportBuilder, WatchSessionTracker।
- **Integration (MockWebServer):** HealthScanner (200/403/503/timeout/HEAD 405/slow), Telegram client (200/400/401/403/409/429), playlist download (401/timeout/malformed)।
- **Instrumented (Room in-memory, Compose/UI test):** import flow, search, favorites, D-pad focus।
- **Manual on TX9 Pro:** নিচের চেকলিস্ট।

## 2. Test Matrix
| ID | Test | প্রত্যাশিত ফল | Status |
|---|---|---|---|
| T01 | M3U URL import (valid) | চ্যানেল সংখ্যা সঠিক, progress দেখায় | Not run |
| T02 | Invalid URL / 404 / 401 / timeout | পরিষ্কার error + retry | Not run |
| T03 | Local file import (USB) | পার্স, URI persist, রিস্টার্টে কাজ | Not run |
| T04 | Empty / malformed playlist | crash নেই, error বার্তা | Not run |
| T05 | বড় playlist (10k) | UI ফ্রিজ নেই, মেমরি সীমার মধ্যে | Not run |
| T06 | Bangla/Unicode নাম | সঠিক রেন্ডার ও সার্চ | Not run |
| T07 | UP/DOWN সুইচ + reverse সেটিং | সঠিক দিক | Not run |
| T08 | LEFT panel / RIGHT settings / BACK | সঠিক আচরণ, exit confirm | Not run |
| T09 | Search on-TV keyboard | live filter, empty state, play | Not run |
| T10 | Startup channel-1 + fallback | ব্যর্থ হলে পরেরটি, loop নেই | Not run |
| T11 | Network বিচ্ছিন্ন → ফেরত | backoff, auto recover | Not run |
| T12 | 401/403/410 stream | permanent, retry নয় | Not run |
| T13 | HD/FHD playback | সোর্স/ডিকোডার সমর্থনে | Not run |
| T14 | Health scan limits | concurrency ≤ সেট মান, playback অক্ষুণ্ণ | Not run |
| T15 | HEAD 405 → GET fallback | status সঠিক | Not run |
| T16 | Telegram Connect (valid) | Connected ✅ + test msg | Not run |
| T17 | Telegram invalid token/chat | স্পষ্ট ত্রুটি, নেটওয়ার্ক loop নেই | Not run |
| T18 | Launch message | অ্যাপ খোলায় ১টি মেসেজ | Not run |
| T19 | Startup scan report | সারাংশ সঠিক, শুধু প্রাপ্য তথ্য | Not run |
| T20 | Watch-time report | সময় ±৫ সেকেন্ড সঠিক; pause-এ থামে | Not run |
| T21 | Duplicate alert suppression | cooldown-এ পুনরায় নয় | Not run |
| T22 | Recovery alert | একবারই | Not run |
| T23 | Telegram 429 | retry_after মানা | Not run |
| T24 | `/channel`, `/next`, `/prev` | TV-তে চ্যানেল বদলায় | Not run |
| T25 | `/search`, `/list` pagination | inline buttons সঠিক | Not run |
| T26 | অননুমোদিত chat থেকে কমান্ড | উপেক্ষা + লগ | Not run |
| T27 | `/scan`, `/report`, `/watchtime` | সঠিক রিপোর্ট | Not run |
| T28 | Webhook বনাম polling 409 | deleteWebhook পরে চলে | Not run |
| T29 | Firebase Auth + sync | favorites/settings সিঙ্ক | Not run |
| T30 | Offline Firestore | পরে সিঙ্ক | Not run |
| T31 | Security rules | অন্য uid পড়তে পারে না | Not run |
| T32 | অ্যাপ রিস্টার্ট | setup পুনরায় চায় না | Not run |
| T33 | Player release on stop | লিক নেই | Not run |
| T34 | Log/export redaction | token/URL credential নেই | Not run |
| T35 | বিভিন্ন রেজোলিউশন 720p/1080p/4K UI | লেআউট ঠিক | Not run |
| T36 | বিভিন্ন রিমোট (key নেই) | বিকল্প পথ আছে | Not run |
| T37 | Standby/Doze + কমান্ড | সীমাবদ্ধতা নথিভুক্ত | Not run |
| T38 | ২৪ ঘণ্টা soak | মেমরি স্থিতিশীল | Not run |

## 3. TX9 Pro Hardware Checklist
- [ ] Developer options + USB debugging চালু
- [ ] ইনস্টল সফল; লঞ্চারে StTV banner দেখায়
- [ ] প্রথম setup, URL ও USB ফাইল দুটোই
- [ ] 720p/1080p স্ট্রিম, আপনার সোর্স অনুযায়ী
- [ ] রিমোটের প্রতিটি key (UP/DOWN/LEFT/RIGHT/OK/BACK/MENU/0–9)
- [ ] Telegram launch msg, scan report, watch report
- [ ] Telegram কমান্ড একে একে
- [ ] Wi-Fi বন্ধ/চালু রিকভারি
- [ ] রিবুট পর আচরণ
- [ ] RAM/CPU পর্যবেক্ষণ (`adb shell dumpsys meminfo com.sttv.iptv`)

## 4. Bug Triage
| Severity | সংজ্ঞা | লক্ষ্য |
|---|---|---|
| S1 | ক্র্যাশ/প্লেব্যাক অচল/ডেটা হারানো | অবিলম্বে |
| S2 | প্রধান ফিচার ভাঙা (Telegram, search) | রিলিজের আগে |
| S3 | UI/ছোট ত্রুটি | পরবর্তী রিলিজ |
Bug রিপোর্ট টেমপ্লেট: ধাপ, প্রত্যাশিত, প্রকৃত, redacted log, ডিভাইস/ফার্মওয়্যার, স্ট্রিম ফরম্যাট।
Debug টুল: `adb logcat | grep StTV`, Android Studio Profiler, LeakCanary (debug), StrictMode (debug)।

## 5. Build Commands
```bash
# প্রজেক্ট রুটে
chmod +x gradlew
./gradlew clean
./gradlew assembleDebug
# আউটপুট: app/build/outputs/apk/debug/app-debug.apk

# Unit tests
./gradlew testDebugUnitTest
# Instrumented (ডিভাইস সংযুক্ত)
./gradlew connectedDebugAndroidTest
# Lint
./gradlew lintDebug
```
### Release signing
```bash
keytool -genkeypair -v -keystore sttv-release.jks -alias sttv -keyalg RSA -keysize 2048 -validity 10000
```
`keystore.properties` (git-ignore করুন):
```
storeFile=../sttv-release.jks
storePassword=****
keyAlias=sttv
keyPassword=****
```
`app/build.gradle.kts`-এ `signingConfigs.release` পড়বে ওই ফাইল; `minifyEnabled=true`, `shrinkResources=true`।
```bash
./gradlew assembleRelease
# app/build/outputs/apk/release/app-release.apk
# বিকল্প (apksigner যাচাই)
$ANDROID_HOME/build-tools/<ver>/apksigner verify --verbose app-release.apk
```
**Keystore ও পাসওয়ার্ড হারাবেন না; কখনো git-এ নয়।**

## 6. Install on TX9 Pro
**ADB (Wi-Fi):**
```bash
# TV: Settings → About → Build number ৭ বার ট্যাপ → Developer options → USB debugging চালু
adb connect <TV_IP>:5555
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.sttv.iptv -c android.intent.category.LEANBACK_LAUNCHER 1
```
**USB pendrive:** APK পেনড্রাইভে → TV-তে ফাইল ম্যানেজার (যেমন "File Commander"/Files by Google) → APK খুলুন → "Unknown sources" অনুমতি → Install।
**Uninstall:** `adb uninstall com.sttv.iptv`

## 7. Release Checklist
- [ ] versionCode/versionName বাড়ানো
- [ ] T01–T38 ফলাফল রেকর্ড (সত্যিকারের)
- [ ] Release APK স্বাক্ষরিত ও যাচাইকৃত
- [ ] কোনো hardcoded token/URL নেই (`grep -R "bot[0-9]"`)
- [ ] google-services.json public repo-তে নেই
- [ ] Firestore rules প্রকাশিত
- [ ] Privacy নোট: কী ডেটা Firebase/Telegram-এ যায়
- [ ] CHANGELOG ও README হালনাগাদ

## 8. Maintenance
- Dependency আপডেট মাসিক (Media3, Firebase BoM)।
- Playlist/URL ফরম্যাট regression টেস্ট ফাইল রাখুন (`/testdata/*.m3u`)।
- ব্যবহারকারী ফিডব্যাক → Telegram `/log` রিপোর্ট দিয়ে ডিবাগ।
