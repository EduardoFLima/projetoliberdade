# Mobile Header + Slide-in Nav Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On mobile (`< md`), replace the downward-expanding header menu with a left-aligned burger that opens a left-sliding nav drawer, keeping the logo centered and the contact button as an icon-only CTA.

**Architecture:** `Header` owns the mobile top-bar grid layout and the drawer open/close state. A new prop-driven `MobileDrawer` renders the scrim + sliding panel (mirroring the existing `Lightbox` overlay conventions). `Nav` is reduced to desktop-only. `ContactButton` becomes responsive (icon-only on mobile). A new `CloseIcon` is added.

**Tech Stack:** TypeScript (strict), React 19, React Router v8 (`Link` from `react-router`), Tailwind CSS v4 (`@theme` tokens in `src/index.css`), Vitest + Testing Library, pnpm.

## Global Constraints

- Code style: no semicolons, single quotes, trailing commas (Prettier + ESLint flat config).
- Import `Link` from `react-router` (not `react-router-dom`).
- Styling only via Tailwind v4 utilities backed by the `@theme` tokens already in `src/index.css` (e.g. `bg-surface`, `text-on-surface`, `bg-inverse-surface`, `shadow-level2`, `outline-cta`). No new CSS files, no inline hex.
- Presentational components receive data via props only; never import `content.json` or Firebase (dependency rule).
- Focus-visible affordance on interactive elements: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta` (match existing components).
- Tests: Vitest, render router-aware UI with `renderWithRouter` from `src/test/render.tsx`.
- Verification commands: `pnpm test <file>` (single), `pnpm test` (all), `pnpm lint`, `pnpm build`.

---

### Task 1: `CloseIcon` (X) in the icon set

**Files:**
- Modify: `src/components/ui/icons.tsx` (add after `MenuIcon`, ~line 81)
- Test: `src/components/ui/icons.test.tsx`

**Interfaces:**
- Consumes: the existing `Svg` wrapper in `icons.tsx` (renders a 24×24 `aria-hidden` svg with `stroke="currentColor"`).
- Produces: `export function CloseIcon({ className }: { className?: string }): JSX.Element` — an X glyph, consumed by Task 3 (`MobileDrawer`).

- [ ] **Step 1: Add `CloseIcon` to the test's icon list (failing test)**

In `src/components/ui/icons.test.tsx`, add `CloseIcon` to both the import block and the `icons` array:

```tsx
import {
  ArrowForwardIcon,
  ChatIcon,
  CheckCircleIcon,
  CloseIcon,
  FavoriteIcon,
  FlagIcon,
  MailIcon,
  MapIcon,
  MapPinIcon,
  MenuIcon,
  ShareIcon,
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
      CloseIcon,
      CheckCircleIcon,
      MailIcon,
      ShareIcon,
      MapPinIcon,
      MapIcon,
    ]
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/components/ui/icons.test.tsx`
Expected: FAIL — `CloseIcon` is not exported / `undefined` is not a component.

- [ ] **Step 3: Implement `CloseIcon`**

In `src/components/ui/icons.tsx`, add after the `MenuIcon` function (after line 81):

```tsx
export function CloseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </Svg>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/components/ui/icons.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/icons.tsx src/components/ui/icons.test.tsx
git commit -m "feat: add CloseIcon to icon set"
```

---

### Task 2: `ContactButton` icon-only on mobile

**Files:**
- Modify: `src/components/ui/ContactButton.tsx`
- Test: `src/components/ui/ContactButton.test.tsx`

**Interfaces:**
- Consumes: `Button` (`to`, `pill`, `className`), `ChatIcon`, `cn`.
- Produces: unchanged public signature `ContactButton({ className }: { className?: string })`. The label text stays in the DOM (accessible name preserved) but is visually hidden below `md`. Consumed by Task 5 (`Header`).

Rationale: `Button`'s `to` branch renders a `<Link>` that does not forward `aria-label`, so we keep the accessible name by rendering the text with `sr-only md:not-sr-only` (visually hidden on mobile, visible on desktop) rather than removing it.

- [ ] **Step 1: Write the failing test**

Replace the body of `src/components/ui/ContactButton.test.tsx` with:

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

  it('keeps the label accessible but visually hidden on mobile', () => {
    renderWithRouter(<ContactButton />)
    const label = screen.getByText('Entre em contato')
    expect(label.getAttribute('class')).toContain('sr-only')
    expect(label.getAttribute('class')).toContain('md:not-sr-only')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/components/ui/ContactButton.test.tsx`
