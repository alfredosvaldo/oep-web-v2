import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-700">
      <div className="mx-auto grid max-w-content gap-10 px-6 py-14 md:grid-cols-3 lg:px-10">
        <div>
          <p className="oep-headline text-[18px] leading-6 text-oep-slate">Metodología transparente</p>
          <p className="mt-3 max-w-sm text-[14px] leading-5">
            Cada cifra de este observatorio proviene de los expedientes públicos del SEIA y es
            reproducible: reglas de limpieza, diccionario de datos y código del pipeline están
            publicados.
          </p>
          <Link
            href="/datos-metodologia/"
            className="mt-4 inline-block rounded-md bg-oep-slate px-4 py-2 text-[14px] font-semibold text-white transition-colors duration-nav hover:bg-slate-700"
          >
            Ver metodología
          </Link>
        </div>
        <div className="text-[14px] leading-6">
          <p className="oep-label text-slate-500">Fuentes</p>
          <p className="mt-3">
            Servicio de Evaluación Ambiental (SEA): Sistema de Evaluación de Impacto Ambiental,
            presentaciones 1993–2026-T2.
          </p>
          <p className="oep-source mt-4">Fuente: SEA. Cálculos OEP.</p>
        </div>
        <div className="text-[14px] leading-6">
          <p className="oep-label text-slate-500">Independencia</p>
          <p className="mt-3">
            OEP es un spin-off universitario independiente: no recibe financiamiento de organismos
            evaluados ni de titulares de proyectos.
          </p>
          <p className="mt-4 font-mono text-[11px] text-slate-500">ACT. 30.06.2026</p>
        </div>
      </div>
    </footer>
  );
}
