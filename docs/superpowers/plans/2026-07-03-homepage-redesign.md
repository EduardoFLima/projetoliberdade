# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Stitch "Projeto Liberdade - Homepage Redesign" screen as reusable, prop-driven section components composed from canonical `content.json`.

**Architecture:** `SiteLayout` loads content once and passes it via the router `Outlet` context. A new `HomePage` container reads that context, derives per-section props with pure selectors, and composes presentational section components (`Hero`, `HistoriaSection`, `MissionVisionValues`, `ServicesSection`). Sections take props only and are reusable on the future dedicated pages. Header/Footer are restyled to the mockup.

**Tech Stack:** TypeScript 6 (strict), React 19, React Router v8 (`react-router`), Tailwind CSS v4 (`@theme` tokens in `src/index.css`), Vitest + Testing Library, Playwright.

## Global Constraints

- **Imports:** React Router imports come from `'react-router'` (not `react-router-dom`).
- **Formatting:** No semicolons, single quotes, trailing commas (Prettier config). Run `pnpm format` if unsure.
- **Dependency rule:** `components`, `layouts`, `features` never import `content.json` or Firebase. Containers (`SiteLayout`, `HomePage`) obtain content via `useContent`/`Outlet` context; presentational components receive content via props only.
- **Copy:** Canonical Portuguese `content.json` values are authoritative. Nav/footer use real PT labels. Do not use the mockup's English labels or its placeholder Visão/Valores text.
- **Icons:** Inline SVG components only (the `SocialLinks.tsx` convention). No Material Symbols, no CDN, no new font dependency.
- **Design tokens (only these exist in `src/index.css`):**
  - Colors as `bg-*`/`text-*`/`border-*`: `surface`, `surface-container`, `surface-container-low`, `surface-container-lowest`, `on-surface`, `on-surface-variant`, `outline-variant`, `primary`, `on-primary`, `primary-container`, `secondary`, `on-secondary`, `inverse-surface`, `inverse-on-surface`, plus brand `cta`, `cta-hover`, `cta-strong`, `on-cta`, `link`.
  - Text: `text-display-lg` (responsive clamp), `text-headline-md`, `text-headline-sm`, `text-body-lg`, `text-body-md`, `text-label-md`, `text-label-sm`, `text-button` (19px/700).
  - Fonts: `font-display` (headings), `font-sans` (body).
  - Radius: `rounded-sm/md/lg/xl` and built-in `rounded-full`. Shadows: `shadow-level1`, `shadow-level2`. Max width: `max-w-site`.
  - **Spacing:** use the standard Tailwind numeric scale (`p-6`, `py-12`, `gap-6`, `md:py-20`, …) as existing components do. The mockup's `px-margin-desktop`/`gap-gutter`/`py-xl` token names do **not** exist — never use them.