Expected: FAIL on the new case — text is not wrapped in an `sr-only md:not-sr-only` span yet.

- [ ] **Step 3: Implement the responsive label**

Replace `src/components/ui/ContactButton.tsx` with:

```tsx
import { cn } from '../../lib/cn'
import { Button } from './Button'
import { ChatIcon } from './icons'

export function ContactButton({ className }: { className?: string }) {
  return (
    <Button to="/contato" pill className={cn('items-center gap-1', className)}>
      <ChatIcon className="h-4 w-4" />
      <span className="sr-only md:not-sr-only">Entre em contato</span>
    </Button>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/components/ui/ContactButton.test.tsx`
Expected: PASS (all three cases).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ContactButton.tsx src/components/ui/ContactButton.test.tsx
git commit -m "feat: make ContactButton icon-only on mobile"
```

---

### Task 3: `MobileDrawer` component

**Files:**
- Create: `src/components/MobileDrawer.tsx`
- Test: `src/components/MobileDrawer.test.tsx`

**Interfaces:**
- Consumes: `NavItem` (`src/content/types`), `CloseIcon` (Task 1), `cn` (`src/lib/cn`), `Link` (`react-router`).
- Produces: `export function MobileDrawer({ items, open, onClose }: { items: NavItem[]; open: boolean; onClose: () => void }): JSX.Element`. Panel carries `id="mobile-drawer"`, `data-testid="mobile-drawer"`, `role="dialog"`, `aria-label="Menu"`. Consumed by Task 5 (`Header`).

Behavior: slides in from the left; always mounted (for the transition) but the root is `aria-hidden` and the panel is `inert` when closed, so `getByRole('dialog')` only matches when open. Closes on ESC, scrim click, close button, and any nav-link click. Locks body scroll and focuses the close button while open. `motion-reduce:` disables the transition.

- [ ] **Step 1: Write the failing test**

Create `src/components/MobileDrawer.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import type { NavItem } from '../content/types'
import { renderWithRouter } from '../test/render'
import { MobileDrawer } from './MobileDrawer'

const items: NavItem[] = [
  { slug: 'home', label: 'Home', order: 0 },
  {
    slug: 'momentos',
    label: 'Momentos',
    order: 3,
    submenu: [
      { slug: 'videos', label: 'Vídeos', order: 1 },
      { slug: 'fotos', label: 'Fotos', order: 2 },
    ],
  },
  { slug: 'contato', label: 'Contato', order: 4 },
]

