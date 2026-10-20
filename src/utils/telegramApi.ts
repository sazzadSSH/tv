import { Channel, HealthStatus, WatchSession } from '../types/sttv';

export interface TelegramTestResult {
  success: boolean;
  botName?: string;
  botUsername?: string;
  error?: string;
}

export async function testTelegramToken(token: string): Promise<TelegramTestResult> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { success: false, error: 'Token is empty' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
    const data = await res.json();
    if (data.ok && data.result) {
      return {
        success: true,
        botName: data.result.first_name,
        botUsername: data.result.username
      };
    } else {
      return {
        success: false,
        error: data.description || 'Invalid token or unauthorized'
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Network error or CORS: ${message}`
    };
  }
}

export async function sendTelegramMessage(
  token: string,
  chatId: string,
  htmlText: string
): Promise<{ success: boolean; error?: string }> {
  const cleanToken = token.trim();
  const cleanChatId = chatId.trim();
  if (!cleanToken || !cleanChatId) {
    return { success: false, error: 'Token or Chat ID missing' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.description || `HTTP ${res.status}` };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// 4.1 Spec App Launch Message
export function buildLaunchMessage(channelCount: number, device = 'TX9 Pro Android TV'): string {
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour12: true });
  return `📺 <b>StTV চালু হয়েছে</b>\n` +
         `Device: <code>${device}</code>\n` +
         `Time: ${now} (BDT)\n` +
         `Playlist: <b>${channelCount}</b> চ্যানেল\n` +
         `Version: <b>1.0.0 (Release)</b>\n` +
         `Status: Active & Ready 🟢`;
}

// 4.1 Spec Startup Scan Summary Message
export function buildScanReportMessage(
  total: number,
  healthy: number,
  slow: number,
  down: number,
  unknown: number,
  durationSec: number,
  failingChannels: Array<{ name: string; code?: number; reason?: string }>
): string {
  let text = `🔎 <b>Channel Scan রিপোর্ট</b>\n` +
             `মোট: ${total} | ✅ ${healthy} | 🐢 ${slow} | ❌ ${down} | ⚪ ${unknown}\n` +
             `সময় লেগেছে: ${durationSec}s\n`;

  if (failingChannels.length > 0) {
    text += `\n❌ <b>সমস্যাযুক্ত চ্যানেল (${Math.min(failingChannels.length, 5)}টি):</b>\n`;
    failingChannels.slice(0, 5).forEach(ch => {
      text += `• <b>${escapeHtml(ch.name)}</b> — HTTP ${ch.code || 'N/A'} (${ch.reason || 'Timeout/Fail'})\n`;
    });
  } else {
    text += `\n🎉 <i>সব স্ক্যানকৃত চ্যানেল সুস্থ আছে!</i>`;
  }

  return text;
}

// 4.1 Spec Watch-Time Report Message
export function buildWatchReportMessage(
  todaySeconds: number,
  sessionSeconds: number,
  topChannels: Array<{ name: string; seconds: number }>
): string {
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}ঘ ${m}মি`;
    if (m > 0) return `${m}মি ${s}সে`;
    return `${s}সে`;
  };

  let text = `⏱ <b>দেখার রিপোর্ট (Watch-Time)</b>\n` +
             `আজকের মোট: <b>${formatTime(todaySeconds)}</b>\n` +
             `শেষ সেশন: <b>${formatTime(sessionSeconds)}</b>\n`;

  if (topChannels.length > 0) {
    text += `\n🏆 <b>শীর্ষ চ্যানেল:</b>\n`;
    topChannels.forEach((ch, idx) => {
      text += `${idx + 1}) <b>${escapeHtml(ch.name)}</b>: ${formatTime(ch.seconds)}\n`;
    });
  }

  return text;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
