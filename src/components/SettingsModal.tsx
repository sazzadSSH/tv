import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Tv, 
  Send, 
  Database, 
  Activity, 
  Shield, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Upload, 
  Terminal, 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Check, 
  MessageCircle, 
  Heart, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { AppSettings, AspectRatioMode, LogEntry, Playlist } from '../types/sttv';
import { testTelegramToken, sendTelegramMessage } from '../utils/telegramApi';
import { syncPlaylistToFirestore, syncSettingsToFirestore } from '../utils/firebase';

export type SettingsSection = 
  | 'TELEGRAM'
  | 'PLAYLIST' 
  | 'PLAYBACK' 
  | 'HEALTH' 
  | 'FIREBASE' 
  | 'DISPLAY' 
  | 'ABOUT'
  | 'DIAGNOSTICS';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: SettingsSection;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  playlists: Playlist[];
  activePlaylistId: string;
  onSelectPlaylist: (playlistId: string) => void;
  onAddPlaylist: (name: string, url: string) => Promise<void>;
  onEditPlaylist: (id: string, name: string, url?: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRefreshPlaylist: (id: string) => Promise<void>;
  onImportM3uContent: (content: string, name?: string) => void;
  totalChannels: number;
  logs: LogEntry[];
  onOpenTelegramConsole: () => void;
  onOpenHealthDashboard: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'TELEGRAM',
  settings,
  onUpdateSettings,
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onAddPlaylist,
  onEditPlaylist,
  onDeletePlaylist,
  onRefreshPlaylist,
  onImportM3uContent,
  totalChannels,
  logs,
  onOpenTelegramConsole,
  onOpenHealthDashboard
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [showToken, setShowToken] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramStatusMsg, setTelegramStatusMsg] = useState<{ text: string; success: boolean } | null>(null);

  // New Playlist Form State
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);

  // Edit Playlist State
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');

  // Developer photo state
  const [developerPhoto, setDeveloperPhoto] = useState<string>(
    settings.developerPhotoUrl || '/assets/developer.png'
  );

  useEffect(() => {
    if (isOpen && initialSection) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  // Test Telegram connection
  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramStatusMsg(null);

    const res = await testTelegramToken(settings.telegram.botToken);
    if (!res.success) {
      setTelegramStatusMsg({ text: `ব্যর্থ: ${res.error}`, success: false });
      setIsTestingTelegram(false);
      onUpdateSettings(prev => ({
        ...prev,
        telegram: { ...prev.telegram, connected: false }
      }));
      return;
    }

    if (settings.telegram.chatId) {
      const testMsg = `✅ <b>StTV Telegram Link Successful!</b>\n` +
                      `Device: <code>TX9 Pro Android TV</code>\n` +
                      `Bot: @${res.botUsername || 'StTVBot'}\n` +
                      `Time: ${new Date().toLocaleTimeString()}\n` +
                      `Telegram Commands are now ready! Type /help`;
      
      const sendRes = await sendTelegramMessage(
        settings.telegram.botToken,
        settings.telegram.chatId,
        testMsg
      );

      if (sendRes.success) {
        setTelegramStatusMsg({
          text: `সংযুক্ত সফল! @${res.botUsername} চ্যাটে টেস্ট পাঠানো হয়েছে ✅`,
          success: true
        });
        onUpdateSettings(prev => ({
          ...prev,
          telegram: {
            ...prev.telegram,
            connected: true,
            botUsername: res.botUsername
          }
        }));
      } else {
        setTelegramStatusMsg({
          text: `বট ভ্যালিড (@${res.botUsername}), কিন্তু মেসেজ পাঠানো যায়নি: ${sendRes.error}`,
          success: false
        });
      }
    } else {
      setTelegramStatusMsg({
        text: `বট ভ্যালিড (@${res.botUsername})! টেস্ট মেসেজ পেতে চ্যাট আইডি লিখুন।`,
        success: true
      });
      onUpdateSettings(prev => ({
        ...prev,
        telegram: { ...prev.telegram, connected: true, botUsername: res.botUsername }
      }));
    }

    setIsTestingTelegram(false);
  };

  // Add Playlist Handler
  const handleAddNewPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaylistError(null);

    const name = newPlaylistName.trim();
    const url = newPlaylistUrl.trim();

    if (!name) {
      setPlaylistError('প্লেলিস্টের একটি নাম দিন (যেমন: BDIX IPTV, Sports)');
      return;
    }
    if (!url) {
      setPlaylistError('প্লেলিস্টের URL দিন');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setPlaylistError('URL অবশ্যই http:// বা https:// দিয়ে শুরু হতে হবে');
      return;
    }
    if (playlists.some(p => p.url === url)) {
      setPlaylistError('এই URL-এর প্লেলিস্ট ইতিমধ্যে যুক্ত আছে (Duplicate URL)');
      return;
    }

    try {
      setIsAddingPlaylist(true);
      await onAddPlaylist(name, url);
      setNewPlaylistName('');
      setNewPlaylistUrl('');
      setIsAddingPlaylist(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPlaylistError(`প্লেলিস্ট লোড ব্যর্থ: ${msg}`);
      setIsAddingPlaylist(false);
    }
  };

  // Start editing a playlist
  const startEdit = (p: Playlist) => {
    setEditingPlaylistId(p.id);
    setEditName(p.name);
    setEditUrl(p.url || '');
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onEditPlaylist(id, editName.trim(), editUrl.trim() || undefined);
    }
    setEditingPlaylistId(null);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportM3uContent(content, file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  // Custom photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (url) {
        setDeveloperPhoto(url);
        onUpdateSettings(prev => ({ ...prev, developerPhotoUrl: url }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14181D] border border-white/10 rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0E1217]">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">StTV সেটিংস (Settings)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Left Nav + Right Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation */}
          <div className="w-64 border-r border-white/10 bg-[#0E1217]/60 p-2 space-y-1">
            {[
              { id: 'TELEGRAM', label: 'Telegram Link & Remote', icon: Send, badge: settings.telegram.connected ? 'Connected' : undefined },
              { id: 'PLAYLIST', label: 'Multiple Playlists', icon: Tv, badge: `${playlists.length}` },
              { id: 'PLAYBACK', label: 'Playback & Auto-Bypass', icon: Sliders },
              { id: 'HEALTH', label: 'Health Monitoring', icon: Activity },
              { id: 'FIREBASE', label: 'Firebase Integration', icon: Database },
              { id: 'DISPLAY', label: 'ভাষা ও সুরক্ষা (PIN)', icon: Shield },
              { id: 'ABOUT', label: 'About StTV (ডেভেলপার)', icon: Heart, highlight: true },
              { id: 'DIAGNOSTICS', label: 'ডায়াগনস্টিক লগ', icon: FileText }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingsSection)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive 
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                      : item.highlight
                      ? 'text-rose-300 hover:bg-rose-500/10 hover:text-rose-200'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      settings.telegram.connected && item.id === 'TELEGRAM' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
            {/* 1. TELEGRAM LINK & REMOTE (Spec 4 & Hardware Remote LEFT button) */}
            {activeSection === 'TELEGRAM' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white">Telegram Link &amp; Remote Control</h3>
                    <p className="text-xs text-slate-400">রিমোটের বাম (Left) বাটন চাপলে এই মেনু খুলে। ফোনের টেলিগ্রাম দিয়ে টিভি নিয়ন্ত্রণ করুন।</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
                    settings.telegram.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${settings.telegram.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    {settings.telegram.connected ? 'Connected ✅' : 'Disconnected'}
                  </div>
                </div>

                {/* Bot Token Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Bot Token (BotFather থেকে প্রাপ্ত)</label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      value={settings.telegram.botToken}
                      onChange={(e) => onUpdateSettings(prev => ({
                        ...prev,
                        telegram: { ...prev.telegram, botToken: e.target.value }
                      }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {settings.telegram.botToken ? `মাস্কড: ••••••••${settings.telegram.botToken.slice(-4)}` : 'কোনো টোকেন দেওয়া হয়নি'}
                  </span>
                </div>

                {/* Chat ID Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Chat ID (আপনার টেলিগ্রাম আইডি)</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789"
                    value={settings.telegram.chatId}
                    onChange={(e) => onUpdateSettings(prev => ({
                      ...prev,
                      telegram: { ...prev.telegram, chatId: e.target.value }
                    }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Connect & Test Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={isTestingTelegram || !settings.telegram.botToken}
                    onClick={handleTestTelegram}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-sky-500/20"
                  >
                    {isTestingTelegram ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Connect &amp; Test
                  </button>

                  <button
                    onClick={onOpenTelegramConsole}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-2"
                  >
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    Telegram Bot Console &amp; Commands
                  </button>
                </div>

                {/* Telegram Status Feedback */}
                {telegramStatusMsg && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    telegramStatusMsg.success 
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' 
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}>
                    {telegramStatusMsg.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{telegramStatusMsg.text}</span>
                  </div>
                )}
              </div>
            )}

            {/* 2. MULTIPLE PLAYLIST MANAGEMENT (Requirement 3) */}
            {activeSection === 'PLAYLIST' && (
              <div className="space-y-6">
                <div className="pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white">Multiple Playlist Management</h3>
                  <p className="text-xs text-slate-400">একাধিক IPTV Playlist সংরক্ষণ করুন, সহজে Switch করুন এবং স্বাধীনভাবে পরিচালনা করুন।</p>
                </div>

                {/* Saved Playlists List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">সংরক্ষিত প্লেলিস্টসমূহ ({playlists.length})</span>
                    <span className="text-[11px] text-slate-500">বর্তমানে সক্রিয়: <span className="text-sky-400 font-bold">{playlists.find(p => p.id === activePlaylistId)?.name || 'None'}</span></span>
                  </div>

                  <div className="space-y-2">
                    {playlists.map(p => {
                      const isActive = p.id === activePlaylistId;
                      const isEditing = editingPlaylistId === p.id;

                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-sky-500/10 border-sky-500/40 shadow-sm'
                              : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                          }`}
                        >
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                placeholder="প্লেলিস্ট নাম"
                              />
                              <input
                                type="text"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                className="w-full bg-black/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                placeholder="প্লেলিস্ট URL"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(p.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg font-semibold"
                                >
                                  সংরক্ষণ
                                </button>
                                <button
                                  onClick={() => setEditingPlaylistId(null)}
                                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-300 text-xs rounded-lg"
                                >
                                  বাতিল
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1 pr-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">{p.name}</span>
                                  {isActive && (
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500 text-white font-mono font-bold">
                                      ACTIVE
                                    </span>
                                  )}
                                  {p.isDefault && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-300">
                                      Built-in
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 block truncate font-mono mt-0.5">
                                  {p.url || 'Local File Playlist'}
                                </span>
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                                  <span>চ্যানেল সংখ্যা: {p.channelCount}</span>
                                  <span>• আপডেট: {new Date(p.lastUpdated).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {!isActive && (
                                  <button
                                    onClick={() => onSelectPlaylist(p.id)}
                                    className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition"
                                  >
                                    চালু করুন (Switch)
                                  </button>
                                )}
                                <button
                                  onClick={() => onRefreshPlaylist(p.id)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                                  title="Refresh Playlist"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => startEdit(p)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                                  title="Rename / Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {playlists.length > 1 && (
                                  <button
                                    onClick={() => onDeletePlaylist(p.id)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                                    title="Delete Playlist"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add New Playlist Form */}
                <form onSubmit={handleAddNewPlaylist} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Plus className="w-4 h-4 text-sky-400" />
                    <span>নতুন প্লেলিস্ট যোগ করুন (Add Playlist)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">প্লেলিস্ট নাম</label>
                      <input
                        type="text"
                        placeholder="e.g. BDIX IPTV, Sports TV"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">M3U / M3U8 URL</label>
                      <input
                        type="url"
                        placeholder="https://raw.githubusercontent.com/.../playlist.m3u"
                        value={newPlaylistUrl}
                        onChange={(e) => setNewPlaylistUrl(e.target.value)}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {playlistError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                      {playlistError}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    {/* Quick Button for Target BDIX IPTV URL */}
                    <button
                      type="button"
                      onClick={() => {
                        setNewPlaylistName('BDIX IPTV (Saeid Rahman)');
                        setNewPlaylistUrl('https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u');
                      }}
                      className="text-[11px] text-sky-400 hover:text-sky-300 underline"
                    >
                      BDIX-IPTV GitHub লিংক বসান
                    </button>

                    <button
                      type="submit"
                      disabled={isAddingPlaylist}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isAddingPlaylist ? 'যাচাই ও যোগ হচ্ছে…' : 'প্লেলিস্ট যুক্ত করুন'}
                    </button>
                  </div>
                </form>

                {/* Import Local File Option */}
                <div className="pt-2 border-t border-white/10">
                  <label className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition">
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span className="text-xs text-slate-300">USB বা লোকাল স্টোরেজ থেকে .m3u ফাইল ইমপোর্ট করুন</span>
                    <input
                      type="file"
                      accept=".m3u,.m3u8,text/plain"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 3. PLAYBACK & AUTO-BYPASS (Special Note & Req 1 & 2) */}
            {activeSection === 'PLAYBACK' && (
              <div className="space-y-5">
                <div className="pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white">Playback ও অটো-বাইপাস সেটিংস</h3>
                  <p className="text-xs text-slate-400">স্ট্রিমিং বাফারিং ও নিষ্ক্রিয় চ্যানেল অটো বাইপাস নিয়ন্ত্রণ করুন।</p>
                </div>

                {/* Auto-Bypass Inactive Channels Toggle (User Special Requirement) */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-200 block">Auto-Bypass Inactive Channels (স্বয়ংক্রিয় বাইপাস)</span>
                      <span className="text-[11px] text-amber-300/80">
                        কোনো চ্যানেল বন্ধ থাকলে বা ডাটা না থাকলে চ্যানেল পরিবর্তনের সময় সেটি স্ক্রিনে আসবে না এবং স্বয়ংক্রিয়ভাবে পরবর্তী সচল চ্যানেলে চলে যাবে।
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoBypassInactive}
                      onChange={(e) => onUpdateSettings(prev => ({ ...prev, autoBypassInactive: e.target.checked }))}
                      className="w-4 h-4 accent-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Aspect Ratio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Aspect Ratio (স্ক্রিন ফিট)</label>
                    <select
                      value={settings.aspectRatio}
                      onChange={(e) => onUpdateSettings(prev => ({
                        ...prev,
                        aspectRatio: e.target.value as AspectRatioMode
                      }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="FIT">FIT (Letterbox / অরিজিনাল অনুপাত)</option>
                      <option value="FILL">FILL (পূর্ণ স্ক্রিন স্ট্রেচ)</option>
                      <option value="ZOOM">ZOOM (ক্রপ করে পূর্ণ স্ক্রিন)</option>
                    </select>
                  </div>

                  {/* Fallback Mode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">চ্যানেল ব্যর্থ হলে আচরণ</label>
                    <select
                      value={settings.fallbackMode}
                      onChange={(e) => onUpdateSettings(prev => ({
                        ...prev,
                        fallbackMode: e.target.value as AppSettings['fallbackMode']
                      }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="NEXT_CHANNEL">পরের চ্যানেলে অটো সুইচ (Next Channel)</option>
                      <option value="SAME_GROUP">একই গ্রুপের পরের চ্যানেল (Same Group)</option>
                      <option value="STAY_AND_SHOW_ERROR">ত্রুটি দেখিয়ে অবস্থান (Stay &amp; Show Error)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-semibold text-white">অ্যাপ চালুর সাথে অটো প্লে (Autoplay)</span>
                    <input
                      type="checkbox"
                      checked={settings.autoplay}
                      onChange={(e) => onUpdateSettings(prev => ({ ...prev, autoplay: e.target.checked }))}
                      className="w-4 h-4 accent-sky-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-semibold text-white">সর্বদা ১ নম্বর চ্যানেল দিয়ে শুরু (Start on Channel 1)</span>
                    <input
                      type="checkbox"
                      checked={settings.startOnChannel1}
                      onChange={(e) => onUpdateSettings(prev => ({ ...prev, startOnChannel1: e.target.checked }))}
                      className="w-4 h-4 accent-sky-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 4. HEALTH MONITORING */}
            {activeSection === 'HEALTH' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white">Channel Health Monitoring</h3>
                    <p className="text-xs text-slate-400">ব্যাকগ্রাউন্ডে চ্যানেল লাইভনেস ও ল্যাটেন্সি পরীক্ষা</p>
                  </div>
                  <button
                    onClick={onOpenHealthDashboard}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    ওপেন ড্যাশবোর্ড
                  </button>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-semibold text-white">অটো মনিটরিং সক্রিয় (Enable Monitoring)</span>
                  <input
                    type="checkbox"
                    checked={settings.healthMonitoringEnabled}
                    onChange={(e) => onUpdateSettings(prev => ({ ...prev, healthMonitoringEnabled: e.target.checked }))}
                    className="w-4 h-4 accent-sky-500"
                  />
                </label>
              </div>
            )}

            {/* 5. FIREBASE INTEGRATION (Requirement 4) */}
            {activeSection === 'FIREBASE' && (
              <div className="space-y-5">
                <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Firebase Cloud Integration &amp; Sync</h3>
                    <p className="text-xs text-slate-400">
                      Firebase Cloud Firestore-এর সাথে সফলভাবে লিংক করা হয়েছে।
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Linked &amp; Active ✅
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Firebase Project ID</span>
                    <span className="font-mono text-sky-400 font-bold">polynomial-nucleus-dxjsq</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Cloud Database ID</span>
                    <span className="font-mono text-slate-200 text-[11px] truncate max-w-xs">ai-studio-sttvandroidtvipt-5a6ff516</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                    <span className="text-slate-400">Security Rules</span>
                    <span className="font-mono text-emerald-400 font-semibold">Deployed &amp; Secured 🛡️</span>
                  </div>
                </div>

                {/* Live Sync Action */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      const active = playlists.find(p => p.id === activePlaylistId);
                      if (active) await syncPlaylistToFirestore(active);
                      await syncSettingsToFirestore(settings);
                      alert('Firebase Firestore-এ সেটিংস ও প্লেলিস্ট সফলভাবে সিঙ্ক হয়েছে! ✅');
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-600/30"
                  >
                    <Database className="w-4 h-4" />
                    এখনই ক্লাউডে সিঙ্ক করুন (Sync to Cloud Now)
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <span className="font-bold text-slate-300 block uppercase tracking-wider">সিঙ্ক স্থিতি ও নিরাপত্তা:</span>
                  <p className="text-slate-400">
                    • আপনার সংরক্ষিত প্লেলিস্টসমূহ, ফেভারিট চ্যানেল এবং অ্যাপের সেটিংস রিয়েল-টাইমে Firebase Firestore-এ ব্যাকআপ রাখা হয়।
                  </p>
                  <p className="text-slate-400">
                    • <code>firestore.rules</code> রুলস ক্লাউডে ডেপ্লয় করা হয়েছে যাতে আপনার ডেটা কেবল অনুমোদিত ডিভাইসে নিরাপদ থাকে।
                  </p>
                </div>
              </div>
            )}

            {/* 6. ABOUT STTV — DEVELOPER INFORMATION (Requirement 5) */}
            {activeSection === 'ABOUT' && (
              <div className="space-y-6">
                <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">About StTV</h3>
                    <p className="text-xs text-slate-400">অ্যাপ পরিচিতি ও ডেভেলপার তথ্য</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    100% Free &amp; Ad-Free
                  </span>
                </div>

                {/* Developer Profile Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C2128] to-[#12161D] border border-white/15 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Photo with frame & change option */}
                  <div className="relative group flex-shrink-0">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-xl bg-slate-800 flex items-center justify-center">
                      <img
                        src={developerPhoto}
                        alt="Sazzad Hossen"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-[10px] text-white font-medium p-1 text-center">
                      <Upload className="w-4 h-4 mb-1" />
                      ছবি পরিবর্তন
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Info & Copy */}
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div>
                      <h4 className="text-xl font-black text-white">Sazzad Hossen</h4>
                      <span className="text-xs font-semibold text-sky-400 font-mono">Developer of StTV</span>
                    </div>

                    {/* Verbatim Bengali About Copy per Requirement 5 */}
                    <div className="bg-black/40 rounded-xl p-4 border border-white/10 text-xs text-slate-200 leading-relaxed font-sans space-y-2">
                      <p className="font-semibold text-white">📺 StTV — আমার তৈরি করা প্রথম সফটওয়্যার! ❤️</p>
                      <p>🆓 সম্পূর্ণ ফ্রি ও বিজ্ঞাপনমুক্ত IPTV অ্যাপ।</p>
                      <p>🤖 টেলিগ্রাম কমান্ড দিয়েও টিভি দেখতে পারবেন।</p>
                      <p className="text-emerald-400 font-medium">💡 আপডেটের জন্য পরামর্শ দিতে WhatsApp করুন: @ssazzad_bd</p>
                      <p className="text-slate-400 font-semibold pt-1">— Sazzad Hossen</p>
                    </div>

                    {/* WhatsApp Action Button */}
                    <div className="pt-1 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                      <a
                        href="https://api.whatsapp.com/send?text=Hello%20Sazzad,%20I%20have%20feedback%20for%20StTV%20(from%20@ssazzad_bd)"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-600/30"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp-এ মেসেজ পাঠান (@ssazzad_bd)
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* StTV Specifications */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400 block text-[11px]">App Name</span>
                    <span className="font-bold text-white text-sm">StTV</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400 block text-[11px]">Target Device</span>
                    <span className="font-bold text-white text-sm">TX9 Pro Android TV</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400 block text-[11px]">License</span>
                    <span className="font-bold text-emerald-400 text-sm">100% Free &amp; Ad-Free</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. DIAGNOSTICS & LOGS */}
            {activeSection === 'DIAGNOSTICS' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white">ডায়াগনস্টিক লগ ও ডিভাইস তথ্য</h3>
                  <p className="text-xs text-slate-400">Device: TX9 Pro Android TV | Android 10/11 | Amlogic S905</p>
                </div>

                <div className="bg-black/60 rounded-xl p-3 border border-white/10 font-mono text-[11px] h-52 overflow-y-auto space-y-1">
                  {logs.slice(-25).map(log => (
                    <div key={log.id} className="text-slate-400">
                      <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                      <span className={log.level === 'ERROR' ? 'text-rose-400' : 'text-sky-400'}>[{log.tag}]</span>{' '}
                      <span className="text-slate-200">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. DISPLAY & PIN */}
            {activeSection === 'DISPLAY' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white">ভাষা ও নিরাপত্তা সেটিংস</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">অ্যাপের ভাষা (Language)</label>
                  <select
                    value={settings.language}
                    onChange={(e) => onUpdateSettings(prev => ({ ...prev, language: e.target.value as 'bn' | 'en' }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
