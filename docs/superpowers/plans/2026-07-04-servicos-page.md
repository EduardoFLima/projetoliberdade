# Serviços Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `/servicos` page showing every service (the home page features only three), plus a Hippussuit spotlight and a contact call-to-action, and make the header "Serviços" menu item a plain link to the page.

**Architecture:** A routed container (`ServicosPage`) reads `SiteContent` via `useOutletContext` and feeds pure selectors into three presentational sections. The existing `ServicesSection` is reused for the card grid; two small prop-driven sections (`FeatureSpotlight`, `ContactCta`) and a shared `ContactButton` are new. The header dropdown is removed by deleting the `servicos` submenu from content data — no `Nav` code change.

**Tech Stack:** TypeScript, React 19, React Router v8 (data mode), Tailwind CSS v4, Vitest + Testing Library, Playwright.

## Global Constraints

- **Dependency rule:** `features`, `components`, `layouts` never import `content.json` or reference Firebase. Containers read content via `useOutletContext`; presentational components receive content via props only. (Test files may import `content.json` as fixtures.)
- **Code style:** no semicolons, single quotes, trailing commas. Small single-responsibility files.
- **Styling:** Tailwind v4 utility classes only; use design tokens already in `src/index.css` (`text-cta`, `text-secondary`, `text-on-surface-variant`, `headline-md`, `body-md`, `body-lg`, `shadow-level1`, etc.). No new tokens.
- **Content values are Portuguese; keys are English.** Slugs double as URL paths (`/servicos/:slug`).
- **Hippussuit image:** use `/images/hippussuit.jpg` (already in `public/images/`), overriding the placeholder filename in `content.json`.
- **Testing:** Vitest for selectors/pure components/content data; Playwright for page behavior. TDD — failing test first. Commit after each task.
- **Commands:** `pnpm test` (vitest, single run: `pnpm test -- run <path>`), `pnpm test:e2e`, `pnpm lint`, `pnpm build`.

---

### Task 1: `CheckCircleIcon`

**Files:**
- Modify: `src/components/ui/icons.tsx` (add one export, following the existing `Svg` helper pattern)
- Test: `src/components/ui/icons.test.tsx:14-21` (add to the existing icon list)

**Interfaces:**
- Consumes: the private `Svg` helper and `IconProps` already in `icons.tsx`.
- Produces: `export function CheckCircleIcon({ className }: IconProps)` — an aria-hidden `<svg>` forwarding `className`, drawn with `stroke="currentColor"`.

- [ ] **Step 1: Add `CheckCircleIcon` to the shared icon test list**

In `src/components/ui/icons.test.tsx`, add `CheckCircleIcon` to the import block and to the `icons` array so it is covered by the existing assertion (renders an aria-hidden svg and forwards `className`):

```tsx
import {
  ArrowForwardIcon,
  ChatIcon,
  CheckCircleIcon,
  FavoriteIcon,
  FlagIcon,
  MenuIcon,
  VisibilityIcon,
} from './icons'
```

```tsx
    const icons = [
      FlagIcon,
      VisibilityIcon,
      FavoriteIcon,
      ArrowForwardIcon,
      ChatIcon,
      MenuIcon,
      CheckCircleIcon,
    ]
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- run src/components/ui/icons.test.tsx`
Expected: FAIL — `CheckCircleIcon` is not exported (import error / undefined).

- [ ] **Step 3: Implement `CheckCircleIcon`**

Add to `src/components/ui/icons.tsx` (after `MenuIcon`):

```tsx
export function CheckCircleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Svg>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- run src/components/ui/icons.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/icons.tsx src/components/ui/icons.test.tsx
git commit -m "feat(ui): add CheckCircleIcon"
```

---

### Task 2: Serviços selectors

**Files:**
- Create: `src/features/servicos/servicosSelectors.ts`
- Test: `src/features/servicos/servicosSelectors.test.ts`

