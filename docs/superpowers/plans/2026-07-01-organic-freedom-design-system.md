# Organic Freedom Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Organic Freedom design-system layer — Tailwind v4 tokens, fonts, and the prop-driven component set the site needs — per `docs/superpowers/specs/2026-07-01-organic-freedom-design-system-design.md`.

**Architecture:** Tokens live in `src/index.css` as a Tailwind v4 `@theme` block (single source of truth). Every component is presentational and receives data via props; `useContent` is called only by `SiteLayout`. Components are unit-tested with Vitest + Testing Library and viewable at a dev `/estilo` route.

**Tech Stack:** TypeScript 6 (strict), React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), React Router v8, Vitest + Testing Library, `@fontsource`.

## Global Constraints

- Prettier: **no semicolons, single quotes, trailing commas**. Run `pnpm format` before committing if unsure.
- `verbatimModuleSyntax` is on: **type-only imports must use `import type`**.
- `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly` are on: no unused symbols, no TS enums, no constructor parameter properties.
- React Router v8: import `Link`, `Outlet`, `MemoryRouter` from `'react-router'`.
- **Dependency rule:** components take props and never import `content.json`, call `useContent`, or reference Firebase. Only `SiteLayout` calls `useContent`.
- **Do not remove the `/` index route (`PlaceholderPage`)** — the e2e smoke test asserts `scaffold-heading` there.
- Tests colocate as `*.test.tsx` and import `{ describe, it, expect }` from `'vitest'`.
- Verify commands: `pnpm test` (Vitest), `pnpm build` (tsc + vite), `pnpm lint`.

---

### Task 1: Design tokens + fonts

**Files:**
- Modify: `src/index.css`
- Modify: `src/main.tsx`
- Modify: `package.json` (via `pnpm add`)

**Interfaces:**
- Produces: Tailwind utilities `bg-*`/`text-*`/`border-*` for every MD3 color and the brand colors `cta`, `cta-hover`, `cta-strong`, `on-cta`, `link`; text utilities `text-display-lg`, `text-headline-md`, `text-headline-sm`, `text-body-lg`, `text-body-md`, `text-label-md`, `text-label-sm`, `text-button`; `font-display`/`font-sans`; `rounded-sm|md|lg|xl`; `shadow-level1|level2`; `max-w-site`.

- [ ] **Step 1: Install font packages**

Run: `pnpm add @fontsource/plus-jakarta-sans @fontsource/work-sans`
Expected: both added to `dependencies`.

- [ ] **Step 2: Write the theme into `src/index.css`**

Replace the entire file with:

```css
@import 'tailwindcss';

@theme {
  /* Colors — MD3 roles (verbatim from DESIGN.md) */
  --color-surface: #faf9f6;
  --color-surface-dim: #dadad7;
  --color-surface-bright: #faf9f6;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f4f4f0;
  --color-surface-container: #eeeeea;
  --color-surface-container-high: #e8e8e5;
  --color-surface-container-highest: #e2e3df;
  --color-on-surface: #1a1c1a;
  --color-on-surface-variant: #3d4a3f;
  --color-inverse-surface: #2f312f;
  --color-inverse-on-surface: #f1f1ed;
  --color-outline: #6d7b6e;
  --color-outline-variant: #bccabb;
  --color-surface-tint: #006d38;
  --color-primary: #006d38;
  --color-on-primary: #ffffff;
  --color-primary-container: #00aa5a;
  --color-on-primary-container: #003518;
  --color-inverse-primary: #57df88;
  --color-secondary: #5656a3;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #acabff;
  --color-on-secondary-container: #3d3c88;
  --color-tertiary: #5b5f5e;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #919593;
  --color-on-tertiary-container: #2a2e2d;
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;
  --color-primary-fixed: #76fca2;
  --color-primary-fixed-dim: #57df88;
  --color-on-primary-fixed: #00210d;
  --color-on-primary-fixed-variant: #005228;
  --color-secondary-fixed: #e2dfff;
  --color-secondary-fixed-dim: #c2c1ff;
  --color-on-secondary-fixed: #100a5d;
  --color-on-secondary-fixed-variant: #3e3d8a;
  --color-tertiary-fixed: #e0e3e1;
  --color-tertiary-fixed-dim: #c4c7c5;
  --color-on-tertiary-fixed: #181c1b;
  --color-on-tertiary-fixed-variant: #434846;
  --color-background: #faf9f6;
  --color-on-background: #1a1c1a;
  --color-surface-variant: #e2e3df;

  /* Brand / semantic layer (hybrid decision) */
  --color-cta: #00aa5a;        /* vibrant CTA fill  = primary-container */
  --color-cta-hover: #006d38;  /* hover/pressed     = primary          */
  --color-cta-strong: #006d38; /* compact button fill                  */
  --color-on-cta: #ffffff;
  --color-link: #006d38;       /* small green text/links on light      */

  /* Typography */
  --font-display: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  --font-sans: 'Work Sans', ui-sans-serif, system-ui, sans-serif;

  --text-display-lg: clamp(2.25rem, 1.5rem + 3vw, 3rem);
  --text-display-lg--line-height: 1.1;
  --text-display-lg--font-weight: 700;
  --text-display-lg--letter-spacing: -0.02em;
  --text-headline-md: 2rem;
  --text-headline-md--line-height: 2.5rem;
  --text-headline-md--font-weight: 600;
  --text-headline-sm: 1.5rem;
  --text-headline-sm--line-height: 2rem;
  --text-headline-sm--font-weight: 600;
  --text-body-lg: 1.125rem;
  --text-body-lg--line-height: 1.75rem;
  --text-body-lg--font-weight: 400;
  --text-body-md: 1rem;
  --text-body-md--line-height: 1.5rem;
  --text-body-md--font-weight: 400;
  --text-label-md: 0.875rem;
  --text-label-md--line-height: 1.25rem;
  --text-label-md--font-weight: 600;
  --text-label-md--letter-spacing: 0.01em;
  --text-label-sm: 0.75rem;
  --text-label-sm--line-height: 1rem;
  --text-label-sm--font-weight: 500;
  --text-label-sm--letter-spacing: 0.04em;
  --text-button: 1.1875rem; /* 19px — AA-large so white-on-#00aa5a passes */
  --text-button--line-height: 1.5rem;
  --text-button--font-weight: 700;

  /* Radius (named scale; DESIGN.md values) */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;

  /* Elevation (secondary-tinted ambient shadows) */
  --shadow-level1: 0 4px 20px rgb(86 86 163 / 0.04);
  --shadow-level2: 0 8px 32px rgb(86 86 163 / 0.08);

  /* Layout */
  --container-site: 90rem; /* 1440px */
}

@layer base {
  body {
    font-family: var(--font-sans);
    background-color: var(--color-surface);
    color: var(--color-on-surface);
  }
}
```

