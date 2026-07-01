# Projeto Liberdade — Frontend

Brochure website for **Projeto Liberdade** (Brazilian equine-therapy /
rehabilitation organization). Content-driven: today from a bundled
`content.json` snapshot; later from Firebase Realtime Database (RTDB) at runtime
with the JSON as fallback.

## Stack

- TypeScript 6 (strict), React 19, Vite 8
- React Router v8 (library/data mode: `createBrowserRouter` + `RouterProvider`)
- Tailwind CSS v4 via `@tailwindcss/vite` + `@import "tailwindcss"` in
  `src/index.css` (no `tailwind.config.js`, no PostCSS)
- Vitest + Testing Library (unit), Playwright (E2E)
- pnpm, ESLint flat config + Prettier (no semicolons, single quotes, trailing commas)

## Commands

```bash
pnpm install       # install deps
pnpm dev           # dev server (http://localhost:5173)
pnpm build         # type-check + production build
pnpm preview       # preview the build
pnpm lint          # eslint
pnpm format        # prettier --write
pnpm test          # vitest (unit)
pnpm test:e2e      # playwright (e2e)
```

## Structure

```
src/
  content/      # THE boundary — data-source isolation
    types.ts                  # domain types (loose during scaffold)
    ContentRepository.ts      # port (interface)
    JsonContentRepository.ts  # adapter — bundled content.json (now)
    content.ts                # binding: selects the active repository
    useContent.ts             # hook used by the UI
    content.json              # snapshot copied from docs/resources
  features/     # one folder per page (deferred)
  components/   # shared UI + blocks/ renderers (deferred)
  layouts/      # SiteLayout shell
  lib/          # small utils (deferred)
  routes.tsx    # router config
  main.tsx      # SPA entry
  index.css     # @import "tailwindcss";
tests/e2e/      # Playwright specs
```

## The dependency rule (non-negotiable)

`features`, `components`, and `layouts` access content **only** through
`useContent` / `ContentRepository`. Never import `content.json` directly in UI;
never reference Firebase outside `src/content`.

## Swapping to Firebase RTDB (later)

1. Add `src/content/RtdbContentRepository.ts` implementing `ContentRepository`
   (`getContent(): Promise<SiteContent>`), fetching from RTDB and falling back
   to the bundled snapshot.
2. Change the one binding in `src/content/content.ts` to use it.
   Nothing in the UI changes — the seam is already async.

## Content conventions

Content model is locked in
`docs/superpowers/specs/2026-06-30-content-json-redesign-design.md`:
English keys, Portuguese content values, slugs double as URL paths
(`/servicos/equoterapia`). `body` is an ordered array of typed blocks
(discriminator `type`). 5 pages: home, historia, servicos, momentos, contato.

## Tooling (MCP)

- **Always use Context7** to check coding documentation before relying on memory
  for any library, framework, SDK, or API (React, Vite, Tailwind, React Router,
  Firebase, etc.) — training data may be stale.
- **Use the Playwright MCP server** whenever browser automation is required
  (driving the app, inspecting the DOM, taking screenshots, verifying page
  behavior).

## Code style

Small, single-responsibility files. Typed content. No prop-drilling of the data
source. Tests: Vitest for the content layer and pure utils; Playwright for page
behavior.

## Phase map / TODO (build in this order)

This repo is currently **scaffold only**. Deferred work, in order:

1. **Design tokens / Tailwind theme** — colors, typography, spacing.
2. **Shared components** — Header, Footer, Nav, Gallery; `blocks/` renderers
   per `Block.type`. Flesh out full content types in `src/content/types.ts`
   and add runtime validation (mirror `scripts/validate_content.py`).
3. **Pages / content** — real routes for home, historia, servicos
   (+ `/servicos/:slug`), momentos, contato; migrate images from
   `docs/resources/` into the app.
4. **SEO prerender** — add `vite-react-ssg` for static HTML per route +
   per-page `<title>` / Open Graph tags.
5. **Firebase RTDB** — `RtdbContentRepository` + runtime fetch with fallback.
