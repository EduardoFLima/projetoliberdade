# Service Card Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a line-art icon in a design-token color inside an alternating green/purple badge to every service card, on both the Serviços page and the home featured-services grid.

**Architecture:** A new presentational `ServiceIcon` component maps a content-supplied icon key to one of two renderers — an inline SVG (real Material Symbols outlined path data) for the three simple glyphs, or a CSS-masked `<span>` for the four horse illustrations (baked circle stripped to a transparent alpha mask, token color painted through via `background-color: currentColor`). The badge circle and tone are drawn from design tokens, alternating by card index. Content carries only a string key, so the dependency rule holds.

**Tech Stack:** React + TypeScript, Tailwind v4 (`@theme` tokens in `src/index.css`), Vitest + Testing Library, Python 3 + Pillow (build-time mask generation only — not a runtime dependency).

## Global Constraints

- No new runtime/npm dependency and no new icon library (spec: "No new runtime dependency").
- Colors come exclusively from existing design tokens; introduce no new hex values (spec: "colors follow the tokens").
- Dependency rule: files under `features`/`components`/`layouts` never import `content.json`; content flows via selectors → props.
- Code style (Prettier): no semicolons, single quotes, trailing commas.
- Icons are decorative: every badge/glyph carries `aria-hidden="true"`.
- Visual-first: the icon set MUST be screenshotted and approved by the user (Task 3 gate) BEFORE any content wiring (Tasks 4–6).
- Source icons live in `docs/resources/icons/` (already committed on this branch). Generated masks go in `public/icons/` (served at `/icons/...`).

**Canonical icon-key mapping** (used verbatim throughout):

| Service slug | icon key | renderer |
|---|---|---|
| `equoterapia` | `equine-therapy` | mask |
| `equitacao-classica` | `classical-equitation` | mask |
| `equitacao-ludica` | `playful-riding` | mask |
| `equitacao-adaptada` | `adaptive-equitation` | mask |
| `pet-terapia` | `pets` | Material SVG |
| `hidroterapia` | `pool` | Material SVG |
| `reabilitacao-neurofuncional` | `psychology` | Material SVG |

---

### Task 1: Generate icon mask assets

**Files:**
- Create: `scripts/make-icon-masks.py`
- Create (generated output): `public/icons/equine-therapy.mask.png`, `public/icons/classical-equitation.mask.png`, `public/icons/playful-riding.mask.png`, `public/icons/adaptive-equitation.mask.png`

**Interfaces:**
- Consumes: source PNGs in `docs/resources/icons/{key}.png`.
- Produces: transparent RGBA masks at `public/icons/{key}.mask.png` whose alpha channel = stroke coverage (dark strokes → opaque, pale circle + white canvas → transparent). Consumed by Task 2's `MASK_SRC`.

- [ ] **Step 1: Write the mask-generation script**

Create `scripts/make-icon-masks.py`:

```python
"""Convert line-art service icons (dark strokes on a pale baked circle)
into transparent alpha masks for CSS mask-image. Build-time tool; the
site has no Python runtime dependency."""

import os

import numpy as np
from PIL import Image, ImageOps

SRC = "docs/resources/icons"
DST = "public/icons"
NAMES = [
    "equine-therapy",
    "classical-equitation",
    "playful-riding",
    "adaptive-equitation",
]
LO, HI = 70, 180  # luminance-inversion normalization; tune in the Task 3 preview
PAD = 0.12  # padding fraction around the trimmed glyph on the square canvas


def make_mask(name: str) -> None:
    img = Image.open(f"{SRC}/{name}.png").convert("RGB")
    inv = ImageOps.invert(ImageOps.grayscale(img))  # strokes bright, bg dark
    a = np.asarray(inv, dtype=np.float32)
    a = np.clip((a - LO) / (HI - LO), 0.0, 1.0) * 255.0
    alpha = Image.fromarray(a.astype("uint8"), "L")

    black = Image.new("L", alpha.size, 0)
    rgba = Image.merge("RGBA", (black, black, black, alpha))

    bbox = alpha.getbbox()
    if bbox is not None:
        rgba = rgba.crop(bbox)

    w, h = rgba.size
    side = int(max(w, h) * (1 + 2 * PAD))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(rgba, ((side - w) // 2, (side - h) // 2))
    canvas.save(f"{DST}/{name}.mask.png")
    print(name, rgba.size, "->", canvas.size)


def main() -> None:
    os.makedirs(DST, exist_ok=True)
    for name in NAMES:
        make_mask(name)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the script**

Run: `python3 scripts/make-icon-masks.py`
Expected: four lines like `equine-therapy (612, 640) -> (768, 768)` and four files in `public/icons/`.

- [ ] **Step 3: Verify the masks have real transparency and opacity**

Run:
```bash
python3 - <<'PY'
from PIL import Image
for n in ["equine-therapy","classical-equitation","playful-riding","adaptive-equitation"]:
    im = Image.open(f"public/icons/{n}.mask.png")
    assert im.mode == "RGBA", (n, im.mode)
    lo, hi = im.getchannel("A").getextrema()
    assert lo == 0 and hi > 200, (n, lo, hi)  # transparent bg + opaque strokes
    print(n, "ok", im.size)
