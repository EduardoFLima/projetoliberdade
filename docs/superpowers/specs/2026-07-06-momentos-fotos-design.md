# Design — Momentos page (Fotos)

**Date:** 2026-07-06
**Status:** Approved (design), pending implementation plan
**Scope:** The Fotos view of the `/momentos` page. Builds on the already-shipped
Vídeos view (see `2026-07-05-momentos-videos-design.md`). Enables the Fotos
toggle and adds a `/momentos/fotos` route.

Source mockup: Stitch project *Projeto Liberdade Website Redesign*, screen
*Momentos - fotos* (`5c161d4852234c919313f67ca9b3a219`), plus the shared header
from screen *Projeto Liberdade - Momentos* (`ff60a5e88465412fbfd62d61df20cca6`).

---

## 1. Purpose

Add the **Fotos** view to `/momentos`: a bento/mosaic photo grid matching the
mockup — one large featured photo (2×2) with the remaining photos tiled as 1×1
cells, each rounded with a hover zoom. Clicking any photo opens it full-screen in
the existing `Lightbox` (prev/next/Esc). The page keeps the shared header and the
Vídeos/Fotos pill toggle; **Fotos** becomes active and routable.

---

## 2. Decisions (locked during brainstorming)

1. **Flat content model.** `content.json` drops the (currently unused) album
   grouping. Photos become `pages.momentos.photos.featured` (one hero image) plus
   `pages.momentos.photos.items` (a flat list). No album titles/covers.
2. **Photo sources.** `featured` = the mockup's own big image, downloaded from
   Stitch to `public/images/momentos/destaque.jpg`. `items` = the 9 photos under
   `docs/resources/fotos/album{1,2,3}`, flattened and migrated to
   `public/images/momentos/foto-1.jpg` … `foto-9.jpg`. The `historia` subfolder
   is excluded (those belong to the História page).
3. **No "Carregar Mais".** With ~10 photos it would be dead UI (consistent with
   the Vídeos decision). All photos render at once.
4. **Reuse the existing Lightbox.** `src/components/Lightbox.tsx` already renders
   a flat `Photo[]` with prev/next/Esc/backdrop/✕ close. It is reused unchanged.
5. **Routing = real route + active toggle.** Add `/momentos/fotos`. The Fotos
   pill becomes an active `Link` (it is currently a disabled button). `/momentos`
   and `/momentos/videos` still show Vídeos; `/momentos/fotos` shows Fotos.
6. **Alt text authored.** Photos ship with descriptive Portuguese `alt` text
   (not the empty strings currently in `content.json`).

---

## 3. Layout (from the mockup)

Bento grid, mirroring the mockup CSS:

- Grid: `grid-auto-rows: 280px`, columns `repeat(auto-fit, minmax(280px, 1fr))`,
  gap `24px` (Tailwind `gap-6`).
- Featured tile (first): spans `2` columns × `2` rows on ≥md; collapses to `1×1`
  on mobile.
- All other tiles: `1×1`.
- Each tile: `rounded-xl`, `overflow-hidden`, an `<img>` with
  `h-full w-full object-cover`, `transition-transform group-hover:scale-105`, and
  a focus-visible outline. Clicking opens the Lightbox.

---

## 4. Content model (content.json)

Replace `pages.momentos.photos.albums` with:

```json
"photos": {
  "featured": {
    "src": "/images/momentos/destaque.jpg",
    "alt": "Criança sorrindo enquanto monta um cavalo marrom em uma sessão de equoterapia"
  },
  "items": [
    { "src": "/images/momentos/foto-1.jpg", "alt": "…" },
    { "src": "/images/momentos/foto-2.jpg", "alt": "…" }
    // … 9 total
  ]
}
```

`Photo` already has an optional `caption`; it is omitted here (captions are out of
scope). Alt text is authored per photo during implementation by viewing each
image.

---

## 5. Architecture

Follows the existing **feature → selector → section → presentational** pattern and
the non-negotiable dependency rule: files under `features`, `components`,
`layouts` never import `content.json`. Content access is isolated to the selector.

