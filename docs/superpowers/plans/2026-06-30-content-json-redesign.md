# Content JSON Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `docs/resources/content.json` into the new, fully-separated content model from the design spec, migrating every piece of legacy text without loss.

**Architecture:** A migration driven by a small Python validator used as the test harness. We snapshot the legacy file to `content.legacy.json`, build the new `content.json` node-by-node, and after each node run a section check that proves the node conforms to the schema. A final content-preservation check asserts every meaningful legacy string survived. No website code is built here.

**Tech Stack:** Plain JSON (the deliverable) + a stdlib-only Python 3 validator (`scripts/validate_content.py`). No package manager, no third-party deps. `python3` is preinstalled on macOS.

## Global Constraints

- **Field keys are English; content values are Portuguese; slug values are Portuguese.** (verbatim from spec §3)
- **Block types** are exactly: `paragraph`, `heading`, `list`, `image`, `quote`. (spec §4)
- **No presentation hints** in content: never emit `altura`, `largura`, `width`, `height`, `zoom`, alignment, or icon image files. (spec §3, §7)
- **Images** are objects `{ "src": "...", "alt": "..." }` with relative paths; `alt` may be `""` (filled later). (spec §4, §8)
- **Ordering** is always an explicit integer `order` field. (spec §4)
- **No content loss:** every meaningful legacy string must appear, verbatim, in the new file. Copy legacy prose **exactly as-is**, including existing typos (copy-editing is out of scope — spec §8).
- The five pages are `home`, `historia`, `servicos`, `momentos`, `contato`; `servicos` carries the service catalog + featured `hippussuit`; `historia` carries the featured `missao-visao-valores`. (spec §3.8)

## File Structure

- **Create** `docs/resources/content.legacy.json` — frozen snapshot of the current file; the migration source of truth and the preservation reference. Kept in-repo as a provenance/guard artifact.
- **Create** `scripts/validate_content.py` — stdlib-only validator. Responsibility: schema/section checks + content-preservation. Grows one `@check(...)` function per page task.
- **Rewrite** `docs/resources/content.json` — the deliverable. Built incrementally across tasks.

### Notation used in this plan

`«L: a.b.c»` means: **copy verbatim** the string value found at dot-path `a.b.c` inside `docs/resources/content.legacy.json`. Do not paraphrase, fix typos, or trim. The preservation check enforces this.

---

### Task 1: Scaffold — snapshot, validator harness, content skeleton

**Files:**
- Create: `docs/resources/content.legacy.json`
- Create: `scripts/validate_content.py`
- Rewrite: `docs/resources/content.json`

**Interfaces:**
- Produces: the validator CLI `python3 scripts/validate_content.py [SECTION ...]`. With no args it runs every registered check; with args it runs only the named ones. Each check is registered via the `@check("name")` decorator and takes the loaded new-content `dict`. Registered here: `site`, `navigation`, `preservation`. Helpers produced for later tasks: `page(data, slug)`, `check_blocks(blocks, ctx)`, `types(blocks, t)`.

- [ ] **Step 1: Snapshot the legacy file**

Run:
```bash
cp docs/resources/content.json docs/resources/content.legacy.json
```
Expected: `content.legacy.json` now exists and is byte-identical to the current `content.json`.

- [ ] **Step 2: Write the validator (the test harness)**

Create `scripts/validate_content.py`:

