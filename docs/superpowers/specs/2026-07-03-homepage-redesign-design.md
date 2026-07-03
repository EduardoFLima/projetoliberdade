# Homepage Redesign — Design

**Date:** 2026-07-03
**Status:** Approved (design); pending spec review
**Source:** Stitch screen "Projeto Liberdade - Homepage Redesign"
(`projects/1965738895267000298/screens/ba60df964d2e4c83864e43981186ab72`)

## Goal

Implement the redesigned homepage in the app, reusing the existing "Organic
Freedom" design system and components. Build the page as a composition of
**reusable, prop-driven section components** so that História, Missão/Visão/
Valores, and Serviços can be reused on their own pages later. Only the homepage
is in scope.

## Non-goals (explicit)

- Other Stitch screens (Historia, Serviços, Momentos, Contato pages).
- Full migration of `docs/resources/` images (only the two images the home
  needs are migrated now).
- SEO/prerender (Phase 4), Firebase (Phase 5).
- Full tightening of all content types / runtime validation (Phase 3) — only
  the fields the homepage consumes are typed now.

## Key decisions (locked with the user)

1. **Content source:** Compose home from **canonical page content** (single
   source of truth), not duplicated home copy. Section components take props.
2. **Hero:** Single static background image + indigo overlay (matches mockup).
   The existing 14-image `hero.images` carousel is removed.
3. **Featured services on home:** `equoterapia`, `equitacao-ludica`,
   `equitacao-adaptada` (data-driven, ordered list on the home page).
4. **Header & Footer:** Align to the mockup.
5. **Design tokens:** The mockup's tokens are identical to `src/index.css`
   `@theme`; reuse the app theme, ignore the mockup's inline Tailwind CDN config.
