# Contato page (`/contato`) — design

Date: 2026-07-05
Status: Approved (design), pending implementation plan
Source mockup: Stitch project "Projeto Liberdade Website Redesign", screen
"Projeto Liberdade - Contact" (`db376a43a93043dda24049e4da2ad94d`).

## Goal

Build the Contato page for the brochure site, matching the Stitch mockup and the
"Organic Freedom" design system. The `/contato` route does not exist yet, so the
nav "Contato" link and every "Entre em contato" button currently 404 — this page
fills that gap.

## Decisions (confirmed with user)

1. **Social icons:** monochrome SVG glyphs rendered with `currentColor` so they
   take design-token colors. The PNGs in `docs/resources/icons` are full-color
   raster brand squares and cannot be recolored — they are not used on the page.
   Reuse the existing Facebook/Instagram SVG glyphs in `SocialLinks.tsx`.
2. **Accent color:** green (`--color-primary` / `text-primary`), matching the
   mockup. Social icon buttons are green on white circles, hover fills green.
3. **Maps:** embedded interactive Google Maps via iframe `output=embed`
   (no API key, `loading="lazy"`). One map **per unit** (see deviation below).
4. **Contact form:** none. The mockup mentions a form but renders none, and there
   is no backend. The hero subtitle is reworded to drop the form mention.

## Architecture

Follows the existing per-page pattern (`historia`, `servicos`) exactly:

- A **container** reads content via `useOutletContext<SiteContent>()`.
- **Selectors** shape raw content into view models (with fallbacks).
- **Presentational sections** receive props only.

The dependency rule holds: nothing new imports `content.json` or references
Firebase. Only the container touches content (via the Outlet context).

### New files

- `src/features/contato/ContatoPage.tsx` — container; composes the sections.
- `src/features/contato/contatoSelectors.ts` — `selectContatoHero`,
  `selectContactChannels`, `selectUnits`.
- `src/features/contato/contatoSelectors.test.ts`
- `src/features/contato/ContatoPage.test.tsx`
- `src/components/sections/ContactChannels.tsx` — "Fale Conosco" +
  "Redes Sociais" cards.
- `src/components/sections/ContactChannels.test.tsx`
- `src/components/sections/UnitsSection.tsx` — "Nossas Unidades" heading + subtitle
  + unit cards.
- `src/components/sections/UnitsSection.test.tsx`
- `src/components/MapEmbed.tsx` — prop-driven lazy Google Maps iframe.
- `src/components/MapEmbed.test.tsx`

### Edited files

- `src/routes.tsx` — add `{ path: 'contato', Component: ContatoPage }`.
- `src/components/SocialLinks.tsx` — add `variant?: 'inline' | 'buttons'`
  (default `'inline'`); `'buttons'` renders circular green icon buttons.
- `src/components/ui/icons.tsx` — add `MailIcon`, `ShareIcon`, `MapPinIcon`,
  `MapIcon` (monochrome, `currentColor`, matching the existing convention).
  Reuse `ChatIcon` for the WhatsApp rows and the "Fale Conosco" heading accent.
- `src/content/content.json` — add the mockup copy not yet present (see below).

## Page composition (top to bottom)

1. **PageHero** (reused).
   - Title: `Entre em Contato`.
   - Subtitle: `Estamos aqui para ajudar. Utilize nossos canais de atendimento
     direto para falar com a equipe do Projeto Liberdade.` (form mention removed).
   - No hero image is defined for contato; render on `PageHero`'s existing
     tinted-gradient background (the component already handles the overlay).

2. **ContactChannels** — centered `max-w-3xl` column, two cards:
   - **Fale Conosco** (heading + `ChatIcon` accent, card on a subtle
     `bg-secondary-fixed/30` tint per the mockup): one row per phone with
     `whatsapp: true` → label `WhatsApp {name}` and a `tel:` link; plus an email
     row with a `mailto:` link and `MailIcon`.
   - **Redes Sociais** (heading + `ShareIcon`): `<SocialLinks variant="buttons" />`.

3. **UnitsSection** — heading `Nossas Unidades`, subtitle `Encontre o espaço
   Projeto Liberdade mais próximo de você.`, then the two unit cards in a 2-col
   grid (desktop) / stacked (mobile).

