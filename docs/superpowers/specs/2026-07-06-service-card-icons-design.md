# Design — Service Card Icons

**Date:** 2026-07-06
**Status:** Approved (design), pending implementation plan
**Author:** Claude (brainstorming session)

## Goal

Add a distinctive icon to each service card on the Serviços page (`/servicos`) and
the home page featured-services grid, matching the "Projeto Liberdade – Services"
screen in the Google Stitch project. Icons must follow the codebase's own
hand-drawn inline-SVG house style (not Material Symbols, which Stitch used) and
respect the project's data-source dependency rule.

## Context

- `ServicesSection` (`src/components/sections/ServicesSection.tsx`) is shared by
  **both** the home featured-services grid and the `/servicos` page, so icons
  added here appear in both places automatically.
- Icons in this repo are hand-drawn inline SVGs in
  `src/components/ui/icons.tsx` (24×24 viewBox, `stroke="currentColor"`,
  `strokeWidth="2"`, rounded caps/joins, `aria-hidden="true"`). Stitch's
  Material Symbols choices (`prescriptions`, `toys`, `sports_score`, `pets`,
  `pool`, `psychology`) are only a reference for *which* service maps to *what
  idea* — we draw our own, with better-fitting concepts.
- Service content lives in `src/content/content.json` under
  `pages.servicos.sections[]`. The section shape is read loosely by the
  selectors (`slug`, `title`, `order`, `body`).

## Decisions

1. **Content-driven icon** — content names the icon via a stable string key; the
   presentational layer owns the drawing. (Chosen over a code-only slug→icon map.)
2. **Equitação Adaptada** icon = horseshoe + accessibility mark (a real 8th card
   not in the original request).
3. **Badge treatment** = icon in a soft rounded-square badge above the title,
   with the tint **alternating green / purple by card position** for visual
   rhythm.

## The icon set

Each service section in `content.json` gains an optional `"icon": "<key>"`
string. Keys are library-agnostic identifiers, not component names:

| Service (slug)                 | `icon` key       | Concept                                             |
| ------------------------------ | ---------------- | --------------------------------------------------- |
| `equoterapia`                  | `horse-therapy`  | Horse head with a heart — therapy + horse           |
| `equitacao-classica`           | `riding-helmet`  | Equestrian riding helmet                            |
| `equitacao-ludica`             | `horseshoe`      | Horseshoe                                           |
| `equitacao-adaptada`           | `adapted-riding` | Horseshoe + accessibility mark                      |
| `pet-terapia`                  | `paw`            | Dog paw print                                       |
| `hidroterapia`                 | `swimmer`        | Person swimming                                     |
| `reabilitacao-neurofuncional`  | `neuro`          | Head with a neural pulse line — brain / neuro       |

`icon` is **optional**. A missing or unknown key falls back to a generic
activity/sparkle icon so a card never renders broken.

> The `hippussuit` section (featured, rendered by its own `HippussuitSection`)
> is excluded from the services grid and does not need an `icon` key.

## Architecture

### Content model
- `src/content/content.json`: add `"icon": "<key>"` to each of the 7
  non-hippussuit service sections listed above.
- No change to `src/content/types.ts` is strictly required (`Page` is loose),
  but the `ServiceSection` interface in the selectors gains `icon?: string`.

### Icon components + dispatcher (`src/components/ui/icons.tsx`)
- New inline-SVG components in the existing house style, one per concept:
  `HorseTherapyIcon`, `RidingHelmetIcon`, `HorseshoeIcon`, `AdaptedRidingIcon`,
  `PawIcon`, `SwimmerIcon`, `NeuroIcon`, and a generic fallback
  (`ServiceDefaultIcon`).
- A `ServiceIcon` dispatcher component: `({ name, className }) => ReactNode`
  maps the string key → the matching SVG component, falling back to
  `ServiceDefaultIcon` on unknown/missing key. This keeps `content.json` free of
  JSX while honoring the dependency rule (content names an icon; the
  presentational layer draws it).

### Data flow
- `ServiceCardData` (`ServicesSection.tsx`) gains `icon?: string`.
- `src/features/home/homeSelectors.ts` and
  `src/features/servicos/servicosSelectors.ts`: read `s.icon` and pass it into
  each `ServiceCardData`. The `ServiceSection` interface gains `icon?: string`.

### Rendering (`ServicesSection.tsx`)
- `ServicesSection` passes each card's grid `index` to `ServiceCard`.
- `ServiceCard` renders a rounded-square badge above the title containing
  `<ServiceIcon name={icon} />`, then the existing title / excerpt / "Ver mais".
- **Alternating tint by index:**
  - Even index → **green**: badge `bg-primary-container/15`, icon `text-cta`
    (`#00aa5a`).
  - Odd index → **purple**: badge `bg-secondary-container/40`, icon
    `text-secondary` (`#5656a3`).
- Badge sizing: ~48×48 rounded (`rounded-xl` or `rounded-lg`) with the 24×24
  icon centered; spacing above the title consistent with the card's existing
  padding rhythm. Exact classes finalized during implementation against the
  Stitch reference.

## Visual verification

SVG path geometry is drawn and judged **rendered**, not as raw path data:
- Screenshot `/servicos` and the style guide route `/estilo` during
  implementation to confirm each icon reads clearly at badge size and the
  green/purple alternation looks balanced.

## Testing

- **Vitest**
  - Each new icon component renders an `<svg>` and is `aria-hidden="true"`.
  - `ServiceIcon` renders the correct component per key and falls back to the
    default on an unknown/missing key.
  - `ServiceCard` renders the badge, includes the icon, and applies the correct
    alternating tone class for even vs. odd index.
  - `homeSelectors` and `servicosSelectors` carry `icon` through into
    `ServiceCardData`.
- **Playwright**
  - `/servicos` shows an icon badge on each service card.

## Out of scope

- No changes to the Hippussuit featured section.
- No new content beyond the `icon` keys (titles, copy, order unchanged).
- No icon-picker tooling or CMS concerns (content is still the bundled snapshot).
