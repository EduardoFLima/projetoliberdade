# React Router v8 Framework-Mode SSG Prerender Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Statically prerender every route of the site with real content and per-page `<title>`/Open Graph tags, using React Router v8 framework mode (`ssr: false` + `prerender`) instead of the previously planned `vite-react-ssg`.

**Architecture:** The SPA (library-mode `createBrowserRouter`) migrates to framework mode: `@react-router/dev` Vite plugin, `react-router.config.ts` (`appDirectory: 'src'`, `ssr: false`, `prerender` list built from `content.json`), `src/root.tsx` document shell replacing `index.html`/`main.tsx`, and `src/routes.ts` in `RouteConfig` form. Content resolution moves from the `useContent` effect (which would prerender "Carregando…" shells) to a `loader` on the `SiteLayout` route module, plus a `clientLoader` so the SPA-fallback (unknown 404 URLs) can hydrate. Pages keep reading content via `useOutletContext` — no page or presentational component changes.

**Tech Stack:** React 19, react-router 8.2 (framework mode), `@react-router/dev` 8.2, Vite 8, Tailwind 4, Vitest 4, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-14-react-router-ssg-prerender-design.md`

## Global Constraints

- Node `^20.19.0 || >=22.12.0` (engines already enforce this).
- `react-router` and `@react-router/dev` at `^8.2.0`; `@react-router/dev` peer-supports `vite ^7.0.0 || ^8.0.0` (project is on Vite 8.1) and `typescript ^5.1 || ^6.0` (project is on TS 6.0).
- No new **runtime** dependencies. New dev dependencies only: `@react-router/dev`, `sirv-cli`.
- Public URLs must not change: `/`, `/historia`, `/servicos`, `/servicos/:slug`, `/momentos`, `/momentos/videos`, `/momentos/fotos`, `/contato`, `/estilo`, plus client-side 404 for unknown paths.
- Dependency rule (README): files under `features`, `components`, `layouts` never import `content.json` or reference Firebase directly. The `SiteLayout` route module's loader becomes the single repository touchpoint. Build config (`react-router.config.ts`) may read `content.json` — the rule does not govern build config.
- RTDB↔SSG interaction is out of scope (deferred to the roadmap step-5 brainstorm).
- Code style: Prettier defaults — no semicolons, single quotes, trailing commas. English keys, Portuguese copy.
- Every task ends green: `npm run lint`, `npm test`, and (from Task 4 on) `npm run build` must pass before each commit.

---

### Task 1: Dependencies + standalone Vitest config

The React Router Vite plugin (added in Task 4) cannot run under Vitest, so Vitest gets its own config file first, while the build still uses the old pipeline. Everything stays green.

**Files:**
- Modify: `package.json` (dependencies only — scripts change in Task 4)
- Create: `vitest.config.ts`
- Modify: `vite.config.ts`
- Modify: `tsconfig.node.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `vitest.config.ts` used automatically by `vitest` (it takes precedence over `vite.config.ts`); packages `@react-router/dev@^8.2.0`, `sirv-cli`, `react-router@^8.2.0` available for later tasks.

- [ ] **Step 1: Install dependencies**

```bash
npm install react-router@^8.2.0
npm install -D @react-router/dev@^8.2.0 sirv-cli
```

Expected: `package.json` shows `"react-router": "^8.2.0"` under dependencies, `"@react-router/dev": "^8.2.0"` and `"sirv-cli"` under devDependencies. Peer-dependency warnings about optional peers (`wrangler`, `@vitejs/plugin-rsc`, etc.) are fine.

- [ ] **Step 2: Create `vitest.config.ts`**

Move the test config out of `vite.config.ts`, verbatim:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
  },
})
```

- [ ] **Step 3: Slim `vite.config.ts` to build-only concerns**

Replace the whole file with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

(The `react()` plugin is swapped for `reactRouter()` in Task 4.)

- [ ] **Step 4: Add `vitest.config.ts` to `tsconfig.node.json`**

Change the `include` line:

```json
  "include": ["vite.config.ts", "vitest.config.ts"]
```

- [ ] **Step 5: Verify everything is still green**

```bash
npm run lint && npm test && npm run build
```

Expected: lint clean, all existing Vitest suites pass (Vitest picks up `vitest.config.ts`), `tsc -b && vite build` succeeds.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vite.config.ts tsconfig.node.json
git commit -m "chore: add @react-router/dev + sirv-cli, split vitest config out of vite config"
```

---

### Task 2: `pageMeta` helper (TDD)

A pure helper that builds the meta-descriptor arrays every page's `meta` export will return, plus a tolerant accessor for the loosely-typed `hero.subtitle` fields.

**Files:**
- Create: `src/lib/meta.ts`
- Test: `src/lib/meta.test.ts`

