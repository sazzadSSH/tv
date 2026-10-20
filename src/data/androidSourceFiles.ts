export interface SourceFile {
  path: string;
  name: string;
  language: 'kotlin' | 'groovy' | 'xml' | 'json' | 'markdown' | 'properties' | 'toml';
  content: string;
  category: 'build' | 'manifest' | 'core' | 'player' | 'telegram' | 'database' | 'ui' | 'res' | 'docs' | 'tests';
}

export const ANDROID_SOURCE_FILES: SourceFile[] = [
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'kotlin',
    category: 'build',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "StTV"
include(":app")
`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts',
    language: 'kotlin',
    category: 'build',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.kapt) apply false
    alias(libs.plugins.google.services) apply false
}
`
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    language: 'toml',
    category: 'build',
    content: `[versions]
agp = "8.3.2"
kotlin = "1.9.23"
coreKtx = "1.12.0"
lifecycleRuntimeKtx = "2.7.0"
activityCompose = "1.8.2"
composeBom = "2024.04.00"
tvMaterial = "1.0.0-alpha10"
media3 = "1.3.1"
room = "2.6.1"
datastore = "1.0.0"
securityCrypto = "1.1.0-alpha06"
okhttp = "4.12.0"
coil = "2.6.0"
workManager = "2.9.0"
firebaseBom = "32.8.1"
coroutines = "1.8.0"
junit = "4.13.2"
mockk = "1.13.10"
turbine = "1.1.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }

# Compose for TV
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-tv-foundation = { group = "androidx.tv", name = "tv-foundation", version = "1.0.0-alpha10" }
androidx-tv-material = { group = "androidx.tv", name = "tv-material", version.ref = "tvMaterial" }

# AndroidX Media3 (ExoPlayer)
androidx-media3-exoplayer = { group = "androidx.media3", name = "media3-exoplayer", version.ref = "media3" }
androidx-media3-exoplayer-hls = { group = "androidx.media3", name = "media3-exoplayer-hls", version.ref = "media3" }
androidx-media3-ui = { group = "androidx.media3", name = "media3-ui", version.ref = "media3" }
androidx-media3-datasource-okhttp = { group = "androidx.media3", name = "media3-datasource-okhttp", version.ref = "media3" }

# Room
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

# DataStore & Keystore
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }
androidx-security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }

# Network & Images
square-okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
square-okhttp-logging = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }
io-coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }

# Background
androidx-work-runtime-ktx = { group = "androidx.work", name = "work-runtime-ktx", version.ref = "workManager" }

# Firebase
firebase-bom = { group = "com.google.firebase", name = "firebase-bom", version.ref = "firebaseBom" }
firebase-auth-ktx = { group = "com.google.firebase", name = "firebase-auth-ktx" }
firebase-firestore-ktx = { group = "com.google.firebase", name = "firebase-firestore-ktx" }

# Coroutines
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

# Testing
junit = { group = "junit", name = "junit", version.ref = "junit" }
mockk = { group = "io.mockk", name = "mockk", version.ref = "mockk" }
turbine = { group = "app.cash.turbine", name = "turbine", version.ref = "turbine" }
kotlinx-coroutines-test = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-test", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-kapt = { id = "org.jetbrains.kotlin.kapt", version.ref = "kotlin" }
google-services = { id = "com.google.gms.google-services", version = "4.4.1" }
`
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    language: 'properties',
    category: 'build',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'build',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    // Optional: apply if google-services.json is present
    // alias(libs.plugins.google.services)
}

android {
    namespace = "com.sttv.iptv"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.sttv.iptv"
        minSdk = 21 // Supports Android 5.0+ including TX9 Pro (Android 9/10/11)
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.11"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose TV
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.tv.foundation)
    implementation(libs.androidx.tv.material)

    // AndroidX Media3 ExoPlayer (HLS + OkHttp)
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.exoplayer.hls)
    implementation(libs.androidx.media3.ui)
    implementation(libs.androidx.media3.datasource.okhttp)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    kapt(libs.androidx.room.compiler)

    // DataStore & Security Keystore
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.security.crypto)

    // Network & Coil
    implementation(libs.square.okhttp)
    implementation(libs.square.okhttp.logging)
    implementation(libs.io.coil.compose)

    // WorkManager
    implementation(libs.androidx.work.runtime.ktx)

    // Firebase (Auth + Firestore)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth.ktx)
    implementation(libs.firebase.firestore.ktx)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // Unit Testing
    testImplementation(libs.junit)
    testImplementation(libs.mockk)
    testImplementation(libs.turbine)
    testImplementation(libs.kotlinx.coroutines.test)
}
`
  },
  {
    path: 'app/proguard-rules.pro',
    name: 'app/proguard-rules.pro',
    language: 'properties',
    category: 'build',
    content: `# Keep Media3 ExoPlayer
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**

