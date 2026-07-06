# Service Card Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a distinctive, house-style SVG icon to every service card on the home featured grid and the `/servicos` page, in a green/purple alternating badge.

**Architecture:** Content names an icon via a stable string key on each service section in `content.json`. A `ServiceIcon` dispatcher in the presentational layer maps the key → one of several new inline-SVG components (house style), falling back to a generic icon on unknown/missing keys. The `icon` key flows through the home and serviços selectors into `ServiceCardData`, and `ServiceCard` renders it in a rounded-square badge whose tint alternates green (even index) / purple (odd index).

**Tech Stack:** TypeScript (strict), React 19, Vite, Tailwind v4 (`@theme` tokens in `src/index.css`), Vitest + Testing Library, Playwright.

## Global Constraints

- Package manager is **pnpm**. Run `pnpm test`, `pnpm lint`, `pnpm build`.
- Prettier: **no semicolons, single quotes, trailing commas**.
- Icons follow the house style in `src/components/ui/icons.tsx`: `viewBox="0 0 24 24"`, `stroke="currentColor"`, `strokeWidth="2"`, rounded caps/joins, `aria-hidden="true"`.
- Dependency rule (non-negotiable): files under `features`, `components`, `layouts` never import `content.json` or Firebase. Content provides only the `icon` string; the presentational layer owns the SVG drawing.
- Icon keys (verbatim): `horse-therapy` (equoterapia), `riding-helmet` (equitacao-classica), `horseshoe` (equitacao-ludica), `adapted-riding` (equitacao-adaptada), `paw` (pet-terapia), `swimmer` (hidroterapia), `neuro` (reabilitacao-neurofuncional). The `hippussuit` section gets **no** icon.
- Tint tokens: green badge `bg-primary-container/15` + icon `text-cta`; purple badge `bg-secondary-container/40` + icon `text-secondary`.

---

### Task 1: Service icon components + `ServiceIcon` dispatcher

**Files:**
- Modify: `src/components/ui/icons.tsx` (append new components + dispatcher; do not change existing icons)
- Test: `src/components/ui/icons.test.tsx`

**Interfaces:**
- Consumes: the existing local `Svg` helper and `IconProps` in `icons.tsx`.
- Produces:
  - Named icon components, each `(props: IconProps) => ReactNode`: `HorseTherapyIcon`, `RidingHelmetIcon`, `HorseshoeIcon`, `AdaptedRidingIcon`, `PawIcon`, `SwimmerIcon`, `NeuroIcon`, `ServiceDefaultIcon`. Each renders an `<svg data-icon="<key>" aria-hidden="true">` where `<key>` is its icon key (`ServiceDefaultIcon` uses `default`).
  - `ServiceIcon({ name, className }: { name?: string; className?: string }) => ReactNode` — resolves `name` through a `serviceIcons` record to a component, falling back to `ServiceDefaultIcon` for `undefined`/unknown names.

- [ ] **Step 1: Write the failing test**

Add to `src/components/ui/icons.test.tsx` (keep existing test):

```tsx
import { ServiceIcon } from './icons'

describe('ServiceIcon', () => {
  it('renders the matching icon for a known key', () => {
    const { container } = render(<ServiceIcon name="paw" className="h-6 w-6" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('data-icon', 'paw')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg?.getAttribute('class')).toContain('h-6 w-6')
  })

  it.each([
    ['horse-therapy'],
    ['riding-helmet'],
    ['horseshoe'],
    ['adapted-riding'],
    ['pet-terapia-typo-none'],
  ])('resolves %s (unknown falls back to default)', (name) => {
    const { container } = render(<ServiceIcon name={name} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('falls back to the default icon for an unknown or missing key', () => {
    const { container: unknown } = render(<ServiceIcon name="does-not-exist" />)
    expect(unknown.querySelector('svg')).toHaveAttribute('data-icon', 'default')

    const { container: missing } = render(<ServiceIcon />)
    expect(missing.querySelector('svg')).toHaveAttribute('data-icon', 'default')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/ui/icons.test.tsx`
Expected: FAIL — `ServiceIcon` is not exported from `./icons`.

- [ ] **Step 3: Write minimal implementation**

Append to `src/components/ui/icons.tsx` (after the existing icons). Reuse the existing `Svg` helper, adding a `data-icon` attribute via a thin wrapper so each icon is identifiable. The `Svg` helper already spreads `className`; pass `data-icon` on the returned `<svg>` by wrapping children in a component that sets it:

