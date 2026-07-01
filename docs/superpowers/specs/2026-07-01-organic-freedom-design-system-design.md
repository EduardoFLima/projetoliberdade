# Organic Freedom — Design System & Components Design Spec

**Date:** 2026-07-01
**Status:** Draft (design); pending user review before implementation planning
**Depends on:** `docs/superpowers/specs/2026-06-30-content-json-redesign-design.md` (content model)
**Source:** `docs/resources/stitch/stitch_backup_of_projeto_liberdade_website_redesign/organic_freedom/DESIGN.md` (Google Stitch export)

## 1. Purpose

Establish the **design-system layer** for the Projeto Liberdade front-end: design
tokens (Tailwind v4 `@theme`), fonts, and the set of reusable components the site
needs — built and unit-tested in isolation. This corresponds to phase-map items
**1 (design tokens)** and **2 (shared components)** in `CLAUDE.md`.

This spec deliberately **does not build any content pages** (home, historia,
servicos, momentos, contato). Page layout waits for the owner's sketches and is a
separate phase.

## 2. Scope

### In scope
- Design tokens in `src/index.css` via Tailwind v4 `@theme` (colors, typography,
  radius, elevation, layout helpers).
- Self-hosted fonts (Plus Jakarta Sans, Work Sans) via `@fontsource`.
- Component library ("only what the site needs" set): UI primitives, site chrome,
  content-block renderers, gallery/video.
- Tightening the `Block` discriminated union (and the media types the gallery uses)
  in `src/content/types.ts`.
- A dev-facing `/estilo` styleguide route to view and QA tokens + components.
- Canonical copy of `DESIGN.md` at `docs/design/organic-freedom/DESIGN.md`.
- `CLAUDE.md` updates.

### Out of scope
- Content pages / routes for home, historia, servicos (+ `/servicos/:slug`),
  momentos, contato — deferred to the pages phase (awaits sketches).
- Form inputs, checkboxes, radios, progress bars (no forms in the content model).
- Runtime content validation (the `validate_content.py` mirror) — stays deferred.
- Firebase RTDB repository.
- Migrating images from `docs/resources/` into the app; authoring final `alt`/captions.

## 3. Locked decisions

1. **Palette = hybrid.** Import the entire MD3 `colors:` frontmatter verbatim as
   the single source of truth, then add a thin brand/semantic layer on top. The
   vibrant green `#00aa5a` (frontmatter `primary-container`) is the CTA/brand-moment
   color; the darker `#006d38` (frontmatter `primary`) is used for hover/pressed and
   for small green text on light backgrounds.
2. **Component scope = only what the site needs.** No form controls.
3. **Primary button treatment.** Fill `#00aa5a` with a **white** label rendered at
   **≥18.66px / weight 700** (the WCAG "large text" threshold), which makes
   white-on-vibrant-green AA-compliant (3:1 for large text; measured 3.05:1). Hover
   darkens the fill to `#006d38` (white-on-`#006d38` ≈ 6.47:1). A compact primary
   button variant uses a `#006d38` fill (white passes at any size).
4. **Keep the `/estilo` styleguide route.**
5. **DESIGN.md canonical home** = `docs/design/organic-freedom/DESIGN.md` (the
   `stitch_backup_…` folder remains an untouched raw backup).
6. **Prop-driven components.** Every component in this layer is presentational and
   receives its data via props. `useContent` is called only at the container
   boundary (the routed `SiteLayout` now, page components later), which passes data
   down. This is stricter than — and compatible with — CLAUDE.md's dependency rule.

### Accessibility rationale (contrast, WCAG AA)

AA requires **4.5:1** for normal text, **3:1** for large text (≥24px, or ≥18.66px
if bold) and for UI components/borders.

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `#ffffff` | `#00aa5a` | 3.05:1 | primary button label — only compliant at ≥18.66px/700 (large) |
| `#ffffff` | `#006d38` | 6.47:1 | compact primary button, hover state |
| `#003518` | `#00aa5a` | 4.53:1 | reserve (tonal alt), not the chosen default |
| `#5656a3` | `#faf9f6` | 6.23:1 | secondary button text / links |

