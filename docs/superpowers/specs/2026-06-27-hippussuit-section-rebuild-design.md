# Hippussuit Section Rebuild — Design

**Date:** 2026-06-27
**Status:** Approved
**Component:** `src/components/Hippussuit.jsx`

## Problem

`Hippussuit.jsx` renders only `value.txts.txt` (the first text field) of each `pN`
block in `websiteFallback.json → hippussuit`. The rest of the section's content —
roughly 80% of it — never reaches the page:

| Block | Rendered today | Dropped |
|-------|----------------|---------|
| `p1`  | intro paragraph (`txt`) | `txt2` (what the HippusSuit *is*), `txt3` (what it *does*) |
| `p2`  | heading text only | **14-item list** of motor benefits (`ul`) |
| `p3`  | heading text only | **5-item list** of behavioral benefits (`ul`) |
| `p4`  | one paragraph (`txt`) | `txt2` (conclusion paragraph) |
| `p5`  | "Desenvolvido por:" only | **4-person credits list** (`ul`) |

Additionally, the section image is loaded from a Firebase Storage URL that does not
render. A local mocked image is supplied at
`public/hippussuit/mocked_hippussuit_image.png`.

## Goal

Render **all** of the `hippussuit` data, following its natural narrative, using the
existing design tokens and a bundled feature image.

## Out of scope

- No JSON reshaping.
- No changes to other sections.
- No real product photo — the mock stands in until a real one is supplied.
- **No color / background changes.** The section keeps its current `bg-neutral-50`.
  (The brand palette currently lacks a purple token; that is a separate, larger issue
  deliberately deferred.)

## Layout

The component renders five blocks top to bottom:

1. **Heading** — `hippussuit.titulo` ("Hippussuit"), same centered `h2` style as the
   other sections.

2. **Intro + image** (`p1`) — two columns on desktop (`md`), stacked on mobile:
   - Left: the bundled mocked image, with `--radius-card` and `--shadow-card`.
   - Right: all three paragraphs — `txt`, `txt2`, `txt3`.

3. **Benefits** (`p2`, `p3`) — two collapsible cards, side by side on desktop, stacked
   on mobile:
   - Card heading from each block's `txt`.
   - Bulleted list from the block's `ul`, each item with a simple marker.
   - Collapsed state shows the first **5** items; a `Ver mais` / `Ver menos` button
     reveals the rest. The motor card (14 items) gets the button; the behavioral card
     (5 items) shows everything and renders **no** button.
   - Reuse the accessible toggle pattern from `Servicos.jsx`
     (`aria-expanded` + `aria-controls`).

4. **Conclusion** (`p4`) — both paragraphs (`txt`, `txt2`) in a centered, max-width
   closing text block.

5. **Credits** (`p5`) — a subtle footer block: a "Desenvolvido por:" heading (`txt`)
   followed by the names/roles from `ul` as a list.

## Data parsing

Helpers inside the component:

- **`paragraphs(block)`** — collect every key of `block.txts` that starts with `txt`
  (i.e. `txt`, `txt2`, `txt3`…), sorted by numeric suffix, returning their string
  values. Excludes `ul`.
- **`listItems(block)`** — `Object.entries(block.txts.ul)` sorted by the **numeric
  suffix** of the key (`li` = 1, `li2` = 2 … `li14` = 14). Plain `localeCompare` would
  order `li10` before `li2` and scramble both the benefit order and the credits order,
  so a numeric-aware sort is required.

Both helpers tolerate missing fields (a block with no `ul`, etc.).

## Image

Move `public/hippussuit/mocked_hippussuit_image.png` → `src/assets/hippussuit.png` and
`import` it, matching the bundled-asset convention used by `Hero.jsx` / `logo.png`. The
`public/hippussuit/` copy is removed. The Firebase URL helper is dropped from this
component.

## Testing

Add `src/components/Hippussuit.test.jsx` asserting that the previously-dropped content
now renders:

- `p1` `txt2` and `txt3` text present.
- Both benefit lists render; a deep item (e.g. the 14th motor item) is present after
  expanding the motor card.
- The motor card shows a `Ver mais` toggle that reveals hidden items; the behavioral
  card shows no toggle.
- `p4` `txt2` conclusion present.
- All four `p5` credit names present.

This locks in the fix against regression.
