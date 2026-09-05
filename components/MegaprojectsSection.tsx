'use client';

import { useEffect, useState } from 'react';
import Reveal from '@/components/Reveal';
import { fetchMegaprojects, type Megaproject } from '@/lib/series';
import { fmtInt, fmtMM, fmtDate } from '@/lib/format';

export default function MegaprojectsSection() {
  const [items, setItems] = useState<Megaproject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMegaprojects()
      .then((d) => setItems(d.proyectos))
      .catch((e) => setError(String(e)));
  }, []);

  const total = items?.reduce((s, p) => s + p.inversion_mmu, 0) ?? 0;

  return (
    <section aria-label="Megaproyectos recientes" className="bg-oep-paper">
      <div className="mx-auto max-w-content px-6 py-12 lg:px-10 lg:py-16">
        <Reveal>
          <p className="oep-eyebrow">04 · Megaproyectos</p>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <h2 className="oep-headline text-[28px] leading-8 lg:text-[34px] lg:leading-10">
              {items ? `${items.length} megaproyectos suman US$ ${fmtMM(total)} MM` : 'Los gigantes recientes'}
            </h2>
            <p className="font-mono text-[12px] text-oep-ink/50">aprobados con RCA · inversión ≥ US$ 100 MM</p>
          </div>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-oep-ink/70">
            Los expedientes más grandes calificados recientemente y el tiempo que tardó el sistema en
            aprobarlos.
          </p>
        </Reveal>

        {error && (
          <p role="alert" className="mt-8 rounded-[10px] border border-oep-copper/50 bg-white p-4 text-[14px] text-oep-copper-dark">
            No se pudieron cargar los datos: {error}
          </p>
        )}

        {items ? (
          <Reveal delay={120} className="mt-10">
            <ul className="border-t border-oep-line">
              {items.map((p, i) => (
                <li key={p.id} className="border-b border-oep-line">
                  <a
                    href={p.link ?? '#'}
                    target={p.link ? '_blank' : undefined}
                    rel="noopener"
                    className="group -mx-3 grid grid-cols-1 gap-2 px-3 py-4 transition-all duration-300 hover:bg-oep-ink/5 hover:pl-6 md:grid-cols-[2fr_1fr_1fr_auto] md:items-baseline md:gap-6"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="w-7 shrink-0 font-mono text-[12px] tabular text-oep-ink/40">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-display text-[17px] font-semibold leading-6 tracking-tight group-hover:underline">
                        {p.nombre}
                        {p.link && <span className="ml-1 font-body font-normal text-oep-ink/40">↗</span>}
                      </span>
                    </span>
                    <span className="pl-11 font-mono text-[12px] text-oep-ink/60 md:pl-0">
                      {p.sector} · {p.region}
                    </span>
                    <span className="pl-11 font-mono text-[12px] text-oep-ink/60 md:pl-0">
                      RCA {p.fecha_calificacion ? fmtDate(p.fecha_calificacion) : '—'}
                      {p.dias_tramitacion != null && ` · ${fmtInt(p.dias_tramitacion)} días`}
                    </span>
                    <span className="pl-11 font-mono text-[14px] font-medium tabular md:pl-0 md:text-right">
                      US$ {fmtMM(p.inversion_mmu)} MM
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : (
          !error && (
            <div className="mt-10 flex h-48 animate-pulse items-center justify-center rounded-[10px] border border-oep-line bg-white">
              <p className="font-mono text-[12px] text-oep-ink/50">Cargando megaproyectos…</p>
            </div>
          )
        )}
        <p className="oep-source mt-4 border-t border-oep-line pt-3">
          Fuente: SEA, Resoluciones de Calificación Ambiental. Cálculos OEP. El enlace abre la ficha oficial del expediente.
        </p>
      </div>
    </section>
  );
}
