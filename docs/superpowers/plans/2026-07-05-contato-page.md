# Contato Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/contato` page from the Stitch "Projeto Liberdade - Contact" mockup: hero, contact-channel cards (WhatsApp/email/social), and unit cards with embedded Google Maps.

**Architecture:** Follows the existing per-page pattern (`historia`, `servicos`): a routed container reads content via `useOutletContext<SiteContent>()`, selectors shape it into view models, and prop-driven presentational sections render it. Nothing outside the container imports `content.json` (the dependency rule). Social icons are monochrome SVG glyphs colored via `currentColor`; maps are keyless Google Maps `output=embed` iframes.

**Tech Stack:** TypeScript 6 (strict), React 19, React Router v8 (library mode), Tailwind CSS v4 (`@theme` tokens in `src/index.css`), Vitest + Testing Library.

## Global Constraints

- No semicolons, single quotes, trailing commas (Prettier config). Match surrounding style.
- Presentational components (`components/`, `layouts/`) receive content via props only; never import `content.json` or Firebase. Only the routed container reads `useOutletContext`.
- Colors/spacing/shadows come from `@theme` tokens: `text-primary` (#006d38), `bg-secondary-fixed`, `shadow-level1`/`shadow-level2`, `rounded-lg` (1rem), `rounded-md` (0.5rem). Do not hardcode hex.
- Social/accent color is green (`text-primary`), per the confirmed design decision.
- `content.json` is the source of truth for phone numbers, email, and addresses — do NOT use the mockup's differing numbers.
- Run a single test file with `pnpm exec vitest run <path>` (one-shot, no watch).
- Full suite green + `pnpm build` (type-check) before the final commit.

---

### Task 1: New monochrome icons

**Files:**
- Modify: `src/components/ui/icons.tsx` (append four icon components)
- Test: `src/components/ui/icons.test.tsx` (extend existing list)

**Interfaces:**
- Consumes: the existing `Svg` helper and `IconProps` in `icons.tsx`.
- Produces: `MailIcon`, `ShareIcon`, `MapPinIcon`, `MapIcon` — each `({ className }: { className?: string }) => JSX.Element`, a 24×24 `currentColor` SVG.

- [ ] **Step 1: Add the icons to the test list (failing test)**

In `src/components/ui/icons.test.tsx`, add the four names to the import and to the `icons` array:

```tsx
import {
  ArrowForwardIcon,
  ChatIcon,
  CheckCircleIcon,
  FavoriteIcon,
  FlagIcon,
  MailIcon,
  MapIcon,
  MapPinIcon,
  MenuIcon,
  ShareIcon,
  VisibilityIcon,
} from './icons'
```

```tsx
    const icons = [
      FlagIcon,
      VisibilityIcon,
      FavoriteIcon,
      ArrowForwardIcon,
      ChatIcon,
      MenuIcon,
      CheckCircleIcon,
      MailIcon,
      ShareIcon,
      MapPinIcon,
      MapIcon,
    ]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/ui/icons.test.tsx`
Expected: FAIL — `MailIcon`/`ShareIcon`/`MapPinIcon`/`MapIcon` are not exported.

- [ ] **Step 3: Implement the four icons**

Append to `src/components/ui/icons.tsx` (after `CheckCircleIcon`):

```tsx
export function MailIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  )
}

export function ShareIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </Svg>
  )
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  )
}

export function MapIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </Svg>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/ui/icons.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/icons.tsx src/components/ui/icons.test.tsx
git commit -m "feat(icons): add mail, share, map-pin and map icons"
```

---

### Task 2: SocialLinks `buttons` variant

**Files:**
- Modify: `src/components/SocialLinks.tsx`
- Test: `src/components/SocialLinks.test.tsx` (add a case)

**Interfaces:**
- Consumes: existing `SocialLink` type, `labels`/`icons` maps.
- Produces: `SocialLinks({ links, variant }: { links: SocialLink[]; variant?: 'inline' | 'buttons' })`. Default `variant` is `'inline'` (unchanged Footer behavior). `'buttons'` renders each link as a circular green icon button.

- [ ] **Step 1: Write the failing test**

Add to `src/components/SocialLinks.test.tsx`:

```tsx
  it('renders circular button styling in the buttons variant', () => {
    render(<SocialLinks links={links} variant="buttons" />)
    const fb = screen.getByRole('link', { name: 'Facebook' })
    expect(fb.className).toContain('rounded-full')
    expect(fb.className).toContain('text-primary')
    expect(fb).toHaveAttribute('href', 'https://facebook.com/x')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/SocialLinks.test.tsx`
Expected: FAIL — the link class does not contain `rounded-full` (variant not implemented).

- [ ] **Step 3: Implement the variant**

Replace the `SocialLinks` function (from `export function SocialLinks` to the end of the file) in `src/components/SocialLinks.tsx` with:

```tsx
const linkClass: Record<'inline' | 'buttons', string> = {
  inline: 'text-on-surface-variant hover:text-primary',
  buttons:
    'flex h-12 w-12 items-center justify-center rounded-full border border-surface-container-highest bg-surface-container-lowest text-primary shadow-level1 transition-colors hover:bg-primary hover:text-on-primary',
}

export function SocialLinks({
  links,
  variant = 'inline',
}: {
  links: SocialLink[]
  variant?: 'inline' | 'buttons'
}) {
  return (
    <ul className="flex gap-4">
      {links.map((link) => (
        <li key={link.network}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={labels[link.network] ?? link.network}
            className={linkClass[variant]}
          >
            {icons[link.network] ?? <span aria-hidden="true">↗</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run src/components/SocialLinks.test.tsx`
Expected: PASS (both the original inline case and the new buttons case).

- [ ] **Step 5: Commit**

```bash
git add src/components/SocialLinks.tsx src/components/SocialLinks.test.tsx
git commit -m "feat(social): add circular buttons variant to SocialLinks"
```

---

### Task 3: MapEmbed component

**Files:**
- Create: `src/components/MapEmbed.tsx`
- Test: `src/components/MapEmbed.test.tsx`

**Interfaces:**
- Consumes: `cn` from `src/lib/cn`.
- Produces: `MapEmbed({ src, title, className }: { src: string; title: string; className?: string })` — a lazy, rounded, 16:9 Google Maps iframe.

- [ ] **Step 1: Write the failing test**

Create `src/components/MapEmbed.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapEmbed } from './MapEmbed'

describe('MapEmbed', () => {
  it('renders a lazy titled iframe with the given src', () => {
    render(
      <MapEmbed
        src="https://www.google.com/maps?q=test&output=embed"
        title="Mapa da unidade"
      />,
    )
    const frame = screen.getByTitle('Mapa da unidade')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute(
      'src',
      'https://www.google.com/maps?q=test&output=embed',
    )
    expect(frame).toHaveAttribute('loading', 'lazy')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/MapEmbed.test.tsx`
Expected: FAIL — cannot resolve `./MapEmbed`.

- [ ] **Step 3: Implement the component**

Create `src/components/MapEmbed.tsx`:

```tsx
import { cn } from '../lib/cn'

interface MapEmbedProps {
  src: string
  title: string
  className?: string
}

export function MapEmbed({ src, title, className }: MapEmbedProps) {
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className={cn(
        'aspect-video w-full rounded-lg border-0 shadow-level1',
        className,
      )}
    />
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/MapEmbed.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/MapEmbed.tsx src/components/MapEmbed.test.tsx
git commit -m "feat(map): add keyless Google Maps embed component"
```

---

### Task 4: Content additions + contato selectors

**Files:**
- Modify: `src/content/content.json` (add keys under `pages.contato`)
- Create: `src/features/contato/contatoSelectors.ts`
- Test: `src/features/contato/contatoSelectors.test.ts`

**Interfaces:**
- Consumes: `SiteContent` from `src/content/types`; `contentRepository` from `src/content/content` (for the real-content pin test).
- Produces:
  - `selectContatoHero(content: SiteContent): { title: string; subtitle: string }`
  - `selectContactChannels(content: SiteContent): { heading: string; socialHeading: string; whatsapps: { name: string; number: string; tel: string }[]; email: string }`
  - `selectUnits(content: SiteContent): { heading: string; subtitle: string; units: UnitView[] }`
  - `UnitView` = `{ slug: string; label: string; venue?: string; addressLines: string[]; mapEmbedSrc: string; mapLinkHref: string }` (exported).

- [ ] **Step 1: Add copy to `content.json`**

In `src/content/content.json`, inside `pages.contato`, insert these keys immediately after `"title": "Contato",` (before `"email"`):

```json
      "hero": {
        "title": "Entre em Contato",
        "subtitle": "Estamos aqui para ajudar. Utilize nossos canais de atendimento direto para falar com a equipe do Projeto Liberdade."
      },
      "channelsHeading": "Fale Conosco",
      "socialHeading": "Redes Sociais",
      "unitsHeading": "Nossas Unidades",
      "unitsSubtitle": "Encontre o espaço Projeto Liberdade mais próximo de você.",
```

- [ ] **Step 2: Write the failing test**

Create `src/features/contato/contatoSelectors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { contentRepository } from '../../content/content'
import {
  selectContactChannels,
  selectContatoHero,
  selectUnits,
} from './contatoSelectors'

describe('contato selectors (real content.json)', () => {
  it('selectContatoHero returns the hero title and subtitle', async () => {
    const content = await contentRepository.getContent()
    const hero = selectContatoHero(content)
    expect(hero.title).toBe('Entre em Contato')
    expect(hero.subtitle).toContain('Estamos aqui para ajudar')
  })

  it('selectContactChannels maps whatsapp phones and email', async () => {
    const content = await contentRepository.getContent()
    const channels = selectContactChannels(content)
    expect(channels.heading).toBe('Fale Conosco')
    expect(channels.socialHeading).toBe('Redes Sociais')
    expect(channels.email).toBe('contato@projetoliberdade.com.br')
    expect(channels.whatsapps).toEqual([
      { name: 'Karina', number: '(11) 94191-7707', tel: '+5511941917707' },
      { name: 'André', number: '(11) 95059-6727', tel: '+5511950596727' },
    ])
  })

  it('selectUnits builds address lines and keyless map URLs', async () => {
    const content = await contentRepository.getContent()
    const { heading, subtitle, units } = selectUnits(content)
    expect(heading).toBe('Nossas Unidades')
    expect(subtitle).toContain('mais próximo')
    expect(units).toHaveLength(2)

    const serra = units[0]
    expect(serra.slug).toBe('serra')
    expect(serra.label).toBe('Unidade 1 - Serra')
    expect(serra.venue).toBe('Haras Liberdade - Serra')
    expect(serra.addressLines).toEqual([
      'R. Flôr da Penha, 916',
      'Bela Vista',
      'Mairiporã - SP',
    ])
    expect(serra.mapEmbedSrc).toBe(
      'https://www.google.com/maps?q=Projeto%20Liberdade%20Reabilita%C3%A7%C3%A3o%20e%20Equoterapia&output=embed',
    )
    expect(serra.mapLinkHref).toBe(
      'https://www.google.com/maps/search/?api=1&query=Projeto%20Liberdade%20Reabilita%C3%A7%C3%A3o%20e%20Equoterapia',
    )

    const sp = units[1]
    expect(sp.slug).toBe('sao-paulo')
    expect(sp.venue).toBeUndefined()
    expect(sp.mapEmbedSrc).toBe(
      'https://www.google.com/maps?q=-23.458892%2C-46.615464&output=embed',
    )
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/contato/contatoSelectors.test.ts`
Expected: FAIL — cannot resolve `./contatoSelectors`.

- [ ] **Step 4: Implement the selectors**

Create `src/features/contato/contatoSelectors.ts`:

```ts
import type { SiteContent } from '../../content/types'

interface Phone {
  name: string
  number: string
  whatsapp?: boolean
}

interface UnitAddress {
  street: string
  district: string
  city: string
  state: string
  postalCode?: string
}

interface UnitContent {
  slug: string
  name: string
  label: string
  address: UnitAddress
  map?: { query?: string; coordinates?: { lat: number; lng: number } }
}

interface ContatoPageContent {
  title: string
  hero?: { title: string; subtitle: string }
  channelsHeading?: string
  socialHeading?: string
  unitsHeading?: string
  unitsSubtitle?: string
  email: string
  phones: Phone[]
  units: UnitContent[]
}

export interface WhatsAppChannel {
  name: string
  number: string
  tel: string
}

export interface ContactChannels {
  heading: string
  socialHeading: string
  whatsapps: WhatsAppChannel[]
  email: string
}

export interface UnitView {
  slug: string
  label: string
  venue?: string
  addressLines: string[]
  mapEmbedSrc: string
  mapLinkHref: string
}

export interface UnitsView {
  heading: string
  subtitle: string
  units: UnitView[]
}

const MAPS_EMBED = 'https://www.google.com/maps'
const MAPS_SEARCH = 'https://www.google.com/maps/search/?api=1'

function page(content: SiteContent): ContatoPageContent {
  return content.pages.contato as unknown as ContatoPageContent
}

function telHref(number: string): string {
  return `+55${number.replace(/\D/g, '')}`
}

function mapQuery(unit: UnitContent): string {
  if (unit.map?.coordinates) {
    const { lat, lng } = unit.map.coordinates
    return `${lat},${lng}`
  }
  return unit.map?.query ?? `${unit.address.street}, ${unit.address.city}`
}

export function selectContatoHero(content: SiteContent): {
  title: string
  subtitle: string
} {
  const p = page(content)
  return { title: p.hero?.title ?? p.title, subtitle: p.hero?.subtitle ?? '' }
}

export function selectContactChannels(content: SiteContent): ContactChannels {
  const p = page(content)
  return {
    heading: p.channelsHeading ?? 'Fale Conosco',
    socialHeading: p.socialHeading ?? 'Redes Sociais',
    whatsapps: p.phones
      .filter((phone) => phone.whatsapp)
      .map((phone) => ({
        name: phone.name,
        number: phone.number,
        tel: telHref(phone.number),
      })),
    email: p.email,
  }
}

export function selectUnits(content: SiteContent): UnitsView {
  const p = page(content)
  return {
    heading: p.unitsHeading ?? 'Nossas Unidades',
    subtitle: p.unitsSubtitle ?? '',
    units: p.units.map((unit) => {
      const encoded = encodeURIComponent(mapQuery(unit))
      return {
        slug: unit.slug,
        label: unit.label,
        venue: /^Unidade/.test(unit.name) ? undefined : unit.name,
        addressLines: [
          unit.address.street,
          unit.address.district,
          `${unit.address.city} - ${unit.address.state}`,
        ],
        mapEmbedSrc: `${MAPS_EMBED}?q=${encoded}&output=embed`,
        mapLinkHref: `${MAPS_SEARCH}&query=${encoded}`,
      }
    }),
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/contato/contatoSelectors.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/content.json src/features/contato/contatoSelectors.ts src/features/contato/contatoSelectors.test.ts
git commit -m "feat(contato): add page copy and content selectors"
```

---

### Task 5: ContactChannels section

**Files:**
- Create: `src/components/sections/ContactChannels.tsx`
- Test: `src/components/sections/ContactChannels.test.tsx`

**Interfaces:**
- Consumes: `SocialLink` from `src/content/types`; `SocialLinks` (variant `buttons`); `ChatIcon`, `MailIcon`, `ShareIcon` from `src/components/ui/icons`; `Container`, `Section`.
- Produces: `ContactChannels({ heading, socialHeading, whatsapps, email, social }: { heading: string; socialHeading: string; whatsapps: { name: string; number: string; tel: string }[]; email: string; social: SocialLink[] })`.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/ContactChannels.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContactChannels } from './ContactChannels'

