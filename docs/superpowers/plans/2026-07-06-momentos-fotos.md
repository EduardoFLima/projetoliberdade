# Momentos — Fotos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Fotos view to `/momentos` — a bento/mosaic photo grid (one 2×2 featured photo + 1×1 tiles) that opens photos full-screen in the existing Lightbox.

**Architecture:** Follows the shipped Vídeos view's feature → selector → section → presentational pattern. A new `selectPhotos` selector flattens the content into a `Photo[]` (featured first). A new presentational `PhotoGallery` renders the bento grid and reuses the existing `Lightbox`. `MomentosPage` switches between the video and photo view based on the route; `MediaToggle` gains an active Fotos link; a `/momentos/fotos` route is added.

**Tech Stack:** TypeScript, React 19, React Router v8 (data mode), Tailwind CSS v4, Vitest + Testing Library, Playwright.

## Global Constraints

- **Dependency rule:** files under `features`, `components`, `layouts` never import `content.json` or reference Firebase. Content access stays in selectors; UI receives data via props / Outlet context. (verbatim from AGENTS.md §5)
- **Formatting:** no semicolons, single quotes, trailing commas (Prettier). Run `pnpm format` / `pnpm lint`.
- **Content = source of truth:** render values from `content.json`; do not hard-code copy in components.
- **Verification commands:** `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm test:e2e`.
- **Assets are already staged** in this worktree under `public/images/momentos/` (`destaque.jpg` + `foto-1.jpg` … `foto-9.jpg`). Task 1 verifies their presence; do not re-download.

---

### Task 1: Content model, types, and `selectPhotos`

**Files:**
- Verify: `public/images/momentos/destaque.jpg`, `public/images/momentos/foto-1.jpg` … `foto-9.jpg`
- Modify: `src/content/types.ts`
- Modify: `src/content/content.json` (the `pages.momentos.photos` value)
- Modify: `src/features/momentos/momentosSelectors.ts`
- Test: `src/features/momentos/momentosSelectors.test.ts`

**Interfaces:**
- Consumes: `Photo` (`{ src: string; alt: string; caption?: string }`) and `SiteContent` from `src/content/types.ts`.
- Produces: `selectPhotos(content: SiteContent): Photo[]` — returns `[featured, ...items]`. New type `MomentosPhotos = { featured: Photo; items: Photo[] }`; `MomentosPage.photos: MomentosPhotos`.

- [ ] **Step 1: Verify staged image assets**

Run: `ls public/images/momentos/`
Expected: lists `destaque.jpg`, `foto-1.jpg`, `foto-2.jpg`, `foto-3.jpg`, `foto-4.jpg`, `foto-5.jpg`, `foto-6.jpg`, `foto-7.jpg`, `foto-8.jpg`, `foto-9.jpg`.

- [ ] **Step 2: Add the photos types**

In `src/content/types.ts`, add `MomentosPhotos` and extend `MomentosPage` (the `Photo` interface already exists):

```ts
export interface MomentosPhotos {
  featured: Photo
  items: Photo[]
}

export interface MomentosPage extends Page {
  header: MomentosHeader
  videos: Video[]
  photos: MomentosPhotos
}
```

- [ ] **Step 3: Write the failing selector test**

Append to `src/features/momentos/momentosSelectors.test.ts` (add `selectPhotos` to the existing import from `./momentosSelectors`):

```ts
import { selectPhotos } from './momentosSelectors'

describe('selectPhotos', () => {
  const content = {
    pages: {
      momentos: {
        photos: {
          featured: { src: '/images/momentos/destaque.jpg', alt: 'destaque' },
          items: [
            { src: '/images/momentos/foto-1.jpg', alt: 'um' },
            { src: '/images/momentos/foto-2.jpg', alt: 'dois' },
          ],
        },
      },
    },
  } as unknown as SiteContent

  it('returns the featured photo first, then the items', () => {
    const photos = selectPhotos(content)
    expect(photos).toHaveLength(3)
    expect(photos[0].src).toBe('/images/momentos/destaque.jpg')
    expect(photos[1].alt).toBe('um')
    expect(photos[2].alt).toBe('dois')
  })
})
```

Ensure `SiteContent` is imported at the top of the test file:

```ts
import type { SiteContent } from '../../content/types'
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test -- src/features/momentos/momentosSelectors.test.ts`
Expected: FAIL — `selectPhotos is not a function` / not exported.

- [ ] **Step 5: Implement `selectPhotos`**

In `src/features/momentos/momentosSelectors.ts`, add the import and function:

```ts
import type { Photo, SiteContent } from '../../content/types'

export function selectPhotos(content: SiteContent): Photo[] {
  const { featured, items } = content.pages.momentos.photos
  return [featured, ...items]
}
```