- [ ] **Step 3: Import the font weights in `src/main.tsx`**

Add these imports directly under `import './index.css'`:

```tsx
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/500.css'
import '@fontsource/work-sans/600.css'
```

- [ ] **Step 4: Verify the build compiles the theme**

Run: `pnpm build`
Expected: exits 0 (tsc + vite build succeed; Tailwind processes `@theme`).

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/main.tsx package.json pnpm-lock.yaml
git commit -m "feat: add Organic Freedom design tokens and fonts"
```

---

### Task 2: `cn` util, test render helper, and Button

**Files:**
- Create: `src/lib/cn.ts`
- Create: `src/test/render.tsx`
- Create: `src/components/ui/Button.tsx`
- Test: `src/components/ui/Button.test.tsx`

**Interfaces:**
- Produces: `cn(...classes): string`; `renderWithRouter(ui, { route? })`; `Button` with props `{ variant?: 'primary' | 'secondary'; compact?: boolean; to?: string; className?: string; children }` plus native button attrs.

- [ ] **Step 1: Write the failing test**

`src/components/ui/Button.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import { Button } from './Button'

describe('Button', () => {
  it('renders a primary button by default', () => {
    render(<Button>Enviar</Button>)
    const btn = screen.getByRole('button', { name: 'Enviar' })
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn.className).toContain('bg-cta')
    expect(btn.className).toContain('text-button')
  })

  it('renders the secondary outline variant', () => {
    render(<Button variant="secondary">Ler mais</Button>)
    const btn = screen.getByRole('button', { name: 'Ler mais' })
    expect(btn.className).toContain('border-secondary')
    expect(btn.className).toContain('text-secondary')
  })

  it('uses the strong fill for a compact primary button', () => {
    render(<Button compact>Ok</Button>)
    expect(screen.getByRole('button', { name: 'Ok' }).className).toContain(
      'bg-cta-strong',
    )
  })

  it('renders a router link when given "to"', () => {
    renderWithRouter(<Button to="/contato">Contato</Button>)
    const link = screen.getByRole('link', { name: 'Contato' })
    expect(link).toHaveAttribute('href', '/contato')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/ui/Button.test.tsx`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the helpers and Button**

`src/lib/cn.ts`:

```ts
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

`src/test/render.tsx`:

```tsx
import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

export function renderWithRouter(ui: ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}
```

`src/components/ui/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'secondary'
  compact?: boolean
  to?: string
  className?: string
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta'

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
  to,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(base, variantClasses(variant, compact), className)
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

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/ui/Button.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/cn.ts src/test/render.tsx src/components/ui/Button.tsx src/components/ui/Button.test.tsx
git commit -m "feat: add cn util, test render helper, and Button"
```

---

### Task 3: Chip

**Files:**
- Create: `src/components/ui/Chip.tsx`
- Test: `src/components/ui/Chip.test.tsx`

**Interfaces:**
- Produces: `Chip` with props `{ tone?: 'primary' | 'secondary'; className?: string; children }`.

- [ ] **Step 1: Write the failing test**

`src/components/ui/Chip.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Chip } from './Chip'

describe('Chip', () => {
  it('renders its label with a rounded pill', () => {
    render(<Chip>Ética</Chip>)
    const chip = screen.getByText('Ética')
    expect(chip.className).toContain('rounded-full')
    expect(chip.className).toContain('bg-primary/10')
  })

  it('supports the secondary tone', () => {
    render(<Chip tone="secondary">Info</Chip>)
    expect(screen.getByText('Info').className).toContain('bg-secondary/10')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/ui/Chip.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement Chip**

`src/components/ui/Chip.tsx`:

```tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ChipProps {
  tone?: 'primary' | 'secondary'
  className?: string
  children: ReactNode
}

export function Chip({ tone = 'primary', className, children }: ChipProps) {
  const toneClass =
    tone === 'secondary'
      ? 'bg-secondary/10 text-on-secondary-container'
      : 'bg-primary/10 text-on-primary-container'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-label-sm',
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/ui/Chip.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Chip.tsx src/components/ui/Chip.test.tsx
git commit -m "feat: add Chip"
```

---

### Task 4: Card

**Files:**
- Create: `src/components/ui/Card.tsx`
- Test: `src/components/ui/Card.test.tsx`

**Interfaces:**
- Produces: `Card` with props `{ as?: ElementType; elevated?: boolean; className?: string; children }`.

- [ ] **Step 1: Write the failing test**

`src/components/ui/Card.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children in a rounded surface with level-1 shadow', () => {
    render(<Card>conteúdo</Card>)
    const card = screen.getByText('conteúdo')
    expect(card.tagName).toBe('DIV')
    expect(card.className).toContain('rounded-lg')
    expect(card.className).toContain('shadow-level1')
  })

  it('uses level-2 shadow when elevated', () => {
    render(<Card elevated>x</Card>)
    expect(screen.getByText('x').className).toContain('shadow-level2')
  })

  it('renders as the given element', () => {
    render(<Card as="section">y</Card>)
    expect(screen.getByText('y').tagName).toBe('SECTION')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/ui/Card.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement Card**

`src/components/ui/Card.tsx`:

```tsx
import type { ElementType, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface CardProps {
  as?: ElementType
  elevated?: boolean
  className?: string
  children: ReactNode
}

export function Card({
  as: Tag = 'div',
  elevated = false,
  className,
  children,
}: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-lg bg-surface-container-lowest p-6',
        elevated ? 'shadow-level2' : 'shadow-level1',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/ui/Card.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Card.tsx src/components/ui/Card.test.tsx
git commit -m "feat: add Card"
```

---

### Task 5: Container and Section

**Files:**
- Create: `src/components/ui/Container.tsx`
- Create: `src/components/ui/Section.tsx`
- Test: `src/components/ui/layout.test.tsx`

**Interfaces:**
- Produces: `Container` `{ className?; children }`; `Section` `{ tone?: 'surface' | 'muted'; className?; children }`.

- [ ] **Step 1: Write the failing test**

`src/components/ui/layout.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Container } from './Container'
import { Section } from './Section'

describe('layout primitives', () => {
  it('Container caps width and pads responsively', () => {
    render(<Container>inner</Container>)
    const el = screen.getByText('inner')
    expect(el.className).toContain('max-w-site')
    expect(el.className).toContain('md:px-16')
  })

  it('Section renders a <section> with vertical rhythm', () => {
    render(<Section>body</Section>)
    const el = screen.getByText('body')
    expect(el.tagName).toBe('SECTION')
    expect(el.className).toContain('md:py-20')
  })

  it('Section supports the muted tone', () => {
    render(<Section tone="muted">m</Section>)
    expect(screen.getByText('m').className).toContain('bg-surface-container-low')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/ui/layout.test.tsx`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement Container and Section**

`src/components/ui/Container.tsx`:

```tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ContainerProps {
  className?: string
  children: ReactNode
}

export function Container({ className, children }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-site px-4 md:px-16', className)}>
      {children}
    </div>
  )
}
```

`src/components/ui/Section.tsx`:

```tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SectionProps {
  tone?: 'surface' | 'muted'
  className?: string
  children: ReactNode
}

export function Section({ tone = 'surface', className, children }: SectionProps) {
  const toneClass = tone === 'muted' ? 'bg-surface-container-low' : 'bg-surface'
  return (
    <section className={cn('py-12 md:py-20', toneClass, className)}>
      {children}
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/ui/layout.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Container.tsx src/components/ui/Section.tsx src/components/ui/layout.test.tsx
git commit -m "feat: add Container and Section layout primitives"
```

---

### Task 6: Block types and BlockRenderer

**Files:**
- Modify: `src/content/types.ts`
- Create: `src/components/blocks/Paragraph.tsx`, `Heading.tsx`, `List.tsx`, `Image.tsx`, `Quote.tsx`, `BlockRenderer.tsx`
- Delete: `src/components/blocks/README.md`
- Test: `src/components/blocks/BlockRenderer.test.tsx`

**Interfaces:**
- Produces: `Block` union in `types.ts`; `BlockRenderer` with props `{ blocks: Block[] }`.
- Consumes: nothing from earlier tasks.

- [ ] **Step 1: Add the `Block` union to `src/content/types.ts`**

Append to the file:

```ts
export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'quote'; text: string; author?: string }
```

- [ ] **Step 2: Write the failing test**

`src/components/blocks/BlockRenderer.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Block } from '../../content/types'
import { BlockRenderer } from './BlockRenderer'

const blocks: Block[] = [
  { type: 'heading', text: 'Missão' },
  { type: 'paragraph', text: 'Texto de missão.' },
  { type: 'list', items: ['Ética', 'Respeito'] },
  { type: 'image', src: '/img/x.jpg', alt: 'cavalo' },
  { type: 'quote', text: 'São 16 anos.', author: 'André' },
]

describe('BlockRenderer', () => {
  it('renders each block type with the right element', () => {
    render(<BlockRenderer blocks={blocks} />)
    expect(screen.getByRole('heading', { name: 'Missão' }).tagName).toBe('H2')
    expect(screen.getByText('Texto de missão.').tagName).toBe('P')
    expect(screen.getByRole('listitem', { name: 'Ética' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'cavalo' })).toHaveAttribute(
      'src',
      '/img/x.jpg',
    )
    expect(screen.getByText('São 16 anos.').closest('blockquote')).not.toBeNull()
    expect(screen.getByText('André')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test -- src/components/blocks/BlockRenderer.test.tsx`
Expected: FAIL (modules not found).

- [ ] **Step 4: Implement the block components**

`src/components/blocks/Paragraph.tsx`:

```tsx
export function Paragraph({ text }: { text: string }) {
  return <p className="text-body-lg text-on-surface">{text}</p>
}
```

`src/components/blocks/Heading.tsx`:

```tsx
export function Heading({ text, level = 2 }: { text: string; level?: 2 | 3 }) {
  const Tag = level === 3 ? 'h3' : 'h2'
  return <Tag className="font-display text-headline-sm text-on-surface">{text}</Tag>
}
```

`src/components/blocks/List.tsx`:

```tsx
export function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3 text-body-md text-on-surface">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
```

`src/components/blocks/Image.tsx`:

```tsx
export function ImageBlock({ src, alt }: { src: string; alt: string }) {
  return (
    <figure>
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-lg" />
    </figure>
  )
}
```

`src/components/blocks/Quote.tsx`:

```tsx
export function Quote({ text, author }: { text: string; author?: string }) {
  return (
    <blockquote className="rounded-xl border-l-4 border-secondary bg-secondary/5 px-6 py-5 text-body-lg text-on-surface">
      <p>{text}</p>
      {author ? (
        <footer className="mt-2 text-label-md text-secondary">{author}</footer>
      ) : null}
    </blockquote>
  )
}
```

`src/components/blocks/BlockRenderer.tsx`:

```tsx
import type { Block } from '../../content/types'
import { Paragraph } from './Paragraph'
import { Heading } from './Heading'
import { List } from './List'
import { ImageBlock } from './Image'
import { Quote } from './Quote'

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <Paragraph text={block.text} />
    case 'heading':
      return <Heading text={block.text} level={block.level} />
    case 'list':
      return <List items={block.items} />
    case 'image':
      return <ImageBlock src={block.src} alt={block.alt} />
    case 'quote':
      return <Quote text={block.text} author={block.author} />
    default:
      return assertNever(block)
  }
}

function assertNever(block: never): never {
  throw new Error(`Unknown block type: ${JSON.stringify(block)}`)
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <BlockItem key={i} block={block} />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Remove the placeholder README**

Run: `git rm src/components/blocks/README.md`

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test -- src/components/blocks/BlockRenderer.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add src/content/types.ts src/components/blocks/
git commit -m "feat: add Block union and BlockRenderer"
```

---

### Task 7: SocialLinks

**Files:**
- Create: `src/components/SocialLinks.tsx`
- Test: `src/components/SocialLinks.test.tsx`

**Interfaces:**
- Consumes: `SocialLink` from `src/content/types.ts` (exists: `{ network: string; url: string }`).
- Produces: `SocialLinks` with props `{ links: SocialLink[] }`.

- [ ] **Step 1: Write the failing test**

`src/components/SocialLinks.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SocialLinks } from './SocialLinks'

const links = [
  { network: 'facebook', url: 'https://facebook.com/x' },
  { network: 'instagram', url: 'https://instagram.com/x' },
]

describe('SocialLinks', () => {
  it('renders an external, labelled link per network', () => {
    render(<SocialLinks links={links} />)
    const fb = screen.getByRole('link', { name: 'Facebook' })
    expect(fb).toHaveAttribute('href', 'https://facebook.com/x')
    expect(fb).toHaveAttribute('target', '_blank')
    expect(fb).toHaveAttribute('rel', 'noreferrer')
    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/SocialLinks.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement SocialLinks**

`src/components/SocialLinks.tsx`:

```tsx
import type { ReactElement } from 'react'
import type { SocialLink } from '../content/types'

const labels: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
}

const icons: Record<string, ReactElement> = {
  facebook: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M13 22v-8h2.7l.4-3H13V9.1c0-.9.3-1.5 1.6-1.5H16V5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H7v3h2.8v8H13z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
}

export function SocialLinks({ links }: { links: SocialLink[] }) {
  return (
    <ul className="flex gap-4">
      {links.map((link) => (
        <li key={link.network}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={labels[link.network] ?? link.network}
            className="text-on-surface-variant hover:text-primary"
          >
            {icons[link.network] ?? <span aria-hidden="true">↗</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/SocialLinks.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/SocialLinks.tsx src/components/SocialLinks.test.tsx
git commit -m "feat: add SocialLinks"
```

---

### Task 8: Footer

**Files:**
- Create: `src/components/Footer.tsx`
- Test: `src/components/Footer.test.tsx`

**Interfaces:**
- Consumes: `Site` from types (`{ name; logo; social: SocialLink[] }`); `Container`; `SocialLinks`.
- Produces: `Footer` with props `{ site: Site }`, renders `<footer data-testid="site-footer">`.

- [ ] **Step 1: Write the failing test**

`src/components/Footer.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Site } from '../content/types'
import { Footer } from './Footer'

const site: Site = {
  name: 'Projeto Liberdade',
  logo: 'logo.png',
  social: [{ network: 'facebook', url: 'https://facebook.com/x' }],
}

describe('Footer', () => {
  it('shows the site name and social links', () => {
    render(<Footer site={site} />)
    expect(screen.getByText('Projeto Liberdade')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument()
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/Footer.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement Footer**

`src/components/Footer.tsx`:

```tsx
import type { Site } from '../content/types'
import { Container } from './ui/Container'
import { SocialLinks } from './SocialLinks'

export function Footer({ site }: { site: Site }) {
  return (
    <footer
      data-testid="site-footer"
      className="bg-inverse-surface text-inverse-on-surface"
    >
      <Container className="flex flex-col gap-4 py-12 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-headline-sm">{site.name}</p>
        <SocialLinks links={site.social} />
      </Container>
    </footer>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/Footer.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.tsx src/components/Footer.test.tsx
git commit -m "feat: add Footer"
```

---

### Task 9: Header and Nav

**Files:**
- Create: `src/components/Nav.tsx`
- Create: `src/components/Header.tsx`
- Test: `src/components/Nav.test.tsx`

**Interfaces:**
- Consumes: `NavItem` from types (`{ slug; label; order; submenu?: NavItem[] }`); `Site`; `Container`.
- Produces: `Nav` `{ items: NavItem[] }`; `Header` `{ site: Site; navigation: NavItem[] }`, renders `<header data-testid="site-header">`.

- [ ] **Step 1: Write the failing test**

`src/components/Nav.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import type { NavItem } from '../content/types'
import { renderWithRouter } from '../test/render'
import { Nav } from './Nav'

const items: NavItem[] = [
  { slug: 'home', label: 'Home', order: 0 },
  {
    slug: 'servicos',
    label: 'Serviços',
    order: 2,
    submenu: [{ slug: 'equoterapia', label: 'Equoterapia', order: 1 }],
  },
]

describe('Nav', () => {
  it('links Home to "/" and sorts by order', () => {
    renderWithRouter(<Nav items={items} />)
    expect(screen.getAllByRole('link', { name: 'Home' })[0]).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('discloses a submenu on click', () => {
    renderWithRouter(<Nav items={items} />)
    const trigger = screen.getByRole('button', { name: 'Serviços' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getAllByRole('link', { name: 'Equoterapia' })[0],
    ).toHaveAttribute('href', '/servicos/equoterapia')
  })

  it('toggles the mobile menu', () => {
    renderWithRouter(<Nav items={items} />)
    const toggle = screen.getByRole('button', { name: 'Abrir menu' })
    fireEvent.click(toggle)
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/components/Nav.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement Nav and Header**

`src/components/Nav.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { NavItem } from '../content/types'

const byOrder = (a: NavItem, b: NavItem) => a.order - b.order
const topHref = (item: NavItem) => (item.slug === 'home' ? '/' : `/${item.slug}`)
const subHref = (parent: NavItem, child: NavItem) =>
  `/${parent.slug}/${child.slug}`

function Submenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false)
  const children = [...(item.submenu ?? [])].sort(byOrder)
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-on-surface hover:text-primary"
      >
        {item.label}
      </button>
      {open ? (
        <ul className="absolute left-0 top-full z-50 mt-2 min-w-48 rounded-lg bg-surface-container-lowest p-2 shadow-level2">
          {children.map((child) => (
            <li key={child.slug}>
              <Link
                to={subHref(item, child)}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-on-surface hover:bg-surface-container hover:text-primary"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function Nav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const sorted = [...items].sort(byOrder)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <nav aria-label="Principal" className="text-label-md">
      <ul className="hidden items-center gap-6 md:flex">
        {sorted.map((item) => (
          <li key={item.slug}>
            {item.submenu ? (
              <Submenu item={item} />
            ) : (
              <Link
                to={topHref(item)}
                className="text-on-surface hover:text-primary"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-on-surface md:hidden"
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
      </button>

      {open ? (
        <ul
          data-testid="mobile-menu"
          className="mt-4 flex flex-col gap-3 md:hidden"
        >
          {sorted.map((item) => (
            <li key={item.slug}>
              <Link
                to={topHref(item)}
                onClick={() => setOpen(false)}
                className="text-on-surface hover:text-primary"
              >
                {item.label}
              </Link>
              {item.submenu ? (
                <ul className="ml-4 mt-2 flex flex-col gap-2">
                  {[...item.submenu].sort(byOrder).map((child) => (
                    <li key={child.slug}>
                      <Link
                        to={subHref(item, child)}
                        onClick={() => setOpen(false)}
                        className="text-on-surface-variant hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  )
}
```

`src/components/Header.tsx`:

```tsx
import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { Nav } from './Nav'

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
      <Container className="flex items-center justify-between py-4">
        <span className="font-display text-headline-sm text-primary">
          {site.name}
        </span>
        <Nav items={navigation} />
      </Container>
    </header>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/components/Nav.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.tsx src/components/Header.tsx src/components/Nav.test.tsx
git commit -m "feat: add Header and Nav"
```

---

### Task 10: VideoEmbed

**Files:**
- Modify: `src/content/types.ts`
- Create: `src/components/VideoEmbed.tsx`
- Test: `src/components/VideoEmbed.test.tsx`

**Interfaces:**
- Produces: `Video` type `{ slug; title; order; url }`; `VideoEmbed` `{ video: Video }`.

- [ ] **Step 1: Add the `Video` type to `src/content/types.ts`**

Append:

```ts
export interface Video {
  slug: string
  title: string
  order: number
  url: string
}
```

- [ ] **Step 2: Write the failing test**

`src/components/VideoEmbed.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Video } from '../content/types'
import { VideoEmbed } from './VideoEmbed'

const video: Video = {
  slug: 'o-projeto-liberdade',
  title: 'O projeto liberdade',
  order: 1,
  url: 'https://www.youtube.com/embed/RcaxtQWPI_c',
}

describe('VideoEmbed', () => {
  it('renders a titled 16:9 iframe and caption', () => {
    render(<VideoEmbed video={video} />)
    const frame = screen.getByTitle('O projeto liberdade')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute('src', video.url)
    expect(screen.getByText('O projeto liberdade')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test -- src/components/VideoEmbed.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement VideoEmbed**

`src/components/VideoEmbed.tsx`:

```tsx
import type { Video } from '../content/types'

export function VideoEmbed({ video }: { video: Video }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="aspect-video overflow-hidden rounded-lg">
        <iframe
          src={video.url}
          title={video.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <figcaption className="text-label-md text-on-surface-variant">
        {video.title}
      </figcaption>
    </figure>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- src/components/VideoEmbed.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add src/content/types.ts src/components/VideoEmbed.tsx src/components/VideoEmbed.test.tsx
git commit -m "feat: add Video type and VideoEmbed"
```

---

### Task 11: Lightbox and Gallery

**Files:**
- Modify: `src/content/types.ts`
- Create: `src/components/Lightbox.tsx`
- Create: `src/components/Gallery.tsx`
- Test: `src/components/Gallery.test.tsx`

**Interfaces:**
- Produces: `Photo` `{ src; alt; caption? }`, `Album` `{ slug; title; cover: Photo; photos: Photo[] }`; `Lightbox` `{ photos: Photo[]; startIndex?: number; onClose: () => void }`; `Gallery` `{ albums: Album[] }`.

- [ ] **Step 1: Add `Photo` and `Album` to `src/content/types.ts`**

Append:

```ts
export interface Photo {
  src: string
  alt: string
  caption?: string
}

export interface Album {
  slug: string
  title: string
  cover: Photo
  photos: Photo[]
}
```

- [ ] **Step 2: Write the failing test**

`src/components/Gallery.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Album } from '../content/types'
import { Gallery } from './Gallery'

const albums: Album[] = [
  {
    slug: 'reabilitacao',
    title: 'Reabilitação',
    cover: { src: '/a.jpg', alt: 'a' },
    photos: [
      { src: '/a.jpg', alt: 'foto a' },
      { src: '/b.jpg', alt: 'foto b', caption: 'Legenda B' },
    ],
  },
]

describe('Gallery', () => {
  it('renders album titles and thumbnails', () => {
    render(<Gallery albums={albums} />)
    expect(screen.getByRole('heading', { name: 'Reabilitação' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'foto a' })).toBeInTheDocument()
  })

  it('opens a lightbox dialog when a thumbnail is clicked', () => {
    render(<Gallery albums={albums} />)
    fireEvent.click(screen.getByRole('img', { name: 'foto b' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Legenda B')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test -- src/components/Gallery.test.tsx`
Expected: FAIL (modules not found).

- [ ] **Step 4: Implement Lightbox and Gallery**

`src/components/Lightbox.tsx`:

```tsx
import { useEffect, useState } from 'react'
import type { Photo } from '../content/types'

interface LightboxProps {
  photos: Photo[]
  startIndex?: number
  onClose: () => void
}

export function Lightbox({ photos, startIndex = 0, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex)
  const count = photos.length
  const prev = () => setIndex((i) => (i - 1 + count) % count)
  const next = () => setIndex((i) => (i + 1) % count)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const photo = photos[index]
  if (!photo) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de fotos"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/90 p-4"
    >
      <figure className="max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <img src={photo.src} alt={photo.alt} className="mx-auto max-h-[80vh] rounded-lg" />
        {photo.caption ? (
          <figcaption className="mt-2 text-center text-label-md text-inverse-on-surface">
            {photo.caption}
          </figcaption>
        ) : null}
      </figure>
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute right-4 top-4 text-inverse-on-surface"
      >
        <span aria-hidden="true">✕</span>
      </button>
      <button
        type="button"
        aria-label="Anterior"
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
        className="absolute left-4 top-1/2 text-inverse-on-surface"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        aria-label="Próxima"
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
        className="absolute right-4 top-1/2 text-inverse-on-surface"
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  )
}
```

`src/components/Gallery.tsx`:

```tsx
import { useState } from 'react'
import type { Album, Photo } from '../content/types'
import { Lightbox } from './Lightbox'

interface OpenState {
  photos: Photo[]
  index: number
}

export function Gallery({ albums }: { albums: Album[] }) {
  const [open, setOpen] = useState<OpenState | null>(null)
  return (
    <div className="flex flex-col gap-12">
      {albums.map((album) => (
        <section key={album.slug} aria-labelledby={`album-${album.slug}`}>
          <h3
            id={`album-${album.slug}`}
            className="font-display text-headline-sm text-on-surface"
          >
            {album.title}
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {album.photos.map((photo, i) => (
              <li key={photo.src}>
                <button
                  type="button"
                  onClick={() => setOpen({ photos: album.photos, index: i })}
                  className="block w-full overflow-hidden rounded-lg"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {open ? (
        <Lightbox
          photos={open.photos}
          startIndex={open.index}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- src/components/Gallery.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/content/types.ts src/components/Lightbox.tsx src/components/Gallery.tsx src/components/Gallery.test.tsx
git commit -m "feat: add Photo/Album types, Lightbox, and Gallery"
```

---

### Task 12: Wire the site chrome into SiteLayout

**Files:**
- Modify: `src/layouts/SiteLayout.tsx`
- Test: `src/layouts/SiteLayout.test.tsx`

**Interfaces:**
- Consumes: `useContent`, `Header`, `Footer`, `Outlet`.
- Produces: `SiteLayout` that calls `useContent` and renders `Header`/`Footer` when content is present.

- [ ] **Step 1: Write the failing test**

`src/layouts/SiteLayout.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SiteLayout } from './SiteLayout'

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ index: true, Component: () => <p>página</p> }],
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
    expect(screen.getByText('página')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/layouts/SiteLayout.test.tsx`
Expected: FAIL (header comes from the current placeholder, not from content / testids may differ) or compile error once implemented. Confirm red before Step 3.

- [ ] **Step 3: Replace `src/layouts/SiteLayout.tsx`**

```tsx
import { Outlet } from 'react-router'
import { useContent } from '../content/useContent'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

/**
 * Container for the site chrome: calls useContent once and passes site +
 * navigation down as props. Presentational components never call the hook.
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
        <Outlet />
      </main>
      {content ? <Footer site={content.site} /> : null}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/layouts/SiteLayout.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/SiteLayout.tsx src/layouts/SiteLayout.test.tsx
git commit -m "feat: wire Header and Footer into SiteLayout via useContent"
```

---

### Task 13: `/estilo` styleguide route

**Files:**
- Create: `src/styleguide/StyleGuide.tsx`
- Modify: `src/routes.tsx`
- Test: `src/styleguide/StyleGuide.test.tsx`

**Interfaces:**
- Consumes: all `ui/` primitives, `BlockRenderer`, `Gallery`, `VideoEmbed`, `Chip`.
- Produces: `StyleGuide` component; a `/estilo` child route under `SiteLayout`.

- [ ] **Step 1: Write the failing test**

`src/styleguide/StyleGuide.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../test/render'
import { StyleGuide } from './StyleGuide'

describe('StyleGuide', () => {
  it('renders the styleguide heading and a sample button', () => {
    renderWithRouter(<StyleGuide />)
    expect(screen.getByRole('heading', { name: /Estilo/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Primário' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/styleguide/StyleGuide.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement StyleGuide**

`src/styleguide/StyleGuide.tsx`:

```tsx
import type { Album, Block, Video } from '../content/types'
import { Container } from '../components/ui/Container'
import { Section } from '../components/ui/Section'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Card } from '../components/ui/Card'
import { BlockRenderer } from '../components/blocks/BlockRenderer'
import { Gallery } from '../components/Gallery'
import { VideoEmbed } from '../components/VideoEmbed'

const swatches = [
  'bg-primary',
  'bg-primary-container',
  'bg-secondary',
  'bg-surface-container',
  'bg-error',
]

const typeScale = [
  ['text-display-lg', 'Display Large'],
  ['text-headline-md', 'Headline Medium'],
  ['text-headline-sm', 'Headline Small'],
  ['text-body-lg', 'Body Large'],
  ['text-body-md', 'Body Medium'],
  ['text-label-md', 'Label Medium'],
  ['text-label-sm', 'Label Small'],
]

const sampleBlocks: Block[] = [
  { type: 'heading', text: 'Bloco de exemplo' },
  { type: 'paragraph', text: 'Parágrafo de demonstração do BlockRenderer.' },
  { type: 'list', items: ['Item um', 'Item dois'] },
  { type: 'quote', text: 'Uma citação de exemplo.', author: 'Autor' },
]

const sampleAlbums: Album[] = [
  {
    slug: 'demo',
    title: 'Álbum de exemplo',
    cover: { src: 'https://placehold.co/400', alt: 'capa' },
    photos: [
      { src: 'https://placehold.co/400', alt: 'foto 1' },
      { src: 'https://placehold.co/400?text=2', alt: 'foto 2', caption: 'Legenda' },
    ],
  },
]

const sampleVideo: Video = {
  slug: 'demo',
  title: 'Vídeo de exemplo',
  order: 1,
  url: 'https://www.youtube.com/embed/RcaxtQWPI_c',
}

export function StyleGuide() {
  return (
    <Container className="py-12">
      <h1 className="font-display text-display-lg text-on-surface">Estilo</h1>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Cores</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {swatches.map((c) => (
            <div key={c} className={`h-16 w-16 rounded-lg ${c}`} title={c} />
          ))}
        </div>
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Tipografia</h2>
        {typeScale.map(([cls, label]) => (
          <p key={cls} className={`font-display ${cls}`}>
            {label}
          </p>
        ))}
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Botões e chips</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button compact>Compacto</Button>
          <Chip>Categoria</Chip>
          <Chip tone="secondary">Info</Chip>
        </div>
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Card + blocos</h2>
        <Card className="mt-4">
          <BlockRenderer blocks={sampleBlocks} />
        </Card>
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Galeria</h2>
        <div className="mt-4">
          <Gallery albums={sampleAlbums} />
        </div>
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Vídeo</h2>
        <div className="mt-4 max-w-xl">
          <VideoEmbed video={sampleVideo} />
        </div>
      </Section>
    </Container>
  )
}
```

- [ ] **Step 4: Add the route in `src/routes.tsx`**

Add the import under the existing imports:

```tsx
import { StyleGuide } from './styleguide/StyleGuide'
```

Add this child route to the `children` array (after the `index` route, before the `*` route):

```tsx
{ path: 'estilo', Component: StyleGuide },
```

- [ ] **Step 5: Run test + build to verify**

Run: `pnpm test -- src/styleguide/StyleGuide.test.tsx`
Expected: PASS (1 test).
Run: `pnpm build`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/styleguide/StyleGuide.tsx src/styleguide/StyleGuide.test.tsx src/routes.tsx
git commit -m "feat: add /estilo styleguide route"
```

---

### Task 14: DESIGN.md canonical copy, CLAUDE.md, and final verification

**Files:**
- Create: `docs/design/organic-freedom/DESIGN.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Copy DESIGN.md to its canonical home**

Run:
```bash
mkdir -p docs/design/organic-freedom
cp "docs/resources/stitch/stitch_backup_of_projeto_liberdade_website_redesign/organic_freedom/DESIGN.md" docs/design/organic-freedom/DESIGN.md
```

- [ ] **Step 2: Update `CLAUDE.md`**

Add a new section after the "Stack" section:

```markdown
## Design system ("Organic Freedom")

- Tokens live in `src/index.css` as a Tailwind v4 `@theme` block — the single
  source of truth. Reference: `docs/design/organic-freedom/DESIGN.md`.
- **Hybrid palette:** the full MD3 color set is imported verbatim; the brand
  layer adds `--color-cta` (#00aa5a vibrant, CTA fill), `--color-cta-hover` /
  `--color-cta-strong` / `--color-link` (#006d38 for hover, compact buttons, and
  small green text).
- **Primary buttons** use `#00aa5a` with a white label at `text-button`
  (≥18.66px/700) so white-on-green meets WCAG AA (large text, 3:1); compact
  buttons use `#006d38`.
- Fonts: Plus Jakarta Sans + Work Sans, self-hosted via `@fontsource` and
  imported in `src/main.tsx`.
- Components are viewable at the dev route **`/estilo`**.
```

Replace the **Structure** `src/` tree's `features`/`components`/`lib` lines with:

```markdown
  features/     # one folder per page (deferred)
  components/   # shared, prop-driven UI
    ui/                       # Button, Chip, Card, Container, Section
    blocks/                   # BlockRenderer + one renderer per Block.type
    Header.tsx Nav.tsx Footer.tsx SocialLinks.tsx Gallery.tsx Lightbox.tsx VideoEmbed.tsx
  styleguide/   # StyleGuide.tsx (dev-only, route /estilo)
  lib/          # cn() and small utils
```

Replace the **dependency rule** paragraph with:

```markdown
`features`, `components`, and `layouts` never import `content.json` or reference
Firebase. Containers (the routed `SiteLayout` and, later, page components) call
`useContent`; presentational components receive content via props only.
```

Update the **Phase map**: mark item 1 (design tokens) and item 2 (shared
components) as done; note pages (item 3) remain deferred pending sketches.

- [ ] **Step 3: Final verification — the whole suite is green**

Run: `pnpm test`
Expected: all test files PASS.
Run: `pnpm lint`
Expected: no errors.
Run: `pnpm build`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add docs/design/organic-freedom/DESIGN.md CLAUDE.md
git commit -m "docs: add DESIGN.md canonical copy and update CLAUDE.md for the design system"
```

---

## Self-Review

**Spec coverage:**
- §4 tokens (colors, brand layer, typography+fonts, radius, elevation, container) → Task 1. ✓
- §5.1 primitives (Button, Chip, Card, Container, Section) → Tasks 2–5. ✓
- §5.2 chrome (Header/Nav, Footer, SocialLinks) → Tasks 7–9. ✓
- §5.3 blocks (BlockRenderer + 5 renderers) → Task 6. ✓
- §5.4 Gallery/Lightbox/VideoEmbed → Tasks 10–11. ✓
- §5.5 types (Block, Photo, Album, Video) → Tasks 6, 10, 11. ✓
- §5.6 `/estilo` styleguide → Task 13. ✓
- §5 boundary rule (prop-driven; useContent only in SiteLayout) → Task 12. ✓
- §6 testing (colocated Vitest) → every task. ✓
- §7 DESIGN.md copy + CLAUDE.md → Task 14. ✓
- §8 green build/lint/test → Task 14 Step 3. ✓

**Deferred (out of scope, no task, per spec §2):** content pages, form controls, runtime content validation, Firebase, image migration.

**Type consistency:** `Block` (Task 6) consumed by BlockRenderer + StyleGuide; `Video` (Task 10) by VideoEmbed + StyleGuide; `Photo`/`Album` (Task 11) by Lightbox/Gallery + StyleGuide. `cn` (Task 2) used by all class-composing components. `renderWithRouter` (Task 2) used by Button, Nav, StyleGuide tests. Names match across tasks.
