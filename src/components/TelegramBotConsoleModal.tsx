import React, { useState } from 'react';
import { X, Send, Terminal, Bot, User, CornerDownLeft, Sparkles } from 'lucide-react';
import { Channel, AppSettings } from '../types/sttv';

interface TelegramBotConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  currentChannel: Channel | null;
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  onCycleAspect: () => void;
  todayWatchSeconds: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const TelegramBotConsoleModal: React.FC<TelegramBotConsoleModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentChannel,
  channels,
  onSelectChannel,
  onNextChannel,
  onPrevChannel,
  onCycleAspect,
  todayWatchSeconds
}) => {
  const [inputCommand, setInputCommand] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `🤖 <b>StTV Telegram Bot Emulator</b>\n` +
            `সংযুক্ত বট: <code>${settings.telegram.botUsername ? '@' + settings.telegram.botUsername : '@StTvRemoteBot'}</code>\n` +
            `কমান্ড তালিকা দেখতে <code>/help</code> পাঠান।`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  if (!isOpen) return null;

  const handleSendCommand = (cmdText?: string) => {
    const raw = cmdText !== undefined ? cmdText : inputCommand;
    const text = raw.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const parts = text.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    let reply = '';

    switch (cmd) {
      case '/help':
      case '/start':
        reply = `📺 <b>StTV Telegram Remote Menu:</b>\n` +
                `/status - বর্তমান অবস্থা ও চ্যানেল\n` +
                `/now - এখন কী চলছে\n` +
                `/channel &lt;num&gt; - নির্দিষ্ট নম্বরে চ্যানেল পরিবর্তন\n` +
                `/next - পরের চ্যানেল\n` +
                `/prev - আগের চ্যানেল\n` +
                `/search &lt;name&gt; - চ্যানেল সন্ধান\n` +
                `/aspect - Aspect ratio পরিবর্তন\n` +
                `/watchtime - আজকের দেখার মোট সময়\n` +
                `/report - চ্যানেল স্বাস্থ্য সারাংশ`;
        break;

      case '/status':
      case '/now':
        if (currentChannel) {
          reply = `📺 <b>এখন চলছে:</b> #${currentChannel.number} <b>${currentChannel.name}</b>\n` +
                  `গ্রুপ: ${currentChannel.groupName}\n` +
                  `ডিভাইস: TX9 Pro Android TV 🟢\n` +
                  `স্ট্যাটাস: ${currentChannel.health?.status || 'HEALTHY'}`;
        } else {
          reply = `কোনো চ্যানেল বর্তমানে সক্রিয় নয়।`;
        }
        break;

      case '/channel': {
        const num = parseInt(parts[1], 10);
        if (isNaN(num)) {
          reply = `নম্বর উল্লেখ করুন, যেমন: <code>/channel 2</code>`;
        } else {
          const target = channels.find(c => c.number === num);
          if (target) {
            onSelectChannel(target);
            reply = `▶️ চ্যানেল পরিবর্তন সফল: <b>#${target.number} · ${target.name}</b>`;
          } else {
            reply = `❌ #${num} নম্বর কোনো চ্যানেল পাওয়া যায়নি।`;
          }
        }
        break;
      }

      case '/next':
        onNextChannel();
        reply = `⏭️ পরের চ্যানেলে সুইচ করা হয়েছে।`;
        break;

      case '/prev':
        onPrevChannel();
        reply = `⏮️ আগের চ্যানেলে সুইচ করা হয়েছে।`;
        break;

      case '/aspect':
        onCycleAspect();
        reply = `🖥️ Aspect Ratio পরিবর্তন করা হয়েছে।`;
        break;

      case '/watchtime': {
        const h = Math.floor(todayWatchSeconds / 3600);
        const m = Math.floor((todayWatchSeconds % 3600) / 60);
        const s = todayWatchSeconds % 60;
        reply = `⏱ <b>আজকের দেখার সময় (Watch-Time):</b>\nমোট: <b>${h}ঘ ${m}মি ${s}সে</b>`;
        break;
      }

      case '/search': {
        const q = parts.slice(1).join(' ').toLowerCase();
        if (!q) {
          reply = `কী খুঁজবেন লিখুন: যেমন <code>/search Somoy</code>`;
        } else {
          const matched = channels.filter(c => c.name.toLowerCase().includes(q));
          if (matched.length === 0) {
            reply = `কোনো চ্যানেল মেলেনি: '${q}'`;
          } else {
            reply = `🔎 <b>ফলাফল (${matched.length}টি):</b>\n` +
                    matched.slice(0, 5).map(c => `• /channel_${c.number} <b>#${c.number} ${c.name}</b>`).join('\n');
          }
        }
        break;
      }

      case '/report': {
        const ok = channels.filter(c => c.health?.status === 'HEALTHY').length;
        const slow = channels.filter(c => c.health?.status === 'SLOW').length;
        const down = channels.filter(c => c.health?.status === 'UNAVAILABLE').length;
        reply = `🔎 <b>Channel Health Summary</b>\n` +
                `মোট: ${channels.length} | ✅ ${ok} | 🐢 ${slow} | ❌ ${down}`;
        break;
      }

      default:
        reply = `অপরিচিত কমান্ড: '${cmd}'। মেনু দেখতে <code>/help</code> পাঠান।`;
    }

    const botMsg: ChatMessage = {
      id: `b_${Date.now()}`,
      sender: 'bot',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInputCommand('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14181D] border border-white/10 rounded-2xl w-full max-w-2xl h-[75vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0E1217]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">StTV Telegram Bot Console (Simulator)</h2>
              <span className="text-[11px] text-emerald-400 font-mono">● Remote Command Router Active</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 p-2.5 border-b border-white/10 bg-black/20 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold pl-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            কমান্ড:
          </span>
          {['/status', '/now', '/next', '/prev', '/channel 1', '/channel 2', '/watchtime', '/report', '/help'].map(cmd => (
            <button
              key={cmd}
              onClick={() => handleSendCommand(cmd)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-white/5 font-mono text-[11px] whitespace-nowrap transition"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B0D10]/50 font-sans">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-sky-300'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`p-3 rounded-2xl text-xs shadow-md space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-[#1C2128] border border-white/10 text-slate-100 rounded-tl-none'
                }`}
              >
                <div
                  className="whitespace-pre-line leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                <span className="text-[10px] opacity-60 block text-right font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendCommand();
          }}
          className="p-3 border-t border-white/10 bg-[#0E1217] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="কমান্ড টাইপ করুন (e.g. /status, /channel 3)…"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!inputCommand.trim()}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
            পাঠান
          </button>
        </form>
      </div>
    </div>
  );
};
