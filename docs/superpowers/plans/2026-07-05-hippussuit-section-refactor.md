# Hippussuit Section Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/servicos` page's thin Hippussuit "spotlight" band with the full four-region layout from the Stitch mockup, driven entirely by real content from `src/content/content.json`.

**Architecture:** Add editorial section labels to the bundled `content.json` as `heading` blocks. Reshape `selectHippussuit` to return the full structured content (intro, "o que é", "como funciona", motor/behavioral lists, closing notes, developer list). Introduce a presentational `HippussuitSection` component that owns its data-shape interface and renders the four regions; `ServicosPage` swaps `FeatureSpotlight` for it, and `FeatureSpotlight` is deleted.

**Tech Stack:** TypeScript 6 (strict), React 19, Vite 8, Tailwind CSS v4, Vitest + Testing Library, Playwright.

## Global Constraints

- TypeScript strict; React 19 function components.
- Prettier style: **no semicolons, single quotes, trailing commas**.
- Dependency rule: `components/` never import `content.json` or Firebase. The component owns its props interface (`HippussuitContent`); the selector in `features/` imports that type (direction: `features → components`), mirroring `ServiceCardData` in `ServicesSection.tsx`.
- Content: English keys, Portuguese values. Editorial labels live in `content.json`, not in components.
- Edit **only** `src/content/content.json` (the bundled snapshot the app imports). Do **not** touch `docs/resources/content.json`.
- Design tokens are already defined in `src/index.css` (`text-primary`, `text-secondary`, `text-headline-md/sm`, `text-body-md`, `text-label-md/sm`, `font-display`, `font-sans`, `shadow-level1`, `bg-surface-container-low`, `bg-surface-container`). Do not add tokens.

---

### Task 1: Add editorial heading blocks to `content.json`

**Files:**
- Modify: `src/content/content.json` (the `pages.servicos.sections` entry with `"slug": "hippussuit"`, `body` array — currently lines ~254-330)

**Interfaces:**
- Consumes: nothing.
- Produces: a `hippussuit.body` whose block order is `image, paragraph, heading, paragraph, heading, paragraph, heading, list, heading, list, paragraph, paragraph, paragraph, list` (1 image, 6 paragraphs, 4 headings, 3 lists).

- [ ] **Step 1: Insert the "O que é" heading before the second paragraph**

Find this exact text (end of P1 into start of P2) and edit it:

```json
            {
              "type": "paragraph",
              "text": "O HippusSuit é uma vestimenta dinâmica, composta de borracha sintética com poliamida, constituída de colete e short integrados, posicionador de pé, faixa em X, faixa linear e alça de segurança para o terapeuta estar em contato com o praticante."
            },
```

Replace with (prepend a heading block):

```json
            {
              "type": "heading",
              "text": "O que é"
            },
            {
              "type": "paragraph",
              "text": "O HippusSuit é uma vestimenta dinâmica, composta de borracha sintética com poliamida, constituída de colete e short integrados, posicionador de pé, faixa em X, faixa linear e alça de segurança para o terapeuta estar em contato com o praticante."
            },
```

- [ ] **Step 2: Insert the "Como funciona" heading before the third paragraph**

Find this exact text (start of P3) and edit it:

```json
            {
              "type": "paragraph",
              "text": "O HippusSuit tem como ação, favorecer a montaria individual de praticantes com maior comprometimento motor, ativar e/ou inibir musculaturas isoladas, possibilitar diferentes ajustes posturais com o uso das faixas e favorecer o bom e correto posicionamento durante a montaria. Permite também, ativar musculatura agonista e inibir antagonista, retificar um mal posicionamento decorrente de cifose/lordose/escoliose, diminuir o contato do terapeuta com o praticante, e aumentar as experiências sensório motoras em montaria, além de permitir diversas possibilidades para o terapeuta."
            },
```

Replace with (prepend a heading block):

```json
            {
              "type": "heading",
              "text": "Como funciona"
            },
            {
              "type": "paragraph",
              "text": "O HippusSuit tem como ação, favorecer a montaria individual de praticantes com maior comprometimento motor, ativar e/ou inibir musculaturas isoladas, possibilitar diferentes ajustes posturais com o uso das faixas e favorecer o bom e correto posicionamento durante a montaria. Permite também, ativar musculatura agonista e inibir antagonista, retificar um mal posicionamento decorrente de cifose/lordose/escoliose, diminuir o contato do terapeuta com o praticante, e aumentar as experiências sensório motoras em montaria, além de permitir diversas possibilidades para o terapeuta."
            },
```

