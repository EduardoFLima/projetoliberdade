# Brand Logo Favicon (Horse-Rider Mark)

**Date:** 2026-06-23
**Status:** Approved

## Goal

Replace the generic purple `public/favicon.svg` with a crisp, square favicon
derived from the horse-rider element of the brand logo, so browser tabs and iOS
home-screen shortcuts show the Projeto Liberdade brand.

## Context

- `index.html` currently points the favicon at `/favicon.svg` (a generic icon).
- The brand logo lives at `src/assets/logo.png` (576×221, wide/landscape) and is
  used in the Header and Hero components.
- A wide logo squished into a 16–32px square is unreadable, so the recognizable
  horse-rider silhouette on the right side of the logo is cropped to a square.

## Approach

1. **Isolate** the solid white horse-rider silhouette from the right side of
   `src/assets/logo.png` using connected-component analysis (largest white blob
   in the `x >= 415` region, which excludes the "Liberdade" text).
2. **Compose** the silhouette in white, centered with ~16% padding, on a
   two-tone brand background (green `#00aa5a` top half, purple `#3a3985` bottom
   half) — echoing the logo's bands.
3. **Generate** raster icons in `public/` (rendered at 4× supersample, then
   downscaled with Lanczos):
   - `favicon.png` — 32×32 (browser tab)
   - `apple-touch-icon.png` — 180×180 (iOS home screen)
4. **Update** `index.html`: replace the single SVG `<link rel="icon">` with a PNG
   icon link plus an apple-touch-icon link.
5. **Remove** the now-unused `public/favicon.svg`.
6. **Keep** the full wide logo untouched in the Header/Hero components — only the
   favicon changes.

## Out of Scope

- No `favicon.ico` (modern browsers handle PNG).
- No PWA web manifest.
- No changes to the component logos.

## Testing / Verification

- Visually confirm the cropped mark is centered and recognizable.
- Confirm the dev server serves the icons and `index.html` references resolve.
