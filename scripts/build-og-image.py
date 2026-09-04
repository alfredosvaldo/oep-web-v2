#!/usr/bin/env python3
"""
OEP — Imagen Open Graph (1200x630) para compartir el sitio.
Compone el póster del hero (mapa de partículas) con titular y KPIs.
Uso: .venv/bin/python scripts/build-og-image.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
POSTER = ROOT / 'public/video/hero-poster.jpg'
OUT = ROOT / 'public/og.jpg'
W, H = 1200, 630
SLATE = (15, 23, 42)
FONT_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FONT_REG = '/System/Library/Fonts/Supplemental/Arial.ttf'


def main():
    poster = Image.open(POSTER).convert('RGB')

    # Fondo: crop del póster centrado en Chile (tercio derecho), oscurecido
    src_w, src_h = poster.size
    crop = poster.crop((int(src_w * 0.35), 0, src_w, src_h)).resize((W, H), Image.LANCZOS)
    dark = Image.new('RGB', (W, H), SLATE)
    bg = Image.blend(dark, crop, 0.75)

    # Veladura izquierda para la tipografía
    overlay = Image.new('L', (W, 1))
    for x in range(W):
        overlay.putpixel((x, 0), int(215 * max(0, 1 - x / (W * 0.72))))
    alpha = overlay.resize((W, H))
    bg.paste(dark, (0, 0), alpha)

    draw = ImageDraw.Draw(bg)
    f_eyebrow = ImageFont.truetype(FONT_BOLD, 20)
    f_title = ImageFont.truetype(FONT_BOLD, 76)
    f_sub = ImageFont.truetype(FONT_REG, 26)

    margin = 72
    y = 150
    draw.text((margin, y), 'OBSERVATORIO ECONÓMICO DE PERMISOS · 1993–2026-T2',
              font=f_eyebrow, fill=(148, 163, 184))
    y += 52
    draw.text((margin, y), 'Tres décadas de inversión,', font=f_title, fill=(248, 250, 252))
    y += 92
    draw.text((margin, y), 'permiso a permiso.', font=f_title, fill=(203, 213, 225))
    y += 130
    draw.text((margin, y), '30.119 proyectos · US$ 1,05 BN declarados ante el SEIA',
              font=f_sub, fill=(226, 232, 240))
    y += 40
    draw.rectangle((margin, y, margin + 56, y + 6), fill=(16, 185, 129))
    draw.rectangle((margin + 64, y, margin + 120, y + 6), fill=(245, 158, 11))

    bg.save(OUT, quality=88)
    print(f'OK — {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1024:.0f} KB)')


if __name__ == '__main__':
    main()