PY
```
Expected: four `... ok ...` lines, no assertion error.

- [ ] **Step 4: Commit**

```bash
git add scripts/make-icon-masks.py public/icons
git commit -m "feat: generate transparent masks for service illustration icons"
```

---

### Task 2: ServiceIcon component

**Files:**
- Create: `src/components/ui/ServiceIcon.tsx`
- Test: `src/components/ui/ServiceIcon.test.tsx`

**Interfaces:**
- Consumes: mask assets `/icons/{key}.mask.png` (Task 1); `cn` from `src/lib/cn`.
- Produces: `export function ServiceIcon({ icon, index, className }: { icon: string; index: number; className?: string }): JSX.Element | null`. Renders a badge `<span>` carrying `data-tone` (`"green"` for even `index`, `"purple"` for odd) and `data-icon={icon}`; returns `null` for unknown keys. Consumed by Task 4.

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/ServiceIcon.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ServiceIcon } from './ServiceIcon'

describe('ServiceIcon', () => {
  it('renders an inline svg for a Material glyph key', () => {
    const { container } = render(<ServiceIcon icon="pets" index={0} />)
    expect(
      container.querySelector('[data-icon="pets"] svg'),
    ).toBeInTheDocument()
  })

  it('renders a masked span for an illustration key', () => {
    const { container } = render(
      <ServiceIcon icon="equine-therapy" index={0} />,
    )
    const glyph = container.querySelector<HTMLElement>(
      '[data-icon="equine-therapy"] > span',
    )
    expect(glyph).not.toBeNull()
    expect(glyph?.style.maskImage).toContain('/icons/equine-therapy.mask.png')
  })

  it('alternates tone by index parity', () => {
    const { container: even } = render(<ServiceIcon icon="pets" index={0} />)
    const { container: odd } = render(<ServiceIcon icon="pets" index={1} />)
    expect(even.querySelector('[data-tone="green"]')).toBeInTheDocument()
    expect(odd.querySelector('[data-tone="purple"]')).toBeInTheDocument()
  })

  it('renders nothing for an unknown key', () => {
    const { container } = render(<ServiceIcon icon="nope" index={0} />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/ui/ServiceIcon.test.tsx`
Expected: FAIL — cannot resolve `./ServiceIcon`.

- [ ] **Step 3: Write the component**

Create `src/components/ui/ServiceIcon.tsx` (the three `MATERIAL_PATHS` values are the real Material Symbols outlined `pets` / `pool` / `psychology` paths, viewBox `0 -960 960 960`):

