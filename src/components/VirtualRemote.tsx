import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Home, 
  Menu, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Tv, 
  Search, 
  Star, 
  Maximize2, 
  Info 
} from 'lucide-react';

interface VirtualRemoteProps {
  onDpadUp: () => void;
  onDpadDown: () => void;
  onDpadLeft: () => void;
  onDpadRight: () => void;
  onDpadOk: () => void;
  onBack: () => void;
  onMenu: () => void;
  onNumberPress: (digit: number) => void;
  onToggleFavorite: () => void;
  onOpenSearch: () => void;
  onCycleAspect: () => void;
  onToggleInfo: () => void;
  onVolUp: () => void;
  onVolDown: () => void;
  onMute: () => void;
  isMuted: boolean;
  volume: number;
}

export const VirtualRemote: React.FC<VirtualRemoteProps> = ({
  onDpadUp,
  onDpadDown,
  onDpadLeft,
  onDpadRight,
  onDpadOk,
  onBack,
  onMenu,
  onNumberPress,
  onToggleFavorite,
  onOpenSearch,
  onCycleAspect,
  onToggleInfo,
  onVolUp,
  onVolDown,
  onMute,
  isMuted,
  volume
}) => {
  return (
    <div className="bg-[#14181D]/95 border border-white/10 rounded-2xl p-4 w-72 shadow-2xl backdrop-blur-md flex flex-col items-center select-none text-slate-200">
      {/* Remote Header / Brand */}
      <div className="flex items-center justify-between w-full pb-3 border-b border-white/5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">TX9 Pro Remote</span>
        </div>
        <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-mono">D-PAD</span>
      </div>

      {/* D-Pad Circular Controller */}
      <div className="relative w-44 h-44 my-2 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#1C2128] to-[#0E1217] border-2 border-white/10 shadow-inner flex items-center justify-center">
          {/* UP Button */}
          <button
            onClick={onDpadUp}
            title="Channel Up / Navigate Up (Arrow Up)"
            className="absolute top-2 left-1/2 -translate-x-1/2 p-2 hover:text-sky-400 active:scale-95 transition-all text-slate-300 focus:outline-none"
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          {/* DOWN Button */}
          <button
            onClick={onDpadDown}
            title="Channel Down / Navigate Down (Arrow Down)"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 p-2 hover:text-sky-400 active:scale-95 transition-all text-slate-300 focus:outline-none"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          {/* LEFT Button */}
          <button
            onClick={onDpadLeft}
            title="Open Channel Panel (Arrow Left)"
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:text-sky-400 active:scale-95 transition-all text-slate-300 focus:outline-none"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* RIGHT Button */}
          <button
            onClick={onDpadRight}
            title="Open Settings (Arrow Right)"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:text-sky-400 active:scale-95 transition-all text-slate-300 focus:outline-none"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* CENTER OK Button */}
          <button
            onClick={onDpadOk}
            title="OK / Select / Toggle Info (Enter)"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-500/30 hover:brightness-110 active:scale-90 transition-all flex items-center justify-center focus:outline-none"
          >
            OK
          </button>
        </div>
      </div>

      {/* Nav Row: Back, Home/Panel, Menu */}
      <div className="grid grid-cols-3 gap-3 w-full my-3 px-2">
        <button
          onClick={onBack}
          title="Back / Close (Esc)"
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white transition"
        >
          <RotateCcw className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium">BACK</span>
        </button>
        <button
          onClick={onDpadLeft}
          title="Channel Panel (Home)"
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white transition"
        >
          <Tv className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium">LIST</span>
        </button>
        <button
          onClick={onMenu}
          title="Settings & Menu (M)"
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white transition"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium">MENU</span>
        </button>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center justify-between w-full bg-white/5 rounded-xl px-3 py-2 mb-3">
        <button
          onClick={onMute}
          title="Mute / Unmute"
          className="p-1 text-slate-400 hover:text-white transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onVolDown}
            className="w-7 h-7 rounded-lg bg-black/40 hover:bg-white/10 text-xs font-bold transition flex items-center justify-center"
          >
            -
          </button>
          <span className="text-xs font-mono w-9 text-center text-slate-300">
            {isMuted ? 'MUT' : `${Math.round(volume * 100)}%`}
          </span>
          <button
            onClick={onVolUp}
            className="w-7 h-7 rounded-lg bg-black/40 hover:bg-white/10 text-xs font-bold transition flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Color Shortcuts: Red, Green, Yellow, Blue */}
      <div className="grid grid-cols-4 gap-2 w-full mb-3">
        <button
          onClick={onToggleFavorite}
          title="Red: Toggle Favorite"
          className="h-7 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white flex items-center justify-center shadow transition active:scale-95"
        >
          <Star className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onOpenSearch}
          title="Green: Open Search"
          className="h-7 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white flex items-center justify-center shadow transition active:scale-95"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onCycleAspect}
          title="Yellow: Aspect Ratio (Fit/Fill/Zoom)"
          className="h-7 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white flex items-center justify-center shadow transition active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleInfo}
          title="Blue: Info Banner"
          className="h-7 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white flex items-center justify-center shadow transition active:scale-95"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 0-9 Numeric Keypad for Channel Numbers */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            onClick={() => onNumberPress(digit)}
            className="py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs font-mono font-semibold text-slate-300 hover:text-white transition active:scale-95"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          onClick={() => onNumberPress(0)}
          className="py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs font-mono font-semibold text-slate-300 hover:text-white transition active:scale-95"
        >
          0
        </button>
        <div />
      </div>

      <div className="mt-3 text-[10px] text-slate-500 text-center font-mono">
        Keyboard: Arrow keys, Enter, Esc, 0-9
      </div>
    </div>
  );
};
