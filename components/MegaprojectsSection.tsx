'use client';

import { useEffect, useState } from 'react';
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
    <section aria-label="Megaproyectos recientes" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-content px-6 py-12 lg:px-10 lg:py-16">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <h2 className="oep-headline text-[24px] leading-7">
            {items ? `${items.length} megaproyectos suman US$ ${fmtMM(total)} MM` : 'Los gigantes recientes'}
          </h2>
          <p className="font-mono text-[12px] text-slate-500">aprobados con RCA · inversión ≥ US$ 100 MM</p>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-500">
          Los expedientes más grandes calificados recientemente y el tiempo que tardó el sistema en
          aprobarlos.
        </p>

        {error && (
          <p role="alert" className="mt-8 rounded-lg border border-oep-copper bg-slate-50 p-4 text-[14px]">
            No se pudieron cargar los datos: {error}
          </p>
        )}

        {items ? (
          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
            <ul className="divide-y divide-slate-200">
              {items.map((p, i) => (
                <li key={p.id}>
                  <a
                    href={p.link ?? '#'}
                    target={p.link ? '_blank' : undefined}
                    rel="noopener"
                    className="group grid grid-cols-1 gap-2 px-5 py-4 transition-colors hover:bg-slate-50 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center md:gap-6"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-[12px] tabular text-slate-400">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[15px] font-semibold leading-5 group-hover:underline">
                        {p.nombre}
                        {p.link && <span className="ml-1 text-slate-400">↗</span>}
                      </span>
                    </span>
                    <span className="pl-8 text-[13px] text-slate-500 md:pl-0">
                      {p.sector} · {p.region}
                    </span>
                    <span className="pl-8 font-mono text-[12px] text-slate-500 md:pl-0">
                      RCA {p.fecha_calificacion ? fmtDate(p.fecha_calificacion) : '—'}
                      {p.dias_tramitacion != null && ` · ${fmtInt(p.dias_tramitacion)} días`}
                    </span>
                    <span className="pl-8 font-mono text-[14px] font-medium tabular md:pl-0 md:text-right">
                      US$ {fmtMM(p.inversion_mmu)} MM
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          !error && (
            <div className="mt-8 flex h-48 animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <p className="font-mono text-[12px] text-slate-500">Cargando megaproyectos…</p>
            </div>
          )
        )}
        <p className="oep-source mt-4 border-t border-slate-200 pt-3">
          Fuente: SEA, Resoluciones de Calificación Ambiental. Cálculos OEP. El enlace abre la ficha oficial del expediente.
        </p>
      </div>
    </section>
  );
}