```tsx
import { cn } from '../../lib/cn'

interface ServiceIconProps {
  icon: string
  index: number
  className?: string
}

const MATERIAL_PATHS: Record<string, string> = {
  pets: 'M169.86-485Q132-485 106-511.14t-26-64Q80-613 106.14-639t64-26Q208-665 234-638.86t26 64Q260-537 233.86-511t-64 26ZM291-681.14q-26-26.14-26-64T291.14-809q26.14-26 64-26T419-808.86q26 26.14 26 64T418.86-681q-26.14 26-64 26T291-681.14Zm250 0q-26-26.14-26-64T541.14-809q26.14-26 64-26T669-808.86q26 26.14 26 64T668.86-681q-26.14 26-64 26T541-681.14ZM789.86-485Q752-485 726-511.14t-26-64Q700-613 726.14-639t64-26Q828-665 854-638.86t26 64Q880-537 853.86-511t-64 26ZM266-75q-42 0-69-31.53-27-31.52-27-74.47 0-42 25.5-74.5T250-318q22-22 41-46.5t36-50.5q29-44 65-82t88-38q52 0 88.5 38t65.5 83q17 26 35.5 50t40.5 46q29 30 54.5 62.5T790-181q0 42.95-27 74.47Q736-75 694-75q-54 0-107-9t-107-9q-54 0-107 9t-107 9Z',
  pool: 'M80-120v-64q36-3 57.5-21t67.5-18q46 0 75 21.5t67 21.5q38 0 62.5-21.5T480-223q46 0 75 21.5t67 21.5q38 0 63-21.5t71-21.5q46 0 67 18t57 21v64q-35-3-60.5-22.5T756-162q-38 0-65 21t-69 21q-42 0-73-21t-69-21q-38 0-66.5 21T343-120q-42 0-71-21t-67-21q-38 0-64 19.5T80-120Zm0-188v-60q36-3 57.5-20.5T205-406q46 0 73 19t65 19q38 0 64.5-19t72.5-19q46 0 73 19t65 19q38 0 65-19t73-19q46 0 67 17.5t57 20.5v60q-35-3-60.5-22.5T756-350q-38 0-65 21t-69 21q-42 0-73-21t-69-21q-38 0-64.5 21T347-308q-42 0-73-21t-69-21q-38 0-64 19.5T80-308Zm208-208 135-135-54-54q-34-34-69-45.5T211-762v-79q72 0 118.5 18t90.5 62l253 253q-11 9-25.5 13t-29.5 4q-38 0-65.5-21T480-533q-45 0-72 21t-65 21q-18 0-32.5-7T288-516Zm447.5-293.5Q763-782 763-742t-27.5 67.5Q708-647 668-647t-67.5-27.5Q573-702 573-742t27.5-67.5Q628-837 668-837t67.5 27.5Z',
  psychology: 'M240-80v-172q-57-52-88.5-121.5T120-520q0-150 105-255t255-105q125 0 221.5 73.5T827-615l55 218q4 14-5 25.5T853-360h-93v140q0 24.75-17.62 42.37Q724.75-160 700-160H600v80h-60v-140h160v-200h114l-45-180q-24-97-105-158.5T480-820q-125 0-212.5 86.5T180-522.46q0 64.42 26.32 122.39Q232.65-342.09 281-297l19 18v199h-60Zm257-370Zm-48 76h60l3-44q12-2 22.47-8.46Q544.94-432.92 553-441l42 14 28-48-30-24q5-14 5-29t-5-29l30-24-28-48-42 14q-8.33-7.69-19.17-13.85Q523-635 512-638l-3-44h-60l-3 44q-11 3-21.83 9.15Q413.33-622.69 405-615l-42-14-28 48 30 24q-5 14-5 29t5 29l-30 24 28 48 42-14q8.06 8.08 18.53 14.54Q434-420 446-418l3 44Zm-19.5-104.38q-20.5-20.38-20.5-49.5t20.38-49.62q20.38-20.5 49.5-20.5t49.62 20.38q20.5 20.38 20.5 49.5t-20.38 49.62q-20.38 20.5-49.5 20.5t-49.62-20.38Z',
}

const MASK_SRC: Record<string, string> = {
  'equine-therapy': '/icons/equine-therapy.mask.png',
  'classical-equitation': '/icons/classical-equitation.mask.png',
  'playful-riding': '/icons/playful-riding.mask.png',
  'adaptive-equitation': '/icons/adaptive-equitation.mask.png',
}

export function ServiceIcon({ icon, index, className }: ServiceIconProps) {
  const materialPath = MATERIAL_PATHS[icon]
  const maskSrc = MASK_SRC[icon]
  if (!materialPath && !maskSrc) return null

  const tone = index % 2 === 0 ? 'green' : 'purple'
  const toneClass =
    tone === 'green'
      ? 'bg-primary/10 text-primary'
      : 'bg-secondary/15 text-secondary'

  return (
    <span
      data-tone={tone}
      data-icon={icon}
      aria-hidden="true"
      className={cn(
        'inline-flex h-14 w-14 items-center justify-center rounded-full',
        toneClass,
        className,
      )}
    >
      {materialPath ? (
        <svg viewBox="0 -960 960 960" fill="currentColor" className="h-7 w-7">
          <path d={materialPath} />
        </svg>
      ) : (
        <span
          className="h-8 w-8 bg-current"
          style={{
            maskImage: `url(${maskSrc})`,
            WebkitMaskImage: `url(${maskSrc})`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
          }}
        />
      )}
    </span>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/ui/ServiceIcon.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ServiceIcon.tsx src/components/ui/ServiceIcon.test.tsx
git commit -m "feat: add ServiceIcon with tokenized alternating badges"
```