Consequence: the vibrant green is safe for large button labels, borders, focus
rings, icons, chip tints, and accents; **small green text uses `#006d38`, not
`#00aa5a`.**

## 4. Design tokens (`src/index.css`)

Tailwind v4, CSS-first. All tokens are declared in a single `@theme { … }` block
after `@import 'tailwindcss';`. Token → utility generation is automatic
(`--color-x` → `bg-x`/`text-x`/`border-x`, `--text-x` → `text-x`, etc.). The
namespace→utility mappings used below (`--color-*`, `--font-*`, `--text-*` with
`--…--line-height`/`--font-weight`/`--letter-spacing` suffixes, `--radius-*`,
`--shadow-*`, `--container-*`, and the `--spacing` multiplier) are verified against
the Tailwind v4 documentation.

### 4.1 Colors

Every key from the DESIGN.md `colors:` frontmatter is copied verbatim to
`--color-<key>` (e.g. `--color-surface: #faf9f6`, `--color-on-surface: #1a1c1a`,
`--color-primary: #006d38`, `--color-primary-container: #00aa5a`,
`--color-secondary: #5656a3`, `--color-outline: #6d7b6e`, … through the full MD3
set including the `*-fixed` roles). This yields utilities like `bg-surface`,
`text-on-surface`, `border-outline-variant`, `bg-primary-container`.

**Brand/semantic layer** (so components never hardcode hexes; the hybrid decision
lives in one place):

```css
--color-cta:          var(--color-primary-container); /* #00aa5a vibrant fill  */
--color-cta-hover:    var(--color-primary);           /* #006d38 hover/pressed */
--color-on-cta:       var(--color-on-primary);        /* #ffffff               */
--color-cta-strong:   var(--color-primary);           /* #006d38 compact fill  */
--color-link:         var(--color-primary);           /* #006d38 small green text/links */
```

### 4.2 Typography

Fonts self-hosted via `@fontsource/plus-jakarta-sans` and `@fontsource/work-sans`
(imported once in `src/main.tsx`), chosen over a CDN for the planned
`vite-react-ssg` prerender and offline dev. Weights: 400/500 (Work Sans body/labels),
600 (headlines/labels), 700 (display + primary button labels).

```css
--font-display: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
--font-sans:    'Work Sans', ui-sans-serif, system-ui, sans-serif;
```

Type scale as `--text-*` tokens with paired suffixes (size + line-height + weight +
letter-spacing), so each is a single utility (`text-display-lg`, `text-headline-md`,
`text-body-lg`, `text-label-sm`, …). Display size is fluid to honor the mobile
scale-down (48px → 36px) called out in DESIGN.md:

| Token | size | line-height | weight | tracking | family |
|---|---|---|---|---|---|
| `display-lg` | `clamp(2.25rem, 1.5rem + 3vw, 3rem)` | 1.17 | 700 | -0.02em | display |
| `headline-md` | 2rem (32) | 1.25 | 600 | — | display |
| `headline-sm` | 1.5rem (24) | 1.33 | 600 | — | display |
| `body-lg` | 1.125rem (18) | 1.56 | 400 | — | sans |
| `body-md` | 1rem (16) | 1.5 | 400 | — | sans |
| `label-md` | 0.875rem (14) | 1.43 | 600 | 0.01em | sans |
| `label-sm` | 0.75rem (12) | 1.33 | 500 | 0.04em | sans |

The primary-button label uses a dedicated ≥18.66px/700 style (see §5.1), distinct
from `label-md`.

### 4.3 Radius

Mapped onto v4's named radius scale — no reliance on the legacy bare `rounded`
/DEFAULT utility. This overrides Tailwind's default `--radius-md/lg/xl`; DESIGN.md's
intermediate 12px value is unused by any component and omitted.

```css
--radius-sm: 0.25rem;   /* 4px                                     */
--radius-md: 0.5rem;    /* 8px  — buttons, inputs                  */
--radius-lg: 1rem;      /* 16px — cards, containers                */
--radius-xl: 1.5rem;    /* 24px — featured banners, modals, quotes */
```

Components reference `rounded-md` (buttons/inputs), `rounded-lg` (cards),
`rounded-xl` (banners/pull-quotes), and `rounded-full` (chips).

