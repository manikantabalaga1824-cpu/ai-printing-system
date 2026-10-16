/** Netlify Functions endpoint with the same response contract as api/generate-image.js. */
const MAX_BODY = 16_000;
exports.handler = async event => {
  const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  if (event.httpMethod === 'OPTIONS') return {statusCode:204,headers,body:''};
  if (event.httpMethod !== 'POST') return {statusCode:405,headers,body:JSON.stringify({error:'Use POST to request image generation.'})};
  if (!process.env.GEMINI_API_KEY) return {statusCode:503,headers,body:JSON.stringify({error:'Image generation is not configured. Set GEMINI_API_KEY in Netlify environment variables.'})};
  if (typeof event.body !== 'string' || event.body.length > MAX_BODY) return {statusCode:413,headers,body:JSON.stringify({error:'Request body is too large.'})};
  let body; try { body = JSON.parse(event.body); } catch (_) { return {statusCode:400,headers,body:JSON.stringify({error:'Request body must be valid JSON.'})}; }
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const aspectRatio = typeof body.aspectRatio === 'string' ? body.aspectRatio : '1:1';
  if (!prompt || prompt.length > 2000) return {statusCode:400,headers,body:JSON.stringify({error:'Prompt is required and must be 2000 characters or fewer.'})};
  if (!['1:1','3:4','4:3','9:16','16:9'].includes(aspectRatio)) return {statusCode:400,headers,body:JSON.stringify({error:'Unsupported aspect ratio.'})};
  try {
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const upstream = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:`Create a high-quality image for this design brief. Desired aspect ratio: ${aspectRatio}. Return an image, not a textual description. Brief: ${prompt}`}]}],generationConfig:{responseModalities:['IMAGE','TEXT']}}),signal:AbortSignal.timeout(90000)});
    const data = await upstream.json().catch(()=>({}));
    if(!upstream.ok) return {statusCode:upstream.status===429?429:502,headers,body:JSON.stringify({error:upstream.status===429?'The image API rate limit or quota was reached. Retry later or review project quotas.':'The image provider rejected the request. Verify model availability, API permissions, and quota.'})};
    const parts=data?.candidates?.flatMap(c=>c?.content?.parts||[])||[];
    const image=parts.find(p=>p?.inlineData?.data&&/^image\/(png|jpeg|webp)$/.test(p.inlineData.mimeType||''));
    if(!image)return {statusCode:502,headers,body:JSON.stringify({error:'The configured Gemini model did not return a supported image. Check current image model support and response format.'})};
    if(image.inlineData.data.length>14000000)return {statusCode:502,headers,body:JSON.stringify({error:'The returned image was too large to transfer safely.'})};
    return {statusCode:200,headers,body:JSON.stringify({imageDataUrl:`data:${image.inlineData.mimeType};base64,${image.inlineData.data}`,mimeType:image.inlineData.mimeType})};
  } catch (_) { return {statusCode:502,headers,body:JSON.stringify({error:'Could not reach the image provider or the request timed out. Retry and review function logs.'})}; }
};
