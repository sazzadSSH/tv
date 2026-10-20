import React, { useState } from 'react';
import { X, Activity, Play, RefreshCw, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { Channel, HealthStatus } from '../types/sttv';
import { probeChannel } from '../utils/healthScanner';

interface HealthDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onUpdateChannelHealth: (channelId: string, health: NonNullable<Channel['health']>) => void;
  onPlayChannel: (channel: Channel) => void;
}

export const HealthDashboardModal: React.FC<HealthDashboardModalProps> = ({
  isOpen,
  onClose,
  channels,
  onUpdateChannelHealth,
  onPlayChannel
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [activeFilter, setActiveFilter] = useState<'ALL' | HealthStatus>('ALL');

  if (!isOpen) return null;

  // Counts
  const healthyCount = channels.filter(c => c.health?.status === 'HEALTHY').length;
  const slowCount = channels.filter(c => c.health?.status === 'SLOW').length;
  const unavailableCount = channels.filter(c => c.health?.status === 'UNAVAILABLE').length;
  const unknownCount = channels.filter(c => !c.health || c.health.status === 'UNKNOWN').length;

  const handleRunFullScan = async () => {
    setIsScanning(true);
    setScanProgress({ current: 0, total: channels.length });

    for (let i = 0; i < channels.length; i++) {
      const ch = channels[i];
      setScanProgress({ current: i + 1, total: channels.length });

      const result = await probeChannel(ch);
      onUpdateChannelHealth(ch.id, {
        status: result.status,
        httpCode: result.httpCode,
        latencyMs: result.latencyMs,
        consecutiveFailures: result.status === 'UNAVAILABLE' ? (ch.health?.consecutiveFailures || 0) + 1 : 0,
        lastChecked: Date.now(),
        errorType: result.errorType
      });
    }

    setIsScanning(false);
  };

  const filteredChannels = channels.filter(ch => {
    if (activeFilter === 'ALL') return true;
    return ch.health?.status === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14181D] border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0E1217]">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Channel Health Dashboard</h2>
              <p className="text-xs text-slate-400">লাইভ চ্যানেল ল্যাটেন্সি ও স্ট্রিম হেলথ পরীক্ষা</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunFullScan}
              disabled={isScanning}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? `স্ক্যান হচ্ছে (${scanProgress.current}/${scanProgress.total})` : 'সব চ্যানেল স্ক্যান করুন'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-white/10 bg-black/20">
          <div
            onClick={() => setActiveFilter('HEALTHY')}
            className={`p-3 rounded-xl border cursor-pointer transition ${
              activeFilter === 'HEALTHY' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Healthy</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{healthyCount}</div>
          </div>

          <div
            onClick={() => setActiveFilter('SLOW')}
            className={`p-3 rounded-xl border cursor-pointer transition ${
              activeFilter === 'SLOW' ? 'bg-amber-500/10 border-amber-500/50' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>Slow (&gt;800ms)</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{slowCount}</div>
          </div>

          <div
            onClick={() => setActiveFilter('UNAVAILABLE')}
            className={`p-3 rounded-xl border cursor-pointer transition ${
              activeFilter === 'UNAVAILABLE' ? 'bg-rose-500/10 border-rose-500/50' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-rose-400 font-medium">
              <XCircle className="w-4 h-4" />
              <span>Unavailable</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{unavailableCount}</div>
          </div>

          <div
            onClick={() => setActiveFilter('UNKNOWN')}
            className={`p-3 rounded-xl border cursor-pointer transition ${
              activeFilter === 'UNKNOWN' ? 'bg-slate-500/10 border-slate-400/50' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <HelpCircle className="w-4 h-4" />
              <span>Unknown</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{unknownCount}</div>
          </div>
        </div>

        {/* Channels Health Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredChannels.map(ch => {
            const health = ch.health;
            const status = health?.status || 'UNKNOWN';

            let badgeClass = 'bg-slate-800 text-slate-300';
            if (status === 'HEALTHY') badgeClass = 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-300';
            if (status === 'SLOW') badgeClass = 'bg-amber-950/70 border border-amber-500/30 text-amber-300';
            if (status === 'UNAVAILABLE') badgeClass = 'bg-rose-950/70 border border-rose-500/30 text-rose-300';

            return (
              <div
                key={ch.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-slate-400 w-6 text-right font-bold">#{ch.number}</span>
                  <div className="min-w-0">
                    <span className="font-semibold text-white truncate block">{ch.name}</span>
                    <span className="text-[11px] text-slate-400 truncate block">{ch.groupName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono text-slate-300 block">
                      {health?.latencyMs !== undefined ? `${health.latencyMs} ms` : '—'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      HTTP {health?.httpCode || '—'}
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase tracking-wider ${badgeClass}`}>
                    {status}
                  </span>

                  <button
                    onClick={() => {
                      onPlayChannel(ch);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition"
                    title="Play Channel"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