6. **Icons:** Inline SVGs (the project's `SocialLinks` convention), not the
   mockup's Material Symbols CDN/variable font.
7. **Copy:** Canonical Portuguese `content.json` copy is authoritative. The
   mockup's differing Visão/Valores placeholder text is discarded. Nav/footer
   use the real PT labels, not the mockup's English ones.

## Architecture

### The dependency rule (unchanged)

`components`, `layouts`, and `features` never import `content.json` or reference
Firebase. `SiteLayout` (container) calls `useContent`; the page reads content
from the router `Outlet` context; presentational section components receive
content via **props only**.

### Content loading — single fetch via Outlet context

`useContent` fetches per component mount with no shared cache. Today
`SiteLayout` and `PlaceholderPage` each fetch. To avoid a double fetch and a
double loading state:

- `SiteLayout` continues to call `useContent`. Today it renders `<Outlet />`
  unconditionally; it changes to render the outlet **only when content is
  loaded**: `{content ? <Outlet context={content} /> : null}`, keeping the
  loading/error paragraphs above it in `<main>`.
- `HomePage` reads it with `useOutletContext<SiteContent>()` instead of calling
  `useContent` again.

Because the outlet is gated on non-null content, `HomePage` (and any future
page container) can assume non-null `SiteContent` from context. The `/estilo`
and 404 routes now also render only after content loads, which is immediate for
the bundled JSON snapshot.

### Composition (data flow)

`HomePage` derives each section's props from canonical content:

| Section | Source | Notes |
|---|---|---|
| Hero | new `pages.home.hero` | image, title, subtitle; CTAs → `/servicos`, `/contato`; logo overlay = `site.logo` |
| História | `pages.historia` | first `image` block + first 2 `paragraph` blocks; "Conheça nossa história" → `/historia` |
| Missão/Visão/Valores | `pages.historia.sections['missao-visao-valores'].body` | component splits blocks on each `heading` into 3 cards; Valores renders its real `list`; title→icon |
| Serviços | `pages.home.featuredServices` → resolved against `pages.servicos.sections` | each card: title + first-paragraph excerpt; card link → `/servicos/:slug`; "Ver mais" link |

## Components

New folder `src/components/sections/` for reusable, prop-driven page sections.
All are presentational (props only) so the dedicated pages can reuse them later
with fuller props.

### `sections/Hero.tsx`
Props: `{ image: string; alt: string; title: string; subtitle: string; logo: string; primaryCta: {label, to}; secondaryCta: {label, to} }`.
Full-bleed background image, `bg-secondary/80 mix-blend-multiply` overlay,
centered logo (on translucent white), `h1` title, subtitle, two CTA pills.
`min-h-[65vh]`. Uses `Button` for CTAs (see CTA shape below).

### `sections/HistoriaSection.tsx`
Props: `{ heading: string; paragraphs: string[]; image?: {src, alt}; cta?: {label, to} }`.
Two-column grid (text + rounded image with `shadow-level1`). On home:
2-paragraph excerpt + "Conheça nossa história" CTA. Reusable on `/historia`
later with all paragraphs and no CTA.

### `sections/MissionVisionValues.tsx`
Props: `{ heading: string; body: Block[] }` (the raw MVV section body).
Derives cards by walking `body`: each `heading` block starts a new card; the
following `paragraph`/`list` blocks are that card's content. Maps card title →
icon (`Missão`→flag, `Visão`→visibility, `Valores`→favorite; fallback icon for
unknown titles). Renders a 3-up card grid (`Card`) with icon circle, title, and
content (paragraph or bulleted list). Reusable on `/historia`.

### `sections/ServicesSection.tsx`
Props: `{ heading: string; intro?: string; services: Array<{ slug, title, excerpt, to }> }`.
Intro paragraph + responsive card grid (`md:grid-cols-2 lg:grid-cols-3`). Each
card: title, excerpt, "Ver mais →" link to `to`. On home: the 3 featured
services. Reusable on `/servicos` with the full list.

### `sections/SectionHeading.tsx`
Shared heading used by História, MVV, and Serviços: centered `h2` in
`text-secondary` + a green underline accent bar (`w-16 h-1 bg-primary
rounded-full`). Optional intro paragraph slot.

### `ui/icons.tsx`
Small inline-SVG icon components: `FlagIcon`, `VisibilityIcon`, `FavoriteIcon`,
`ArrowForwardIcon`, `ChatIcon`, `MenuIcon`. `currentColor` fill/stroke,
`aria-hidden`, sized via className. Matches the inline-SVG approach already in
`SocialLinks.tsx`. No new dependency.

### `Header.tsx` (changed)
- Logo image (`site.logo`) replacing the text wordmark.
- Existing `Nav` (real PT labels, submenus, mobile behavior) unchanged.
- Persistent "Entre em contato" primary pill CTA (with `ChatIcon`) → `/contato`,
  shown on `md+` (mirrors mockup; mobile keeps the hamburger).
- Sticky behavior retained.

### `Footer.tsx` (changed)
Restyle to the mockup's light footer: `bg-surface-container`, `rounded-t-xl`.
Brand name (`site.name`) + a nav-link row derived from `navigation` (real PT
labels) + real `SocialLinks`. The mockup's "Privacy Policy" / "Terms of
Service" links are dropped (no such pages/content).

### `features/home/HomePage.tsx` (new)
Container. Reads `SiteContent` from `useOutletContext`, derives section props,
renders `Hero`, `HistoriaSection`, `MissionVisionValues`, `ServicesSection` in
order, alternating `Section` tone (`surface` / `muted`) to match the mockup's
banding.

## CTA shape

The mockup renders primary CTAs (header, hero) as **rounded-full pills**;
DESIGN.md's default button radius is 8px. Decision: render these CTAs as pills
to match the approved visual, achieved by passing `className="rounded-full …"`
to the existing `Button` (no change to `Button`'s default). Deliberate,
localized divergence from the 8px default; easy to revert.

## Content model changes (`content.json` + `types.ts`)

`pages.home` becomes:

```jsonc
"home": {
  "slug": "home",
  "title": "Home",
  "hero": {
    "image": "/images/hero.jpg",
    "alt": "Criança sorrindo durante a montaria terapêutica, conduzida por profissional",
    "title": "Reabilitação e Equoterapia",
    "subtitle": "Promovendo qualidade de vida e desenvolvimento biopsicossocial através da relação com o cavalo."
  },
  "featuredServices": ["equoterapia", "equitacao-ludica", "equitacao-adaptada"]
}
```

`hero.images` is removed. `types.ts` adds only what home consumes:

```ts
export interface HeroContent {
  image: string
  alt: string
  title: string
  subtitle: string
}
export interface HomePage extends Page {
  hero: HeroContent
  featuredServices: string[]
}
```

(`Page` stays loose; the home page is narrowed via a typed accessor/cast in the
container. Full typing of historia/servicos sections is deferred to Phase 3;
the home container reads those sections through small local helper types.)

## Images

Migrate exactly two images into `public/images/` (served at `/images/...`):

- `hero.jpg` — a suitable landscape hero photo from `docs/resources/hero/`.
- `historia.jpg` — founders/history photo from
  `docs/resources/fotos/historia/` (e.g. `hist_andre_karina.jpg`).

`site.logo` for the header/hero: use the existing `docs/resources/logo.png`
migrated to `public/images/logo.png`, and update `site.logo` to `/images/logo.png`.
Bulk image migration remains deferred.

## Routing

`routes.tsx`: the index route Component changes from `PlaceholderPage` to
`HomePage`. `PlaceholderPage` is removed (or left unused; removed to avoid dead
code). `/estilo` and the 404 route are unchanged.

## Testing

**Vitest (colocated `*.test.tsx`):**
- `Hero`: renders title/subtitle/logo alt and both CTAs with correct `to`.
- `HistoriaSection`: renders provided paragraphs + image; renders CTA when given.
- `MissionVisionValues`: splits a representative MVV `body` into 3 cards; Valores
  card renders a `<ul>` from the `list` block; correct icons per title.
- `ServicesSection`: renders one card per service, correct `to` links and order.
- `HomePage`: composes all four sections; featured services appear in the
  configured order; reads from Outlet context (test via a router wrapper).
- `Header`: renders the "Entre em contato" CTA linking to `/contato`.
- `Footer`: renders nav links (PT) + social; no Privacy/Terms links.
- `SiteLayout`: existing test updated to assert content is provided to `Outlet`.

**Playwright e2e (`tests/e2e/`):**
- Home renders Hero, História, Missão/Visão/Valores, and Serviços sections.
- Hero primary CTA navigates to `/servicos`; secondary CTA to `/contato`.
- A service card "Ver mais" navigates to `/servicos/:slug`.

## Proposed structure changes (for CLAUDE.md awareness)

- New `src/components/sections/` folder (reusable page sections), alongside the
  existing `components/ui/` and `components/blocks/`.
- New `src/features/home/` page container (activates the previously-deferred
  `features/` convention).
- `SiteLayout` now provides content via `Outlet` context (page containers read
  context instead of calling `useContent` directly).
