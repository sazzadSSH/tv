/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Tv, 
  Settings as SettingsIcon, 
  Send, 
  Activity, 
  Code2, 
  Heart 
} from 'lucide-react';
import { Channel, AppSettings, LogEntry, Playlist } from './types/sttv';
import { DEFAULT_CHANNELS } from './sampleData/defaultPlaylist';
import { parseM3U } from './utils/m3uParser';
import { TVPlayer } from './components/TVPlayer';
import { ChannelPanel } from './components/ChannelPanel';
import { VirtualRemote } from './components/VirtualRemote';
import { SettingsModal, SettingsSection } from './components/SettingsModal';
import { HealthDashboardModal } from './components/HealthDashboardModal';
import { TelegramBotConsoleModal } from './components/TelegramBotConsoleModal';
import { AndroidProjectViewerModal } from './components/AndroidProjectViewerModal';
import { sendTelegramMessage, buildLaunchMessage } from './utils/telegramApi';

const STORAGE_PLAYLISTS_KEY = 'sttv_saved_playlists_v3';
const STORAGE_ACTIVE_PL_KEY = 'sttv_active_playlist_id_v3';
const STORAGE_SETTINGS_KEY = 'sttv_settings_v3';

export default function App() {
  // 1. Playlists Management State
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLAYLISTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'pl_bdix',
        name: 'BDIX-IPTV (Bangladesh & Global)',
        url: 'https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u',
        channelCount: 1139,
        lastUpdated: Date.now(),
        isDefault: true
      },
      {
        id: 'pl_curated',
        name: 'StTV Curated Streams (Fast HLS)',
        channelCount: DEFAULT_CHANNELS.length,
        channels: DEFAULT_CHANNELS,
        lastUpdated: Date.now(),
        isDefault: true
      }
    ];
  });

  const [activePlaylistId, setActivePlaylistId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_ACTIVE_PL_KEY) || 'pl_bdix';
  });

  // Channels State
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(DEFAULT_CHANNELS[0]);
  const [recentChannelIds, setRecentChannelIds] = useState<string[]>(['ch_1']);
  const [failedChannelIds, setFailedChannelIds] = useState<string[]>([]);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);

  // References to prevent re-fetch loops
  const channelCacheRef = useRef<Map<string, Channel[]>>(new Map([
    ['pl_curated', DEFAULT_CHANNELS]
  ]));
  const loadedPlaylistIdRef = useRef<string | null>(null);

  // Modals & Overlays State
  const [isChannelPanelOpen, setIsChannelPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState<SettingsSection>('TELEGRAM');
  const [isHealthDashboardOpen, setIsHealthDashboardOpen] = useState(false);
  const [isTelegramConsoleOpen, setIsTelegramConsoleOpen] = useState(false);
  const [isAndroidProjectOpen, setIsAndroidProjectOpen] = useState(false);
  const [isInfoBarVisible, setIsInfoBarVisible] = useState(false);
  const [showRemoteDrawer, setShowRemoteDrawer] = useState(false);
  const [showControlsBar, setShowControlsBar] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio & Aspect Ratio
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);

  // Numeric channel buffer (0-9)
  const [numericBuffer, setNumericBuffer] = useState('');
  const numericTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Logs & Diagnostics
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log_1',
      timestamp: Date.now() - 3000,
      level: 'INFO',
      tag: 'StTvApp',
      message: 'StTV Android TV Clean Full-Screen Player loaded on TX9 Pro'
    }
  ]);

  const addLog = useCallback((tag: string, message: string, level: LogEntry['level'] = 'INFO') => {
    setLogs(prev => [
      ...prev.slice(-100),
      {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        level,
        tag,
        message
      }
    ]);
  }, []);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      language: 'bn',
      autoplay: true,
      startOnChannel1: true,
      restoreLast: false,
      lastChannelId: null,
      reverseUpDown: false,
      aspectRatio: 'FIT',
      bufferMinMs: 1500,
      bufferMaxMs: 5000,
      maxRetries: 3,
      backoffBaseMs: 1000,
      fallbackMode: 'NEXT_CHANNEL',
      autoBypassInactive: true,
      healthMonitoringEnabled: true,
      scanIntervalMin: 15,
      maxConcurrent: 2,
      slowThresholdMs: 800,
      failureThreshold: 3,
      telegram: {
        enabled: true,
        botToken: '',
        chatId: '',
        allowedChatIds: [],
        cooldownMin: 30,
        minFailures: 3,
        dailySummary: true,
        dailyTime: '22:00',
        launchMsg: true,
        startupScanReport: true,
        watchReport: true,
        commandsEnabled: true,
        requirePinForSensitive: false,
        connected: false
      },
      firebaseSyncEnabled: true,
      firebaseConnected: true,
      firebaseUserId: 'usr_tx9_local',
      parentalPinEnabled: false,
      parentalPin: '0000',
      reduceMotion: false,
      textScale: 'NORMAL'
    };
  });

  // Watch Session Tracking
  const [todayWatchSeconds, setTodayWatchSeconds] = useState(1480);
  useEffect(() => {
    const timer = setInterval(() => {
      setTodayWatchSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save playlists and settings to localStorage (Debounced)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PLAYLISTS_KEY, JSON.stringify(playlists));
      localStorage.setItem(STORAGE_ACTIVE_PL_KEY, activePlaylistId);
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [playlists, activePlaylistId, settings]);

  // Load playlist without infinite loop
  const loadPlaylistChannels = useCallback(async (playlistId: string) => {
    if (loadedPlaylistIdRef.current === playlistId) {
      return; // Already loaded, avoid reloading
    }

    const playlist = playlists.find(p => p.id === playlistId) || playlists[0];
    if (!playlist) return;

    // Check memory cache first
    const cached = channelCacheRef.current.get(playlist.id);
    if (cached && cached.length > 0) {
      loadedPlaylistIdRef.current = playlist.id;
      setChannels(cached);
      setCurrentChannel(cached[0]);
      return;
    }

    if (playlist.channels && playlist.channels.length > 0) {
      channelCacheRef.current.set(playlist.id, playlist.channels);
      loadedPlaylistIdRef.current = playlist.id;
      setChannels(playlist.channels);
      setCurrentChannel(playlist.channels[0]);
      return;
    }

    if (!playlist.url) return;

    setIsLoadingPlaylist(true);
    addLog('M3uParser', `Loading playlist: ${playlist.name}`);

    try {
      const proxyUrl = `/api/proxy-playlist?url=${encodeURIComponent(playlist.url)}`;
      let res = await fetch(proxyUrl);
      if (!res.ok) {
        res = await fetch(playlist.url);
      }

      const text = await res.text();
      const parsed = parseM3U(text, playlist.url);

      if (parsed.channels.length > 0) {
        channelCacheRef.current.set(playlist.id, parsed.channels);
        loadedPlaylistIdRef.current = playlist.id;
        setChannels(parsed.channels);
        setCurrentChannel(parsed.channels[0]);
        addLog('M3uParser', `Successfully loaded ${parsed.channels.length} channels`);

        // Update playlist count
        setPlaylists(prev => prev.map(p => {
          if (p.id === playlist.id) {
            return { ...p, channelCount: parsed.channels.length, lastUpdated: Date.now() };
          }
          return p;
        }));
      } else {
        throw new Error('কোনো চ্যানেল পার্স করা যায়নি');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog('M3uParser', `Failed to load: ${msg}`, 'ERROR');
      // Fallback to default channels so player is never empty
      setChannels(DEFAULT_CHANNELS);
      setCurrentChannel(DEFAULT_CHANNELS[0]);
      loadedPlaylistIdRef.current = playlist.id;
    } finally {
      setIsLoadingPlaylist(false);
    }
  }, [playlists, addLog]);

  // Load only when activePlaylistId changes
  useEffect(() => {
    loadPlaylistChannels(activePlaylistId);
  }, [activePlaylistId, loadPlaylistChannels]);

  // Auto-Bypass Inactive Channel Handler
  const handleAutoBypassChannel = useCallback((channelId: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        return {
          ...ch,
          isBypassed: true,
          health: {
            ...ch.health,
            status: 'UNAVAILABLE',
            consecutiveFailures: (ch.health?.consecutiveFailures || 0) + 1,
            errorType: 'Stream Offline'
          }
        };
      }
      return ch;
    }));

    setFailedChannelIds(prev => Array.from(new Set([...prev, channelId])));
    addLog('PlaybackRecovery', `Channel marked Inactive`);
  }, [addLog]);

  // Channel Selection Logic
  const handleSelectChannel = useCallback((channel: Channel) => {
    setCurrentChannel(channel);
    setRecentChannelIds(prev => [channel.id, ...prev.filter(id => id !== channel.id)].slice(0, 30));
  }, []);

  // Next Channel with Auto-Bypass
  const handleNextChannel = useCallback(() => {
    if (!currentChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex(c => c.id === currentChannel.id);
    const step = settings.reverseUpDown ? -1 : 1;
    const len = channels.length;

    let foundIndex = -1;
    for (let i = 1; i < len; i++) {
      const candidateIndex = (currentIndex + i * step + len * 100) % len;
      const candidate = channels[candidateIndex];

      if (settings.autoBypassInactive && candidate.isBypassed) {
        continue;
      }
      foundIndex = candidateIndex;
      break;
    }

    if (foundIndex !== -1) {
      handleSelectChannel(channels[foundIndex]);
    } else {
      const fallbackIndex = (currentIndex + step + len) % len;
      handleSelectChannel(channels[fallbackIndex]);
    }
  }, [currentChannel, channels, settings.reverseUpDown, settings.autoBypassInactive, handleSelectChannel]);

  // Previous Channel with Auto-Bypass
  const handlePrevChannel = useCallback(() => {
    if (!currentChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex(c => c.id === currentChannel.id);
    const step = settings.reverseUpDown ? 1 : -1;
    const len = channels.length;

    let foundIndex = -1;
    for (let i = 1; i < len; i++) {
      const candidateIndex = (currentIndex + i * step + len * 100) % len;
      const candidate = channels[candidateIndex];

      if (settings.autoBypassInactive && candidate.isBypassed) {
        continue;
      }
      foundIndex = candidateIndex;
      break;
    }

    if (foundIndex !== -1) {
      handleSelectChannel(channels[foundIndex]);
    } else {
      const fallbackIndex = (currentIndex + step + len) % len;
      handleSelectChannel(channels[fallbackIndex]);
    }
  }, [currentChannel, channels, settings.reverseUpDown, settings.autoBypassInactive, handleSelectChannel]);

  // Numeric Channel Input Handler (e.g. typing 1 then 2 switches to channel 12)
  const handleNumberPress = useCallback((digit: number) => {
    setNumericBuffer(prev => {
      const nextVal = `${prev}${digit}`;
      if (numericTimerRef.current) clearTimeout(numericTimerRef.current);
      
      numericTimerRef.current = setTimeout(() => {
        const targetNum = parseInt(nextVal, 10);
        const match = channels.find(c => c.number === targetNum);
        if (match) {
          handleSelectChannel(match);
        } else {
          addLog('PlayerManager', `Channel #${targetNum} not found`, 'WARN');
        }
        setNumericBuffer('');
      }, 1500);

      return nextVal;
    });
  }, [channels, handleSelectChannel, addLog]);

  // Toggle Favorite
  const handleToggleFavorite = useCallback((channelId: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        const isFav = !ch.isFavorite;
        return { ...ch, isFavorite: isFav };
      }
      return ch;
    }));
  }, []);

  // Cycle Aspect Ratio (FIT -> FILL -> ZOOM)
  const handleCycleAspect = useCallback(() => {
    setSettings(prev => {
      const modes: AppSettings['aspectRatio'][] = ['FIT', 'FILL', 'ZOOM'];
      const nextMode = modes[(modes.indexOf(prev.aspectRatio) + 1) % modes.length];
      return { ...prev, aspectRatio: nextMode };
    });
  }, []);

  // Multi-Playlist Actions
  const handleAddPlaylist = async (name: string, url: string) => {
    const newId = `pl_${Date.now()}`;
    const newPl: Playlist = {
      id: newId,
      name,
      url,
      channelCount: 0,
      lastUpdated: Date.now()
    };
    setPlaylists(prev => [...prev, newPl]);
    loadedPlaylistIdRef.current = null;
    setActivePlaylistId(newId);
  };

  const handleEditPlaylist = (id: string, name: string, url?: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, name, url: url || p.url, lastUpdated: Date.now() };
      }
      return p;
    }));
  };

  const handleDeletePlaylist = (id: string) => {
    if (playlists.length <= 1) return;
    channelCacheRef.current.delete(id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (activePlaylistId === id) {
      const remaining = playlists.filter(p => p.id !== id);
      if (remaining.length > 0) {
        loadedPlaylistIdRef.current = null;
        setActivePlaylistId(remaining[0].id);
      }
    }
  };

  const handleRefreshPlaylist = async (id: string) => {
    channelCacheRef.current.delete(id);
    loadedPlaylistIdRef.current = null;
    await loadPlaylistChannels(id);
  };

  const handleSelectPlaylist = (id: string) => {
    if (activePlaylistId !== id) {
      loadedPlaylistIdRef.current = null;
      setActivePlaylistId(id);
    }
  };

  const handleImportM3uContent = (content: string, name = 'Imported Playlist') => {
    const parsed = parseM3U(content);
    if (parsed.channels.length > 0) {
      const newId = `pl_${Date.now()}`;
      const newPl: Playlist = {
        id: newId,
        name,
        channelCount: parsed.channels.length,
        channels: parsed.channels,
        lastUpdated: Date.now()
      };
      channelCacheRef.current.set(newId, parsed.channels);
      setPlaylists(prev => [...prev, newPl]);
      loadedPlaylistIdRef.current = newId;
      setActivePlaylistId(newId);
      setChannels(parsed.channels);
      setCurrentChannel(parsed.channels[0]);
    }
  };

  // Hardware Android TV Remote Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        // Hardware Remote LEFT button -> Opens Telegram Settings
        case 'ArrowLeft':
          e.preventDefault();
          setSettingsInitialSection('TELEGRAM');
          setIsSettingsOpen(true);
          break;

        // Hardware Remote RIGHT button -> Opens General Settings / Playlists
        case 'ArrowRight':
          e.preventDefault();
          setSettingsInitialSection('PLAYLIST');
          setIsSettingsOpen(true);
          break;

        // Hardware Remote UP button -> Channel Up
        case 'ArrowUp':
        case 'ChannelUp':
          e.preventDefault();
          handleNextChannel();
          break;

        // Hardware Remote DOWN button -> Channel Down
        case 'ArrowDown':
        case 'ChannelDown':
          e.preventDefault();
          handlePrevChannel();
          break;

        // Hardware Remote OK button -> Open Channel Panel
        case 'Enter':
          e.preventDefault();
          if (numericBuffer) {
            const num = parseInt(numericBuffer, 10);
            const match = channels.find(c => c.number === num);
            if (match) handleSelectChannel(match);
            setNumericBuffer('');
          } else {
            setIsChannelPanelOpen(prev => !prev);
          }
          break;

        // Hardware Remote BACK / ESC button
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          if (isChannelPanelOpen) setIsChannelPanelOpen(false);
          else if (isSettingsOpen) setIsSettingsOpen(false);
          else if (isHealthDashboardOpen) setIsHealthDashboardOpen(false);
          else if (isTelegramConsoleOpen) setIsTelegramConsoleOpen(false);
          else if (isAndroidProjectOpen) setIsAndroidProjectOpen(false);
          else if (isInfoBarVisible) setIsInfoBarVisible(false);
          else if (showRemoteDrawer) setShowRemoteDrawer(false);
          break;

        case 'm':
        case 'M':
          setSettingsInitialSection('ABOUT');
          setIsSettingsOpen(true);
          break;
        case 'f':
        case 'F':
          if (currentChannel) handleToggleFavorite(currentChannel.id);
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          handleNumberPress(parseInt(e.key, 10));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNextChannel, 
    handlePrevChannel, 
    handleNumberPress, 
    numericBuffer, 
    channels, 
    handleSelectChannel, 
    currentChannel, 
    handleToggleFavorite,
    isChannelPanelOpen,
    isSettingsOpen,
    isHealthDashboardOpen,
    isTelegramConsoleOpen,
    isAndroidProjectOpen,
    isInfoBarVisible,
    showRemoteDrawer
  ]);

  // Show subtle controls bar on mouse move, auto-hiding after 3 seconds
  const handleMouseMove = () => {
    setShowControlsBar(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControlsBar(false);
    }, 3000);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen bg-[#0B0D10] text-slate-100 font-sans overflow-hidden select-none"
    >
      {/* 1. Pure Fullscreen TV Player (Zero permanent chrome) */}
      <main className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
        <TVPlayer
          currentChannel={currentChannel}
          onNextChannel={handleNextChannel}
          onPrevChannel={handlePrevChannel}
          onSelectChannelByNumber={(num) => {
            const ch = channels.find(c => c.number === num);
            if (ch) {
              handleSelectChannel(ch);
              return true;
            }
            return false;
          }}
          onToggleFavorite={handleToggleFavorite}
          onAutoBypassChannel={handleAutoBypassChannel}
          aspectRatio={settings.aspectRatio}
          settings={settings}
          volume={volume}
          isMuted={isMuted}
          numericBuffer={numericBuffer}
          isInfoBarVisible={isInfoBarVisible}
          onCloseInfoBar={() => setIsInfoBarVisible(false)}
        />
      </main>

      {/* 2. Loading Playlist Overlay */}
      {isLoadingPlaylist && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-white">প্লেলিস্ট লোড হচ্ছে…</span>
          <span className="text-xs text-slate-400">চ্যানেলসমূহ সাজানো হচ্ছে</span>
        </div>
      )}

      {/* 3. Subtle Auto-Hiding Controls Bar (Visible only when mouse moves, clean on TV) */}
      <div 
        className={`absolute top-4 inset-x-6 z-30 flex items-center justify-between transition-opacity duration-300 ${
          showControlsBar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Quick Access to Channel List & Telegram */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setIsChannelPanelOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition"
            title="চ্যানেল তালিকা (OK বাটন)"
          >
            <Tv className="w-3.5 h-3.5 text-sky-400" />
            <span>চ্যানেল তালিকা</span>
          </button>

          <button
            onClick={() => {
              setSettingsInitialSection('TELEGRAM');
              setIsSettingsOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition"
            title="Telegram Settings (রিমোটের LEFT বাটন)"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram Link</span>
          </button>
        </div>

        {/* Right: Health, Code (.ZIP), About, Settings */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setIsHealthDashboardOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-slate-200 flex items-center gap-1.5 transition"
            title="Channel Health Dashboard"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Health</span>
          </button>

          <button
            onClick={() => setIsAndroidProjectOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow"
            title="Download Android Studio Project (.ZIP)"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android ZIP</span>
          </button>

          <button
            onClick={() => {
              setSettingsInitialSection('ABOUT');
              setIsSettingsOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition border border-rose-500/30"
            title="About StTV (Sazzad Hossen)"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span className="hidden sm:inline">About</span>
          </button>

          <button
            onClick={() => {
              setSettingsInitialSection('PLAYLIST');
              setIsSettingsOpen(true);
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition"
            title="Settings (রিমোটের RIGHT বাটন)"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Toggle Virtual Remote popup for mouse testing */}
          <button
            onClick={() => setShowRemoteDrawer(prev => !prev)}
            className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-[11px] font-mono text-slate-300"
            title="Toggle Virtual Remote (Keyboard D-pad supported)"
          >
            REMOTE
          </button>
        </div>
      </div>

      {/* 4. Sliding Channel Panel Overlay (Left 32%) */}
      <ChannelPanel
        isOpen={isChannelPanelOpen}
        onClose={() => setIsChannelPanelOpen(false)}
        channels={channels}
        currentChannel={currentChannel}
        onSelectChannel={handleSelectChannel}
        onToggleFavorite={handleToggleFavorite}
        recentChannelIds={recentChannelIds}
        failedChannelIds={failedChannelIds}
      />

      {/* 5. Optional Virtual Remote Popup (Never permanently docked on screen) */}
      {showRemoteDrawer && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className="relative">
            <button
              onClick={() => setShowRemoteDrawer(false)}
              className="absolute -top-3 -right-3 z-10 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
            >
              ✕
            </button>
            <VirtualRemote
              onDpadUp={handleNextChannel}
              onDpadDown={handlePrevChannel}
              onDpadLeft={() => {
                setSettingsInitialSection('TELEGRAM');
                setIsSettingsOpen(true);
              }}
              onDpadRight={() => {
                setSettingsInitialSection('PLAYLIST');
                setIsSettingsOpen(true);
              }}
              onDpadOk={() => setIsChannelPanelOpen(prev => !prev)}
              onBack={() => {
                setIsChannelPanelOpen(false);
                setIsSettingsOpen(false);
                setShowRemoteDrawer(false);
              }}
              onMenu={() => {
                setSettingsInitialSection('ABOUT');
                setIsSettingsOpen(true);
              }}
              onNumberPress={handleNumberPress}
              onToggleFavorite={() => currentChannel && handleToggleFavorite(currentChannel.id)}
              onOpenSearch={() => setIsChannelPanelOpen(true)}
              onCycleAspect={handleCycleAspect}
              onToggleInfo={() => setIsInfoBarVisible(prev => !prev)}
              onVolUp={() => setVolume(v => Math.min(1, Math.round((v + 0.05) * 100) / 100))}
              onVolDown={() => setVolume(v => Math.max(0, Math.round((v - 0.05) * 100) / 100))}
              onMute={() => setIsMuted(!isMuted)}
              isMuted={isMuted}
              volume={volume}
            />
          </div>
        </div>
      )}

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSection={settingsInitialSection}
        settings={settings}
        onUpdateSettings={setSettings}
        playlists={playlists}
        activePlaylistId={activePlaylistId}
        onSelectPlaylist={handleSelectPlaylist}
        onAddPlaylist={handleAddPlaylist}
        onEditPlaylist={handleEditPlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onRefreshPlaylist={handleRefreshPlaylist}
        onImportM3uContent={handleImportM3uContent}
        totalChannels={channels.length}
        logs={logs}
        onOpenTelegramConsole={() => {
          setIsSettingsOpen(false);
          setIsTelegramConsoleOpen(true);
        }}
        onOpenHealthDashboard={() => {
          setIsSettingsOpen(false);
          setIsHealthDashboardOpen(true);
        }}
      />

      {/* 7. Health Dashboard Modal */}
      <HealthDashboardModal
        isOpen={isHealthDashboardOpen}
        onClose={() => setIsHealthDashboardOpen(false)}
        channels={channels}
        onUpdateChannelHealth={(id, health) => {
          setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, health } : ch));
        }}
        onPlayChannel={handleSelectChannel}
      />

      {/* 8. Telegram Bot Console Modal */}
      <TelegramBotConsoleModal
        isOpen={isTelegramConsoleOpen}
        onClose={() => setIsTelegramConsoleOpen(false)}
        settings={settings}
        currentChannel={currentChannel}
        channels={channels}
        onSelectChannel={handleSelectChannel}
        onNextChannel={handleNextChannel}
        onPrevChannel={handlePrevChannel}
        onCycleAspect={handleCycleAspect}
        todayWatchSeconds={todayWatchSeconds}
      />

      {/* 9. Android Studio Project Viewer & ZIP Download */}
      <AndroidProjectViewerModal
        isOpen={isAndroidProjectOpen}
        onClose={() => setIsAndroidProjectOpen(false)}
      />
    </div>
  );
}