**Interfaces:**
- Consumes: `firstParagraph`, `paragraphs` from `../../content/selectors`; `Block`, `SiteContent` from `../../content/types`; `ServiceCardData` from `../../components/sections/ServicesSection`.
- Produces:
  - `selectServicesGrid(content: SiteContent): { heading: string; intro?: string; services: ServiceCardData[] }`
  - `selectHippussuit(content: SiteContent): { title: string; paragraphs: string[]; highlights: string[]; image: { src: string; alt: string } }`

- [ ] **Step 1: Write the failing test**

Create `src/features/servicos/servicosSelectors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import { selectHippussuit, selectServicesGrid } from './servicosSelectors'

const content = {
  pages: {
    servicos: {
      slug: 'servicos',
      title: 'Serviços',
      body: [{ type: 'paragraph', text: 'Equipe multidisciplinar.' }],
      sections: [
        {
          slug: 'equoterapia',
          title: 'Equoterapia',
          order: 1,
          body: [{ type: 'paragraph', text: 'Método terapêutico.' }],
        },
        {
          slug: 'hidroterapia',
          title: 'Hidroterapia',
          order: 6,
          body: [{ type: 'paragraph', text: 'Terapia aquática.' }],
        },
        {
          slug: 'hippussuit',
          title: 'Hippussuit',
          order: 9,
          body: [
            { type: 'image', src: 'placeholder.jpg', alt: '' },
            { type: 'paragraph', text: 'Intro do HippusSuit.' },
            { type: 'paragraph', text: 'Segundo parágrafo.' },
            { type: 'list', items: ['A', 'B', 'C', 'D', 'E'] },
            { type: 'list', items: ['Comportamental 1'] },
          ],
        },
      ],
    },
  },
} as unknown as SiteContent

describe('selectServicesGrid', () => {
  it('excludes hippussuit, sorts by order, and builds card links', () => {
    const grid = selectServicesGrid(content)
    expect(grid.heading).toBe('Nossos Serviços')
    expect(grid.intro).toBe('Equipe multidisciplinar.')
    expect(grid.services.map((s) => s.slug)).toEqual([
      'equoterapia',
      'hidroterapia',
    ])
    expect(grid.services[0]).toMatchObject({
      title: 'Equoterapia',
      excerpt: 'Método terapêutico.',
      to: '/servicos/equoterapia',
    })
  })
})

describe('selectHippussuit', () => {
  it('returns the intro paragraph, first-list highlights, and image override', () => {
    const h = selectHippussuit(content)
    expect(h.title).toBe('Hippussuit')
    expect(h.paragraphs).toEqual(['Intro do HippusSuit.'])
    expect(h.highlights).toEqual(['A', 'B', 'C', 'D'])
    expect(h.image).toEqual({
      src: '/images/hippussuit.jpg',
      alt: 'Hippussuit',
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- run src/features/servicos/servicosSelectors.test.ts`
Expected: FAIL — cannot find module `./servicosSelectors`.

- [ ] **Step 3: Implement the selectors**

Create `src/features/servicos/servicosSelectors.ts`:

```ts
import type { Block, SiteContent } from '../../content/types'
import type { ServiceCardData } from '../../components/sections/ServicesSection'
import { firstParagraph, paragraphs } from '../../content/selectors'

interface ServiceSection {
  slug: string
  title: string
  order?: number
  body: Block[]
}

interface ServicosPageContent {
  title: string
  body?: Block[]
  sections?: ServiceSection[]
}

const byOrder = (a: ServiceSection, b: ServiceSection) =>
  (a.order ?? 0) - (b.order ?? 0)

export function selectServicesGrid(content: SiteContent): {
  heading: string
  intro?: string
  services: ServiceCardData[]
} {
  const page = content.pages.servicos as unknown as ServicosPageContent
  const sections = (page.sections ?? [])
    .filter((s) => s.slug !== 'hippussuit')
    .sort(byOrder)
  return {
    heading: 'Nossos Serviços',
    intro: page.body ? firstParagraph(page.body) : undefined,
    services: sections.map((s) => ({
      slug: s.slug,
      title: s.title,
      excerpt: firstParagraph(s.body),
      to: `/servicos/${s.slug}`,
    })),
  }
}

export function selectHippussuit(content: SiteContent): {
  title: string
  paragraphs: string[]
  highlights: string[]
  image: { src: string; alt: string }
} {
  const page = content.pages.servicos as unknown as ServicosPageContent
  const section = (page.sections ?? []).find((s) => s.slug === 'hippussuit')
  const body = section?.body ?? []
  const list = body.find(
    (b): b is Extract<Block, { type: 'list' }> => b.type === 'list',
  )
  const title = section?.title ?? 'Hippussuit'
  return {
    title,
    paragraphs: paragraphs(body).slice(0, 1),
    highlights: (list?.items ?? []).slice(0, 4),
    image: { src: '/images/hippussuit.jpg', alt: title },
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- run src/features/servicos/servicosSelectors.test.ts`
Expected: PASS (both describes).