---

### Task 3: Style-guide preview + VISUAL APPROVAL GATE

**Files:**
- Modify: `src/styleguide/StyleGuide.tsx`

**Interfaces:**
- Consumes: `ServiceIcon` (Task 2).
- Produces: a visible "Ícones de serviço" section on `/estilo` rendering all seven icons at indices 0–6. No downstream code depends on this; it exists for the approval gate.

- [ ] **Step 1: Add the preview section**

In `src/styleguide/StyleGuide.tsx`, add the import at the top with the other component imports:

```tsx
import { ServiceIcon } from '../components/ui/ServiceIcon'
```

Add this constant next to the other module-level arrays (e.g. after `swatches`):

```tsx
const serviceIcons = [
  ['equine-therapy', 'Equoterapia'],
  ['classical-equitation', 'Equitação Clássica'],
  ['playful-riding', 'Equitação Lúdica'],
  ['adaptive-equitation', 'Equitação Adaptada'],
  ['pets', 'Pet Terapia'],
  ['pool', 'Hidroterapia'],
  ['psychology', 'Reabilitação Neurofuncional'],
]
```

Add this `<Section>` inside the returned tree, right after the opening `<h1>` line (`<h1 ...>Estilo</h1>`):

```tsx
<Section className="mt-8">
  <h2 className="font-display text-headline-md">Ícones de serviço</h2>
  <div className="mt-4 flex flex-wrap gap-6">
    {serviceIcons.map(([icon, label], i) => (
      <div key={icon} className="flex w-28 flex-col items-center gap-2">
        <ServiceIcon icon={icon} index={i} />
        <span className="text-center text-label-sm text-on-surface-variant">
          {label}
        </span>
      </div>
    ))}
  </div>
</Section>
```

- [ ] **Step 2: Verify it renders and typechecks**

Run: `npm run build`
Expected: build succeeds (tsc + vite), no type errors.

- [ ] **Step 3: Screenshot the preview**

Run: `npm run dev` (background), then use the Playwright MCP server to navigate to `http://localhost:5173/estilo` and screenshot the "Ícones de serviço" section (full page is fine).

- [ ] **Step 4: VISUAL APPROVAL GATE — present to the user**

Show the screenshot and ask the user to approve the icon set. Check specifically:
- All seven read as one line-art family at a consistent weight.
- Alternating green/purple badges look right and have adequate contrast (green glyph on pale-green badge; purple glyph on pale-lilac badge).
- The three Material glyphs (`pets`/`pool`/`psychology`) match the intended mockup meanings.

If the masked illustrations look faint, muddy, or clipped, adjust `LO`/`HI`/`PAD` in `scripts/make-icon-masks.py`, re-run `python3 scripts/make-icon-masks.py`, and re-screenshot. If badge tint/contrast needs tuning, adjust the opacity in `toneClass` (`bg-primary/10`, `bg-secondary/15`) in `ServiceIcon.tsx`. Re-commit any asset/tuning changes with `git commit --amend` to the relevant task's commit or a new `fix:` commit. **Do not proceed to Task 4 until the user approves.**

- [ ] **Step 5: Commit the preview**

```bash
git add src/styleguide/StyleGuide.tsx
git commit -m "feat: preview service icons on the style guide"
```

---

### Task 4: Thread `icon` through the service cards

**Files:**
- Modify: `src/components/sections/ServicesSection.tsx`
- Modify: `src/components/sections/ServicesSection.test.tsx`

**Interfaces:**
- Consumes: `ServiceIcon` (Task 2).
- Produces: `ServiceCardData` gains `icon: string`. `ServicesSection` passes each card's `icon` and its map `index` into `ServiceCard`, which renders `<ServiceIcon icon={icon} index={index} />` above the title. Consumed by Tasks 5–6.

- [ ] **Step 1: Update the test fixtures and add an icon assertion**

In `src/components/sections/ServicesSection.test.tsx`, replace the `services` fixture (lines ~6–19) with icon-bearing entries:

```tsx
const services = [
  {
    slug: 'equoterapia',
    title: 'Equoterapia',
    excerpt: 'Método terapêutico.',
    to: '/servicos/equoterapia',
    icon: 'equine-therapy',
  },
  {
    slug: 'equitacao-ludica',
    title: 'Equitação Lúdica',
    excerpt: 'Para crianças.',
    to: '/servicos/equitacao-ludica',
    icon: 'playful-riding',
  },
]
```

Add this test inside the `describe('ServicesSection', ...)` block:

