# StTV — Native Android TV IPTV Application

**Target Device:** TX9 Pro Android TV Box / Amlogic & Allwinner Android TV 9/10/11+  
**Package:** `com.sttv.iptv`  
**Platform:** Native Android (Kotlin 1.9, Jetpack Compose for TV, AndroidX Media3 ExoPlayer)  
**Backend:** Firebase Firestore (Sync & Backup) + Telegram Bot API (Direct HTTPS)

---

## 🛠️ Quick Build Commands

```bash
# Make gradlew executable
chmod +x gradlew

# Build Debug APK
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk

# Build Release APK
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk

# Run Unit Tests
./gradlew testDebugUnitTest
```

---

## 📺 Install on TX9 Pro via ADB (Wi-Fi)

1. On TX9 Pro: Go to **Settings → About → Build Number** (tap 7 times to enable Developer Options).
2. Enable **USB Debugging** & connect to Wi-Fi.
3. On your computer:
```bash
adb connect <TV_IP_ADDRESS>:5555
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.sttv.iptv -c android.intent.category.LEANBACK_LAUNCHER 1
```

---

## 🤖 Telegram Remote Control Setup

1. Message **@BotFather** on Telegram and create a new bot with `/newbot`.
2. Copy your **HTTP API Bot Token**.
3. Send `/start` to your bot.
4. On StTV (Settings → Telegram Link), input your Bot Token & Chat ID, then select **Connect & Test**.
5. Control your TV remotely from Telegram:
   - `/status` — Live status, current channel & uptime
   - `/now` — Current channel details
   - `/channel <num>` — Jump to channel by number (e.g. `/channel 2`)
   - `/next` / `/prev` — Next / Previous channel
   - `/search <name>` — Search channels with interactive buttons
   - `/scan` — Run channel health probe
   - `/report` — Get last health report
   - `/watchtime` — Today's watch duration