# Keep Room
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**

# Keep OkHttp & Moshi
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod
-dontwarn okhttp3.**
-dontwarn okio.**

# Firebase Keep
-keepattributes *Annotation*
-dontwarn com.google.firebase.**
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions per Spec 03 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />

    <!-- Android TV Requirements -->
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />
    <uses-feature
        android:name="android.software.leanback"
        android:required="true" />

    <application
        android:name=".StTvApp"
        android:allowBackup="false"
        android:icon="@drawable/ic_launcher"
        android:banner="@drawable/ic_banner"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:banner="@drawable/ic_banner"
            android:configChanges="keyboard|keyboardHidden|navigation|orientation|screenLayout|screenSize|smallestScreenSize"
            android:exported="true"
            android:launchMode="singleTask"
            android:screenOrientation="landscape">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>
`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml (English)',
    language: 'xml',
    category: 'res',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">StTV</string>
    <string name="app_desc">Clean Android TV IPTV Player</string>
    <string name="setup_title">StTV Setup</string>
    <string name="add_m3u_url">Add M3U Playlist URL</string>
    <string name="import_m3u_file">Import M3U File (USB / Storage)</string>
    <string name="url_hint">https://example.com/playlist.m3u</string>
    <string name="load_playlist">Load Playlist</string>
    <string name="no_channel_playing">No channel playing</string>
    <string name="buffering">Buffering…</string>
    <string name="error_stream_unavailable">Channel stream unavailable</string>
    <string name="trying_next_channel">Trying next channel…</string>
    
    <!-- Tabs -->
    <string name="tab_all">All</string>
    <string name="tab_groups">Groups</string>
    <string name="tab_favorites">Favorites</string>
    <string name="tab_recent">Recent</string>
    <string name="tab_failed">Failed</string>

    <!-- Telegram -->
    <string name="telegram_title">Telegram Remote &amp; Alerts</string>
    <string name="bot_token">Bot Token</string>
    <string name="chat_id">Chat ID</string>
    <string name="connect_test">Connect &amp; Test</string>
    <string name="connected">Connected ✅</string>
    <string name="not_connected">Not Connected ❌</string>
</resources>
`
  },
  {
    path: 'app/src/main/res/values-bn/strings.xml',
    name: 'strings.xml (Bengali)',
    language: 'xml',
    category: 'res',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">StTV</string>
    <string name="app_desc">পরিষ্কার অ্যান্ড্রয়েড টিভি আইপিটিভি প্লেয়ার</string>
    <string name="setup_title">StTV সেটআপ</string>
    <string name="add_m3u_url">M3U URL যোগ করুন</string>
    <string name="import_m3u_file">ফাইল ইমপোর্ট করুন (ইউএসবি / স্টোরেজ)</string>
    <string name="url_hint">https://example.com/playlist.m3u</string>
    <string name="load_playlist">প্লেলিস্ট লোড করুন</string>
    <string name="no_channel_playing">কোনো চ্যানেল চলছে না</string>
    <string name="buffering">বাফারিং হচ্ছে…</string>
    <string name="error_stream_unavailable">চ্যানেল পাওয়া যাচ্ছে না</string>
    <string name="trying_next_channel">পরের চ্যানেল চেষ্টা করা হচ্ছে…</string>

    <!-- Tabs -->
    <string name="tab_all">সকল চ্যানেল</string>
    <string name="tab_groups">গ্রুপসমূহ</string>
    <string name="tab_favorites">ফেভারিট</string>
    <string name="tab_recent">সাম্প্রতিক</string>
    <string name="tab_failed">ব্যর্থ</string>

    <!-- Telegram -->
    <string name="telegram_title">টেলিগ্রাম রিমোট ও অ্যালার্ট</string>
    <string name="bot_token">বট টোকেন</string>
    <string name="chat_id">চ্যাট আইডি</string>
    <string name="connect_test">সংযুক্ত ও পরীক্ষা করুন</string>
    <string name="connected">সংযুক্ত ✅</string>
    <string name="not_connected">সংযুক্ত নয় ❌</string>
</resources>
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/StTvApp.kt',
    name: 'StTvApp.kt',
    language: 'kotlin',
    category: 'core',
    content: `package com.sttv.iptv

import android.app.Application
import com.sttv.iptv.data.db.AppDatabase
import com.sttv.iptv.player.PlayerManager
import com.sttv.iptv.telegram.TelegramNotifier
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Application entry point for StTV IPTV on Android TV (TX9 Pro).
 * Initializes SQLite Room DB, ExoPlayer singleton, and background startup services.
 */
class StTvApp : Application() {

    val appScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    lateinit var database: AppDatabase
        private set
    lateinit var playerManager: PlayerManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize local Room DB
        database = AppDatabase.getInstance(this)

        // Initialize single ExoPlayer manager
        playerManager = PlayerManager(this)
    }

    companion object {
        lateinit var instance: StTvApp
            private set
    }
}
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/player/PlayerManager.kt',
    name: 'PlayerManager.kt',
    language: 'kotlin',
    category: 'player',
    content: `package com.sttv.iptv.player

import android.content.Context
import android.net.Uri
import androidx.annotation.OptIn
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.datasource.okhttp.OkHttpDataSource
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.exoplayer.source.MediaSource
import androidx.media3.exoplayer.source.ProgressiveMediaSource
import com.sttv.iptv.data.db.ChannelEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

sealed interface PlaybackState {
    object Idle : PlaybackState
    object Buffering : PlaybackState
    data class Playing(val channel: ChannelEntity) : PlaybackState
    data class Error(val error: PlaybackException, val channel: ChannelEntity, val recoverable: Boolean) : PlaybackState
}

@OptIn(androidx.media3.common.util.UnstableApi::class)
class PlayerManager(private val context: Context) {

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(8, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .followRedirects(true)
        .build()

    private val dataSourceFactory = OkHttpDataSource.Factory(okHttpClient)

    // LoadControl with low memory profile for Android TV boxes like TX9 Pro
    private val loadControl = DefaultLoadControl.Builder()
        .setBufferDurationsMs(
            1500, // minBufferMs
            5000, // maxBufferMs
            800,  // bufferForPlaybackMs
            1500  // bufferForPlaybackAfterRebufferMs
        )
        .build()

    val exoPlayer: ExoPlayer = ExoPlayer.Builder(context)
        .setLoadControl(loadControl)
        .build()

    private val _playbackState = MutableStateFlow<PlaybackState>(PlaybackState.Idle)
    val playbackState: StateFlow<PlaybackState> = _playbackState

    var currentChannel: ChannelEntity? = null
        private set

    init {
        exoPlayer.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                when (state) {
                    Player.STATE_BUFFERING -> _playbackState.value = PlaybackState.Buffering
                    Player.STATE_READY -> {
                        currentChannel?.let { _playbackState.value = PlaybackState.Playing(it) }
                    }
                    Player.STATE_IDLE -> _playbackState.value = PlaybackState.Idle
                    Player.STATE_ENDED -> {}
                }
            }

            override fun onPlayerError(error: PlaybackException) {
                val channel = currentChannel ?: return
                val isRecoverable = ErrorClassifier.isRecoverable(error)
                _playbackState.value = PlaybackState.Error(error, channel, isRecoverable)
            }
        })
    }

    fun playChannel(channel: ChannelEntity) {
        currentChannel = channel
        val uri = Uri.parse(channel.url)
        val mediaSource = createMediaSource(uri)
        
        exoPlayer.stop()
        exoPlayer.setMediaSource(mediaSource)
        exoPlayer.prepare()
        exoPlayer.playWhenReady = true
    }

    private fun createMediaSource(uri: Uri): MediaSource {
        val path = uri.toString().lowercase()
        return if (path.contains(".m3u8") || path.contains("hls")) {
            HlsMediaSource.Factory(dataSourceFactory).createMediaSource(MediaItem.fromUri(uri))
        } else {
            ProgressiveMediaSource.Factory(dataSourceFactory).createMediaSource(MediaItem.fromUri(uri))
        }
    }

    fun release() {
        exoPlayer.release()
    }
}
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/player/ErrorClassifier.kt',
    name: 'ErrorClassifier.kt',
    language: 'kotlin',
    category: 'player',
    content: `package com.sttv.iptv.player

import androidx.media3.common.PlaybackException
import androidx.media3.datasource.HttpDataSource

object ErrorClassifier {

    /**
     * Classifies whether a playback error is recoverable (e.g. temporary packet loss, timeout)
     * or permanent (HTTP 401 Unauthorized, 403 Forbidden, 404 Not Found, 410 Gone).
     */
    fun isRecoverable(error: PlaybackException): Boolean {
        val cause = error.cause
        if (cause is HttpDataSource.InvalidResponseCodeException) {
            val code = cause.responseCode
            if (code == 401 || code == 403 || code == 404 || code == 410) {
                return false // Permanent failure: Token expired or geoblocked
            }
        }
        return true // Network timeout, DNS glitch, decoder stall -> retryable
    }
}
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/playlist/M3uParser.kt',
    name: 'M3uParser.kt',
    language: 'kotlin',
    category: 'core',
    content: `package com.sttv.iptv.playlist

