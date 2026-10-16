# AI PrintOS Design System

## 1. Visual direction

An editorial creative-workbench aesthetic: pale grey workspace, near-black navigation, soft mint accents and warm coral/lilac highlights. The interface should feel designed and tactile without copying another company's branding or recreating the reference HTML.

## 2. Palette and roles

- `#10151D` — dark navigation and structural chrome.
- `#191E27` — primary text.
- `#F5F6F8` — application background.
- `#FFFFFF` — cards, inspector and menus.
- `#78EAD8` — primary creative accent and status highlights.
- `#FF947C` — warm secondary accent.
- `#C7B9F7` — lilac category accent.
- `#F2D978` — optional warm highlight.
- `#E3E7EC` — borders and dividers.
- `#727B88` — secondary text; avoid low-contrast use for small critical labels.

## 3. Typography

Use Manrope for titles and DM Sans for UI copy with system fallbacks. DM Mono is for technical metadata. Telugu text must include a system fallback chain such as Noto Sans Telugu, Nirmala UI or Gautami. Do not require network fonts for core functionality.

## 4. Components

Buttons have clear hover, focus, disabled and active states. Cards have subtle borders and restrained elevation. Forms use explicit labels. Glass keyboard keys use translucent gradient surfaces, backdrop blur, a light highlight border and a visible pressed state; keep text readable with blur disabled or reduced as a graceful fallback.

## 5. Layout and responsive rules

Desktop uses a 242px sidebar and a fluid main workspace. Below 940px, collapse the sidebar and show a fixed mobile bottom nav. At 640px, use a single-column hero and integration layouts, 2-up product/template grids, larger touch targets, and reduce toolbar label density.

## 6. Depth and motion

Use border-first surfaces and soft shadows. Avoid excessive glow and perpetual animation. Honor `prefers-reduced-motion`. Never make animation required to understand state.

## 7. Accessibility

Use semantic headings, real labels, visible focus rings, accessible names for icon buttons, status/live regions for failures, reduced-motion support, and adequate contrast. Do not communicate integration status by color alone.

## 8. Responsive keyboard

The virtual keyboard must fit device width, remain scrollable without clipping essential controls, use touch-friendly key heights, and never obscure the focused text editor permanently. It is a local editor input tool, not an operating-system keyboard.

## 9. Guardrails

No fake user reviews, customer quotes, fake integrations, fake AI outputs, fake persistence, or claims of print-production readiness. Label templates as project-created sample layouts, and state external access and API limitations plainly.
