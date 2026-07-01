# Frontend Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Vite + React + TypeScript scaffold for the Projeto Liberdade brochure site that installs, builds, runs, lints, and tests green — with the folder structure and the single content-source seam established, and all UI work deferred.

**Architecture:** Feature-first layout with exactly one architectural boundary — the content source. The UI depends only on a `ContentRepository` port (async, to mirror the future Firebase RTDB runtime fetch). The only concrete adapter now is `JsonContentRepository`, which loads a bundled `content.json` snapshot. Routing is a React Router v7 data router with a `SiteLayout` shell and a single placeholder route that proves the seam end-to-end.

**Tech Stack:** TypeScript 5 (strict), React 19, Vite 7, React Router v7, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest + Testing Library (unit), Playwright (E2E), pnpm, ESLint flat config + Prettier.

## Global Constraints

- **Scaffold only.** No design tokens / theme, no real components, no real pages, no block renderers, no SEO prerendering, no Firebase wiring. These are deferred and recorded as TODO in `CLAUDE.md`.
- **Package manager:** pnpm. All commands use `pnpm`.
- **Dependency rule:** code under `src/features`, `src/components`, `src/layouts` may use the content layer ONLY via `useContent` / `ContentRepository`. Never import `content.json` directly in UI; never reference Firebase.
- **Versions (floors, use latest stable within range):** React 19, Vite 7, React Router v7, Tailwind CSS v4, TypeScript 5.
- **Content seam is async** (`getContent(): Promise<SiteContent>`) even though JSON is synchronous, so the Firebase adapter is a drop-in later.
- **Content conventions:** English keys, Portuguese content values, slugs double as URL paths (see `docs/superpowers/specs/2026-06-30-content-json-redesign-design.md`).
- **Do not delete** anything under `docs/resources/`. Copy what the app needs.
- **Prettier style:** no semicolons, single quotes, trailing commas `all`.

---

### Task 1: Initialize Vite + React + TypeScript base

**Files:**
- Create (via scaffold): `package.json`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `eslint.config.js`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`, `public/vite.svg`
- Keep existing: `.gitignore`, `LICENSE.MD`, `docs/`, `scripts/`

**Interfaces:**
- Produces: a runnable Vite project at repo root. Later tasks replace `src/App.tsx` and `vite.config.ts`.

- [ ] **Step 1: Scaffold the Vite react-ts template into a temp dir**

Run:
```bash
pnpm create vite@latest vite-tmp --template react-ts
```
Expected: creates `vite-tmp/` with the React + TypeScript template (no interactive prompts because name and template are supplied).

- [ ] **Step 2: Move template files to repo root (keep our .gitignore, drop template README)**

Run:
```bash
mv vite-tmp/index.html vite-tmp/package.json vite-tmp/tsconfig*.json vite-tmp/vite.config.ts vite-tmp/eslint.config.js .
mv vite-tmp/src vite-tmp/public .
rm -rf vite-tmp
```
Expected: `package.json`, `index.html`, `tsconfig*.json`, `vite.config.ts`, `eslint.config.js`, `src/`, `public/` now at repo root; `vite-tmp/` removed.

- [ ] **Step 3: Install dependencies**

Run:
```bash
pnpm install
```
Expected: installs successfully, creates `pnpm-lock.yaml` and `node_modules/`.

- [ ] **Step 4: Verify the dev/build toolchain works**

Run:
```bash
pnpm build
```
Expected: `tsc -b` then `vite build` complete with no errors and a `dist/` directory is produced.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold vite react-ts base"
```

---

### Task 2: Wire Tailwind CSS v4

**Files:**
- Modify: `vite.config.ts` (full replacement below)
- Modify: `src/index.css` (full replacement below)
- Modify: `package.json` (adds dependencies — done via pnpm add)

**Interfaces:**
- Produces: Tailmind utility classes are compiled. Note: `vite.config.ts` here also pre-adds the Vitest `test` block used in Task 4 so it is not rewritten twice.

- [ ] **Step 1: Add Tailwind v4 packages**

Run:
```bash
pnpm add tailwindcss @tailwindcss/vite
```
Expected: both packages added to `dependencies`.

- [ ] **Step 2: Replace `vite.config.ts`**

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

- [ ] **Step 3: Replace `src/index.css` with the Tailwind import**

```css
@import 'tailwindcss';
```

- [ ] **Step 4: Verify Tailwind compiles**