describe('MobileDrawer', () => {
  it('is hidden from the a11y tree when closed', () => {
    renderWithRouter(<MobileDrawer items={items} open={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders top-level and submenu links when open', () => {
    renderWithRouter(<MobileDrawer items={items} open onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Contato' })).toHaveAttribute(
      'href',
      '/contato',
    )
    expect(screen.getByRole('link', { name: 'Fotos' })).toHaveAttribute(
      'href',
      '/momentos/fotos',
    )
    expect(screen.getByRole('link', { name: 'Vídeos' })).toHaveAttribute(
      'href',
      '/momentos/videos',
    )
  })

  it('calls onClose on Escape, scrim click, close button, and link click', () => {
    const onClose = vi.fn()
    renderWithRouter(<MobileDrawer items={items} open onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('drawer-scrim'))
    expect(onClose).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(3)

    fireEvent.click(screen.getByRole('link', { name: 'Home' }))
    expect(onClose).toHaveBeenCalledTimes(4)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/components/MobileDrawer.test.tsx`
Expected: FAIL — module `./MobileDrawer` does not exist.

- [ ] **Step 3: Implement `MobileDrawer`**

Create `src/components/MobileDrawer.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { NavItem } from '../content/types'
import { cn } from '../lib/cn'
import { CloseIcon } from './ui/icons'

const byOrder = (a: NavItem, b: NavItem) => a.order - b.order
const topHref = (item: NavItem) => (item.slug === 'home' ? '/' : `/${item.slug}`)
const subHref = (parent: NavItem, child: NavItem) =>
  `/${parent.slug}/${child.slug}`

interface MobileDrawerProps {
  items: NavItem[]
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ items, open, onClose }: MobileDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const sorted = [...items].sort(byOrder)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 md:hidden',
        open ? '' : 'pointer-events-none',
      )}
    >
      <div
        data-testid="drawer-scrim"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-inverse-surface/50 transition-opacity duration-300 motion-reduce:transition-none',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        id="mobile-drawer"
        data-testid="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={cn(
          'absolute inset-y-0 left-0 flex h-full w-4/5 max-w-xs flex-col bg-surface shadow-level2 transition-transform duration-300 motion-reduce:transition-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex justify-end p-4">
          <button
            ref={closeRef}
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-sm text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-4 pb-8 text-label-md">
          {sorted.map((item) => (
            <div key={item.slug}>
              <Link
                to={topHref(item)}
                onClick={onClose}
                className="block rounded-sm py-2 text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              >
                {item.label}
              </Link>
              {item.submenu ? (
                <div className="ml-4 flex flex-col gap-1">
                  {[...item.submenu].sort(byOrder).map((child) => (
                    <Link
                      key={child.slug}
                      to={subHref(item, child)}
                      onClick={onClose}
                      className="block rounded-sm py-1 text-on-surface-variant hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
```

Note: `inert={!open}` uses React 19's boolean `inert` support. If the type-check in Task 5's `pnpm build` flags `inert`, change it to `inert={!open ? true : undefined}`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/components/MobileDrawer.test.tsx`
Expected: PASS (all three cases). If `queryByRole('dialog')` still finds the closed dialog, confirm `aria-hidden={!open}` is on the outer wrapper.

- [ ] **Step 5: Commit**

```bash
git add src/components/MobileDrawer.tsx src/components/MobileDrawer.test.tsx
git commit -m "feat: add left-sliding MobileDrawer overlay"
```

---

### Task 4: Reduce `Nav` to desktop-only

**Files:**
- Modify: `src/components/Nav.tsx`
- Test: `src/components/Nav.test.tsx`

**Interfaces:**
- Consumes: `NavItem`, `Link`.
- Produces: unchanged signature `Nav({ items }: { items: NavItem[] })`, but renders only the desktop horizontal list (`hidden ... md:flex`) with hover submenus. No burger, no `data-testid="mobile-menu"`. Consumed by Task 5 (`Header`).

- [ ] **Step 1: Update the test (remove the mobile-menu case)**

Replace `src/components/Nav.test.tsx` with:

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

  it('discloses a submenu on hover', () => {
    renderWithRouter(<Nav items={items} />)
    const trigger = screen.getByRole('link', { name: 'Serviços' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.mouseEnter(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getAllByRole('link', { name: 'Equoterapia' })[0],
    ).toHaveAttribute('href', '/servicos/equoterapia')
  })

  it('does not render a mobile burger toggle', () => {
    renderWithRouter(<Nav items={items} />)
    expect(screen.queryByRole('button', { name: 'Abrir menu' })).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/components/Nav.test.tsx`
Expected: FAIL on `does not render a mobile burger toggle` — the current `Nav` still renders the `Abrir menu` button.

- [ ] **Step 3: Strip the mobile branch from `Nav`**

Replace `src/components/Nav.tsx` with:

```tsx
import { useState } from 'react'
import { Link } from 'react-router'
import type { NavItem } from '../content/types'

const byOrder = (a: NavItem, b: NavItem) => a.order - b.order
const topHref = (item: NavItem) =>
  item.slug === 'home' ? '/' : `/${item.slug}`
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
      <Link
        to={topHref(item)}
        aria-haspopup="true"
        aria-expanded={open}
        className="rounded-sm text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      >
        {item.label}
      </Link>
      {open ? (
        <div className="absolute left-0 top-full z-50 min-w-48 pt-2">
          <ul className="rounded-lg bg-surface-container-lowest p-2 shadow-level2">
            {children.map((child) => (
              <li key={child.slug}>
                <Link
                  to={subHref(item, child)}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-on-surface hover:bg-surface-container hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function Nav({ items }: { items: NavItem[] }) {
  const sorted = [...items].sort(byOrder)
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
                className="rounded-sm text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/components/Nav.test.tsx`
Expected: PASS (all three cases).

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.tsx src/components/Nav.test.tsx
git commit -m "refactor: reduce Nav to desktop-only navigation"
```

---

### Task 5: Wire the burger, centered logo, and drawer into `Header`

**Files:**
- Modify: `src/components/Header.tsx`
- Test: `src/components/Header.test.tsx`

**Interfaces:**
- Consumes: `Nav` (Task 4), `ContactButton` (Task 2), `MobileDrawer` (Task 3), `MenuIcon`, `Container`, `Link`, `NavItem`, `Site`.
- Produces: unchanged signature `Header({ site, navigation }: { site: Site; navigation: NavItem[] })`. Mobile bar = grid `[burger | logo | contact-icon]`; the burger opens the drawer and gets focus back when it closes.

- [ ] **Step 1: Extend the test with burger → drawer behavior**

Replace `src/components/Header.test.tsx` with:

```tsx
import { describe, expect, it } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
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
      screen.getAllByRole('link', { name: /Entre em contato/ })[0],
    ).toHaveAttribute('href', '/contato')
  })

  it('opens the drawer when the burger is clicked', () => {
    renderWithRouter(<Header site={site} navigation={navigation} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/components/Header.test.tsx`
Expected: FAIL on `opens the drawer when the burger is clicked` — no `Abrir menu` button in the current `Header`.

- [ ] **Step 3: Implement the mobile header layout + drawer wiring**

Replace `src/components/Header.tsx` with:

```tsx
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { Nav } from './Nav'
import { ContactButton } from './ui/ContactButton'
import { MobileDrawer } from './MobileDrawer'
import { MenuIcon } from './ui/icons'

export function Header({
  site,
  navigation,
}: {
  site: Site
  navigation: NavItem[]
}) {
  const [open, setOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)

  const closeDrawer = () => {
    setOpen(false)
    burgerRef.current?.focus()
  }

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur"
    >
      <Container className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 py-4 md:flex md:justify-between">
        <button
          ref={burgerRef}
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          onClick={() => setOpen(true)}
          className="justify-self-start rounded-sm text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta md:hidden"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <Link
          to="/"
          aria-label={site.name}
          className="flex items-center justify-self-center"
        >
          <img
            src={site.logo}
            alt={site.name}
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-6 justify-self-end">
          <Nav items={navigation} />
          <ContactButton />
        </div>
      </Container>
      <MobileDrawer items={navigation} open={open} onClose={closeDrawer} />
    </header>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/components/Header.test.tsx`
Expected: PASS (all three cases).

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/Header.test.tsx
git commit -m "feat: mobile header burger opens left nav drawer"
```

---

### Task 6: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full unit suite**

Run: `pnpm test`
Expected: PASS. Pay attention to `icons`, `ContactButton`, `MobileDrawer`, `Nav`, `Header`.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Type-check + build**

Run: `pnpm build`
Expected: succeeds. If TypeScript rejects `inert={!open}`, change it in `src/components/MobileDrawer.tsx` to `inert={!open ? true : undefined}` and re-run.

- [ ] **Step 4: Manual check in the browser (mobile viewport)**

Run: `pnpm dev`, open http://localhost:5173 at a mobile width (< 768px) via devtools. Verify:
- Top bar shows burger (left), centered logo, contact icon (right); no "Entre em contato" text.
- Tapping the burger slides a panel in from the left over a scrim; no logo inside it.
- Links present: Home, História, Serviços, Momentos with Fotos/Vídeos indented beneath, Contato.
- Closes via: the ✕ button, tapping the scrim, pressing Escape, and tapping any link (which also navigates).
- Body does not scroll while the drawer is open; focus lands on ✕ when it opens.
- At desktop width (≥ 768px) the header is unchanged: logo left, horizontal nav + full contact button right, no burger.

- [ ] **Step 5: Commit any build-fix tweaks (if made)**

```bash
git add -A
git commit -m "chore: verification fixups for mobile nav drawer"
```

(Skip if steps 1–3 passed with no changes.)

---

## Self-Review Notes

- **Spec coverage:** drawer-from-left (Task 3); logo centered in bar (Task 5 grid); no logo in drawer (Task 3); submenu always-expanded/indented (Task 3); Contato as plain link in drawer (Task 3); contact icon-only in header (Task 2); dismissal via ESC/scrim/close/link (Task 3); scroll-lock + focus-to-close + return-focus-to-burger (Tasks 3 & 5); `prefers-reduced-motion` (Task 3 `motion-reduce:`); `CloseIcon` (Task 1); `Nav` desktop-only + `mobile-menu` removed (Task 4); test updates across all files; build/lint (Task 6). All spec sections map to a task.
- **Placeholders:** none — every code/test step contains full content.
- **Type consistency:** `MobileDrawer` props `{ items, open, onClose }` are produced in Task 3 and consumed verbatim in Task 5; `CloseIcon` produced in Task 1, consumed in Task 3; `ContactButton()` signature unchanged; helper names `byOrder`/`topHref`/`subHref` match their existing usage.
