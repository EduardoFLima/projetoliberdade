# Momentos — Vídeos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/momentos` page showing the two project videos as a 2-column grid of cards, each opening the video in a modal overlay, with an inert Fotos toggle.

**Architecture:** Follows the existing feature → selector → section → presentational pattern. A pure `youtube.ts` util isolates all YouTube URL knowledge; `momentosSelectors.ts` isolates content access and produces view-models. `MomentosPage` (container) reads the Outlet context and passes plain props to presentational components (`MediaToggle`, `VideoGallery`, `VideoCard`, `VideoLightbox`). No presentational component imports `content.json` or parses URLs.

**Tech Stack:** TypeScript 6 (strict), React 19, React Router v8 (data mode), Tailwind v4, Vitest + Testing Library, Playwright.

## Global Constraints

- **Dependency rule:** files under `features`, `components`, `layouts` never import `content.json` or reference the data source. Content flows via `useOutletContext<SiteContent>()`.
- **Formatting:** no semicolons, single quotes, trailing commas (Prettier). Run `pnpm format` before committing if unsure.
- **Design tokens** (verified in `src/index.css`): `bg-cta` / `text-on-cta`, `bg-cta-hover`, `text-link`, `bg-surface-container`, `text-on-surface`, `text-on-surface-variant`, `text-display-lg`, `text-headline-sm`, `text-body-lg`, `text-label-md`, `shadow-level2`, `font-display`, `font-sans`, `max-w-site`. Focus ring idiom: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta`.
- **Content is source of truth:** render the `content.json` video titles ("O menino e seu cavalo", "O projeto liberdade"), NOT the mockup's alternatives.
- **No new dependencies.** Icons are inline SVG. Do not add an icon font.
- **`VideoEmbed.tsx` stays** — it is used by the StyleGuide. This plan adds a separate `VideoLightbox`.
- Test commands: `pnpm test -- <path>` (Vitest, single run — the config has no watch by default), `pnpm test:e2e` (Playwright), `pnpm build` (type-check), `pnpm lint`.

---

### Task 1: YouTube URL util

**Files:**
- Create: `src/lib/youtube.ts`
- Test: `src/lib/youtube.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `getYouTubeId(url: string): string | null`
  - `thumbnailUrl(id: string): string`
  - `watchUrl(id: string): string`
  - `embedUrl(id: string): string`

- [ ] **Step 1: Write the failing test**

Create `src/lib/youtube.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getYouTubeId, thumbnailUrl, watchUrl, embedUrl } from './youtube'

describe('youtube util', () => {
  it('extracts the id from an /embed/ url', () => {
    expect(getYouTubeId('https://www.youtube.com/embed/bAkqnk5AqOc')).toBe(
      'bAkqnk5AqOc',
    )
  })

  it('extracts the id from a watch url', () => {
    expect(getYouTubeId('https://www.youtube.com/watch?v=RcaxtQWPI_c')).toBe(
      'RcaxtQWPI_c',
    )
  })

  it('extracts the id from a youtu.be url', () => {
    expect(getYouTubeId('https://youtu.be/bAkqnk5AqOc')).toBe('bAkqnk5AqOc')
  })

  it('returns null for a non-youtube url', () => {
    expect(getYouTubeId('https://example.com/video')).toBeNull()
  })

  it('builds thumbnail, watch and embed urls from an id', () => {
    expect(thumbnailUrl('bAkqnk5AqOc')).toBe(
      'https://img.youtube.com/vi/bAkqnk5AqOc/hqdefault.jpg',
    )
    expect(watchUrl('bAkqnk5AqOc')).toBe(
      'https://www.youtube.com/watch?v=bAkqnk5AqOc',
    )
    expect(embedUrl('bAkqnk5AqOc')).toBe(
      'https://www.youtube.com/embed/bAkqnk5AqOc',
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/lib/youtube.test.ts`
Expected: FAIL — cannot resolve `./youtube` / functions not defined.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/youtube.ts`:

```ts
const ID_RE =
  /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/