Run:
```bash
pnpm build
```
Expected: build succeeds. (The `vitest/config` reference and `test` block do not break the build; `@tailwindcss/vite` processes the `@import`.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: integrate tailwind css v4 via vite plugin"
```

---

### Task 3: Configure Prettier (ESLint flat config already present)

**Files:**
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `package.json` (scripts)
- Modify: `eslint.config.js` (disable formatting-conflicting rules)

**Interfaces:**
- Produces: `pnpm lint`, `pnpm format`, `pnpm format:check` scripts.

- [ ] **Step 1: Add Prettier + eslint-config-prettier**

Run:
```bash
pnpm add -D prettier eslint-config-prettier
```

- [ ] **Step 2: Create `.prettierrc.json`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all"
}
```

- [ ] **Step 3: Create `.prettierignore`**

```
node_modules
dist
pnpm-lock.yaml
docs/resources
```

- [ ] **Step 4: Append `eslint-config-prettier` to `eslint.config.js`**

Add the import at the top of `eslint.config.js`:
```js
import prettier from 'eslint-config-prettier'
```
Then add `prettier` as the LAST element of the exported config array (it must come last to turn off conflicting rules). For the template's `export default tseslint.config([...])` form, add `prettier` as the final array entry:
```js
  prettier,
])
```

- [ ] **Step 5: Replace the `scripts` block in `package.json`**

```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
```

- [ ] **Step 6: Format the codebase and verify lint passes**

Run:
```bash
pnpm format
pnpm lint
```
Expected: `format` rewrites files to the Prettier style and exits 0; `lint` exits 0 with no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add prettier and lint/format/test scripts"
```

---

### Task 4: Build the content seam + unit test (TDD)

**Files:**
- Create: `src/content/content.json` (copied from `docs/resources/content.json`)
- Create: `src/content/types.ts`
- Create: `src/content/ContentRepository.ts`
- Create: `src/content/JsonContentRepository.ts`
- Create: `src/content/content.ts`
- Create: `src/content/useContent.ts`
- Create: `src/test/setup.ts`
- Test: `src/content/JsonContentRepository.test.ts`
- Modify: `tsconfig.app.json` (enable `resolveJsonModule`)

**Interfaces:**
- Produces:
  - `interface SiteContent { site: Site; navigation: NavItem[]; pages: Record<string, Page> }`
  - `interface ContentRepository { getContent(): Promise<SiteContent> }`
  - `class JsonContentRepository implements ContentRepository`
  - `const contentRepository: ContentRepository`
  - `function useContent(): { content: SiteContent | null; loading: boolean; error: Error | null }`

- [ ] **Step 1: Add Vitest + Testing Library dev deps**

Run:
```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom
```

- [ ] **Step 2: Create the Vitest setup file `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Copy the canonical content snapshot into the app**

Run:
```bash
cp docs/resources/content.json src/content/content.json
```
Expected: `src/content/content.json` exists.

- [ ] **Step 4: Enable JSON module imports for the type-checker**

In `tsconfig.app.json`, add `"resolveJsonModule": true` inside `compilerOptions` (alongside the existing options).

- [ ] **Step 5: Create `src/content/types.ts`**

```ts
export interface SocialLink {
  network: string
  url: string
}

export interface Site {
  name: string
  logo: string
  social: SocialLink[]
}

export interface NavItem {
  slug: string
  label: string
  order: number
  submenu?: NavItem[]
}

/**
 * Page is intentionally loose during the scaffold phase. Full typing of
 * body blocks, photos, videos, and units is deferred to the content/component
 * build phase (see the TODO map in CLAUDE.md).
 */
export interface Page {
  slug: string
  title: string
  [key: string]: unknown
}

export interface SiteContent {
  site: Site
  navigation: NavItem[]
  pages: Record<string, Page>
}
```

- [ ] **Step 6: Create the port `src/content/ContentRepository.ts`**

```ts
import type { SiteContent } from './types'

/**
 * Port for the content source. UI depends only on this interface, never on a
 * concrete data source. Today: JsonContentRepository (bundled snapshot).
 * Later: RtdbContentRepository (Firebase Realtime Database, runtime fetch) —
 * same interface, swap the binding in content.ts. Async by design so the
 * future RTDB adapter is a drop-in.
 */
export interface ContentRepository {
  getContent(): Promise<SiteContent>
}
```

- [ ] **Step 7: Write the failing unit test `src/content/JsonContentRepository.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { JsonContentRepository } from './JsonContentRepository'

describe('JsonContentRepository', () => {
  it('loads site content from the bundled snapshot', async () => {
    const repo = new JsonContentRepository()
    const content = await repo.getContent()

    expect(content.site.name).toBe('Projeto Liberdade')
    expect(Array.isArray(content.navigation)).toBe(true)
    expect(content.navigation.length).toBeGreaterThan(0)
    expect(content.pages.home).toBeDefined()
  })
})
```

- [ ] **Step 8: Run the test to verify it fails**

Run:
```bash
pnpm test
```
Expected: FAIL — cannot resolve `./JsonContentRepository` (module not yet created).

- [ ] **Step 9: Create `src/content/JsonContentRepository.ts`**

```ts
import rawContent from './content.json'
import type { ContentRepository } from './ContentRepository'
import type { SiteContent } from './types'

/**
 * Loads content from the bundled content.json snapshot. Returns a Promise to
 * satisfy the ContentRepository contract and to mirror the future RTDB adapter,
 * which will fetch asynchronously.
 */
export class JsonContentRepository implements ContentRepository {
  getContent(): Promise<SiteContent> {
    return Promise.resolve(rawContent as unknown as SiteContent)
  }
}
```

- [ ] **Step 10: Run the test to verify it passes**

Run:
```bash
pnpm test
```
Expected: PASS (1 test).

- [ ] **Step 11: Create the binding `src/content/content.ts`**

```ts
import type { ContentRepository } from './ContentRepository'
import { JsonContentRepository } from './JsonContentRepository'

/**
 * The single place that selects the active content source. Swap to
 * RtdbContentRepository here when Firebase is wired up — nothing else changes.
 */
export const contentRepository: ContentRepository = new JsonContentRepository()
```

- [ ] **Step 12: Create the hook `src/content/useContent.ts`**

```ts
import { useEffect, useState } from 'react'
import { contentRepository } from './content'
import type { SiteContent } from './types'

interface ContentState {
  content: SiteContent | null
  loading: boolean
  error: Error | null
}

/**
 * Loads site content through the active ContentRepository. Components use this
 * hook and never touch the data source directly (see the dependency rule).
 */
export function useContent(): ContentState {
  const [state, setState] = useState<ContentState>({
    content: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true
    contentRepository
      .getContent()
      .then((content) => {
        if (active) setState({ content, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (active)
          setState({
            content: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
      })
    return () => {
      active = false
    }
  }, [])

  return state
}
```

- [ ] **Step 13: Verify lint, types, and tests are green**

Run:
```bash
pnpm lint && pnpm build && pnpm test
```
Expected: all three succeed.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: add content repository seam with json adapter"
```

---

### Task 5: Routing skeleton + placeholder route

**Files:**
- Create: `src/layouts/SiteLayout.tsx`
- Create: `src/PlaceholderPage.tsx`
- Create: `src/routes.tsx`
- Modify: `src/main.tsx` (full replacement)
- Modify: `index.html` (set title)
- Delete: `src/App.tsx`, `src/App.css`, `src/assets/react.svg`, `public/vite.svg`

**Interfaces:**
- Consumes: `useContent` from Task 4.
- Produces: a running SPA whose `/` route renders proof-of-life from the content seam. `SiteLayout` exposes `data-testid="site-header"` / `site-footer`; `PlaceholderPage` exposes `data-testid="scaffold-heading"` (used by Task 6).

- [ ] **Step 1: Add React Router v7**

Run:
```bash
pnpm add react-router
```

- [ ] **Step 2: Create `src/layouts/SiteLayout.tsx`**

```tsx
import { Outlet } from 'react-router'

/**
 * Shell layout: placeholder header + routed content + placeholder footer. Real
 * Header / Nav / Footer components are built in a later phase.
 */
export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header data-testid="site-header" className="border-b p-4">
        {/* TODO: real Header + Nav (later phase) */}
        <span className="font-semibold">Projeto Liberdade</span>
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <footer data-testid="site-footer" className="border-t p-4">
        {/* TODO: real Footer + social links (later phase) */}
      </footer>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/PlaceholderPage.tsx`**

```tsx
import { useContent } from './content/useContent'

/**
 * Temporary proof-of-life page. Confirms the content seam works end-to-end.
 * Replaced by the real pages (home, historia, …) in a later phase.
 */
export function PlaceholderPage() {
  const { content, loading, error } = useContent()

  if (loading) return <p>Carregando…</p>
  if (error)
    return (
      <p role="alert" className="text-red-600">
        Erro: {error.message}
      </p>
    )

  return (
    <section>
      <h1 data-testid="scaffold-heading" className="text-2xl font-bold">
        Scaffold OK — {content?.site.name}
      </h1>
      <p>{content?.navigation.length} itens de navegação carregados.</p>
    </section>
  )
}
```

- [ ] **Step 4: Create `src/routes.tsx`**

```tsx
import { createBrowserRouter } from 'react-router'
import { SiteLayout } from './layouts/SiteLayout'
import { PlaceholderPage } from './PlaceholderPage'

function NotFound() {
  return <p>404 — página não encontrada</p>
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SiteLayout,
    children: [
      { index: true, Component: PlaceholderPage },
      { path: '*', Component: NotFound },
    ],
  },
])
```

- [ ] **Step 5: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './routes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

- [ ] **Step 6: Delete unused template files**

Run:
```bash
rm -f src/App.tsx src/App.css src/assets/react.svg public/vite.svg
rmdir src/assets 2>/dev/null || true
```

- [ ] **Step 7: Set the page title in `index.html`**

In `index.html`, change the `<title>` element to:
```html
    <title>Projeto Liberdade</title>
