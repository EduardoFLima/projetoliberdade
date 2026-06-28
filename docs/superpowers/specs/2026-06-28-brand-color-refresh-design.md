# Brand Color Refresh — Design

**Date:** 2026-06-28
**Status:** Approved

## Problem

The site looks clean but **pallid**. Two causes:

1. The theme's `--color-primary-*` scale is a generic Tailwind green (`#22c55e` family), not the actual brand green `#00AA5A`. The `secondary` (yellow) and `accent` (blue) scales are defined but essentially unused, and **no purple exists anywhere**.
2. Components lean heavily on flat `neutral-*` grays and pure `white`, so very little brand color reaches the page.

## Goal

A **gentle warm-up**: keep the airy, mostly-light layout, but
- retune the palette to the real brand colors — green `#00AA5A` (lead) and purple `#3A3985` (accent), and
- apply color where it counts (buttons, links, headings) plus faintly-tinted neutrals,

without heavy colored section fills.

## Color roles

- **Green `#00AA5A` — lead.** Primary buttons, links, primary calls to action, heading accent bars.
- **Purple `#3A3985` — accent.** Section heading text, nav/secondary hovers, the Hero secondary button, small accents.

## Part 1 — Palette retune (`src/index.css`)

Replace the existing `@theme` color blocks. Anchor each scale on the brand hex.

### Primary — Green (brand `#00AA5A` at 500)

```
--color-primary-50:  #e8f8f0;
--color-primary-100: #c5edd8;
--color-primary-200: #8fdcb4;
--color-primary-300: #4ec888;
--color-primary-400: #14b56a;
--color-primary-500: #00aa5a;  /* brand */
--color-primary-600: #009350;
--color-primary-700: #007a43;
--color-primary-800: #066138;
--color-primary-900: #07502f;
```

### Secondary — Purple (brand `#3A3985` at 700)

```
--color-secondary-50:  #eeeef6;
--color-secondary-100: #d6d6ec;
--color-secondary-200: #b3b2d8;
--color-secondary-300: #8b8ac0;
--color-secondary-400: #6361a4;
--color-secondary-500: #4b4a93;
--color-secondary-600: #41408b;
--color-secondary-700: #3a3985;  /* brand */
--color-secondary-800: #302f6b;
--color-secondary-900: #262550;
```

### Neutral — faint cool tint (was pure gray)

```
--color-neutral-50:  #f8f8fb;
--color-neutral-100: #f1f1f6;
--color-neutral-200: #e3e3ec;
--color-neutral-300: #cfcfdb;
--color-neutral-400: #9d9dae;
--color-neutral-500: #6e6e80;
--color-neutral-600: #545465;
--color-neutral-700: #3f3f4c;
--color-neutral-800: #2a2a33;
--color-neutral-900: #18181f;
```

### Removals

- Remove the unused `--color-accent-*` (blue) scale.
- Remove the old `--color-secondary-*` yellow values (replaced by purple above).

The rest of `@theme` (typography, spacing, radius, shadows) is unchanged.

## Part 2 — Component touch-ups

Gentle, consistent with the existing structure. No new heavy backgrounds.

- **Section headings** (`H2`, currently `text-neutral-900`): switch to **purple `text-secondary-700`** with a short **green underline/accent bar** (e.g. a `primary-500` bottom border or small bar element under the heading). Both brand colors appear together. Apply across the section components that render headings (`Historia`, `MissaoVisaoValores`, `Servicos`, `Hippussuit`, `Midia`, `Contato`).
- **Hero secondary button** ("Entre em Contato"): give it a **purple** treatment (e.g. `bg-secondary-700/hover` or purple border) so the accent color is visible alongside the green primary button.
- **Nav hovers** (`Header`): hover/active link color shifts to purple `secondary-700` (currently `primary-600`), so green stays for actions and purple reads as the navigational accent. Mobile menu hover tint follows suit.
- **Hero gradient overlay**: keep the darkening overlay but warm it slightly toward brand tones instead of pure black (e.g. blend a faint green/purple), preserving text contrast.
- **Normalize raw Tailwind colors**: replace the stray `text-green-600`, `bg-green-50`, `bg-green-100` usages with the brand `primary-*` tokens for consistency.
- **Backgrounds**: sections currently on `neutral-50`/`neutral-100` keep those classes — they now render on the faintly cool-tinted neutrals automatically, giving a subtle lift with no markup changes.

## Out of scope

- No layout/structure changes.
- No new section background fills or gradient-heavy "vivid" treatment.
- No typography or spacing changes.

## Accessibility

- Body text stays on `neutral-700`–`neutral-900` over light backgrounds — contrast preserved.
- Purple heading text (`secondary-700` `#3a3985`) and green buttons (`primary-500/600` with white text) must meet WCAG AA against their backgrounds; verify white-on-green and purple-on-white contrast during implementation.

## Verification

- `npm run test` passes (component tests still match; update any test asserting specific old color classes).
- `npm run build` succeeds.
- Visual check via `npm run dev`: green primary buttons/links, purple section headings with green accent bar, purple nav hovers, subtly tinted neutral backgrounds — no flat all-white/all-gray sections.
