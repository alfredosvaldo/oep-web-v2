'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchChileOutline, fetchGeoPoints, VISTA_BBOX } from '@/lib/geo';

const INK = '#14171C';
const EMERALD = '#0E9F6E';
const COPPER = '#C2703D';
const COPPER_DARK = '#9A5830';

const LOOP_SECONDS = 18;
const HOLD_SECONDS = 2;
const DOT_STEP = 7; // px css entre puntos de la retícula
const PARALLAX = 12; // px css máximos de desplazamiento por parallax

/** Proyección plana con corrección de aspecto por coseno de latitud. */
function makeProjector(w: number, h: number, pad = 0.02, cx = 0.5) {
  const [lon0, lon1] = VISTA_BBOX.lon;
  const [lat0, lat1] = VISTA_BBOX.lat;
  const k = Math.cos(((-17 + -56.5) / 2) * (Math.PI / 180));
  const x0 = lon0 * k;
  const x1 = lon1 * k;
  const availW = w * (1 - pad * 2);
  const availH = h * (1 - pad * 2);
  const s = Math.min(availW / (x1 - x0), availH / (lat1 - lat0));
  const ox = (w - (x1 - x0) * s) * cx;
  const oy = (h - (lat1 - lat0) * s) / 2;
  return (lon: number, lat: number): [number, number] => [
    ox + (lon * k - x0) * s,
    oy + (lat1 - lat) * s,
  ];
}

interface Particle {
  x: number;
  y: number;
  r: number;
  color: string;
  base: number;
  /** Año de aparición normalizado 0..1 (con el cursor del loop). */
  reveal: number;
  /** Fase del parpadeo (incluye un desfase mínimo por partícula). */
  phase: number;
}

/**
 * Fondo vivo del hero, en clave clara y editorial: la silueta de Chile se
 * dibuja como retícula de puntos en tinta tenue y cada expediente del SEIA es
 * una partícula (brillo ∝ inversión, cobre si no fue aprobada) que aparece
 * a medida que avanza el cursor 1993→hoy en bucle. Parallax sutil al mouse.
 * Sin echarts: pesa poco y no trae chrome de librería.
 */
