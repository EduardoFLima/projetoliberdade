# História Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/historia` ("História") page from the "About Us" mockup, reusing existing section components and adding one new reusable `PageHero`.

**Architecture:** A routed `HistoriaPage` container reads site content from the router `Outlet` context and composes three sections: a new lightweight `PageHero`, the existing `HistoriaSection` (extended with an optional heading and an optional pullquote), and the existing `MissionVisionValues`. Content flows through selectors; presentational components take props only. Shared block helpers and the MVV selector are lifted into `src/content/selectors.ts` so both the home and historia features consume them without importing each other.

**Tech Stack:** TypeScript 6 (strict), React 19, React Router v8 (data mode), Tailwind CSS v4, Vitest + Testing Library, Playwright.

## Global Constraints

- **Dependency rule:** `features`, `components`, `layouts` never import `content.json` or Firebase. Containers read the router `Outlet` context via `useOutletContext`; presentational components receive content via props only. **No feature-to-feature imports.**
- **No duplicated block helpers:** `paragraphs` / `firstParagraph` live in exactly one place (`src/content/selectors.ts`).
- **Portuguese content values, English keys.** UI strings that are content come from `content.json`; never hardcode editorial copy in components.
- **Code style:** no semicolons, single quotes, trailing commas (Prettier). Small single-responsibility files. TDD: failing test first.
- **Design tokens only** — use theme classes (`text-on-surface`, `bg-surface`, `font-display`, `text-display-lg`, etc.); no raw hex, no arbitrary Tailwind config.
- **Test render helper:** `renderWithRouter` from `src/test/render.tsx` wraps UI in a `MemoryRouter`.
- Commit message trailer on every commit:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

## File Structure

