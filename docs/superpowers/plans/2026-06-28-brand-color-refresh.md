# Brand Color Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retune the site's Tailwind theme to the real brand colors (green `#00AA5A` lead, purple `#3A3985` accent) and apply color to headings, buttons, links, and neutrals so the site stops reading as pallid — without heavy colored section fills.

**Architecture:** Tailwind v4 exposes the palette as CSS custom properties in the `@theme` block of `src/index.css`; components consume them via utility classes like `text-primary-600`. We (1) replace the color scales in `@theme`, (2) extract the repeated section-heading markup into a shared `SectionHeading` component that renders purple heading text with a short green accent bar, (3) apply that component across the six sections, and (4) add small purple/brand accent touches to the Header and Hero and normalize stray raw-Tailwind greens.

**Tech Stack:** React 19, Tailwind CSS v4 (`@tailwindcss/vite`), Vite, Vitest + Testing Library.

## Global Constraints

- Brand green hex is exactly `#00aa5a`; brand purple hex is exactly `#3a3985`. Use these verbatim as `primary-500` and `secondary-700` respectively.
- Keep the "gentle warm-up" scope: no new heavy colored section backgrounds, no layout/typography/spacing changes.
- Brand color tokens only — prefer `primary-*` / `secondary-*` / `neutral-*` utilities over raw Tailwind colors (`green-*`, `blue-*`, etc.).
- White text on green buttons and purple-on-white heading text must meet WCAG AA contrast.
- After every task: `npm run test` and `npm run build` must both pass.

---

### Task 1: Retune the theme palette

Replace the three brand color scales in the `@theme` block, remove the unused `accent` (blue) scale, and replace the old yellow `secondary` with purple. This is CSS-only; no behavior is testable in unit tests, so verification is the build plus the existing test suite (which must stay green).

**Files:**
- Modify: `src/index.css` (the `@theme { ... }` color declarations)

**Interfaces:**
- Consumes: nothing.
- Produces: the Tailwind color tokens `--color-primary-50..900` (green), `--color-secondary-50..900` (purple), `--color-neutral-50..900` (cool-tinted). All later tasks rely on these utility classes resolving to brand colors.

- [ ] **Step 1: Replace the primary (green) scale**

In `src/index.css`, replace the existing `--color-primary-*` block with:

```css
  --color-primary-50: #e8f8f0;
  --color-primary-100: #c5edd8;
  --color-primary-200: #8fdcb4;
  --color-primary-300: #4ec888;
  --color-primary-400: #14b56a;
  --color-primary-500: #00aa5a;
  --color-primary-600: #009350;
  --color-primary-700: #007a43;
  --color-primary-800: #066138;
  --color-primary-900: #07502f;
```

- [ ] **Step 2: Replace the secondary scale with purple**

Replace the existing `--color-secondary-*` (yellow) block with:

```css
  --color-secondary-50: #eeeef6;
  --color-secondary-100: #d6d6ec;
  --color-secondary-200: #b3b2d8;
  --color-secondary-300: #8b8ac0;
  --color-secondary-400: #6361a4;
  --color-secondary-500: #4b4a93;
  --color-secondary-600: #41408b;
  --color-secondary-700: #3a3985;
  --color-secondary-800: #302f6b;
  --color-secondary-900: #262550;
```

- [ ] **Step 3: Remove the unused accent (blue) scale**

Delete the entire `--color-accent-50` through `--color-accent-900` block from `@theme`.

- [ ] **Step 4: Replace the neutral scale with the cool-tinted version**

Replace the existing `--color-neutral-*` block with:

```css
  --color-neutral-50: #f8f8fb;
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

- [ ] **Step 5: Verify tests pass**

Run: `npm run test`
Expected: PASS (no test asserts color classes, so all existing suites stay green).

- [ ] **Step 6: Verify the build succeeds**

Run: `npm run build`
Expected: exit 0, `dist/` produced, no Tailwind/CSS errors.

- [ ] **Step 7: Commit**

```bash
git add src/index.css
git commit -m "style(theme): retune palette to brand green and purple"
```

---

### Task 2: Create the shared `SectionHeading` component

A single component that renders an `h2` in brand purple with a short green accent bar below it. This is genuinely testable (it must render its children as a level-2 heading), so it gets a real unit test.

**Files:**
- Create: `src/components/SectionHeading.jsx`
- Test: `src/components/SectionHeading.test.jsx`

**Interfaces:**
- Consumes: brand tokens from Task 1 (`text-secondary-700`, `bg-primary-500`).
- Produces: `export default function SectionHeading({ children, className })` — renders an `<h2>` containing `children` plus a decorative accent bar, wrapped in a centered `<div>` that receives `className` (used by callers for bottom-margin spacing, e.g. `"mb-12"`). The heading text is exposed as an accessible level-2 heading named by `children`.

- [ ] **Step 1: Write the failing test**

Create `src/components/SectionHeading.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SectionHeading from './SectionHeading'

