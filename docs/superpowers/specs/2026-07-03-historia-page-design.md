# História page — design

**Date:** 2026-07-03
**Status:** Approved (brainstorm), ready for implementation plan
**Source mockup:** Stitch screen "About Us - Expanded Hero Height"
(`projects/1965738895267000298/screens/296752e668314d9290b7e6f317ca10bc`)

## Goal

Build the `/historia` ("História") page from the mockup, **reusing the existing
section components** wherever possible. The only genuinely new UI is a
lightweight page hero (which will also serve Serviços/Momentos/Contato later).
The narrative and Missão/Visão/Valores sections reuse components already built
for the homepage redesign.

## Mockup breakdown

The mockup stacks three sections between the shared Header and Footer:

1. **Page hero** — full-width background photo at `opacity-80` under a *light*
   top-to-bottom gradient (`from-surface-container/60 to-surface/90`), with
   **dark** centered text: an `h1` ("Our Story") and a one-line subtitle. No
   logo, no CTA. This is distinct from the homepage `Hero` (dark indigo
   overlay, logo, CTA button, `min-h-[65vh]`).
2. **History narrative** — two-column: heading + paragraphs on the left, a
   founders-with-horse photo on the right. Maps to the existing
   `HistoriaSection`.
3. **Mission, Vision & Values** — three cards. Maps to the existing
   `MissionVisionValues`.

## Content mapping

All copy comes from `content.json` → `pages.historia` (English keys,
Portuguese values). No UI component hardcodes content — the page container
reads content via selectors and passes it down as props.

| Section        | Source                                           | Notes |
|----------------|--------------------------------------------------|-------|
| Page hero      | new `pages.historia.hero` `{ title, subtitle }`  | `title: "Nossa História"`, subtitle authored below. Background image is the downloaded mockup image (not from content). |
| Narrative      | `pages.historia.body`                            | all `paragraph` blocks + first `image` block + the closing `quote` block |
| MVV            | `pages.historia.sections[0]` (`missao-visao-valores`) | reuse existing `selectMvv` logic; renders 3 cards, Valores lists its 5 real items |

The narrative heading is **omitted** on this page — the hero already states
"Nossa História", so repeating a "História" heading above the paragraphs would
be redundant.

### New content: `pages.historia.hero`

`content.json` has no historia hero subtitle today. Add:

```json
"hero": {
  "title": "Nossa História",
  "subtitle": "Terapia e reabilitação equestre desde 2006. Uma jornada de dedicação, cuidado e liberdade."
}
```

(Portuguese rendering of the mockup's English hero line. The hero *image* is
referenced by the component as `/images/historia-hero.jpg`, not stored in
content — consistent with how the homepage hero image is handled.)

## Components

### New: `src/components/sections/PageHero.tsx`

The one new component. A lightweight, reusable page hero.

- **Props:** `{ image: string; alt: string; title: string; subtitle: string }`
- **Markup:** a `<header>`/`<section>` with:
  - background image div at `opacity-80`, `bg-cover`, `bg-center` (or
    `center 20%` to match the mockup);
  - a light gradient overlay `bg-gradient-to-b from-surface-container/60
    to-surface/90`;
  - centered content: `h1` at `font-display text-display-lg text-on-surface`,
    subtitle at `font-sans text-body-lg text-on-surface-variant`.
- **Accessibility:** the background image conveys mood only; expose its
  description via `role="img"` + `aria-label={alt}` on the image div (mirrors
  the homepage `Hero` pattern), decorative gradient is `aria-hidden`.
- **No** logo, CTA, or fixed `min-h-[65vh]` (the mockup hero is shorter /
  content-sized with generous vertical padding).
- Reusable later for Serviços / Momentos / Contato page heroes.

### Changed: `src/components/sections/HistoriaSection.tsx`

Two small, **backward-compatible** changes (the homepage keeps working
unchanged because it passes `heading` and omits `quote`):

