# Content JSON Redesign — Design Spec

**Date:** 2026-06-30
**Status:** Approved (design); ready for implementation planning
**File affected:** `docs/resources/content.json`

## 1. Purpose

Redesign `docs/resources/content.json` into a clean, consistent content model for the
new "Projeto Liberdade" website. The redesigned file is the canonical shape of the
site's content and serves as a **snapshot / fallback** of the Firebase Realtime
Database (RTDB) source of truth — the new front-end fetches content from RTDB at
runtime and falls back to this file.

This is a **content-model redesign only**. It does not build the website; it produces
the new structure that the website and the RTDB will conform to.

## 2. Problems with the legacy file

The legacy `content.json` tangles three concerns and is internally inconsistent:

- **Mixed concerns** — content, navigation (`menuText`, `order`, `submenu`), and
  presentation (`img_dir`/`img_esq`, `altura`/`largura`, `width`/`height`, `zoom`)
  all live inside each section.
- **Keyed-object pseudo-arrays** — `album1`/`album2`/`album3`, `foto1`…`fotoz14`
  (with a `fotoz` typo), `li`/`li2`…`li14` (out of order), `contato`/`contato2`.
- **Inconsistent value shapes** — image sizes as `"3"`, `"100px"`, `"300px"`, `"300"`;
  text spread across `txt`/`txt2`/`txt3`.
- **Duplicated/empty data** — `home` photos duplicate gallery photos; many `titulo`
  fields are empty strings.

## 3. Decisions (locked)

1. **Consumption model:** RTDB snapshot/fallback; structure mirrors the backend.
2. **Concern separation:** Full separation. Content nodes hold only content;
   navigation lives in a dedicated tree; presentation hints are dropped entirely
   (the front-end owns all layout).
3. **Top-level organization:** Global `site` node + a single `navigation` tree +
   a `pages` map keyed by slug.
4. **Field keys:** English (`title`, `body`, `text`, `items`, `sections`, …).
5. **Content values:** Portuguese (the site is Brazilian).
6. **Slug values:** Portuguese — they double as `pages` map keys and as URL paths,
   so public URLs read naturally (`/servicos/equoterapia`).
7. **Body content:** Ordered array of typed blocks (discriminator `type`, English
   type values).
8. **Information architecture (5 pages):**
   - **Home**
   - **História** — main history + special section *Missão, Visão e Valores*
   - **Serviços** — service catalog + special section *Hippussuit*
   - **Momentos** — Fotos + Vídeos
   - **Contato**

## 4. Conventions

- **Keys** are English; **content values** are Portuguese; **slug values** are Portuguese.
- Every page / section / item / unit has a stable **`slug`**. Ordering is always an
  explicit integer **`order`** field, never derived from key sort or array index.
- Images are objects `{ "src": "...", "alt": "..." }` with relative paths. No
  dimensions, alignment, or other layout hints.
- A page may have a **`body`** (main content) and an optional **`sections`** array of
  child sections. A child section marked **`"featured": true`** is a "special section"
  (e.g. Hippussuit, Missão-Visão-Valores). `sections[]` holds both ordinary catalog
  items and featured ones; `featured` is the only thing that distinguishes them.

### Block types (the `body` array)

```json
{ "type": "paragraph", "text": "..." }
{ "type": "heading",   "text": "..." }
{ "type": "list",      "items": ["...", "..."] }
{ "type": "image",     "src": "...", "alt": "..." }
{ "type": "quote",     "text": "...", "author": "..." }
```

## 5. Top-level schema

```json
{
  "site":       { "name": "...", "logo": "...", "social": [ ... ] },
  "navigation": [ ... ],
  "pages": {
    "home":     { ... },
    "historia": { ... },
    "servicos": { ... },
    "momentos": { ... },
    "contato":  { ... }
  }
}
```

### 5.1 `site`

```json
"site": {
  "name": "Projeto Liberdade",
  "logo": "logo.png",
  "social": [
    { "network": "facebook",  "url": "http://www.facebook.com.br/projetoliberdade" },
    { "network": "instagram", "url": "https://www.instagram.com/projetoliberdadereabilitacao" }
  ]
}
```
Social icon image files are dropped; the front-end maps `network` → icon.

### 5.2 `navigation`

Ordered menu tree. Labels and order live **only** here, not in content.

```json
[
  { "slug": "home",     "label": "Home",     "order": 0 },
  { "slug": "historia", "label": "História", "order": 1 },
  { "slug": "servicos", "label": "Serviços", "order": 2, "submenu": [
      { "slug": "equoterapia",                 "label": "Equoterapia",                "order": 1 },
      { "slug": "equitacao-classica",          "label": "Equitação Clássica",         "order": 2 },
      { "slug": "equitacao-ludica",            "label": "Equitação Lúdica",           "order": 3 },
      { "slug": "equitacao-adaptada",          "label": "Equitação Adaptada",         "order": 4 },
      { "slug": "pet-terapia",                 "label": "Pet Terapia",                "order": 5 },
      { "slug": "hidroterapia",                "label": "Hidroterapia",               "order": 6 },
      { "slug": "reabilitacao-neurofuncional", "label": "Reabilitação Neurofuncional","order": 7 },
      { "slug": "hippussuit",                  "label": "Hippussuit",                 "order": 9, "featured": true }
  ]},
  { "slug": "momentos", "label": "Momentos", "order": 3, "submenu": [
      { "slug": "fotos",  "label": "Fotos",  "order": 1 },
      { "slug": "videos", "label": "Vídeos", "order": 2 }
  ]},
  { "slug": "contato",  "label": "Contato",  "order": 4 }
]
```

