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

## Design system ("Organic Freedom")

- Tokens live in `src/index.css` as a Tailwind v4 `@theme` block — the single
  source of truth. Reference: `docs/design/organic-freedom/DESIGN.md`.
- **Hybrid palette:** the full MD3 color set is imported verbatim; the brand
  layer adds `--color-cta` (#00aa5a vibrant, CTA fill), `--color-cta-hover` /
  `--color-cta-strong` / `--color-link` (#006d38 for hover, compact buttons, and
  small green text).
- **Primary buttons** use `#00aa5a` with a white label at `text-button`
  (≥18.66px/700) so white-on-green meets WCAG AA (large text, 3:1); compact
  buttons use `#006d38`.
- Fonts: Plus Jakarta Sans + Work Sans, self-hosted via `@fontsource` and
  imported in `src/main.tsx`.
- Components are viewable at the dev route **`/estilo`**.

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
    home/       # HomePage container + homeSelectors
  components/   # shared, prop-driven UI
    ui/                       # Button, Chip, Card, Container, Section
    blocks/                   # BlockRenderer + one renderer per Block.type
    sections/                 # reusable, prop-driven page sections (Hero, Historia, MVV, Services)
    Header.tsx Nav.tsx Footer.tsx SocialLinks.tsx Gallery.tsx Lightbox.tsx VideoEmbed.tsx
  styleguide/   # StyleGuide.tsx (dev-only, route /estilo)
  layouts/      # SiteLayout shell
  lib/          # cn() and small utils
  routes.tsx    # router config
  main.tsx      # SPA entry
  index.css     # @import "tailwindcss";
tests/e2e/      # Playwright specs
```

## The dependency rule (non-negotiable)

`features`, `components`, and `layouts` never import `content.json` or reference
Firebase. Containers (the routed `SiteLayout` and, later, page components) call
`useContent`; presentational components receive content via props only.

Container content flows to pages via the router `Outlet` context (`SiteLayout`
provides it; page containers read it with `useOutletContext`).

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

1. ~~**Design tokens / Tailwind theme** — colors, typography, spacing.~~ Done —
   see the "Design system" section above.
2. ~~**Shared components** — Header, Footer, Nav, Gallery; `blocks/` renderers
   per `Block.type`.~~ Done — see `src/components/` and `/estilo`.
3. **Pages / content** — home page **done** (redesign implemented: Hero,
   História, Missão/Visão/Valores, featured Serviços; reusable section
   components in `src/components/sections/`). Remaining: historia, servicos
   (+ `/servicos/:slug`), momentos, contato; bulk image migration; full
   content types + runtime validation.
4. **SEO prerender** — add `vite-react-ssg` for static HTML per route +
   per-page `<title>` / Open Graph tags.
5. **Firebase RTDB** — `RtdbContentRepository` + runtime fetch with fallback.
