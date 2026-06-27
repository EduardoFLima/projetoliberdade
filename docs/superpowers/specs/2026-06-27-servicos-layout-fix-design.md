# Serviços Section Layout Fix — Design

**Date:** 2026-06-27
**Component:** `src/components/Servicos.jsx`
**Scope:** Render-only fix. No source data (`websiteFallback.json`) changes.

## Problem

The `servicos` node in the website data mixes three kinds of keys:

| Key(s) | Meaning |
|---|---|
| `equoterapia`, `equitacao_classica`, `equitacao_ludica`, `equitacao_adaptada`, `pet_terapia`, `hidroterapia`, `reabilitacao_neurofuncional`, `natacao` | Real service entries (each has `menuText` + one or more `pN` paragraphs) |
| `menuText`, `order` | Section metadata |
| `submenu` (boolean) | Stray flag |
| `servicos` (`order: 0`, `menuText: "Serviços"`, `p1: "...profissionais das áreas..."`) | The section **intro paragraph**, not a service |

The current code in `Servicos.jsx` builds the card grid by excluding only `menuText` and `order`:

```js
const services = Object.entries(data)
  .filter(([key]) => key !== 'menuText' && key !== 'order')
  .map(([, value]) => value)
  .sort((a, b) => (a.order || 0) - (b.order || 0))
```

This produces two defects:

1. **Blank cards** — `submenu: true` passes the filter and renders as an empty `ServiceCard` (no `menuText`, no paragraphs).
2. **Intro rendered as a card** — the `servicos` entry (the multidisciplinary-professionals paragraph) is treated as just another service card instead of the section's lead text.

## Design

### 1. Robust service filtering

Replace the exclusion blocklist with an inclusion test: keep only entries whose value is an object that has a `menuText` **and** at least one paragraph key (`pN`). This drops `menuText`, `order`, `submenu`, and `servicos` from the card grid, and is resilient to any future stray key.

A small predicate, e.g.:

```js
function isServiceCard(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.menuText === 'string' &&
    Object.keys(value).some((k) => k.startsWith('p'))
  )
}
```

The intro `servicos` entry also has a `menuText` and a `p1`, so it must be excluded explicitly by key (it is the `servicos` key within the `servicos` node) rather than by shape. Extract it separately (see below) and exclude its key from the grid.

### 2. Promote the intro paragraph

Pull the `servicos` sub-entry out of the data and render its paragraph as a centered lead paragraph between the `<h2>` heading and the card grid, matching the centered intro style used elsewhere in the site (e.g. Hero's `max-w-3xl mx-auto` centered text). Reuse the existing `extractServiceText` helper to read its paragraph(s). The heading text stays **"Nossos Serviços"**.

Resulting layout:

```
            Nossos Serviços              ← <h2>
   O Projeto Liberdade conta com         ← intro paragraph (servicos.servicos.p1)
   profissionais das áreas da saúde...
   ┌────────┐ ┌────────┐ ┌────────┐
   │ cards (8 real services, sorted by order) │
   └────────┘ └────────┘ └────────┘
```

If the intro entry is absent, the intro paragraph is simply not rendered (graceful degradation).

### 3. TODO marker for future data reshape

Add a `// TODO:` comment at the point where the intro is extracted, noting that ideally the section intro should be lifted out of the per-service items in a future reshape of the source JSON (so the `servicos` node holds a clean list of services plus a dedicated intro field, rather than burying the intro inside a service-shaped `servicos` sub-key).

## Out of scope

- No changes to `websiteFallback.json` or the upstream data source.
- No restyling of the service cards themselves.
- No changes to other sections.

## Testing

- Verify in the browser preview: no blank cards, exactly 8 service cards in `order`, and the intro paragraph appears centered under the heading.
- Confirm "Ver mais"/"Ver menos" still works on cards with multiple paragraphs (e.g. Equoterapia).
