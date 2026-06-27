# Serviços Section Layout Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the Serviços section from rendering blank cards and from rendering its intro paragraph as a service card; instead show the intro as centered lead text under the heading.

**Architecture:** Render-only change to `src/components/Servicos.jsx`. Introduce a shape-based predicate to keep only real service entries in the card grid, extract the `servicos` sub-entry (the section intro) by key, and render its paragraph between the `<h2>` and the grid. No data file changes.

**Tech Stack:** React 19, Vitest 4 + @testing-library/react, Tailwind CSS 4.

## Global Constraints

- Test runner: `npx vitest run` (package.json `test` script is `vitest run`).
- Tests are colocated as `src/components/<Name>.test.jsx` and use `render`/`screen` from `@testing-library/react`.
- No changes to `src/data/websiteFallback.json` or any other component.
- Section heading text stays exactly `Nossos Serviços`.
- The card grid must show exactly the 8 real services sorted ascending by `order`.

---

### Task 1: Fix Serviços rendering (filter cards + promote intro)

**Files:**
- Modify: `src/components/Servicos.jsx`
- Test: `src/components/Servicos.test.jsx` (create)

**Interfaces:**
- Consumes: `Servicos({ data })` where `data` is the `servicos` node of the website data. Relevant entries:
  - Real services: object values with a string `menuText` and at least one key starting with `p` (e.g. `equoterapia`, `natacao`).
  - Intro: `data.servicos` = `{ menuText: "Serviços", order: 0, p1: { txts: { txt: "..." } }, titulo: "Serviços" }`.
  - Non-cards: `menuText` (string), `order` (number), `submenu` (boolean).
- Produces: rendered DOM — one `<h2>` "Nossos Serviços", one intro `<p>` (when `data.servicos` exists), and N service cards each with an `<h3>` of the service `menuText`.

- [ ] **Step 1: Write the failing test**

Create `src/components/Servicos.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import Servicos from './Servicos'

const data = {
  menuText: 'Serviços',
  order: 5,
  submenu: true,
  servicos: {
    menuText: 'Serviços',
    order: 0,
    p1: { txts: { txt: 'O Projeto Liberdade conta com profissionais das áreas da saúde e educação.' } },
    titulo: 'Serviços',
  },
  equoterapia: {
    menuText: 'Equoterapia',
    order: 1,
    p1: { txts: { txt: 'A Equoterapia é um método terapêutico.' } },
    p2: { txts: { txt: 'Emprega o cavalo como agente promotor de ganhos.' } },
    titulo: 'Equoterapia',
  },
  natacao: {
    menuText: 'Natação',
    order: 2,
    p1: { txts: { txt: 'A natação é uma atividade aquática.' } },
    titulo: 'Natação',
  },
}

test('renders the section heading', () => {
  render(<Servicos data={data} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Nossos Serviços' })).toBeInTheDocument()
})

test('renders the intro paragraph as lead text, not as a card', () => {
  render(<Servicos data={data} />)
  // intro text is present
  expect(screen.getByText(/profissionais das áreas da saúde e educação/i)).toBeInTheDocument()
  // but "Serviços" is NOT one of the service card headings (h3)
  expect(screen.queryByRole('heading', { level: 3, name: 'Serviços' })).toBeNull()
})

test('renders one card per real service and no blank cards', () => {
  render(<Servicos data={data} />)
  const cardHeadings = screen.getAllByRole('heading', { level: 3 })
  expect(cardHeadings.map((h) => h.textContent)).toEqual(['Equoterapia', 'Natação'])
})

test('sorts cards by order ascending', () => {
  const reordered = {
    ...data,
    equoterapia: { ...data.equoterapia, order: 9 },
    natacao: { ...data.natacao, order: 1 },
  }
  render(<Servicos data={reordered} />)
  const cardHeadings = screen.getAllByRole('heading', { level: 3 })
  expect(cardHeadings.map((h) => h.textContent)).toEqual(['Natação', 'Equoterapia'])
})

test('renders nothing when data is null', () => {
  const { container } = render(<Servicos data={null} />)
  expect(container.firstChild).toBeNull()
})

test('renders without intro when servicos entry is absent', () => {
  const { servicos, ...withoutIntro } = data
  render(<Servicos data={withoutIntro} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Nossos Serviços' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 3, name: 'Equoterapia' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Servicos.test.jsx`