### Units + maps (intentional deviation from the mockup)

The mockup shows a single large map, but the two units are in different cities
(Mairiporã and São Paulo); one street-zoom map cannot show both usefully. So
**each unit card embeds its own Google Map** (`MapEmbed`), plus:

- the unit label (`Unidade 1 - Serra` / `Unidade 2 - São Paulo`) with a
  `MapPinIcon`,
- the address (street, district, city/state),
- a **"Ver no mapa"** button (`MapIcon`) that opens Google Maps in a new tab.

Map source resolution per unit:
- Serra has `map.query` → embed `q=<encoded query>`; link
  `https://www.google.com/maps/search/?api=1&query=<encoded query>`.
- São Paulo has `map.coordinates {lat,lng}` → embed `q=<lat>,<lng>`; link
  `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`.

`MapEmbed` props: `{ src: string; title: string; className?: string }`. It renders
a rounded, `shadow-level1` iframe with a fixed aspect ratio, `loading="lazy"` and
`referrerPolicy="no-referrer-when-downgrade"`. The embed URL is built in the
selector (`selectUnits`), not in the presentational component, so the component
stays dumb and testable.

## Content additions (`content.json` → `pages.contato`)

Add alongside the existing `slug`/`title`/`email`/`phones`/`units`:

```jsonc
"hero": {
  "title": "Entre em Contato",
  "subtitle": "Estamos aqui para ajudar. Utilize nossos canais de atendimento direto para falar com a equipe do Projeto Liberdade."
},
"channelsHeading": "Fale Conosco",
"socialHeading": "Redes Sociais",
"unitsHeading": "Nossas Unidades",
"unitsSubtitle": "Encontre o espaço Projeto Liberdade mais próximo de você."
```

Selectors read these with sensible fallbacks (mirroring `historiaSelectors`).
Phone numbers, email, unit labels and addresses come straight from the existing
`content.json` — the source of truth. The mockup's slightly-different phone
numbers (e.g. `94185-7707` vs `94191-7707`) are **not** used.

## Selectors (view models)

- `selectContatoHero(content)` → `{ title, subtitle }` (fallbacks to page title
  and empty subtitle).
- `selectContactChannels(content)` →
  `{ heading, socialHeading, whatsapps: { name, number, tel }[], email }`, where
  `whatsapps` includes only phones with `whatsapp: true` and `tel` is the number
  normalized to `+55…` digits, and `email` is passed through. `social` links come
  from `content.site.social` (passed to `SocialLinks` by the page).
- `selectUnits(content)` → `{ heading, subtitle, units: UnitView[] }` where each
  `UnitView` is
  `{ slug, label, addressLines: string[], mapEmbedSrc, mapLinkHref }`.

## SocialLinks change

Add `variant?: 'inline' | 'buttons'` (default `'inline'`, preserving current
Footer behavior). `'buttons'` renders each link as a circular button:
`w-12 h-12 rounded-full bg-surface-container-lowest border border-surface-container-highest
text-primary shadow-level1 hover:bg-primary hover:text-on-primary`, using the
existing FB/IG glyphs. Existing inline usage is unchanged.

## Testing

- `contatoSelectors.test.ts` — pins hero/channels/units against the real
  `content.json` (same style as the recent `selectHippussuit` test): two WhatsApp
  entries with correct names/numbers/`tel:`, email passthrough, two units with
  address lines and an embed src containing `output=embed`.
- `ContactChannels.test.tsx` — renders WhatsApp rows with `tel:` links, an email
  `mailto:` link, and social buttons with `aria-label`s.
- `UnitsSection.test.tsx` — two unit cards, each with a map iframe and a
  "Ver no mapa" link that opens in a new tab (`target="_blank"`, `rel` noopener).
- `MapEmbed.test.tsx` — renders an iframe with the given `src` and `title` and
  `loading="lazy"`.
- `ContatoPage.test.tsx` — smoke render through the router/Outlet context.

## Out of scope

- Contact form (no backend).
- Firebase RTDB wiring (unchanged; the async seam already exists).
- SEO prerender/meta tags (tracked separately in the phase map).
- Any change to `Header`/`Footer` chrome.