### New files

| File | Responsibility |
|---|---|
| `src/components/sections/PhotoGallery.tsx` | Presentational bento grid. Owns "which photo is open" index state; renders tiles and one reused `Lightbox`. Props: `photos: Photo[]` (featured first). |

### Edited files

| File | Change |
|---|---|
| `src/content/types.ts` | `MomentosPage.photos: { featured: Photo; items: Photo[] }`. |
| `src/content/content.json` | Replace `photos.albums` with `photos.featured` + `photos.items`. |
| `src/features/momentos/momentosSelectors.ts` | Add `selectPhotos(content) → Photo[]` = `[featured, ...items]`. |
| `src/features/momentos/MomentosPage.tsx` | Derive the active view from the route (`useLocation`: path ending `/fotos` → fotos, else videos). Render header + `MediaToggle active={view}` + `VideoGallery` **or** `PhotoGallery`. |
| `src/components/MediaToggle.tsx` | Make **Fotos** an active `Link` to `/momentos/fotos` (remove the disabled/`aria-disabled` state). |
| `src/routes.tsx` | Add `momentos/fotos` → `MomentosPage`. |

### Reused unchanged

- `src/components/Lightbox.tsx` — flat `Photo[]`, prev/next/Esc/backdrop/✕.

The album-based `src/components/Gallery.tsx` is unused and left untouched
(out of scope).

### Image migration

- Download the mockup's featured image → `public/images/momentos/destaque.jpg`.
- Copy `docs/resources/fotos/album{1,2,3}/*.jpg` → `public/images/momentos/`,
  renamed `foto-1.jpg` … `foto-9.jpg`.

---

## 6. Data flow

`SiteLayout` (calls `useContent`) → Outlet context → `MomentosPage` reads context
and the current route → `selectPhotos` produces `Photo[]` (featured first) → props
down to `PhotoGallery` → tiles → `Lightbox`. No presentational component imports
content.

---

## 7. Interaction & accessibility

- **Open photo**: each tile is a `<button aria-label="Ampliar foto: {alt}">`
  wrapping the `<img>`. Clicking sets the open index; `Lightbox` mounts at that
  index.
- **Lightbox**: already `role="dialog"`, `aria-modal="true"`, closes on Esc,
  backdrop, and ✕; ‹/› navigate; wraps around.
- **Fotos pill**: an active `Link` with `aria-current="page"` when the fotos view
  is active, mirroring the Vídeos pill.
- **Images**: `loading="lazy"` on tiles; meaningful Portuguese `alt`.

---

## 8. Testing (TDD, RED → GREEN → REFACTOR)

| Test | Tool | Covers |
|---|---|---|
| `src/features/momentos/momentosSelectors.test.ts` | Vitest | `selectPhotos` returns the featured photo first, then all items (10 total). |
| `src/components/sections/PhotoGallery.test.tsx` | Testing Library | Renders one tile per photo; the first tile carries the featured span classes; clicking tile *n* opens the `Lightbox` at index *n*; closing removes it. |
| `src/components/MediaToggle.test.tsx` | Testing Library | Updated: **Fotos** is now an active `Link` (previously disabled). |
| `src/features/momentos/MomentosPage.test.tsx` | Testing Library | `/momentos/fotos` renders the photo grid; `/momentos` renders the video grid. |
| `tests/e2e/momentos.spec.ts` | Playwright | Extend: click Fotos → grid visible → click a photo → lightbox opens. |

---

## 9. Out of scope (deferred)

- Albums, album titles/covers.
- Photo captions beyond alt text.
- "Carregar Mais" / pagination.
- The `docs/resources/fotos/historia` photos.
- Any change to the Vídeos view or video content.

---

## 10. Verification (before completion)

Run and confirm green: `pnpm lint`, `pnpm build` (type-check), `pnpm test`,
`pnpm test:e2e`. Drive `/momentos/fotos` in the browser (Playwright MCP) to
confirm the bento grid renders, the featured tile spans 2×2, and clicking a photo
opens the lightbox with working navigation.
