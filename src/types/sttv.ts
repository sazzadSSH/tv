export type HealthStatus = 'HEALTHY' | 'SLOW' | 'UNAVAILABLE' | 'UNKNOWN';

export interface Channel {
  id: string;
  number: number;
  name: string;
  url: string;
  groupName: string;
  logoUrl?: string;
  tvgId?: string;
  isFavorite?: boolean;
  isHidden?: boolean;
  isBypassed?: boolean; // When temporarily inactive or stream unavailable
  headers?: Record<string, string>; // e.g. User-Agent or Referrer
  health?: {
    status: HealthStatus;
    httpCode?: number;
    latencyMs?: number;
    lastChecked?: number;
    lastSuccess?: number;
    lastFailure?: number;
    consecutiveFailures: number;
    errorType?: string;
  };
}

export interface Playlist {
  id: string;
  name: string;
  url?: string;
  channelCount: number;
  lastUpdated: number;
  isDefault?: boolean;
  channels?: Channel[];
}

export interface WatchSession {
  id: string;
  channelId: string;
  channelName: string;
  channelNumber: number;
  startAt: number;
  endAt?: number;
  durationSeconds: number;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  allowedChatIds: string[];
  cooldownMin: number;
  minFailures: number;
  dailySummary: boolean;
  dailyTime: string;
  launchMsg: boolean;
  startupScanReport: boolean;
  watchReport: boolean;
  commandsEnabled: boolean;
  requirePinForSensitive: boolean;
  connected: boolean;
  botUsername?: string;
}

export type AspectRatioMode = 'FIT' | 'FILL' | 'ZOOM';

export interface AppSettings {
  language: 'bn' | 'en';
  autoplay: boolean;
  startOnChannel1: boolean;
  restoreLast: boolean;
  lastChannelId: string | null;
  reverseUpDown: boolean;
  aspectRatio: AspectRatioMode;
  bufferMinMs: number;
  bufferMaxMs: number;
  maxRetries: number;
  backoffBaseMs: number;
  fallbackMode: 'NEXT_CHANNEL' | 'SAME_GROUP' | 'STAY_AND_SHOW_ERROR';
  autoBypassInactive: boolean; // Auto-skip temporary inactive channels
  
  // Health
  healthMonitoringEnabled: boolean;
  scanIntervalMin: number;
  maxConcurrent: number;
  slowThresholdMs: number;
  failureThreshold: number;
  
  // Telegram
  telegram: TelegramConfig;
  
  // Firebase
  firebaseSyncEnabled: boolean;
  firebaseConnected: boolean;
  firebaseUserId: string;
  
  // Parental PIN
  parentalPinEnabled: boolean;
  parentalPin: string; // 4 digits
  
  // Display & Performance
  reduceMotion: boolean;
  textScale: 'NORMAL' | 'LARGE' | 'EXTRA_LARGE';
  developerPhotoUrl?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  tag: string;
  message: string;
}
