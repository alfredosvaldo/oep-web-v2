'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { fetchAgg, type AggItem } from '@/lib/kpis';
import { fmtInt, fmtMM } from '@/lib/format';

function EditorialList({ items, prefix, numbered = true }: { items: AggItem[]; prefix: string; numbered?: boolean }) {
  return (
    <ol className="grid gap-x-12 sm:grid-cols-2">
      {items.map((it, i) => (
        <li key={it.slug}>
          <Link
            href={`/perfiles/${prefix}${it.slug}/`}
            className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-oep-line px-2 py-3.5 transition-colors duration-nav hover:bg-oep-ink/5"
          >
            <span className="w-8 font-mono text-[11px] tabular text-slate-400">
              {numbered ? String(i + 1).padStart(2, '0') : '·'}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[16px] font-medium tracking-tight group-hover:underline">
                {it.nombre}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] tabular text-slate-500">
                {fmtInt(it.proyectos)} proyectos · US$ {fmtMM(it.inversion_mmu)} MM
              </span>
            </span>
            <span className="font-mono text-[12px] text-slate-400 transition-transform duration-nav group-hover:translate-x-1 group-hover:text-oep-emerald">
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function Seccion({
  eyebrow,
  titulo,
  descripcion,
  children,
}: {
  eyebrow: string;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <Reveal>
        <p className="oep-eyebrow">{eyebrow}</p>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <h2 className="oep-headline text-[26px] leading-8 lg:text-[30px] lg:leading-9">{titulo}</h2>
          {descripcion && <p className="max-w-xl text-[14px] leading-6 text-oep-ink/60">{descripcion}</p>}
        </div>
      </Reveal>
      <Reveal delay={120} className="mt-8">
        {children}
      </Reveal>
    </section>
  );
}

export default function ActoresYTerritorio() {
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
        <div className="mx-auto max-w-content space-y-20 px-6 py-16 lg:px-10 lg:py-20">
          <Reveal>
            <p className="oep-eyebrow">Actores y territorio</p>
            <h1 className="oep-headline mt-6 max-w-3xl text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-tight">
              Quién presenta, dónde, y en qué.
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-oep-ink/70">
              Tres cortes del mismo registro: las regiones donde se instala la inversión, los sectores
              que la ejecutan y los titulares que firman los expedientes. Cada ficha cruza la serie
              anual, los principales actores y los proyectos recientes.
            </p>
          </Reveal>

          {error && (
            <p role="alert" className="border border-oep-copper bg-oep-copper/5 p-4 text-[14px] text-oep-copper-dark">
              No se pudieron cargar los datos: {error}
            </p>
          )}

          {!regiones && !error && (
            <div className="flex h-48 animate-pulse items-center justify-center rounded-[10px] border border-oep-line bg-white">
              <p className="font-mono text-[12px] text-slate-500">Cargando el índice…</p>
            </div>
          )}

          {regiones && (
            <Seccion
              eyebrow="17 territorios"
              titulo="Regiones"
              descripcion="Del extremes norte a Magallanes: actividad acumulada y cartera en evaluación por región."
            >
              <EditorialList items={regiones} prefix="region-" />
            </Seccion>
          )}

          {sectores && (
            <Seccion
              eyebrow="14 sectores"
              titulo="Sectores"
              descripcion="Energía, minería, saneamiento y el resto de la tipología del SEIA."
            >
              <EditorialList items={sectores} prefix="sector-" />
            </Seccion>
          )}

          {titulares && (
            <Seccion
              eyebrow="Titulares"
              titulo="Quienes más construyen"
              descripcion="Los doce titulares con mayor inversión declarada; el resto del universo está en Rankings."
            >
              <EditorialList items={titulares} prefix="titular-" numbered={false} />
              <p className="mt-6">
                <Link
                  href="/rankings/"
                  className="font-mono text-[12px] text-oep-ink/60 underline decoration-oep-line underline-offset-4 transition-colors hover:text-oep-emerald"
                >
                  ver los 10.514 titulares en Rankings →
                </Link>
              </p>
            </Seccion>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
