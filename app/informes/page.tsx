import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Informes',
  description:
    'Análisis periódicos del OEP sobre la inversión evaluada en el SEIA: cierre de trimestres, sectores y territorios, con la metodología reproducible del observatorio.',
};

/**
 * Catálogo de informes publicados. Para dar de alta uno:
 * 1. Copia el PDF a public/informes/ (p. ej. public/informes/cierre-2026-t2.pdf).
 * 2. Agrega aquí la entrada con título, período, descripción y archivo.
 * La tarjeta destacada (destacado: true) abre la página.
 */
interface Informe {
  slug: string;
  titulo: string;
  periodo: string;
  descripcion: string;
  archivo: string;
  fecha: string;
  tags: string[];
  destacado?: boolean;
}

const INFORMES: Informe[] = [];

function CardInforme({ inf }: { inf: Informe }) {
  return (
    <a
      href={`/informes/${inf.archivo}`}
      className="group flex h-full flex-col rounded-[10px] border border-oep-line bg-white p-6 transition-all duration-nav hover:-translate-y-0.5 hover:border-oep-ink/40"
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-oep-emerald">{inf.periodo}</p>
        <p className="font-mono text-[11px] tabular text-slate-400">{inf.fecha}</p>
      </div>
      <h3 className="oep-headline mt-3 text-[22px] leading-7 tracking-tight group-hover:underline">{inf.titulo}</h3>
      <p className="mt-2 flex-1 text-[14px] leading-6 text-oep-ink/65">{inf.descripcion}</p>
      <div className="mt-5 flex items-center justify-between border-t border-oep-line pt-4">
        <span className="flex gap-2">
          {inf.tags.map((t) => (
            <span key={t} className="rounded border border-oep-line px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
              {t}
            </span>
          ))}
        </span>
        <span className="font-mono text-[12px] text-oep-ink/60 transition-colors group-hover:text-oep-emerald">PDF ↗</span>
      </div>
    </a>
  );
}

export default function Informes() {
  const destacado = INFORMES.find((i) => i.destacado);
  const resto = INFORMES.filter((i) => !i.destacado);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <div className="mx-auto max-w-content px-6 py-16 lg:px-10 lg:py-20">
          <p className="oep-eyebrow">Informes</p>
          <h1 className="oep-headline mt-6 max-w-3xl text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-tight">
            Lecturas de la inversión, <em className="font-medium italic text-oep-emerald">con calma y con datos.</em>
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-7 text-oep-ink/70">
            Análisis periódicos escritos por el equipo del observatorio: cierres de trimestre,
            radiografías sectoriales y lecturas territoriales. Cada cifra sale del mismo pipeline
            público y reproducible que alimenta todo el sitio.
          </p>

          {INFORMES.length === 0 ? (
            <div className="mt-16">
              <div className="flex flex-col items-start gap-4 rounded-[10px] border border-dashed border-oep-ink/25 bg-white/60 p-10 lg:p-14">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">en preparación</p>
                <h2 className="oep-headline text-[clamp(26px,3.5vw,40px)] leading-tight tracking-tight">
                  Informe de cierre 2026-T2
                </h2>
                <p className="max-w-xl text-[15px] leading-7 text-oep-ink/65">
                  El primer informe del observatorio se publicará con el cierre del trimestre: qué se
                  presentó, qué se aprobó, dónde se concentra la cartera y cuánto tardó el sistema en
                  calificar.
                </p>
                <p className="font-mono text-[12px] text-slate-500">publicación estimada · octubre 2026</p>
              </div>

              <div className="mt-12 grid gap-8 border-t border-oep-line pt-10 md:grid-cols-3">
                {[
                  { n: '01', t: 'Datos primero', d: 'Cada afirmación del informe enlaza su cifra con el expediente SEIA que la origina.' },
                  { n: '02', t: 'Método abierto', d: 'Las reglas de limpieza y el diccionario de datos están publicados en Datos y Metodología.' },
                  { n: '03', t: 'Sin apuro', d: 'Publicamos cuando el análisis está listo, no cuando aprieta el calendario.' },
                ].map((p) => (
                  <div key={p.n}>
                    <p className="font-mono text-[12px] tabular text-oep-emerald">{p.n}</p>
                    <p className="oep-headline mt-2 text-[18px] leading-6">{p.t}</p>
                    <p className="mt-2 text-[14px] leading-6 text-oep-ink/65">{p.d}</p>
                  </div>
                ))}
              </div>

              <p className="oep-source mt-12 border-t border-oep-line pt-4">
                Los informes se distribuyen como PDF en esta misma sección; también está disponible la{' '}
                <Link href="/datos-metodologia/" className="underline underline-offset-4 hover:text-oep-emerald">
                  metodología completa
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="mt-14 space-y-10">
              {destacado && <CardInforme inf={destacado} />}
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {resto.map((inf) => (
                  <CardInforme key={inf.slug} inf={inf} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
