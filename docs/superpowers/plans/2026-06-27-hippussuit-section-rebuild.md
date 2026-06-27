# Hippussuit Section Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `src/components/Hippussuit.jsx` so it renders all of the `hippussuit` data (intro paragraphs, both benefit lists, conclusion, and credits) using a bundled feature image.

**Architecture:** A single presentational React component reads the `hippussuit` object and renders five blocks: heading, intro+image, two collapsible benefit cards, conclusion, and a credits footer. A small `BenefitCard` sub-component owns the `Ver mais`/`Ver menos` collapse behavior (mirroring `Servicos.jsx`). Two pure helpers extract paragraphs and list items from the JSON, sorting keys by numeric suffix.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4 (`@theme` tokens), Vitest 4 + @testing-library/react, oxlint.

## Global Constraints

- React 19 function components, JSX, ES modules — match existing components.
- Styling uses Tailwind utilities + CSS custom properties only: `--radius-card`, `--shadow-card`, `--spacing-section`, and the `primary`/`neutral` color tokens. No new color tokens.
- **No color/background change:** the section keeps `bg-neutral-50`. The brand-palette/purple work is explicitly deferred and out of scope.
- Tests use `@testing-library/react` (`render`, `screen`, `fireEvent`). `@testing-library/user-event` is NOT a dependency — do not import it.
- Run the suite with `npm test` (`vitest run`) and lint with `npm run lint` (`oxlint`).
- DRY, YAGNI, TDD, frequent commits.

---

### Task 1: Bundle the feature image

The component will `import` the image as a bundled asset (matching `Hero.jsx` / `logo.png`). The file currently sits untracked under `public/hippussuit/`. Move it into `src/assets/` first so the component's import (and the test that imports the component) resolves.

**Files:**
- Move: `public/hippussuit/mocked_hippussuit_image.png` → `src/assets/hippussuit.png`

**Interfaces:**
- Consumes: nothing.
- Produces: bundled asset at `src/assets/hippussuit.png`, imported by Task 2 as `import hippussuitImage from '../assets/hippussuit.png'`.

- [ ] **Step 1: Move the file and drop the now-empty public dir**

```bash
mv public/hippussuit/mocked_hippussuit_image.png src/assets/hippussuit.png
rmdir public/hippussuit
```

- [ ] **Step 2: Verify the asset is in place**

Run: `ls -la src/assets/hippussuit.png && ls public/hippussuit 2>&1`
Expected: the PNG is listed under `src/assets/`, and `public/hippussuit` no longer exists (`No such file or directory`).

- [ ] **Step 3: Commit**

```bash
git add src/assets/hippussuit.png
git commit -m "chore: bundle hippussuit feature image into src/assets"
```

---

### Task 2: Rebuild the Hippussuit component (TDD)

Replace the entire component. Write the failing test first (it captures every previously-dropped piece of content), then implement the component to make it pass.

**Files:**
- Create: `src/components/Hippussuit.test.jsx`
- Modify (full rewrite): `src/components/Hippussuit.jsx`

**Interfaces:**
- Consumes: `src/assets/hippussuit.png` (Task 1); the `hippussuit` data object shape from `src/data/websiteFallback.json` (the wrapper carries `titulo` and `p1`…`p5`; each `pN` has `txts` with `txt`/`txt2`/… and optionally `ul` with `li`/`li2`/…).
- Produces: default export `Hippussuit({ data })`. `data` is the wrapper object; `data.hippussuit` is the inner content. Returns `null` when `data?.hippussuit` is absent. (App already passes `data={data?.hippussuit}` in `src/App.jsx:39`.)

- [ ] **Step 1: Write the failing test**

