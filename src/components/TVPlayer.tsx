import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  AlertCircle, 
  RefreshCw, 
  Star, 
  Tv, 
  FastForward, 
  WifiOff 
} from 'lucide-react';
import { Channel, AspectRatioMode, AppSettings } from '../types/sttv';

interface TVPlayerProps {
  currentChannel: Channel | null;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  onSelectChannelByNumber: (num: number) => boolean;
  onToggleFavorite: (channelId: string) => void;
  onAutoBypassChannel?: (channelId: string) => void;
  aspectRatio: AspectRatioMode;
  settings: AppSettings;
  volume: number;
  isMuted: boolean;
  numericBuffer: string;
  isInfoBarVisible: boolean;
  onCloseInfoBar: () => void;
}

export const TVPlayer: React.FC<TVPlayerProps> = ({
  currentChannel,
  onNextChannel,
  onPrevChannel,
  onSelectChannelByNumber,
  onToggleFavorite,
  onAutoBypassChannel,
  aspectRatio,
  settings,
  volume,
  isMuted,
  numericBuffer,
  isInfoBarVisible,
  onCloseInfoBar
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isBuffering, setIsBuffering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bypassNotice, setBypassNotice] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadedIdRef = useRef<string | null>(null);

  // Trigger banner on channel switch
  const showBanner = useCallback(() => {
    setBannerVisible(true);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setBannerVisible(false);
    }, 3200);
  }, []);

  // Clear watchdog timer helper
  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  // Handle stream loading & 3.5s Auto-Bypass Watchdog
  useEffect(() => {
    if (!currentChannel || !videoRef.current) return;

    // Avoid reloading if it's the exact same channel ID and URL
    if (lastLoadedIdRef.current === `${currentChannel.id}_${currentChannel.url}`) {
      return;
    }
    lastLoadedIdRef.current = `${currentChannel.id}_${currentChannel.url}`;

    // Reset states and clear previous watchdog
    clearWatchdog();
    setErrorMessage(null);
    setBypassNotice(null);
    setIsBuffering(true);
    showBanner();

    const video = videoRef.current;
    let streamUrl = currentChannel.url;

    // -------------------------------------------------------------
    // 3.5 Second Auto-Bypass Watchdog:
    // If stream data does not start playing within 3.5 seconds,
    // automatically mark channel as bypassed and skip to next channel!
    // -------------------------------------------------------------
    if (settings.autoBypassInactive) {
      watchdogTimerRef.current = setTimeout(() => {
        // Check if stream is actually playing with audio/video data
        if (video.paused || video.currentTime === 0 || video.readyState < 2) {
          console.warn(`[Auto-Bypass] No streaming data received within 3.5s for ${currentChannel.name}. Auto-bypassing...`);
          setBypassNotice(`⚠️ #${currentChannel.number} ${currentChannel.name}-এ স্ট্রিমিং নেই — স্বয়ংক্রিয়ভাবে পরবর্তী সচল চ্যানেলে যাওয়া হচ্ছে…`);
          setIsBuffering(false);
          onAutoBypassChannel?.(currentChannel.id);

          setTimeout(() => {
            setBypassNotice(null);
            onNextChannel();
          }, 900);
        }
      }, 3500);
    }

    // Proxy mixed-content / HTTP streams over HTTPS
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && streamUrl.startsWith('http://')) {
      streamUrl = `/api/proxy-stream?url=${encodeURIComponent(streamUrl)}`;
    }

    // Clean up previous Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream = streamUrl.includes('.m3u8') || streamUrl.includes('hls') || streamUrl.includes('tracks-v1a1');

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 20,
        maxBufferLength: 8,
        manifestLoadingTimeOut: 6000,
        manifestLoadingMaxRetry: 1,
        levelLoadingTimeOut: 6000
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch((e) => console.warn('Autoplay blocked:', e));
        });
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        // Data has arrived successfully, clear watchdog!
        clearWatchdog();
        setIsBuffering(false);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (!streamUrl.startsWith('/api/proxy-stream')) {
                const proxied = `/api/proxy-stream?url=${encodeURIComponent(currentChannel.url)}`;
                streamUrl = proxied;
                hls.loadSource(proxied);
                hls.startLoad();
              } else {
                hls.destroy();
                triggerImmediateBypass('স্ট্রিম বর্তমানে অফলাইন (Stream Offline)');
              }
              break;
            default:
              hls.destroy();
              triggerImmediateBypass('স্ট্রিম ডিকোড করা যায়নি (Media Error)');
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else {
      video.src = streamUrl;
      video.load();
      video.play().catch(() => {
        video.muted = true;
        video.play().catch((e) => console.warn('Video play blocked:', e));
      });
    }

    return () => {
      clearWatchdog();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentChannel?.id, currentChannel?.url, showBanner, clearWatchdog, settings.autoBypassInactive, onAutoBypassChannel, onNextChannel]);

  // Immediate bypass on fatal error
  const triggerImmediateBypass = (msg: string) => {
    clearWatchdog();
    setIsBuffering(false);
    setErrorMessage(msg);

    if (currentChannel && settings.autoBypassInactive) {
      setBypassNotice(`⚠️ #${currentChannel.number} ${currentChannel.name} অফলাইন — পরবর্তী সচল চ্যানেলে যাওয়া হচ্ছে…`);
      onAutoBypassChannel?.(currentChannel.id);
      setTimeout(() => {
        setBypassNotice(null);
        onNextChannel();
      }, 900);
    }
  };

  // Sync volume and mute state
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    videoRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // Determine video fit CSS class
  const getObjectFitClass = () => {
    switch (aspectRatio) {
      case 'FIT':
        return 'object-contain';
      case 'FILL':
        return 'object-fill';
      case 'ZOOM':
        return 'object-cover';
      default:
        return 'object-contain';
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center select-none font-sans">
      {/* 100% Fullscreen Video Player */}
      <video
        ref={videoRef}
        className={`w-full h-full transition-all duration-150 ${getObjectFitClass()}`}
        playsInline
        onWaiting={() => setIsBuffering(true)}
        onTimeUpdate={() => {
          // If video is progressing, data is flowing! Clear watchdog
          if (videoRef.current && videoRef.current.currentTime > 0.2) {
            clearWatchdog();
            setIsBuffering(false);
          }
        }}
        onPlaying={() => {
          clearWatchdog();
          setIsBuffering(false);
          setErrorMessage(null);
          setBypassNotice(null);
        }}
        onError={() => {
          triggerImmediateBypass('স্ট্রিম সংযোগ ব্যর্থ (Playback Error)');
        }}
      />

      {/* Buffering Spinner (Minimalist, Top-Right) */}
      {isBuffering && !bypassNotice && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2.5 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-white shadow-2xl">
          <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">বাফারিং…</span>
        </div>
      )}

      {/* Auto-Bypass Notification Toast (When 3-4s without data or offline) */}
      {bypassNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-amber-950/95 text-amber-200 border border-amber-500/50 px-5 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-pulse">
          <FastForward className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
          <span>{bypassNotice}</span>
        </div>
      )}

      {/* Numeric Channel Entry Overlay (e.g. [ 12 ]) Top-Right */}
      {numericBuffer && (
        <div className="absolute top-6 right-6 z-30 bg-sky-600/95 backdrop-blur-md text-white font-mono font-bold text-2xl px-5 py-2.5 rounded-2xl shadow-2xl border border-white/20 animate-pulse">
          CH {numericBuffer}
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && !bypassNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-rose-950/95 text-rose-100 border border-rose-500/50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => onNextChannel()}
            className="ml-1 px-3 py-1 bg-rose-800 hover:bg-rose-700 rounded-lg text-xs text-white transition flex items-center gap-1 font-semibold"
          >
            পরের চ্যানেল <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Channel Switch Banner (Bottom-Left, 48dp overscan safe, 3.2s auto-fade) */}
      {bannerVisible && currentChannel && (
        <div className="absolute bottom-8 left-8 z-20 max-w-md bg-[#14181D]/90 backdrop-blur-xl border border-white/15 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 animate-fadeIn">
          {/* Logo or Channel Initial */}
          <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {currentChannel.logoUrl ? (
              <img
                src={currentChannel.logoUrl}
                alt={currentChannel.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-sm font-bold text-sky-400 font-mono">
                {currentChannel.number}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold bg-sky-500 text-white px-2 py-0.5 rounded">
                CH {currentChannel.number}
              </span>
              <span className="text-sm font-bold text-white truncate">
                {currentChannel.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-300 font-medium truncate">
                {currentChannel.groupName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                • {aspectRatio} • {currentChannel.isBypassed ? 'Bypassed' : (currentChannel.health?.status || 'HEALTHY')}
              </span>
            </div>
          </div>

          {/* Favorite Indicator */}
          {currentChannel.isFavorite && (
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0 mr-1" />
          )}
        </div>
      )}

      {/* Info Bar Overlay (Triggered by OK or Info key) */}
      {isInfoBarVisible && currentChannel && (
        <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/95 via-black/85 to-transparent p-8 pt-16 flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/20 overflow-hidden flex items-center justify-center">
                {currentChannel.logoUrl ? (
                  <img src={currentChannel.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Tv className="w-7 h-7 text-sky-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white">
                    {currentChannel.number}. {currentChannel.name}
                  </span>
                  <button
                    onClick={() => onToggleFavorite(currentChannel.id)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star className={`w-5 h-5 ${currentChannel.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300 mt-1">
                  <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {currentChannel.groupName}
                  </span>
                  <span>Audio: Stereo AAC</span>
                  <span>Stream: HLS / HTTP</span>
                  <span className="font-mono text-emerald-400">● Live 1080p</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onCloseInfoBar}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