import com.sttv.iptv.data.db.ChannelEntity
import java.io.BufferedReader
import java.io.InputStream
import java.io.InputStreamReader
import java.security.MessageDigest

object M3uParser {

    private val EXTINF_REGEX = Regex(
        """#EXTINF:(?:-?\\d+)?(?:\\s+tvg-id="([^"]*)")?(?:\\s+tvg-name="([^"]*)")?(?:\\s+tvg-logo="([^"]*)")?(?:\\s+group-title="([^"]*)")?(?:\\s+tvg-chno="(\\d+)")?[^,]*,(.*)""",
        RegexOption.IGNORE_CASE
    )

    fun parse(inputStream: InputStream, playlistId: Long): List<ChannelEntity> {
        val reader = BufferedReader(InputStreamReader(inputStream, Charsets.UTF_8))
        val channels = mutableListOf<ChannelEntity>()
        var line: String?
        var lastExtInf: ExtInfData? = null
        var fallbackNumber = 1

        while (reader.readLine().also { line = it } != null) {
            val trimmed = line?.trim() ?: continue
            if (trimmed.isEmpty()) continue

            if (trimmed.startsWith("#EXTINF:", ignoreCase = true)) {
                lastExtInf = parseExtInf(trimmed, fallbackNumber)
            } else if (trimmed.startsWith("#EXTGRP:", ignoreCase = true)) {
                val group = trimmed.substring(8).trim()
                if (lastExtInf != null && group.isNotEmpty()) {
                    lastExtInf = lastExtInf.copy(group = group)
                }
            } else if (!trimmed.startsWith("#")) {
                // Stream URL line
                val ext = lastExtInf ?: ExtInfData(
                    name = "Channel $fallbackNumber",
                    group = "General",
                    number = fallbackNumber
                )
                val id = md5("\${playlistId}_\${trimmed}_\${ext.tvgId}")
                channels.add(
                    ChannelEntity(
                        id = id,
                        playlistId = playlistId,
                        number = ext.number ?: fallbackNumber,
                        name = ext.name,
                        url = trimmed,
                        groupName = ext.group,
                        logoUrl = ext.logoUrl,
                        tvgId = ext.tvgId,
                        sortOrder = fallbackNumber
                    )
                )
                fallbackNumber++
                lastExtInf = null
            }
        }
        return channels
    }

