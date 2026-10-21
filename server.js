import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// Serve static frontend files (HTML, CSS, JS, Assets)
app.use(express.static(__dirname));

// Health / OPTIONS check for AI endpoint
app.options('/api/generate-image', (_req, res) => {
  res.status(204).end();
});

// Real server-side Gemini Image Generation Proxy
app.post('/api/generate-image', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Image generation is not configured. Set GEMINI_API_KEY in server environment variables.',
    });
  }

  const { prompt, aspectRatio = '1:1' } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  if (prompt.length > 2000) {
    return res.status(400).json({ error: 'Prompt must be 2000 characters or fewer.' });
  }

  const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
  const ar = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

  try {
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Create a high-quality image for this design brief. Desired aspect ratio: ${ar}. Return an image, not a textual description. Brief: ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
      signal: AbortSignal.timeout(90000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error?.message || 'Upstream provider request failed.';
      return res.status(response.status === 429 ? 429 : 502).json({
        error: response.status === 429 ? 'Rate limit or quota reached. Please retry later.' : `Image generation failed: ${msg.slice(0, 200)}`,
      });
    }

    const parts = data?.candidates?.flatMap((c) => c?.content?.parts || []) || [];
    const imagePart = parts.find((p) => p?.inlineData?.data && /^image\/(png|jpeg|webp)$/.test(p.inlineData.mimeType || ''));

    if (!imagePart) {
      const textPart = parts.find((p) => typeof p?.text === 'string')?.text;
      return res.status(502).json({
        error: textPart
          ? `Model did not return image bytes: ${textPart.slice(0, 180)}`
          : 'Configured model did not return image data.',
      });
    }

    const mimeType = imagePart.inlineData.mimeType;
    const base64 = imagePart.inlineData.data;
    if (base64.length > 14000000) {
      return res.status(502).json({ error: 'Generated image is too large to transfer safely.' });
    }

    return res.json({
      imageDataUrl: `data:${mimeType};base64,${base64}`,
      mimeType,
    });
  } catch (err) {
    const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    return res.status(502).json({
      error: isTimeout ? 'Image generation timed out. Please retry.' : `Could not reach image provider: ${err?.message || 'Network error'}`,
    });
  }
});

// Fallback to index.html for SPA routes
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`AI PrintOS vanilla server running at http://${HOST}:${PORT}`);
});
