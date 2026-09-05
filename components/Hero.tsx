'use client';

import CountUp from '@/components/CountUp';
import HeroSearch from '@/components/HeroSearch';
import HeroCanvas from '@/components/HeroCanvas';
import type { Kpis } from '@/lib/kpis';
import { fmtInt, fmtMM, fmtBN, fmtDeltaPct } from '@/lib/format';

const RISE = 'oep-rise';

/**
 * Hero editorial en clave clara: sobre fondo papel, un canvas dibuja la
 * silueta de Chile en retícula de puntos y una partícula por expediente SEIA
 * (ver HeroCanvas). Titular serif grande, buscador con subrayado y franja de
 * KPIs con separadores hairline.
 */
export default function Hero({ k }: { k: Kpis | null }) {
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
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-oep-paper text-oep-ink">
      {/* Mapa vivo: retícula de Chile + partículas por expediente */}
      <HeroCanvas />

      {/* Grano de impresión */}
      <div className="oep-grain pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />

      {/* Veladuras de legibilidad (claras) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-oep-paper via-oep-paper/75 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-oep-paper to-transparent" />

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-content flex-1 flex-col justify-center px-6 pb-36 pt-32 lg:px-10">
        <p className={`oep-eyebrow ${RISE}`} style={{ animationDelay: '80ms' }}>
          Observatorio Económico de Permisos · {k ? `${k.totales.anio_ini}–${k.periodo}` : '1993–2026-T2'}
        </p>
        <h1
          className={`oep-headline mt-8 max-w-4xl text-[clamp(44px,7vw,100px)] leading-[1.02] tracking-tight ${RISE}`}
          style={{ animationDelay: '180ms' }}
        >
          Tres décadas de inversión,{' '}
          <em className="font-medium italic text-oep-emerald">permiso a permiso.</em>
        </h1>
        <p
          className={`mt-7 max-w-xl text-[17px] leading-7 text-oep-ink/70 lg:text-[19px] lg:leading-8 ${RISE}`}
          style={{ animationDelay: '300ms' }}
        >
          Cada punto del mapa es un expediente real presentado ante el SEIA. Los convertimos en
          inteligencia económica abierta: regiones, sectores, titulares y tiempos de aprobación.
        </p>

        <div className={`${RISE} pointer-events-auto`} style={{ animationDelay: '420ms' }}>
          <HeroSearch />
        </div>

        <div className={`mt-9 flex flex-wrap items-center gap-4 ${RISE} pointer-events-auto`} style={{ animationDelay: '520ms' }}>
          <a
            href="#mapa"
            className="rounded-[10px] bg-oep-ink px-5 py-3 text-[15px] font-semibold text-oep-paper transition-all duration-nav hover:-translate-y-0.5 hover:bg-oep-emerald hover:text-white"
          >
            Explorar el mapa
          </a>
          <a
            href="#pulso"
            className="rounded-[10px] border border-oep-ink/25 px-5 py-3 text-[15px] font-semibold text-oep-ink transition-colors duration-nav hover:border-oep-ink hover:bg-oep-ink/5"
          >
            El pulso del trimestre
          </a>
        </div>

        {/* Franja de KPIs con separadores hairline */}
        <dl
          className={`mt-16 grid grid-cols-2 gap-x-8 border-t border-oep-line pt-8 lg:grid-cols-4 ${RISE} pointer-events-auto`}
          style={{ animationDelay: '640ms' }}
        >
          {stats.map((s) => (
            <div key={s.label} className="border-oep-line py-2 lg:border-l lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
              <dt className="oep-label text-[11px] text-oep-ink/55">{s.label}</dt>
              <dd className="mt-2 font-display text-[28px] font-semibold leading-8 tracking-tight tabular lg:text-[32px]">
                <CountUp value={s.value} format={s.format} />
              </dd>
              <dd className="mt-1 font-mono text-[11px] leading-4 text-slate-500">{s.note}</dd>
            </div>
          ))}
        </dl>
        {q && (dProy !== undefined || dMmu !== undefined) && (
          <p className={`mt-5 font-mono text-[12px] text-slate-500 ${RISE}`} style={{ animationDelay: '760ms' }}>
            {q.periodo}: {fmtInt(q.proyectos)} proyectos ({dProy !== undefined ? fmtDeltaPct(dProy) : '—'} proyectos ·{' '}
            {dMmu !== undefined ? fmtDeltaPct(dMmu) : '—'} inversión vs. período previo)
          </p>
        )}
      </div>

      {/* Indicador de scroll */}
      <div
        className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">desliza</span>
        <span className="oep-scroll-line block h-8 w-px bg-oep-ink/40" />
      </div>
    </section>
  );
}