    private fun parseExtInf(line: String, defaultNum: Int): ExtInfData {
        val commaIndex = line.lastIndexOf(',')
        val name = if (commaIndex != -1) line.substring(commaIndex + 1).trim() else "Channel $defaultNum"

        val tvgId = extractAttr(line, "tvg-id")
        val tvgName = extractAttr(line, "tvg-name")
        val tvgLogo = extractAttr(line, "tvg-logo")
        val group = extractAttr(line, "group-title") ?: "General"
        val chno = extractAttr(line, "tvg-chno")?.toIntOrNull()

        return ExtInfData(
            name = if (name.isNotBlank()) name else (tvgName ?: "Channel $defaultNum"),
            tvgId = tvgId,
            logoUrl = tvgLogo,
            group = group,
            number = chno ?: defaultNum
        )
    }

    private fun extractAttr(line: String, attrName: String): String? {
        val regex = Regex("""\$attrName="([^"]*)"""", RegexOption.IGNORE_CASE)
        return regex.find(line)?.groupValues?.get(1)
    }

    private fun md5(input: String): String {
        val bytes = MessageDigest.getInstance("MD5").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }

    private data class ExtInfData(
        val name: String,
        val tvgId: String? = null,
        val logoUrl: String? = null,
        val group: String? = null,
        val number: Int? = null
    )
}
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/data/db/Entities.kt',
    name: 'Entities.kt',
    language: 'kotlin',
    category: 'database',
    content: `package com.sttv.iptv.data.db

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "channels",
    indices = [
        Index("playlistId"),
        Index("name"),
        Index("groupName"),
        Index("number")
    ]
)
data class ChannelEntity(
    @PrimaryKey val id: String,
    val playlistId: Long,
    val number: Int,
    val name: String,
    val url: String, // Never printed in unredacted logs
    val groupName: String? = null,
    val logoUrl: String? = null,
    val tvgId: String? = null,
    val userAgent: String? = null,
    val referrer: String? = null,
    val isFavorite: Boolean = false,
    val isHidden: Boolean = false,
    val isDuplicate: Boolean = false,
    val sortOrder: Int = 0
)

@Entity(tableName = "health")
data class HealthEntity(
    @PrimaryKey val channelId: String,
    val status: String, // HEALTHY, SLOW, UNAVAILABLE, UNKNOWN
    val httpCode: Int? = null,
    val responseMs: Long? = null,
    val lastCheck: Long? = null,
    val lastSuccess: Long? = null,
    val lastFailure: Long? = null,
    val consecutiveFailures: Int = 0,
    val errorType: String? = null,
    val alertState: String = "OK",
    val lastAlertAt: Long? = null
)

@Entity(tableName = "watch_sessions")
data class WatchSessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val startAt: Long,
    val endAt: Long? = null,
    val channelId: String,
    val channelName: String,
    val seconds: Long
)
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/data/db/Daos.kt',
    name: 'Daos.kt',
    language: 'kotlin',
    category: 'database',
    content: `package com.sttv.iptv.data.db

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ChannelDao {
    @Query("SELECT * FROM channels ORDER BY number ASC")
    fun getAllChannels(): Flow<List<ChannelEntity>>

    @Query("SELECT * FROM channels WHERE isFavorite = 1 ORDER BY number ASC")
    fun getFavoriteChannels(): Flow<List<ChannelEntity>>

    @Query("SELECT * FROM channels WHERE groupName = :group ORDER BY number ASC")
    fun getChannelsByGroup(group: String): Flow<List<ChannelEntity>>

    @Query("SELECT DISTINCT groupName FROM channels WHERE groupName IS NOT NULL ORDER BY groupName ASC")
    fun getAllGroups(): Flow<List<String>>

    @Query("SELECT * FROM channels WHERE name LIKE '%' || :query || '%' ORDER BY number ASC")
    fun searchChannels(query: String): Flow<List<ChannelEntity>>

    @Query("SELECT * FROM channels WHERE number = :num LIMIT 1")
    suspend fun getChannelByNumber(num: Int): ChannelEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(channels: List<ChannelEntity>)

    @Query("UPDATE channels SET isFavorite = :isFav WHERE id = :channelId")
    suspend fun updateFavorite(channelId: String, isFav: Boolean)

    @Query("DELETE FROM channels WHERE playlistId = :playlistId")
    suspend fun deleteByPlaylist(playlistId: Long)
}

@Dao
interface HealthDao {
    @Query("SELECT * FROM health")
    fun getAllHealth(): Flow<List<HealthEntity>>