```python
#!/usr/bin/env python3
"""Validator for docs/resources/content.json (the new content model).

Usage:
    python3 scripts/validate_content.py            # run all checks
    python3 scripts/validate_content.py historia   # run one or more named checks
"""
import json
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT = ROOT / "docs/resources/content.json"
LEGACY = ROOT / "docs/resources/content.legacy.json"

BLOCK_TYPES = {"paragraph", "heading", "list", "image", "quote"}

# Legacy keys whose string values are intentionally NOT preserved (presentation,
# navigation, identifiers that change shape). Used only by the preservation check.
DROP_KEYS = {
    "src", "altura", "largura", "width", "height", "zoom", "order",
    "menuText", "submenu", "subtitulo", "url", "searchParameter", "img",
}
# Specific legacy placeholder values that are intentionally dropped.
DROP_VALUES = {"", "Titulo foto 1", "Titulo foto 2", "Titulo foto 3"}

CHECKS = {}


def check(name):
    def deco(fn):
        CHECKS[name] = fn
        return fn
    return deco


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def fail(msg):
    raise AssertionError(msg)


def need(d, key, ctx):
    if not isinstance(d, dict) or key not in d:
        fail(f"{ctx}: missing '{key}'")
    return d[key]


def page(data, slug):
    pages = need(data, "pages", "root")
    return need(pages, slug, "pages")


def types(blocks, t):
    return [b for b in blocks if isinstance(b, dict) and b.get("type") == t]


def check_blocks(blocks, ctx):
    if not isinstance(blocks, list) or not blocks:
        fail(f"{ctx}: 'body' must be a non-empty array")
    for i, b in enumerate(blocks):
        here = f"{ctx}[{i}]"
        t = need(b, "type", here)
        if t not in BLOCK_TYPES:
            fail(f"{here}: unknown block type '{t}'")
        if t in ("paragraph", "heading", "quote"):
            if not str(need(b, "text", here)).strip():
                fail(f"{here}: empty text")
        elif t == "list":
            items = need(b, "items", here)
            if not isinstance(items, list) or not items:
                fail(f"{here}: 'items' must be a non-empty array")
            if any(not str(x).strip() for x in items):
                fail(f"{here}: empty list item")
        elif t == "image":
            need(b, "src", here)
            need(b, "alt", here)


@check("site")
def check_site(data):
    s = need(data, "site", "root")
    if not str(need(s, "name", "site")).strip():
        fail("site: empty name")
    need(s, "logo", "site")
    nets = {x.get("network") for x in need(s, "social", "site")}
    for n in ("facebook", "instagram"):
        if n not in nets:
            fail(f"site.social: missing '{n}'")


@check("navigation")
def check_navigation(data):
    nav = need(data, "navigation", "root")
    slugs = [n["slug"] for n in nav]
    expected = ["home", "historia", "servicos", "momentos", "contato"]
    if slugs != expected:
        fail(f"navigation order {slugs} != {expected}")
    by_slug = {n["slug"]: n for n in nav}
    serv = {c["slug"]: c for c in by_slug["servicos"]["submenu"]}
    for s in ("equoterapia", "hidroterapia", "reabilitacao-neurofuncional", "hippussuit"):
        if s not in serv:
            fail(f"navigation.servicos.submenu: missing '{s}'")
    if not serv["hippussuit"].get("featured"):
        fail("navigation: hippussuit must be featured")
    mom = [c["slug"] for c in by_slug["momentos"]["submenu"]]
    if mom != ["fotos", "videos"]:
        fail(f"navigation.momentos.submenu {mom} != ['fotos', 'videos']")


def _leaves(node, key=None):
    if isinstance(node, dict):
        for k, v in node.items():
            yield from _leaves(v, k)
    elif isinstance(node, list):
        for v in node:
            yield from _leaves(v, key)
    elif isinstance(node, str):
        if key not in DROP_KEYS and node.strip() and node not in DROP_VALUES:
            yield node


def _norm(s):
    return re.sub(r"\s+", " ", s).strip()


@check("preservation")
def check_preservation(data):
    legacy = load(LEGACY)
    haystack = _norm(json.dumps(data, ensure_ascii=False))
    missing = sorted({s for s in _leaves(legacy) if _norm(s) not in haystack})
    if missing:
        lines = "\n".join(f"  - {m[:90]}" for m in missing)
        fail(f"{len(missing)} legacy string(s) lost:\n{lines}")


def main():
    data = load(CONTENT)
    targets = sys.argv[1:] or list(CHECKS)
    failed = False
    for name in targets:
        if name not in CHECKS:
            print(f"SKIP {name}: no such check")
            continue
        try:
            CHECKS[name](data)
            print(f"PASS {name}")
        except AssertionError as e:
            failed = True
            print(f"FAIL {name}: {e}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Write the content.json skeleton (site + navigation populated, pages empty)**

Overwrite `docs/resources/content.json`:

```json
{
  "site": {
    "name": "Projeto Liberdade",
    "logo": "logo.png",
    "social": [
      { "network": "facebook", "url": "http://www.facebook.com.br/projetoliberdade" },
      { "network": "instagram", "url": "https://www.instagram.com/projetoliberdadereabilitacao" }
    ]
  },
  "navigation": [
    { "slug": "home", "label": "Home", "order": 0 },
    { "slug": "historia", "label": "História", "order": 1 },
    { "slug": "servicos", "label": "Serviços", "order": 2, "submenu": [
      { "slug": "equoterapia", "label": "Equoterapia", "order": 1 },
      { "slug": "equitacao-classica", "label": "Equitação Clássica", "order": 2 },
      { "slug": "equitacao-ludica", "label": "Equitação Lúdica", "order": 3 },
      { "slug": "equitacao-adaptada", "label": "Equitação Adaptada", "order": 4 },
      { "slug": "pet-terapia", "label": "Pet Terapia", "order": 5 },
      { "slug": "hidroterapia", "label": "Hidroterapia", "order": 6 },
      { "slug": "reabilitacao-neurofuncional", "label": "Reabilitação Neurofuncional", "order": 7 },
      { "slug": "hippussuit", "label": "Hippussuit", "order": 9, "featured": true }
    ]},
    { "slug": "momentos", "label": "Momentos", "order": 3, "submenu": [
      { "slug": "fotos", "label": "Fotos", "order": 1 },
      { "slug": "videos", "label": "Vídeos", "order": 2 }
    ]},
    { "slug": "contato", "label": "Contato", "order": 4 }
  ],
  "pages": {
    "home": {},
    "historia": {},
    "servicos": {},
    "momentos": {},
    "contato": {}
  }
}
```

- [ ] **Step 4: Verify site + navigation pass**

Run: `python3 scripts/validate_content.py site navigation`
Expected:
```
PASS site
PASS navigation
```
(exit code 0)

- [ ] **Step 5: Verify the harness can fail (sanity check)**

Run: `python3 scripts/validate_content.py historia`
Expected: `SKIP historia: no such check` (the `historia` check is added in Task 3 — confirms the CLI is wired and nothing silently passes).

- [ ] **Step 6: Commit**

```bash
git add scripts/validate_content.py docs/resources/content.legacy.json docs/resources/content.json
git commit -m "feat(content): scaffold redesigned content.json with site + navigation"
```

---

### Task 2: Home page (hero images)

**Files:**
- Modify: `scripts/validate_content.py` (add `check_home`)
- Modify: `docs/resources/content.json` (`pages.home`)

**Interfaces:**
- Consumes: `page`, `types`, `check_blocks` from Task 1.
- Produces: `home` check (`hero.images` is a 14-item array of `{src,alt}` with `src` under `hero/`).

- [ ] **Step 1: Write the failing test** — insert this function just above `def main():` in `scripts/validate_content.py`:

```python
@check("home")
def check_home(data):
    p = page(data, "home")
    if p.get("title") != "Home":
        fail("home: title must be 'Home'")
    images = need(p, "hero", "home")["images"]
    if len(images) != 14:
        fail(f"home.hero.images: expected 14, got {len(images)}")
    for i, img in enumerate(images):
        here = f"home.hero.images[{i}]"
        if not str(need(img, "src", here)).startswith("hero/"):
            fail(f"{here}: src must start with 'hero/'")
        need(img, "alt", here)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 scripts/validate_content.py home`
Expected: `FAIL home: home: title must be 'Home'`

- [ ] **Step 3: Populate `pages.home`** — replace `"home": {}` in `content.json` with:

```json
"home": {
  "slug": "home",
  "title": "Home",
  "hero": {
    "images": [
      { "src": "hero/FB_IMG_1526579537656.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526579797013.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526579813114.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526579880959.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526579932897.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526579963187.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526579991299.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526580011702.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526580019545.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526580085053.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526580223761.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526580449757.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526579791775.jpg", "alt": "" },
      { "src": "hero/FB_IMG_1526583032060.jpg", "alt": "" }
    ]
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 scripts/validate_content.py home`
Expected: `PASS home`

- [ ] **Step 5: Commit**

```bash
git add scripts/validate_content.py docs/resources/content.json
git commit -m "feat(content): add home hero images"
```

---

### Task 3: História page + Missão/Visão/Valores featured section

**Files:**
- Modify: `scripts/validate_content.py` (add `check_historia`)
- Modify: `docs/resources/content.json` (`pages.historia`)

**Interfaces:**
- Consumes: `page`, `types`, `check_blocks`.
- Produces: `historia` check (body = image + ≥4 paragraphs + quote; one featured section `missao-visao-valores` with 3 headings + a 5-item list).

- [ ] **Step 1: Write the failing test** — insert above `def main():`:

```python
@check("historia")
def check_historia(data):
    p = page(data, "historia")
    if p.get("title") != "História":
        fail("historia: title must be 'História'")
    body = need(p, "body", "historia")
    check_blocks(body, "historia.body")
    if not types(body, "image"):
        fail("historia.body: missing image block")
    if not types(body, "quote"):
        fail("historia.body: missing quote block")
    if len(types(body, "paragraph")) < 4:
        fail("historia.body: expected >=4 paragraphs")
    secs = need(p, "sections", "historia")
    mvv = next((s for s in secs if s.get("slug") == "missao-visao-valores"), None)
    if mvv is None:
        fail("historia.sections: missing 'missao-visao-valores'")
    if not mvv.get("featured"):
        fail("missao-visao-valores: must be featured")
    sb = need(mvv, "body", "missao-visao-valores")
    check_blocks(sb, "missao-visao-valores.body")
    if len(types(sb, "heading")) != 3:
        fail("missao-visao-valores: expected 3 headings")
    lists = types(sb, "list")
    if not lists or len(lists[0]["items"]) != 5:
        fail("missao-visao-valores: Valores list must have 5 items")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 scripts/validate_content.py historia`
Expected: `FAIL historia: historia: title must be 'História'`

- [ ] **Step 3: Populate `pages.historia`** — replace `"historia": {}` with the following, substituting every `«L: ...»` with the verbatim legacy string at that path:

```json
"historia": {
  "slug": "historia",
  "title": "História",
  "body": [
    { "type": "image", "src": "fotos/historia/FB_IMG_1526587620052.jpg", "alt": "" },
    { "type": "paragraph", "text": "«L: historia.historia.p1.txts.txt»" },
    { "type": "paragraph", "text": "«L: historia.historia.p1.txts.txt2»" },
    { "type": "paragraph", "text": "«L: historia.historia.p1.txts.txt3»" },
    { "type": "paragraph", "text": "«L: historia.historia.p2.txts.txt»" },
    { "type": "quote", "text": "«L: historia.historia.p2.txts.txt2»" }
  ],
  "sections": [
    {
      "slug": "missao-visao-valores",
      "title": "Missão, Visão e Valores",
      "order": 1,
      "featured": true,
      "body": [
        { "type": "heading", "text": "Missão" },
        { "type": "paragraph", "text": "«L: missao.missao.p1.txts.txt»" },
        { "type": "heading", "text": "Visão" },
        { "type": "paragraph", "text": "«L: missao.visao.p1.txts.txt»" },
        { "type": "heading", "text": "Valores" },
        { "type": "list", "items": [
          "«L: missao.valores.p1.txts.txt»",
          "«L: missao.valores.p2.txts.txt»",
          "«L: missao.valores.p3.txts.txt»",
          "«L: missao.valores.p4.txts.txt»",
          "«L: missao.valores.p5.txts.txt»"
        ]}
      ]
    }
  ]
}
```

> The `quote` block intentionally holds the **entire** legacy `p2.txt2` string (including its "...diz André Amaral e Karina Hollatz." attribution) so no text is lost; do not split it.

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 scripts/validate_content.py historia`
Expected: `PASS historia`

- [ ] **Step 5: Commit**

```bash
git add scripts/validate_content.py docs/resources/content.json
git commit -m "feat(content): add historia page and missao-visao-valores section"
```

---

### Task 4: Serviços page + service catalog (7 items)

**Files:**
- Modify: `scripts/validate_content.py` (add `check_servicos`)
- Modify: `docs/resources/content.json` (`pages.servicos`)

**Interfaces:**
- Consumes: `page`, `types`, `check_blocks`.
- Produces: `servicos` check (intro paragraph + the 7 catalog sections; hidroterapia ≥4 paragraphs, equoterapia ≥2). Hippussuit is validated separately in Task 5.

- [ ] **Step 1: Write the failing test** — insert above `def main():`:

```python
SERVICE_SLUGS = [
    "equoterapia", "equitacao-classica", "equitacao-ludica",
    "equitacao-adaptada", "pet-terapia", "hidroterapia",
    "reabilitacao-neurofuncional",
]


@check("servicos")
def check_servicos(data):
    p = page(data, "servicos")
    if p.get("title") != "Serviços":
        fail("servicos: title must be 'Serviços'")
    if len(types(need(p, "body", "servicos"), "paragraph")) < 1:
        fail("servicos.body: expected an intro paragraph")
    secs = {s["slug"]: s for s in need(p, "sections", "servicos")}
    for slug in SERVICE_SLUGS:
        if slug not in secs:
            fail(f"servicos.sections: missing '{slug}'")
        check_blocks(need(secs[slug], "body", slug), f"servicos.{slug}.body")
    if len(types(secs["hidroterapia"]["body"], "paragraph")) < 4:
        fail("hidroterapia: expected >=4 paragraphs")
    if len(types(secs["equoterapia"]["body"], "paragraph")) < 2:
        fail("equoterapia: expected >=2 paragraphs")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 scripts/validate_content.py servicos`
Expected: `FAIL servicos: servicos: title must be 'Serviços'`

- [ ] **Step 3: Populate `pages.servicos`** — replace `"servicos": {}` with the following (substitute every `«L: ...»` verbatim):

```json
"servicos": {
  "slug": "servicos",
  "title": "Serviços",
  "body": [
    { "type": "paragraph", "text": "«L: servicos.servicos.p1.txts.txt»" }
  ],
  "sections": [
    { "slug": "equoterapia", "title": "Equoterapia", "order": 1, "body": [
      { "type": "paragraph", "text": "«L: servicos.equoterapia.p1.txts.txt»" },
      { "type": "paragraph", "text": "«L: servicos.equoterapia.p2.txts.txt»" }
    ]},
    { "slug": "equitacao-classica", "title": "Equitação Clássica", "order": 2, "body": [
      { "type": "paragraph", "text": "«L: servicos.equitacao_classica.p1.txts.txt»" }
    ]},
    { "slug": "equitacao-ludica", "title": "Equitação Lúdica", "order": 3, "body": [
      { "type": "paragraph", "text": "«L: servicos.equitacao_ludica.p1.txts.txt»" }
    ]},
    { "slug": "equitacao-adaptada", "title": "Equitação Adaptada", "order": 4, "body": [
      { "type": "paragraph", "text": "«L: servicos.equitacao_adaptada.p1.txts.txt»" }
    ]},
    { "slug": "pet-terapia", "title": "Pet Terapia", "order": 5, "body": [
      { "type": "paragraph", "text": "«L: servicos.pet_terapia.p1.txts.txt»" }
    ]},
    { "slug": "hidroterapia", "title": "Hidroterapia", "order": 6, "body": [
      { "type": "paragraph", "text": "«L: servicos.hidroterapia.p1.txts.txt»" },
      { "type": "paragraph", "text": "«L: servicos.hidroterapia.p2.txts.txt»" },
      { "type": "paragraph", "text": "«L: servicos.hidroterapia.p3.txts.txt»" },
      { "type": "paragraph", "text": "«L: servicos.hidroterapia.p4.txts.txt»" }
    ]},
    { "slug": "reabilitacao-neurofuncional", "title": "Reabilitação Neurofuncional", "order": 7, "body": [
      { "type": "paragraph", "text": "«L: servicos.reabilitacao_neurofuncional.p1.txts.txt»" }
    ]}
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 scripts/validate_content.py servicos`
Expected: `PASS servicos`

- [ ] **Step 5: Commit**

```bash
git add scripts/validate_content.py docs/resources/content.json
git commit -m "feat(content): add servicos page and service catalog"
```

---

### Task 5: Hippussuit featured section

**Files:**
- Modify: `scripts/validate_content.py` (add `check_hippussuit`)
- Modify: `docs/resources/content.json` (append to `pages.servicos.sections`)

**Interfaces:**
- Consumes: `page`, `types`, `check_blocks`.
- Produces: `hippussuit` check (featured section under servicos; an image, ≥6 paragraphs, and three lists of length 14, 5, 4 in that order).

- [ ] **Step 1: Write the failing test** — insert above `def main():`:

```python
@check("hippussuit")
def check_hippussuit(data):
    secs = {s["slug"]: s for s in page(data, "servicos").get("sections", [])}
    h = secs.get("hippussuit")
    if h is None:
        fail("servicos.sections: missing 'hippussuit'")
    if not h.get("featured"):
        fail("hippussuit: must be featured")
    body = need(h, "body", "hippussuit")
    check_blocks(body, "hippussuit.body")
    if not types(body, "image"):
        fail("hippussuit.body: missing image block")
    if len(types(body, "paragraph")) < 6:
        fail("hippussuit.body: expected >=6 paragraphs")
    list_lens = [len(b["items"]) for b in types(body, "list")]
    if list_lens != [14, 5, 4]:
        fail(f"hippussuit lists {list_lens} != [14, 5, 4]")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 scripts/validate_content.py hippussuit`
Expected: `FAIL hippussuit: servicos.sections: missing 'hippussuit'`

- [ ] **Step 3: Append the Hippussuit section** — add this object as the **last** element of `pages.servicos.sections` (after `reabilitacao-neurofuncional`; remember the preceding `}` needs a trailing comma). Substitute every `«L: ...»` verbatim, **preserving list order** `li, li2, li3, … li14`:

```json
{
  "slug": "hippussuit",
  "title": "Hippussuit",
  "order": 9,
  "featured": true,
  "body": [
    { "type": "image", "src": "4A525824-894C-448B-A5F0-33890C8D6F10.jpg", "alt": "" },
    { "type": "paragraph", "text": "«L: hippussuit.hippussuit.p1.txts.txt»" },
    { "type": "paragraph", "text": "«L: hippussuit.hippussuit.p1.txts.txt2»" },
    { "type": "paragraph", "text": "«L: hippussuit.hippussuit.p1.txts.txt3»" },
    { "type": "paragraph", "text": "«L: hippussuit.hippussuit.p2.txts.txt»" },
    { "type": "list", "items": [
      "«L: hippussuit.hippussuit.p2.txts.ul.li»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li2»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li3»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li4»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li5»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li6»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li7»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li8»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li9»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li10»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li11»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li12»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li13»",
      "«L: hippussuit.hippussuit.p2.txts.ul.li14»"
    ]},
    { "type": "paragraph", "text": "«L: hippussuit.hippussuit.p3.txts.txt»" },
    { "type": "list", "items": [
      "«L: hippussuit.hippussuit.p3.txts.ul.li»",
      "«L: hippussuit.hippussuit.p3.txts.ul.li2»",
      "«L: hippussuit.hippussuit.p3.txts.ul.li3»",
      "«L: hippussuit.hippussuit.p3.txts.ul.li4»",
      "«L: hippussuit.hippussuit.p3.txts.ul.li5»"
    ]},
    { "type": "paragraph", "text": "«L: hippussuit.hippussuit.p4.txts.txt»" },
    { "type": "paragraph", "text": "«L: hippussuit.hippussuit.p4.txts.txt2»" },
    { "type": "paragraph", "text": "«L: hippussuit.hippussuit.p5.txts.txt»" },
    { "type": "list", "items": [
      "«L: hippussuit.hippussuit.p5.txts.ul.li»",
      "«L: hippussuit.hippussuit.p5.txts.ul.li2»",
      "«L: hippussuit.hippussuit.p5.txts.ul.li3»",
      "«L: hippussuit.hippussuit.p5.txts.ul.li4»"
    ]}
  ]
}
```

> **Asset note:** the legacy Hippussuit image `4A525824-894C-448B-A5F0-33890C8D6F10.jpg` is referenced by bare filename and is not under any known assets folder. Keep the reference as written; confirm/relocate the actual image file during the website build (out of scope for this migration).

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 scripts/validate_content.py hippussuit`
Expected: `PASS hippussuit`

- [ ] **Step 5: Commit**

```bash
git add scripts/validate_content.py docs/resources/content.json
git commit -m "feat(content): add hippussuit featured section"
```

---

### Task 6: Momentos page (Fotos + Vídeos)

**Files:**
- Modify: `scripts/validate_content.py` (add `check_momentos`)
- Modify: `docs/resources/content.json` (`pages.momentos`)

**Interfaces:**
- Consumes: `page`, `need`.
- Produces: `momentos` check (3 albums with the expected slugs, each a cover + 3 photos; 2 videos whose `url` contains no `autoplay`).

- [ ] **Step 1: Write the failing test** — insert above `def main():`:

```python
@check("momentos")
def check_momentos(data):
    p = page(data, "momentos")
    if p.get("title") != "Momentos":
        fail("momentos: title must be 'Momentos'")
    albums = need(need(p, "photos", "momentos"), "albums", "momentos.photos")
    slugs = [a["slug"] for a in albums]
    if slugs != ["reabilitacao", "liberdade", "desenvolvimento"]:
        fail(f"momentos albums {slugs} unexpected")
    for a in albums:
        here = f"momentos.album[{a['slug']}]"
        need(need(a, "cover", here), "src", here + ".cover")
        if len(need(a, "photos", here)) != 3:
            fail(f"{here}: expected 3 photos")
    videos = need(p, "videos", "momentos")
    if len(videos) != 2:
        fail(f"momentos.videos: expected 2, got {len(videos)}")
    for v in videos:
        if "autoplay" in need(v, "url", "momentos.video"):
            fail("momentos.videos: url must not contain 'autoplay'")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 scripts/validate_content.py momentos`
Expected: `FAIL momentos: momentos: title must be 'Momentos'`

- [ ] **Step 3: Populate `pages.momentos`** — replace `"momentos": {}` with:

```json
"momentos": {
  "slug": "momentos",
  "title": "Momentos",
  "photos": {
    "albums": [
      {
        "slug": "reabilitacao",
        "title": "Reabilitação",
        "cover": { "src": "fotos/album1/FB_IMG_1526582851926.jpg", "alt": "" },
        "photos": [
          { "src": "fotos/album1/FB_IMG_1526582851926.jpg", "alt": "", "caption": "" },
          { "src": "fotos/album1/FB_IMG_1526579797013.jpg", "alt": "", "caption": "" },
          { "src": "fotos/album1/FB_IMG_1526579813114.jpg", "alt": "", "caption": "" }
        ]
      },
      {
        "slug": "liberdade",
        "title": "Liberdade",
        "cover": { "src": "fotos/album2/FB_IMG_1526579880959.jpg", "alt": "" },
        "photos": [
          { "src": "fotos/album2/FB_IMG_1526579880959.jpg", "alt": "", "caption": "" },
          { "src": "fotos/album2/FB_IMG_1526579932897.jpg", "alt": "", "caption": "" },
          { "src": "fotos/album2/FB_IMG_1526579963187.jpg", "alt": "", "caption": "" }
        ]
      },
      {
        "slug": "desenvolvimento",
        "title": "Desenvolvimento",
        "cover": { "src": "fotos/album3/FB_IMG_1526579991299.jpg", "alt": "" },
        "photos": [
          { "src": "fotos/album3/FB_IMG_1526579991299.jpg", "alt": "", "caption": "" },
          { "src": "fotos/album3/FB_IMG_1526580011702.jpg", "alt": "", "caption": "" },
          { "src": "fotos/album3/FB_IMG_1526580019545.jpg", "alt": "", "caption": "" }
        ]
      }
    ]
  },
  "videos": [
    { "slug": "o-menino-e-seu-cavalo", "title": "O menino e seu cavalo", "order": 1, "url": "https://www.youtube.com/embed/bAkqnk5AqOc" },
    { "slug": "o-projeto-liberdade", "title": "O projeto liberdade", "order": 2, "url": "https://www.youtube.com/embed/RcaxtQWPI_c" }
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 scripts/validate_content.py momentos`
Expected: `PASS momentos`

- [ ] **Step 5: Commit**

```bash
git add scripts/validate_content.py docs/resources/content.json
git commit -m "feat(content): add momentos page with albums and videos"
```

---

### Task 7: Contato page

**Files:**
- Modify: `scripts/validate_content.py` (add `check_contato`)
- Modify: `docs/resources/content.json` (`pages.contato`)

**Interfaces:**
- Consumes: `page`, `need`.
- Produces: `contato` check (email; 2 whatsapp phones for Karina + André; 2 units `serra`/`sao-paulo`; serra uses `map.query`, sao-paulo uses `map.coordinates`).

- [ ] **Step 1: Write the failing test** — insert above `def main():`:

```python
@check("contato")
def check_contato(data):
    p = page(data, "contato")
    if "@" not in str(need(p, "email", "contato")):
        fail("contato.email invalid")
    phones = need(p, "phones", "contato")
    names = {ph["name"] for ph in phones}
    if names != {"Karina", "André"}:
        fail(f"contato.phones names {names} unexpected")
    if not all(ph.get("whatsapp") for ph in phones):
        fail("contato.phones: all must be whatsapp")
    units = {u["slug"]: u for u in need(p, "units", "contato")}
    if set(units) != {"serra", "sao-paulo"}:
        fail(f"contato.units {set(units)} unexpected")
    for slug, u in units.items():
        addr = need(u, "address", f"unit[{slug}]")
        for f in ("street", "district", "city", "state", "postalCode"):
            need(addr, f, f"unit[{slug}].address")
        need(u, "phone", f"unit[{slug}]")
    if "query" not in units["serra"]["map"]:
        fail("unit[serra].map must use 'query'")
    coords = units["sao-paulo"]["map"].get("coordinates", {})
    if not isinstance(coords.get("lat"), (int, float)) or not isinstance(coords.get("lng"), (int, float)):
        fail("unit[sao-paulo].map.coordinates must have numeric lat/lng")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 scripts/validate_content.py contato`
Expected: `FAIL contato: contato: missing 'email'`

- [ ] **Step 3: Populate `pages.contato`** — replace `"contato": {}` with (note `street` for São Paulo copies the legacy value **verbatim**, including its trailing-period typo, so the preservation check passes):

```json
"contato": {
  "slug": "contato",
  "title": "Contato",
  "email": "contato@projetoliberdade.com.br",
  "phones": [
    { "name": "Karina", "number": "(11) 94191-7707", "whatsapp": true },
    { "name": "André", "number": "(11) 95059-6727", "whatsapp": true }
  ],
  "units": [
    {
      "slug": "serra",
      "name": "Haras Liberdade - Serra",
      "label": "Unidade 1 - Serra",
      "address": {
        "street": "R. Flôr da Penha, 916",
        "district": "Bela Vista",
        "city": "Mairiporã",
        "state": "SP",
        "postalCode": "07612-852"
      },
      "phone": "11 94191-7707",
      "map": { "query": "Projeto Liberdade Reabilitação e Equoterapia" }
    },
    {
      "slug": "sao-paulo",
      "name": "Unidade - São Paulo",
      "label": "Unidade 2 - São Paulo",
      "address": {
        "street": "Av. Nova Cantareira. 4775",
        "district": "Tremembé",
        "city": "São Paulo",
        "state": "SP",
        "postalCode": "02341-002"
      },
      "phone": "11 92069-2909",
      "map": { "coordinates": { "lat": -23.458892, "lng": -46.615464 } }
    }
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 scripts/validate_content.py contato`
Expected: `PASS contato`

- [ ] **Step 5: Commit**

```bash
git add scripts/validate_content.py docs/resources/content.json
git commit -m "feat(content): add contato page"
```

---

### Task 8: Full validation + content-preservation

**Files:**
- Modify (only if a real false-positive is found): `scripts/validate_content.py` (`DROP_VALUES`)

**Interfaces:**
- Consumes: every check registered in Tasks 1–7 plus `preservation`.

- [ ] **Step 1: Run every check including preservation**

Run: `python3 scripts/validate_content.py`
Expected: `PASS` for `site`, `navigation`, `preservation`, `home`, `historia`, `servicos`, `hippussuit`, `momentos`, `contato` (exit code 0).

- [ ] **Step 2: If `preservation` fails**

Read each reported "lost" string:
- If it is genuine prose that was dropped or mistyped during migration → **fix `content.json`** (add the missing block / correct the text to match legacy verbatim) and re-run.
- Only if the string is a value the spec intentionally drops (a presentation/placeholder artifact not already covered by `DROP_KEYS`) → add it to `DROP_VALUES` in `scripts/validate_content.py` with a brief comment, then re-run.

Repeat Step 1 until everything passes.

- [ ] **Step 3: Confirm the file is valid, formatted JSON**

Run: `python3 -m json.tool docs/resources/content.json > /dev/null && echo OK`
Expected: `OK`

- [ ] **Step 4: Confirm no legacy quirks leaked into the new file**

Run: `grep -nE '"(altura|largura|width|height|zoom|menuText|img_dir|img_esq)"' docs/resources/content.json || echo CLEAN`
Expected: `CLEAN`

- [ ] **Step 5: Commit**

```bash
git add scripts/validate_content.py docs/resources/content.json
git commit -m "test(content): pass full schema + content-preservation validation"
```

---

## Self-Review

**Spec coverage:**
- §3 decisions (consumption, separation, top-level, keys, values, slugs, blocks, IA) → Global Constraints + Tasks 1–7. ✓
- §4 conventions (slugs, order, image shape, block types) → enforced by `check_blocks` + per-section checks. ✓
- §5.1 `site`, §5.2 `navigation` → Task 1. ✓
- §6.1 prose pages (historia, servicos) → Tasks 3, 4, 5. ✓
- §6.2 momentos, §6.3 home, §6.4 contato → Tasks 6, 2, 7. ✓
- §7 dropped legacy fields → enforced negatively by Task 8 Step 4 + `DROP_KEYS`. ✓
- §9 outcome (single valid file, no content lost) → Task 8 (preservation + json.tool). ✓

**Placeholder scan:** `«L: ...»` tokens are explicit verbatim-copy instructions with exact source paths, not vague TODOs; the `alt: ""` / `caption: ""` empties are spec-sanctioned (§8). No "TBD"/"handle edge cases"/"similar to Task N". ✓

**Type consistency:** Helper names (`page`, `need`, `types`, `check_blocks`, `fail`, `check`) defined in Task 1 and used identically in Tasks 2–7. CLI section names (`site`, `navigation`, `home`, `historia`, `servicos`, `hippussuit`, `momentos`, `contato`, `preservation`) match between registration and the `Run:` commands. ✓