Create `src/components/Hippussuit.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Hippussuit from './Hippussuit'

const data = {
  menuText: 'Hippussuit',
  order: 6,
  hippussuit: {
    titulo: 'Hippussuit',
    p1: {
      txts: {
        txt: 'Contexto da equoterapia e do alinhamento postural durante a montaria.',
        txt2: 'O HippusSuit é uma vestimenta dinâmica de borracha sintética com poliamida.',
        txt3: 'O HippusSuit favorece a montaria individual e ativa musculaturas isoladas.',
      },
    },
    p2: {
      txts: {
        txt: 'Nos aspectos motores, o HippusSuit promove:',
        ul: {
          li: 'Motor um',
          li2: 'Motor dois',
          li3: 'Motor três',
          li4: 'Motor quatro',
          li5: 'Motor cinco',
          li6: 'Motor seis',
          li10: 'Motor dez',
        },
      },
    },
    p3: {
      txts: {
        txt: 'Os aspectos comportamentais o HippusSuit promove:',
        ul: {
          li: 'Comportamento um',
          li2: 'Comportamento dois',
          li3: 'Comportamento três',
        },
      },
    },
    p4: {
      txts: {
        txt: 'O uso da órtese pode ser sugerido numa fase do tratamento.',
        txt2: 'Os resultados sinalizam que os recursos são sempre bem vindos.',
      },
    },
    p5: {
      txts: {
        txt: 'Desenvolvido por:',
        ul: {
          li: 'Karina Hollatz – Fisioterapeuta',
          li2: 'André Augusto Amaral Gomes – Equitador/Educador Físico',
          li3: 'Cibele Ferreira Lima – Terapeuta Ocupacional',
          li4: 'Equipe do Centro de Equoterapia e Equitação Projeto Liberdade',
        },
      },
    },
  },
}

test('renders the section heading', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Hippussuit' })).toBeInTheDocument()
})

test('renders all three intro paragraphs including previously dropped txt2 and txt3', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText(/Contexto da equoterapia/i)).toBeInTheDocument()
  expect(screen.getByText(/vestimenta dinâmica de borracha sintética/i)).toBeInTheDocument()
  expect(screen.getByText(/favorece a montaria individual/i)).toBeInTheDocument()
})

test('renders the motor and behavioral benefit headings', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText(/Nos aspectos motores/i)).toBeInTheDocument()
  expect(screen.getByText(/aspectos comportamentais/i)).toBeInTheDocument()
})

test('shows all behavioral items and gives that card no toggle (5 or fewer items)', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText('Comportamento três')).toBeInTheDocument()
  // exactly one toggle on the page — the motor card; the behavioral card has none
  expect(screen.getAllByRole('button', { name: 'Ver mais' })).toHaveLength(1)
})

test('motor card collapses long lists and orders items by numeric suffix', () => {
  render(<Hippussuit data={data} />)
  // collapsed: first five by numeric suffix (um..cinco) are shown
  expect(screen.getByText('Motor cinco')).toBeInTheDocument()
  // item 6 and item 10 are hidden while collapsed — and 'Motor dez' must NOT
  // leak into the first five (it would under a naive string sort)
  expect(screen.queryByText('Motor seis')).toBeNull()
  expect(screen.queryByText('Motor dez')).toBeNull()
  // expanding reveals the rest
  fireEvent.click(screen.getByRole('button', { name: 'Ver mais' }))
  expect(screen.getByText('Motor seis')).toBeInTheDocument()
  expect(screen.getByText('Motor dez')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Ver menos' })).toBeInTheDocument()
})

test('renders both conclusion paragraphs including previously dropped txt2', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText(/pode ser sugerido numa fase/i)).toBeInTheDocument()
  expect(screen.getByText(/recursos são sempre bem vindos/i)).toBeInTheDocument()
})

test('renders the credits block with the heading and all four names', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText('Desenvolvido por:')).toBeInTheDocument()
  expect(screen.getByText(/Karina Hollatz/)).toBeInTheDocument()
  expect(screen.getByText(/André Augusto Amaral Gomes/)).toBeInTheDocument()
  expect(screen.getByText(/Cibele Ferreira Lima/)).toBeInTheDocument()
  expect(screen.getByText(/Equipe do Centro de Equoterapia/)).toBeInTheDocument()
})

test('renders nothing when data is null', () => {
  const { container } = render(<Hippussuit data={null} />)
  expect(container.firstChild).toBeNull()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Hippussuit`
Expected: FAIL — the current component renders no `txt2`/`txt3`, no list items, no credits, so assertions like `getByText(/vestimenta dinâmica/i)` and `getByText('Desenvolvido por:')` throw "Unable to find an element".

- [ ] **Step 3: Write the implementation (full rewrite)**

Replace the entire contents of `src/components/Hippussuit.jsx`:

