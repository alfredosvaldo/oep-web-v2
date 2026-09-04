#!/usr/bin/env python3
"""
OEP — Video ambiental del hero (loop 8 s, 1920x1080, 24 fps).

Renderiza el mapa de puntos del SEIA como campo de partículas sobre Chile
continental: deriva cinematográfica lenta (zoom + paneo sinusoidal de período
= duración del loop, por lo que el loop es perfecto), parpadeo periódico por
punto y un barrido de luz diagonal sutil. La cartera en evaluación (cobre)
pulsa más alto que el resto.

Uso: .venv/bin/python scripts/build-hero-video.py
Requiere: pillow numpy imageio-ffmpeg  (ver README de scripts/)
Salida: public/video/hero-loop.mp4 + public/video/hero-poster.jpg
"""
import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
PX_DEG = 60                      # resolución del lienzo base (px por grado)
LON0, LAT0 = -110.0, -15.0       # esquina NW del lienzo base (Pacífico a la izquierda)
BASE_W, BASE_H = 65 * PX_DEG, 43 * PX_DEG     # 3900 x 2580
FW, FH, FPS, SECONDS = 1920, 1080, 24, 8
FRAMES = FPS * SECONDS
SEED = 20260903

EG_COLOR = {                     # RGB 0-1
    0: (0.063, 0.706, 0.506),    # Aprobado — esmeralda
    1: (0.961, 0.620, 0.043),    # En evaluación — cobre
    2: (0.706, 0.325, 0.098),    # Rechazado — cobre oscuro
    3: (0.392, 0.455, 0.545),    # Desistido-Caducado
    4: (0.239, 0.282, 0.353),    # No calificado-No admitido
}
EG_ALPHA = {0: 0.50, 1: 0.95, 2: 0.55, 3: 0.34, 4: 0.30}

rng = np.random.default_rng(SEED)


def to_px(lon, lat):
    return (lon - LON0) * PX_DEG, (LAT0 - lat) * PX_DEG


def stamp(canvas, x, y, color, alpha, r):
    """Suma un sprite gaussiano suave en (x, y) — recorte en bordes."""
    x, y = int(round(x)), int(round(y))
    rad = max(2, int(math.ceil(r * 2)))
    x0, x1 = max(0, x - rad), min(canvas.shape[1], x + rad + 1)
    y0, y1 = max(0, y - rad), min(canvas.shape[0], y + rad + 1)
    if x0 >= x1 or y0 >= y1:
        return
    ys, xs = np.mgrid[y0:y1, x0:x1]
    d2 = ((xs - x) ** 2 + (ys - y) ** 2) / (r * r)
    g = np.exp(-d2 * 1.6) * alpha
    for c in range(3):
        canvas[y0:y1, x0:x1, c] += g * color[c]


