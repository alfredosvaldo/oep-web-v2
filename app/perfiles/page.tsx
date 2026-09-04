'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchAgg, type AggItem } from '@/lib/kpis';
import { fmtInt, fmtMM } from '@/lib/format';

function CardGrid({ titulo, items, prefix }: { titulo: string; items: AggItem[]; prefix: string }) {
  return (
    <section>
      {titulo && <h2 className="oep-label text-slate-500">{titulo}</h2>}
      <ul className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${titulo ? 'mt-4' : 'mt-0'}`}>
        {items.map((it) => (
          <li key={it.slug}>
            <Link
              href={`/perfiles/${prefix}${it.slug}/`}
              className="group block rounded-lg border border-slate-200 bg-white p-4 transition-all duration-nav hover:-translate-y-0.5 hover:border-oep-emerald hover:shadow-md"
            >
              <span className="block truncate text-[15px] font-semibold group-hover:underline">{it.nombre}</span>
              <span className="mt-1 block font-mono text-[12px] tabular text-slate-500">
                {fmtInt(it.proyectos)} proyectos · US$ {fmtMM(it.inversion_mmu)} MM
              </span>
              {it.evaluacion_n > 0 && (
                <span className="mt-2 inline-block rounded bg-oep-copper/10 px-1.5 py-0.5 font-mono text-[10px] text-oep-copper-dark">
                  {fmtInt(it.evaluacion_n)} en evaluación
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Perfiles() {
  const [regiones, setRegiones] = useState<AggItem[] | null>(null);
  const [sectores, setSectores] = useState<AggItem[] | null>(null);
  const [titulares, setTitulares] = useState<AggItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchAgg('region'), fetchAgg('sector'), fetchAgg('titular')])
      .then(([r, s, t]) => {
        setRegiones(r.items);
        setSectores(s.items);
        setTitulares(t.items.slice(0, 12));
      })
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <div className="mx-auto max-w-content space-y-12 px-6 py-12 lg:px-10">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <h1 className="oep-headline text-[32px] leading-9">Perfiles</h1>
              <p className="font-mono text-[12px] text-slate-500">una ficha por región, sector y titular</p>
            </div>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-500">
              Cada perfil cruza la actividad del SEIA con su serie anual, sus principales actores y sus
              expedientes recientes.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-oep-copper bg-slate-50 p-4 text-[14px]">
              No se pudieron cargar los datos: {error}
            </p>
          )}

          {!regiones && !error && (
            <div className="flex h-48 animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <p className="font-mono text-[12px] text-slate-500">Cargando perfiles…</p>
            </div>
          )}

          {regiones && <CardGrid titulo="Regiones" items={regiones} prefix="region-" />}
          {sectores && <CardGrid titulo="Sectores" items={sectores} prefix="sector-" />}
          {titulares && (
            <section>
              <div className="flex items-baseline gap-4">
                <h2 className="oep-label text-slate-500">Titulares líderes</h2>
                <Link href="/rankings/" className="font-mono text-[12px] text-slate-500 hover:underline">
                  ver los 10.512 en rankings →
                </Link>
              </div>
              <CardGrid titulo="" items={titulares} prefix="titular-" />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