```jsx
import { useState } from 'react'
import hippussuitImage from '../assets/hippussuit.png'

const COLLAPSE_THRESHOLD = 5

function numericSuffix(key) {
  const match = key.match(/(\d+)$/)
  return match ? parseInt(match[1], 10) : 1
}

function paragraphs(block) {
  if (!block?.txts) return []
  return Object.entries(block.txts)
    .filter(([key, value]) => key.startsWith('txt') && typeof value === 'string')
    .sort(([a], [b]) => numericSuffix(a) - numericSuffix(b))
    .map(([, value]) => value)
}

function listItems(block) {
  const ul = block?.txts?.ul
  if (!ul) return []
  return Object.entries(ul)
    .sort(([a], [b]) => numericSuffix(a) - numericSuffix(b))
    .map(([, value]) => value)
}

function BenefitCard({ heading, items }) {
  const [expanded, setExpanded] = useState(false)
  const collapsible = items.length > COLLAPSE_THRESHOLD
  const visible = expanded || !collapsible ? items : items.slice(0, COLLAPSE_THRESHOLD)
  const listId = `hippussuit-list-${heading.slice(0, 24).replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{heading}</h3>
      <ul id={listId} className="space-y-2">
        {visible.map((item, index) => (
          <li key={index} className="flex gap-2 text-neutral-600 leading-relaxed">
            <span className="text-primary-600 flex-shrink-0" aria-hidden="true">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {collapsible && (
        <button
          type="button"
          className="mt-4 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}

export default function Hippussuit({ data }) {
  if (!data?.hippussuit) return null

  const { hippussuit } = data
  const motor = hippussuit.p2
  const behavioral = hippussuit.p3
  const credits = hippussuit.p5

  return (
    <section id="hippussuit" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12 font-[var(--font-heading)]">
          {hippussuit.titulo || 'Hippussuit'}
        </h2>

        {/* Intro + feature image */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-16">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <img
              src={hippussuitImage}
              alt="Praticante utilizando o HippusSuit durante a montaria"
              className="w-full rounded-[var(--radius-card)] shadow-[var(--shadow-card)] object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 space-y-4">
            {paragraphs(hippussuit.p1).map((text, index) => (
              <p key={index} className="text-neutral-600 leading-relaxed text-lg">{text}</p>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <BenefitCard heading={paragraphs(motor)[0] || ''} items={listItems(motor)} />
          <BenefitCard heading={paragraphs(behavioral)[0] || ''} items={listItems(behavioral)} />
        </div>

        {/* Conclusion */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          {paragraphs(hippussuit.p4).map((text, index) => (
            <p key={index} className="text-neutral-600 leading-relaxed text-lg">{text}</p>
          ))}
        </div>

        {/* Credits */}
        {credits && (
          <div className="max-w-2xl mx-auto bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 text-center">
            <h3 className="text-base font-semibold text-neutral-900 mb-3">
              {paragraphs(credits)[0] || ''}
            </h3>
            <ul className="space-y-1 text-neutral-600">
              {listItems(credits).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- Hippussuit`
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Run the full suite and lint**

Run: `npm test && npm run lint`
Expected: full Vitest suite passes (no regressions in `Servicos`/`Midia`/`Contato` tests) and oxlint reports no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hippussuit.jsx src/components/Hippussuit.test.jsx
git commit -m "feat(hippussuit): render full section content with collapsible benefit lists"
```

---

## Self-Review

**Spec coverage:**
- Heading (`titulo`) → Task 2 component + "renders the section heading" test. ✓
- Intro `p1` `txt`/`txt2`/`txt3` + bundled image → Task 1 (image) + Task 2 intro block + intro-paragraphs test. ✓
- Benefit cards `p2`/`p3` with `Ver mais` collapse, motor gets button / behavioral doesn't → `BenefitCard` + collapse and behavioral-toggle tests. ✓
- Conclusion `p4` `txt`/`txt2` → conclusion block + conclusion test. ✓
- Credits `p5` heading + 4 names → credits block + credits test. ✓
- Numeric-suffix sort for `txt*` and `li*` keys → `numericSuffix` helper + the `li10` ordering assertion. ✓
- Image moved to `src/assets`, `public/hippussuit/` removed, Firebase helper dropped → Task 1 + the rewritten component (no `getImageUrl`). ✓
- `bg-neutral-50` retained, no color tokens added → component `section` className; Global Constraints. ✓
- `Hippussuit.test.jsx` added covering dropped content → Task 2 Step 1. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to" — every step shows full code or exact commands. ✓

**Type consistency:** `numericSuffix`, `paragraphs`, `listItems`, `BenefitCard({ heading, items })`, and default `Hippussuit({ data })` are named and used identically across the test and implementation. The `import hippussuitImage from '../assets/hippussuit.png'` path matches Task 1's output. ✓