```tsx
it('renders a service icon per card with alternating tones', () => {
  mockOverflow(false)
  const { container } = renderWithRouter(
    <ServicesSection heading="Nossos Serviços" services={services} />,
  )
  const icons = container.querySelectorAll('[data-icon]')
  expect(icons).toHaveLength(2)
  expect(icons[0].getAttribute('data-tone')).toBe('green')
  expect(icons[1].getAttribute('data-tone')).toBe('purple')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/sections/ServicesSection.test.tsx`
Expected: FAIL — no elements match `[data-icon]` (icons not rendered yet).

- [ ] **Step 3: Add `icon` to `ServiceCardData` and render the icon**

In `src/components/sections/ServicesSection.tsx`:

Add the import near the other icon import:

```tsx
import { ServiceIcon } from '../ui/ServiceIcon'
```

Add `icon` to the interface:

```tsx
export interface ServiceCardData {
  slug: string
  title: string
  excerpt: string
  to: string
  icon: string
}
```

Change the `ServiceCard` signature and add the icon above the heading. Replace the function signature line:

```tsx
function ServiceCard({
  icon,
  index,
  title,
  excerpt,
}: Pick<ServiceCardData, 'title' | 'excerpt' | 'icon'> & { index: number }) {
```

and insert the icon as the first child of the `<article>`, immediately before the `<h3>`:

```tsx
      <ServiceIcon icon={icon} index={index} className="mb-4" />
      <h3 className="mb-3 font-display text-headline-sm text-on-surface">
        {title}
      </h3>
```

Update the `.map` in `ServicesSection` to pass `icon` and `index`:

```tsx
          {services.map((service, index) => (
            <ServiceCard
              key={service.slug}
              icon={service.icon}
              index={index}
              title={service.title}
              excerpt={service.excerpt}
            />
          ))}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/components/sections/ServicesSection.test.tsx`
Expected: PASS (all tests including the new icon test).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ServicesSection.tsx src/components/sections/ServicesSection.test.tsx
git commit -m "feat: render service icon on each service card"
```

---

### Task 5: Pass `icon` through the selectors

**Files:**
- Modify: `src/features/servicos/servicosSelectors.ts`
- Modify: `src/features/servicos/servicosSelectors.test.ts`
- Modify: `src/features/home/homeSelectors.ts`

**Interfaces:**
- Consumes: `ServiceCardData` (now requires `icon`, Task 4).
- Produces: both `selectServicesGrid` and `selectServices` set `icon: s.icon ?? ''` on each `ServiceCardData`, reading an optional `icon?: string` from the content section.

- [ ] **Step 1: Update the servicos selector test**

In `src/features/servicos/servicosSelectors.test.ts`, add `icon` to the two grid fixtures. Change the `equoterapia` fixture object (lines ~13–18) to include `icon: 'equine-therapy',` and the `hidroterapia` fixture (lines ~19–24) to include `icon: 'pool',`. Then extend the grid assertion — replace the `expect(grid.services[0]).toMatchObject({...})` block with:

```tsx
    expect(grid.services[0]).toMatchObject({
      title: 'Equoterapia',
      excerpt: 'Método terapêutico.',
      to: '/servicos/equoterapia',
      icon: 'equine-therapy',
    })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/servicos/servicosSelectors.test.ts`
Expected: FAIL — `grid.services[0].icon` is `undefined`, not `'equine-therapy'`.

- [ ] **Step 3: Add `icon` to the selectors**

In `src/features/servicos/servicosSelectors.ts`, add `icon` to the local `ServiceSection` interface:

```tsx
interface ServiceSection {
  slug: string
  title: string
  order?: number
  icon?: string
  body: Block[]
}
```

and add `icon` to the mapped card in `selectServicesGrid`:

```tsx
    services: sections.map((s) => ({
      slug: s.slug,
      title: s.title,
      excerpt: firstParagraph(s.body),
      to: `/servicos/${s.slug}`,
      icon: s.icon ?? '',
    })),
```

In `src/features/home/homeSelectors.ts`, add `icon` to the local `NamedSection` interface:

```tsx
interface NamedSection {
  slug: string
  title: string
  icon?: string
  body: Block[]
}
```

and add `icon` to the mapped card in `selectServices`:

```tsx
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      excerpt: firstParagraph(s.body),
      to: `/servicos/${s.slug}`,
      icon: s.icon ?? '',
    }))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/features/servicos/servicosSelectors.test.ts src/features/home`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/servicos/servicosSelectors.ts src/features/servicos/servicosSelectors.test.ts src/features/home/homeSelectors.ts
git commit -m "feat: pass service icon key through selectors"
```