    @Query("SELECT * FROM health WHERE channelId = :channelId")
    suspend fun getHealth(channelId: String): HealthEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(health: HealthEntity)
}
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/data/db/AppDatabase.kt',
    name: 'AppDatabase.kt',
    language: 'kotlin',
    category: 'database',
    content: `package com.sttv.iptv.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        ChannelEntity::class,
        HealthEntity::class,
        WatchSessionEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun channelDao(): ChannelDao
    abstract fun healthDao(): HealthDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "sttv.db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/telegram/TelegramClient.kt',
    name: 'TelegramClient.kt',
    language: 'kotlin',
    category: 'telegram',
    content: `package com.sttv.iptv.telegram

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class TelegramClient(private val botToken: String) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(35, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun getMe(): Result<String> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("https://api.telegram.org/bot\$botToken/getMe")
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                val body = response.body?.string().orEmpty()
                val json = JSONObject(body)
                if (response.isSuccessful && json.optBoolean("ok")) {
                    val result = json.getJSONObject("result")
                    Result.success(result.optString("username", "StTVBot"))
                } else {
                    Result.failure(Exception(json.optString("description", "Unauthorized token")))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendMessage(chatId: String, htmlText: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val payload = JSONObject().apply {
                put("chat_id", chatId)
                put("text", htmlText)
                put("parse_mode", "HTML")
                put("disable_web_page_preview", true)
            }

            val request = Request.Builder()
                .url("https://api.telegram.org/bot\$botToken/sendMessage")
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            client.newCall(request).execute().use { response ->
                val body = response.body?.string().orEmpty()
                val json = JSONObject(body)
                if (response.isSuccessful && json.optBoolean("ok")) {
                    Result.success(true)
                } else {
                    Result.failure(Exception(json.optString("description", "HTTP \${response.code}")))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/telegram/TelegramCommandRouter.kt',
    name: 'TelegramCommandRouter.kt',
    language: 'kotlin',
    category: 'telegram',
    content: `package com.sttv.iptv.telegram

import com.sttv.iptv.data.db.ChannelEntity

interface CommandHandler {
    suspend fun onSwitchChannel(number: Int): ChannelEntity?
    suspend fun onNextChannel(): ChannelEntity?
    suspend fun onPrevChannel(): ChannelEntity?
    suspend fun onSearch(query: String): List<ChannelEntity>
    suspend fun getCurrentStatus(): String
}

class TelegramCommandRouter(
    private val allowedChatIds: Set<String>,
    private val handler: CommandHandler
) {
    suspend fun dispatch(chatId: String, text: String): String {
        if (!allowedChatIds.contains(chatId)) {
            return "⛔ <b>অননুমোদিত চ্যাট</b> (Unauthorized Chat ID: \$chatId)"
        }

        val parts = text.trim().split("\\s+".toRegex())
        val command = parts[0].lowercase()

        return when (command) {
            "/start", "/help" -> """
                📺 <b>StTV Telegram Remote Menu:</b>
                /status - বর্তমান টিভির অবস্থা ও চ্যানেল
                /now - এখন কী চলছে
                /channel &lt;num&gt; - নির্দিষ্ট নম্বরে চ্যানেল সুইচ
                /next - পরের চ্যানেল
                /prev - আগের চ্যানেল
                /search &lt;name&gt; - চ্যানেল খুঁজুন
                /scan - স্বাস্থ্য স্ক্যান রিপোর্ট
                /watchtime - আজকের দেখার সময়
            """.trimIndent()

            "/status", "/now" -> handler.getCurrentStatus()

            "/channel" -> {
                val num = parts.getOrNull(1)?.toIntOrNull()
                if (num == null) {
                    "নম্বর লিখুন: যেমন <code>/channel 1</code>"
                } else {
                    val ch = handler.onSwitchChannel(num)
                    if (ch != null) "▶️ <b>\${ch.number} · \${ch.name}</b> চলছে" else "❌ চ্যানেল নম্বর \$num পাওয়া যায়নি"
                }
            }

            "/next" -> {
                val ch = handler.onNextChannel()
                if (ch != null) "▶️ <b>\${ch.number} · \${ch.name}</b>" else "❌ চ্যানেল পরিবর্তন ব্যর্থ"
            }

            "/prev" -> {
                val ch = handler.onPrevChannel()
                if (ch != null) "◀️ <b>\${ch.number} · \${ch.name}</b>" else "❌ চ্যানেল পরিবর্তন ব্যর্থ"
            }

            "/search" -> {
                val query = parts.drop(1).joinToString(" ")
                if (query.isBlank()) {
                    "কী খুঁজবেন লিখুন: যেমন <code>/search সময়</code>"
                } else {
                    val results = handler.onSearch(query)
                    if (results.isEmpty()) {
                        "কোনো চ্যানেল মেলেনি: '\$query'"
                    } else {
                        "🔎 <b>সন্ধান ফলাফল:</b>\\n" + results.take(8).joinToString("\\n") { "• #\${it.number} <b>\${it.name}</b>" }
                    }
                }
            }

            else -> "অপরিচিত কমান্ড। মেনু দেখতে <code>/help</code> পাঠান।"
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/sttv/iptv/util/Redactor.kt',
    name: 'Redactor.kt',
    language: 'kotlin',
    category: 'core',
    content: `package com.sttv.iptv.util

object Redactor {
    private val BOT_TOKEN_REGEX = Regex("""\d{6,}:[A-Za-z0-9_-]{30,}""")
    private val URL_AUTH_REGEX = Regex("""https?://[^:@\s]+:[^@\s]+@""")
    private val QUERY_TOKEN_REGEX = Regex("""(?i)(token|key|auth|pass|signature)=([^&]+)""")

    fun redact(text: String): String {
        var result = BOT_TOKEN_REGEX.replace(text) { match ->
            val v = match.value
            "\${v.take(4)}••••••••\${v.takeLast(4)}"
        }
        result = URL_AUTH_REGEX.replace(result, "http://***:***@")
        result = QUERY_TOKEN_REGEX.replace(result) { match ->
            "\${match.groupValues[1]}=REDACTED"
        }
        return result
    }
}
`
  },
  {
    path: 'firestore.rules',
    name: 'firestore.rules',
    language: 'properties',
    category: 'database',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated owner can read/write their StTV records
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
`
  },
  {
    path: 'testdata/sample.m3u',
    name: 'sample.m3u',
    language: 'markdown',
    category: 'docs',
    content: `#EXTM3U
#EXTINF:-1 tvg-id="BTV.bd" tvg-name="BTV" tvg-logo="https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=100&h=100&fit=crop&q=80" group-title="Bangla National",BTV National (বিটিভি)
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8

#EXTINF:-1 tvg-id="Somoy.bd" tvg-name="Somoy TV" tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=100&h=100&fit=crop&q=80" group-title="Bangla News",Somoy TV (সময় টিভি)
https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'docs',
    content: `# StTV — Native Android TV IPTV Application
**Target Hardware:** TX9 Pro Android TV Box / Amlogic / Allwinner Android 9/10/11+ TV Boxes
**Package Name:** \`com.sttv.iptv\`
**Architecture:** Kotlin, Jetpack Compose for TV, AndroidX Media3 (ExoPlayer), Room DB, WorkManager, Telegram Bot API, Firebase Firestore.

---

## 🛠️ Build Commands (Terminal)
\`\`\`bash
# 1. Clone & Grant Executable Permission
chmod +x gradlew

# 2. Build Debug APK (For TX9 Pro testing)
./gradlew assembleDebug
# Generated APK: app/build/outputs/apk/debug/app-debug.apk

# 3. Build Signed Release APK
./gradlew assembleRelease
# Generated APK: app/build/outputs/apk/release/app-release.apk

# 4. Run Unit Tests
./gradlew testDebugUnitTest
\`\`\`

---

## 📺 Install on TX9 Pro via ADB (Wi-Fi)
\`\`\`bash
# 1. Enable Developer Options & USB Debugging on TX9 Pro
# 2. Connect via Wi-Fi IP
adb connect 192.168.1.100:5555

# 3. Install APK
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 4. Launch StTV on Android TV
adb shell monkey -p com.sttv.iptv -c android.intent.category.LEANBACK_LAUNCHER 1
\`\`\`

---

## 🤖 Telegram Bot Remote Setup
1. Open Telegram and search for **@BotFather**.
2. Run \`/newbot\` to get your **Bot Token**.
3. Send \`/start\` to your new bot.
4. Go to **StTV Settings → Telegram Link**, enter your Token & Chat ID, and click **Connect & Test**.
5. Once connected, control your TV using:
   - \`/status\` - Current channel & uptime
   - \`/channel 1\` - Switch to channel 1
   - \`/next\` & \`/prev\` - Change channels
   - \`/search somoy\` - Search channels
   - \`/scan\` - Trigger channel health test
\`\`\`
`
  },
  {
    path: 'gradlew',
    name: 'gradlew',
    language: 'markdown',
    category: 'build',
    content: `#!/bin/sh
APP_BASE_NAME=\`basename "$0"\`
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
if [ -n "$JAVA_HOME" ] ; then
    JAVACMD="$JAVA_HOME/bin/java"
else
    JAVACMD="java"
fi
exec "$JAVACMD" "-Dorg.gradle.appname=$APP_BASE_NAME" -jar gradle/wrapper/gradle-wrapper.jar "$@"
`
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    language: 'properties',
    category: 'build',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.6-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  }
];