- **Create** `src/content/selectors.ts` — shared content selectors: `paragraphs`, `firstParagraph`, `selectMvv`.
- **Modify** `src/features/home/homeSelectors.ts` — import/re-export the shared helpers instead of defining them locally (HomePage's imports stay valid).
- **Create** `src/components/sections/PageHero.tsx` + `PageHero.test.tsx` — new reusable page hero.
- **Modify** `src/components/sections/HistoriaSection.tsx` + `HistoriaSection.test.tsx` — optional `heading`, optional `quote` pullquote.
- **Create** `src/features/historia/historiaSelectors.ts` + `historiaSelectors.test.ts` — `selectHistoriaHero`, `selectHistoriaNarrative`; re-export `selectMvv`.
- **Create** `src/features/historia/HistoriaPage.tsx` + `HistoriaPage.test.tsx` — the routed container.
- **Modify** `src/routes.tsx` — add the `historia` route.
- **Modify** `src/content/content.json` — add `pages.historia.hero`.
- **Create** `tests/e2e/historia.spec.ts` — page smoke test.
- **Asset (already downloaded):** `public/images/historia-hero.jpg` — committed in Task 7.

---

## Task 1: Add the historia hero content

**Files:**
- Modify: `src/content/content.json:114-117`

Adds the hero title + subtitle to the historia page content. No test (static data); verified via the selector test in Task 5.

- [ ] **Step 1: Edit `content.json`**

Insert a `hero` object between `"title": "História",` (line 116) and `"body": [` (line 117). The historia block becomes:

```json
    "historia": {
      "slug": "historia",
      "title": "História",
      "hero": {
        "title": "Nossa História",
        "subtitle": "Terapia e reabilitação equestre desde 2006. Uma jornada de dedicação, cuidado e liberdade."
      },
      "body": [
```

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/content/content.json','utf8')); console.log('valid')"`
Expected: prints `valid`

- [ ] **Step 3: Commit**

```bash
git add src/content/content.json
git commit -m "feat(content): add historia hero title and subtitle

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Shared content selectors module

Lifts the block helpers and the MVV selector out of `home/homeSelectors.ts` into `src/content/selectors.ts` so both features share them. `homeSelectors` re-exports `selectMvv` and imports the helpers, so `HomePage`'s existing imports (`selectMvv` from `./homeSelectors`) keep working unchanged.

**Files:**
- Create: `src/content/selectors.ts`
- Modify: `src/features/home/homeSelectors.ts`
- Test: `src/features/home/homeSelectors.test.ts` (already exists — must still pass unchanged)

**Interfaces:**
- Produces:
  - `paragraphs(body: Block[]): string[]`
  - `firstParagraph(body: Block[]): string`
  - `selectMvv(content: SiteContent): { heading: string; body: Block[] }`

- [ ] **Step 1: Create `src/content/selectors.ts`**

```ts
import type { Block, SiteContent } from './types'

interface NamedSection {
  slug: string
  title: string
  body: Block[]
}

interface HistoriaWithSections {
  title: string
  body?: Block[]
  sections?: NamedSection[]
}

export function paragraphs(body: Block[]): string[] {
  return body
    .filter(
      (b): b is Extract<Block, { type: 'paragraph' }> => b.type === 'paragraph',
    )
    .map((b) => b.text)
}

export function firstParagraph(body: Block[]): string {
  return paragraphs(body)[0] ?? ''
}

export function selectMvv(content: SiteContent): {
  heading: string
  body: Block[]
} {
  const page = content.pages.historia as unknown as HistoriaWithSections
  const section = page.sections?.find((s) => s.slug === 'missao-visao-valores')
  return {
    heading: section?.title ?? 'Missão, Visão e Valores',
    body: section?.body ?? [],
  }
}
```

- [ ] **Step 2: Refactor `src/features/home/homeSelectors.ts`**

Remove the local `paragraphs`, `firstParagraph`, and `selectMvv` definitions. Add an import from the shared module and re-export `selectMvv`. The top of the file becomes:

```ts
import type {
  Block,
  HeroContent,
  HomeContent,
  SiteContent,
} from '../../content/types'
import type { ServiceCardData } from '../../components/sections/ServicesSection'
import { firstParagraph, paragraphs, selectMvv } from '../../content/selectors'

export { selectMvv }
```

Then delete the old local `function paragraphs(...)`, `function firstParagraph(...)`, and `export function selectMvv(...)` blocks. Keep `selectHero`, `selectHistoria`, and `selectServices` as they are (they now use the imported `paragraphs` / `firstParagraph`). The `NamedSection` / `HistoriaPage` / `HistoriaWithSections` / `ServicosPage` interfaces that remain used by the kept functions stay in this file.

- [ ] **Step 3: Run the existing home selector + page tests**

Run: `pnpm test -- src/features/home`
Expected: PASS (all existing home tests green — the refactor is behavior-preserving)

- [ ] **Step 4: Type-check**

Run: `pnpm exec tsc -b`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/content/selectors.ts src/features/home/homeSelectors.ts
git commit -m "refactor(content): lift shared block helpers and selectMvv into content/selectors

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: PageHero component

The one new component: a light-gradient page hero with centered dark text, no logo/CTA. Reusable for future pages.

**Files:**
- Create: `src/components/sections/PageHero.tsx`
- Test: `src/components/sections/PageHero.test.tsx`

**Interfaces:**
- Produces: `PageHero(props: { image: string; alt: string; title: string; subtitle: string }): JSX.Element` — renders an `<h1>` with `title`, a `<p>` with `subtitle`, and an image div exposed via `role="img"` + `aria-label={alt}`.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/PageHero.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHero } from './PageHero'

const props = {
  image: '/images/historia-hero.jpg',
  alt: 'Sessão de equoterapia ao pôr do sol',
  title: 'Nossa História',
  subtitle: 'Terapia e reabilitação equestre desde 2006.',
}

describe('PageHero', () => {
  it('renders the title and subtitle', () => {
    render(<PageHero {...props} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nossa História' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Terapia e reabilitação equestre desde 2006.'),
    ).toBeInTheDocument()
  })

  it('exposes the background image via an accessible name', () => {
    render(<PageHero {...props} />)
    expect(
      screen.getByRole('img', { name: 'Sessão de equoterapia ao pôr do sol' }),
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/sections/PageHero.test.tsx`
Expected: FAIL — cannot resolve `./PageHero`

- [ ] **Step 3: Write the component**

Create `src/components/sections/PageHero.tsx`:

```tsx
interface PageHeroProps {
  image: string
  alt: string
  title: string
  subtitle: string
}

export function PageHero({ image, alt, title, subtitle }: PageHeroProps) {
  return (
    <header className="relative flex items-center justify-center overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 z-0">
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 bg-cover opacity-80"
          style={{
            backgroundImage: `url(${image})`,
            backgroundPosition: 'center 20%',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-surface-container/60 to-surface/90"
        />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center md:px-16">
        <h1 className="mb-4 font-display text-display-lg text-on-surface">
          {title}
        </h1>
        <p className="font-sans text-body-lg text-on-surface-variant">
          {subtitle}
        </p>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/sections/PageHero.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/PageHero.tsx src/components/sections/PageHero.test.tsx
git commit -m "feat(sections): add reusable PageHero component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: HistoriaSection — optional heading + pullquote

Two backward-compatible changes: `heading` becomes optional (omitted → no `SectionHeading`), and an optional `quote` renders a pullquote via the existing `Quote` block component.

**Files:**
- Modify: `src/components/sections/HistoriaSection.tsx`
- Test: `src/components/sections/HistoriaSection.test.tsx` (add cases)

**Interfaces:**
- Consumes: `Quote` from `src/components/blocks/Quote.tsx` — `Quote(props: { text: string; author?: string })`.
- Produces: updated `HistoriaSection` props:
  `{ heading?: string; paragraphs: string[]; image?: { src: string; alt: string }; cta?: { label: string; to: string }; quote?: { text: string; author?: string }; tone?: 'surface' | 'muted' }`.

- [ ] **Step 1: Add failing tests**

Append two cases inside the existing `describe('HistoriaSection', ...)` block in `src/components/sections/HistoriaSection.test.tsx` (keep the existing three tests). Also add the `Quote`-related imports already available via the component; the test only needs the existing imports at the top of the file:

```tsx
  it('omits the heading when none is provided', () => {
    renderWithRouter(
      <HistoriaSection paragraphs={['Só um parágrafo.']} />,
    )
    expect(
      screen.queryByRole('heading', { level: 2 }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Só um parágrafo.')).toBeInTheDocument()
  })

  it('renders a pullquote when a quote is provided', () => {
    renderWithRouter(
      <HistoriaSection
        paragraphs={['Texto.']}
        quote={{ text: 'Dezesseis anos de dedicação.' }}
      />,
    )
    expect(
      screen.getByText('Dezesseis anos de dedicação.'),
    ).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/components/sections/HistoriaSection.test.tsx`
Expected: FAIL — the no-heading test fails a type/render expectation (heading currently required and always rendered); the quote test fails (no quote rendered)

- [ ] **Step 3: Update the component**

Replace the contents of `src/components/sections/HistoriaSection.tsx` with:

```tsx
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'
import { Quote } from '../blocks/Quote'

interface HistoriaSectionProps {
  heading?: string
  paragraphs: string[]
  image?: { src: string; alt: string }
  cta?: { label: string; to: string }
  quote?: { text: string; author?: string }
  tone?: 'surface' | 'muted'
}

export function HistoriaSection({
  heading,
  paragraphs,
  image,
  cta,
  quote,
  tone = 'surface',
}: HistoriaSectionProps) {
  return (
    <Section tone={tone}>
      <Container>
        {heading ? <SectionHeading title={heading} /> : null}
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            {paragraphs.map((text) => (
              <p
                key={text}
                className="font-sans text-body-md text-on-surface-variant"
              >
                {text}
              </p>
            ))}
            {quote ? <Quote text={quote.text} author={quote.author} /> : null}
            {cta ? (
              <Button to={cta.to} variant="secondary">
                {cta.label}
              </Button>
            ) : null}
          </div>
          {image ? (
            <div className="overflow-hidden rounded-xl shadow-level1">
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- src/components/sections/HistoriaSection.test.tsx`
Expected: PASS (all five tests — the original three still green)

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/HistoriaSection.tsx src/components/sections/HistoriaSection.test.tsx
git commit -m "feat(sections): HistoriaSection optional heading and pullquote

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: historia selectors

Selectors for the historia page: the hero copy (from `pages.historia.hero`, with the image + alt as constants tied to the downloaded asset) and the full narrative (all paragraphs + first image + first quote). Re-exports `selectMvv` from the shared module so `HistoriaPage` imports everything from one place.

**Files:**
- Create: `src/features/historia/historiaSelectors.ts`
- Test: `src/features/historia/historiaSelectors.test.ts`

**Interfaces:**
- Consumes: `paragraphs`, `selectMvv` from `src/content/selectors.ts`.
- Produces:
  - `selectHistoriaHero(content: SiteContent): { title: string; subtitle: string; image: string; alt: string }`
  - `selectHistoriaNarrative(content: SiteContent): { paragraphs: string[]; image?: { src: string; alt: string }; quote?: { text: string; author?: string } }`
  - re-exported `selectMvv`.

- [ ] **Step 1: Write the failing test**

Create `src/features/historia/historiaSelectors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import {
  selectHistoriaHero,
  selectHistoriaNarrative,
  selectMvv,
} from './historiaSelectors'

const content = {
  site: { name: 'Projeto Liberdade', logo: '/images/logo.png', social: [] },
  navigation: [],
  pages: {
    historia: {
      slug: 'historia',
      title: 'História',
      hero: {
        title: 'Nossa História',
        subtitle: 'Desde 2006.',
      },
      body: [
        { type: 'image', src: '/images/historia.jpg', alt: 'Fundadores' },
        { type: 'paragraph', text: 'P1' },
        { type: 'paragraph', text: 'P2' },
        { type: 'quote', text: 'Q', author: 'André e Karina' },
      ],
      sections: [
        {
          slug: 'missao-visao-valores',
          title: 'Missão, Visão e Valores',
          body: [{ type: 'heading', text: 'Missão' }],
        },
      ],
    },
  },
} as unknown as SiteContent

describe('historiaSelectors', () => {
  it('selectHistoriaHero returns title, subtitle, image and alt', () => {
    const hero = selectHistoriaHero(content)
    expect(hero.title).toBe('Nossa História')
    expect(hero.subtitle).toBe('Desde 2006.')
    expect(hero.image).toBe('/images/historia-hero.jpg')
    expect(hero.alt.length).toBeGreaterThan(0)
  })

  it('selectHistoriaNarrative returns all paragraphs, the image and the quote', () => {
    const n = selectHistoriaNarrative(content)
    expect(n.paragraphs).toEqual(['P1', 'P2'])
    expect(n.image).toEqual({ src: '/images/historia.jpg', alt: 'Fundadores' })
    expect(n.quote).toEqual({ text: 'Q', author: 'André e Karina' })
  })

  it('re-exports selectMvv', () => {
    expect(selectMvv(content).heading).toBe('Missão, Visão e Valores')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/historia/historiaSelectors.test.ts`
Expected: FAIL — cannot resolve `./historiaSelectors`

- [ ] **Step 3: Write the selectors**

Create `src/features/historia/historiaSelectors.ts`:

```ts
import type { Block, SiteContent } from '../../content/types'
import { paragraphs, selectMvv } from '../../content/selectors'

export { selectMvv }

interface HistoriaHero {
  title: string
  subtitle: string
}

interface HistoriaPage {
  title: string
  hero?: HistoriaHero
  body?: Block[]
}

const HERO_IMAGE = '/images/historia-hero.jpg'
const HERO_IMAGE_ALT =
  'Criança em sessão de equoterapia ao pôr do sol, conduzida por uma terapeuta no campo'

export function selectHistoriaHero(content: SiteContent): {
  title: string
  subtitle: string
  image: string
  alt: string
} {
  const page = content.pages.historia as unknown as HistoriaPage
  return {
    title: page.hero?.title ?? page.title,
    subtitle: page.hero?.subtitle ?? '',
    image: HERO_IMAGE,
    alt: HERO_IMAGE_ALT,
  }
}

export function selectHistoriaNarrative(content: SiteContent): {
  paragraphs: string[]
  image?: { src: string; alt: string }
  quote?: { text: string; author?: string }
} {
  const page = content.pages.historia as unknown as HistoriaPage
  const body = page.body ?? []
  const image = body.find(
    (b): b is Extract<Block, { type: 'image' }> => b.type === 'image',
  )
  const quote = body.find(
    (b): b is Extract<Block, { type: 'quote' }> => b.type === 'quote',
  )
  return {
    paragraphs: paragraphs(body),
    image: image ? { src: image.src, alt: image.alt } : undefined,
    quote: quote ? { text: quote.text, author: quote.author } : undefined,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/historia/historiaSelectors.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/historia/historiaSelectors.ts src/features/historia/historiaSelectors.test.ts
git commit -m "feat(historia): add historia hero and narrative selectors

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: HistoriaPage container + route

The routed container composes the three sections; the route wires `/historia` into `SiteLayout`.

**Files:**
- Create: `src/features/historia/HistoriaPage.tsx`
- Test: `src/features/historia/HistoriaPage.test.tsx`
- Modify: `src/routes.tsx`

**Interfaces:**
- Consumes: `PageHero`, `HistoriaSection`, `MissionVisionValues`, and `selectHistoriaHero` / `selectHistoriaNarrative` / `selectMvv` from `./historiaSelectors`.
- Produces: `HistoriaPage()` component used as the `/historia` route.

- [ ] **Step 1: Write the failing test**

Create `src/features/historia/HistoriaPage.test.tsx` (mirrors `HomePage.test.tsx` — mounts through `SiteLayout` so the outlet context is populated from the real `content.json`):

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SiteLayout } from '../../layouts/SiteLayout'
import { HistoriaPage } from './HistoriaPage'

function renderHistoria() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ path: 'historia', Component: HistoriaPage }],
      },
    ],
    { initialEntries: ['/historia'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('HistoriaPage', () => {
  it('renders the page hero, narrative and MVV from content', async () => {
    renderHistoria()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossa História' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Missão, Visão e Valores',
      }),
    ).toBeInTheDocument()
  })

  it('does not render a redundant "História" narrative heading', async () => {
    renderHistoria()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossa História' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('heading', { level: 2, name: 'História' }),
    ).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/historia/HistoriaPage.test.tsx`
Expected: FAIL — cannot resolve `./HistoriaPage`

- [ ] **Step 3: Write the container**

Create `src/features/historia/HistoriaPage.tsx`:

```tsx
import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { PageHero } from '../../components/sections/PageHero'
import { HistoriaSection } from '../../components/sections/HistoriaSection'
import { MissionVisionValues } from '../../components/sections/MissionVisionValues'
import {
  selectHistoriaHero,
  selectHistoriaNarrative,
  selectMvv,
} from './historiaSelectors'

export function HistoriaPage() {
  const content = useOutletContext<SiteContent>()
  const hero = selectHistoriaHero(content)
  const narrative = selectHistoriaNarrative(content)
  const mvv = selectMvv(content)

  return (
    <>
      <PageHero
        image={hero.image}
        alt={hero.alt}
        title={hero.title}
        subtitle={hero.subtitle}
      />
      <HistoriaSection
        tone="surface"
        paragraphs={narrative.paragraphs}
        image={narrative.image}
        quote={narrative.quote}
      />
      <MissionVisionValues tone="muted" heading={mvv.heading} body={mvv.body} />
    </>
  )
}
```

- [ ] **Step 4: Add the route**

In `src/routes.tsx`, import the page and add its route before the `*` catch-all. The imports gain:

```tsx
import { HistoriaPage } from './features/historia/HistoriaPage'
```

and the `children` array becomes:

```tsx
    children: [
      { index: true, Component: HomePage },
      { path: 'historia', Component: HistoriaPage },
      { path: 'estilo', Component: StyleGuide },
      { path: '*', Component: NotFound },
    ],
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- src/features/historia/HistoriaPage.test.tsx`
Expected: PASS

- [ ] **Step 6: Full unit suite + type-check + lint**

Run: `pnpm test`
Expected: PASS (all suites)
Run: `pnpm build`
Expected: type-check + production build succeed
Run: `pnpm lint`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/features/historia/HistoriaPage.tsx src/features/historia/HistoriaPage.test.tsx src/routes.tsx
git commit -m "feat(historia): add HistoriaPage container and /historia route

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Hero image asset + E2E smoke test

Commits the downloaded hero image and adds a Playwright smoke test that drives the real `/historia` page.

**Files:**
- Add: `public/images/historia-hero.jpg` (already downloaded in the working tree)
- Create: `tests/e2e/historia.spec.ts`

- [ ] **Step 1: Confirm the asset exists**

Run: `file public/images/historia-hero.jpg`
Expected: `JPEG image data` (the file is already present; if missing, re-download the mockup hero image into that path)

- [ ] **Step 2: Write the E2E spec**

Create `tests/e2e/historia.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('historia page renders hero, narrative and MVV', async ({ page }) => {
  await page.goto('/historia')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossa História' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', {
      name: /André Amaral e Karina Hollatz/,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Missão, Visão e Valores' }),
  ).toBeVisible()
})

test('historia is reachable from the header nav', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'História' }).first().click()
  await expect(page).toHaveURL(/\/historia$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nossa História' }),
  ).toBeVisible()
})
```

- [ ] **Step 3: Run the E2E spec**

Run: `pnpm test:e2e -- historia`
Expected: PASS (both tests). If the nav-label test fails because the header uses a different História link label/target, read `src/components/Header.tsx` / `Nav.tsx` and adjust the locator to the actual nav link for historia — do not change the app nav to fit the test.

- [ ] **Step 4: Commit**

```bash
git add public/images/historia-hero.jpg tests/e2e/historia.spec.ts
git commit -m "test(e2e): add historia page smoke test and hero asset

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Manual verification

- [ ] **Step 1: Run the dev server and view the page**

Run: `pnpm dev` and open `http://localhost:5173/historia`
Expected: hero with the sunset image + "Nossa História" over a light gradient; the narrative (4 paragraphs + founders photo + founders pullquote, no top heading); the three Missão/Visão/Valores cards. Verify the header "História" nav item is active and the layout is responsive at mobile width.

- [ ] **Step 2: Final full check**

Run: `pnpm build && pnpm lint && pnpm test`
Expected: all green.

---

## Self-Review Notes

- **Spec coverage:** PageHero (Task 3), HistoriaSection heading/quote changes (Task 4), route + container (Task 6), historiaSelectors + `selectMvv` reuse (Task 5), shared-selector lift into `content/selectors.ts` (Task 2), hero content in `content.json` (Task 1), hero image asset (Task 7), tests across Tasks 3–7. All spec sections map to a task.
- **Type consistency:** `selectHistoriaHero`/`selectHistoriaNarrative`/`selectMvv` signatures in Task 5 match their consumption in Task 6; `HistoriaSection` prop shape in Task 4 matches the props passed in Task 6; `Quote` props (`text`, `author?`) match usage.
- **Dependency rule:** only containers (`HomePage`, `HistoriaPage`) read content; `content/selectors.ts` lives in the content layer; no feature imports another feature.