```tsx
function ServiceSvg({
  className,
  dataIcon,
  children,
}: IconProps & { dataIcon: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-icon={dataIcon}
      className={className}
    >
      {children}
    </svg>
  )
}

export function HorseTherapyIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="horse-therapy">
      <path d="M5 21c-1-4 1-7 4-8l1-3 3-1 2 2 3 1-1 3c1 2 1 4 0 6" />
      <path d="M9 8.5h.01" />
      <path d="M14.5 14c1 1.5 1 3.5-.5 4.5s-3.5.5-4.5-1" />
    </ServiceSvg>
  )
}

export function RidingHelmetIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="riding-helmet">
      <path d="M3 14a9 9 0 0 1 18 0" />
      <path d="M21 14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3" />
      <path d="M12 5v3" />
      <path d="M6 17v2h12v-2" />
    </ServiceSvg>
  )
}

export function HorseshoeIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="horseshoe">
      <path d="M7 21c-2-1-3-4-3-8a8 8 0 0 1 16 0c0 4-1 7-3 8" />
      <path d="M7 21v-2M17 21v-2M8.5 18.5h.01M15.5 18.5h.01" />
    </ServiceSvg>
  )
}

export function AdaptedRidingIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="adapted-riding">
      <path d="M6 20c-1.5-1-2.5-3.5-2.5-6.5A7.5 7.5 0 0 1 16 8" />
      <circle cx="17" cy="7" r="1.5" />
      <path d="M14 11h5l-1.5 4M15.5 15l-1.5 5M18 15l1.5 4" />
    </ServiceSvg>
  )
}

export function PawIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="paw">
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="12" cy="6.5" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <path d="M12 12c-2.6 0-4.5 2-4.5 4 0 1.7 1.4 2.5 4.5 2.5s4.5-.8 4.5-2.5c0-2-1.9-4-4.5-4Z" />
    </ServiceSvg>
  )
}

export function SwimmerIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="swimmer">
      <circle cx="17" cy="7" r="1.6" />
      <path d="m5 12 4-2 3 2 3-1.5" />
      <path d="M2 17c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0 2.3 1 3.5 0" />
      <path d="M2 20.5c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0 2.3 1 3.5 0" />
    </ServiceSvg>
  )
}

export function NeuroIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="neuro">
      <path d="M15 4a5 5 0 0 1 2 9v3a2 2 0 0 1-2 2h-1v2" />
      <path d="M9.5 4A5 5 0 0 0 7 13" />
      <path d="M9.5 4a3 3 0 0 1 5.5 0" />
      <path d="M3 12h2l1.5-2 2 4 1.5-2h2" />
    </ServiceSvg>
  )
}

export function ServiceDefaultIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="default">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="3" />
    </ServiceSvg>
  )
}

const serviceIcons: Record<string, (props: IconProps) => ReactNode> = {
  'horse-therapy': HorseTherapyIcon,
  'riding-helmet': RidingHelmetIcon,
  horseshoe: HorseshoeIcon,
  'adapted-riding': AdaptedRidingIcon,
  paw: PawIcon,
  swimmer: SwimmerIcon,
  neuro: NeuroIcon,
}

export function ServiceIcon({
  name,
  className,
}: {
  name?: string
  className?: string
}) {
  const Icon = (name && serviceIcons[name]) || ServiceDefaultIcon
  return <Icon className={className} />
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/ui/icons.test.tsx`
Expected: PASS (both the original `icons` test and the new `ServiceIcon` tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/icons.tsx src/components/ui/icons.test.tsx
git commit -m "feat: add service icons and ServiceIcon dispatcher"
```

---

### Task 2: Add `icon` keys to content.json

**Files:**
- Modify: `src/content/content.json` (add `"icon"` to the 7 non-hippussuit service sections under `pages.servicos.sections`)

**Interfaces:**
- Consumes: nothing.
- Produces: each service section object (except `hippussuit`) has a top-level `"icon": "<key>"` string, alongside `slug`, `title`, `order`, `body`.

- [ ] **Step 1: Write the failing test**

Create `src/content/serviceIcons.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import content from './content.json'

const expectedIcons: Record<string, string> = {
  equoterapia: 'horse-therapy',
  'equitacao-classica': 'riding-helmet',
  'equitacao-ludica': 'horseshoe',
  'equitacao-adaptada': 'adapted-riding',
  'pet-terapia': 'paw',
  hidroterapia: 'swimmer',
  'reabilitacao-neurofuncional': 'neuro',
}

describe('content.json service icons', () => {
  const sections = (content.pages.servicos as { sections: Array<{ slug: string; icon?: string }> }).sections

  it('assigns the expected icon key to each service', () => {
    for (const [slug, icon] of Object.entries(expectedIcons)) {
      const section = sections.find((s) => s.slug === slug)
      expect(section, `missing section ${slug}`).toBeDefined()
      expect(section?.icon).toBe(icon)
    }
  })

  it('does not add an icon to the hippussuit section', () => {
    const hippussuit = sections.find((s) => s.slug === 'hippussuit')
    expect(hippussuit?.icon).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/content/serviceIcons.test.ts`
Expected: FAIL — `section?.icon` is `undefined` for each slug.

- [ ] **Step 3: Add the icon keys**

In `src/content/content.json`, add an `"icon"` property to each service section object. Add it immediately after the `"order"` line of each section. Example for the first section:

```json
        {
          "slug": "equoterapia",
          "title": "Equoterapia",
          "order": 1,
          "icon": "horse-therapy",
          "body": [
```

Apply the mapping:
- `equoterapia` → `"icon": "horse-therapy"`
- `equitacao-classica` → `"icon": "riding-helmet"`
- `equitacao-ludica` → `"icon": "horseshoe"`
- `equitacao-adaptada` → `"icon": "adapted-riding"`
- `pet-terapia` → `"icon": "paw"`
- `hidroterapia` → `"icon": "swimmer"`
- `reabilitacao-neurofuncional` → `"icon": "neuro"`

Do **not** add `icon` to the `hippussuit` section.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/content/serviceIcons.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/content.json src/content/serviceIcons.test.ts
git commit -m "feat: assign icon keys to service sections in content"
```

---

### Task 3: Thread `icon` through `ServiceCardData` and both selectors

**Files:**
- Modify: `src/components/sections/ServicesSection.tsx:8-13` (add `icon?: string` to `ServiceCardData`)
- Modify: `src/features/servicos/servicosSelectors.ts:6-11,34-39` (add `icon?` to `ServiceSection`, pass `s.icon`)
- Modify: `src/features/home/homeSelectors.ts:12-16,63-68` (add `icon?` to `NamedSection`, pass `s.icon`)
- Test: `src/features/servicos/servicosSelectors.test.ts`, `src/features/home/homeSelectors.test.ts`

**Interfaces:**
- Consumes: `content.json` icon keys from Task 2.
- Produces: `ServiceCardData` now has `icon?: string`; `selectServicesGrid` (serviços) and `selectServices` (home) populate it from the section's `icon`.

- [ ] **Step 1: Write the failing tests**

Add to `src/features/servicos/servicosSelectors.test.ts` (inside the existing describe for `selectServicesGrid`, or a new one):

```ts
it('carries the icon key through to each card', () => {
  const grid = selectServicesGrid(content as unknown as SiteContent)
  const equoterapia = grid.services.find((s) => s.slug === 'equoterapia')
  expect(equoterapia?.icon).toBe('horse-therapy')
})
```

Add to `src/features/home/homeSelectors.test.ts` (near the existing `selectServices` test):

```ts
it('carries the icon key through to each featured card', () => {
  const { services } = selectServices(content as unknown as SiteContent)
  for (const card of services) {
    expect(typeof card.icon === 'string' || card.icon === undefined).toBe(true)
  }
  const withIcon = services.find((s) => s.icon)
  expect(withIcon?.icon).toBeTruthy()
})
```

> If either test file does not already import `content` / `SiteContent`, add:
> `import content from '../../content/content.json'` and
> `import type { SiteContent } from '../../content/types'`, and confirm
> `selectServicesGrid` / `selectServices` are imported. Match the imports the
> file's existing tests already use.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/features/servicos/servicosSelectors.test.ts src/features/home/homeSelectors.test.ts`
Expected: FAIL — `card.icon` is `undefined` (property not populated / not on type).

- [ ] **Step 3: Implement the changes**

In `src/components/sections/ServicesSection.tsx`, extend `ServiceCardData`:

```tsx
export interface ServiceCardData {
  slug: string
  title: string
  excerpt: string
  to: string
  icon?: string
}
```

In `src/features/servicos/servicosSelectors.ts`, add `icon?` to `ServiceSection` and pass it:

```ts
interface ServiceSection {
  slug: string
  title: string
  order?: number
  icon?: string
  body: Block[]
}
```

```ts
    services: sections.map((s) => ({
      slug: s.slug,
      title: s.title,
      excerpt: firstParagraph(s.body),
      to: `/servicos/${s.slug}`,
      icon: s.icon,
    })),
```

In `src/features/home/homeSelectors.ts`, add `icon?` to `NamedSection` and pass it:

```ts
interface NamedSection {
  slug: string
  title: string
  icon?: string
  body: Block[]
}
```

```ts
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      excerpt: firstParagraph(s.body),
      to: `/servicos/${s.slug}`,
      icon: s.icon,
    }))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- src/features/servicos/servicosSelectors.test.ts src/features/home/homeSelectors.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ServicesSection.tsx src/features/servicos/servicosSelectors.ts src/features/home/homeSelectors.ts src/features/servicos/servicosSelectors.test.ts src/features/home/homeSelectors.test.ts
git commit -m "feat: thread service icon key through selectors"
```

---

### Task 4: Render the alternating icon badge in `ServiceCard`

**Files:**
- Modify: `src/components/sections/ServicesSection.tsx` (`ServiceCard` + the `.map` call)
- Test: `src/components/sections/ServicesSection.test.tsx`

**Interfaces:**
- Consumes: `ServiceIcon` from `../ui/icons` (Task 1); `ServiceCardData.icon` (Task 3).
- Produces: `ServiceCard` renders a badge `<div data-icon-tone="green|purple">` containing `<ServiceIcon name={icon} />` above the title. Tone alternates by the card's zero-based grid index: even → `green`, odd → `purple`.

- [ ] **Step 1: Write the failing test**

Add to `src/components/sections/ServicesSection.test.tsx`:

```tsx
it('renders an icon badge per card, alternating green/purple by position', () => {
  mockOverflow(false)
  const withIcons = [
    { ...services[0], icon: 'horse-therapy' },
    { ...services[1], icon: 'horseshoe' },
  ]
  const { container } = renderWithRouter(
    <ServicesSection heading="Nossos Serviços" services={withIcons} />,
  )
  const badges = container.querySelectorAll('[data-icon-tone]')
  expect(badges).toHaveLength(2)
  expect(badges[0]).toHaveAttribute('data-icon-tone', 'green')
  expect(badges[1]).toHaveAttribute('data-icon-tone', 'purple')
  expect(container.querySelector('[data-icon="horse-therapy"]')).not.toBeNull()
  expect(container.querySelector('[data-icon="horseshoe"]')).not.toBeNull()
})
```

> `renderWithRouter` must return `container`. If the existing helper does not,
> use `screen` + `document.querySelectorAll` instead, or assert via
> `container` from the helper's return. Check `src/test/render.tsx` and match
> its return shape; the other tests in this file already destructure its result.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/sections/ServicesSection.test.tsx`
Expected: FAIL — no `[data-icon-tone]` elements found.

- [ ] **Step 3: Implement the badge**

Update `ServiceCard` in `src/components/sections/ServicesSection.tsx` to accept `icon` and `index`, and render the badge. Import `ServiceIcon` alongside the existing icon import:

```tsx
import { ArrowForwardIcon, ServiceIcon } from '../ui/icons'
```

```tsx
function ServiceCard({
  title,
  excerpt,
  icon,
  index,
}: Pick<ServiceCardData, 'title' | 'excerpt' | 'icon'> & { index: number }) {
  const excerptRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const el = excerptRef.current
    if (!el) return
    setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [excerpt])

  const tone = index % 2 === 0 ? 'green' : 'purple'

  return (
    <article className="flex h-full flex-col rounded-xl border border-outline-variant/30 bg-surface p-6 transition-shadow hover:shadow-level2">
      <div
        data-icon-tone={tone}
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-xl',
          tone === 'green'
            ? 'bg-primary-container/15 text-cta'
            : 'bg-secondary-container/40 text-secondary',
        )}
      >
        <ServiceIcon name={icon} className="h-6 w-6" />
      </div>
      <h3 className="mb-3 font-display text-headline-sm text-on-surface">
        {title}
      </h3>
      <p
        ref={excerptRef}
        className={cn(
          'mb-6 flex-grow font-sans text-body-md text-on-surface-variant text-justify',
          expanded ? undefined : 'line-clamp-10',
        )}
      >
        {excerpt}
      </p>
      {overflowing && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-auto inline-flex items-center gap-1 rounded-sm text-label-md text-link transition-colors hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        >
          Ver mais <ArrowForwardIcon className="h-4 w-4" />
        </button>
      ) : null}
    </article>
  )
}
```

Update the `.map` in `ServicesSection` to pass `icon` and `index`:

```tsx
          {services.map((service, index) => (
            <ServiceCard
              key={service.slug}
              title={service.title}
              excerpt={service.excerpt}
              icon={service.icon}
              index={index}
            />
          ))}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- src/components/sections/ServicesSection.test.tsx`
Expected: PASS (new badge test + all existing ServicesSection tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ServicesSection.tsx src/components/sections/ServicesSection.test.tsx
git commit -m "feat: render alternating icon badge on service cards"
```

---

### Task 5: End-to-end check + full verification

**Files:**
- Modify: `tests/e2e/servicos.spec.ts` (add icon assertion)

**Interfaces:**
- Consumes: the rendered `/servicos` page from all prior tasks.
- Produces: an e2e assertion that every service card shows an icon badge.

- [ ] **Step 1: Write the failing assertion**

Append inside the existing test in `tests/e2e/servicos.spec.ts`, after the `Equoterapia` heading assertion:

```ts
  // Every service card shows an icon badge
  const iconBadges = page.locator('article [data-icon-tone]')
  await expect(iconBadges.first()).toBeVisible()
  expect(await iconBadges.count()).toBeGreaterThanOrEqual(7)
  await expect(
    page.locator('article [data-icon="horse-therapy"]'),
  ).toBeVisible()
```

- [ ] **Step 2: Run the e2e test to verify current state**

Run: `pnpm test:e2e -- servicos`
Expected: PASS if Tasks 1–4 are complete (badges render). If run before implementation, it FAILs on the missing `[data-icon-tone]` locator. (This task runs after Tasks 1–4, so PASS is expected.)

- [ ] **Step 3: Run the full verification suite**

Run each and confirm success:

```bash
pnpm lint
pnpm test
pnpm build
```

Expected: lint clean, all unit tests pass, type-check + build succeed.

- [ ] **Step 4: Visual verification**

Start the dev server (`pnpm dev`) and, using the Playwright MCP server, screenshot `/servicos` and `/estilo`. Confirm:
- Each service card shows its intended icon, legible at 24px in a 48px badge.
- Badges alternate green / purple down the grid and the rhythm looks balanced.
- If any icon path reads poorly, adjust that icon component's `<path>` data in `src/components/ui/icons.tsx` and re-screenshot (re-run Task 1's test after any change).

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/servicos.spec.ts
git commit -m "test: assert service cards render icon badges"
```

---

## Self-Review

**Spec coverage:**
- `icon` field in content.json → Task 2.
- Content-driven mapping / `ServiceIcon` dispatcher / house-style SVGs / fallback → Task 1.
- `icon?` on `ServiceCardData` + both selectors → Task 3.
- Badge above title, alternating green/purple by index → Task 4.
- Home featured grid + `/servicos` both covered → Tasks 3 (both selectors) and 5.
- Equitação Adaptada = horseshoe + accessibility (`adapted-riding`) → Tasks 1 & 2.
- Vitest coverage (icon render/aria, dispatcher fallback, card tone, selectors) → Tasks 1, 3, 4.
- Playwright coverage → Task 5.
- Visual verification via screenshots of `/servicos` and `/estilo` → Task 5.
- Hippussuit untouched → Task 2 asserts no icon; no HippussuitSection changes anywhere.

**Type consistency:** `icon?: string` used identically on `ServiceCardData`, `ServiceSection` (serviços), `NamedSection` (home). `ServiceIcon({ name, className })` signature matches all call sites (Task 4 passes `name={icon}`). `data-icon` (icon identity) and `data-icon-tone` (badge tone) are distinct attributes used consistently across component and tests.

**Placeholder scan:** No TBD/TODO; every code step shows complete code; test steps include real assertions. The only deliberately deferred detail is SVG path fine-tuning, which is an explicit visual-verification step (Task 5, Step 4) with a concrete adjust-and-re-screenshot loop, not a placeholder.
