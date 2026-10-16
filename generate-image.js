/**
 * Vercel serverless handler for Gemini image generation.
 * The API key stays in the deployment environment, never in browser code.
 * Configure GEMINI_API_KEY and, optionally, GEMINI_IMAGE_MODEL in Vercel.
 * Image generation availability/model capabilities can vary by project and region.
 */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean);
const MAX_BODY = 16_000;
const MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function response(statusCode, body, origin = '') {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Origin'
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return { statusCode, headers, body: JSON.stringify(body) };
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const applyHeaders = (status, body) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (status === 204) return res.end();
    return res.end(JSON.stringify(body));
  };

  if (origin && ALLOWED_ORIGINS.length && !ALLOWED_ORIGINS.includes(origin)) {
    return applyHeaders(403, { error: 'This origin is not allowed.' });
  }
  if (req.method === 'OPTIONS') return applyHeaders(204, {});
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return applyHeaders(405, { error: 'Use POST to request image generation.' });
  }
  if (!process.env.GEMINI_API_KEY) return applyHeaders(503, { error: 'Image generation is not configured. Set GEMINI_API_KEY in serverless environment variables.' });

  let body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BODY) return applyHeaders(413, { error: 'Request body is too large.' });
        chunks.push(chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch (_) {
      return applyHeaders(400, { error: 'Request body must be valid JSON.' });
    }
  }
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const aspectRatio = typeof body.aspectRatio === 'string' ? body.aspectRatio : '1:1';
  if (!prompt || prompt.length > 2000) return applyHeaders(400, { error: 'Prompt is required and must be 2000 characters or fewer.' });
  if (!['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio)) return applyHeaders(400, { error: 'Unsupported aspect ratio.' });

  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  const url = `${MODELS_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const request = {
    contents: [{ parts: [{ text: `Create a high-quality image for this design brief. Desired aspect ratio: ${aspectRatio}. Return an image, not a textual description. Brief: ${prompt}` }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
  };
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(90_000)
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const upstreamMessage = data?.error?.message;
      // Avoid returning tokens, request headers, or raw upstream payloads.
      return applyHeaders(upstream.status === 429 ? 429 : upstream.status === 401 || upstream.status === 403 ? 502 : 502, {
        error: upstream.status === 429 ? 'The image API rate limit or quota was reached. Retry later or review project quotas.' :
          upstream.status === 401 || upstream.status === 403 ? 'The image provider rejected the server API key or access. Verify key permissions and enabled API.' :
          `The image provider request failed${upstreamMessage ? `: ${String(upstreamMessage).slice(0, 220)}` : '.'}`
      });
    }
    const parts = data?.candidates?.flatMap(candidate => candidate?.content?.parts || []) || [];
    const image = parts.find(part => part?.inlineData?.data && /^image\/(png|jpeg|webp)$/.test(part.inlineData.mimeType || ''));
    if (!image) {
      const providerText = parts.find(part => typeof part.text === 'string')?.text;
      return applyHeaders(502, {
        error: providerText ? `The configured model did not return image bytes: ${providerText.slice(0, 180)}` : 'The configured Gemini model did not return a supported image. Check current image model support and response format.'
      });
    }
    const mimeType = image.inlineData.mimeType;
    const base64 = image.inlineData.data;
    // Cap payload size before relaying it to the client.
    if (base64.length > 14_000_000) return applyHeaders(502, { error: 'The returned image was too large to transfer safely.' });
    return applyHeaders(200, { imageDataUrl: `data:${mimeType};base64,${base64}`, mimeType });
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return applyHeaders(502, { error: timedOut ? 'Image provider request timed out. Retry the request.' : 'Could not reach the image provider. Check function network access and provider status.' });
  }
};