(Keep the existing `SiteContent` import; add `Photo` to it rather than duplicating.)

- [ ] **Step 6: Replace the photos block in content.json**

In `src/content/content.json`, replace the entire `"photos": { "albums": [ … ] }` value under `pages.momentos` with:

```json
"photos": {
  "featured": {
    "src": "/images/momentos/destaque.jpg",
    "alt": "Criança sorridente de capacete montando um cavalo marrom em um picadeiro ao ar livre"
  },
  "items": [
    { "src": "/images/momentos/foto-1.jpg", "alt": "Menino sorridente de capacete e camiseta azul montando um cavalo branco em meio à vegetação" },
    { "src": "/images/momentos/foto-2.jpg", "alt": "Menino de capacete e óculos sorrindo enquanto monta um cavalo branco em um picadeiro coberto" },
    { "src": "/images/momentos/foto-3.jpg", "alt": "Criança acolhida por uma terapeuta sorridente durante uma atividade ao ar livre" },
    { "src": "/images/momentos/foto-4.jpg", "alt": "Faixa do Projeto Liberdade com a silhueta de um cavaleiro, apoiada sobre fardos de feno" },
    { "src": "/images/momentos/foto-5.jpg", "alt": "Terapeuta beijando o rosto de uma menina sentada sobre um cavalo, ao ar livre" },
    { "src": "/images/momentos/foto-6.jpg", "alt": "Menino com capa de super-herói montado em um cavalo, amparado por duas terapeutas" },
    { "src": "/images/momentos/foto-7.jpg", "alt": "Homem beijando carinhosamente a testa de uma criança no colo durante atividade ao ar livre" },
    { "src": "/images/momentos/foto-8.jpg", "alt": "Menina fantasiada de princesa sorrindo enquanto monta um cavalo de pelagem clara" },
    { "src": "/images/momentos/foto-9.jpg", "alt": "Menino sorridente de chapéu de cowboy e lenço vermelho montando um cavalo" }
  ]
}
```

- [ ] **Step 7: Run the selector test to verify it passes**

Run: `pnpm test -- src/features/momentos/momentosSelectors.test.ts`
Expected: PASS (all selector tests green).

- [ ] **Step 8: Type-check**

Run: `pnpm build`
Expected: type-check + build succeed (no type errors from the new `photos` field).

- [ ] **Step 9: Commit**

```bash
git add public/images/momentos src/content/types.ts src/content/content.json src/features/momentos/momentosSelectors.ts src/features/momentos/momentosSelectors.test.ts
git commit -m "feat: add momentos photos content model and selectPhotos"
```

---

### Task 2: `PhotoGallery` bento grid (reusing Lightbox)

**Files:**
- Create: `src/components/sections/PhotoGallery.tsx`
- Test: `src/components/sections/PhotoGallery.test.tsx`

**Interfaces:**
- Consumes: `Photo` from `src/content/types.ts`; `Lightbox` from `src/components/Lightbox.tsx` (props: `photos: Photo[]`, `startIndex?: number`, `onClose: () => void`); `Section` (`tone` prop) and `Container` from `src/components/ui/`.
- Produces: `PhotoGallery({ photos }: { photos: Photo[] })` — React component. Renders one `<button aria-label="Ampliar foto: {alt}">` per photo (first tile spans 2×2 on ≥md), and mounts one `Lightbox` when a tile is clicked.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/PhotoGallery.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PhotoGallery } from './PhotoGallery'

const photos = [
  { src: '/images/momentos/destaque.jpg', alt: 'Destaque' },
  { src: '/images/momentos/foto-1.jpg', alt: 'Foto um' },
  { src: '/images/momentos/foto-2.jpg', alt: 'Foto dois' },
]