**Interfaces:**
- Consumes: `MetaDescriptor` type from `react-router`; `Page` type from `src/content/types.ts` (`{ slug: string; title: string; [key: string]: unknown }`).
- Produces:
  - `pageMeta(title: string, description?: string): MetaDescriptor[]` — returns `[{ title }, { property: 'og:title', … }, { property: 'og:type', content: 'website' }]`, plus `description`/`og:description` entries when a description is given.
  - `heroSubtitle(page: Page): string | undefined` — returns `page.hero.subtitle` when it is a string, else `undefined`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/meta.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { heroSubtitle, pageMeta } from './meta'

describe('pageMeta', () => {
  it('builds title and Open Graph tags', () => {
    expect(pageMeta('História — Projeto Liberdade')).toEqual([
      { title: 'História — Projeto Liberdade' },
      { property: 'og:title', content: 'História — Projeto Liberdade' },
      { property: 'og:type', content: 'website' },
    ])
  })

  it('adds description tags when a description is given', () => {
    const tags = pageMeta('Título', 'Descrição da página')
    expect(tags).toContainEqual({
      name: 'description',
      content: 'Descrição da página',
    })
    expect(tags).toContainEqual({
      property: 'og:description',
      content: 'Descrição da página',
    })
  })
})

describe('heroSubtitle', () => {
  it('returns the hero subtitle when present', () => {
    expect(
      heroSubtitle({ slug: 'x', title: 'X', hero: { subtitle: 'Sub' } }),
    ).toBe('Sub')
  })

  it('returns undefined when the page has no hero', () => {
    expect(heroSubtitle({ slug: 'x', title: 'X' })).toBeUndefined()
  })

  it('returns undefined when the subtitle is not a string', () => {
    expect(
      heroSubtitle({ slug: 'x', title: 'X', hero: { subtitle: 42 } }),
    ).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run src/lib/meta.test.ts
```

Expected: FAIL — `Cannot find module './meta'` (or equivalent resolve error).

- [ ] **Step 3: Write the implementation**

Create `src/lib/meta.ts`:

```ts
import type { MetaDescriptor } from 'react-router'
import type { Page } from '../content/types'

/**
 * Builds the meta-descriptor array returned by route-module `meta` exports:
 * document title plus Open Graph tags, with optional description.
 */
export function pageMeta(
  title: string,
  description?: string,
): MetaDescriptor[] {
  const tags: MetaDescriptor[] = [
    { title },
    { property: 'og:title', content: title },
    { property: 'og:type', content: 'website' },
  ]
  if (description) {
    tags.push(
      { name: 'description', content: description },
      { property: 'og:description', content: description },
    )
  }
  return tags
}

/**
 * Page blocks are loosely typed ([key: string]: unknown), so hero subtitles
 * are read defensively for use as meta descriptions.
 */
export function heroSubtitle(page: Page): string | undefined {
  const hero = (page as { hero?: { subtitle?: unknown } }).hero
  return typeof hero?.subtitle === 'string' ? hero.subtitle : undefined
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run src/lib/meta.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/meta.ts src/lib/meta.test.ts
git commit -m "feat(meta): add pageMeta/heroSubtitle helpers for route meta exports"
```

---

### Task 3: Route-module component exports + shared layout test helper

Framework mode requires each route to be a distinct module with a **default** export. This task adds default exports (keeping the named ones — tests import them), creates the 404 page and the momentos wrapper modules, consolidates the copy-pasted `createMemoryRouter` setup in five test files into one helper, and prepares ESLint for route-module exports. No behavior change; everything stays green on the old router.

**Files:**
- Modify: `src/features/home/HomePage.tsx`, `src/features/historia/HistoriaPage.tsx`, `src/features/servicos/ServicosPage.tsx`, `src/features/momentos/MomentosPage.tsx`, `src/features/contato/ContatoPage.tsx`, `src/styleguide/StyleGuide.tsx` (add default exports)
- Create: `src/features/not-found/NotFoundPage.tsx`, `src/features/momentos/MomentosVideosRoute.tsx`, `src/features/momentos/MomentosFotosRoute.tsx`
- Modify: `src/test/render.tsx` (add `renderWithSiteLayout`)
- Modify: `src/features/home/HomePage.test.tsx`, `src/features/historia/HistoriaPage.test.tsx`, `src/features/contato/ContatoPage.test.tsx`, `src/features/momentos/MomentosPage.test.tsx`, `src/layouts/SiteLayout.test.tsx` (use the helper)
- Modify: `eslint.config.js` (ignores + route-module export allowances)

**Interfaces:**
- Consumes: `pageMeta` from Task 2 (`src/lib/meta.ts`).
- Produces:
  - Default exports on all six page/styleguide modules (same components as the existing named exports).
  - `NotFoundPage` default export + `meta()` at `src/features/not-found/NotFoundPage.tsx`.
  - `MomentosVideosRoute` / `MomentosFotosRoute` default exports rendering `<MomentosPage />`.
  - `renderWithSiteLayout(children: RouteObject[], opts?: { route?: string })` in `src/test/render.tsx` — mounts children inside `SiteLayout` at `path: '/'` and renders with a memory router. Task 4 rewires only this helper for the loader-based layout.

- [ ] **Step 1: Add default exports to the six page modules**

At the end of each file add one line (component name per file):

```tsx
// src/features/home/HomePage.tsx
export default HomePage
```

```tsx
// src/features/historia/HistoriaPage.tsx
export default HistoriaPage
```

```tsx
// src/features/servicos/ServicosPage.tsx
export default ServicosPage
```

```tsx
// src/features/momentos/MomentosPage.tsx
export default MomentosPage
```

```tsx
// src/features/contato/ContatoPage.tsx
export default ContatoPage
```

```tsx
// src/styleguide/StyleGuide.tsx
export default StyleGuide
```

- [ ] **Step 2: Create the 404 route module**

Create `src/features/not-found/NotFoundPage.tsx` (replaces the inline `NotFound` in `routes.tsx`, which Task 4 deletes):

```tsx
import { pageMeta } from '../../lib/meta'

export function meta() {
  return pageMeta('Página não encontrada — Projeto Liberdade')
}

export default function NotFoundPage() {
  return <p className="p-4">404 — página não encontrada</p>
}
```

- [ ] **Step 3: Create the momentos wrapper route modules**

Framework mode maps each URL to a unique file; `/momentos/videos` and `/momentos/fotos` reuse `MomentosPage` (which switches on `useLocation().pathname`). Create `src/features/momentos/MomentosVideosRoute.tsx`:

```tsx
import MomentosPage from './MomentosPage'

export default function MomentosVideosRoute() {
  return <MomentosPage />
}
```

Create `src/features/momentos/MomentosFotosRoute.tsx`:

```tsx
import MomentosPage from './MomentosPage'

export default function MomentosFotosRoute() {
  return <MomentosPage />
}
```

(Their `meta` exports are added in Task 5, after typegen exists.)

- [ ] **Step 4: Add `renderWithSiteLayout` to `src/test/render.tsx`**

Replace the whole file with:

```tsx
import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router'
import { SiteLayout } from '../layouts/SiteLayout'

export function renderWithRouter(ui: ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

/** Mounts routes as children of SiteLayout, the way the app composes pages. */
export function renderWithSiteLayout(
  children: RouteObject[],
  { route = '/' } = {},
) {
  const router = createMemoryRouter(
    [{ path: '/', Component: SiteLayout, children }],
    { initialEntries: [route] },
  )
  return render(<RouterProvider router={router} />)
}
```

- [ ] **Step 5: Switch the five test files to the helper**

`src/features/home/HomePage.test.tsx` — replace the imports and `renderHome` with:

```tsx
import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { HomePage } from './HomePage'

function renderHome() {
  return renderWithSiteLayout([{ index: true, Component: HomePage }])
}
```

(All `describe`/`it` blocks stay as they are.)

`src/features/historia/HistoriaPage.test.tsx` — same pattern:

```tsx
import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { HistoriaPage } from './HistoriaPage'

function renderHistoria() {
  return renderWithSiteLayout([{ path: 'historia', Component: HistoriaPage }], {
    route: '/historia',
  })
}
```

`src/features/contato/ContatoPage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { ContatoPage } from './ContatoPage'

function renderContato() {
  return renderWithSiteLayout([{ path: 'contato', Component: ContatoPage }], {
    route: '/contato',
  })
}
```

`src/features/momentos/MomentosPage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { MomentosPage } from './MomentosPage'

function renderAt(path: string) {
  return renderWithSiteLayout(
    [
      { path: 'momentos', Component: MomentosPage },
      { path: 'momentos/fotos', Component: MomentosPage },
    ],
    { route: path },
  )
}
```

`src/layouts/SiteLayout.test.tsx` — replace imports and `renderLayout`, keep `ContextProbe` and all assertions:

```tsx
import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { useOutletContext } from 'react-router'
import type { SiteContent } from '../content/types'
import { renderWithSiteLayout } from '../test/render'

function ContextProbe() {
  const content = useOutletContext<SiteContent>()
  return <p>página de {content.site.name}</p>
}

function renderLayout() {
  return renderWithSiteLayout([{ index: true, Component: ContextProbe }])
}
```

- [ ] **Step 6: Prepare ESLint for route modules**

In `eslint.config.js`, change the ignores line and add a `rules` block to the existing `files: ['**/*.{ts,tsx}']` object (after `languageOptions`):

```js
  { ignores: ['dist', 'build', '.react-router'] },
```

```js
    rules: {
      // Route modules export meta/loader/etc. alongside their component.
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: [
            'meta',
            'links',
            'headers',
            'handle',
            'loader',
            'clientLoader',
            'action',
            'clientAction',
            'ErrorBoundary',
            'HydrateFallback',
            'shouldRevalidate',
          ],
        },
      ],
    },
```

- [ ] **Step 7: Verify green**

```bash
npm run lint && npm test && npm run build
```

Expected: all pass. Test count unchanged from Task 2.

- [ ] **Step 8: Commit**

```bash
git add -A src eslint.config.js
git commit -m "refactor: route-module default exports, 404 page, momentos wrappers, shared layout test helper"
```

---

### Task 4: Framework-mode cutover

The atomic switch: config, document shell, route config, layout loader, entry/hook deletions, scripts, tsconfig, gitignore, and the test helper rewire. The app cannot build in a halfway state, so this is one task with one commit; the steps are small and ordered.

**Files:**
- Create: `react-router.config.ts`, `src/root.tsx`, `src/routes.ts`
- Delete: `src/routes.tsx`, `index.html`, `src/main.tsx`, `src/content/useContent.ts`
- Modify: `src/layouts/SiteLayout.tsx`, `vite.config.ts`, `package.json` (scripts), `tsconfig.app.json`, `tsconfig.node.json`, `src/test/render.tsx`, `.gitignore`

**Interfaces:**
- Consumes: default exports and `renderWithSiteLayout` from Task 3; `contentRepository: ContentRepository` (`getContent(): Promise<SiteContent>`) from `src/content/content.ts`.
- Produces:
  - `SiteLayout` route module at `src/layouts/SiteLayout.tsx`: **default** component export (no more named export), plus `loader(): Promise<SiteContent>`, `clientLoader` (same function), `HydrateFallback`, `ErrorBoundary`. Task 5's `meta` functions read this loader's data via `matches[1].loaderData`.
  - Build output at `build/client/` with one `index.html` per prerendered path and `__spa-fallback.html`.
  - Scripts: `npm run dev` (`react-router dev`, port 5173), `npm run build`, `npm run preview` (sirv on port 4173).

- [ ] **Step 1: Create `react-router.config.ts`** (repo root)

```ts
import { readFileSync } from 'node:fs'
import type { Config } from '@react-router/dev/config'

interface ContentSnapshot {
  pages: { servicos: { sections?: { slug: string }[] } }
}

// Build config may read content.json directly; the dependency rule governs
// only the UI trees (features/components/layouts).
const content = JSON.parse(
  readFileSync(new URL('./src/content/content.json', import.meta.url), 'utf8'),
) as ContentSnapshot

const serviceSlugs = (content.pages.servicos.sections ?? []).map((s) => s.slug)

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: [
    '/',
    '/historia',
    '/servicos',
    ...serviceSlugs.map((slug) => `/servicos/${slug}`),
    '/momentos',
    '/momentos/videos',
    '/momentos/fotos',
    '/contato',
    '/estilo',
  ],
} satisfies Config
```

- [ ] **Step 2: Create `src/root.tsx`** (document shell; replaces `index.html` + `main.tsx`; the default entry.client that React Router generates already wraps the app in `StrictMode`)

```tsx
import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import './index.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/500.css'
import '@fontsource/work-sans/600.css'

export function meta() {
  return [{ title: 'Projeto Liberdade' }]
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return <Outlet />
}
```

Note: no hardcoded `<title>` — the root `meta` provides the default and page `meta` exports (Task 5) override it; `<Meta />` renders the tag. `ScrollRestoration` moves here from `SiteLayout`.

- [ ] **Step 3: Replace `src/routes.tsx` with `src/routes.ts`**

```bash
git rm src/routes.tsx
```

Create `src/routes.ts` (paths are relative to `appDirectory`, i.e. `src/`):

```ts
import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes'

export default [
  layout('layouts/SiteLayout.tsx', [
    index('features/home/HomePage.tsx'),
    route('historia', 'features/historia/HistoriaPage.tsx'),
    route('servicos/:slug?', 'features/servicos/ServicosPage.tsx'),
    route('momentos', 'features/momentos/MomentosPage.tsx'),
    route('momentos/videos', 'features/momentos/MomentosVideosRoute.tsx'),
    route('momentos/fotos', 'features/momentos/MomentosFotosRoute.tsx'),
    route('contato', 'features/contato/ContatoPage.tsx'),
    route('estilo', 'styleguide/StyleGuide.tsx'),
    route('*', 'features/not-found/NotFoundPage.tsx'),
  ]),
] satisfies RouteConfig
```

- [ ] **Step 4: Rewrite `src/layouts/SiteLayout.tsx` as a route module**

Replace the whole file with:

```tsx
import { Outlet, useLoaderData } from 'react-router'
import type { SiteContent } from '../content/types'
import { contentRepository } from '../content/content'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

/**
 * Route module for the site chrome. The loader is the single touchpoint on
 * the content repository (see the dependency rule): it resolves SiteContent
 * at build time for prerendered paths; the clientLoader covers paths hydrated
 * from the SPA fallback (unknown URLs rendered by the 404 route).
 */
export function loader(): Promise<SiteContent> {
  return contentRepository.getContent()
}

export const clientLoader = loader

export function HydrateFallback() {
  return <p className="p-4">Carregando…</p>
}

export function ErrorBoundary() {
  return (
    <p role="alert" className="p-4 text-error">
      Erro ao carregar a página. Tente novamente mais tarde.
    </p>
  )
}

export default function SiteLayout() {
  const content = useLoaderData<typeof loader>()

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <Header site={content.site} navigation={content.navigation} />
      <main className="flex-1">
        <Outlet context={content} />
      </main>
      <Footer site={content.site} navigation={content.navigation} />
    </div>
  )
}
```

Notes: `useLoaderData` (not component props) so the component also works under `createMemoryRouter` in tests. `ScrollRestoration` was moved to `root.tsx`. The loading/error paragraphs are replaced by `HydrateFallback`/`ErrorBoundary`.

- [ ] **Step 5: Delete the retired entry files and hook**

```bash
git rm index.html src/main.tsx src/content/useContent.ts
```

- [ ] **Step 6: Swap the Vite plugin**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [reactRouter(), tailwindcss()],
})
```

(`vitest.config.ts` keeps `@vitejs/plugin-react`; do not touch it.)

- [ ] **Step 7: Wire generated route types into TypeScript**

`tsconfig.app.json` — change `include` and add `rootDirs` to `compilerOptions`:

```json
  "include": ["src", ".react-router/types/**/*"]
```

```json
    "rootDirs": [".", "./.react-router/types"],
```

`tsconfig.node.json` — change `include`:

```json
  "include": ["vite.config.ts", "vitest.config.ts", "react-router.config.ts"]
```

- [ ] **Step 8: Update scripts in `package.json`**

```json
    "dev": "react-router dev",
    "build": "react-router typegen && tsc -b && react-router build",
    "preview": "sirv build/client --single --port 4173",
```

(All other scripts unchanged; `playwright.config.ts` needs no change — `react-router dev` serves on 5173 like Vite did.)

- [ ] **Step 9: Ignore generated output**

Append to `.gitignore` (after the `dist-ssr` line):

```
build
.react-router
```

- [ ] **Step 10: Rewire the test helper for the loader-based layout**

In `src/test/render.tsx`, change the `SiteLayout` import and the route object:

```tsx
import SiteLayout, { loader as siteLayoutLoader } from '../layouts/SiteLayout'
```

```tsx
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        loader: siteLayoutLoader,
        HydrateFallback: () => null,
        children,
      },
    ],
    { initialEntries: [route] },
  )
```

(No other file imports `SiteLayout` by name — HomePage/Historia/Contato/Momentos tests already go through the helper since Task 3.)

- [ ] **Step 11: Build and inspect the prerendered output**

```bash
npm run build
```

Expected: typegen + `tsc -b` clean; build reports prerendered paths. Then:

```bash
ls build/client/index.html build/client/historia/index.html \
  build/client/servicos/equoterapia/index.html \
  build/client/momentos/fotos/index.html build/client/__spa-fallback.html
grep -q 'Nossa História' build/client/historia/index.html && echo HISTORIA-OK
grep -q 'Reabilitação e Equoterapia' build/client/index.html && echo HOME-OK
grep -c 'Carregando' build/client/historia/index.html
```

Expected: all files listed, `HISTORIA-OK`, `HOME-OK`, and the `Carregando` count is `0` for the page markup — the prerendered HTML contains real content, not the loading shell. (If `Carregando` appears inside the serialized JS payload but not in the visible markup, that is acceptable; the check that matters is `Nossa História` present.)

- [ ] **Step 12: Run unit tests and lint**

```bash
npm test && npm run lint
```

Expected: all suites pass (layout/page tests now feed content through the route loader), lint clean.

- [ ] **Step 13: Smoke-test dev and preview**

```bash
npm run dev
```

Expected: serves on http://localhost:5173; `/`, `/historia`, `/servicos/equoterapia`, `/momentos/fotos` render with header/footer; an unknown URL like `/nada` renders the 404 inside the site chrome. Stop the server, then:

```bash
npm run preview
```

Expected: http://localhost:4173 serves the prerendered site. Stop the server.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: migrate to React Router framework mode with static prerendering (ssr:false)"
```

---

### Task 5: Per-page `meta` exports (TDD)

Each page route module exports a `meta` function deriving title/description/OG tags from the layout loader's `SiteContent` (via `matches[1].loaderData` — `matches` is `[root, SiteLayout, self]`). Generated types (`./+types/<file>`) exist after Task 4's typegen.

**Files:**
- Modify: `src/features/home/HomePage.tsx`, `src/features/historia/HistoriaPage.tsx`, `src/features/servicos/ServicosPage.tsx`, `src/features/momentos/MomentosPage.tsx`, `src/features/momentos/MomentosVideosRoute.tsx`, `src/features/momentos/MomentosFotosRoute.tsx`, `src/features/momentos/momentosSelectors.ts`, `src/features/contato/ContatoPage.tsx`, `src/styleguide/StyleGuide.tsx`
- Test: append to `src/features/home/HomePage.test.tsx`, `src/features/historia/HistoriaPage.test.tsx`, `src/features/servicos` (new `ServicosPage.test.tsx` if none exists — meta-only tests), `src/features/momentos/momentosSelectors.test.ts`, `src/features/contato/ContatoPage.test.tsx`

**Interfaces:**
- Consumes: `pageMeta`/`heroSubtitle` (Task 2); `SiteLayout` loader data shape `SiteContent` (Task 4); selectors `selectServicesGrid`, `selectHippussuit`, `selectMomentosHeader`.
- Produces: `meta` exports on every page route module; `momentosMeta(content: SiteContent | undefined): MetaDescriptor[]` in `momentosSelectors.ts` shared by the three momentos routes.

Meta test pattern (used in every step below): build the args object by hand and cast, since `Route.MetaArgs` is a generated type:

```tsx
const args = (content: SiteContent, params: Record<string, string> = {}) =>
  ({ matches: [undefined, { loaderData: content }], params }) as unknown as
    Parameters<typeof meta>[0]
```

- [ ] **Step 1: Write failing meta tests**

Append to `src/features/home/HomePage.test.tsx` (add `contentRepository` and `meta` imports at the top):

```tsx
import { contentRepository } from '../../content/content'
import { HomePage, meta } from './HomePage'
```

```tsx
describe('HomePage meta', () => {
  it('derives title and description from content', async () => {
    const content = await contentRepository.getContent()
    const tags = meta({
      matches: [undefined, { loaderData: content }],
      params: {},
    } as unknown as Parameters<typeof meta>[0])
    expect(tags).toContainEqual({
      title: 'Projeto Liberdade — Reabilitação e Equoterapia',
    })
    expect(tags).toContainEqual({
      name: 'description',
      content:
        'Promovendo qualidade de vida e desenvolvimento biopsicossocial através da relação com o cavalo.',
    })
  })
})
```

Append to `src/features/historia/HistoriaPage.test.tsx` (imports: `contentRepository`, `{ HistoriaPage, meta }`):

```tsx
describe('HistoriaPage meta', () => {
  it('derives the title from the page content', async () => {
    const content = await contentRepository.getContent()
    const tags = meta({
      matches: [undefined, { loaderData: content }],
      params: {},
    } as unknown as Parameters<typeof meta>[0])
    expect(tags).toContainEqual({ title: 'História — Projeto Liberdade' })
  })
})
```

Create `src/features/servicos/ServicosPage.test.tsx` (if a test file already exists, append instead):

```tsx
import { describe, expect, it } from 'vitest'
import { contentRepository } from '../../content/content'
import { meta } from './ServicosPage'
import type { SiteContent } from '../../content/types'

const args = (content: SiteContent, params: Record<string, string> = {}) =>
  ({
    matches: [undefined, { loaderData: content }],
    params,
  }) as unknown as Parameters<typeof meta>[0]

describe('ServicosPage meta', () => {
  it('uses the page title without a slug', async () => {
    const content = await contentRepository.getContent()
    expect(meta(args(content))).toContainEqual({
      title: 'Serviços — Projeto Liberdade',
    })
  })

  it('uses the service title for a slug', async () => {
    const content = await contentRepository.getContent()
    expect(meta(args(content, { slug: 'equoterapia' }))).toContainEqual({
      title: 'Equoterapia — Projeto Liberdade',
    })
  })

  it('uses the Hippussuit title for the hippussuit slug', async () => {
    const content = await contentRepository.getContent()
    expect(meta(args(content, { slug: 'hippussuit' }))).toContainEqual({
      title: 'Hippussuit — Projeto Liberdade',
    })
  })
})
```

Append to `src/features/momentos/momentosSelectors.test.ts` (import `momentosMeta` alongside the existing selector imports, plus `contentRepository`):

```tsx
describe('momentosMeta', () => {
  it('derives title and description from content', async () => {
    const content = await contentRepository.getContent()
    const tags = momentosMeta(content)
    expect(tags).toContainEqual({ title: 'Momentos — Projeto Liberdade' })
  })

  it('falls back to the site title without content', () => {
    expect(momentosMeta(undefined)).toContainEqual({
      title: 'Projeto Liberdade',
    })
  })
})
```

Append to `src/features/contato/ContatoPage.test.tsx` (imports: `contentRepository`, `{ ContatoPage, meta }`):

```tsx
describe('ContatoPage meta', () => {
  it('derives the title from the page content', async () => {
    const content = await contentRepository.getContent()
    const tags = meta({
      matches: [undefined, { loaderData: content }],
      params: {},
    } as unknown as Parameters<typeof meta>[0])
    expect(tags).toContainEqual({ title: 'Contato — Projeto Liberdade' })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/features
```

Expected: FAIL — `meta` / `momentosMeta` are not exported.

- [ ] **Step 3: Implement the meta exports**

`src/features/home/HomePage.tsx` — add imports and the export above the component:

```tsx
import type { Route } from './+types/HomePage'
import { pageMeta } from '../../lib/meta'

export function meta({ matches }: Route.MetaArgs) {
  const content = matches[1]?.loaderData
  if (!content) return pageMeta('Projeto Liberdade')
  const { hero } = content.pages.home
  return pageMeta(`${content.site.name} — ${hero.title}`, hero.subtitle)
}
```

`src/features/historia/HistoriaPage.tsx`:

```tsx
import type { Route } from './+types/HistoriaPage'
import { heroSubtitle, pageMeta } from '../../lib/meta'

export function meta({ matches }: Route.MetaArgs) {
  const content = matches[1]?.loaderData
  if (!content) return pageMeta('Projeto Liberdade')
  const page = content.pages.historia
  return pageMeta(`${page.title} — ${content.site.name}`, heroSubtitle(page))
}
```

`src/features/servicos/ServicosPage.tsx` (selectors are already imported in this file):

```tsx
import type { Route } from './+types/ServicosPage'
import { pageMeta } from '../../lib/meta'

export function meta({ params, matches }: Route.MetaArgs) {
  const content = matches[1]?.loaderData
  if (!content) return pageMeta('Projeto Liberdade')
  const grid = selectServicesGrid(content)
  const service = grid.services.find((s) => s.slug === params.slug)
  const hippussuit =
    params.slug === 'hippussuit' ? selectHippussuit(content) : undefined
  const title =
    service?.title ?? hippussuit?.title ?? content.pages.servicos.title
  return pageMeta(
    `${title} — ${content.site.name}`,
    service?.excerpt ?? grid.intro,
  )
}
```

`src/features/momentos/momentosSelectors.ts` — add to the imports and append:

```ts
import type { MetaDescriptor } from 'react-router'
import { pageMeta } from '../../lib/meta'
```

```ts
export function momentosMeta(
  content: SiteContent | undefined,
): MetaDescriptor[] {
  if (!content) return pageMeta('Projeto Liberdade')
  return pageMeta(
    `${content.pages.momentos.title} — ${content.site.name}`,
    selectMomentosHeader(content).subtitle,
  )
}
```

`src/features/momentos/MomentosPage.tsx`:

```tsx
import type { Route } from './+types/MomentosPage'
import { momentosMeta } from './momentosSelectors'

export function meta({ matches }: Route.MetaArgs) {
  return momentosMeta(matches[1]?.loaderData)
}
```

`src/features/momentos/MomentosVideosRoute.tsx` — replace the whole file:

```tsx
import type { Route } from './+types/MomentosVideosRoute'
import MomentosPage from './MomentosPage'
import { momentosMeta } from './momentosSelectors'

export function meta({ matches }: Route.MetaArgs) {
  return momentosMeta(matches[1]?.loaderData)
}

export default function MomentosVideosRoute() {
  return <MomentosPage />
}
```

`src/features/momentos/MomentosFotosRoute.tsx` — replace the whole file:

```tsx
import type { Route } from './+types/MomentosFotosRoute'
import MomentosPage from './MomentosPage'
import { momentosMeta } from './momentosSelectors'

export function meta({ matches }: Route.MetaArgs) {
  return momentosMeta(matches[1]?.loaderData)
}

export default function MomentosFotosRoute() {
  return <MomentosPage />
}
```

`src/features/contato/ContatoPage.tsx`:

```tsx
import type { Route } from './+types/ContatoPage'
import { heroSubtitle, pageMeta } from '../../lib/meta'

export function meta({ matches }: Route.MetaArgs) {
  const content = matches[1]?.loaderData
  if (!content) return pageMeta('Projeto Liberdade')
  const page = content.pages.contato
  return pageMeta(`${page.title} — ${content.site.name}`, heroSubtitle(page))
}
```

`src/styleguide/StyleGuide.tsx`:

```tsx
import { pageMeta } from '../lib/meta'

export function meta() {
  return pageMeta('Guia de Estilo — Projeto Liberdade')
}
```

Run typegen so `./+types/*` resolve for the editor and `tsc`:

```bash
npx react-router typegen
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/features && npm run lint
```

Expected: PASS, lint clean (the `allowExportNames` rule from Task 3 permits `meta`).

- [ ] **Step 5: Verify titles in the prerendered HTML**

```bash
npm run build
grep -o '<title>[^<]*</title>' build/client/index.html
grep -o '<title>[^<]*</title>' build/client/historia/index.html
grep -o '<title>[^<]*</title>' build/client/servicos/equoterapia/index.html
grep -o '<title>[^<]*</title>' build/client/momentos/videos/index.html
grep -c 'property="og:title"' build/client/historia/index.html
```

Expected:
- `<title>Projeto Liberdade — Reabilitação e Equoterapia</title>`
- `<title>História — Projeto Liberdade</title>`
- `<title>Equoterapia — Projeto Liberdade</title>`
- `<title>Momentos — Projeto Liberdade</title>`
- og:title count ≥ 1

- [ ] **Step 6: Commit**

```bash
git add -A src
git commit -m "feat(seo): per-page meta exports — title, description, Open Graph tags"
```

---

### Task 6: Documentation + full verification

**Files:**
- Modify: `README.md`
- No source changes.

**Interfaces:**
- Consumes: everything shipped in Tasks 1–5.
- Produces: README reflecting the framework-mode architecture; a fully verified branch.

- [ ] **Step 1: Update the README intro** (line 5 area)

Old: "The UI is a single-page React application with five public pages…"
New: "The UI is a React Router (framework mode) application, statically prerendered per route, with five public pages…" (keep the rest of the sentence).

- [ ] **Step 2: Update the architecture flow**

In the mermaid diagram, replace the hook node and its edges:

```
    Binding --> Loader["SiteLayout loader (route module)"]
    Loader --> Layout["SiteLayout (provides Outlet context)"]
```

(Remove the `Hook["useContent (React hook)"]` node; `Binding --> Hook` and `Hook --> Layout` become the two lines above.)

Replace the flow sentence below the diagram:

Old: "Content flows one way: a repository resolves `SiteContent`, `useContent` exposes it, `SiteLayout` puts it on the router `Outlet` context, …"
New: "Content flows one way: a repository resolves `SiteContent`, the `SiteLayout` route **loader** awaits it (at build time for prerendered paths), `SiteLayout` puts it on the router `Outlet` context, …" (keep the rest).

In the project-structure block, delete the `useContent.ts` line and add below `src/`:

```
  root.tsx      # document shell (framework mode)
  routes.ts     # route config (@react-router/dev/routes)
```

- [ ] **Step 3: Update the dependency rule bullet**

Old: "- `SiteLayout` (or a page container) retrieves data with `useContent` and flows it down through the router `Outlet` context. …"
New: "- The `SiteLayout` route module's `loader` retrieves data from the content repository and flows it down through the router `Outlet` context. …" (keep the rest of the bullet).

- [ ] **Step 4: Update commands and add a hosting note**

In the Development/commands section, update the `dev`, `build`, and `preview` descriptions: dev runs `react-router dev` (port 5173); build runs typegen + `tsc -b` + `react-router build`, emitting prerendered static HTML to `build/client/`; preview serves `build/client` via sirv on port 4173. Add one note: "Static hosting must serve `build/client/__spa-fallback.html` for unknown paths (the 404 route renders client-side)."

- [ ] **Step 5: Update the roadmap**

Old item 4: `4. **SEO prerender** — add \`vite-react-ssg\` for static HTML per route + per-page \`<title>\` / Open Graph tags.`
New: `4. ~~SEO prerender~~ — done via React Router framework-mode prerendering (\`ssr: false\` + \`prerender\`): static HTML per route with per-page \`<title>\` / Open Graph tags (see docs/superpowers/specs/2026-07-14-react-router-ssg-prerender-design.md).`

In the "Swapping to Firebase RTDB" section, append one sentence to the intro: "How a runtime data source interacts with build-time prerendering (rebuild-on-change vs. client revalidation) is an open design question for that step."

- [ ] **Step 6: Full verification suite**

```bash
npm run format && npm run format:check
npm run lint
npm test
npm run build
npm run test:e2e
```

Expected: all green. For e2e, Playwright starts the dev server itself (`webServer` in `playwright.config.ts`); if browsers are missing, run `npx playwright install chromium` once. All five existing specs (historia, momentos, scroll-restoration, servicos, smoke) must pass — scroll-restoration exercises the `ScrollRestoration` that moved to `root.tsx`.

- [ ] **Step 7: Commit**

```bash
git add README.md
git commit -m "docs: README — framework-mode architecture, commands, roadmap item 4 done"
```

---

## Completion

After Task 6, use superpowers:verification-before-completion, then superpowers:finishing-a-development-branch (the branch `worktree-rr-ssg-prerender-spec` already has draft PR #15 — push and mark it ready for review).