export default function HeroCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [anio, setAnio] = useState<number | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [conDatos, setConDatos] = useState(false);
  const conDatosRef = useRef(false);

  useEffect(() => {
    conDatosRef.current = conDatos;
  }, [conDatos]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0;
    let H = 0;
    let baseLayer: HTMLCanvasElement | null = null;
    let particles: Particle[] = [];
    let anioIni = 1993;
    let anioFin = 2026;
    let alive = true;

    // Parallax
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const buildBase = (outline: { type: string; coordinates: never }) => {
      baseLayer = document.createElement('canvas');
      baseLayer.width = Math.round(W * dpr);
      baseLayer.height = Math.round(H * dpr);
      const bctx = baseLayer.getContext('2d');
      if (!bctx) return;

      // 1) Rellena el polígono para saber qué celdas de la grilla son Chile
      const mask = document.createElement('canvas');
      mask.width = baseLayer.width;
      mask.height = baseLayer.height;
      const mctx = mask.getContext('2d');
      if (!mctx) return;
      // cx=0.66: la franja de Chile queda a la derecha, fuera del titular
      const project = makeProjector(mask.width, mask.height, 0.04, 0.66);
      const polys = (outline as unknown as { coordinates: number[][][][] }).coordinates;
      mctx.fillStyle = '#000';
      for (const poly of polys) {
        for (const ring of poly) {
          mctx.beginPath();
          ring.forEach(([lon, lat], i) => {
            const [x, y] = project(lon, lat);
            if (i === 0) mctx.moveTo(x, y);
            else mctx.lineTo(x, y);
          });
          mctx.closePath();
          mctx.fill();
        }
      }
      const data = mctx.getImageData(0, 0, mask.width, mask.height).data;

      // 2) Dibuja la retícula de puntos donde el mask está pintado
      const step = DOT_STEP * dpr;
      bctx.fillStyle = INK;
      for (let y = step / 2; y < mask.height; y += step) {
        for (let x = step / 2; x < mask.width; x += step) {
          if (data[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] > 100) {
            bctx.globalAlpha = 0.22;
            bctx.fillRect(x, y, 1.6 * dpr, 1.6 * dpr);
          }
        }
      }
      bctx.globalAlpha = 1;
    };

    const buildParticles = (geo: Awaited<ReturnType<typeof fetchGeoPoints>>) => {
      const project = makeProjector(W * dpr, H * dpr, 0.04, 0.66);
      anioIni = geo.anio_ini;
      anioFin = Math.max.apply(
        null,
        geo.points.map((p) => p[4]),
      );
      const span = Math.max(anioFin - anioIni, 1);
      particles = [];
      geo.points.forEach((p, i) => {
        const [lon, lat, mmu, eg, anio] = p;
        const [x, y] = project(lon, lat);
        if (x < 0 || y < 0 || x > W * dpr || y > H * dpr) return;
        const r = Math.min(1 + Math.sqrt(Math.max(mmu, 0)) / 16, 4.5) * dpr;
        const color = eg === 0 ? EMERALD : eg === 1 ? COPPER : eg === 2 ? COPPER_DARK : INK;
        const base = eg === 0 ? 0.75 : eg === 1 ? 0.95 : eg === 2 ? 0.6 : 0.35;
        const reveal = (anio - anioIni) / span;
        particles.push({
          x,
          y,
          r,
          color,
          base,
          reveal,
          // Desfase de parpadeo pequeño (≤0.03 del ciclo) para no romper el reveal
          phase: reveal * Math.PI * 2 + (i % 13) * 0.012,
        });
      });
      // Los grandes encima
      particles.sort((a, b) => a.r - b.r);
    };

    const resize = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    fetchChileOutline()
      .then((outline) => {
        if (alive) buildBase(outline.features[0].geometry as never);
      })
      .catch(() => undefined);

    // Los 2,9 MB de expedientes no compiten con el primer paint
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback;
    const loadPoints = () => {
      fetchGeoPoints()
        .then((geo) => {
          if (!alive) return;
          buildParticles(geo);
          conDatosRef.current = true;
          setConDatos(true);
        })
        .catch(() => undefined);
    };
    if (idle) idle(loadPoints, { timeout: 2500 });
    else setTimeout(loadPoints, 1200);

    const onPointer = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * PARALLAX;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * PARALLAX;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let cursor = reduceMotion ? 1 : 0;
    let lastTick = performance.now();
    let lastYearShown = -1;
    let raf = 0;
    let visible = true;
    const onVis = () => {
      visible = document.visibilityState === 'visible';
      lastTick = performance.now();
    };
    document.addEventListener('visibilitychange', onVis);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate((curX + Math.sin(t * 0.00016) * 5) * dpr, (curY + Math.cos(t * 0.00013) * 4) * dpr);
      if (baseLayer) ctx.drawImage(baseLayer, 0, 0);

      if (particles.length) {
        const span = Math.max(anioFin - anioIni + 1, 1);
        const yearFloat = anioIni + cursor * span;
        // Buckets por color + nivel de alfa (10 niveles) para no cambiar
        // fillStyle 30 mil veces por frame
        const buckets = new Map<string, number[]>();
        for (const pt of particles) {
          if (pt.reveal * span > yearFloat - anioIni && cursor < 1) continue;
          const tw = 0.55 + 0.45 * Math.sin(t * 0.0009 + pt.phase);
          const a = Math.round(pt.base * tw * 10) / 10;
          const key = `${pt.color}|${a}`;
          let b = buckets.get(key);
          if (!b) {
            b = [];
            buckets.set(key, b);
          }
          b.push(pt.x, pt.y, pt.r);
        }
        buckets.forEach((vals, key) => {
          const sep = key.lastIndexOf('|');
          ctx.fillStyle = key.slice(0, sep);
          ctx.globalAlpha = Number(key.slice(sep + 1));
          for (let i = 0; i < vals.length; i += 3) {
            const r = vals[i + 2];
            ctx.fillRect(vals[i] - r / 2, vals[i + 1] - r / 2, r, r);
          }
        });
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      if (!reduceMotion) {
        const hold = HOLD_SECONDS / (LOOP_SECONDS + HOLD_SECONDS);
        cursor += (dt * (1 - hold)) / LOOP_SECONDS;
        if (cursor >= 1) cursor = 0;
      }
      curX += (targetX - curX) * 0.045;
      curY += (targetY - curY) * 0.045;
      const span = Math.max(anioFin - anioIni + 1, 1);
      const yearNow = Math.min(Math.floor(anioIni + cursor * span), anioFin);
      if (yearNow !== lastYearShown && conDatosRef.current) {
        lastYearShown = yearNow;
        setAnio(yearNow);
        setProgreso(cursor);
      }
      draw(now);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {anio !== null && (
        <div className="pointer-events-none absolute bottom-20 right-6 text-right lg:right-10">
          <p className="font-display text-[56px] font-medium leading-none tracking-tight text-oep-ink/80 tabular lg:text-[72px]">
            {anio}
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
            expedientes del SEIA, año a año
          </p>
          <div className="ml-auto mt-2 h-px w-40 bg-oep-line">
            <div className="h-px bg-oep-emerald transition-[width] duration-150" style={{ width: `${progreso * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
