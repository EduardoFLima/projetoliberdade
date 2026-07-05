# Design — Momentos page (Vídeos)

**Date:** 2026-07-05
**Status:** Approved (design), pending implementation plan
**Scope:** The `/momentos` page, videos view only. The Fotos toggle button is
rendered but inert (its gallery is deferred to a later task).

Source mockup: Stitch project *Projeto Liberdade Website Redesign*, screen
*Projeto Liberdade - Momentos* (`ff60a5e88465412fbfd62d61df20cca6`).

---

## 1. Purpose

Build the Momentos ("Nossos Momentos") page showing the two project videos as a
2-column grid of cards. Each card has a thumbnail with a play button; clicking
play opens the video in a modal overlay. A secondary "Assistir no YouTube ↗"
link opens the video's watch page in a new tab. A Vídeos/Fotos pill toggle sits
above the grid: **Vídeos** is active, **Fotos** is disabled (deferred).

There are exactly two videos, both on YouTube, already present in
`content.json` under `pages.momentos.videos`.

---

## 2. Decisions (locked during brainstorming)

1. **Playback = modal overlay.** Clicking play opens a full-screen dialog
   (Lightbox-style) containing the embedded YouTube iframe. Not inline, not a
   plain link-out.
2. **Thumbnails/URLs derived from the embed URL.** `content.json` keeps only the
   embed URL as the single source of truth. A util extracts the YouTube video
   ID and builds the thumbnail, watch, and embed URLs. No per-video thumbnail
   fields are added.
3. **Routing = real routes, Fotos disabled.** `/momentos` and
   `/momentos/videos` both render the videos view. No `/momentos/fotos` route is
   added yet; the Fotos pill is an inert/disabled button so it never 404s.
4. **No "Carregar Mais".** Removed from the mockup; with two videos it would be
   dead UI. Omitted.

---

## 3. Content

### Header copy (new content in `content.json`)

The mockup header text does not yet exist in `content.json`. Add a `header`
object to `pages.momentos`:

```json
"header": {
  "title": "Nossos Momentos",
  "subtitle": "Explore a beleza e a conexão transformadora da equoterapia. Uma galeria de momentos de cura, aprendizado e liberdade em nosso Haras."
}
```

This is genuinely new content (a page heading), not duplicated video metadata,
so it belongs in `content.json`.

### Video titles

`content.json` currently has titles *"O menino e seu cavalo"* and *"O projeto
liberdade"*. The mockup shows curated alternatives (*"Conheça nossa História"*,
*"Benefícios da Equoterapia"*). **content.json is the source of truth** — render
the JSON titles. Updating those titles is a separate content decision, out of
scope here.

### Videos (unchanged)

```json
"videos": [
  { "slug": "o-menino-e-seu-cavalo", "title": "O menino e seu cavalo", "order": 1, "url": "https://www.youtube.com/embed/bAkqnk5AqOc" },
  { "slug": "o-projeto-liberdade",   "title": "O projeto liberdade",   "order": 2, "url": "https://www.youtube.com/embed/RcaxtQWPI_c" }
]
```

---

## 4. Architecture

Follows the existing **feature → selector → section → presentational** pattern
(as in `historia`, `contato`) and the non-negotiable dependency rule: files
under `features`, `components`, `layouts` never import `content.json` or parse
data-source specifics. YouTube URL knowledge is isolated to one util; content
access is isolated to the selector.

### New files

| File | Responsibility |
|---|---|
| `src/lib/youtube.ts` | Pure util. `getYouTubeId(url)`, `thumbnailUrl(id)`, `watchUrl(id)`, `embedUrl(id)`. The only code that knows YouTube URL shapes. |
| `src/features/momentos/MomentosPage.tsx` | Container. Reads `useOutletContext<SiteContent>()`, calls selectors, renders `MediaToggle` + header + `VideoGallery`. |
| `src/features/momentos/momentosSelectors.ts` | `selectMomentosHeader(content) → { title, subtitle }`; `selectVideos(content) → VideoCardVm[]` sorted by `order`, with derived `thumbnail`, `embedUrl`, `watchUrl`. |
| `src/components/sections/VideoGallery.tsx` | Presentational grid + owns "which video is open" state; renders `VideoCard`s and one `VideoLightbox`. |
| `src/components/VideoCard.tsx` | Thumbnail, centered SVG play button, title, "Assistir no YouTube ↗" external link. Calls `onPlay(video)`. |
| `src/components/VideoLightbox.tsx` | Modal dialog rendering the YouTube iframe at 16:9. Esc + backdrop + ✕ close; focus trap/return. |
| `src/components/MediaToggle.tsx` | Vídeos/Fotos pill pair. Vídeos = active `Link` to `/momentos/videos`; Fotos = disabled `<button aria-disabled title="Em breve">`. |

