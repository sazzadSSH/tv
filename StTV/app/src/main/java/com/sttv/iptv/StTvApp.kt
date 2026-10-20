package com.sttv.iptv

import android.app.Application
import com.sttv.iptv.data.db.AppDatabase
import com.sttv.iptv.player.PlayerManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

/**
 * Application entry point for StTV IPTV on Android TV (TX9 Pro).
 * Initializes Room DB, single ExoPlayer instance, and background services.
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

        database = AppDatabase.getInstance(this)
        playerManager = PlayerManager(this)
    }

    companion object {
        lateinit var instance: StTvApp
            private set
    }
}
