# Serviços page (`/servicos`) — design

## Goal

Add the **Serviços** page at route `/servicos`, showing **all** services (the
home page features only three). Mirror the Stitch mockup "Projeto Liberdade -
Services": a heading + intro, a grid of service cards, a Hippussuit spotlight
band, and a closing contact call-to-action. Make the header and footer "Serviços"
menu item link to the page.

Reuse existing components wherever they fit; add the minimum of new,
prop-driven, reusable pieces.

## Page composition (top → bottom)

1. **`ServicesSection`** (reused unchanged) — heading **"Nossos Serviços"**,
   intro paragraph, and a card grid of every service **except `hippussuit`**.
   Cards keep their existing "Ver mais" link to `/servicos/:slug` (detail pages
   are deferred; consistent with the home page).
2. **`FeatureSpotlight`** (new) — the Hippussuit band: image on one side; title,
   intro paragraph, and a green-check highlight list on the other.
3. **`ContactCta`** (new) — centered "Agende uma Avaliação" heading, a short
   subtitle, and the shared contact button.

The page has **no hero image** (the mockup goes straight from the header into the
"Nossos Serviços" heading), unlike the História page.

## Route & container

- `src/routes.tsx` — add `{ path: 'servicos', Component: ServicosPage }` as a
  child of `SiteLayout` (alongside `historia`).
- `src/features/servicos/ServicosPage.tsx` — container. Reads `SiteContent` via
  `useOutletContext` (same pattern as `HistoriaPage`), runs the selectors, and
  composes the three sections. No content-source imports (dependency rule).

### Composition sketch

```tsx
export function ServicosPage() {
  const content = useOutletContext<SiteContent>()
  const grid = selectServicesGrid(content)
  const hippussuit = selectHippussuit(content)

  return (
    <>
      <ServicesSection
        tone="surface"
        heading={grid.heading}
        intro={grid.intro}
        services={grid.services}
      />
      <FeatureSpotlight
        tone="muted"
        title={hippussuit.title}
        paragraphs={hippussuit.paragraphs}
        highlights={hippussuit.highlights}
        image={hippussuit.image}
      />
      <ContactCta
        tone="surface"
        heading="Agende uma Avaliação"
        body="Venha conhecer nosso espaço e nossos profissionais. Estamos prontos para oferecer o melhor atendimento para você e sua família."
      />
    </>
  )
}
```

## Selectors (`src/features/servicos/servicosSelectors.ts`)

Pure functions mapping `SiteContent` → view-models, mirroring
`homeSelectors.ts`. Reuse `firstParagraph` / `paragraphs` from
`content/selectors` and the `ServiceCardData` type from `ServicesSection`.

- `selectServicesGrid(content)` → `{ heading, intro, services }`
  - `heading`: `'Nossos Serviços'`
  - `intro`: `firstParagraph(servicos.body)` (the multidisciplinary-team text)
  - `services`: `servicos.sections`, **excluding `slug === 'hippussuit'`**,
    sorted by `order`, mapped to `ServiceCardData`
    (`{ slug, title, excerpt: firstParagraph(body), to: '/servicos/' + slug }`).
    All non-Hippussuit services render (content-driven; the mockup's six cards
    are illustrative — content currently has seven).

- `selectHippussuit(content)` → `{ title, paragraphs, highlights, image }`
  - Locates the `hippussuit` section in `servicos.sections`.
  - `title`: the section title (`"Hippussuit"`).
  - `paragraphs`: `paragraphs(body)` sliced to the first **1** (the intro shown
    in the mockup). Typed as `string[]` so `FeatureSpotlight` can render one or
    more.
  - `highlights`: items of the section's **first `list` block** (the
    motor-benefits list), sliced to the first **4**.
  - `image`: `{ src: '/images/hippussuit.jpg', alt: title }` — overriding the
    placeholder filename in `content.json`, per requirement.

## New components

### `src/components/sections/FeatureSpotlight.tsx`

Prop-driven, reusable "image + text + checklist" band. Props:

```ts
interface FeatureSpotlightProps {
  title: string
  paragraphs: string[]
  highlights: string[]
  image: { src: string; alt: string }
  tone?: 'surface' | 'muted'
}
```