Expected: FAIL — the "no blank cards" / "intro not a card" assertions fail because the current filter renders `submenu` (blank) and `servicos` (as an `<h3>` "Serviços") as cards.

- [ ] **Step 3: Write minimal implementation**

Replace the body of `src/components/Servicos.jsx` with:

```jsx
import { useState } from 'react'

function extractServiceText(service) {
  return Object.entries(service)
    .filter(([key]) => key.startsWith('p'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value.txts?.txt || value)
}

function isServiceEntry(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.menuText === 'string' &&
    Object.keys(value).some((key) => key.startsWith('p'))
  )
}

function ServiceCard({ service }) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = extractServiceText(service)
  const preview = paragraphs[0] || ''
  const cardId = `service-${service.menuText?.replace(/\s/g, '-').toLowerCase()}`

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 flex flex-col">
      <h3 className="text-xl font-semibold text-neutral-900 mb-3">
        {service.menuText}
      </h3>
      <p className="text-neutral-600 leading-relaxed flex-1">
        {expanded ? paragraphs.join(' ') : preview}
      </p>
      {paragraphs.length > 1 && (
        <button
          type="button"
          className="mt-4 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors self-start"
          aria-expanded={expanded}
          aria-controls={cardId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}

export default function Servicos({ data }) {
  if (!data) return null

  // TODO: The section intro currently lives inside the `servicos` sub-key,
  // which is shaped like a service item. Ideally a future reshape of the
  // source JSON should lift the intro out of the service items into a
  // dedicated field, so this special-casing by key can be removed.
  const intro = data.servicos
  const introParagraphs = isServiceEntry(intro) ? extractServiceText(intro) : []

  const services = Object.entries(data)
    .filter(([key, value]) => key !== 'servicos' && isServiceEntry(value))
    .map(([, value]) => value)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <section id="servicos" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-6 font-[var(--font-heading)]">
        Nossos Serviços
      </h2>
      {introParagraphs.length > 0 && (
        <p className="text-neutral-600 leading-relaxed text-center max-w-3xl mx-auto mb-12">
          {introParagraphs.join(' ')}
        </p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.menuText} service={service} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Servicos.test.jsx`
Expected: PASS (all 6 tests).

- [ ] **Step 5: Run the full suite and lint**

Run: `npx vitest run && npx oxlint`
Expected: all tests PASS, no lint errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Servicos.jsx src/components/Servicos.test.jsx
git commit -m "fix(servicos): drop blank cards and promote intro to lead text"
```

---

## Self-Review

**Spec coverage:**
- Robust service filtering (`isServiceEntry`, excludes `submenu`/`menuText`/`order`/`servicos`) → Task 1 Step 3 + "no blank cards" / "one card per real service" tests. ✅
- Promote intro paragraph to centered lead text under heading → Task 1 Step 3 (`introParagraphs` block, `text-center max-w-3xl mx-auto`) + "intro as lead text, not a card" test. ✅
- Graceful degradation when intro absent → "renders without intro" test. ✅
- TODO marker for future JSON reshape → Task 1 Step 3 comment above `const intro`. ✅
- No data file changes; heading stays "Nossos Serviços"; cards sorted by order → Global Constraints + "sorts cards by order" test. ✅

**Placeholder scan:** No TBD/TODO-as-work, no "add error handling", all code blocks complete. (The one `// TODO:` is an intentional in-code marker required by the spec, not a plan placeholder.) ✅

**Type consistency:** `isServiceEntry` and `extractServiceText` are defined once and referenced consistently; `data.servicos` extraction matches the spec's described shape. ✅