```
If the template references `/vite.svg` in a `<link rel="icon">`, remove that line (the file was deleted).

- [ ] **Step 8: Verify build + lint + dev server content**

Run:
```bash
pnpm lint && pnpm build
```
Expected: both succeed (no references to deleted `App`/`vite.svg`).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add router skeleton with placeholder route"
```

---

### Task 6: Playwright E2E smoke test

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/smoke.spec.ts`
- Modify: `.gitignore` (ignore Playwright artifacts)

**Interfaces:**
- Consumes: the running app from Task 5 (`data-testid="scaffold-heading"`).

- [ ] **Step 1: Add Playwright and install its browser**

Run:
```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```
Expected: `@playwright/test` added; Chromium downloaded.

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

- [ ] **Step 3: Create the smoke test `tests/e2e/smoke.spec.ts`**

```ts
import { expect, test } from '@playwright/test'

test('placeholder route loads content through the seam', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('scaffold-heading')).toContainText(
    'Projeto Liberdade',
  )
})
```

- [ ] **Step 4: Ignore Playwright artifacts**

Append to `.gitignore`:
```
# Playwright
/test-results
/playwright-report
/blob-report
/playwright/.cache
```

- [ ] **Step 5: Run the E2E test to verify it passes**

Run:
```bash
pnpm test:e2e
```
Expected: 1 passed (Playwright boots `pnpm dev`, loads `/`, finds the heading).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: add playwright e2e smoke test"
```

