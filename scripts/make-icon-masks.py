"""Convert line-art service icons (dark strokes on a pale baked circle,
already on a transparent RGBA canvas) into transparent alpha masks for
CSS mask-image. Build-time tool, pure Pillow; the site has no Python
runtime dependency.

The source PNGs are RGBA: outside the disc is fully transparent
(alpha 0, RGB black), the disc is a pale opaque fill, strokes are dark
opaque. We derive stroke coverage from inverted luminance, then multiply
by the ORIGINAL alpha so the transparent corners stay transparent (a
plain grayscale of the RGB would turn the black corners opaque)."""

import os

from PIL import Image, ImageChops, ImageOps

SRC = "docs/resources/icons"
DST = "public/icons"
NAMES = [
    "equine-therapy",
    "classical-equitation",
    "playful-riding",
    "adaptive-equitation",
]
LO, HI = 70, 180  # inverted-luminance normalization window; tune in the Task 3 preview
PAD = 0.12  # padding fraction around the trimmed glyph on the square canvas

_SCALE = 255.0 / (HI - LO)


def _normalize(v: int) -> int:
    if v <= LO:
        return 0
    if v >= HI:
        return 255
    return int((v - LO) * _SCALE)


def make_mask(name: str) -> None:
    rgba = Image.open(f"{SRC}/{name}.png").convert("RGBA")
    orig_alpha = rgba.getchannel("A")
    inv = ImageOps.invert(rgba.convert("L"))  # strokes bright, disc dark, corners bright
    norm = inv.point(_normalize)  # stroke coverage, ignoring transparency
    alpha = ImageChops.multiply(norm, orig_alpha)  # zero out originally-transparent pixels

    black = Image.new("L", alpha.size, 0)
    out = Image.merge("RGBA", (black, black, black, alpha))

    bbox = alpha.getbbox()
    if bbox is not None:
        out = out.crop(bbox)

    w, h = out.size
    side = int(max(w, h) * (1 + 2 * PAD))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - w) // 2, (side - h) // 2))
    canvas.save(f"{DST}/{name}.mask.png")
    print(name, out.size, "->", canvas.size)


def main() -> None:
    os.makedirs(DST, exist_ok=True)
    for name in NAMES:
        make_mask(name)


if __name__ == "__main__":
    main()