def main():
    pts = json.loads((ROOT / 'public/data/geo/points.json').read_text())
    outline = json.loads((ROOT / 'public/data/geo/chile.json').read_text())
    nombres = pts['nombres']

    # ---------- lienzo base: silueta de Chile + puntos + glow ----------
    base = np.zeros((BASE_H, BASE_W, 3), dtype=np.float32)

    for feat in outline['features']:
        geom = feat['geometry']
        polys = [geom['coordinates']] if geom['type'] == 'Polygon' else geom['coordinates']
        sil = Image.new('L', (BASE_W, BASE_H), 0)
        draw = ImageDraw.Draw(sil)
        for poly in polys:
            ring = [to_px(x, y) for x, y in poly[0]]
            draw.polygon(ring, fill=255)
        sil_arr = np.asarray(sil, dtype=np.float32) / 255.0
        body = np.stack([sil_arr * 0.055, sil_arr * 0.075, sil_arr * 0.110], axis=-1)
        edge_img = sil.filter(ImageFilter.MaxFilter(5))
        edge = (np.asarray(edge_img, dtype=np.float32) / 255.0 - sil_arr).clip(0, 1)
        base += body + np.stack([edge * 0.10, edge * 0.13, edge * 0.18], axis=-1)

    dots = np.zeros_like(base)
    meta = []
    for i, (lon, lat, mmu, eg, anio) in enumerate(pts['points']):
        if not (-76.5 <= lon <= -66 and -56.5 <= lat <= -17):
            continue
        x, y = to_px(lon, lat)
        r = min(1.1 + math.sqrt(max(mmu, 0)) / 34.0, 4.6)
        a = EG_ALPHA[eg]
        if eg == 1:
            r *= 1.5
        stamp(dots, x, y, EG_COLOR[eg], a, r)
        meta.append((x, y, eg, mmu))
    print(f'puntos en vista: {len(meta)}')

    glow = np.asarray(
        Image.fromarray((np.clip(dots, 0, 1) * 255).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(7)
        ), dtype=np.float32) / 255.0
    base = np.clip(base + dots + glow * 1.0, 0, 1)

    # fondo: slate casi negro con leve gradiente vertical
    yy = np.linspace(0, 1, BASE_H)[:, None, None]
    base *= (0.85 + 0.30 * (1 - yy))
    base = np.clip(base * 1.15, 0, 1)

    base_pil = Image.fromarray((base * 255).astype(np.uint8))

    # ---------- capa de parpadeo (período entero de loop → loop perfecto) ----------
    twinkle_idx = [i for i, m in enumerate(meta) if m[2] == 1]
    others = [i for i, m in enumerate(meta) if m[2] != 1]
    twinkle_idx += list(rng.choice(others, size=700, replace=False))
    k_cycles = rng.integers(1, 4, size=len(twinkle_idx))
    phases = rng.uniform(0, 1, size=len(twinkle_idx))
    alphas = np.array([0.85 if meta[i][2] == 1 else 0.5 for i in twinkle_idx])
    coords = np.array([[meta[i][0], meta[i][1]] for i in twinkle_idx])
    sizes = np.array([max(1.4, min(1.1 + math.sqrt(max(meta[i][3], 0)) / 34.0, 4.6) * 1.3) for i in twinkle_idx])
    colors = np.array([EG_COLOR[meta[i][2]] for i in twinkle_idx])

    # ---------- multiplicadores fijos: viñeta + oscurecido izquierdo ----------
    xs = np.linspace(-1, 1, FW)[None, :]
    ys = np.linspace(-1, 1, FH)[:, None]
    vig = 1.0 - 0.42 * np.clip(xs ** 2 * 0.55 + ys ** 2, 0, 1.4) ** 1.2
    left = 1.0 - 0.52 * np.clip((0.55 - xs) / 1.1, 0, 1) ** 1.3
    mult = (vig * left).astype(np.float32)

    sweep_dir = np.array([0.78, 0.63])
    gx = (np.arange(FW) * sweep_dir[0])[None, :] + (np.arange(FH) * sweep_dir[1])[:, None]

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    out_mp4 = ROOT / 'public/video/hero-loop.mp4'
    out_mp4.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg, '-y', '-loglevel', 'error',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{FW}x{FH}', '-r', str(FPS), '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', str(out_mp4),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    span_h = 29.0 * PX_DEG          # alto visible (px base) en zoom 1
    for f in range(FRAMES):
        t = f / FRAMES
        zoom = 1.0 + 0.055 * math.sin(2 * math.pi * t)
        cx = 38.3 * PX_DEG + 0.5 * PX_DEG * math.sin(2 * math.pi * t)
        cy = 21.1 * PX_DEG + 0.85 * PX_DEG * math.sin(2 * math.pi * t + 1.3)
        h = span_h / zoom
        w = h * FW / FH
        x0 = min(max(cx - w / 2, 0), BASE_W - w)
        y0 = min(max(cy - h / 2, 0), BASE_H - h)
        frame = base_pil.resize((FW, FH), Image.LANCZOS, box=(x0, y0, x0 + w, y0 + h))
        img = np.asarray(frame, dtype=np.float32) / 255.0

        # parpadeo
        s = FW / w
        ox, oy = -x0 * s, -y0 * s
        px = coords[:, 0] * s + ox
        py = coords[:, 1] * s + oy
        amp = alphas * (0.5 + 0.5 * np.sin(2 * math.pi * (k_cycles * t + phases)))
        inside = (px > 2) & (px < FW - 3) & (py > 2) & (py < FH - 3)
        for j in np.nonzero(inside)[0]:
            stamp(img, px[j], py[j], colors[j], float(amp[j]) * 0.9, float(sizes[j]) * s * 0.6)

        # barrido de luz (un cicre por loop)
        center = (f / FRAMES) * (FW + FH) * 1.1
        band = np.exp(-((gx - center) / 340.0) ** 2)
        img *= mult[:, :, None] * (1.0 + 0.10 * band)[:, :, None]

        img8 = (np.clip(img, 0, 1) * 255).astype(np.uint8)
        if f == FRAMES // 4:
            Image.fromarray(img8).save(ROOT / 'public/video/hero-poster.jpg', quality=86)
        proc.stdin.write(img8.tobytes())
        if f % 48 == 0:
            print(f'  frame {f}/{FRAMES}')

    proc.stdin.close()
    if proc.wait() != 0:
        sys.exit('ffmpeg falló')
    kb = out_mp4.stat().st_size / 1024
    print(f'OK — public/video/hero-loop.mp4 ({kb / 1024:.1f} MB, {FRAMES} frames)')


if __name__ == '__main__':
    main()
