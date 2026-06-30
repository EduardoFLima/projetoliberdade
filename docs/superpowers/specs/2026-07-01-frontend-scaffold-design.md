# Frontend Scaffold — Design Spec

**Date:** 2026-07-01
**Status:** Approved (design); ready for implementation planning
**Scope:** **Scaffold only.** Stand up the project skeleton, tooling, and the one
architectural seam. No design tokens, no real components/pages, no block renderers,
no SEO prerendering yet — those are explicitly deferred to later phases.

## 1. Purpose

Scaffold the front-end for the **Projeto Liberdade** brochure website (a Brazilian
equine-therapy / rehabilitation organization). The result is a project that
**installs, builds, runs, lints, and tests green**, with the folder structure and the
single content-source boundary established. Everything else is stubbed and documented
as TODO so future phases stay aligned.

This phase deliberately does **not** build UI. The user will define design tokens and
components next; pages and content rendering come after that.

## 2. Context (already locked elsewhere)

- The content model is finalized in
  `docs/superpowers/specs/2026-06-30-content-json-redesign-design.md`:
  global `site` node + `navigation` tree + `pages` map keyed by slug; English keys,
  Portuguese values, slugs double as URL paths; `body` is an ordered array of typed
  blocks (`type` discriminator).
- **Consumption model:** the front-end will fetch content from Firebase Realtime
  Database (RTDB) at runtime *later*, falling back to `content.json`. **For now the app
  uses `content.json` only.** Firebase is not wired in this phase — only the seam for it.
- Canonical content + assets live under `docs/resources/` (`content.json`, `fotos/`,
  `hero/`, `icons/`, `logo.png`).

## 3. Decisions (locked)

1. **Rendering:** Vite SPA. Build-time prerendering (`vite-react-ssg`) for SEO/social
   previews is **deferred** — standard Vite SPA entry now; add prerender once real
   pages exist.
2. **Architecture:** Feature-first organization with a **single real boundary** — the
   content source. UI never imports `content.json` or Firebase directly; it goes
   through `ContentRepository` / `useContent`. No deeper clean-architecture ceremony
   (no interactors / DTOs / mapper layers) — YAGNI for a 5-page brochure site.
3. **Content seam depth (this phase):** *Minimal* — `ContentRepository` interface +
   `JsonContentRepository` stub that loads `content.json`, plus a small `types.ts`
   skeleton. Full block typing + validation is deferred to the component/content phase.
4. **Testing:** Vitest (unit) + Playwright (E2E), each proven with **one** trivial
   passing test. Real suites are deferred.
5. **Package manager:** pnpm.

## 4. Tech Stack & Versions

Versions verified current/stable via Context7 on 2026-07-01.

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------ |
| Language       | TypeScript 5 (strict)                                         |
| UI             | React 19                                                      |
| Build          | Vite 7                                                        |
| Routing        | React Router v7 (library / data mode: `createBrowserRouter`) |
| Styling        | Tailwind CSS v4 via `@tailwindcss/vite` + `@import "tailwindcss"` (no `tailwind.config.js`, no PostCSS) |
| Unit tests     | Vitest + @testing-library/react + jsdom                      |
| E2E tests      | Playwright                                                    |
| Package mgr    | pnpm                                                          |
| Lint / format  | ESLint (flat config) + Prettier                              |

## 5. Architecture & Folder Structure

```
src/
  content/                      # THE boundary — data-source isolation
    types.ts                    # minimal skeleton: Site, NavItem, Page (loose for now)
    ContentRepository.ts        # interface (port)
    JsonContentRepository.ts    # adapter — imports content.json (now)
    content.ts                  # provider: selects the active repository
    useContent.ts               # hook used by features
    # RtdbContentRepository.ts  ← future, same interface, swap one line
  features/                     # (empty + README stub this phase)
  components/
    blocks/                     # (empty + README stub this phase)
  layouts/
    SiteLayout.tsx              # header/footer shell + <Outlet/> (placeholder header/footer)
  lib/                          # tiny utils (e.g. cn(), asset path) — minimal
  routes.tsx                    # route config
  main.tsx                      # SPA entry (RouterProvider)
  index.css                     # @import "tailwindcss";
public/
  content.json                  # copied from docs/resources (served data for the seam)
tests/
  e2e/
    smoke.spec.ts               # one Playwright smoke test
src/content/JsonContentRepository.test.ts   # one Vitest unit test
```

