'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchAnnual, fetchQuarterly, type Quarter, type Year } from '@/lib/series';

// echarts vive en un chunk aparte: el gráfico se descarga bajo demanda.
const TrendChart = dynamic(() => import('@/components/TrendChart'), { ssr: false });

export default function TrendSection() {
  const [data, setData] = useState<{ anual: Year[]; trimestral: Quarter[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchAnnual(), fetchQuarterly()])
      .then(([a, q]) => setData({ anual: a.anios, trimestral: q.periodos }))
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <section aria-label="Tendencia histórica" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-content px-6 py-12 lg:px-10 lg:py-16">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <h2 className="oep-headline text-[24px] leading-7">2024 igualó el récord de inversión de 2016</h2>
          <p className="font-mono text-[12px] text-slate-500">proyectos e inversión declarada · 1993–2026-T2</p>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-500">
          Menos expedientes que en los picos de 2006–2008, pero de mayor tamaño: el sistema pasó de
          tramitar volumen a tramitar escala.
        </p>

        {error && (
          <p role="alert" className="mt-8 rounded-lg border border-oep-copper bg-white p-4 text-[14px]">
            No se pudieron cargar los datos: {error}
          </p>
        )}
        {data ? (
          <div className="mt-8">
            <TrendChart anual={data.anual} trimestral={data.trimestral} />
            <p className="oep-source mt-4 border-t border-slate-200 pt-3">
              Fuente: SEA. Cálculos OEP. Inversión declarada por los titulares al momento de la presentación.
            </p>
          </div>
        ) : (
          !error && (
            <div className="mt-8 flex h-[380px] animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-white lg:h-[420px]">
              <p className="font-mono text-[12px] text-slate-500">Cargando serie…</p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
