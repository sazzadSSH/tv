import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Star, AlertCircle, Clock, Tv, Film, Radio } from 'lucide-react';
import { Channel } from '../types/sttv';

interface ChannelPanelProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  currentChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  recentChannelIds: string[];
  failedChannelIds: string[];
}

type TabType = 'ALL' | 'GROUPS' | 'FAVORITES' | 'RECENT' | 'FAILED';

export const ChannelPanel: React.FC<ChannelPanelProps> = ({
  isOpen,
  onClose,
  channels,
  currentChannel,
  onSelectChannel,
  onToggleFavorite,
  recentChannelIds,
  failedChannelIds
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL_GROUPS');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Extract all distinct groups
  const groups = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((ch) => {
      if (ch.groupName) set.add(ch.groupName);
    });
    return Array.from(set).sort();
  }, [channels]);

  // Filter channels based on tab, group, and search query
  const filteredChannels = useMemo(() => {
    let list = [...channels];

    // Tab filter
    if (activeTab === 'FAVORITES') {
      list = list.filter((ch) => ch.isFavorite);
    } else if (activeTab === 'RECENT') {
      list = list.filter((ch) => recentChannelIds.includes(ch.id));
      list.sort((a, b) => recentChannelIds.indexOf(a.id) - recentChannelIds.indexOf(b.id));
    } else if (activeTab === 'FAILED') {
      list = list.filter((ch) => failedChannelIds.includes(ch.id) || ch.health?.status === 'UNAVAILABLE');
    } else if (activeTab === 'GROUPS' && selectedGroup !== 'ALL_GROUPS') {
      list = list.filter((ch) => ch.groupName === selectedGroup);
    }

    // Search query filter (Bangla + English normalized)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          ch.groupName.toLowerCase().includes(q) ||
          ch.number.toString().includes(q)
      );
    }

    return list;
  }, [channels, activeTab, selectedGroup, searchQuery, recentChannelIds, failedChannelIds]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
    }
  }, [isOpen, activeTab, selectedGroup]);

  // Scroll focused element into view
  useEffect(() => {
    if (!isOpen || !listContainerRef.current) return;
    const activeEl = listContainerRef.current.children[focusedIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-full md:w-[420px] max-w-full bg-[#14181D]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col transition-all duration-200">
      {/* Top Header & Search Bar */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">চ্যানেল তালিকা (Channels)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
            title="Close Panel (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="চ্যানেলের নাম বা নম্বর খুঁজুন… (Search)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs: All | Groups | Favorites | Recent | Failed */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          {(
            [
              { key: 'ALL', label: 'সকল (All)' },
              { key: 'GROUPS', label: 'গ্রুপ (Groups)' },
              { key: 'FAVORITES', label: 'ফেভারিট (Fav)' },
              { key: 'RECENT', label: 'সাম্প্রতিক' },
              { key: 'FAILED', label: 'সমস্যাযুক্ত' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.key
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Group Sub-Selector if Groups tab is selected */}
        {activeTab === 'GROUPS' && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedGroup('ALL_GROUPS')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedGroup === 'ALL_GROUPS' ? 'bg-sky-600 text-white' : 'bg-white/5 text-slate-400'
              }`}
            >
              সব গ্রুপ ({channels.length})
            </button>
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                  selectedGroup === grp ? 'bg-sky-600 text-white' : 'bg-white/5 text-slate-400'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Channel Rows List */}
      <div
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1.5 focus:outline-none"
      >
        {filteredChannels.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <AlertCircle className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-sm font-medium">কোনো চ্যানেল মেলেনি</p>
            <p className="text-xs text-slate-500 mt-1">অন্য নাম লিখুন বা ফিল্টার পরিবর্তন করুন</p>
          </div>
        ) : (
          filteredChannels.map((channel, idx) => {
            const isPlaying = currentChannel?.id === channel.id;
            const healthStatus = channel.health?.status || 'UNKNOWN';

            // Health color dot
            let healthColor = 'bg-slate-400';
            if (healthStatus === 'HEALTHY') healthColor = 'bg-emerald-400';
            else if (healthStatus === 'SLOW') healthColor = 'bg-amber-400';
            else if (healthStatus === 'UNAVAILABLE') healthColor = 'bg-rose-500';

            return (
              <div
                key={channel.id}
                onClick={() => {
                  onSelectChannel(channel);
                  onClose();
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 border ${
                  isPlaying
                    ? 'bg-sky-500/20 border-sky-500/50 shadow-md ring-1 ring-sky-500/30'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Channel Number */}
                  <span className="font-mono text-xs font-bold w-7 text-right text-slate-400 group-hover:text-sky-300">
                    {channel.number}
                  </span>

                  {/* Logo or Initial Avatar */}
                  <div className="w-9 h-9 rounded-lg bg-black/40 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                    {channel.logoUrl ? (
                      <img
                        src={channel.logoUrl}
                        alt={channel.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        {channel.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Channel Name & Group */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-100 truncate block group-hover:text-white">
                        {channel.name}
                      </span>
                      {/* Health Dot */}
                      <span
                        className={`w-2 h-2 rounded-full ${healthColor} flex-shrink-0`}
                        title={`Health: ${healthStatus}`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {channel.groupName}
                    </span>
                  </div>
                </div>

                {/* Right Actions: Favorite Toggle */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(channel.id);
                    }}
                    className={`p-1.5 rounded-lg transition ${
                      channel.isFavorite
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={channel.isFavorite ? 'ফেভারিট থেকে সরান' : 'ফেভারিটে যোগ করুন'}
                  >
                    <Star
                      className={`w-4 h-4 ${channel.isFavorite ? 'fill-amber-400' : ''}`}
                    />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between bg-black/20">
        <span>মোট: {filteredChannels.length} চ্যানেল</span>
        <span className="font-mono text-[11px] text-slate-500">OK চাপলে প্লে হবে</span>
      </div>
    </div>
  );
};
