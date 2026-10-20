import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// CORS preflight
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API: Proxy M3U Playlist to avoid CORS and mixed-content issues
app.get('/api/proxy-playlist', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('Missing url query parameter');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'StTV/1.0.0 (Android TV; TX9 Pro; Media3 ExoPlayer)',
        'Accept': '*/*'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch playlist: ${response.statusText}`);
    }

    const text = await response.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).send(`Error fetching playlist: ${message}`);
  }
});

// API: Proxy HLS manifest and stream chunks
app.get('/api/proxy-stream', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('Missing url query parameter');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'StTV/1.0.0 (Android TV; TX9 Pro; Media3 ExoPlayer)',
        'Accept': '*/*'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).send(`Stream request failed: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    res.setHeader('Content-Type', contentType);

    // If it's an M3U8 manifest, rewrite relative chunk URLs to proxy
    if (contentType.includes('mpegurl') || targetUrl.includes('.m3u8')) {
      const text = await response.text();
      const lastSlash = targetUrl.lastIndexOf('/');
      const baseUrl = lastSlash !== -1 ? targetUrl.substring(0, lastSlash + 1) : targetUrl;

      const lines = text.split('\n');
      const rewritten = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return line;
        
        let fullUrl = trimmed;
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
          fullUrl = trimmed.startsWith('/')
            ? new URL(trimmed, targetUrl).toString()
            : `${baseUrl}${trimmed}`;
        }
        return `/api/proxy-stream?url=${encodeURIComponent(fullUrl)}`;
      }).join('\n');

      return res.send(rewritten);
    }

    // Binary segment (.ts or media chunk)
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).send(`Stream proxy error: ${message}`);
  }
});

async function start() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StTV Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
