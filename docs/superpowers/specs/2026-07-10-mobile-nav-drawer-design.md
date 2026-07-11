# Mobile Header + Slide-in Nav Drawer — Design

**Date:** 2026-07-10
**Status:** Approved (design)
**Scope:** Mobile-only (`< md`) header navigation. Desktop header/nav unchanged. Page content out of scope.

## 1. Problem & Goal

Based on the Google Stitch mockup "Projeto Liberdade — Homepage (Mobile)", the mobile header
navigation is being redesigned. Today the mobile menu is a burger on the **right** that expands a
list **downward inside the header flow**. The new behavior:

- The burger moves to the **left** of the header bar.
- Tapping it opens a **side drawer** that slides in from the **left** (a "sidebar" menu), instead of
  the downward-expanding menu.
- The logo is **not** shown inside the drawer.

Only the header menu is in scope. The rest of the mockup (the page body) is explicitly out of scope.

## 2. Current State

- **`src/components/Header.tsx`** — sticky top bar. `Container` uses `flex items-center
  justify-between`. Left = logo link. Right cluster = `<Nav>` + `<ContactButton className="hidden
  md:inline-flex">` (CTA hidden on mobile today).
- **`src/components/Nav.tsx`** — three responsibilities in one file:
  - Desktop (`md:flex`): horizontal `<ul>` with hover-disclosed submenus (`Submenu`).
  - Mobile: a burger button (`☰` / `✕`) on the right that toggles an `open` state.
  - Mobile menu: a `<ul data-testid="mobile-menu">` that renders **below** in header flow
    (`mt-4 flex-col`), with submenu items nested + indented. ESC closes it.
- **`src/components/ui/ContactButton.tsx`** — `<Button to="/contato" pill>` with `<ChatIcon>` +
  text "Entre em contato".
- **`src/components/ui/icons.tsx`** — has `MenuIcon` (burger) and `ChatIcon`. **No close/X icon.**
- **`src/components/Lightbox.tsx`** — the codebase's existing overlay pattern to mirror:
  `role="dialog"` + `aria-modal="true"` + `aria-label`, `fixed inset-0 z-50`, scrim via a tinted
  full-screen backdrop, scrim-click closes (panel uses `stopPropagation`), ESC via a `keydown`
  listener, and a close button with `aria-label="Fechar"`.
- **Nav items** (`content.json`): Home, História, Serviços, Momentos (submenu: Vídeos `order 1`,
  Fotos `order 2`), Contato. Only Momentos has a submenu.
- Header is `z-40`; Lightbox is `z-50`.
- No e2e spec references `mobile-menu` (safe to restructure).

## 3. Approved Decisions

| Decision | Choice |
| --- | --- |
| Drawer slide-in side | From the **left** (matches burger position) |
| Logo in mobile top bar | **Kept, centered** (burger left, logo center, contact icon right) |
| Logo in drawer | **Not shown** |
| Momentos submenu in drawer | **Always expanded / indented** (no accordion toggle) |
| Contato in drawer | Plain **nav link** (no CTA button inside the drawer) |
| Contact button in header (mobile) | **Kept, icon-only** (no "Entre em contato" text on mobile) |
| Drawer width | ~`80vw`, capped ~`320px` (`w-4/5 max-w-xs`) |
| Dismissal | ESC, scrim click, close (✕) button, and clicking any nav link |
| Extras | Body scroll-lock while open; focus moves to close button on open, returns to burger on close; `prefers-reduced-motion` disables the slide |

## 4. Architecture

Responsibility split (keeps each file single-purpose, consistent with existing conventions):

- **`Header.tsx`** — owns the mobile top-bar layout **and** the drawer open/close state.
- **`Nav.tsx`** — becomes **desktop-only** horizontal nav (hover submenus). Mobile burger + mobile
  menu removed.
- **`MobileDrawer.tsx`** (new) — presentational overlay (scrim + sliding panel). Prop-driven.
- **`ContactButton.tsx`** — responsive: icon always visible, text label collapses on mobile.

### 4.1 Header mobile layout

Three zones with the logo truly centered:

```
[ ☰ burger ]        [ logo ]        [ 💬 contact ]
   left              center            right
```

- `Container` className: `grid grid-cols-[1fr_auto_1fr] items-center py-4 md:flex
  md:justify-between md:gap-6` (grid on mobile, flex on desktop).
- Children, in DOM order:
  1. **Burger button** — `md:hidden`, `aria-label` toggles between `"Abrir menu"` / `"Fechar menu"`,
     `aria-expanded={open}`, `aria-controls` referencing the drawer. Renders `<MenuIcon>`. Left cell.
  2. **Logo link** — always visible. Center cell (`justify-self-center` on mobile). On desktop flex
     it becomes the left-most item.
  3. **Right cluster** — `flex items-center gap-6`, `justify-self-end` on mobile. Contains the
     desktop `<Nav>` (`hidden md:flex`) and the `<ContactButton>`.

On desktop the burger is `display:none`, leaving two flex children (logo, cluster) with
`justify-between` — identical to today's layout.