- [ ] **Step 3: Convert the "Nos aspectos motores" paragraph into a heading**

Find:

```json
            {
              "type": "paragraph",
              "text": "Nos aspectos motores, o HippusSuit promove:"
            },
```

Replace with:

```json
            {
              "type": "heading",
              "text": "Nos aspectos motores"
            },
```

- [ ] **Step 4: Convert the "Os aspectos comportamentais" paragraph into a heading**

Find:

```json
            {
              "type": "paragraph",
              "text": "Os aspectos comportamentais o HippusSuit promove:"
            },
```

Replace with:

```json
            {
              "type": "heading",
              "text": "Os aspectos comportamentais"
            },
```

- [ ] **Step 5: Verify the JSON parses and the block shape is correct**

Run:

```bash
node -e "const c=require('./src/content/content.json');const b=c.pages.servicos.sections.find(s=>s.slug==='hippussuit').body;const n=t=>b.filter(x=>x.type===t).length;console.log(JSON.stringify({image:n('image'),paragraph:n('paragraph'),heading:n('heading'),list:n('list'),headings:b.filter(x=>x.type==='heading').map(x=>x.text)}))"
```

Expected output:

```
{"image":1,"paragraph":6,"heading":4,"list":3,"headings":["O que é","Como funciona","Nos aspectos motores","Os aspectos comportamentais"]}
```

- [ ] **Step 6: Commit**

```bash
git add src/content/content.json
git commit -m "content(servicos): add hippussuit section headings"
```

---

### Task 2: Create the `HippussuitSection` component

**Files:**
- Create: `src/components/sections/HippussuitSection.tsx`
- Test: `src/components/sections/HippussuitSection.test.tsx`

**Interfaces:**
- Consumes: `Container`, `Section` from `../ui`; `CheckCircleIcon` from `../ui/icons`.
- Produces (imported by Task 3 and Task 4):
  - `export interface HippussuitContent { title: string; image: { src: string; alt: string }; intro: string; whatIsIt: { heading: string; text: string }; howItWorks: { heading: string; text: string }; motor: { heading: string; items: string[] }; behavioral: { heading: string; items: string[] }; closing: string[]; developedBy: { label: string; items: string[] } }`
  - `export function HippussuitSection(props: { hippussuit: HippussuitContent; tone?: 'surface' | 'muted' }): JSX.Element`

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/HippussuitSection.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HippussuitSection, type HippussuitContent } from './HippussuitSection'

const hippussuit: HippussuitContent = {
  title: 'Hippussuit',
  image: { src: '/images/hippussuit.jpg', alt: 'Hippussuit' },
  intro: 'Intro do HippusSuit.',
  whatIsIt: { heading: 'O que é', text: 'É uma vestimenta.' },
  howItWorks: { heading: 'Como funciona', text: 'Funciona assim.' },
  motor: { heading: 'Nos aspectos motores', items: ['Motor A', 'Motor B'] },
  behavioral: { heading: 'Os aspectos comportamentais', items: ['Comp 1'] },
  closing: ['Fecho um.', 'Fecho dois.'],
  developedBy: { label: 'Desenvolvido por:', items: ['Karina Hollatz', 'André'] },
}