### Edited files

| File | Change |
|---|---|
| `src/routes.tsx` | Add `momentos` and `momentos/videos` routes → `MomentosPage`. No `fotos` route. |
| `src/content/content.json` | Add `pages.momentos.header` (title + subtitle). |
| `src/content/types.ts` | Add a narrow momentos page shape (`header` + `videos`) for the selector. `Video` type already exists and fits. |
| `src/components/VideoEmbed.tsx` | Superseded by `VideoLightbox`. Remove if unused after the change; otherwise leave. |

### View-model

```ts
interface VideoCardVm {
  slug: string
  title: string
  thumbnail: string   // img.youtube.com/vi/{id}/hqdefault.jpg
  embedUrl: string    // youtube.com/embed/{id}?autoplay=1
  watchUrl: string    // youtube.com/watch?v={id}
}
```

---

## 5. Data flow

`SiteLayout` (already calls `useContent`) → Outlet context →
`MomentosPage` reads context → selectors produce header + `VideoCardVm[]`
(thumbnails/URLs derived via `youtube.ts`) → props down to `VideoGallery` →
`VideoCard` / `VideoLightbox`. No presentational component imports content or
parses URLs.

---

## 6. Interaction & accessibility

- **Play**: `VideoCard`'s play button (and the thumbnail) is a `<button>` with
  `aria-label="Assistir: {title}"`. Clicking calls `onPlay`; `VideoGallery` sets
  the open video; `VideoLightbox` mounts with `embedUrl` (`autoplay=1`).
- **Modal**: `role="dialog"`, `aria-modal="true"`, labelled by the video title.
  Closes on Esc, backdrop click, and ✕ button. Focus moves into the dialog on
  open and returns to the triggering card's play button on close. Iframe uses
  the same `allow`/`allowFullScreen` attributes as the current `VideoEmbed`.
- **YouTube link**: `<a href={watchUrl} target="_blank" rel="noopener">` with a
  visually-hidden "(abre em nova aba)" and an inline external-link SVG (↗).
- **Fotos pill**: disabled button, `aria-disabled="true"`, `title="Em breve"`,
  styled as inactive; not focusable as a link.
- **Icons**: inline SVG only (play triangle, external-link arrow). No icon-font
  dependency is added (the mockup's Material Symbols are not used).

---

## 7. Testing (TDD, RED → GREEN → REFACTOR)

| Test | Tool | Covers |
|---|---|---|
| `src/lib/youtube.test.ts` | Vitest | ID extraction from an `/embed/` URL; derived thumbnail/watch/embed URLs; malformed/non-YouTube URL handling. |
| `src/features/momentos/momentosSelectors.test.ts` | Vitest | Header copy; videos sorted by `order`; derived fields present. |
| `VideoCard.test.tsx` | Testing Library | Renders thumbnail + title; play button calls `onPlay`; external link has correct `href`/`target`/`rel`. |
| `VideoLightbox.test.tsx` | Testing Library | Renders iframe with `embedUrl`; Esc and backdrop close; `role="dialog"`. |
| `VideoGallery.test.tsx` | Testing Library | Two cards; clicking play opens the dialog with the right video; closing removes it. |
| `MediaToggle.test.tsx` | Testing Library | Vídeos is an active link; Fotos is disabled/inert. |
| `tests/e2e/momentos.spec.ts` | Playwright | `/momentos` loads; two video cards; play opens the modal. |

---

## 8. Out of scope (deferred)

- Fotos page / photo gallery view and its `/momentos/fotos` route.
- Rewriting `content.json` video titles to the mockup's curated versions.
- "Carregar Mais" / pagination (removed from the mockup).

---

## 9. Verification (before completion)

Run and confirm green: `pnpm lint`, `pnpm build` (type-check), `pnpm test`,
`pnpm test:e2e`. Drive `/momentos` in the browser (Playwright MCP) to confirm
thumbnails render, the modal plays, and the YouTube link opens.