### 4.2 ContactButton (icon-only on mobile)

- Always render `<ChatIcon>`.
- Wrap the text in `<span className="hidden md:inline">Entre em contato</span>` so it collapses on
  mobile.
- Add `aria-label="Entre em contato"` on the button so the icon-only state keeps an accessible name
  (and the existing `getByRole('link', { name: /Entre em contato/ })` tests still pass).
- Header no longer hides it on mobile (`className="hidden md:inline-flex"` is dropped).

### 4.3 MobileDrawer.tsx

Props: `{ items: NavItem[]; open: boolean; onClose: () => void }`.

Structure (mirrors `Lightbox`):

- Root: `fixed inset-0 z-50`, `md:hidden`. Toggles `pointer-events-none` + `invisible` when closed.
- **Scrim**: full-screen tinted backdrop (`bg-inverse-surface/50` or similar), `onClick={onClose}`,
  fades via `opacity` transition.
- **Panel**: `role="dialog"` `aria-modal="true"` `aria-label="Menu"`, absolutely positioned on the
  left, `w-4/5 max-w-xs h-full bg-surface shadow-level2`, `transition-transform` between
  `-translate-x-full` (closed) and `translate-x-0` (open). `onClick` stops propagation so taps
  inside don't close.
- **Close button**: top of panel, `aria-label="Fechar"`, renders a new `CloseIcon` (X).
- **No logo** inside the panel.
- **Nav list**: items sorted by `order`. Each top-level item is a `<Link>` (Home → `/`, others →
  `/${slug}`) that calls `onClose` on click. Momentos renders its submenu (sorted by `order`:
  Vídeos, Fotos) as an indented `<ul>` beneath it, each child linking to `/${parent}/${child}` and
  calling `onClose`. Contato is a plain link like the rest.
- **Behavior** (via `useEffect`, gated on `open`):
  - `keydown` Escape → `onClose`.
  - Body scroll-lock: set `document.body.style.overflow = 'hidden'` while open; restore on
    close/unmount.
  - Focus: move focus to the close button when it opens; restore focus to the previously focused
    element (the burger) on close.
  - `prefers-reduced-motion: reduce` → no slide transition (instant show/hide).

The panel carries `data-testid="mobile-drawer"` for test targeting (the old `mobile-menu` testid on
the downward menu is removed along with it).

### 4.4 icons.tsx

Add a `CloseIcon` (X) following the existing `IconProps` + `<Icon>` wrapper pattern used by the
other icons in the file.

### 4.5 Nav.tsx (desktop-only)

Remove: the `open` state, the burger `<button>`, the ESC effect, and the `data-testid="mobile-menu"`
block. Keep: the `md:flex` horizontal `<ul>` and the `Submenu` hover component. The outer `<nav>`
can drop the mobile branch entirely.

## 5. Testing (TDD: RED → GREEN → REFACTOR)

- **`MobileDrawer.test.tsx`** (new):
  - When `open`, renders top-level nav links with correct hrefs (Home → `/`).
  - Renders Momentos' submenu links (Fotos → `/momentos/fotos`, Vídeos → `/momentos/videos`)
    indented and visible (always-expanded).
  - Renders Contato as a link to `/contato`.
  - `onClose` fires on: Escape keydown, scrim click, close-button click, and nav-link click.
- **`Header.test.tsx`** (extend): clicking the burger (`Abrir menu`) reveals the drawer; keep the
  existing logo + contact-link assertions.
- **`Nav.test.tsx`** (update): remove the "toggles the mobile menu" test; keep the Home-link and
  submenu-hover tests.
- **`ContactButton.test.tsx`**: name-match assertions still hold; optionally assert the label span
  carries `hidden md:inline`.
- **`icons.test.tsx`**: add `CloseIcon` to the render smoke test.
- **E2E**: no existing spec references `mobile-menu`, so no breakage. A dedicated drawer e2e spec is
  out of scope for this task unless requested.

## 6. Non-goals / YAGNI

- No full focus-trap implementation (initial-focus + restore-focus only); a nav drawer with
  link-click-to-close and ESC is sufficient at the codebase's current maturity.
- No animation library — CSS transitions only.
- No changes to desktop navigation, submenu behavior, or the page body.
- No new content model fields; the drawer consumes the existing `NavItem[]`.

## 7. Files Touched

| File | Change |
| --- | --- |
| `src/components/Header.tsx` | Mobile grid layout; owns drawer state; renders burger + `<MobileDrawer>` |
| `src/components/Nav.tsx` | Reduce to desktop-only nav |
| `src/components/MobileDrawer.tsx` | **New** — slide-in drawer overlay |
| `src/components/ui/ContactButton.tsx` | Icon-only on mobile; responsive text; `aria-label` |
| `src/components/ui/icons.tsx` | **New** `CloseIcon` |
| `src/components/MobileDrawer.test.tsx` | **New** |
| `src/components/Header.test.tsx` | Extend with burger-opens-drawer |
| `src/components/Nav.test.tsx` | Remove mobile-menu test |
| `src/components/ui/icons.test.tsx` | Add `CloseIcon` |