const props = {
  heading: 'Fale Conosco',
  socialHeading: 'Redes Sociais',
  whatsapps: [
    { name: 'Karina', number: '(11) 94191-7707', tel: '+5511941917707' },
  ],
  email: 'contato@projetoliberdade.com.br',
  social: [{ network: 'instagram', url: 'https://instagram.com/x' }],
}

describe('ContactChannels', () => {
  it('renders whatsapp tel links, an email mailto link and social buttons', () => {
    render(<ContactChannels {...props} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Fale Conosco' }),
    ).toBeInTheDocument()

    const wa = screen.getByRole('link', { name: /Karina/ })
    expect(wa).toHaveAttribute('href', 'tel:+5511941917707')

    const mail = screen.getByRole('link', {
      name: 'contato@projetoliberdade.com.br',
    })
    expect(mail).toHaveAttribute(
      'href',
      'mailto:contato@projetoliberdade.com.br',
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Redes Sociais' }),
    ).toBeInTheDocument()
    const insta = screen.getByRole('link', { name: 'Instagram' })
    expect(insta.className).toContain('rounded-full')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/sections/ContactChannels.test.tsx`
Expected: FAIL — cannot resolve `./ContactChannels`.

- [ ] **Step 3: Implement the section**

Create `src/components/sections/ContactChannels.tsx`:

```tsx
import type { SocialLink } from '../../content/types'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { ChatIcon, MailIcon, ShareIcon } from '../ui/icons'
import { SocialLinks } from '../SocialLinks'

interface WhatsApp {
  name: string
  number: string
  tel: string
}

interface ContactChannelsProps {
  heading: string
  socialHeading: string
  whatsapps: WhatsApp[]
  email: string
  social: SocialLink[]
}

export function ContactChannels({
  heading,
  socialHeading,
  whatsapps,
  email,
  social,
}: ContactChannelsProps) {
  return (
    <Section tone="surface">
      <Container className="flex max-w-3xl flex-col gap-6">
        <div className="rounded-lg bg-secondary-fixed/30 p-6 shadow-level1">
          <h2 className="mb-4 flex items-center gap-2 font-display text-headline-sm text-on-surface">
            <ChatIcon className="h-6 w-6 text-primary" />
            {heading}
          </h2>
          <ul className="flex flex-col gap-4 text-body-md text-on-surface-variant">
            {whatsapps.map((wa) => (
              <li key={wa.tel} className="flex items-start gap-3">
                <ChatIcon className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-label-md text-on-surface">
                    WhatsApp {wa.name}
                  </p>
                  <a href={`tel:${wa.tel}`} className="hover:text-primary">
                    {wa.number}
                  </a>
                </div>
              </li>
            ))}
            <li className="flex items-start gap-3">
              <MailIcon className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-label-md text-on-surface">E-mail</p>
                <a href={`mailto:${email}`} className="hover:text-primary">
                  {email}
                </a>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-lg bg-surface-container-low p-6 shadow-level1">
          <h2 className="mb-4 flex items-center gap-2 font-display text-headline-sm text-on-surface">
            <ShareIcon className="h-6 w-6 text-primary" />
            {socialHeading}
          </h2>
          <SocialLinks links={social} variant="buttons" />
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/sections/ContactChannels.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ContactChannels.tsx src/components/sections/ContactChannels.test.tsx
git commit -m "feat(contato): add ContactChannels section"
```

---

### Task 6: UnitsSection section

**Files:**
- Create: `src/components/sections/UnitsSection.tsx`
- Test: `src/components/sections/UnitsSection.test.tsx`

**Interfaces:**
- Consumes: `UnitView` from `src/features/contato/contatoSelectors`; `MapEmbed`; `Container`, `Section`; `MapPinIcon`, `MapIcon` from `src/components/ui/icons`.
- Produces: `UnitsSection({ heading, subtitle, units }: { heading: string; subtitle: string; units: UnitView[] })`.

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/UnitsSection.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UnitsSection } from './UnitsSection'

const units = [
  {
    slug: 'serra',
    label: 'Unidade 1 - Serra',
    venue: 'Haras Liberdade - Serra',
    addressLines: ['R. Flôr da Penha, 916', 'Bela Vista', 'Mairiporã - SP'],
    mapEmbedSrc: 'https://www.google.com/maps?q=serra&output=embed',
    mapLinkHref: 'https://www.google.com/maps/search/?api=1&query=serra',
  },
  {
    slug: 'sao-paulo',
    label: 'Unidade 2 - São Paulo',
    addressLines: ['Av. Nova Cantareira, 4775', 'Tremembé', 'São Paulo - SP'],
    mapEmbedSrc: 'https://www.google.com/maps?q=sp&output=embed',
    mapLinkHref: 'https://www.google.com/maps/search/?api=1&query=sp',
  },
]

describe('UnitsSection', () => {
  it('renders a card with map and external link per unit', () => {
    render(
      <UnitsSection
        heading="Nossas Unidades"
        subtitle="Encontre o espaço."
        units={units}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossas Unidades' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Unidade 1 - Serra' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Haras Liberdade - Serra')).toBeInTheDocument()

    expect(screen.getByTitle('Mapa - Unidade 1 - Serra')).toHaveAttribute(
      'src',
      'https://www.google.com/maps?q=serra&output=embed',
    )

    const links = screen.getAllByRole('link', { name: /Ver no mapa/ })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=serra',
    )
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noreferrer')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/components/sections/UnitsSection.test.tsx`
Expected: FAIL — cannot resolve `./UnitsSection`.

- [ ] **Step 3: Implement the section**

Create `src/components/sections/UnitsSection.tsx`:

```tsx
import type { UnitView } from '../../features/contato/contatoSelectors'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { MapIcon, MapPinIcon } from '../ui/icons'
import { MapEmbed } from '../MapEmbed'

interface UnitsSectionProps {
  heading: string
  subtitle: string
  units: UnitView[]
}

export function UnitsSection({ heading, subtitle, units }: UnitsSectionProps) {
  return (
    <Section tone="muted">
      <Container className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="font-display text-headline-md text-on-surface">
            {heading}
          </h2>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {units.map((unit) => (
            <article
              key={unit.slug}
              className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-level1"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-headline-sm text-on-surface">
                  {unit.label}
                </h3>
              </div>
              <p className="text-body-md text-on-surface-variant">
                {unit.venue ? (
                  <>
                    <span className="text-on-surface">{unit.venue}</span>
                    <br />
                  </>
                ) : null}
                {unit.addressLines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < unit.addressLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
              <MapEmbed src={unit.mapEmbedSrc} title={`Mapa - ${unit.label}`} />
              <a
                href={unit.mapLinkHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 self-start rounded-md border border-secondary px-4 py-2 text-label-md text-secondary transition-colors hover:text-primary"
              >
                <MapIcon className="h-[18px] w-[18px]" />
                Ver no mapa
              </a>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/components/sections/UnitsSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/UnitsSection.tsx src/components/sections/UnitsSection.test.tsx
git commit -m "feat(contato): add UnitsSection with per-unit maps"
```

---

### Task 7: ContatoPage container + route

**Files:**
- Create: `src/features/contato/ContatoPage.tsx`
- Modify: `src/routes.tsx`
- Test: `src/features/contato/ContatoPage.test.tsx`

**Interfaces:**
- Consumes: `useOutletContext<SiteContent>`; `selectContatoHero`, `selectContactChannels`, `selectUnits`; `PageHero`, `ContactChannels`, `UnitsSection`; `content.site.social` for the social links.
- Produces: `ContatoPage()` route component; a `contato` route registered in `router`.

- [ ] **Step 1: Write the failing test**

Create `src/features/contato/ContatoPage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SiteLayout } from '../../layouts/SiteLayout'
import { ContatoPage } from './ContatoPage'

function renderContato() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: SiteLayout,
        children: [{ path: 'contato', Component: ContatoPage }],
      },
    ],
    { initialEntries: ['/contato'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('ContatoPage', () => {
  it('renders hero, channels and units from content', async () => {
    renderContato()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Entre em Contato' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Fale Conosco' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossas Unidades' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Unidade 1 - Serra' }),
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/contato/ContatoPage.test.tsx`
Expected: FAIL — cannot resolve `./ContatoPage`.

- [ ] **Step 3: Implement the container**

Create `src/features/contato/ContatoPage.tsx`:

```tsx
import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { PageHero } from '../../components/sections/PageHero'
import { ContactChannels } from '../../components/sections/ContactChannels'
import { UnitsSection } from '../../components/sections/UnitsSection'
import {
  selectContactChannels,
  selectContatoHero,
  selectUnits,
} from './contatoSelectors'

export function ContatoPage() {
  const content = useOutletContext<SiteContent>()
  const hero = selectContatoHero(content)
  const channels = selectContactChannels(content)
  const units = selectUnits(content)

  return (
    <>
      <PageHero
        image=""
        alt=""
        title={hero.title}
        subtitle={hero.subtitle}
      />
      <ContactChannels
        heading={channels.heading}
        socialHeading={channels.socialHeading}
        whatsapps={channels.whatsapps}
        email={channels.email}
        social={content.site.social}
      />
      <UnitsSection
        heading={units.heading}
        subtitle={units.subtitle}
        units={units.units}
      />
    </>
  )
}
```

- [ ] **Step 4: Register the route**

In `src/routes.tsx`, add the import and the route child.

Add after the `ServicosPage` import:

```tsx
import { ContatoPage } from './features/contato/ContatoPage'
```

Add to the `children` array (after the `servicos` route):

```tsx
      { path: 'contato', Component: ContatoPage },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/contato/ContatoPage.test.tsx`
Expected: PASS.

- [ ] **Step 6: Full suite + type-check**

Run: `pnpm exec vitest run`
Expected: all tests PASS.

Run: `pnpm build`
Expected: type-check + build succeed with no errors.

Run: `pnpm lint`
Expected: no lint errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/contato/ContatoPage.tsx src/features/contato/ContatoPage.test.tsx src/routes.tsx
git commit -m "feat(contato): add ContatoPage container and /contato route"
```

---

## Notes for the implementer

- **PageHero with no image:** `image=""` renders the gradient overlay over an empty background — intended, since contato has no hero image. Do not invent an image path.
- **Deviation from the mockup (intentional):** the mockup shows one combined map; we render one map per unit because the two units are in different cities. This is specified in the design doc.
- **Do not touch `Header`/`Footer`.** The nav "Contato" link and the site-wide "Entre em contato" button already point at `/contato`; Task 7 makes that route resolve instead of 404.
- **`bg-secondary-fixed/30` and `bg-primary-container/10`** are token-based Tailwind opacity utilities — valid against the `@theme` tokens in `src/index.css`.
