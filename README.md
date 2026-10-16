# AI PrintOS — React & Vite Print Design Workspace

AI PrintOS is a browser-based bilingual print and digital layout studio rebuilt with React, TypeScript, and Vite, featuring an Express backend proxy for server-side Gemini image generation.

## Features

- **Modular React Architecture**: Built with React 18, TypeScript, and Vite.
- **Design Editor & Live Canvas**:
  - Drag-to-move and corner-handle drag-to-resize objects on a live scalable canvas.
  - Undo and Redo with undo stacks and keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`, `Ctrl+S`).
  - Add text, shapes (rectangles, rounded rectangles, ellipses), and upload images (PNG, JPEG, WebP).
  - Fine-grained property inspector: colors, borders, font weights, alignment, line spacing, opacity, dimensions, and layer reordering.
  - High-resolution PNG export at 1×, 2×, and 3× scales.
- **PrintType Bilingual Keyboard**:
  - Built-in glass-morphism on-screen keyboard supporting English QWERTY and Telugu Unicode layouts.
  - Numeric, symbol, and emoji drawers.
  - Deterministic phonetic transliteration suggestions (e.g., `namaskaram` → `నమస్కారం`, `telugu` → `తెలుగు`).
- **Template Library**:
  - 7 curated templates spanning business cards, botanical posters, event invitations, social cards, sale flyers, Telugu greetings, and certificates.
  - Search and category filters (All, Branding, Print, Digital, Events).
- **Projects & Local Persistence**:
  - LocalStorage persistence with full JSON schema validation.
  - Export and import `.aiprintos.json` project backups.
- **AI Image Studio**:
  - Generative visual creation powered by Gemini via secure Express backend proxy (`/api/generate-image`).
  - Supports aspect ratio selection (1:1, 3:4, 4:3, 9:16, 16:9), loading indicators, retry mechanisms, direct PNG download, and "Add to design" canvas integration.
- **Integrations & Setup Overview**:
  - Real status detection for Gemini.
  - Documentation links for Canva and Adobe Express developer platforms.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env` (optional for AI generation):
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```
