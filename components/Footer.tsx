import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-oep-slate text-slate-300">
      <div className="mx-auto max-w-content px-6 lg:px-10">
        <div className="grid gap-10 py-14 md:grid-cols-3">
          <div>
            <p className="oep-headline text-[18px] leading-6 text-white">Metodología transparente</p>
            <p className="mt-3 max-w-sm text-[14px] leading-5 text-slate-300">
              Cada cifra de este observatorio proviene de los expedientes públicos del SEIA y es
              reproducible: reglas de limpieza, diccionario de datos y código del pipeline están
              publicados.
            </p>
            <Link
              href="/datos-metodologia/"
              className="mt-4 inline-block rounded-[10px] border border-white/25 px-4 py-2 text-[14px] font-semibold text-white transition-colors duration-nav hover:border-oep-emerald hover:text-oep-emerald"
            >
              Ver metodología
            </Link>
          </div>
          <div className="text-[14px] leading-6">
            <p className="oep-label text-slate-400">Fuentes</p>
            <p className="mt-3 text-slate-300">
              Servicio de Evaluación Ambiental (SEA): Sistema de Evaluación de Impacto Ambiental,
              presentaciones 1993–2026-T2.
            </p>
            <p className="oep-source mt-4">Fuente: SEA. Cálculos OEP.</p>
          </div>
          <div className="text-[14px] leading-6">
            <p className="oep-label text-slate-400">Independencia</p>
            <p className="mt-3 text-slate-300">
              OEP es un spin-off universitario independiente: no recibe financiamiento de organismos
              evaluados ni de titulares de proyectos.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-white/10 py-5 font-mono text-[11px] text-slate-400">
          <p>OEP · Observatorio Económico de Permisos — datos SEIA 1993–2026-T2 · pipeline reproducible</p>
          <p className="tabular">ACT. 30.06.2026</p>
        </div>
      </div>
    </footer>
  );
}