describe('PhotoGallery', () => {
  it('renders one tile per photo and no lightbox initially', () => {
    render(<PhotoGallery photos={photos} />)
    expect(screen.getAllByRole('button', { name: /^Ampliar foto:/ })).toHaveLength(3)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the lightbox at the clicked photo', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ampliar foto: Foto dois' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // Lightbox renders the opened photo's alt text on its <img>
    expect(screen.getByAltText('Foto dois')).toBeInTheDocument()
  })

  it('closes the lightbox via the close button', () => {
    render(<PhotoGallery photos={photos} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ampliar foto: Foto um' }))
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- src/components/sections/PhotoGallery.test.tsx`
Expected: FAIL — cannot resolve `./PhotoGallery`.

- [ ] **Step 3: Implement `PhotoGallery`**

Create `src/components/sections/PhotoGallery.tsx`:

```tsx
import { useState } from 'react'
import type { Photo } from '../../content/types'
import { Lightbox } from '../Lightbox'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { cn } from '../../lib/cn'

interface PhotoGalleryProps {
  photos: Photo[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  return (
    <Section tone="surface">
      <Container>
        <ul className="grid auto-rows-[280px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {photos.map((photo, i) => (
            <li
              key={photo.src}
              className={cn(i === 0 && 'md:col-span-2 md:row-span-2')}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`Ampliar foto: ${photo.alt}`}
                className="group block h-full w-full overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      </Container>
      {openIndex !== null ? (
        <Lightbox
          photos={photos}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </Section>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- src/components/sections/PhotoGallery.test.tsx`
Expected: PASS (all three tests green).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/PhotoGallery.tsx src/components/sections/PhotoGallery.test.tsx
git commit -m "feat: add PhotoGallery bento grid reusing Lightbox"
```

---

### Task 3: Enable the Fotos toggle link

**Files:**
- Modify: `src/components/MediaToggle.tsx`
- Test: `src/components/MediaToggle.test.tsx`

**Interfaces:**
- Consumes: `Link` from `react-router`; `cn` from `src/lib/cn`.
- Produces: `MediaToggle({ active }: { active: 'videos' | 'fotos' })` — both pills are now active `Link`s (Vídeos → `/momentos/videos`, Fotos → `/momentos/fotos`), each with `aria-current="page"` when it is the active view.

- [ ] **Step 1: Update the failing test**

Replace the body of `src/components/MediaToggle.test.tsx` with:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MediaToggle } from './MediaToggle'

describe('MediaToggle', () => {
  it('marks the active pill with aria-current and links both views', () => {
    render(
      <MemoryRouter>
        <MediaToggle active="videos" />
      </MemoryRouter>,
    )
    const videos = screen.getByRole('link', { name: 'Vídeos' })
    expect(videos).toHaveAttribute('href', '/momentos/videos')
    expect(videos).toHaveAttribute('aria-current', 'page')

    const fotos = screen.getByRole('link', { name: 'Fotos' })
    expect(fotos).toHaveAttribute('href', '/momentos/fotos')
    expect(fotos).not.toHaveAttribute('aria-current')
  })

  it('marks Fotos active when active="fotos"', () => {
    render(
      <MemoryRouter>
        <MediaToggle active="fotos" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Fotos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Vídeos' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- src/components/MediaToggle.test.tsx`
Expected: FAIL — Fotos is a `button`, not a `link`; `getByRole('link', { name: 'Fotos' })` throws.

- [ ] **Step 3: Implement the active Fotos link**

Replace the Fotos `<button>` in `src/components/MediaToggle.tsx` with a `Link`, mirroring the Vídeos pill:

```tsx
<Link
  to="/momentos/fotos"
  aria-current={active === 'fotos' ? 'page' : undefined}
  className={cn(
    base,
    active === 'fotos'
      ? 'bg-cta text-on-cta'
      : 'text-on-surface-variant hover:text-primary',
  )}
>
  Fotos
</Link>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- src/components/MediaToggle.test.tsx`
Expected: PASS (both tests green).

- [ ] **Step 5: Commit**

```bash
git add src/components/MediaToggle.tsx src/components/MediaToggle.test.tsx
git commit -m "feat: enable Fotos toggle link in MediaToggle"
```

---

### Task 4: Route the Fotos view and switch it in MomentosPage

**Files:**
- Modify: `src/routes.tsx`
- Modify: `src/features/momentos/MomentosPage.tsx`
- Test: `src/features/momentos/MomentosPage.test.tsx` (create)

**Interfaces:**
- Consumes: `useLocation`, `useOutletContext` from `react-router`; `selectMomentosHeader`, `selectVideos`, `selectPhotos` from `./momentosSelectors`; `MediaToggle`, `VideoGallery`, `PhotoGallery`.
- Produces: `/momentos/fotos` route → `MomentosPage`; `MomentosPage` renders `PhotoGallery` when the path ends with `/fotos`, otherwise `VideoGallery`.

- [ ] **Step 1: Write the failing page test**

Create `src/features/momentos/MomentosPage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SiteLayout } from '../../layouts/SiteLayout'
import { MomentosPage } from './MomentosPage'

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [
          { path: 'momentos', Component: MomentosPage },
          { path: 'momentos/fotos', Component: MomentosPage },
        ],
      },
    ],
    { initialEntries: [path] },
  )
  return render(<RouterProvider router={router} />)
}

describe('MomentosPage', () => {
  it('renders the video grid at /momentos', async () => {
    renderAt('/momentos')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossos Momentos' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getAllByRole('button', { name: /^Assistir:/ }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: /^Ampliar foto:/ }),
    ).not.toBeInTheDocument()
  })

  it('renders the photo grid at /momentos/fotos', async () => {
    renderAt('/momentos/fotos')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossos Momentos' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getAllByRole('button', { name: /^Ampliar foto:/ }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: /^Assistir:/ }),
    ).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- src/features/momentos/MomentosPage.test.tsx`
Expected: FAIL — at `/momentos/fotos` no `Ampliar foto:` buttons exist yet (MomentosPage always renders VideoGallery).

- [ ] **Step 3: Add the fotos route**

In `src/routes.tsx`, add a child route after `momentos/videos`:

```tsx
{ path: 'momentos/fotos', Component: MomentosPage },
```

- [ ] **Step 4: Switch the view in MomentosPage**

Rewrite `src/features/momentos/MomentosPage.tsx`:

```tsx
import { useLocation, useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { Container } from '../../components/ui/Container'
import { Section } from '../../components/ui/Section'
import { MediaToggle } from '../../components/MediaToggle'
import { VideoGallery } from '../../components/sections/VideoGallery'
import { PhotoGallery } from '../../components/sections/PhotoGallery'
import {
  selectMomentosHeader,
  selectPhotos,
  selectVideos,
} from './momentosSelectors'

export function MomentosPage() {
  const content = useOutletContext<SiteContent>()
  const { pathname } = useLocation()
  const view: 'videos' | 'fotos' = pathname.endsWith('/fotos')
    ? 'fotos'
    : 'videos'

  const header = selectMomentosHeader(content)
  const videos = selectVideos(content)
  const photos = selectPhotos(content)

  return (
    <>
      <Section tone="surface">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-display text-display-lg text-on-surface">
            {header.title}
          </h1>
          <p className="max-w-2xl font-sans text-body-lg text-on-surface-variant">
            {header.subtitle}
          </p>
          <MediaToggle active={view} />
        </Container>
      </Section>
      {view === 'fotos' ? (
        <PhotoGallery photos={photos} />
      ) : (
        <VideoGallery videos={videos} />
      )}
    </>
  )
}
```

- [ ] **Step 5: Run the page test to verify it passes**

Run: `pnpm test -- src/features/momentos/MomentosPage.test.tsx`
Expected: PASS (both tests green).

- [ ] **Step 6: Commit**

```bash
git add src/routes.tsx src/features/momentos/MomentosPage.tsx src/features/momentos/MomentosPage.test.tsx
git commit -m "feat: route and render the Momentos Fotos view"
```

---

### Task 5: E2E coverage for the Fotos view

**Files:**
- Modify: `tests/e2e/momentos.spec.ts`

**Interfaces:**
- Consumes: the running app with the Fotos route wired (Tasks 1–4).
- Produces: Playwright tests covering the Fotos toggle, grid, and lightbox.

- [ ] **Step 1: Update the stale "Fotos disabled" assertion and add Fotos tests**

In `tests/e2e/momentos.spec.ts`, in the first test replace the line:

```ts
  await expect(page.getByRole('button', { name: 'Fotos' })).toBeDisabled()
```

with:

```ts
  await expect(page.getByRole('link', { name: 'Fotos' })).toBeVisible()
```

Then append these tests to the file:

```ts
test('switching to Fotos shows the photo grid', async ({ page }) => {
  await page.goto('/momentos')
  await page.getByRole('link', { name: 'Fotos' }).click()
  await expect(page).toHaveURL(/\/momentos\/fotos/)
  await expect(
    page.getByRole('button', { name: /^Ampliar foto:/ }).first(),
  ).toBeVisible()
})

test('clicking a photo opens the lightbox', async ({ page }) => {
  await page.goto('/momentos/fotos')
  await page.getByRole('button', { name: /^Ampliar foto:/ }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
})
```

- [ ] **Step 2: Run the e2e suite**

Run: `pnpm test:e2e -- momentos`
Expected: PASS (existing momentos tests + the two new Fotos tests green).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/momentos.spec.ts
git commit -m "test: e2e for Momentos Fotos view and lightbox"
```

---

### Task 6: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 2: Type-check + build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 3: Unit/integration tests**

Run: `pnpm test`
Expected: all green.

- [ ] **Step 4: E2E**

Run: `pnpm test:e2e`
Expected: all green.

- [ ] **Step 5: Manual/browser check (Playwright MCP)**

Drive `/momentos/fotos`: confirm the bento grid renders, the first tile spans 2×2 on desktop, hover zoom works, and clicking a photo opens the lightbox with working ‹/› navigation and Esc/✕ close. Confirm the Vídeos/Fotos toggle switches views and highlights the active pill.

---

## Notes

- `public/images/momentos/destaque.jpg` is a 512×512 PNG (the mockup's featured image) saved with a `.jpg` extension — browsers render it fine; `object-cover` fills the 2×2 tile.
- The album-based `src/components/Gallery.tsx` remains unused and untouched (out of scope).
- The `momentos` nav submenu already contains a `Fotos` item pointing at `/momentos/fotos`; this plan adds the route it needs (previously a 404).