---

### Task 7: Placeholder folder structure for deferred work

**Files:**
- Create: `src/features/README.md`
- Create: `src/components/blocks/README.md`
- Create: `src/lib/README.md`

**Interfaces:**
- Produces: empty, documented directories so future phases have a home and Git tracks them.

- [ ] **Step 1: Create `src/features/README.md`**

```md
# features

One folder per page/feature (home, historia, servicos, momentos, contato).
Each feature owns its route component and local pieces. Built in a later phase.

Rule: features read content ONLY via `useContent` / `ContentRepository`
(`src/content`). Never import `content.json` directly; never reference Firebase.
```

- [ ] **Step 2: Create `src/components/blocks/README.md`**

```md
# components

Shared, presentational UI (Header, Footer, Nav, Gallery, …) and `blocks/`
renderers (one per content `Block.type`). Built in a later phase, after design
tokens and the Tailwind theme are defined.
```

- [ ] **Step 3: Create `src/lib/README.md`**

```md
# lib

Small framework-agnostic utilities (e.g. `cn()`, asset-path helpers). Add as
needed during the component phase. Keep functions pure and individually testable.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add placeholder directories for deferred phases"
```

---

### Task 8: Author CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

**Interfaces:**
- Produces: the root guidance file that preserves structure and decisions.

- [ ] **Step 1: Create `CLAUDE.md`**

````md
# Projeto Liberdade — Frontend

Brochure website for **Projeto Liberdade** (Brazilian equine-therapy /
rehabilitation organization). Content-driven: today from a bundled
`content.json` snapshot; later from Firebase Realtime Database (RTDB) at runtime
with the JSON as fallback.

## Stack

- TypeScript 5 (strict), React 19, Vite 7
- React Router v7 (library/data mode: `createBrowserRouter` + `RouterProvider`)
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
````

- [ ] **Step 2: Final full verification**

Run:
```bash
pnpm install && pnpm lint && pnpm build && pnpm test && pnpm test:e2e
```
Expected: install, lint, build, unit test (1 pass), and e2e (1 pass) all green.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: add CLAUDE.md with structure, rules, and phase map"
```

---

## Self-Review Notes

- **Spec coverage:** §6.1 init (Task 1), §6.2 Tailwind (Task 2), §6.3 routing skeleton (Task 5), §6.4 content seam (Task 4), §6.5 empty structure (Task 7), §6.6 tests configured (Tasks 4 + 6), §6.7 assets/content.json copy (Task 4 Step 3), §6.8 CLAUDE.md (Task 8), §4 stack/versions (Global Constraints + tasks), §9 success criteria (Task 8 Step 2). Lint/format from §4 covered in Task 3.
- **Deferred items** (§7) are not implemented and are recorded in `CLAUDE.md` Phase map.
- **Type consistency:** `SiteContent` / `ContentRepository.getContent()` / `JsonContentRepository` / `contentRepository` / `useContent` names are identical across Tasks 4 and 5. `data-testid="scaffold-heading"` is defined in Task 5 and consumed in Task 6.
````
