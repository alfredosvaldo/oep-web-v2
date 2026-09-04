'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import CountUp from '@/components/CountUp';
import HeroSearch from '@/components/HeroSearch';
import type { Kpis } from '@/lib/kpis';
import { fmtInt, fmtMM, fmtBN, fmtDeltaPct } from '@/lib/format';

const RISE = 'oep-rise';
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

// El mapa vivo pesa (~180 kB echarts + dataset): se monta solo en cliente.
const HeroMap = dynamic(() => import('@/components/HeroMap'), { ssr: false });

/**
 * Hero full-screen (estilo observatorio de datos): mapa vivo del SEIA como
 * fondo interactivo —los puntos se construyen año a año en bucle— con el video
 * ambiental como respaldo mientras carga. Titular gigante, buscador de
 * expedientes y franja de KPIs plana.
 */
export default function Hero({ k }: { k: Kpis | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mapListo, setMapListo] = useState(false);
  // El mapa vivo reemplaza al video: se apaga la capa de video (fade + pause)
  const onMapReady = useCallback(() => setMapListo(true), []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const v = videoRef.current;
    if (!v) return;
    const apply = () => {
      if (mq.matches || mapListo) v.pause();
      else v.play().catch(() => undefined);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [mapListo]);

  const q = k?.ultimo_trimestre;
  const dProy = q ? (q.proyectos - q.proyectos_previo) / q.proyectos_previo : undefined;
  const dMmu = q ? (q.inversion_mmu - q.inversion_mmu_previo) / q.inversion_mmu_previo : undefined;

  const stats = [
    { label: 'Proyectos presentados', value: k?.totales.proyectos ?? 30119, format: fmtInt, note: 'expedientes SEIA · 1993–2026-T2' },
    { label: 'Inversión declarada', value: k?.totales.inversion_mmu ?? 1046130, format: (n: number) => `US$ ${fmtBN(n)}`, note: 'billones (10¹²) en dólares declarados' },
    { label: 'Con RCA favorable', value: k?.aprobados.proyectos ?? 18625, format: fmtInt, note: `tasa de aprobación ${k ? (k.aprobados.tasa_aprobacion * 100).toFixed(1).replace('.', ',') : '93,6'} %` },
    {
      label: 'En calificación hoy',
      value: k?.evaluacion.inversion_mmu ?? 88383,
      format: (n: number) => `US$ ${fmtMM(n)}`,
      note: `${k ? fmtInt(k.evaluacion.proyectos) : '365'} proyectos en evaluación`,
    },
  ];

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-oep-slate text-white">
      {/* Capa 1: video ambiental (respaldo mientras el mapa carga / reduced motion) */}
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          mapListo ? 'opacity-0' : 'opacity-90'
        }`}
        autoPlay
        muted
        loop
        playsInline
        poster={`${BASE}/video/hero-poster.jpg`}
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={`${BASE}/video/hero-loop.mp4`} type="video/mp4" />
      </video>
      {/* Capa 2: mapa vivo e interactivo */}
      <HeroMap onReady={onMapReady} />

      {/* Veladuras de legibilidad */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-oep-slate/85 via-oep-slate/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-oep-slate to-transparent" />

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-content flex-1 flex-col justify-center px-6 pb-32 pt-32 lg:px-10">
        <p className={`oep-label text-slate-300 ${RISE}`} style={{ animationDelay: '80ms' }}>
          Observatorio Económico de Permisos · {k ? `${k.totales.anio_ini}–${k.periodo}` : '1993–2026-T2'}
        </p>
        <h1
          className={`oep-headline mt-6 max-w-4xl text-[clamp(42px,7vw,96px)] leading-[1.0] tracking-tight ${RISE}`}
          style={{ animationDelay: '180ms' }}
        >
          Tres décadas de inversión,{' '}
          <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
            permiso a permiso.
          </span>
        </h1>
        <p
          className={`mt-6 max-w-xl text-[17px] leading-7 text-slate-200 lg:text-[19px] lg:leading-8 ${RISE}`}
          style={{ animationDelay: '300ms' }}
        >
          Cada punto del mapa es un expediente real presentado ante el SEIA. Los convertimos en
          inteligencia económica abierta: regiones, sectores, titulares y tiempos de aprobación.
        </p>

        <div className={`${RISE} pointer-events-auto`} style={{ animationDelay: '420ms' }}>
          <HeroSearch />
        </div>

        <div className={`mt-8 flex flex-wrap items-center gap-4 ${RISE} pointer-events-auto`} style={{ animationDelay: '520ms' }}>
          <a
            href="#mapa"
            className="rounded-md bg-oep-emerald px-5 py-3 text-[15px] font-semibold text-oep-slate transition-colors duration-nav hover:bg-emerald-300"
          >
            Explorar el mapa
          </a>
          <a
            href="#pulso"
            className="rounded-md border border-white/25 px-5 py-3 text-[15px] font-semibold text-white transition-colors duration-nav hover:bg-white/10"
          >
            El pulso del trimestre
          </a>
        </div>

        {/* Franja de KPIs plana, estilo terminal */}
        <dl
          className={`mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/15 bg-white/15 backdrop-blur-sm lg:grid-cols-4 ${RISE} pointer-events-auto`}
          style={{ animationDelay: '640ms' }}
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-oep-slate/60 px-5 py-4">
              <dt className="oep-label text-[11px] text-slate-300">{s.label}</dt>
              <dd className="mt-1.5 font-display text-[26px] font-semibold leading-8 tracking-tight tabular lg:text-[30px]">
                <CountUp value={s.value} format={s.format} />
              </dd>
              <dd className="mt-0.5 text-[12px] leading-4 text-slate-400">{s.note}</dd>
            </div>
          ))}
        </dl>
        {q && (dProy !== undefined || dMmu !== undefined) && (
          <p className={`mt-4 font-mono text-[12px] text-slate-400 ${RISE}`} style={{ animationDelay: '760ms' }}>
            {q.periodo}: {fmtInt(q.proyectos)} proyectos ({dProy !== undefined ? fmtDeltaPct(dProy) : '—'} proyectos ·{' '}
            {dMmu !== undefined ? fmtDeltaPct(dMmu) : '—'} inversión vs. período previo)
          </p>
        )}
      </div>

      {/* Indicador de scroll */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex" aria-hidden="true">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">desliza</span>
        <span className="oep-scroll-line block h-8 w-px bg-gradient-to-b from-slate-400 to-transparent" />
      </div>
    </section>
  );
}
