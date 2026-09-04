'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import CountUp from '@/components/CountUp';
import MapSection from '@/components/MapSection';
import TrendSection from '@/components/TrendSection';
import MegaprojectsSection from '@/components/MegaprojectsSection';
import { fetchKpis, type Kpis } from '@/lib/kpis';
import { fmtInt, fmtMM, fmtBN, fmtDeltaPct } from '@/lib/format';

function PulseStrip({ k }: { k: Kpis }) {
  const q = k.ultimo_trimestre;
  const dProy = (q.proyectos - q.proyectos_previo) / q.proyectos_previo;
  const dMmu = (q.inversion_mmu - q.inversion_mmu_previo) / q.inversion_mmu_previo;
  const cells = [
    { label: 'Proyectos presentados', value: q.proyectos, fmt: fmtInt, delta: dProy },
    { label: 'Inversión declarada', value: q.inversion_mmu, fmt: fmtMM, delta: dMmu, unit: 'US$ MM' },
    {
      label: 'Proyectos aprobados (histórico)',
      value: k.aprobados.proyectos,
      fmt: fmtInt,
      delta: undefined,
    },
    {
      label: 'Cartera en evaluación',
      value: k.evaluacion.inversion_mmu,
      fmt: fmtMM,
      delta: undefined,
      unit: 'US$ MM',
    },
  ];
  return (
    <section id="pulso" aria-label="El pulso del trimestre" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-content px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <h2 className="oep-headline text-[24px] leading-7">El pulso del trimestre</h2>
          <p className="font-mono text-[12px] text-slate-500">{q.periodo} · vs. período previo</p>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 lg:grid-cols-4">
          {cells.map((c) => (
            <div key={c.label} className="bg-white p-5">
              <dt className="oep-label text-slate-500">{c.label}</dt>
              <dd className="mt-2 font-display text-[28px] font-semibold leading-8 tracking-tight tabular">
                <CountUp value={c.value} format={c.fmt} />
                {c.unit && <span className="ml-1.5 text-[13px] font-medium text-slate-500">{c.unit}</span>}
              </dd>
              {c.delta !== undefined && (
                <dd
                  className={`mt-1 text-[13px] font-medium tabular ${
                    c.delta > 0 ? 'text-oep-emerald' : 'text-oep-copper-dark'
                  }`}
                >
                  {fmtDeltaPct(c.delta)} <span className="font-normal text-slate-500">vs. {q.periodo === '2026-T2' ? '2026-T1' : 'período previo'}</span>
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default function Home() {
  const [k, setK] = useState<Kpis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKpis().then(setK).catch((e) => setError(String(e)));
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero k={k} />

        {error && (
          <p role="alert" className="mx-auto mt-8 max-w-content px-6 text-[14px] text-oep-copper-dark lg:px-10">
            No se pudieron cargar los datos: {error}
          </p>
        )}

        {k && <PulseStrip k={k} />}

        {k && <MapSection carteraMmu={k.evaluacion.inversion_mmu} carteraN={k.evaluacion.proyectos} />}

        <TrendSection />

        <MegaprojectsSection />
      </main>
      <Footer />
    </>
  );
}
