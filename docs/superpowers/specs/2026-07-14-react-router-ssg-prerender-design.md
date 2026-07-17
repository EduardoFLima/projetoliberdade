# SEO Prerender via React Router v8 Framework Mode — Design

**Date:** 2026-07-14
**Status:** Approved
**Replaces:** Roadmap item 4's original plan to add `vite-react-ssg`.

## Decision

Adopt **React Router v8 framework mode** with built-in prerendering (`ssr: false` + `prerender`) to generate static HTML per route with per-page `<title>` / Open Graph tags. Drop the planned `vite-react-ssg` dependency.

### Why not vite-react-ssg

- Its maintainers now direct React Router v7+ users to the router's official SSG; the library's own SSG focus is React Router v6.
- Compatibility with react-router v8 (already this project's installed version, in library mode) is unclear.
- It would add a third-party runtime path for something the already-shipped router does natively.

### Why not a DIY post-build snapshot

Hand-rolled (renderToString or headless-browser scripts), no meta API, fragile, and it would still require the same async-content rework described below.

### Compatibility verified

- `@react-router/dev@8.2.0` peer-depends on `vite: ^7.0.0 || ^8.0.0` (project is on Vite 8.1) and `typescript ^5.1 || ^6.0` (project is on TS 6.0).
- react-router 8.2 declares `engines.node >=22.22.0` — stricter than the repo's previous `^20.19.0 || >=22.12.0`; with `.npmrc` `engine-strict=true` this requires bumping the repo `engines` (and the README Node prerequisite) as part of the migration.
- React 19 is supported.

## Key constraint discovered

`useContent` resolves content inside a `useEffect`, and `SiteLayout` renders "Carregando…" until it settles. Effects do not run during build-time rendering, so **any** SSG approach would emit loading-shell HTML. Content resolution must move to a route **loader** the build can await. This is the core of the design.

## Design

### 1. Tooling & structure

- Add `@react-router/dev@^8.2` as a dev dependency; bump `react-router` to `^8.2`.
- `vite.config.ts`: replace the `react()` plugin with `reactRouter()` (Tailwind plugin unchanged). Move the vitest block to a new `vitest.config.ts` that keeps using `@vitejs/plugin-react` (retained for tests only) — the React Router plugin does not run under vitest.
- New `react-router.config.ts`:
  - `appDirectory: 'src'` — the current tree is kept; no `app/` rename.
  - `ssr: false` — fully static output, no runtime server.
  - `prerender()` function that reads `src/content/content.json` to enumerate every path: `/`, `/historia`, `/servicos`, `/servicos/<slug>` for each of the 8 service slugs, `/momentos`, `/momentos/videos`, `/momentos/fotos`, `/contato`, `/estilo`. Reading `content.json` from build config does not violate the dependency rule, which governs `features`/`components`/`layouts` only.
- `index.html` and `src/main.tsx` are replaced by `src/root.tsx`: the document shell (`Layout` export with `<html lang="pt-BR">`, favicons, viewport, default title, `Meta`/`Links`/`Scripts`) plus the font and `index.css` imports.

### 2. Routes

- `src/routes.ts` is rewritten in `RouteConfig` form: `layout('layouts/SiteLayout.tsx', [...])` wrapping the page routes, plus a catch-all 404 route module.
- Framework mode requires each route to be a distinct module with a default export:
  - Page files gain `export default`.
  - The three momentos URLs share one component, so `/momentos/videos` and `/momentos/fotos` get thin wrapper modules re-exporting `MomentosPage`.
- URLs are unchanged. Unknown paths still resolve client-side via the catch-all; the host serves the SPA fallback as today.

### 3. Content & data flow

- `SiteLayout` gains a **`loader`** calling `contentRepository.getContent()`. At build time it runs per prerendered path, so emitted HTML contains real content. Client-side navigations pick up the prerendered `.data` files automatically.
- `SiteLayout` receives `loaderData` and keeps passing content via `<Outlet context={content}>` — **page containers and presentational components are untouched**, and the dependency rule survives: the layout route module is the single touchpoint on the repository.
- The `useContent` hook is retired. The inline loading/error paragraphs are replaced by a route `ErrorBoundary`.
- The future RTDB repository (roadmap step 5) swaps in behind the same loader. **How SSG interacts with runtime RTDB fetching is explicitly deferred to the step-5 brainstorm**; this design targets the bundled `content.json` only.

### 4. Per-page meta

Each page route module exports a `meta` function deriving `<title>`, description, and Open Graph tags from the layout loader's content (accessed via `matches`). Tags are baked into the static HTML at build time, visible to crawlers without JavaScript.

### 5. Scripts, testing & verification

- Scripts: `dev` → `react-router dev`; `build` → `react-router typegen && tsc -b && react-router build`; `preview` → `sirv-cli` serving `build/client` with `--single __spa-fallback.html` (the tool and fallback file React Router's docs prescribe when `/` is prerendered — plain `--single` would serve the prerendered home HTML for unknown paths). `tsconfig` gains the generated-types wiring (`.react-router/types`, `rootDirs`).
- Unit tests: `renderWithRouter` (MemoryRouter) keeps working for pages and components. Tests that mount `SiteLayout` use a shared `renderWithSiteLayout` helper (`createMemoryRouter` with the layout's `loader` and a `HydrateFallback`), replacing the router setup duplicated across five test files.
- Playwright config needs no change: its `webServer` already runs `pnpm dev`, which maps to the new `react-router dev` script on the same port (5173).
- Verification adds a build-output check: prerendered HTML files (e.g. `build/client/historia/index.html`) must contain real page content and the correct `<title>`.

## Error handling

- Loader failure (content unresolvable) fails the **build** for prerendered paths — a content bug can no longer ship as a blank page.
- At runtime, unexpected route errors render the layout `ErrorBoundary` instead of the old inline error paragraph.
- Unknown URLs render the catch-all 404 route client-side.

## Out of scope

- Firebase RTDB integration and its SSG interaction (roadmap step 5).
- Deploy pipeline / hosting configuration.
- Content-editing workflow.

## README updates required

- Roadmap item 4: replace the `vite-react-ssg` plan with this design.
- Architecture/dependency-rule wording: the layout **loader** (not the `useContent` hook) is the single repository touchpoint.
- Commands section: new `dev`/`build`/`preview` scripts.
