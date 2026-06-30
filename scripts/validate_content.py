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