---

### Task 6: Add icon keys to content + full verification

**Files:**
- Modify: `src/content/content.json`

**Interfaces:**
- Consumes: the icon-key mapping table (top of this plan). Produces: each of the seven service sections carries its `icon` key, so the real site renders icons on both pages.

- [ ] **Step 1: Add `icon` to each service section**

In `src/content/content.json`, under `pages.servicos.sections`, add an `"icon"` field to each of the seven services (insert immediately after the section's `"title"` line). Exact values:

- `equoterapia` → `"icon": "equine-therapy",`
- `equitacao-classica` → `"icon": "classical-equitation",`
- `equitacao-ludica` → `"icon": "playful-riding",`
- `equitacao-adaptada` → `"icon": "adaptive-equitation",`
- `pet-terapia` → `"icon": "pets",`
- `hidroterapia` → `"icon": "pool",`
- `reabilitacao-neurofuncional` → `"icon": "psychology",`

Do NOT add an icon to the `hippussuit` section (it is excluded from the grid).

Example for the first section:

```json
        {
          "slug": "equoterapia",
          "title": "Equoterapia",
          "icon": "equine-therapy",
          "order": 1,
          "body": [
```

- [ ] **Step 2: Verify JSON is valid and keys are present**

Run:
```bash
node -e "const c=require('./src/content/content.json');const s=c.pages.servicos.sections.filter(x=>x.slug!=='hippussuit');console.log(s.map(x=>x.slug+':'+x.icon).join('\n'));if(s.some(x=>!x.icon))throw new Error('missing icon')"
```
Expected: seven `slug:icon` lines matching the mapping table, no error.

- [ ] **Step 3: Run the full test suite**

Run: `npm run test`
Expected: PASS (all suites).

- [ ] **Step 4: Lint and build**

Run: `npm run lint && npm run build`
Expected: no lint errors; build succeeds.

- [ ] **Step 5: Drive the real pages**

Run `npm run dev` (background). Use the Playwright MCP server to navigate to `http://localhost:5173/servicos` and `http://localhost:5173/` and screenshot the service grids. Confirm all seven Serviços cards show icons with alternating green/purple badges and the home featured-services cards show icons too.

- [ ] **Step 6: Commit**

```bash
git add src/content/content.json
git commit -m "feat: assign icon keys to service content"
```

---

## Self-Review

**1. Spec coverage:**
- Icon on every card, both pages → Tasks 4 (render) + 5 (both selectors) + 6 (content). ✓
- One line-art family / one token color per card → Task 2 (renderers) + Task 3 (visual gate). ✓
- Colors exclusively from tokens, no new hex → Task 2 uses `bg-primary/10`, `text-primary`, `bg-secondary/15`, `text-secondary`, `bg-current`; no hex added. ✓
- No new runtime dependency / no icon library → Material paths inlined; masks via build-time Python; `sharp`/ImageMagick not required. ✓
- Content-driven key + dependency rule → Task 6 stores only a string; mapping lives in `ServiceIcon`; selectors pass through. ✓
- Two render mechanisms (inline SVG + masked PNG) → Task 2. ✓
- Asset preprocessing (strip circle → transparent mask) → Task 1. ✓
- Alternate green/purple by index → Task 2 `index % 2`. ✓
- Visual-first before wiring → Task 3 gate precedes Tasks 4–6. ✓
- Testing (selectors, ServiceIcon element per key, tone parity) → Tasks 2, 4, 5. ✓

**2. Placeholder scan:** No TBD/TODO. Material path data is real (fetched from `@material-symbols/svg-400`). Mask `d`/paths and file paths are concrete. The `LO/HI/PAD` and badge-opacity tuning are explicit, bounded adjustments gated on the Task 3 screenshot, not open-ended placeholders. ✓

**3. Type consistency:** `ServiceIcon({ icon, index, className })` is defined in Task 2 and called with exactly those props in Tasks 3 and 4. `ServiceCardData.icon: string` (Task 4) is produced by both selectors as `icon: s.icon ?? ''` (Task 5). `data-icon` / `data-tone` attributes asserted in Tasks 2 and 4 match the component. Icon keys are identical across the mapping table, `MATERIAL_PATHS`/`MASK_SRC` (Task 2), fixtures (Tasks 4–5), preview (Task 3), and content (Task 6). ✓