- **CTA accessibility:** white-on-`#00aa5a` only passes AA at `text-button` size (large). Compact/label-size green buttons use `cta-strong` (#006d38). Follow this when styling pills.

---

### Task 1: Add `pill` (rounded-full) support to Button

Hero and Header CTAs are rounded-full pills. Add a `pill` prop so a single radius class is emitted (avoids conflicting `rounded-*` utilities).

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Test: `src/components/ui/Button.test.tsx`

**Interfaces:**
- Produces: `Button` gains optional `pill?: boolean` (default `false`). When true, renders `rounded-full` instead of `rounded-md`.

- [ ] **Step 1: Add the failing test**

Append inside the existing `describe('Button', …)` block in `src/components/ui/Button.test.tsx`:

```tsx
  it('renders a rounded-full pill when pill is set', () => {
    render(<Button pill>Contato</Button>)
    const btn = screen.getByRole('button', { name: 'Contato' })
    expect(btn.className).toContain('rounded-full')
    expect(btn.className).not.toContain('rounded-md')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/ui/Button.test.tsx`
Expected: FAIL — the new assertion fails because `rounded-md` is always present.

- [ ] **Step 3: Implement `pill`**

Replace the full contents of `src/components/ui/Button.tsx` with:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  variant?: 'primary' | 'secondary'
  compact?: boolean
  pill?: boolean
  to?: string
  className?: string
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta'

function variantClasses(
  variant: 'primary' | 'secondary',
  compact: boolean,
): string {
  if (variant === 'secondary')
    return 'border border-secondary text-secondary text-label-md px-6 py-3 hover:bg-secondary/10'
  if (compact) return 'bg-cta-strong text-on-cta text-label-md px-4 py-2'
  return 'bg-cta text-on-cta text-button px-6 py-3 hover:bg-cta-hover'
}

export function Button({
  variant = 'primary',
  compact = false,
  pill = false,
  to,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(
    base,
    pill ? 'rounded-full' : 'rounded-md',
    variantClasses(variant, compact),
    className,
  )
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- src/components/ui/Button.test.tsx`
Expected: PASS (all Button tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.tsx src/components/ui/Button.test.tsx
git commit -m "feat: add pill (rounded-full) option to Button"
```

---

### Task 2: Inline SVG icon components

**Files:**
- Create: `src/components/ui/icons.tsx`
- Test: `src/components/ui/icons.test.tsx`

**Interfaces:**
- Produces: `FlagIcon`, `VisibilityIcon`, `FavoriteIcon`, `ArrowForwardIcon`, `ChatIcon`, `MenuIcon` — each `(props: { className?: string }) => JSX.Element`, rendering an `aria-hidden` `<svg>` using `currentColor`, size controlled by `className`.

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/icons.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import {
  ArrowForwardIcon,
  ChatIcon,
  FavoriteIcon,
  FlagIcon,
  MenuIcon,
  VisibilityIcon,
} from './icons'

describe('icons', () => {
  it('render aria-hidden svgs and forward className', () => {
    const icons = [
      FlagIcon,
      VisibilityIcon,
      FavoriteIcon,
      ArrowForwardIcon,
      ChatIcon,
      MenuIcon,
    ]
    for (const Icon of icons) {
      const { container, unmount } = render(<Icon className="h-4 w-4" />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg?.getAttribute('class')).toContain('h-4 w-4')
      unmount()
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/ui/icons.test.tsx`
Expected: FAIL — module `./icons` does not exist.

- [ ] **Step 3: Implement the icons**

Create `src/components/ui/icons.tsx`:

```tsx
interface IconProps {
  className?: string
}

function Svg({
  className,
  children,
  fill = 'none',
}: IconProps & { children: React.ReactNode; fill?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

export function FlagIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 22V4" />
      <path d="M4 4h13l-2 4 2 4H4" />
    </Svg>
  )
}

export function VisibilityIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function FavoriteIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 21s-7-4.6-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9Z" />
    </Svg>
  )
}

export function ArrowForwardIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  )
}

export function ChatIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12Z" />
    </Svg>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Svg>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/ui/icons.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/icons.tsx src/components/ui/icons.test.tsx
git commit -m "feat: add inline SVG icon components"
```

---

### Task 3: SectionHeading component

Shared centered heading (title + green underline accent + optional intro), used by História, MVV, and Serviços.

**Files:**
- Create: `src/components/sections/SectionHeading.tsx`
- Test: `src/components/sections/SectionHeading.test.tsx`

**Interfaces:**
- Produces: `SectionHeading(props: { title: string; intro?: string; className?: string })` — renders an `<h2>` with `title` and, when `intro` is given, a following `<p>`.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/SectionHeading.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionHeading } from './SectionHeading'

describe('SectionHeading', () => {
  it('renders the title as a level-2 heading', () => {
    render(<SectionHeading title="História" />)
    expect(
      screen.getByRole('heading', { level: 2, name: 'História' }),
    ).toBeInTheDocument()
  })

  it('renders an intro paragraph when provided', () => {
    render(<SectionHeading title="Nossos Serviços" intro="Equipe multi." />)
    expect(screen.getByText('Equipe multi.')).toBeInTheDocument()
  })

  it('omits the intro when not provided', () => {
    const { container } = render(<SectionHeading title="História" />)
    expect(container.querySelector('p')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/sections/SectionHeading.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement SectionHeading**

Create `src/components/sections/SectionHeading.tsx`:

```tsx
import { cn } from '../../lib/cn'

interface SectionHeadingProps {
  title: string
  intro?: string
  className?: string
}

export function SectionHeading({ title, intro, className }: SectionHeadingProps) {
  return (
    <div className={cn('mx-auto mb-12 max-w-2xl text-center', className)}>
      <h2 className="mb-3 font-display text-headline-md text-secondary">
        {title}
      </h2>
      <div className="mx-auto h-1 w-16 rounded-full bg-primary" />
      {intro ? (
        <p className="mt-6 font-sans text-body-md text-on-surface-variant">
          {intro}
        </p>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/sections/SectionHeading.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/SectionHeading.tsx src/components/sections/SectionHeading.test.tsx
git commit -m "feat: add SectionHeading component"
```

---

### Task 4: Content model + image migration

Migrate the two images the home needs (plus the logo), and reshape `pages.home` (single hero + featured services). Add the `HeroContent`/`HomeContent` types.

**Files:**
- Create: `public/images/hero.jpg`, `public/images/historia.jpg`, `public/images/logo.png` (copied from `docs/resources/`)
- Modify: `src/content/content.json`
- Modify: `src/content/types.ts`
- Test: `src/content/JsonContentRepository.test.ts`

**Interfaces:**
- Produces (types): `HeroContent { image: string; alt: string; title: string; subtitle: string }`; `HomeContent extends Page { hero: HeroContent; featuredServices: string[] }`.
- Produces (data): `pages.home.hero`, `pages.home.featuredServices` (`['equoterapia','equitacao-ludica','equitacao-adaptada']`); `pages.historia.body[0].src` → `/images/historia.jpg`; `site.logo` → `/images/logo.png`.

- [ ] **Step 1: Migrate the image assets**

`public/images/hero.jpg` is already present — it was downloaded from the Stitch
mockup's hero background (the child on a therapy horse) per the user's
instruction to reuse the mockup image. Do **not** overwrite it. Copy only the
remaining two assets:

```bash
mkdir -p public/images
cp docs/resources/fotos/historia/FB_IMG_1526587620052.jpg public/images/historia.jpg
cp docs/resources/logo.png public/images/logo.png
ls public/images
```
Expected: `hero.jpg  historia.jpg  logo.png` (hero.jpg is the mockup image, ~512×512 PNG saved as `.jpg`; fills fine with `bg-cover` and is easy to swap for a higher-res photo later).

- [ ] **Step 2: Write the failing test**

Replace the body of the `it(...)` in `src/content/JsonContentRepository.test.ts` with:

```tsx
  it('loads site content from the bundled snapshot', async () => {
    const repo = new JsonContentRepository()
    const content = await repo.getContent()

    expect(content.site.name).toBe('Projeto Liberdade')
    expect(content.site.logo).toBe('/images/logo.png')
    expect(Array.isArray(content.navigation)).toBe(true)
    expect(content.navigation.length).toBeGreaterThan(0)

    const home = content.pages.home
    expect(home.hero).toMatchObject({
      image: '/images/hero.jpg',
      title: 'Reabilitação e Equoterapia',
    })
    expect(home.featuredServices).toEqual([
      'equoterapia',
      'equitacao-ludica',
      'equitacao-adaptada',
    ])
    expect('images' in home.hero).toBe(false)
  })
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test -- src/content/JsonContentRepository.test.ts`
Expected: FAIL — `home.hero` is undefined / still has `images`.

- [ ] **Step 4: Update `content.json`**

In `src/content/content.json`:

4a. Change `site.logo` from `"logo.png"` to `"/images/logo.png"`.

4b. Replace the entire `"home"` page object (currently `slug`, `title`, `hero.images[...]`) with:

```json
    "home": {
      "slug": "home",
      "title": "Home",
      "hero": {
        "image": "/images/hero.jpg",
        "alt": "Criança sorrindo durante a montaria terapêutica, conduzida por um profissional",
        "title": "Reabilitação e Equoterapia",
        "subtitle": "Promovendo qualidade de vida e desenvolvimento biopsicossocial através da relação com o cavalo."
      },
      "featuredServices": ["equoterapia", "equitacao-ludica", "equitacao-adaptada"]
    },
```

4c. In `pages.historia.body`, change the first block's `src` from `"fotos/historia/FB_IMG_1526587620052.jpg"` to `"/images/historia.jpg"` (leave its `alt` as-is).

- [ ] **Step 5: Add the types**

In `src/content/types.ts`, after the `Page` interface, add:

```ts
export interface HeroContent {
  image: string
  alt: string
  title: string
  subtitle: string
}

export interface HomeContent extends Page {
  hero: HeroContent
  featuredServices: string[]
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm test -- src/content/JsonContentRepository.test.ts`
Expected: PASS.

Also run: `pnpm build`
Expected: type-check passes (no TS errors).

- [ ] **Step 7: Commit**

```bash
git add public/images src/content/content.json src/content/types.ts src/content/JsonContentRepository.test.ts
git commit -m "feat: reshape home content for redesign and migrate hero/historia images"
```

---

### Task 5: SiteLayout provides content via Outlet context

Load content once and pass it to the routed page; gate the outlet on non-null content so pages can assume it's present.

**Files:**
- Modify: `src/layouts/SiteLayout.tsx`
- Modify: `src/layouts/SiteLayout.test.tsx`

**Interfaces:**
- Produces: `SiteLayout` renders `<Outlet context={content} />` only when content is loaded. Pages read it with `useOutletContext<SiteContent>()`. `Footer` is now called with `navigation` (added in Task 11 — here we already pass it).

- [ ] **Step 1: Update the failing test**

Replace the child route in `renderLayout()` in `src/layouts/SiteLayout.test.tsx` so it consumes the context, and add an assertion. The full file becomes:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  useOutletContext,
} from 'react-router'
import type { SiteContent } from '../content/types'
import { SiteLayout } from './SiteLayout'

function ContextProbe() {
  const content = useOutletContext<SiteContent>()
  return <p>página de {content.site.name}</p>
}

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ index: true, Component: ContextProbe }],
      },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('SiteLayout', () => {
  it('renders the real header and footer from content', async () => {
    renderLayout()
    await waitFor(() =>
      expect(screen.getByTestId('site-header')).toBeInTheDocument(),
    )
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()

    expect(
      screen.getByRole('navigation', { name: 'Principal' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'História' }).length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument()
  })

  it('passes content to the outlet', async () => {
    renderLayout()
    await waitFor(() =>
      expect(
        screen.getByText('página de Projeto Liberdade'),
      ).toBeInTheDocument(),
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/layouts/SiteLayout.test.tsx`
Expected: FAIL — the outlet does not receive context (`content.site` is undefined in `ContextProbe`).

- [ ] **Step 3: Implement the context pass-through**

Replace the full contents of `src/layouts/SiteLayout.tsx` with:

```tsx
import { Outlet } from 'react-router'
import { useContent } from '../content/useContent'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

/**
 * Container for the site chrome: calls useContent once and passes site +
 * navigation down as props, and the full content to the routed page via the
 * Outlet context. Presentational components never call the hook.
 */
export function SiteLayout() {
  const { content, loading, error } = useContent()

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      {content ? (
        <Header site={content.site} navigation={content.navigation} />
      ) : null}
      <main className="flex-1">
        {loading ? <p className="p-4">Carregando…</p> : null}
        {error ? (
          <p role="alert" className="p-4 text-error">
            Erro: {error.message}
          </p>
        ) : null}
        {content ? <Outlet context={content} /> : null}
      </main>
      {content ? (
        <Footer site={content.site} navigation={content.navigation} />
      ) : null}
    </div>
  )
}
```

Note: `Footer` gains its `navigation` prop in Task 11. Until then TypeScript will flag the extra prop — that is expected and resolved by Task 11. If executing strictly task-by-task and `pnpm build` is run here, it will error on `Footer`; run only the Vitest command in Step 4 for this task and defer `pnpm build` to Task 11.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/layouts/SiteLayout.test.tsx`
Expected: PASS both tests. (The current `Footer` ignores the extra `navigation` prop at runtime, so tests pass.)

- [ ] **Step 5: Commit**

```bash
git add src/layouts/SiteLayout.tsx src/layouts/SiteLayout.test.tsx
git commit -m "feat: pass loaded content to the routed page via Outlet context"
```

---

### Task 6: Hero section

**Files:**
- Create: `src/components/sections/Hero.tsx`
- Test: `src/components/sections/Hero.test.tsx`

**Interfaces:**
- Consumes: `Button` (Task 1).
- Produces: `Hero(props: { image: string; alt: string; title: string; subtitle: string; logo: string; logoAlt: string; primaryCta: { label: string; to: string }; secondaryCta: { label: string; to: string } })`.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/Hero.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { Hero } from './Hero'

const props = {
  image: '/images/hero.jpg',
  alt: 'Criança na montaria',
  title: 'Reabilitação e Equoterapia',
  subtitle: 'Qualidade de vida.',
  logo: '/images/logo.png',
  logoAlt: 'Projeto Liberdade',
  primaryCta: { label: 'Nossos Serviços', to: '/servicos' },
  secondaryCta: { label: 'Entre em Contato', to: '/contato' },
}

describe('Hero', () => {
  it('renders the title, subtitle and logo', () => {
    renderWithRouter(<Hero {...props} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Reabilitação e Equoterapia' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Qualidade de vida.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Projeto Liberdade' })).toHaveAttribute(
      'src',
      '/images/logo.png',
    )
  })

  it('exposes the background image via an accessible name', () => {
    renderWithRouter(<Hero {...props} />)
    expect(
      screen.getByRole('img', { name: 'Criança na montaria' }),
    ).toBeInTheDocument()
  })

  it('links both CTAs to their routes', () => {
    renderWithRouter(<Hero {...props} />)
    expect(
      screen.getByRole('link', { name: 'Nossos Serviços' }),
    ).toHaveAttribute('href', '/servicos')
    expect(
      screen.getByRole('link', { name: 'Entre em Contato' }),
    ).toHaveAttribute('href', '/contato')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/sections/Hero.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement Hero**

Create `src/components/sections/Hero.tsx`:

```tsx
import { Link } from 'react-router'
import { Button } from '../ui/Button'

interface HeroCta {
  label: string
  to: string
}

interface HeroProps {
  image: string
  alt: string
  title: string
  subtitle: string
  logo: string
  logoAlt: string
  primaryCta: HeroCta
  secondaryCta: HeroCta
}

export function Hero({
  image,
  alt,
  title,
  subtitle,
  logo,
  logoAlt,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  return (
    <header className="relative flex min-h-[65vh] items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${image})`, backgroundPosition: 'center 20%' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-secondary/80 mix-blend-multiply"
        />
      </div>
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-4 text-center md:px-16">
        <img
          src={logo}
          alt={logoAlt}
          className="mb-8 h-24 w-auto rounded-xl bg-white/10 p-3 object-contain backdrop-blur-sm md:h-32"
        />
        <h1 className="mb-6 font-display text-display-lg text-on-primary">
          {title}
        </h1>
        <p className="mb-8 max-w-xl font-sans text-body-lg text-on-primary/90">
          {subtitle}
        </p>
        <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
          <Button to={primaryCta.to} pill>
            {primaryCta.label}
          </Button>
          <Link
            to={secondaryCta.to}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-on-primary px-6 py-3 text-button text-on-primary transition-colors hover:bg-on-primary/10"
          >
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/sections/Hero.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Hero.tsx src/components/sections/Hero.test.tsx
git commit -m "feat: add Hero section"
```

---

### Task 7: HistoriaSection

**Files:**
- Create: `src/components/sections/HistoriaSection.tsx`
- Test: `src/components/sections/HistoriaSection.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Container`, `Button`, `SectionHeading`.
- Produces: `HistoriaSection(props: { heading: string; paragraphs: string[]; image?: { src: string; alt: string }; cta?: { label: string; to: string }; tone?: 'surface' | 'muted' })`.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/HistoriaSection.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { HistoriaSection } from './HistoriaSection'

describe('HistoriaSection', () => {
  it('renders heading, paragraphs and image', () => {
    renderWithRouter(
      <HistoriaSection
        heading="História"
        paragraphs={['Primeiro parágrafo.', 'Segundo parágrafo.']}
        image={{ src: '/images/historia.jpg', alt: 'Fundadores' }}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'História' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Primeiro parágrafo.')).toBeInTheDocument()
    expect(screen.getByText('Segundo parágrafo.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fundadores' })).toHaveAttribute(
      'src',
      '/images/historia.jpg',
    )
  })

  it('renders the CTA link when provided', () => {
    renderWithRouter(
      <HistoriaSection
        heading="História"
        paragraphs={['Texto.']}
        cta={{ label: 'Conheça nossa história', to: '/historia' }}
      />,
    )
    expect(
      screen.getByRole('link', { name: 'Conheça nossa história' }),
    ).toHaveAttribute('href', '/historia')
  })

  it('omits image and CTA when not provided', () => {
    const { container } = renderWithRouter(
      <HistoriaSection heading="História" paragraphs={['Texto.']} />,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/sections/HistoriaSection.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement HistoriaSection**

Create `src/components/sections/HistoriaSection.tsx`:

```tsx
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'

interface HistoriaSectionProps {
  heading: string
  paragraphs: string[]
  image?: { src: string; alt: string }
  cta?: { label: string; to: string }
  tone?: 'surface' | 'muted'
}

export function HistoriaSection({
  heading,
  paragraphs,
  image,
  cta,
  tone = 'surface',
}: HistoriaSectionProps) {
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading title={heading} />
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

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/sections/HistoriaSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/HistoriaSection.tsx src/components/sections/HistoriaSection.test.tsx
git commit -m "feat: add HistoriaSection"
```

---

### Task 8: MissionVisionValues

Splits an MVV section's `Block[]` body into three cards (heading starts a card; following paragraph/list blocks are its content), mapping title → icon; Valores renders its list.

**Files:**
- Create: `src/components/sections/MissionVisionValues.tsx`
- Test: `src/components/sections/MissionVisionValues.test.tsx`

**Interfaces:**
- Consumes: `Card`, `Container`, `Section`, `SectionHeading`, icons (Task 2), `Block` from `content/types`.
- Produces: `MissionVisionValues(props: { heading: string; body: Block[]; tone?: 'surface' | 'muted' })`.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/MissionVisionValues.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { Block } from '../../content/types'
import { MissionVisionValues } from './MissionVisionValues'

const body: Block[] = [
  { type: 'heading', text: 'Missão' },
  { type: 'paragraph', text: 'Oferecer oportunidade.' },
  { type: 'heading', text: 'Visão' },
  { type: 'paragraph', text: 'Ser reconhecido.' },
  { type: 'heading', text: 'Valores' },
  { type: 'list', items: ['Comprometimento', 'Ética'] },
]

describe('MissionVisionValues', () => {
  it('renders three cards from the section body', () => {
    render(<MissionVisionValues heading="Missão, Visão e Valores" body={body} />)
    expect(
      screen.getByRole('heading', { level: 3, name: 'Missão' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Visão' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Valores' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Oferecer oportunidade.')).toBeInTheDocument()
  })

  it('renders the Valores block as a list', () => {
    render(<MissionVisionValues heading="MVV" body={body} />)
    const list = screen.getByRole('list')
    expect(within(list).getByText('Comprometimento')).toBeInTheDocument()
    expect(within(list).getByText('Ética')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/sections/MissionVisionValues.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement MissionVisionValues**

Create `src/components/sections/MissionVisionValues.tsx`:

```tsx
import type { ComponentType } from 'react'
import type { Block } from '../../content/types'
import { Card } from '../ui/Card'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'
import { FavoriteIcon, FlagIcon, VisibilityIcon } from '../ui/icons'

interface MissionVisionValuesProps {
  heading: string
  body: Block[]
  tone?: 'surface' | 'muted'
}

interface MvvCard {
  title: string
  blocks: Block[]
}

function toCards(body: Block[]): MvvCard[] {
  const cards: MvvCard[] = []
  for (const block of body) {
    if (block.type === 'heading') {
      cards.push({ title: block.text, blocks: [] })
    } else if (cards.length > 0) {
      cards[cards.length - 1].blocks.push(block)
    }
  }
  return cards
}

const icons: Record<string, ComponentType<{ className?: string }>> = {
  Missão: FlagIcon,
  Visão: VisibilityIcon,
  Valores: FavoriteIcon,
}

export function MissionVisionValues({
  heading,
  body,
  tone = 'muted',
}: MissionVisionValuesProps) {
  const cards = toCards(body)
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading title={heading} />
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = icons[card.title] ?? FavoriteIcon
            return (
              <Card key={card.title} className="flex flex-col items-center text-center">
                <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </span>
                <h3 className="mb-3 font-display text-headline-sm text-on-surface">
                  {card.title}
                </h3>
                {card.blocks.map((block) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={block.text}
                        className="font-sans text-body-md text-on-surface-variant"
                      >
                        {block.text}
                      </p>
                    )
                  }
                  if (block.type === 'list') {
                    return (
                      <ul
                        key={block.items[0] ?? 'list'}
                        className="mt-2 list-disc space-y-1 pl-5 text-left font-sans text-body-md text-on-surface-variant"
                      >
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )
                  }
                  return null
                })}
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/sections/MissionVisionValues.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/MissionVisionValues.tsx src/components/sections/MissionVisionValues.test.tsx
git commit -m "feat: add MissionVisionValues section"
```

---

### Task 9: ServicesSection

**Files:**
- Create: `src/components/sections/ServicesSection.tsx`
- Test: `src/components/sections/ServicesSection.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Container`, `SectionHeading`, `ArrowForwardIcon`.
- Produces: `ServicesSection(props: { heading: string; intro?: string; services: Array<{ slug: string; title: string; excerpt: string; to: string }>; tone?: 'surface' | 'muted' })`. Exports `ServiceCardData` type for reuse by selectors.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/ServicesSection.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { ServicesSection } from './ServicesSection'

const services = [
  { slug: 'equoterapia', title: 'Equoterapia', excerpt: 'Método terapêutico.', to: '/servicos/equoterapia' },
  { slug: 'equitacao-ludica', title: 'Equitação Lúdica', excerpt: 'Para crianças.', to: '/servicos/equitacao-ludica' },
]

describe('ServicesSection', () => {
  it('renders one card per service with a link to its page', () => {
    renderWithRouter(
      <ServicesSection heading="Nossos Serviços" intro="Equipe." services={services} />,
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Equoterapia' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Método terapêutico.')).toBeInTheDocument()
    const links = screen.getAllByRole('link', { name: /Ver mais/ })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/servicos/equoterapia')
    expect(links[1]).toHaveAttribute('href', '/servicos/equitacao-ludica')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/sections/ServicesSection.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement ServicesSection**

Create `src/components/sections/ServicesSection.tsx`:

```tsx
import { Link } from 'react-router'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'
import { ArrowForwardIcon } from '../ui/icons'

export interface ServiceCardData {
  slug: string
  title: string
  excerpt: string
  to: string
}

interface ServicesSectionProps {
  heading: string
  intro?: string
  services: ServiceCardData[]
  tone?: 'surface' | 'muted'
}

export function ServicesSection({
  heading,
  intro,
  services,
  tone = 'surface',
}: ServicesSectionProps) {
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading title={heading} intro={intro} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.slug}
              className="flex h-full flex-col rounded-xl border border-outline-variant/30 bg-surface p-6 transition-shadow hover:shadow-level2"
            >
              <h3 className="mb-3 font-display text-headline-sm text-on-surface">
                {service.title}
              </h3>
              <p className="mb-6 flex-grow font-sans text-body-md text-on-surface-variant line-clamp-5">
                {service.excerpt}
              </p>
              <Link
                to={service.to}
                className="mt-auto inline-flex items-center gap-1 text-label-md text-link transition-colors hover:text-cta"
              >
                Ver mais <ArrowForwardIcon className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/sections/ServicesSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ServicesSection.tsx src/components/sections/ServicesSection.test.tsx
git commit -m "feat: add ServicesSection"
```

---

### Task 10: Header — logo + contact CTA

**Files:**
- Modify: `src/components/Header.tsx`
- Test: `src/components/Header.test.tsx` (create)

**Interfaces:**
- Consumes: `Nav`, `Container`, `Button` (Task 1), `ChatIcon` (Task 2).
- Produces: `Header({ site, navigation })` unchanged signature; renders logo image (`site.logo`), `Nav`, and a compact pill "Entre em contato" link to `/contato`.

- [ ] **Step 1: Write the failing test**

Create `src/components/Header.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../test/render'
import type { NavItem, Site } from '../content/types'
import { Header } from './Header'

const site: Site = {
  name: 'Projeto Liberdade',
  logo: '/images/logo.png',
  social: [],
}
const navigation: NavItem[] = [
  { slug: 'home', label: 'Home', order: 0 },
  { slug: 'contato', label: 'Contato', order: 4 },
]

describe('Header', () => {
  it('renders the logo image with the site name as alt', () => {
    renderWithRouter(<Header site={site} navigation={navigation} />)
    expect(
      screen.getByRole('img', { name: 'Projeto Liberdade' }),
    ).toHaveAttribute('src', '/images/logo.png')
  })

  it('renders the contact CTA linking to /contato', () => {
    renderWithRouter(<Header site={site} navigation={navigation} />)
    expect(
      screen.getByRole('link', { name: /Entre em contato/ }),
    ).toHaveAttribute('href', '/contato')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/Header.test.tsx`
Expected: FAIL — no logo `img` / no contact CTA yet.

- [ ] **Step 3: Implement the new Header**

Replace the full contents of `src/components/Header.tsx` with:

```tsx
import { Link } from 'react-router'
import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { Nav } from './Nav'
import { Button } from './ui/Button'
import { ChatIcon } from './ui/icons'

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
          <Button
            to="/contato"
            compact
            pill
            className="hidden items-center gap-1 md:inline-flex"
          >
            <ChatIcon className="h-4 w-4" /> Entre em contato
          </Button>
        </div>
      </Container>
    </header>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/Header.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/Header.test.tsx
git commit -m "feat: restyle Header with logo and contact CTA"
```

---

### Task 11: Footer — light style with nav links

**Files:**
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/Footer.test.tsx`

**Interfaces:**
- Consumes: `Container`, `SocialLinks`, `Link`, `NavItem`/`Site` types.
- Produces: `Footer({ site, navigation })` — new `navigation: NavItem[]` prop; renders brand + PT nav links (ordered) + social. No Privacy/Terms links.

- [ ] **Step 1: Update the failing test**

Replace the full contents of `src/components/Footer.test.tsx` with:

```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../test/render'
import type { NavItem, Site } from '../content/types'
import { Footer } from './Footer'

const site: Site = {
  name: 'Projeto Liberdade',
  logo: '/images/logo.png',
  social: [{ network: 'facebook', url: 'https://facebook.com/x' }],
}
const navigation: NavItem[] = [
  { slug: 'home', label: 'Home', order: 0 },
  { slug: 'historia', label: 'História', order: 1 },
  { slug: 'contato', label: 'Contato', order: 4 },
]

describe('Footer', () => {
  it('shows the site name, nav links and social links', () => {
    renderWithRouter(<Footer site={site} navigation={navigation} />)
    expect(screen.getByText('Projeto Liberdade')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'História' })).toHaveAttribute(
      'href',
      '/historia',
    )
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument()
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
  })

  it('does not render Privacy or Terms links', () => {
    renderWithRouter(<Footer site={site} navigation={navigation} />)
    expect(screen.queryByText(/Privacy/i)).toBeNull()
    expect(screen.queryByText(/Terms/i)).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/Footer.test.tsx`
Expected: FAIL — `Footer` does not accept `navigation` / renders no nav links.

- [ ] **Step 3: Implement the new Footer**

Replace the full contents of `src/components/Footer.tsx` with:

```tsx
import { Link } from 'react-router'
import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { SocialLinks } from './SocialLinks'

const byOrder = (a: NavItem, b: NavItem) => a.order - b.order
const href = (item: NavItem) => (item.slug === 'home' ? '/' : `/${item.slug}`)

export function Footer({
  site,
  navigation,
}: {
  site: Site
  navigation: NavItem[]
}) {
  const items = [...navigation].sort(byOrder)
  return (
    <footer
      data-testid="site-footer"
      className="mt-auto rounded-t-xl bg-surface-container"
    >
      <Container className="flex flex-col items-center gap-6 py-12 md:flex-row md:justify-between">
        <p className="font-display text-headline-sm text-primary">{site.name}</p>
        <nav
          aria-label="Rodapé"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2"
        >
          {items.map((item) => (
            <Link
              key={item.slug}
              to={href(item)}
              className="text-label-md text-on-surface-variant transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <SocialLinks links={site.social} />
      </Container>
    </footer>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- src/components/Footer.test.tsx src/layouts/SiteLayout.test.tsx`
Expected: PASS (Footer now types the `navigation` prop that SiteLayout passes).

Also run: `pnpm build`
Expected: type-check passes (the Task 5 `Footer` prop mismatch is now resolved).

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.tsx src/components/Footer.test.tsx
git commit -m "feat: restyle Footer with nav links and social"
```

---

### Task 12: Home content selectors (pure)

Pure functions that derive each section's props from `SiteContent`. Kept separate from the component for easy unit testing.

**Files:**
- Create: `src/features/home/homeSelectors.ts`
- Test: `src/features/home/homeSelectors.test.ts`

**Interfaces:**
- Consumes: `SiteContent`, `Block`, `HomeContent` from `content/types`; `ServiceCardData` from `components/sections/ServicesSection`.
- Produces:
  - `selectHero(content): HeroContent`
  - `selectHistoria(content): { heading: string; paragraphs: string[]; image?: { src: string; alt: string } }`
  - `selectMvv(content): { heading: string; body: Block[] }`
  - `selectServices(content): { heading: string; intro?: string; services: ServiceCardData[] }`

- [ ] **Step 1: Write the failing test**

Create `src/features/home/homeSelectors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { SiteContent } from '../../content/types'
import {
  selectHero,
  selectHistoria,
  selectMvv,
  selectServices,
} from './homeSelectors'

const content = {
  site: { name: 'Projeto Liberdade', logo: '/images/logo.png', social: [] },
  navigation: [],
  pages: {
    home: {
      slug: 'home',
      title: 'Home',
      hero: {
        image: '/images/hero.jpg',
        alt: 'alt',
        title: 'Reabilitação e Equoterapia',
        subtitle: 'sub',
      },
      featuredServices: ['equoterapia', 'equitacao-ludica'],
    },
    historia: {
      slug: 'historia',
      title: 'História',
      body: [
        { type: 'image', src: '/images/historia.jpg', alt: 'Fundadores' },
        { type: 'paragraph', text: 'P1' },
        { type: 'paragraph', text: 'P2' },
        { type: 'paragraph', text: 'P3' },
        { type: 'quote', text: 'Q' },
      ],
      sections: [
        {
          slug: 'missao-visao-valores',
          title: 'Missão, Visão e Valores',
          body: [{ type: 'heading', text: 'Missão' }],
        },
      ],
    },
    servicos: {
      slug: 'servicos',
      title: 'Serviços',
      body: [{ type: 'paragraph', text: 'Equipe multidisciplinar.' }],
      sections: [
        {
          slug: 'equoterapia',
          title: 'Equoterapia',
          body: [{ type: 'paragraph', text: 'Método.' }],
        },
        {
          slug: 'equitacao-ludica',
          title: 'Equitação Lúdica',
          body: [{ type: 'paragraph', text: 'Lúdica.' }],
        },
        {
          slug: 'equitacao-classica',
          title: 'Equitação Clássica',
          body: [{ type: 'paragraph', text: 'Clássica.' }],
        },
      ],
    },
  },
} as unknown as SiteContent

describe('homeSelectors', () => {
  it('selectHero returns the hero block', () => {
    expect(selectHero(content).title).toBe('Reabilitação e Equoterapia')
  })

  it('selectHistoria returns first image and first two paragraphs', () => {
    const h = selectHistoria(content)
    expect(h.heading).toBe('História')
    expect(h.paragraphs).toEqual(['P1', 'P2'])
    expect(h.image).toEqual({ src: '/images/historia.jpg', alt: 'Fundadores' })
  })

  it('selectMvv returns the MVV section body', () => {
    const m = selectMvv(content)
    expect(m.heading).toBe('Missão, Visão e Valores')
    expect(m.body).toHaveLength(1)
  })

  it('selectServices resolves featured services in order with excerpts', () => {
    const s = selectServices(content)
    expect(s.heading).toBe('Nossos Serviços')
    expect(s.intro).toBe('Equipe multidisciplinar.')
    expect(s.services.map((x) => x.slug)).toEqual([
      'equoterapia',
      'equitacao-ludica',
    ])
    expect(s.services[0]).toMatchObject({
      title: 'Equoterapia',
      excerpt: 'Método.',
      to: '/servicos/equoterapia',
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/home/homeSelectors.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the selectors**

Create `src/features/home/homeSelectors.ts`:

```ts
import type { Block, HeroContent, HomeContent, SiteContent } from '../../content/types'
import type { ServiceCardData } from '../../components/sections/ServicesSection'

interface NamedSection {
  slug: string
  title: string
  body: Block[]
}

interface HistoriaPage {
  title: string
  body: Block[]
}

interface HistoriaWithSections extends HistoriaPage {
  sections?: NamedSection[]
}

interface ServicosPage {
  body?: Block[]
  sections?: NamedSection[]
}

function paragraphs(body: Block[]): string[] {
  return body
    .filter((b): b is Extract<Block, { type: 'paragraph' }> => b.type === 'paragraph')
    .map((b) => b.text)
}

function firstParagraph(body: Block[]): string {
  return paragraphs(body)[0] ?? ''
}

export function selectHero(content: SiteContent): HeroContent {
  return (content.pages.home as HomeContent).hero
}

export function selectHistoria(
  content: SiteContent,
  maxParagraphs = 2,
): { heading: string; paragraphs: string[]; image?: { src: string; alt: string } } {
  const page = content.pages.historia as unknown as HistoriaPage
  const body = page.body ?? []
  const image = body.find(
    (b): b is Extract<Block, { type: 'image' }> => b.type === 'image',
  )
  return {
    heading: page.title,
    paragraphs: paragraphs(body).slice(0, maxParagraphs),
    image: image ? { src: image.src, alt: image.alt } : undefined,
  }
}

export function selectMvv(content: SiteContent): { heading: string; body: Block[] } {
  const page = content.pages.historia as unknown as HistoriaWithSections
  const section = page.sections?.find((s) => s.slug === 'missao-visao-valores')
  return {
    heading: section?.title ?? 'Missão, Visão e Valores',
    body: section?.body ?? [],
  }
}

export function selectServices(content: SiteContent): {
  heading: string
  intro?: string
  services: ServiceCardData[]
} {
  const home = content.pages.home as HomeContent
  const servicos = content.pages.servicos as unknown as ServicosPage
  const sections = servicos.sections ?? []
  const services: ServiceCardData[] = (home.featuredServices ?? [])
    .map((slug) => sections.find((s) => s.slug === slug))
    .filter((s): s is NamedSection => Boolean(s))
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      excerpt: firstParagraph(s.body),
      to: `/servicos/${s.slug}`,
    }))
  return {
    heading: 'Nossos Serviços',
    intro: servicos.body ? firstParagraph(servicos.body) : undefined,
    services,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/home/homeSelectors.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/homeSelectors.ts src/features/home/homeSelectors.test.ts
git commit -m "feat: add home content selectors"
```

---

### Task 13: HomePage container + route wiring

Compose the sections and wire the index route to `HomePage`; remove the obsolete `PlaceholderPage`.

**Files:**
- Create: `src/features/home/HomePage.tsx`
- Test: `src/features/home/HomePage.test.tsx`
- Modify: `src/routes.tsx`
- Delete: `src/PlaceholderPage.tsx`

**Interfaces:**
- Consumes: `useOutletContext`, `SiteContent`, all section components, all selectors (Task 12).
- Produces: `HomePage()` — reads `SiteContent` from `useOutletContext`, renders `Hero`, `HistoriaSection` (tone surface), `MissionVisionValues` (tone muted), `ServicesSection` (tone surface).

- [ ] **Step 1: Write the failing test**

Create `src/features/home/HomePage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SiteLayout } from '../../layouts/SiteLayout'
import { HomePage } from './HomePage'

function renderHome() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ index: true, Component: HomePage }],
      },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('HomePage', () => {
  it('composes hero and all sections from content', async () => {
    renderHome()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Reabilitação e Equoterapia',
        }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'História' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Missão, Visão e Valores' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossos Serviços' }),
    ).toBeInTheDocument()
  })

  it('renders the featured services in order', async () => {
    renderHome()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 3, name: 'Equoterapia' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Equitação Lúdica' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Equitação Adaptada' }),
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/home/HomePage.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement HomePage**

Create `src/features/home/HomePage.tsx`:

```tsx
import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { Hero } from '../../components/sections/Hero'
import { HistoriaSection } from '../../components/sections/HistoriaSection'
import { MissionVisionValues } from '../../components/sections/MissionVisionValues'
import { ServicesSection } from '../../components/sections/ServicesSection'
import {
  selectHero,
  selectHistoria,
  selectMvv,
  selectServices,
} from './homeSelectors'

export function HomePage() {
  const content = useOutletContext<SiteContent>()
  const hero = selectHero(content)
  const historia = selectHistoria(content)
  const mvv = selectMvv(content)
  const services = selectServices(content)

  return (
    <>
      <Hero
        image={hero.image}
        alt={hero.alt}
        title={hero.title}
        subtitle={hero.subtitle}
        logo={content.site.logo}
        logoAlt={content.site.name}
        primaryCta={{ label: 'Nossos Serviços', to: '/servicos' }}
        secondaryCta={{ label: 'Entre em Contato', to: '/contato' }}
      />
      <HistoriaSection
        tone="surface"
        heading={historia.heading}
        paragraphs={historia.paragraphs}
        image={historia.image}
        cta={{ label: 'Conheça nossa história', to: '/historia' }}
      />
      <MissionVisionValues tone="muted" heading={mvv.heading} body={mvv.body} />
      <ServicesSection
        tone="surface"
        heading={services.heading}
        intro={services.intro}
        services={services.services}
      />
    </>
  )
}
```

- [ ] **Step 4: Wire the route and remove PlaceholderPage**

Replace the full contents of `src/routes.tsx` with:

```tsx
/* eslint-disable react-refresh/only-export-components -- route config file mixes a
   local NotFound component with the exported router config; not relevant for HMR */
import { createBrowserRouter } from 'react-router'
import { SiteLayout } from './layouts/SiteLayout'
import { HomePage } from './features/home/HomePage'
import { StyleGuide } from './styleguide/StyleGuide'

function NotFound() {
  return <p>404 — página não encontrada</p>
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SiteLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'estilo', Component: StyleGuide },
      { path: '*', Component: NotFound },
    ],
  },
])
```

Then delete the obsolete placeholder:

```bash
git rm src/PlaceholderPage.tsx
```

- [ ] **Step 5: Run tests + full build to verify**

Run: `pnpm test -- src/features/home/HomePage.test.tsx`
Expected: PASS.

Run: `pnpm test`
Expected: PASS (whole unit suite; note the StyleGuide route still imports `useContent` in `SiteLayout` unchanged).

Run: `pnpm build`
Expected: type-check + build succeed with no references to `PlaceholderPage`.

- [ ] **Step 6: Commit**

```bash
git add src/features/home/HomePage.tsx src/features/home/HomePage.test.tsx src/routes.tsx
git commit -m "feat: wire HomePage into the index route"
```

---

### Task 14: E2E — homepage smoke

Replace the placeholder-era e2e with homepage assertions.

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: the running dev server (`pnpm dev` at `http://localhost:5173`, per `playwright.config`).

- [ ] **Step 1: Replace the e2e spec**

Replace the full contents of `tests/e2e/smoke.spec.ts` with:

```ts
import { expect, test } from '@playwright/test'

test('homepage renders hero and all sections', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Reabilitação e Equoterapia' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'História' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Missão, Visão e Valores' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Nossos Serviços' }),
  ).toBeVisible()
})

test('hero and service CTAs point to their routes', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('link', { name: 'Nossos Serviços' }),
  ).toHaveAttribute('href', '/servicos')
  await expect(
    page.getByRole('link', { name: 'Entre em Contato' }),
  ).toHaveAttribute('href', '/contato')
  await expect(
    page.getByRole('link', { name: /Ver mais/ }).first(),
  ).toHaveAttribute('href', '/servicos/equoterapia')
})
```

- [ ] **Step 2: Run the e2e suite**

Run: `pnpm test:e2e`
Expected: PASS (2 tests). Playwright starts the dev server automatically.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/smoke.spec.ts
git commit -m "test: replace placeholder e2e with homepage smoke"
```

---

### Task 15: Final verification + docs touch-up

**Files:**
- Modify: `CLAUDE.md` (Phase map / Structure notes)

- [ ] **Step 1: Run the full verification suite**

```bash
pnpm lint
pnpm test
pnpm build
```
Expected: all pass, no lint errors, no type errors.

- [ ] **Step 2: Update CLAUDE.md**

In `CLAUDE.md`:

2a. In the `Structure` block, add under `components/` a line for the new folder:
```
    sections/                 # reusable, prop-driven page sections (Hero, Historia, MVV, Services)
```
and under `src/` add:
```
  features/home/  # HomePage container + homeSelectors
```

2b. In the "Phase map / TODO" section, mark item 3 as in progress and note the home page is done:
```
3. **Pages / content** — home page **done** (redesign implemented: Hero,
   História, Missão/Visão/Valores, featured Serviços; reusable section
   components in `src/components/sections/`). Remaining: historia, servicos
   (+ `/servicos/:slug`), momentos, contato; bulk image migration; full
   content types + runtime validation.
```

2c. Note the layout seam change near the dependency rule:
```
Container content flows to pages via the router `Outlet` context (`SiteLayout`
provides it; page containers read it with `useOutletContext`).
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: note homepage redesign and sections/ structure in CLAUDE.md"
```

---

## Self-Review

**Spec coverage:**
- Hero (single static image + overlay) → Task 6 + content Task 4. ✓
- História (first image + 2 paragraphs + CTA) → Task 7 + selector Task 12. ✓
- Missão/Visão/Valores (split blocks into 3 cards, Valores list) → Task 8. ✓
- Serviços (featured `equoterapia`, `equitacao-ludica`, `equitacao-adaptada`) → content Task 4 + selector Task 12 + Task 9 + composition Task 13. ✓
- Compose from canonical content → selectors Task 12. ✓
- Single fetch via Outlet context (gated on content) → Task 5. ✓
- Header (logo + contact pill CTA) → Task 10. ✓
- Footer (light, nav + social, no Privacy/Terms) → Task 11. ✓
- Inline SVG icons, no CDN → Task 2. ✓
- CTA pills via Button → Task 1 (used in Tasks 6, 10). ✓
- SectionHeading shared → Task 3. ✓
- Image migration (hero, historia, logo only) → Task 4. ✓
- Types (`HeroContent`, `HomeContent`) → Task 4. ✓
- Route swap + remove PlaceholderPage → Task 13. ✓
- Vitest per component + Playwright e2e → each task + Task 14. ✓
- Canonical PT copy (discard mockup English/placeholder) → enforced in content Task 4 and Global Constraints. ✓
- CLAUDE.md structure/phase note → Task 15. ✓

**Placeholder scan:** No TBD/TODO; every code and test step contains complete content. ✓

**Type consistency:** `ServiceCardData` defined in Task 9, imported by Task 12 and used by Task 13. `HeroContent`/`HomeContent` defined in Task 4, used in Task 12. `selectHero/selectHistoria/selectMvv/selectServices` names consistent across Tasks 12–13. `Footer({ site, navigation })` prop added in Task 11 matches the call site introduced in Task 5. `Button` `pill` prop (Task 1) matches usage in Tasks 6 and 10. ✓

**Cross-task build note:** Task 5 introduces a temporary `Footer` prop mismatch that Task 11 resolves; the plan calls this out and defers `pnpm build` in Task 5 to a Vitest-only check, with the full `pnpm build` run in Task 11. If tasks are executed out of order, run Tasks 5 and 11 together.
