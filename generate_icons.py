#!/usr/bin/env python3
"""Generates PWA icons (192/512, regular + maskable) for וורדעל."""
from PIL import Image, ImageDraw, ImageFont
import os

INK = (27, 31, 35, 255)
GREEN = (63, 125, 92, 255)
OCHRE = (201, 163, 78, 255)
PAPER = (245, 239, 227, 255)

def find_font(size):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def make_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background: rounded square (or full-bleed square for maskable safe zone)
    pad = int(size * 0.14) if maskable else 0
    radius = int(size * 0.22) if not maskable else 0
    if maskable:
        draw.rectangle([0, 0, size, size], fill=INK)
    else:
        draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=INK)

    # 3x1 tile grid motif: green, ochre, ink-outline — echoes the game board
    inner = size - 2 * pad
    gap = int(inner * 0.06)
    tile_w = (inner - 2 * gap) / 3
    tile_h = tile_w
    top = pad + (inner - tile_h) / 2

    colors = [GREEN, OCHRE, INK]
    letters = ["ו", "ר", "ד"]
    font = find_font(int(tile_h * 0.55))

    for i in range(3):
        x0 = pad + i * (tile_w + gap)
        y0 = top
        x1 = x0 + tile_w
        y1 = y0 + tile_h
        fill = colors[i]
        outline = PAPER if fill == INK else None
        draw.rounded_rectangle(
            [x0, y0, x1, y1],
            radius=int(tile_w * 0.16),
            fill=fill,
            outline=outline,
            width=max(2, int(size * 0.008)) if outline else 0,
        )
        letter = letters[i]
        bbox = draw.textbbox((0, 0), letter, font=font)
        lw, lh = bbox[2] - bbox[0], bbox[3] - bbox[1]
        text_color = PAPER if fill != OCHRE else INK
        draw.text(
            (x0 + tile_w / 2 - lw / 2 - bbox[0], y0 + tile_h / 2 - lh / 2 - bbox[1]),
            letter,
            font=font,
            fill=text_color,
        )

    return img

os.makedirs("public/icons", exist_ok=True)

for size in (192, 512):
    make_icon(size, maskable=False).save(f"public/icons/icon-{size}.png")
    make_icon(size, maskable=True).save(f"public/icons/icon-{size}-maskable.png")

print("Icons generated.")
