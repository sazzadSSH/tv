import { Channel } from '../types/sttv';

export interface ParseResult {
  channels: Channel[];
  totalParsed: number;
  groups: string[];
  errors: string[];
}

// Simple deterministic hash for stable channel IDs
function generateStableId(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `ch_${Math.abs(hash).toString(36)}`;
}

export function parseM3U(content: string, baseUrl?: string): ParseResult {
  // Normalize line endings
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const channels: Channel[] = [];
  const groupsSet = new Set<string>();
  const errors: string[] = [];

  let currentInfo: Partial<Channel> | null = null;
  let currentHeaders: Record<string, string> = {};
  let channelIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    // Header tag
    if (line.startsWith('#EXTM3U')) {
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      currentInfo = {};
      currentHeaders = {};

      // Match attributes like tvg-id="", tvg-name="", tvg-logo="", group-title="", tvg-chno="", channel-id=""
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i) || line.match(/channel-id="([^"]*)"/i);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/i);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/i);
      const chNoMatch = line.match(/tvg-chno="([^"]*)"/i);

      if (tvgIdMatch) currentInfo.tvgId = tvgIdMatch[1].trim();
      if (tvgLogoMatch) currentInfo.logoUrl = tvgLogoMatch[1].trim();
      
      const groupName = groupTitleMatch ? groupTitleMatch[1].trim() : 'General';
      currentInfo.groupName = groupName || 'General';
      groupsSet.add(currentInfo.groupName);

      if (chNoMatch) {
        const num = parseInt(chNoMatch[1], 10);
        if (!isNaN(num) && num > 0) currentInfo.number = num;
      }

      // Extract channel name properly: find the comma that is NOT inside quotation marks
      let commaIndex = -1;
      let inQuotes = false;
      for (let c = 8; c < line.length; c++) {
        if (line[c] === '"') inQuotes = !inQuotes;
        else if (line[c] === ',' && !inQuotes) {
          commaIndex = c;
          break;
        }
      }

      let parsedName = '';
      if (commaIndex !== -1 && commaIndex < line.length - 1) {
        parsedName = line.substring(commaIndex + 1).trim();
      } else if (tvgNameMatch) {
        parsedName = tvgNameMatch[1].trim();
      }

      currentInfo.name = parsedName || `Channel ${channelIndex}`;
    } else if (line.startsWith('#EXTGRP:')) {
      const groupName = line.substring(8).trim();
      if (currentInfo && groupName) {
        currentInfo.groupName = groupName;
        groupsSet.add(groupName);
      }
    } else if (line.startsWith('#EXTVLCOPT:') || line.startsWith('#EXTHTTP:')) {
      // Parse VLC or HTTP headers like http-user-agent, http-referrer
      const uaMatch = line.match(/http-user-agent=([^&]+)/i);
      const refMatch = line.match(/http-referrer=([^&]+)/i);
      if (uaMatch) currentHeaders['User-Agent'] = uaMatch[1].trim();
      if (refMatch) currentHeaders['Referer'] = refMatch[1].trim();
    } else if (!line.startsWith('#')) {
      // It's a stream URL
      let streamUrl = line.trim();

      // Resolve relative URL if baseUrl is available
      if (baseUrl && !streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
        try {
          streamUrl = new URL(streamUrl, baseUrl).toString();
        } catch {
          // ignore error and keep raw URL
        }
      }

      if (currentInfo) {
        const channelNumber = currentInfo.number || channelIndex;
        const channelName = currentInfo.name || `Channel ${channelIndex}`;
        const stableId = generateStableId(`${channelName}_${streamUrl}_${channelNumber}`);

        const channel: Channel = {
          id: stableId,
          number: channelNumber,
          name: channelName,
          url: streamUrl,
          groupName: currentInfo.groupName || 'General',
          logoUrl: currentInfo.logoUrl,
          tvgId: currentInfo.tvgId,
          headers: Object.keys(currentHeaders).length > 0 ? currentHeaders : undefined,
          isFavorite: false,
          isBypassed: false,
          health: {
            status: 'UNKNOWN',
            consecutiveFailures: 0
          }
        };
        channels.push(channel);
        channelIndex++;
        currentInfo = null;
        currentHeaders = {};
      } else if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
        // Standalone URL without preceding #EXTINF
        const stableId = generateStableId(`Stream_${streamUrl}_${channelIndex}`);
        channels.push({
          id: stableId,
          number: channelIndex,
          name: `Stream ${channelIndex}`,
          url: streamUrl,
          groupName: 'General',
          isBypassed: false,
          health: {
            status: 'UNKNOWN',
            consecutiveFailures: 0
          }
        });
        channelIndex++;
      }
    }
  }

  return {
    channels,
    totalParsed: channels.length,
    groups: Array.from(groupsSet),
    errors
  };
}