describe('HippussuitSection', () => {
  it('renders the title, editorial headings, both lists, and developer names', () => {
    render(<HippussuitSection hippussuit={hippussuit} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Hippussuit' }),
    ).toBeInTheDocument()
    for (const heading of [
      'O que é',
      'Como funciona',
      'Nos aspectos motores',
      'Os aspectos comportamentais',
    ]) {
      expect(
        screen.getByRole('heading', { level: 3, name: heading }),
      ).toBeInTheDocument()
    }
    expect(screen.getByText('Motor A')).toBeInTheDocument()
    expect(screen.getByText('Comp 1')).toBeInTheDocument()
    expect(screen.getByText('Fecho dois.')).toBeInTheDocument()
    expect(screen.getByText('Karina Hollatz')).toBeInTheDocument()
    // 2 motor + 1 behavioral + 2 developer = 5 list items
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    const img = screen.getByRole('img', { name: 'Hippussuit' })
    expect(img).toHaveAttribute('src', '/images/hippussuit.jpg')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- src/components/sections/HippussuitSection.test.tsx`
Expected: FAIL — cannot resolve `./HippussuitSection` (module not created yet).

- [ ] **Step 3: Write the component**

Create `src/components/sections/HippussuitSection.tsx`:

```tsx
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { CheckCircleIcon } from '../ui/icons'

export interface HippussuitContent {
  title: string
  image: { src: string; alt: string }
  intro: string
  whatIsIt: { heading: string; text: string }
  howItWorks: { heading: string; text: string }
  motor: { heading: string; items: string[] }
  behavioral: { heading: string; items: string[] }
  closing: string[]
  developedBy: { label: string; items: string[] }
}

interface HippussuitSectionProps {
  hippussuit: HippussuitContent
  tone?: 'surface' | 'muted'
}

function CheckList({
  items,
  iconClassName,
}: {
  items: string[]
  iconClassName: string
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <CheckCircleIcon
            className={`mt-0.5 h-5 w-5 shrink-0 ${iconClassName}`}
          />
          <span className="font-sans text-body-md text-on-surface-variant">
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function HippussuitSection({
  hippussuit,
  tone = 'surface',
}: HippussuitSectionProps) {
  const {
    title,
    image,
    intro,
    whatIsIt,
    howItWorks,
    motor,
    behavioral,
    closing,
    developedBy,
  } = hippussuit

  return (
    <Section tone={tone}>
      <Container>
        <div className="space-y-12 rounded-xl bg-surface-container-low p-6 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="w-full md:w-1/2">
              <div className="overflow-hidden rounded-xl border border-outline-variant/30 shadow-level1">
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              </div>
            </div>
            <div className="w-full space-y-4 md:w-1/2">
              <h2 className="font-display text-headline-md text-primary">
                {title}
              </h2>
              <p className="font-sans text-body-md text-on-surface-variant">
                {intro}
              </p>
              <h3 className="font-display text-headline-sm text-on-surface">
                {whatIsIt.heading}
              </h3>
              <p className="font-sans text-body-md text-on-surface-variant">
                {whatIsIt.text}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-headline-sm text-on-surface">
              {howItWorks.heading}
            </h3>
            <p className="font-sans text-body-md text-on-surface-variant">
              {howItWorks.text}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-display text-headline-sm text-primary">
                {motor.heading}
              </h3>
              <CheckList items={motor.items} iconClassName="text-primary" />
            </div>
            <div className="space-y-4">
              <h3 className="font-display text-headline-sm text-secondary">
                {behavioral.heading}
              </h3>
              <CheckList
                items={behavioral.items}
                iconClassName="text-secondary"
              />
            </div>
          </div>

          <div className="space-y-6 border-t border-outline-variant/30 pt-8">
            {closing.map((text) => (
              <p
                key={text}
                className="font-sans text-body-md italic text-on-surface-variant"
              >
                {text}
              </p>
            ))}
            <div className="rounded-lg bg-surface-container p-6">
              <p className="mb-2 font-sans text-label-md text-on-surface">
                {developedBy.label}
              </p>
              <ul className="space-y-1">
                {developedBy.items.map((item) => (
                  <li
                    key={item}
                    className="font-sans text-label-sm text-on-surface-variant"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- src/components/sections/HippussuitSection.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/HippussuitSection.tsx src/components/sections/HippussuitSection.test.tsx
git commit -m "feat(sections): add HippussuitSection component"
```

---

### Task 3: Reshape the `selectHippussuit` selector

**Files:**
- Modify: `src/features/servicos/servicosSelectors.ts` (replace the `selectHippussuit` function, lines ~42-65; add a type import)
- Modify: `src/features/servicos/servicosSelectors.test.ts` (replace the `hippussuit` fixture and the `selectHippussuit` describe block)

**Interfaces:**
- Consumes: `HippussuitContent` from `../../components/sections/HippussuitSection` (Task 2); `paragraphs` from `../../content/selectors`; `Block`, `SiteContent` from `../../content/types`.
- Produces: `export function selectHippussuit(content: SiteContent): HippussuitContent`. `selectServicesGrid` is unchanged.

- [ ] **Step 1: Update the test fixture and assertions (failing test)**

In `src/features/servicos/servicosSelectors.test.ts`, replace the `hippussuit` section object inside the `content` fixture (the block starting `slug: 'hippussuit'`) with:

```ts
        {
          slug: 'hippussuit',
          title: 'Hippussuit',
          order: 9,
          body: [
            { type: 'image', src: 'placeholder.jpg', alt: '' },
            { type: 'paragraph', text: 'Intro do HippusSuit.' },
            { type: 'heading', text: 'O que é' },
            { type: 'paragraph', text: 'É uma vestimenta.' },
            { type: 'heading', text: 'Como funciona' },
            { type: 'paragraph', text: 'Funciona assim.' },
            { type: 'heading', text: 'Nos aspectos motores' },
            { type: 'list', items: ['Motor A', 'Motor B'] },
            { type: 'heading', text: 'Os aspectos comportamentais' },
            { type: 'list', items: ['Comp 1'] },
            { type: 'paragraph', text: 'Fecho um.' },
            { type: 'paragraph', text: 'Fecho dois.' },
            { type: 'paragraph', text: 'Desenvolvido por:' },
            { type: 'list', items: ['Karina Hollatz', 'André'] },
          ],
        },
```

Then replace the entire `describe('selectHippussuit', ...)` block with:

```ts
describe('selectHippussuit', () => {
  it('maps blocks into the structured hippussuit layout', () => {
    const h = selectHippussuit(content)
    expect(h.title).toBe('Hippussuit')
    expect(h.image).toEqual({ src: '/images/hippussuit.jpg', alt: 'Hippussuit' })
    expect(h.intro).toBe('Intro do HippusSuit.')
    expect(h.whatIsIt).toEqual({ heading: 'O que é', text: 'É uma vestimenta.' })
    expect(h.howItWorks).toEqual({
      heading: 'Como funciona',
      text: 'Funciona assim.',
    })
    expect(h.motor).toEqual({
      heading: 'Nos aspectos motores',
      items: ['Motor A', 'Motor B'],
    })
    expect(h.behavioral).toEqual({
      heading: 'Os aspectos comportamentais',
      items: ['Comp 1'],
    })
    expect(h.closing).toEqual(['Fecho um.', 'Fecho dois.'])
    expect(h.developedBy).toEqual({
      label: 'Desenvolvido por:',
      items: ['Karina Hollatz', 'André'],
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- src/features/servicos/servicosSelectors.test.ts`
Expected: FAIL — `selectHippussuit` still returns the old shape (`h.paragraphs` / `h.highlights`); assertions on `h.intro`, `h.whatIsIt`, etc. fail (undefined).

- [ ] **Step 3: Rewrite the selector**

In `src/features/servicos/servicosSelectors.ts`:

Replace the top import line:

```ts
import type { ServiceCardData } from '../../components/sections/ServicesSection'
```

with:

```ts
import type { ServiceCardData } from '../../components/sections/ServicesSection'
import type { HippussuitContent } from '../../components/sections/HippussuitSection'
```

Then replace the whole `selectHippussuit` function (from `export function selectHippussuit` to its closing brace) with:

```ts
export function selectHippussuit(content: SiteContent): HippussuitContent {
  const page = content.pages.servicos as unknown as ServicosPageContent
  const section = (page.sections ?? []).find((s) => s.slug === 'hippussuit')
  const body = section?.body ?? []
  const title = section?.title ?? 'Hippussuit'

  const headings = body
    .filter((b): b is Extract<Block, { type: 'heading' }> => b.type === 'heading')
    .map((b) => b.text)
  const paras = paragraphs(body)
  const lists = body.filter(
    (b): b is Extract<Block, { type: 'list' }> => b.type === 'list',
  )

  return {
    title,
    image: { src: '/images/hippussuit.jpg', alt: title },
    intro: paras[0] ?? '',
    whatIsIt: { heading: headings[0] ?? '', text: paras[1] ?? '' },
    howItWorks: { heading: headings[1] ?? '', text: paras[2] ?? '' },
    motor: { heading: headings[2] ?? '', items: lists[0]?.items ?? [] },
    behavioral: { heading: headings[3] ?? '', items: lists[1]?.items ?? [] },
    closing: paras.slice(3, 5),
    developedBy: { label: paras[5] ?? '', items: lists[2]?.items ?? [] },
  }
}
```

Note: `firstParagraph` is still used by `selectServicesGrid`, so leave the existing `import { firstParagraph, paragraphs } from '../../content/selectors'` line unchanged.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- src/features/servicos/servicosSelectors.test.ts`
Expected: PASS — both `selectServicesGrid` and `selectHippussuit` tests green.

- [ ] **Step 5: Commit**

```bash
git add src/features/servicos/servicosSelectors.ts src/features/servicos/servicosSelectors.test.ts
git commit -m "feat(servicos): reshape selectHippussuit to structured content"
```

---

### Task 4: Wire the page and remove `FeatureSpotlight`

**Files:**
- Modify: `src/features/servicos/ServicosPage.tsx`
- Delete: `src/components/sections/FeatureSpotlight.tsx`
- Delete: `src/components/sections/FeatureSpotlight.test.tsx`

**Interfaces:**
- Consumes: `HippussuitSection` (Task 2), `selectHippussuit` (Task 3).
- Produces: the rendered `/servicos` page.

- [ ] **Step 1: Swap the import and usage in `ServicosPage.tsx`**

Replace the entire file `src/features/servicos/ServicosPage.tsx` with:

```tsx
import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { ServicesSection } from '../../components/sections/ServicesSection'
import { HippussuitSection } from '../../components/sections/HippussuitSection'
import { ContactCta } from '../../components/sections/ContactCta'
import { selectHippussuit, selectServicesGrid } from './servicosSelectors'

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
        headingLevel="h1"
      />
      <HippussuitSection hippussuit={hippussuit} />
      <ContactCta
        tone="surface"
        heading="Agende uma Avaliação"
        body="Venha conhecer nosso espaço e nossos profissionais. Estamos prontos para oferecer o melhor atendimento para você e sua família."
      />
    </>
  )
}
```

- [ ] **Step 2: Delete the obsolete `FeatureSpotlight` files**

Run:

```bash
git rm src/components/sections/FeatureSpotlight.tsx src/components/sections/FeatureSpotlight.test.tsx
```

- [ ] **Step 3: Type-check and run the full unit suite**

Run: `pnpm build && pnpm test`
Expected: build succeeds (no dangling `FeatureSpotlight` import; strict type-check clean) and all unit tests pass. There should be **no** remaining reference to `FeatureSpotlight` — confirm with `grep -r FeatureSpotlight src` returning nothing.

- [ ] **Step 4: Run the servicos E2E smoke test**

Run: `pnpm test:e2e -- servicos`
Expected: PASS — the existing `tests/e2e/servicos.spec.ts` stays green (it asserts the `Nossos Serviços` h1, the service cards + "Ver mais" behavior, the `Hippussuit` h2, the `Hippussuit` image, and the `Agende uma Avaliação` CTA — all preserved).

- [ ] **Step 5: Visual verification**

Run: `pnpm dev`, open `http://localhost:5173/servicos`, and confirm the Hippussuit section shows: the image + intro + "O que é" on the top row, a full-width "Como funciona", two check-list columns ("Nos aspectos motores" in green / "Os aspectos comportamentais" in indigo), and the closing note + "Desenvolvido por:" card with the four real names (Karina Hollatz, André Augusto Amaral Gomes, Cibele Ferreira Lima, Equipe...). Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(servicos): render full HippussuitSection, drop FeatureSpotlight"
```

---

## Notes for the implementer

- Content order in `content.json` is fixed and the selector relies on it positionally (6 paragraphs after Task 1: intro, o-que-é body, como-funciona body, closing×2, "Desenvolvido por:" label). If the JSON block counts from Task 1 Step 5 don't match, stop and fix Task 1 before continuing.
- `HippussuitSection` uses `tone="surface"` so its inner `bg-surface-container-low` card contrasts against the page. The developer sub-card is `bg-surface-container` (one tonal step darker), matching the mockup.
- Do not import `content.json` into the component; it receives everything via the `hippussuit` prop.