### 4.4 Elevation

Secondary-tinted ambient shadows (DESIGN.md avoids harsh grays):

```css
--shadow-level1: 0 4px 20px rgb(86 86 163 / 0.04); /* cards/surfaces */
--shadow-level2: 0 8px 32px rgb(86 86 163 / 0.08); /* popovers/hover */
```

### 4.5 Layout & spacing

Tailwind v4 derives the numeric spacing scale from a single `--spacing` multiplier
(default `0.25rem`), so `p-2`=8px, `p-6`=24px, `p-12`=48px, `p-20`=80px — already
the 8px rhythm DESIGN.md specifies. No named spacing tokens are added (unnecessary;
the numeric scale already covers DESIGN.md's xs/base/sm/md/lg/xl steps).

The content width is tokenized as `--container-site: 90rem` (1440px), consumed by
the `Container` component (§5.1) via `max-w-site`, alongside responsive page padding
16px (mobile) → 64px (desktop) and 24px gutters.

## 5. Components

Files are small and single-responsibility. **Presentational & prop-driven
(non-negotiable):** every component in this layer receives the data it needs via
props and holds no data-source dependency. `useContent` is called only at the
container boundary — the routed `SiteLayout` and (later) the page components — which
passes data down as props. No component here imports `content.json`, calls
`useContent`, or references Firebase. This keeps primitives reusable and lets tests
pass plain props instead of mocking the content hook.

### 5.1 UI primitives — `src/components/ui/`

- **`Button`** — props: `variant: 'primary' | 'secondary'`, `size?: 'md' | 'lg'`,
  `compact?: boolean`, plus native button/anchor attributes; renders `<button>` or,
  when given an `href`/`to`, a router `<Link>`.
  - `primary`: fill `--color-cta`, label `--color-on-cta`, label style ≥18.66px/700,
    radius `rounded-md`; hover fill `--color-cta-hover`. `compact` → fill
    `--color-cta-strong` with `label-md` (white passes at any size).
  - `secondary`: transparent bg, 1px `--color-secondary` border, `--color-secondary`
    text, hover = 8% secondary tint bg.
- **`Chip`** — props: `tone?: 'primary' | 'secondary'`, `children`. Rounded-full
  pill, background = 10% tint of the tone via `color-mix`, `text-label-sm`.
- **`Card`** — props: `elevated?: boolean`, `as?`, `className`, `children`. Surface
  `--color-surface-container-lowest` (#ffffff), `--radius-lg`, `--shadow-level1`;
  `elevated`/hover → `--shadow-level2`.
- **`Container`** — max-width 1440px, `mx-auto`, responsive horizontal padding.
- **`Section`** — vertical rhythm (`lg`/`xl` spacing) creating DESIGN.md's
  "islands"; optional `tone` background.

### 5.2 Site chrome — `src/components/`

Prop-driven; the routed **`SiteLayout`** is the container that calls `useContent`
once and passes `site` + `navigation` down (rendering a minimal shell while loading
or on error).

- **`Header` + `Nav`** — props: `site: Site`, `navigation: NavItem[]`. Desktop:
  horizontal menu with dropdowns for the `servicos` and `momentos` submenus. Mobile:
  hamburger → drawer. A11y: `<nav>` landmark, `aria-expanded` on submenu triggers,
  keyboard navigation, focus trap in the mobile drawer.
- **`Footer`** — props: `site: Site`. Site name, `SocialLinks`, minimal contact
  summary.
- **`SocialLinks`** — props: `links: SocialLink[]`. Maps `network`
  (`facebook`/`instagram`) → inline SVG icon + external link.

### 5.3 Content blocks — `src/components/blocks/`

- **`BlockRenderer`** — props: `blocks: Block[]`. Switches on `Block.type` (typed as
  exhaustive) and renders the matching component:
  - **`Paragraph`** → `<p>` `text-body-lg`, `text-on-surface`.
  - **`Heading`** → `<h2>`/`<h3>` `text-headline-sm`, `font-display`.
  - **`List`** → `<ul>` with generous per-item spacing (no rules), `body-md`.
  - **`Image`** → `<figure>` with `<img>` `rounded-lg`; optional caption. Image `src`
    resolution to a real asset path is a pages-phase concern; the renderer takes
    `src` as given.
  - **`Quote`** → `<blockquote>` pull-quote, indigo accent, `--radius-xl`; optional
    `author`.
  Unknown/future types are a compile-time `never` (no runtime crash).

### 5.4 Gallery & video — `src/components/`

- **`Gallery` / `AlbumGrid`** — props: `albums: Album[]` (or a single album's
  `photos: Photo[]`). Responsive thumbnail grid; click opens the lightbox.
- **`Lightbox`** — full-screen photo viewer with prev/next, keyboard (arrows/esc),
  and `caption` when present. A11y: dialog role, focus trap, `esc` to close.
- **`VideoEmbed`** — props: `video: Video`. Responsive 16:9 YouTube iframe from
  `video.url` with an accessible title.

### 5.5 Types — `src/content/types.ts`

Replace the loose `Page` catch-all with the shapes the components consume:

```ts
export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'quote'; text: string; author?: string }

export interface Photo { src: string; alt: string; caption?: string }
export interface Album { slug: string; title: string; cover: Photo; photos: Photo[] }
export interface Video { slug: string; title: string; order: number; url: string }
```

`Page` keeps an index signature during scaffold but gains optional typed fields
(`body?: Block[]`, `sections?`, `photos?`, `videos?`) as needed by the components;
full per-page union typing stays a pages-phase task.

### 5.6 Styleguide — `src/styleguide/StyleGuide.tsx`, route `/estilo`

A dev-facing kitchen-sink page (not in `navigation`): color swatches, the type
scale, radius/elevation samples, and every component with all variants. Doubles as
living documentation and visual QA while there are no content pages. Added as a
child route in `src/routes.tsx` under `SiteLayout`.

## 6. Testing

Vitest + Testing Library, colocated `*.test.tsx`:

- **`Button`** — renders each variant/size; `compact` uses the strong fill;
  `href`/`to` renders an anchor/`Link`; `disabled` respected; accessible name.
- **`Chip`, `Card`, `Container`, `Section`** — render, variant classes, `as`
  polymorphism.
- **`BlockRenderer`** — each block type renders the correct element/role; exhaustive
  switch (type-level `never`); empty array renders nothing.
- **`Nav`** — renders items from a `navigation` prop (no hook mocking), submenu
  toggle + `aria-expanded`, mobile drawer open/close and focus behavior.
- **`SocialLinks`** — maps each `network` to the right icon + external link.
- **`Lightbox`** — opens/closes, keyboard nav, focus trap.

Token/visual verification is manual via `/estilo` (jsdom does not compute Tailwind);
Playwright visual specs stay deferred to the pages phase.

## 7. Documentation & CLAUDE.md updates

- Copy `DESIGN.md` → `docs/design/organic-freedom/DESIGN.md`.
- `CLAUDE.md`:
  - New **Design system** section: token location (`src/index.css` `@theme`), the
    hybrid palette rule, the primary-button accessibility rule, `@fontsource` fonts,
    and the `docs/design/organic-freedom/DESIGN.md` reference.
  - Expand **Structure** with `components/ui/`, `components/blocks/`, `styleguide/`,
    and the `/estilo` route.
  - Refine the **dependency rule** wording: containers (routed `SiteLayout` / pages)
    call `useContent`; presentational components receive content via props (still
    never importing `content.json` or referencing Firebase).
  - Phase map: mark **1 (tokens)** and **2 (shared components)** done/in-progress;
    pages (3) remain deferred pending sketches.

## 8. Deliverables

1. `src/index.css` with the full `@theme` token set + brand layer.
2. `@fontsource` deps installed and imported.
3. Components in `src/components/ui/`, `src/components/`, `src/components/blocks/`
   with colocated tests; `SiteLayout` updated to feed the chrome via `useContent`.
4. Tightened `src/content/types.ts` (`Block` union + media types).
5. `/estilo` styleguide route + component.
6. `docs/design/organic-freedom/DESIGN.md`.
7. Updated `CLAUDE.md`.
8. Green `pnpm build`, `pnpm lint`, `pnpm test`.
