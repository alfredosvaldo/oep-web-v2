'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Reveal from '@/components/Reveal';
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
    <section aria-label="Tendencia histórica" className="border-b border-oep-line bg-oep-paper">
      <div className="mx-auto max-w-content px-6 py-12 lg:px-10 lg:py-16">
        <Reveal>
          <p className="oep-eyebrow">03 · Tres décadas de tendencia</p>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <h2 className="oep-headline text-[28px] leading-8 lg:text-[34px] lg:leading-10">
              2024 igualó el récord de inversión de 2016
            </h2>
            <p className="font-mono text-[12px] text-oep-ink/50">proyectos e inversión declarada · 1993–2026-T2</p>
          </div>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-oep-ink/70">
            Menos expedientes que en los picos de 2006–2008, pero de mayor tamaño: el sistema pasó de
            tramitar volumen a tramitar escala.
          </p>
        </Reveal>

        {error && (
          <p role="alert" className="mt-8 rounded-[10px] border border-oep-copper/50 bg-white p-4 text-[14px] text-oep-copper-dark">
            No se pudieron cargar los datos: {error}
          </p>
        )}
        {data ? (
          <Reveal delay={120} className="mt-10">
            <TrendChart anual={data.anual} trimestral={data.trimestral} />
            <p className="oep-source mt-4 border-t border-oep-line pt-3">
              Fuente: SEA. Cálculos OEP. Inversión declarada por los titulares al momento de la presentación.
            </p>
          </Reveal>
        ) : (
          !error && (
            <div className="mt-10 flex h-[380px] animate-pulse items-center justify-center rounded-[10px] border border-oep-line bg-white lg:h-[420px]">
              <p className="font-mono text-[12px] text-oep-ink/50">Cargando serie…</p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
