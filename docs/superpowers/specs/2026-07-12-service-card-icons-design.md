# Service Card Icons — Design

**Date:** 2026-07-12
**Status:** Approved (design), pending spec review
**Supersedes:** the abandoned 2026-07-06 hand-drawn-SVG attempt (icons were authored blind as path data and scrapped for looking bad). This design sources real assets and validates them visually before wiring.

## Summary

Add a line-art icon to every service card. Icons render in a design-token color inside a token-colored circular badge; badges alternate green/purple by card position. The same card component (`ServicesSection` → `ServiceCard`) is used by both the Serviços page and the home page's featured services, so icons appear in both.

## Goals

- Each service card shows an icon above its title.
- All seven icons read as **one visual family**: a single line-art register, one token color per card.
- Colors come **exclusively from design tokens** — no baked-in PNG colors.
- **No new runtime dependency** and no new icon library/stack.
- **Content-driven**: the icon is chosen by an `icon` key in `content.json` and resolved in the presentational layer, honoring the dependency rule.

## Non-goals

- Redrawing icons from scratch (this is exactly what failed before).
- Icons anywhere other than service cards.
- Changing service copy or the card layout beyond adding the icon slot.

## Icon inventory & mapping

Seven services (the `hippussuit` section is excluded from the grid). Slugs are from `src/content/content.json`.

| Service slug | Icon source | Render mechanism |
|---|---|---|
| `equoterapia` | `equine-therapy.png` (line-art) | CSS-masked PNG |
| `equitacao-classica` | `classical-equitation.png` (line-art) | CSS-masked PNG |
| `equitacao-ludica` | `playful-riding.png` (line-art, updated 2026-07-12) | CSS-masked PNG |
| `equitacao-adaptada` | `adaptive-equitation.png` (line-art) | CSS-masked PNG |
| `pet-terapia` | Material Symbols **`pets`** (outlined) | inline SVG |
| `hidroterapia` | Material Symbols **`pool`** (outlined) | inline SVG |
| `reabilitacao-neurofuncional` | Material Symbols **`psychology`** (outlined) | inline SVG |

Source PNGs live in `docs/resources/icons/`. Material Symbols are Apache-2.0 licensed; their path data is embedded directly (no dependency).

The three Material glyph choices (`pets` / `pool` / `psychology`) must be visually confirmed against the mockup glyphs during the preview gate.

## Rendering approach

Two mechanisms, one visual result. Both are driven by a single token color per card.

1. **Inline SVG (Material outlined)** — the three simple glyphs. Sourced as Apache-2.0 Material Symbols outlined path data, embedded as small React SVG components. `fill`/`stroke` = `currentColor`, so the color is set by a token on the parent.

2. **CSS-masked PNG** — the four line-art illustrations. Each source PNG (dark strokes on a pale baked circle) is preprocessed into a **transparent alpha mask** (circle removed; strokes → opaque). Rendered as a `<span>` with `mask-image: url(...)` + `background-color: <token>`, so the token color paints through the stroke shapes.

### Asset preprocessing

The four illustration PNGs are converted into transparent masks committed to `public/icons/` (e.g. `equine-therapy.mask.png`). Steps, using ImageMagick (a manual/build-time step, **not** a runtime dependency):

- Derive alpha from luminance (dark strokes → opaque, pale background → transparent).
- Trim and remove the baked circle.
- Normalize each to a square canvas with consistent padding so all glyphs optically align at the same size.

The three Material glyphs need no preprocessing (vector).

## Badge & color

- The card draws a circular badge (fixed diameter, e.g. ~56px, full radius), with the icon centered inside (target glyph box ~24–28px; tuned in preview).
- **Alternate by index**: even → green, odd → purple.
- Colors are derived purely from existing tokens (pale tint background + full-strength stroke), matching the mockup's pale-circle / dark-stroke look:
  - **Green badge**: background `--color-primary` at low opacity; glyph `--color-primary` (#006d38).
  - **Purple badge**: background `--color-secondary` at low opacity (or `--color-secondary-fixed` #e2dfff); glyph `--color-on-secondary-container` (#3d3c88) / `--color-secondary` (#5656a3).
- No new hex values are introduced; exact opacity/token pairing is finalized against contrast in the preview.

## Component design

- **`ServiceIcon`** — a new presentational component (in `src/components/`). Props: `{ icon: string; index: number }`. It maps the icon key to the correct renderer (inline SVG vs. masked `<span>`) and applies the badge color by index parity. Pure and prop-driven; imports no content.
- **`ServiceCardData`** (in `ServicesSection.tsx`) gains `icon: string` (the icon key).
- **`ServiceCard`** renders `<ServiceIcon icon={service.icon} index={i} />` above the title. `ServicesSection` passes the card index through.
- **Selectors** (`selectServicesGrid`, `selectServices`) read `section.icon` from content and pass it through into `ServiceCardData`.

## Content model

- Add `"icon": "<key>"` to each service section in `content.json` (key = stable icon name, e.g. `"equine-therapy"`, `"pets"`).
- Extend the local `ServiceSection` interface in `servicosSelectors.ts` (and `homeSelectors.ts` as needed) with an optional `icon?: string`.

## Dependency-rule compliance

`content.json` holds only the icon **key** (a string). The key → asset/SVG mapping lives entirely inside the presentational `ServiceIcon`. Components never import `content.json`; selectors pass the string through. ✓

## Testing (TDD)

- **Unit (Vitest + Testing Library):**
  - Selectors include the `icon` key in `ServiceCardData`.
  - `ServiceIcon` renders the correct element for a given key (inline SVG vs. masked span).
  - Badge color alternates by index parity.
- **Visual gate (manual, non-negotiable):** a static preview rendering all seven badges together (throwaway page or a `/estilo` addition) is screenshotted and **approved by the user before any content wiring**.

## Rollout order (visual-first — per the prior lesson)

1. Preprocess the 4 masks; gather the 3 Material outlined SVGs.
2. Build `ServiceIcon` + a preview of all seven badges → screenshot → **user approves**.
3. Only then: wire `content.json` icon keys, selectors, the `ServiceCard` slot, and tests.

## Risks / open items

- Stroke-weight variance between the AI-generated illustrations may still show after masking. The preview confirms; if it looks off, adjust per-icon scale/padding.
- The four source PNGs are untracked in the user's working copy; they must be copied into the working branch (and committed) as part of implementation.
- Green glyph on a pale-green badge must clear contrast; verified in the preview.