**Dependency rule:** `features`, `components`, and `layouts` depend on the content
layer **only** through `ContentRepository` / `useContent`. They never import
`content.json` directly and never reference Firebase. Swapping JSON → RTDB later means
adding `RtdbContentRepository` (same interface) and changing one line in `content.ts`.

**Data flow (this phase):** `content.json` → `JsonContentRepository` → `useContent()` →
placeholder route renders proof-of-life (e.g. site name from content). No block
rendering yet.

## 6. What the scaffold contains

1. **Project init** — Vite + React + TS (strict), pnpm, ESLint flat config + Prettier,
   `.editorconfig`, scripts in `package.json`.
2. **Tailwind v4** — plugin + `@import "tailwindcss"` in `index.css`. Configured only;
   **no tokens/theme/colors** (next phase).
3. **Routing skeleton** — `createBrowserRouter` with `SiteLayout` + one placeholder
   index route + a `*` not-found. Placeholder header/footer are non-styled stubs.
4. **Content seam (minimal)** — interface + JSON adapter + provider + hook + skeleton
   types, returning content from `content.json`.
5. **Empty structure** — `features/`, `components/blocks/`, `lib/` with short README/
   `.gitkeep` stubs explaining what goes there.
6. **Tests** — one passing Vitest unit test (adapter loads content) + one Playwright
   smoke test (placeholder route loads, shows expected text). `package.json` scripts:
   `dev`, `build`, `preview`, `lint`, `format`, `test` (Vitest), `test:e2e` (Playwright).
7. **Assets** — copy `content.json` into `public/`. Full image library migration is
   deferred; originals under `docs/resources/` are **not** deleted.
8. **`CLAUDE.md`** at repo root (see §8).

## 7. Explicitly OUT of scope (deferred, recorded as TODO in CLAUDE.md)

- Design tokens / Tailwind theme / color system
- Real pages (home, história, serviços, momentos, contato)
- Shared components (Header, Footer, Nav, Gallery) and block renderers
- Full content typing for all `Block` variants + runtime validation
- Full image-asset migration + image-path resolution helper
- `vite-react-ssg` prerendering and per-page SEO / Open Graph head tags
- Firebase RTDB adapter and runtime fetching
- Real Vitest / Playwright test suites

## 8. CLAUDE.md (deliverable)

A root `CLAUDE.md` that preserves structure and decisions for future sessions:

- Project summary + that it is a brochure site driven by `content.json` (RTDB later).
- Stack & pinned major versions (§4).
- Folder structure (§5) and the **dependency rule** (UI → content only via the port).
- Where the Firebase adapter goes later and how to swap it in.
- Content-model conventions (link to the content-json redesign spec; English keys /
  Portuguese values / slugs as URLs).
- Commands: install, dev, build, lint, format, test, test:e2e.
- Phase map / TODO list mirroring §7 so the build order stays: **tokens → components →
  pages/content → SEO prerender → Firebase**.
- Code-style conventions: small focused files, one responsibility, typed content,
  no direct `content.json` imports in UI.

## 9. Success criteria

- `pnpm install` succeeds.
- `pnpm dev` serves the placeholder route showing data sourced through the content seam.
- `pnpm build` produces a production bundle.
- `pnpm lint` and `pnpm format --check` pass clean.
- `pnpm test` (Vitest) and `pnpm test:e2e` (Playwright) each run one green test.
- Folder structure and `CLAUDE.md` match this spec; deferred items are listed as TODO.