- Layout: `Section` + `Container` with a two-column `md:grid-cols-2` (image and
  content), matching `HistoriaSection`'s responsive grid. Image in a
  `rounded-xl shadow-level1` frame, `loading="lazy"`, `object-cover`.
- Content column: `title` as `headline-md`; each paragraph as
  `body-md text-on-surface-variant`; then the `highlights` as a `<ul>` where each
  item is `CheckCircleIcon` (green, `text-cta`) + label.
- No CTA button (the updated mockup removed it from this band).

### `src/components/ui/ContactButton.tsx`

Extracted from `Header` so the same button is reused there and in `ContactCta`
(single source of truth). Renders the existing pill button:

```tsx
export function ContactButton({ className }: { className?: string }) {
  return (
    <Button to="/contato" pill className={cn('items-center gap-1', className)}>
      <ChatIcon className="h-4 w-4" /> Entre em contato
    </Button>
  )
}
```

`Header` swaps its inline button for `<ContactButton className="hidden md:inline-flex" />` (behavior unchanged).

### `src/components/sections/ContactCta.tsx`

Centered closing band. Props: `{ heading: string; body?: string; tone?: 'surface' | 'muted' }`.
Renders `Section` + `Container` (centered) with the heading (`headline-md`),
optional body (`body-lg text-on-surface-variant`), and `<ContactButton />`.

### `src/components/ui/icons.tsx`

Add `CheckCircleIcon` (filled circle + check, rounded caps) following the
existing icon signatures (`className` prop, `currentColor`).

## Navigation & footer

- **Remove the `submenu` array from the `servicos` entry** in
  `content.json`'s `navigation`. `Nav` already renders any submenu-less item as a
  plain `Link` (desktop and mobile), so "Serviços" becomes a plain link to
  `/servicos` **with no hover dropdown** — no `Nav.tsx` code change.
- **Momentos** keeps its Fotos/Vídeos dropdown (untouched).
- **Footer** already links top-level items by slug → `/servicos`; no change.

Only navigation consumer of `submenu` is `Nav`; selectors read
`pages.servicos.sections`, so removing `navigation.servicos.submenu` is safe.

## Testing

Follow existing conventions — Vitest for selectors/pure components, Playwright
for page behavior.

**Unit (Vitest):**

- `servicosSelectors.test.ts` — grid excludes `hippussuit`, is sorted by `order`,
  and carries the intro; each card's `to` is `/servicos/:slug`. Hippussuit
  selector returns the image override `/images/hippussuit.jpg`, the intro
  paragraph, and highlights sliced from the first list.
- `FeatureSpotlight.test.tsx` — renders title, paragraphs, image (alt), and one
  `<li>` per highlight.
- `ContactButton.test.tsx` — renders a link to `/contato` with the label.
- `Nav` test — "Serviços" is a link to `/servicos` and renders **no** dropdown
  toggle button. (Momentos still renders its dropdown.)

**E2E (Playwright, `tests/e2e/`)** — mirror the História smoke test:

- Visit `/servicos`: "Nossos Serviços" heading, the expected number of service
  cards, the Hippussuit image, and the contact CTA are present.
- From the home page, clicking the header "Serviços" navigates to `/servicos`.

## Files touched

New:
- `src/features/servicos/ServicosPage.tsx`
- `src/features/servicos/servicosSelectors.ts`
- `src/features/servicos/servicosSelectors.test.ts`
- `src/components/sections/FeatureSpotlight.tsx` (+ `.test.tsx`)
- `src/components/sections/ContactCta.tsx` (+ `.test.tsx`)
- `src/components/ui/ContactButton.tsx` (+ `.test.tsx`)
- `tests/e2e/servicos.spec.ts`

Modified:
- `src/routes.tsx` (add route)
- `src/components/Header.tsx` (use `ContactButton`)
- `src/components/ui/icons.tsx` (add `CheckCircleIcon`)
- `src/content/content.json` (remove `navigation.servicos.submenu`)
- `src/components/Nav.test.tsx` (assert plain link)

## Out of scope

- `/servicos/:slug` service detail pages (deferred; cards link to them for later).
- Per-service card icons shown in the mockup (YAGNI — reuse `ServicesSection` as
  is; icons would need new per-service content).
- Bulk image migration and runtime content validation (tracked separately).
