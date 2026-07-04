# Hippussuit Section Refactor — Design

## Goal

Expand the `/servicos` page's Hippussuit block from a thin "spotlight" band
into the full detailed layout shown in the Google Stitch mockup
*"Services - Hippussuit Detail Expansion"* (project **Projeto Liberdade Website
Redesign**), driven entirely by real content from
`docs/resources/content.json`.

## Current state

The Hippussuit block renders through `FeatureSpotlight`
(`src/components/sections/FeatureSpotlight.tsx`) — a generic image + a single
paragraph + three "highlight" bullets. `selectHippussuit` in
`src/features/servicos/servicosSelectors.ts` deliberately returns only thin
slices of the content (one paragraph, three highlights, a hardcoded image path).
`FeatureSpotlight` is used **only** here.

## Target layout (from the mockup)

A single section card (`bg-surface-container-low rounded-xl`) with four regions:

1. **Top row** (`flex-col md:flex-row`): image on the left (`aspect-video`,
   rounded, soft shadow); on the right the `<h2>` title, the intro paragraph,
   and an `O que é` heading + paragraph.
2. **Como funciona**: a full-width heading + paragraph.
3. **Two columns** (`md:grid-cols-2`): each a heading + a check-list `<ul>`
   built from `CheckCircleIcon` + text. The motor column uses `text-primary`
   (green) checks; the behavioral column uses `text-secondary` (indigo) checks
   and heading.
4. **Closing block** (separated by a `border-t`): the closing paragraph(s)
   rendered italic, followed by a `bg-surface-container` card containing the
   "Desenvolvido por:" label and the developer list.

## Content changes (`src/content/content.json`)

Edit only `src/content/content.json` — the snapshot the app bundles
(`JsonContentRepository` imports it). The separate `docs/resources/content.json`
authoring copy is intentionally left untouched.

The section labels become real content via the existing `heading` block type
(the same type História's Missão/Visão/Valores section uses). In
`pages.servicos.sections` (the `hippussuit` entry) `body`:

- **Insert** `{ "type": "heading", "text": "O que é" }` before P2.
- **Insert** `{ "type": "heading", "text": "Como funciona" }` before P3.
- **Convert** P4 (`"Nos aspectos motores, o HippusSuit promove:"`) into
  `{ "type": "heading", "text": "Nos aspectos motores" }`.
- **Convert** P5 (`"Os aspectos comportamentais o HippusSuit promove:"`) into
  `{ "type": "heading", "text": "Os aspectos comportamentais" }`.

Converting P4/P5 (rather than adding headings *and* keeping the sentences)
avoids duplicating the same label as both a paragraph and a heading.
`"Desenvolvido por:"` stays a paragraph — the mockup renders it as a small card
label, not a section heading. No other content values change.

Resulting `body` order:

```
image, P1,
heading "O que é", P2,
heading "Como funciona", P3,
heading "Nos aspectos motores", list₁ (14 items),
heading "Os aspectos comportamentais", list₂ (5 items),
P6, P7, P8 ("Desenvolvido por:"), list₃ (4 items)
```

## Selector (`servicosSelectors.ts`)

Reshape `selectHippussuit` to return the full structured content. Every visible
string comes from `content.json`; the component hardcodes no Portuguese.

```ts
selectHippussuit(content) → {
  title: string
  image: { src: string; alt: string }   // src stays '/images/hippussuit.jpg'
  intro: string                          // P1
  whatIsIt:   { heading: string; text: string }   // "O que é" + P2
  howItWorks: { heading: string; text: string }   // "Como funciona" + P3
  motor:      { heading: string; items: string[] } // "Nos aspectos motores" + list₁
  behavioral: { heading: string; items: string[] } // "Os aspectos comportamentais" + list₂
  closing: string[]                      // [P6, P7]
  developedBy: { label: string; items: string[] }  // P8 + list₃
}
```

**Extraction** (content order is fixed): gather the blocks by type into
`image`, `headings` (4), `paragraphs` (6 — P4/P5 are now headings), and `lists`
(3), then map positionally:

- `intro` = `paragraphs[0]`
- `whatIsIt` = `{ headings[0], paragraphs[1] }`
- `howItWorks` = `{ headings[1], paragraphs[2] }`
- `motor` = `{ headings[2], lists[0].items }`
- `behavioral` = `{ headings[3], lists[1].items }`
- `closing` = `[paragraphs[3], paragraphs[4]]`  (P6, P7)
- `developedBy` = `{ paragraphs[5], lists[2].items }`  (P8 label + names)

`selectServicesGrid` is unchanged (still excludes `hippussuit` from the card
grid).

## Components

### `HippussuitSection.tsx` (new)

Presentational, prop-driven. Signature:

```ts
interface HippussuitSectionProps {
  hippussuit: ReturnType<typeof selectHippussuit>
  tone?: 'surface' | 'muted'
}
```

Renders the four regions above inside a `Section` + inner
`bg-surface-container-low rounded-xl` card. Reuses `Container`, `Section`, and
`CheckCircleIcon`. Owns only layout, the green/indigo check colors, and the
italic-note / developer-card styling — no content strings.

### `ServicosPage.tsx`

Swap `<FeatureSpotlight … />` for `<HippussuitSection hippussuit={hippussuit} />`.
`ServicesSection` and `ContactCta` are unchanged.

### Removed

- `src/components/sections/FeatureSpotlight.tsx`
- `src/components/sections/FeatureSpotlight.test.tsx`

## Testing

- **`servicosSelectors.test.ts`** — extend: `intro`/`whatIsIt`/`howItWorks`
  map to the right headings + P1–P3; `motor.items`/`behavioral.items`/
  `developedBy.items` have lengths 14 / 5 / 4; `closing` has 2 paragraphs;
  `developedBy` includes the real names (Karina Hollatz, André, Cibele, Equipe).
  Grid selector still excludes `hippussuit`.
- **`HippussuitSection.test.tsx`** (new, replaces `FeatureSpotlight.test.tsx`) —
  renders the title, the four editorial headings, both column lists, and the
  developed-by names; image alt present.
- **E2E** — the existing `/servicos` smoke test stays green (Hippussuit heading
  + image still present).

## Scope

- Edit: `src/content/content.json` (headings only, no value changes),
  `src/features/servicos/servicosSelectors.ts`,
  `src/features/servicos/ServicosPage.tsx`.
- Add: `src/components/sections/HippussuitSection.tsx` (+ `.test.tsx`).
- Delete: `src/components/sections/FeatureSpotlight.tsx` (+ `.test.tsx`).
- Update: `servicosSelectors.test.ts`.
- No new dependencies; no changes to `ServicesSection` or `ContactCta`.