export function getYouTubeId(url: string): string | null {
  const match = ID_RE.exec(url)
  return match ? match[1] : null
}

export function thumbnailUrl(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

export function embedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/lib/youtube.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/youtube.ts src/lib/youtube.test.ts
git commit -m "feat: add youtube url util"
```

---

### Task 2: Content header + types + selectors

**Files:**
- Modify: `src/content/content.json` (add `pages.momentos.header` after line 344 `"title": "Momentos",`)
- Modify: `src/content/types.ts` (add momentos page shape)
- Create: `src/features/momentos/momentosSelectors.ts`
- Test: `src/features/momentos/momentosSelectors.test.ts`

**Interfaces:**
- Consumes: `getYouTubeId`, `thumbnailUrl`, `watchUrl`, `embedUrl` from `src/lib/youtube` (Task 1); `SiteContent`, `Video` from `src/content/types`.
- Produces:
  - `interface MomentosHeaderVm { title: string; subtitle: string }`
  - `interface VideoCardVm { slug: string; title: string; thumbnail: string; embedUrl: string; watchUrl: string }`
  - `selectMomentosHeader(content: SiteContent): MomentosHeaderVm`
  - `selectVideos(content: SiteContent): VideoCardVm[]` (sorted by `order`, videos with an unparseable url are dropped)

- [ ] **Step 1: Add the header content to `content.json`**

In `src/content/content.json`, the `momentos` page currently begins:

```json
    "momentos": {
      "slug": "momentos",
      "title": "Momentos",
      "photos": {
```

Insert the `header` object between `"title": "Momentos",` and `"photos": {`:

```json
    "momentos": {
      "slug": "momentos",
      "title": "Momentos",
      "header": {
        "title": "Nossos Momentos",
        "subtitle": "Explore a beleza e a conexão transformadora da equoterapia. Uma galeria de momentos de cura, aprendizado e liberdade em nosso Haras."
      },
      "photos": {
```

- [ ] **Step 2: Write the failing selector test**

Create `src/features/momentos/momentosSelectors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import { selectMomentosHeader, selectVideos } from './momentosSelectors'

const content = {
  site: { name: 'Projeto Liberdade', logo: '/images/logo.png', social: [] },
  navigation: [],
  pages: {
    momentos: {
      slug: 'momentos',
      title: 'Momentos',
      header: { title: 'Nossos Momentos', subtitle: 'Sub texto.' },
      videos: [
        {
          slug: 'segundo',
          title: 'Segundo',
          order: 2,
          url: 'https://www.youtube.com/embed/RcaxtQWPI_c',
        },
        {
          slug: 'primeiro',
          title: 'Primeiro',
          order: 1,
          url: 'https://www.youtube.com/embed/bAkqnk5AqOc',
        },
      ],
    },
  },
} as unknown as SiteContent

describe('momentosSelectors', () => {
  it('selects the header title and subtitle', () => {
    expect(selectMomentosHeader(content)).toEqual({
      title: 'Nossos Momentos',
      subtitle: 'Sub texto.',
    })
  })

  it('returns videos sorted by order with derived urls', () => {
    const videos = selectVideos(content)
    expect(videos.map((v) => v.slug)).toEqual(['primeiro', 'segundo'])
    expect(videos[0]).toEqual({
      slug: 'primeiro',
      title: 'Primeiro',
      thumbnail: 'https://img.youtube.com/vi/bAkqnk5AqOc/hqdefault.jpg',
      embedUrl: 'https://www.youtube.com/embed/bAkqnk5AqOc',
      watchUrl: 'https://www.youtube.com/watch?v=bAkqnk5AqOc',
    })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test -- src/features/momentos/momentosSelectors.test.ts`
Expected: FAIL — cannot resolve `./momentosSelectors`.

- [ ] **Step 4: Add the momentos page shape to `types.ts`**

Append to `src/content/types.ts` (the `Video` interface already exists there):

```ts
export interface MomentosHeader {
  title: string
  subtitle: string
}

export interface MomentosPage extends Page {
  header: MomentosHeader
  videos: Video[]
}
```

- [ ] **Step 5: Write the selector implementation**

Create `src/features/momentos/momentosSelectors.ts`:

```ts
import type { SiteContent, Video } from '../../content/types'
import {
  embedUrl,
  getYouTubeId,
  thumbnailUrl,
  watchUrl,
} from '../../lib/youtube'

export interface MomentosHeaderVm {
  title: string
  subtitle: string
}

export interface VideoCardVm {
  slug: string
  title: string
  thumbnail: string
  embedUrl: string
  watchUrl: string
}

interface MomentosShape {
  title: string
  header?: { title: string; subtitle: string }
  videos?: Video[]
}

export function selectMomentosHeader(content: SiteContent): MomentosHeaderVm {
  const page = content.pages.momentos as unknown as MomentosShape
  return {
    title: page.header?.title ?? page.title,
    subtitle: page.header?.subtitle ?? '',
  }
}

export function selectVideos(content: SiteContent): VideoCardVm[] {
  const page = content.pages.momentos as unknown as MomentosShape
  const videos = [...(page.videos ?? [])].sort((a, b) => a.order - b.order)
  return videos.flatMap((video) => {
    const id = getYouTubeId(video.url)
    if (!id) return []
    return [
      {
        slug: video.slug,
        title: video.title,
        thumbnail: thumbnailUrl(id),
        embedUrl: embedUrl(id),
        watchUrl: watchUrl(id),
      },
    ]
  })
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test -- src/features/momentos/momentosSelectors.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/content/content.json src/content/types.ts src/features/momentos/momentosSelectors.ts src/features/momentos/momentosSelectors.test.ts
git commit -m "feat: add momentos header content, types and selectors"
```

---

### Task 3: VideoLightbox modal

**Files:**
- Create: `src/components/VideoLightbox.tsx`
- Test: `src/components/VideoLightbox.test.tsx`

**Interfaces:**
- Consumes: nothing (plain props).
- Produces: `VideoLightbox` component with props `{ title: string; embedUrl: string; onClose: () => void }`. Renders an iframe whose `src` is `` `${embedUrl}?autoplay=1` ``.

- [ ] **Step 1: Write the failing test**

Create `src/components/VideoLightbox.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { VideoLightbox } from './VideoLightbox'

const props = {
  title: 'O menino e seu cavalo',
  embedUrl: 'https://www.youtube.com/embed/bAkqnk5AqOc',
}

describe('VideoLightbox', () => {
  it('renders a dialog with an autoplaying iframe for the video', () => {
    render(<VideoLightbox {...props} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: props.title })
    expect(dialog).toBeInTheDocument()
    const iframe = screen.getByTitle(props.title)
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/bAkqnk5AqOc?autoplay=1',
    )
  })

  it('calls onClose on Escape and on the close button', () => {
    const onClose = vi.fn()
    render(<VideoLightbox {...props} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/VideoLightbox.test.tsx`
Expected: FAIL — cannot resolve `./VideoLightbox`.

- [ ] **Step 3: Write the implementation**

Create `src/components/VideoLightbox.tsx`:

```tsx
import { useEffect, useRef } from 'react'

interface VideoLightboxProps {
  title: string
  embedUrl: string
  onClose: () => void
}

export function VideoLightbox({ title, embedUrl, onClose }: VideoLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/90 p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
        <div className="aspect-video overflow-hidden rounded-lg">
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <button
        ref={closeRef}
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute right-4 top-4 text-inverse-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/VideoLightbox.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/VideoLightbox.tsx src/components/VideoLightbox.test.tsx
git commit -m "feat: add VideoLightbox modal"
```

---

### Task 4: VideoCard

**Files:**
- Create: `src/components/VideoCard.tsx`
- Test: `src/components/VideoCard.test.tsx`

**Interfaces:**
- Consumes: `VideoCardVm` from `src/features/momentos/momentosSelectors` (Task 2).
- Produces: `VideoCard` component with props `{ video: VideoCardVm; onPlay: (video: VideoCardVm) => void }`.

- [ ] **Step 1: Write the failing test**

Create `src/components/VideoCard.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VideoCard } from './VideoCard'

const video = {
  slug: 'o-menino-e-seu-cavalo',
  title: 'O menino e seu cavalo',
  thumbnail: 'https://img.youtube.com/vi/bAkqnk5AqOc/hqdefault.jpg',
  embedUrl: 'https://www.youtube.com/embed/bAkqnk5AqOc',
  watchUrl: 'https://www.youtube.com/watch?v=bAkqnk5AqOc',
}

describe('VideoCard', () => {
  it('renders the title, thumbnail and a youtube link', () => {
    const { container } = render(<VideoCard video={video} onPlay={() => {}} />)
    expect(screen.getByText('O menino e seu cavalo')).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      video.thumbnail,
    )
    const link = screen.getByRole('link', { name: /Assistir no YouTube/ })
    expect(link).toHaveAttribute('href', video.watchUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener')
  })

  it('calls onPlay with the video when the play button is clicked', () => {
    const onPlay = vi.fn()
    render(<VideoCard video={video} onPlay={onPlay} />)
    screen
      .getByRole('button', { name: 'Assistir: O menino e seu cavalo' })
      .click()
    expect(onPlay).toHaveBeenCalledWith(video)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/VideoCard.test.tsx`
Expected: FAIL — cannot resolve `./VideoCard`.

- [ ] **Step 3: Write the implementation**

Create `src/components/VideoCard.tsx`:

```tsx
import type { VideoCardVm } from '../features/momentos/momentosSelectors'

interface VideoCardProps {
  video: VideoCardVm
  onPlay: (video: VideoCardVm) => void
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  return (
    <figure className="flex flex-col gap-3">
      <button
        type="button"
        aria-label={`Assistir: ${video.title}`}
        onClick={() => onPlay(video)}
        className="group relative block overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      >
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cta text-on-cta shadow-level2 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 translate-x-0.5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>
      <figcaption className="flex flex-col gap-1">
        <span className="font-display text-headline-sm text-on-surface">
          {video.title}
        </span>
        <a
          href={video.watchUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-label-md text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        >
          Assistir no YouTube
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </figcaption>
    </figure>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/VideoCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/VideoCard.tsx src/components/VideoCard.test.tsx
git commit -m "feat: add VideoCard"
```

---

### Task 5: MediaToggle (Vídeos/Fotos)

**Files:**
- Create: `src/components/MediaToggle.tsx`
- Test: `src/components/MediaToggle.test.tsx`

**Interfaces:**
- Consumes: `Link` from `react-router`; `cn` from `src/lib/cn`.
- Produces: `MediaToggle` component with props `{ active: 'videos' | 'fotos' }`. Vídeos is a `Link` to `/momentos/videos`; Fotos is a disabled `<button>`.

- [ ] **Step 1: Write the failing test**

Create `src/components/MediaToggle.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MediaToggle } from './MediaToggle'

describe('MediaToggle', () => {
  it('renders Vídeos as the active link and Fotos as a disabled button', () => {
    render(
      <MemoryRouter>
        <MediaToggle active="videos" />
      </MemoryRouter>,
    )
    const videos = screen.getByRole('link', { name: 'Vídeos' })
    expect(videos).toHaveAttribute('href', '/momentos/videos')
    expect(videos).toHaveAttribute('aria-current', 'page')

    const fotos = screen.getByRole('button', { name: 'Fotos' })
    expect(fotos).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/MediaToggle.test.tsx`
Expected: FAIL — cannot resolve `./MediaToggle`.

- [ ] **Step 3: Write the implementation**

Create `src/components/MediaToggle.tsx`:

```tsx
import { Link } from 'react-router'
import { cn } from '../lib/cn'

interface MediaToggleProps {
  active: 'videos' | 'fotos'
}

const base =
  'rounded-full px-6 py-2 text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta'

export function MediaToggle({ active }: MediaToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface-container p-1">
      <Link
        to="/momentos/videos"
        aria-current={active === 'videos' ? 'page' : undefined}
        className={cn(
          base,
          active === 'videos'
            ? 'bg-cta text-on-cta'
            : 'text-on-surface-variant hover:text-primary',
        )}
      >
        Vídeos
      </Link>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Em breve"
        className={cn(
          base,
          'cursor-not-allowed text-on-surface-variant opacity-50',
        )}
      >
        Fotos
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/MediaToggle.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/MediaToggle.tsx src/components/MediaToggle.test.tsx
git commit -m "feat: add MediaToggle with disabled Fotos"
```

---

### Task 6: VideoGallery section

**Files:**
- Create: `src/components/sections/VideoGallery.tsx`
- Test: `src/components/sections/VideoGallery.test.tsx`

**Interfaces:**
- Consumes: `VideoCardVm` (Task 2), `VideoCard` (Task 4), `VideoLightbox` (Task 3), `Container` + `Section` from `src/components/ui`.
- Produces: `VideoGallery` component with props `{ videos: VideoCardVm[] }`. Owns the "which video is open" state.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/VideoGallery.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VideoGallery } from './VideoGallery'

const videos = [
  {
    slug: 'a',
    title: 'Vídeo A',
    thumbnail: 'https://img.youtube.com/vi/aaaaaaaaaaa/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/aaaaaaaaaaa',
    watchUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
  },
  {
    slug: 'b',
    title: 'Vídeo B',
    thumbnail: 'https://img.youtube.com/vi/bbbbbbbbbbb/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/bbbbbbbbbbb',
    watchUrl: 'https://www.youtube.com/watch?v=bbbbbbbbbbb',
  },
]

describe('VideoGallery', () => {
  it('renders a card per video and opens the modal on play', () => {
    render(<VideoGallery videos={videos} />)
    expect(
      screen.getAllByRole('button', { name: /^Assistir:/ }),
    ).toHaveLength(2)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    screen.getByRole('button', { name: 'Assistir: Vídeo B' }).click()
    const dialog = screen.getByRole('dialog', { name: 'Vídeo B' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByTitle('Vídeo B')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/bbbbbbbbbbb?autoplay=1',
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/sections/VideoGallery.test.tsx`
Expected: FAIL — cannot resolve `./VideoGallery`.

- [ ] **Step 3: Write the implementation**

Create `src/components/sections/VideoGallery.tsx`:

```tsx
import { useState } from 'react'
import type { VideoCardVm } from '../../features/momentos/momentosSelectors'
import { VideoCard } from '../VideoCard'
import { VideoLightbox } from '../VideoLightbox'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'

interface VideoGalleryProps {
  videos: VideoCardVm[]
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [open, setOpen] = useState<VideoCardVm | null>(null)
  return (
    <Section tone="surface">
      <Container>
        <ul className="grid gap-8 md:grid-cols-2">
          {videos.map((video) => (
            <li key={video.slug}>
              <VideoCard video={video} onPlay={setOpen} />
            </li>
          ))}
        </ul>
      </Container>
      {open ? (
        <VideoLightbox
          title={open.title}
          embedUrl={open.embedUrl}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </Section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/sections/VideoGallery.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/VideoGallery.tsx src/components/sections/VideoGallery.test.tsx
git commit -m "feat: add VideoGallery section"
```

---

### Task 7: MomentosPage + routes + e2e

**Files:**
- Create: `src/features/momentos/MomentosPage.tsx`
- Modify: `src/routes.tsx` (import + two routes)
- Create: `tests/e2e/momentos.spec.ts`

**Interfaces:**
- Consumes: `selectMomentosHeader`, `selectVideos` (Task 2); `MediaToggle` (Task 5); `VideoGallery` (Task 6); `Container` + `Section` from `src/components/ui`; `useOutletContext` from `react-router`.
- Produces: `MomentosPage` component (default page for `/momentos` and `/momentos/videos`).

- [ ] **Step 1: Write the failing e2e test**

Create `tests/e2e/momentos.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('momentos videos page renders header, toggle and two video cards', async ({
  page,
}) => {
  await page.goto('/momentos')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossos Momentos' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Vídeos' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fotos' })).toBeDisabled()
  await expect(page.getByRole('button', { name: /^Assistir:/ })).toHaveCount(2)
})

test('playing a video opens the modal', async ({ page }) => {
  await page.goto('/momentos')
  await page
    .getByRole('button', { name: 'Assistir: O menino e seu cavalo' })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- momentos`
Expected: FAIL — `/momentos` has no route (404 / heading not found).

- [ ] **Step 3: Create the MomentosPage container**

Create `src/features/momentos/MomentosPage.tsx`:

```tsx
import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { Container } from '../../components/ui/Container'
import { Section } from '../../components/ui/Section'
import { MediaToggle } from '../../components/MediaToggle'
import { VideoGallery } from '../../components/sections/VideoGallery'
import { selectMomentosHeader, selectVideos } from './momentosSelectors'

export function MomentosPage() {
  const content = useOutletContext<SiteContent>()
  const header = selectMomentosHeader(content)
  const videos = selectVideos(content)

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
          <MediaToggle active="videos" />
        </Container>
      </Section>
      <VideoGallery videos={videos} />
    </>
  )
}
```

- [ ] **Step 4: Wire the routes**

In `src/routes.tsx`, add the import next to the other page imports:

```tsx
import { MomentosPage } from './features/momentos/MomentosPage'
```

Then add two child routes to the `children` array (place them after the `servicos` route, before `estilo`):

```tsx
      { path: 'momentos', Component: MomentosPage },
      { path: 'momentos/videos', Component: MomentosPage },
```

- [ ] **Step 5: Run the e2e test to verify it passes**

Run: `pnpm test:e2e -- momentos`
Expected: PASS (2 tests). Playwright's `webServer` builds/serves automatically; the two YouTube thumbnail/iframe requests are external and do not affect these assertions.

- [ ] **Step 6: Commit**

```bash
git add src/features/momentos/MomentosPage.tsx src/routes.tsx tests/e2e/momentos.spec.ts
git commit -m "feat: add MomentosPage and /momentos routes"
```

---

### Task 8: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Type-check and build**

Run: `pnpm build`
Expected: PASS — no TypeScript errors.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: PASS — no ESLint errors.

- [ ] **Step 3: Full unit suite**

Run: `pnpm test`
Expected: PASS — all suites green, including the new youtube/selectors/VideoLightbox/VideoCard/MediaToggle/VideoGallery tests.

- [ ] **Step 4: Full e2e suite**

Run: `pnpm test:e2e`
Expected: PASS — existing specs plus `momentos.spec.ts`.

- [ ] **Step 5: Manual browser check (Playwright MCP)**

Run `pnpm dev`, open `http://localhost:5173/momentos`. Confirm: header + subtitle centered, Vídeos active / Fotos disabled, two thumbnails with play buttons render, clicking play opens the modal and the video plays, Esc/backdrop/✕ close it, "Assistir no YouTube ↗" opens the watch page in a new tab.

- [ ] **Step 6: Commit any formatting fixups**

```bash
pnpm format
git add -A
git commit -m "chore: format momentos feature" || echo "nothing to format"
```

---

## Self-Review Notes

- **Spec coverage:** modal playback (Task 3), derived thumbnails/URLs (Tasks 1–2), routes + inert Fotos (Tasks 5, 7), header content (Task 2), no "Carregar Mais" (omitted by design), accessibility (aria-labels, dialog semantics, external-link a11y across Tasks 3–5), tests incl. Playwright (Tasks 1–7) and verification (Task 8). `VideoEmbed` intentionally retained (used by StyleGuide).
- **Type consistency:** `VideoCardVm` is defined once in Task 2 and consumed by Tasks 4, 6, 7. `selectMomentosHeader`/`selectVideos` names match across the plan. `MediaToggle` prop `active: 'videos' | 'fotos'`.
- **No placeholders:** every code step contains complete code; every run step lists an exact command and expected result.