1. Make `heading` **optional**. When omitted, render no `SectionHeading` and
   drop the associated top spacing.
2. Add optional `quote?: { text: string; author?: string }`. When present,
   render it below the paragraphs (inside the left text column) using the
   **existing `Quote` block component** (`src/components/blocks/Quote.tsx`) as a
   pullquote.

On the História page the section is used with: all paragraphs, the founders
image, the quote, **no heading, no CTA**.

### Reused as-is

- `MissionVisionValues` (`tone="muted"`), fed by `selectMvv`.
- `Quote` block component for the pullquote.
- `Section`, `Container`, `Button` UI primitives, `Header`, `Footer`.

## Container & routing

Mirrors the homepage feature structure.

- **`src/routes.tsx`** — add `{ path: 'historia', Component: HistoriaPage }` as
  a child of `SiteLayout` (before the `*` catch-all).
- **`src/features/historia/HistoriaPage.tsx`** — reads `content` via
  `useOutletContext<SiteContent>()`, composes:
  `PageHero` → `HistoriaSection` (heading omitted, paragraphs + image + quote)
  → `MissionVisionValues`.
- **`src/features/historia/historiaSelectors.ts`** — pure selectors reusing the
  existing block helpers:
  - `selectHistoriaHero(content)` → `{ title, subtitle, image, alt }`
    (title/subtitle from `pages.historia.hero`; image is the constant
    `/images/historia-hero.jpg` with an authored PT alt).
  - `selectHistoriaNarrative(content)` → `{ paragraphs, image, quote }` — **all**
    paragraph blocks (unlike the homepage excerpt, which slices to 2), the first
    image block, and the first quote block (mapped to `{ text, author }`).
  - MVV: reuse `selectMvv` (import from `home/homeSelectors` or lift the shared
    logic — see "Boundaries" below).

The dependency rule holds: the feature container calls no content adapter
directly; it reads the router `Outlet` context that `SiteLayout` provides.
Presentational components receive props only.

## Assets

Download the mockup's hero background image (Stitch AI image, sunset
equotherapy scene) into `public/images/historia-hero.jpg` and reference it as
`/images/historia-hero.jpg`. The founders narrative image reuses the existing
`/images/historia.jpg`.

## Boundaries / small cleanup

`selectMvv`, `selectHistoria`, and the block helpers (`paragraphs`,
`firstParagraph`) already live in `home/homeSelectors.ts`, but they read from
`pages.historia` — they are historia concerns that happen to live in the home
feature because the homepage renders a historia excerpt. Rather than
cross-import feature-to-feature, lift the shared block helpers and the
historia/MVV selectors into **`src/content/selectors.ts`** (shared, content-layer
adjacent, imported by both feature containers). Move only the shared block
helpers (`paragraphs`, `firstParagraph`) and the historia/MVV selectors that
both features need; `home/homeSelectors.ts` and `historiaSelectors.ts` re-export
or import from there. Don't refactor unrelated selectors (`selectServices` stays
in the home feature). Constraints: **no feature-to-feature import** and **no
duplicated block helpers**.

## Testing

- **Vitest**
  - `PageHero` — renders title, subtitle, and the image with its `aria-label`.
  - `HistoriaSection` — heading-omitted case renders no heading; quote case
    renders the pullquote; existing homepage-style props still render heading +
    CTA.
  - `historiaSelectors` — hero returns title/subtitle/image/alt; narrative
    returns all paragraphs + image + quote from a fixture.
- **Playwright** — `/historia` renders: the hero (title text visible), the
  narrative (a founders image + paragraph text), and the three MVV cards.

## Out of scope

- Serviços (`/servicos` + `/servicos/:slug`), Momentos, Contato pages (later
  Phase 3 items) — though `PageHero` is built to serve them.
- SEO prerender / per-page `<title>` (Phase 4).
- Firebase RTDB wiring (Phase 5).
- Full runtime content-type validation.