- [ ] **Step 5: Commit**

```bash
git add src/features/servicos/servicosSelectors.ts src/features/servicos/servicosSelectors.test.ts
git commit -m "feat(servicos): add grid and hippussuit selectors"
```

---

### Task 3: `FeatureSpotlight` section

**Files:**
- Create: `src/components/sections/FeatureSpotlight.tsx`
- Test: `src/components/sections/FeatureSpotlight.test.tsx`

**Interfaces:**
- Consumes: `Container`, `Section` from `../ui/*`; `CheckCircleIcon` from `../ui/icons` (Task 1).
- Produces: `FeatureSpotlight` with props `{ title: string; paragraphs: string[]; highlights: string[]; image: { src: string; alt: string }; tone?: 'surface' | 'muted' }`.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/FeatureSpotlight.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeatureSpotlight } from './FeatureSpotlight'

describe('FeatureSpotlight', () => {
  it('renders title, paragraphs, image, and one item per highlight', () => {
    render(
      <FeatureSpotlight
        title="Hippussuit"
        paragraphs={['Vestimenta dinâmica.']}
        highlights={['Favorece a postura', 'Melhora o equilíbrio']}
        image={{ src: '/images/hippussuit.jpg', alt: 'Hippussuit' }}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Hippussuit' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Vestimenta dinâmica.')).toBeInTheDocument()
    const img = screen.getByRole('img', { name: 'Hippussuit' })
    expect(img).toHaveAttribute('src', '/images/hippussuit.jpg')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Favorece a postura')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- run src/components/sections/FeatureSpotlight.test.tsx`
Expected: FAIL — cannot find module `./FeatureSpotlight`.

- [ ] **Step 3: Implement `FeatureSpotlight`**

Create `src/components/sections/FeatureSpotlight.tsx`:

```tsx
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { CheckCircleIcon } from '../ui/icons'

interface FeatureSpotlightProps {
  title: string
  paragraphs: string[]
  highlights: string[]
  image: { src: string; alt: string }
  tone?: 'surface' | 'muted'
}

export function FeatureSpotlight({
  title,
  paragraphs,
  highlights,
  image,
  tone = 'surface',
}: FeatureSpotlightProps) {
  return (
    <Section tone={tone}>
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl shadow-level1">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-headline-md text-secondary">
              {title}
            </h2>
            {paragraphs.map((text) => (
              <p
                key={text}
                className="font-sans text-body-md text-on-surface-variant"
              >
                {text}
              </p>
            ))}
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-cta" />
                  <span className="font-sans text-body-md text-on-surface">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- run src/components/sections/FeatureSpotlight.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/FeatureSpotlight.tsx src/components/sections/FeatureSpotlight.test.tsx
git commit -m "feat(sections): add FeatureSpotlight image+checklist band"
```

---

### Task 4: `ContactButton` (extract from Header)

**Files:**
- Create: `src/components/ui/ContactButton.tsx`
- Test: `src/components/ui/ContactButton.test.tsx`
- Modify: `src/components/Header.tsx` (use `ContactButton`, drop now-unused imports)

**Interfaces:**
- Consumes: `Button` from `./Button`, `ChatIcon` from `./icons`, `cn` from `../../lib/cn`.
- Produces: `ContactButton` with props `{ className?: string }` — renders a pill `Link` to `/contato` labelled "Entre em contato" with a leading `ChatIcon`.

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/ContactButton.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { ContactButton } from './ContactButton'

describe('ContactButton', () => {
  it('links to /contato with the contact label', () => {
    renderWithRouter(<ContactButton />)
    const link = screen.getByRole('link', { name: /Entre em contato/ })
    expect(link).toHaveAttribute('href', '/contato')
  })

  it('forwards className', () => {
    renderWithRouter(<ContactButton className="hidden md:inline-flex" />)
    const link = screen.getByRole('link', { name: /Entre em contato/ })
    expect(link.getAttribute('class')).toContain('hidden')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- run src/components/ui/ContactButton.test.tsx`
Expected: FAIL — cannot find module `./ContactButton`.

- [ ] **Step 3: Implement `ContactButton`**

Create `src/components/ui/ContactButton.tsx`:

```tsx
import { cn } from '../../lib/cn'
import { Button } from './Button'
import { ChatIcon } from './icons'

export function ContactButton({ className }: { className?: string }) {
  return (
    <Button to="/contato" pill className={cn('items-center gap-1', className)}>
      <ChatIcon className="h-4 w-4" /> Entre em contato
    </Button>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- run src/components/ui/ContactButton.test.tsx`
Expected: PASS.

- [ ] **Step 5: Use `ContactButton` in `Header`**

Replace the contents of `src/components/Header.tsx` with:

```tsx
import { Link } from 'react-router'
import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { Nav } from './Nav'
import { ContactButton } from './ui/ContactButton'

export function Header({
  site,
  navigation,
}: {
  site: Site
  navigation: NavItem[]
}) {
  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur"
    >
      <Container className="flex items-center justify-between gap-6 py-4">
        <Link to="/" aria-label={site.name} className="flex items-center">
          <img
            src={site.logo}
            alt={site.name}
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-6">
          <Nav items={navigation} />
          <ContactButton className="hidden md:inline-flex" />
        </div>
      </Container>
    </header>
  )
}
```

- [ ] **Step 6: Run the header/button tests and lint to confirm nothing regressed**

Run: `pnpm test -- run src/components/Header.test.tsx src/components/ui/ContactButton.test.tsx`
Expected: PASS (or "no tests found" for Header if none exist — that is fine).
Run: `pnpm lint`
Expected: no errors (confirms no unused `Button`/`ChatIcon` imports remain in `Header.tsx`).

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/ContactButton.tsx src/components/ui/ContactButton.test.tsx src/components/Header.tsx
git commit -m "refactor(ui): extract ContactButton and reuse in Header"
```

---

### Task 5: `ContactCta` band

**Files:**
- Create: `src/components/sections/ContactCta.tsx`
- Test: `src/components/sections/ContactCta.test.tsx`

**Interfaces:**
- Consumes: `Container`, `Section` from `../ui/*`; `ContactButton` from `../ui/ContactButton` (Task 4).
- Produces: `ContactCta` with props `{ heading: string; body?: string; tone?: 'surface' | 'muted' }`.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/ContactCta.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { ContactCta } from './ContactCta'

describe('ContactCta', () => {
  it('renders the heading, body and a contact link', () => {
    renderWithRouter(
      <ContactCta heading="Agende uma Avaliação" body="Venha nos conhecer." />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Agende uma Avaliação' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Venha nos conhecer.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Entre em contato/ }),
    ).toHaveAttribute('href', '/contato')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- run src/components/sections/ContactCta.test.tsx`
Expected: FAIL — cannot find module `./ContactCta`.

- [ ] **Step 3: Implement `ContactCta`**

Create `src/components/sections/ContactCta.tsx`:

```tsx
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { ContactButton } from '../ui/ContactButton'

interface ContactCtaProps {
  heading: string
  body?: string
  tone?: 'surface' | 'muted'
}

export function ContactCta({ heading, body, tone = 'surface' }: ContactCtaProps) {
  return (
    <Section tone={tone}>
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-display text-headline-md text-secondary">
          {heading}
        </h2>
        {body ? (
          <p className="max-w-2xl font-sans text-body-lg text-on-surface-variant">
            {body}
          </p>
        ) : null}
        <ContactButton />
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- run src/components/sections/ContactCta.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ContactCta.tsx src/components/sections/ContactCta.test.tsx
git commit -m "feat(sections): add ContactCta band"
```

---

### Task 6: Remove Serviços submenu from navigation

**Files:**
- Modify: `src/content/content.json` (delete the `submenu` from the `servicos` navigation entry, lines ~27–73)
- Test: `src/content/navigation.test.ts`

**Interfaces:**
- Consumes: `content.json` directly (test fixture — allowed in test files).
- Produces: no code exports. Effect: `Nav` renders "Serviços" as a plain `Link` (no dropdown) because the item has no `submenu`; Momentos keeps its dropdown; Footer is unchanged.

- [ ] **Step 1: Write the failing test**

Create `src/content/navigation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import content from './content.json'

describe('navigation content', () => {
  it('exposes serviços as a top-level link with no submenu', () => {
    const servicos = content.navigation.find((n) => n.slug === 'servicos')
    expect(servicos).toBeDefined()
    expect(servicos).not.toHaveProperty('submenu')
  })

  it('keeps the momentos submenu', () => {
    const momentos = content.navigation.find((n) => n.slug === 'momentos')
    expect(momentos).toHaveProperty('submenu')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- run src/content/navigation.test.ts`
Expected: FAIL — the first assertion fails because `servicos` still has a `submenu`.

- [ ] **Step 3: Delete the Serviços submenu**

In `src/content/content.json`, replace the entire `servicos` navigation object (the one under `"navigation"`, starting at the `"slug": "servicos"` around line 27) — including its whole `submenu` array — with:

```json
    {
      "slug": "servicos",
      "label": "Serviços",
      "order": 2
    },
```

Concretely, remove the `,` after `"order": 2` and the whole `"submenu": [ ... ]` block that follows it, so the object closes right after `"order": 2`. Do **not** touch the `momentos` entry.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- run src/content/navigation.test.ts`
Expected: PASS (both assertions).

- [ ] **Step 5: Verify JSON is still valid and existing tests pass**

Run: `pnpm test -- run src/`
Expected: PASS across the suite (confirms the JSON parses and no consumer broke).

- [ ] **Step 6: Commit**

```bash
git add src/content/content.json src/content/navigation.test.ts
git commit -m "feat(nav): make Serviços a plain link (drop submenu)"
```

---

### Task 7: `ServicosPage` container + route

**Files:**
- Create: `src/features/servicos/ServicosPage.tsx`
- Modify: `src/routes.tsx` (import + add route)

**Interfaces:**
- Consumes: `useOutletContext` from `react-router`; `SiteContent` from `../../content/types`; `selectServicesGrid`, `selectHippussuit` from `./servicosSelectors` (Task 2); `ServicesSection` (existing), `FeatureSpotlight` (Task 3), `ContactCta` (Task 5).
- Produces: `ServicosPage` component; route `/servicos` → `ServicosPage`.

- [ ] **Step 1: Add the container and route (verified by the E2E in Task 8)**

Create `src/features/servicos/ServicosPage.tsx`:

```tsx
import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { ServicesSection } from '../../components/sections/ServicesSection'
import { FeatureSpotlight } from '../../components/sections/FeatureSpotlight'
import { ContactCta } from '../../components/sections/ContactCta'
import { selectHippussuit, selectServicesGrid } from './servicosSelectors'

export function ServicosPage() {
  const content = useOutletContext<SiteContent>()
  const grid = selectServicesGrid(content)
  const hippussuit = selectHippussuit(content)

  return (
    <>
      <ServicesSection
        tone="surface"
        heading={grid.heading}
        intro={grid.intro}
        services={grid.services}
      />
      <FeatureSpotlight
        tone="muted"
        title={hippussuit.title}
        paragraphs={hippussuit.paragraphs}
        highlights={hippussuit.highlights}
        image={hippussuit.image}
      />
      <ContactCta
        tone="surface"
        heading="Agende uma Avaliação"
        body="Venha conhecer nosso espaço e nossos profissionais. Estamos prontos para oferecer o melhor atendimento para você e sua família."
      />
    </>
  )
}
```

- [ ] **Step 2: Register the route**

In `src/routes.tsx`, add the import alongside the other feature pages:

```tsx
import { ServicosPage } from './features/servicos/ServicosPage'
```

And add the route as a child of `SiteLayout`, after the `historia` entry:

```tsx
      { path: 'historia', Component: HistoriaPage },
      { path: 'servicos', Component: ServicosPage },
```

- [ ] **Step 3: Type-check and build**

Run: `pnpm build`
Expected: type-check + build succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/servicos/ServicosPage.tsx src/routes.tsx
git commit -m "feat(servicos): add ServicosPage container and /servicos route"
```

---

### Task 8: E2E smoke test

**Files:**
- Create: `tests/e2e/servicos.spec.ts` (mirrors `tests/e2e/historia.spec.ts`)

**Interfaces:**
- Consumes: the running app at `/servicos` and the header nav (Task 6 + Task 7).
- Produces: Playwright coverage of the page and header navigation.

- [ ] **Step 1: Write the E2E spec**

Create `tests/e2e/servicos.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('servicos page renders all services, hippussuit and contact CTA', async ({
  page,
}) => {
  await page.goto('/servicos')

  await expect(
    page.getByRole('heading', { level: 2, name: 'Nossos Serviços' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 3, name: 'Equoterapia' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      level: 3,
      name: 'Reabilitação Neurofuncional',
    }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Ver mais/ })).toHaveCount(7)

  await expect(
    page.getByRole('heading', { level: 2, name: 'Hippussuit' }),
  ).toBeVisible()
  await expect(page.getByRole('img', { name: 'Hippussuit' })).toBeVisible()

  await expect(
    page.getByRole('heading', { level: 2, name: 'Agende uma Avaliação' }),
  ).toBeVisible()
})

test('servicos is reachable from the header nav', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Serviços' }).first().click()
  await expect(page).toHaveURL(/\/servicos$/)
  await expect(
    page.getByRole('heading', { level: 2, name: 'Nossos Serviços' }),
  ).toBeVisible()
})
```

- [ ] **Step 2: Run the E2E spec**

Run: `pnpm test:e2e tests/e2e/servicos.spec.ts`
Expected: PASS (both tests). The "Ver mais" count is 7 — every non-Hippussuit service in `content.json`. If content changes the service count later, update this number.

- [ ] **Step 3: Full verification**

Run: `pnpm lint && pnpm test -- run && pnpm build`
Expected: lint clean, all unit tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/servicos.spec.ts
git commit -m "test(e2e): add servicos page smoke test"
```

---

## Self-Review

**Spec coverage:**
- `/servicos` route + container → Task 7. ✓
- Reuse `ServicesSection` for heading + grid of all-but-hippussuit → Task 2 (selector) + Task 7 (wiring). ✓
- `FeatureSpotlight` Hippussuit band with `/images/hippussuit.jpg`, intro, green-check highlights → Tasks 1, 2, 3, 7. ✓
- `ContactCta` band reusing the header contact button → Tasks 4, 5, 7. ✓
- Header "Serviços" a plain link, no hover dropdown; Momentos/Footer untouched → Task 6. ✓
- Tests: selectors, FeatureSpotlight, ContactButton, ContactCta, nav data, E2E → Tasks 2–8. ✓
- No page hero (page starts at "Nossos Serviços") → Task 7 composition (no `PageHero`). ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; the single variable value (card count `7`) is stated with the reason it may change. ✓

**Type consistency:** `selectServicesGrid` / `selectHippussuit` signatures in Task 2 match their use in Task 7. `FeatureSpotlight` props (Task 3) match the Task 7 call. `ContactButton` `{ className?: string }` (Task 4) matches Header (Task 4) and `ContactCta` (Task 5) usage. `CheckCircleIcon` (Task 1) consumed by `FeatureSpotlight` (Task 3). ✓

## Notes / Deviations from spec

- The spec proposed modifying `Nav.test.tsx`. During planning it became clear `Nav.tsx` needs **no** code change (removing the submenu from content data is sufficient), so the existing `Nav` tests stay valid and the regression guard lives in a new content-layer test, `src/content/navigation.test.ts` (Task 6). This is a more accurate placement of the guard.