describe('SectionHeading', () => {
  it('renders its children as a level-2 heading', () => {
    render(<SectionHeading>Nossa História</SectionHeading>)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossa História' })
    ).toBeInTheDocument()
  })

  it('applies the className to the wrapper for spacing', () => {
    const { container } = render(
      <SectionHeading className="mb-12">Contato</SectionHeading>
    )
    expect(container.firstChild).toHaveClass('mb-12')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/SectionHeading.test.jsx`
Expected: FAIL — cannot resolve `./SectionHeading` (module does not exist yet).

- [ ] **Step 3: Implement the component**

Create `src/components/SectionHeading.jsx`:

```jsx
export default function SectionHeading({ children, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-3xl sm:text-4xl font-bold text-secondary-700 font-[var(--font-heading)]">
        {children}
      </h2>
      <span
        className="block mx-auto mt-3 h-1 w-16 rounded-full bg-primary-500"
        aria-hidden="true"
      />
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/SectionHeading.test.jsx`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/SectionHeading.jsx src/components/SectionHeading.test.jsx
git commit -m "feat(ui): add SectionHeading with purple text and green accent bar"
```

---

### Task 3: Apply `SectionHeading` across the six sections

Replace each section's hand-rolled `<h2 ... text-neutral-900 ...>` with `<SectionHeading>`, preserving each section's existing bottom-margin via the `className` prop. The text content (and thus all heading-based test queries) is unchanged.

**Files:**
- Modify: `src/components/Historia.jsx:12-14`
- Modify: `src/components/MissaoVisaoValores.jsx:25-27`
- Modify: `src/components/Servicos.jsx:65-67`
- Modify: `src/components/Hippussuit.jsx:70-72`
- Modify: `src/components/Midia.jsx:182-184`
- Modify: `src/components/Contato.jsx:41-43`

**Interfaces:**
- Consumes: `SectionHeading` from Task 2.
- Produces: nothing new.

- [ ] **Step 1: Update `Historia.jsx`**

Add the import at the top of the file:

```jsx
import SectionHeading from './SectionHeading'
```

Replace:

```jsx
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12 font-[var(--font-heading)]">
        {historia.titulo || 'Nossa História'}
      </h2>
```

with:

```jsx
      <SectionHeading className="mb-12">
        {historia.titulo || 'Nossa História'}
      </SectionHeading>
```

- [ ] **Step 2: Update `MissaoVisaoValores.jsx`**

Add the import after the existing `import { useState } from 'react'` line:

```jsx
import SectionHeading from './SectionHeading'
```

Replace:

```jsx
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-10 font-[var(--font-heading)]">
          Missão, Visão e Valores
        </h2>
```

with:

```jsx
        <SectionHeading className="mb-10">Missão, Visão e Valores</SectionHeading>
```

- [ ] **Step 3: Update `Servicos.jsx`**

Add the import after the existing `import { useState } from 'react'` line:

```jsx
import SectionHeading from './SectionHeading'
```

Replace:

```jsx
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-6 font-[var(--font-heading)]">
        Nossos Serviços
      </h2>
```

with:

```jsx
      <SectionHeading className="mb-6">Nossos Serviços</SectionHeading>
```

- [ ] **Step 4: Update `Hippussuit.jsx`**

Add the import after the existing image import (`import hippussuitImage from '../assets/hippussuit.png'`):

```jsx
import SectionHeading from './SectionHeading'
```

Replace:

```jsx
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12 font-[var(--font-heading)]">
          {hippussuit.titulo || 'Hippussuit'}
        </h2>
```

with:

```jsx
        <SectionHeading className="mb-12">
          {hippussuit.titulo || 'Hippussuit'}
        </SectionHeading>
```

- [ ] **Step 5: Update `Midia.jsx`**

Add the import after the existing `import { getImageUrl } from '../utils/imageUrl'` line:

```jsx
import SectionHeading from './SectionHeading'
```

Replace:

```jsx
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-10 font-[var(--font-heading)]">
        Mídia
      </h2>
```

with:

```jsx
      <SectionHeading className="mb-10">Mídia</SectionHeading>
```

- [ ] **Step 6: Update `Contato.jsx`**

Add the import at the very top of the file (above the `UnitCard` function):

```jsx
import SectionHeading from './SectionHeading'
```

Replace:

```jsx
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12 font-[var(--font-heading)]">
        {data.titulo || 'Contato'}
      </h2>
```

with:

```jsx
      <SectionHeading className="mb-12">
        {data.titulo || 'Contato'}
      </SectionHeading>
```

- [ ] **Step 7: Verify tests pass**

Run: `npm run test`
Expected: PASS — heading queries (by role/level/text) still resolve because `SectionHeading` renders an `<h2>` with the same text.

- [ ] **Step 8: Verify the build succeeds**

Run: `npm run build`
Expected: exit 0, no errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/Historia.jsx src/components/MissaoVisaoValores.jsx src/components/Servicos.jsx src/components/Hippussuit.jsx src/components/Midia.jsx src/components/Contato.jsx
git commit -m "style(sections): use SectionHeading for colored section titles"
```

---

### Task 4: Apply purple/brand accents to Header, Hero, and Contato

Make purple visible as the navigational/secondary accent, warm the Hero overlay toward brand tones, and normalize the stray raw-Tailwind greens in Contato to brand tokens.

**Files:**
- Modify: `src/components/Header.jsx:33` and `src/components/Header.jsx:74`
- Modify: `src/components/Hero.jsx:45` and `src/components/Hero.jsx:68-71`
- Modify: `src/components/Contato.jsx:60` and `src/components/Contato.jsx:62`

**Interfaces:**
- Consumes: brand tokens from Task 1.
- Produces: nothing new.

- [ ] **Step 1: Header desktop nav hover → purple**

In `src/components/Header.jsx`, replace:

```jsx
                className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors no-underline"
```

with:

```jsx
                className="text-sm font-medium text-neutral-700 hover:text-secondary-700 transition-colors no-underline"
```

- [ ] **Step 2: Header mobile menu hover → purple**

In `src/components/Header.jsx`, replace:

```jsx
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 no-underline"
```

with:

```jsx
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-secondary-50 hover:text-secondary-700 no-underline"
```

- [ ] **Step 3: Hero overlay → warm brand gradient**

In `src/components/Hero.jsx`, replace:

```jsx
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
```

with:

```jsx
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/60 via-black/30 to-primary-900/60" />
```

- [ ] **Step 4: Hero secondary button → purple**

In `src/components/Hero.jsx`, replace:

```jsx
          <a
            href="#contato"
            className="px-6 py-3 bg-white/20 text-white border border-white/40 rounded-[var(--radius-button)] font-medium hover:bg-white/30 transition-colors no-underline backdrop-blur-sm"
          >
            Entre em Contato
          </a>
```

with:

```jsx
          <a
            href="#contato"
            className="px-6 py-3 bg-secondary-700/80 text-white border border-white/30 rounded-[var(--radius-button)] font-medium hover:bg-secondary-700 transition-colors no-underline backdrop-blur-sm shadow-lg"
          >
            Entre em Contato
          </a>
```

- [ ] **Step 5: Contato WhatsApp card → brand tokens**

In `src/components/Contato.jsx`, replace:

```jsx
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors no-underline"
                >
                  <span className="text-green-600 text-xl" aria-hidden="true">📱</span>
```

with:

```jsx
                  className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors no-underline"
                >
                  <span className="text-primary-600 text-xl" aria-hidden="true">📱</span>
```

- [ ] **Step 6: Verify tests pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 7: Verify the build succeeds**

Run: `npm run build`
Expected: exit 0, no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/Header.jsx src/components/Hero.jsx src/components/Contato.jsx
git commit -m "style(accents): apply purple nav/hero accents and normalize brand greens"
```

---

### Task 5: Visual verification and contrast check

Confirm the refresh looks right in a real browser and meets contrast requirements. This is a manual verification task — no code changes unless a problem is found.

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite serves the site (default `http://localhost:5173`).

- [ ] **Step 2: Visual checklist**

Open the site and confirm:
- Primary buttons ("Nossos Serviços", "Ver mais", tabs) are brand green `#00aa5a`.
- Section headings (História, Missão, Serviços, Hippussuit, Mídia, Contato) are purple `#3a3985` with a short green accent bar centered beneath each.
- Header nav links turn purple on hover.
- Hero secondary button ("Entre em Contato") is purple; the photo overlay reads as a subtle purple→green darkening, with the white logo/headline still clearly legible.
- Backgrounds that were flat gray/white (e.g. Missão `bg-primary-50`, Hippussuit `bg-neutral-50`) now sit on the faintly cool-tinted neutrals — subtly warmer, not white-flat.
- No leftover blue or yellow anywhere.

- [ ] **Step 3: Contrast check**

Using browser devtools (or a contrast checker), confirm WCAG AA:
- White text on green buttons (`primary-500 #00aa5a` / `primary-600 #009350`) ≥ 4.5:1 for the button label sizes; if `primary-500` fails, the affected buttons should use `primary-600`.
- Purple heading text (`secondary-700 #3a3985`) on white and on `primary-50` backgrounds ≥ 4.5:1.

If any check fails, fix the offending class (e.g. bump a green button to `primary-700`, or a heading to `secondary-800`), re-run `npm run test` and `npm run build`, and commit with message `style: fix contrast on <element>`.

- [ ] **Step 4: Stop the dev server**

Stop the `npm run dev` process (Ctrl+C).
