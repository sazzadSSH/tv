import { Channel } from '../types/sttv';

export const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'ch_1',
    number: 1,
    name: 'BTV National (বিটিভি)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    groupName: 'Bangla National',
    logoUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=100&h=100&fit=crop&q=80',
    tvgId: 'BTV.bd',
    isFavorite: true,
    health: { status: 'HEALTHY', latencyMs: 142, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_2',
    number: 2,
    name: 'Somoy TV (সময় টিভি)',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    groupName: 'Bangla News',
    logoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=100&h=100&fit=crop&q=80',
    tvgId: 'Somoy.bd',
    isFavorite: true,
    health: { status: 'HEALTHY', latencyMs: 185, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_3',
    number: 3,
    name: 'Jamuna TV (যমুনা টিভি)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    groupName: 'Bangla News',
    logoUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&h=100&fit=crop&q=80',
    tvgId: 'Jamuna.bd',
    isFavorite: false,
    health: { status: 'HEALTHY', latencyMs: 210, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_4',
    number: 4,
    name: 'Channel 24 (চ্যানেল ২৪)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    groupName: 'Bangla News',
    logoUrl: 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=100&h=100&fit=crop&q=80',
    tvgId: 'Channel24.bd',
    isFavorite: false,
    health: { status: 'HEALTHY', latencyMs: 160, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_5',
    number: 5,
    name: 'T Sports (টি স্পোর্টস)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    groupName: 'Sports Live',
    logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&h=100&fit=crop&q=80',
    tvgId: 'TSports.bd',
    isFavorite: true,
    health: { status: 'HEALTHY', latencyMs: 175, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_6',
    number: 6,
    name: 'Gazi TV / GTV (জিটিভি)',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    groupName: 'Entertainment',
    logoUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=100&h=100&fit=crop&q=80',
    tvgId: 'GTV.bd',
    isFavorite: false,
    health: { status: 'SLOW', latencyMs: 980, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_7',
    number: 7,
    name: 'Maasranga TV (মাছরাঙা)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    groupName: 'Entertainment',
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&h=100&fit=crop&q=80',
    tvgId: 'Maasranga.bd',
    isFavorite: false,
    health: { status: 'HEALTHY', latencyMs: 230, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_8',
    number: 8,
    name: 'BBC World News HD',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    groupName: 'International News',
    logoUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=100&h=100&fit=crop&q=80',
    tvgId: 'BBCNews.uk',
    isFavorite: true,
    health: { status: 'HEALTHY', latencyMs: 120, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_9',
    number: 9,
    name: 'Al Jazeera English HD',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    groupName: 'International News',
    logoUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=100&h=100&fit=crop&q=80',
    tvgId: 'AlJazeera.qa',
    isFavorite: false,
    health: { status: 'HEALTHY', latencyMs: 140, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_10',
    number: 10,
    name: 'France 24 English',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    groupName: 'International News',
    logoUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=100&h=100&fit=crop&q=80',
    tvgId: 'France24.fr',
    isFavorite: false,
    health: { status: 'HEALTHY', latencyMs: 250, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_11',
    number: 11,
    name: 'Discovery Planet HD',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    groupName: 'Documentary & Nature',
    logoUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=100&h=100&fit=crop&q=80',
    tvgId: 'Discovery.doc',
    isFavorite: false,
    health: { status: 'HEALTHY', latencyMs: 190, consecutiveFailures: 0, httpCode: 200 }
  },
  {
    id: 'ch_12',
    number: 12,
    name: 'Expired Test Stream 403',
    url: 'https://invalid-iptv-server.example.com/expired_stream.m3u8',
    groupName: 'Diagnostics',
    logoUrl: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=100&h=100&fit=crop&q=80',
    tvgId: 'Down403.diag',
    isFavorite: false,
    health: { status: 'UNAVAILABLE', latencyMs: 4000, consecutiveFailures: 3, httpCode: 403, errorType: 'HTTP 403 Forbidden' }
  }
];

export const RAW_SAMPLE_M3U = `#EXTM3U
#EXTINF:-1 tvg-id="BTV.bd" tvg-name="BTV" tvg-logo="https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=100&h=100&fit=crop&q=80" group-title="Bangla National",BTV National (বিটিভি)
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8

#EXTINF:-1 tvg-id="Somoy.bd" tvg-name="Somoy TV" tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=100&h=100&fit=crop&q=80" group-title="Bangla News",Somoy TV (সময় টিভি)
https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8

#EXTINF:-1 tvg-id="Jamuna.bd" tvg-name="Jamuna TV" tvg-logo="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&h=100&fit=crop&q=80" group-title="Bangla News",Jamuna TV (যমুনা টিভি)
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

#EXTINF:-1 tvg-id="TSports.bd" tvg-name="T Sports" tvg-logo="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&h=100&fit=crop&q=80" group-title="Sports Live",T Sports (টি স্পোর্টস)
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4

#EXTINF:-1 tvg-id="BBCNews.uk" tvg-name="BBC News" tvg-logo="https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=100&h=100&fit=crop&q=80" group-title="International News",BBC World News HD
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
`;
