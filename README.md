# AI PrintOS — HTML, CSS & Vanilla JavaScript

A modular, browser-based print design workspace inspired by the *structure* and design-system discipline of [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md). It does not reproduce that repository or the uploaded AI Print OS page. Frontend source uses plain HTML5, CSS3 and vanilla JavaScript; there is no frontend framework and no build step.

## What is implemented

- Distinct responsive dashboard and workspace with custom design tokens and glassmorphism bilingual keyboard.
- Original editable starter layouts for business cards, posters, invitations, flyers, social posts, Telugu greetings and certificates.
- Canvas text, shapes and image elements; selection, dragging, corner resize, properties, layer selection/order, duplication and delete.
- Undo/redo, localStorage project save, JSON export/import with input validation, PNG export at 1×/2×/3×.
- Keyboard with English and Telugu Unicode layouts, numeric/symbol page, emoji panel, basic shift/backspace/space/enter, and a limited, explicitly deterministic transliteration dictionary.
- AI image studio UI with loading, error/retry handling, download and add-to-design actions when the secure image endpoint returns real image bytes.
- Vercel and Netlify serverless endpoint examples. API keys are read only from private server environment variables.
- Integration screen clearly states that Canva and Adobe Express workflows are not connected by this starter project.

## Honest limitations

This is a runnable frontend prototype, not a complete print-commerce operation. There is no checkout, payment processing, print-shop fulfilment, user authentication, cloud project sync, server database, or production access-control system. Projects are saved in the current browser only. Browser storage may be cleared or reach quota.

The keyboard is **not Gboard** and does not implement a full Telugu transliteration engine, machine-learning autocorrect, personalised suggestions, or system-wide keyboard input. Telugu layout keys insert Unicode code points; consonant/vowel composition depends on the browser's font shaping. The small dictionary can suggest specific known words only. The three-word candidate row is local UI assistance, not predictive AI.

PNG export uses the browser Canvas API. It is not a print preflight pipeline: CMYK conversion, bleed, crop marks, embedded font handling, ICC profiles and printer-specific PDF delivery are not provided. PDFs are not exported by this initial version.

Gemini output only works when an image-capable model is accessible for the configured Google AI project. Verify current API/model support, account eligibility, region and quota. Do not assume the demo's ability to load the page confirms that model access works.

Canva and Adobe Express are **not falsely represented as integrated**. Real access depends on official developer programs, supported SDK/API capabilities, authorization, product terms and the desired workflow. This repo includes external links and status explanations, not credentials, unofficial scraping, or fake buttons.

## Run locally

1. Extract this ZIP.
2. Open `index.html` in a recent desktop/mobile browser. Most editor functionality is static; localStorage and object URLs work in normal browser contexts.
3. For testing the serverless endpoint locally, use the provider's local tooling (Vercel CLI or Netlify CLI). There is no `npm install` or frontend build step.

The Google Fonts stylesheet is an optional remote font enhancement. A system-font fallback is included. If you require a completely offline site, remove the `@import` at the top of `styles.css`.

## Deploy to Vercel

1. Import the extracted folder into Vercel, or deploy it with Vercel CLI. The root `index.html`, `styles.css`, and `app.js` are static files.
2. In Project Settings → Environment Variables, set `GEMINI_API_KEY` as a **private** server environment variable. Optionally set `GEMINI_IMAGE_MODEL` to an image-capable model your project can access. Never use `VITE_*` or any browser-exposed prefix for the private key.
3. Set `ALLOWED_ORIGINS` if you have a reason to call this endpoint cross-origin. On a normal same-origin deployment, leave it blank. Only list the specific trusted origins you own.
4. Redeploy after environment changes.
5. Check function logs and make a real test request in AI Image Studio. Test invalid prompts, provider permission errors, rate limits and timeout behavior.

`api/generate-image.js` is a Node serverless handler; `vercel.json` sets its execution timeout. The client calls `/api/generate-image`.

## Deploy to Netlify

1. Import the folder into Netlify. `netlify.toml` publishes the root as a static site and routes `/api/generate-image` to the function in `netlify/functions/generate-image.js`.
2. In Site configuration → Environment variables, set `GEMINI_API_KEY`; optionally set `GEMINI_IMAGE_MODEL`.
3. Redeploy and check function logs.
4. Run a real generation request and test quota, invalid-key, missing-key, timeout and non-image response behavior.

Netlify's function folder and runtime differ from Vercel's handler. The code provides separate wrappers for each platform. Do not deploy both route conventions to a single host without checking routing.

## Gemini endpoint contract

Request:

```json
{"prompt":"A botanical line-art poster","aspectRatio":"3:4"}
```

Success response:

```json
{"imageDataUrl":"data:image/png;base64,...","mimeType":"image/png"}
```

The server reads `GEMINI_API_KEY`, requests image output from the configured model, checks that an image payload is actually present, and returns a bounded image data URL. The browser rejects unexpected MIME types and oversized images. Provider quotas and available model IDs can change; verify them against current Google AI documentation before a production deployment.

## Project structure

```text
index.html                    UI / accessible page structure
styles.css                    Responsive design system + glass keyboard
app.js                        Vanilla JavaScript app, editor, storage, export
api/generate-image.js         Vercel serverless Gemini proxy
netlify/functions/generate-image.js
                              Netlify serverless Gemini proxy
.env.example                  Names only; no real secrets
vercel.json                   Vercel function config
netlify.toml                  Netlify publish/function/routing config
DESIGN.md                     Project-specific design guidelines
AGENTS.md                     Strict engineering instructions for future edits
```

## Security and operations

- Never commit `.env`, API keys, OAuth tokens, or generated secret files.
- Browser JavaScript is public. Any key placed into it can be copied by visitors.
- Keep provider calls server-side, configure origin restrictions if cross-origin access is needed, and consider rate limiting/abuse controls before making public access available.
- The included function validates prompt length and aspect ratio and does not log API keys. It is a starter proxy, not a full quota-management or abuse-prevention service.
- For customer-facing production use, add server-side rate limiting, observability, data retention rules, legal/privacy notices, content policy enforcement, and authenticated quotas as needed.
- Imported project JSON is treated as data and schema-validated; imported files are never opened as HTML. Image upload accepts PNG/JPEG/WebP only and applies size limits.

## Test checklist

- [ ] Open `index.html`, navigate through all screens, and confirm layout at desktop, tablet and mobile widths.
- [ ] Create blank design and each template; edit text/color/position; resize and reorder elements; duplicate and delete; undo and redo.
- [ ] Upload a permitted image; reject an unsupported or oversized file.
- [ ] Save and reload the browser; verify projects persist locally.
- [ ] Export PNG at each scale; validate the actual downloaded image dimensions and Telugu glyph rendering.
- [ ] Export and import project JSON; test malformed JSON, out-of-range dimensions, duplicate IDs and invalid data URLs.
- [ ] Test the keyboard's English/Telugu layouts, emoji, symbol page, backspace and candidate insertion with a selected text layer.
- [ ] Deploy to each intended host and test the real serverless endpoint with missing credentials, invalid credentials, valid image generation, quota/rate limit, provider non-image response and timeout.
- [ ] Verify no API key appears in browser source, public assets, deploy artifacts or version control.
- [ ] Run accessibility checks, keyboard-only navigation, browser console review and storage-quota tests before production use.

Only the source/static behavior was subject to local automated checks during package creation. A valid Gemini key/model, live provider image generation, Canva access, Adobe Express access, and final production deployments have not been available to verify in this package. Do not mark these checklist items as passed until you run them in your own environment.