## 6. Page schemas

### 6.1 Prose pages — `historia`, `servicos` (shared shape)

```json
{
  "slug": "<slug>",
  "title": "<título>",
  "body": [ <blocks> ],
  "sections": [
    { "slug": "<slug>", "title": "<título>", "order": <int>,
      "featured": <bool, optional>, "body": [ <blocks> ] }
  ]
}
```

**`historia`** — `body` carries the history paragraphs and the historia image. One
featured section, *Missão, Visão e Valores*, built from `heading` + `paragraph` +
`list` blocks (Missão paragraph, Visão paragraph, Valores list). The closing
"São 16 anos…" passage becomes a `quote` block with `author`.

**`servicos`** — `body` carries the intro paragraph ("conta com profissionais…").
`sections` holds the seven service items (`order` 1–7) plus **Hippussuit** as a
`featured` section (`order` 9). Each service item's multi-paragraph text becomes
ordered `paragraph` blocks. Hippussuit's content (intro paragraph, image, the two
"aspectos" lists with their heading paragraphs, closing paragraphs, and the
"Desenvolvido por" credit list) maps to ordered `heading`/`paragraph`/`image`/`list`
blocks.

### 6.2 `momentos`

```json
"momentos": {
  "slug": "momentos",
  "title": "Momentos",
  "photos": {
    "albums": [
      { "slug": "reabilitacao", "title": "Reabilitação",
        "cover": { "src": "...", "alt": "..." },
        "photos": [ { "src": "...", "alt": "...", "caption": "" } ] }
    ]
  },
  "videos": [
    { "slug": "o-menino-e-seu-cavalo", "title": "O menino e seu cavalo",
      "order": 1, "url": "https://www.youtube.com/embed/bAkqnk5AqOc" },
    { "slug": "o-projeto-liberdade", "title": "O projeto liberdade",
      "order": 2, "url": "https://www.youtube.com/embed/RcaxtQWPI_c" }
  ]
}
```
Albums migrate from `album1/2/3` to a slugged array (`reabilitacao`, `liberdade`,
`desenvolvimento`). Per-photo `width`/`height` are dropped; `titulo` → `caption`.
The video `autoplay=1` query param is dropped (front-end controls playback).

### 6.3 `home`

```json
"home": {
  "slug": "home",
  "title": "Home",
  "hero": { "images": [ { "src": "...", "alt": "..." } ] }
}
```
The 14 legacy `home` photos (and the `fotoz` typo'd keys) become the `hero.images`
array. Optional tagline/highlight fields may be added later by the front-end work;
not required by this spec.

### 6.4 `contato`

```json
"contato": {
  "slug": "contato",
  "title": "Contato",
  "email": "contato@projetoliberdade.com.br",
  "phones": [
    { "name": "Karina", "number": "(11) 94191-7707", "whatsapp": true },
    { "name": "André",  "number": "(11) 95059-6727", "whatsapp": true }
  ],
  "units": [
    { "slug": "serra", "name": "Haras Liberdade - Serra", "label": "Unidade 1 - Serra",
      "address": { "street": "R. Flôr da Penha, 916", "district": "Bela Vista",
                   "city": "Mairiporã", "state": "SP", "postalCode": "07612-852" },
      "phone": "11 94191-7707",
      "map": { "query": "Projeto Liberdade Reabilitação e Equoterapia" } },
    { "slug": "sao-paulo", "name": "Unidade - São Paulo", "label": "Unidade 2 - São Paulo",
      "address": { "street": "Av. Nova Cantareira, 4775", "district": "Tremembé",
                   "city": "São Paulo", "state": "SP", "postalCode": "02341-002" },
      "phone": "11 92069-2909",
      "map": { "coordinates": { "lat": -23.458892, "lng": -46.615464 } } }
  ]
}
```
`map` carries **either** `query` **or** `coordinates`. Map `zoom`, social icon image
files, and the WhatsApp icon file are dropped (presentation). Phone-list `contato`/
`contato2` keyed objects become a `phones` array.

## 7. Dropped from the legacy file

- All presentation/layout hints: `img_dir`, `img_esq`, `altura`, `largura`,
  `width`, `height`, `zoom`, and social/WhatsApp icon `img` blocks.
- Navigation metadata embedded in content (`menuText`, per-section `order`,
  `submenu` flags) — relocated to the `navigation` tree.
- Duplicate `home` photos that merely repeated gallery images keep only their role
  as hero images; gallery copies live under `momentos.photos`.
- Empty-string `titulo`/`subtitulo` placeholders.

## 8. Out of scope

- Building the website / front-end.
- Authoring final `alt` text and captions (placeholders/empty allowed; real copy is
  a content task for the site owners).
- Defining the RTDB security rules or sync tooling.

## 9. Implementation outcome

A single rewritten `docs/resources/content.json` conforming to this spec, with all
legacy textual content migrated into the new shape (no content lost), valid JSON,
and consistent ordering.
```
