import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BLOQUES: { titulo: string; cuerpo: React.ReactNode }[] = [
  {
    titulo: 'Fuente y cobertura',
    cuerpo: (
      <>
        La base es el registro público de presentaciones del Sistema de Evaluación de Impacto
        Ambiental (SEIA), administrado por el Servicio de Evaluación Ambiental (SEA):{' '}
        <strong>30.119 expedientes presentados entre 1993 y 2026-T2</strong>, con una inversión
        declarada de US$ 1.046.130 MM. Cada expediente corresponde a un proyecto con su titular,
        región, sector productivo, tipología de evaluación, estado de tramitación y, cuando aplica,
        fecha y resultado de la calificación ambiental (RCA).
      </>
    ),
  },
  {
    titulo: 'Reglas de limpieza',
    cuerpo: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Regiones:</strong> los nombres históricos se normalizan a las 16 regiones actuales
          (p. ej. «Metropolitana de Santiago» → «Metropolitana»); los expedientes de competencia
          nacional se agrupan en «Interregional / Nacional».
        </li>
        <li>
          <strong>Coordenadas:</strong> se descartan valores corruptos (p. ej. proyecciones en metros
          que exceden grados decimales): 30.117 de 30.119 expedientes conservan coordenadas válidas.
        </li>
        <li>
          <strong>Titulares:</strong> las variantes de escritura de una misma razón social se unifican
          por clave normalizada (10.512 titulares canónicos); los nombres en mayúsculas se convierten
          a formato título preservando siglas y formas legales (S.A., SpA, Ltda.).
        </li>
        <li>
          <strong>Estados:</strong> los 11 estados del SEIA se agrupan en 5 categorías analíticas:
          Aprobado · En evaluación (en calificación y admisión) · Rechazado · Desistido-Caducado ·
          No calificado-No admitido.
        </li>
        <li>
          <strong>Días de tramitación:</strong> diferencia entre presentación y calificación, solo
          para expedientes con fecha de calificación. El KPI de «cartera en evaluación» sigue la cifra
          oficial SEA: estado «En Calificación» (365 proyectos / US$ 88.383 MM).
        </li>
      </ul>
    ),
  },
  {
    titulo: 'Validación',
    cuerpo: (
      <>
        El pipeline (<code className="font-mono text-[13px]">scripts/build-data.mjs</code>) aborta si
        cualquiera de los 14 hechos semilla se aleja de lo observado: conteo de filas (30.119),
        inversión total (US$ 1.046.130 MM), aprobados (18.625 con RCA favorable; tasa 93,6 %),
        cartera en evaluación (365 / US$ 88.383 MM), sector líder por inversión (Energía,
        US$ 455.637 MM), líder por n° de proyectos (Saneamiento Ambiental, 5.766), años pico
        (2006: 1.676; 2008: 1.662) y Antofagasta (US$ 276.478 MM). Los datos publicados en{' '}
        <code className="font-mono text-[13px]">public/data/</code> son exactamente los que sirve
        este sitio.
      </>
    ),
  },
  {
    titulo: 'Qué sí y qué no mide OEP',
    cuerpo: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Sí:</strong> actividad declarada ante el SEIA — presentaciones, inversión
          declarada, tasas y tiempos de calificación, concentración territorial y sectorial.
        </li>
        <li>
          <strong>No:</strong> inversión efectivamente ejecutada, permisos sectoriales fuera del SEIA
          ni proyectos exentos de evaluación ambiental. La inversión es la declarada por los
          titulares al momento de presentar, no necesariamente la ejecutada.
        </li>
        <li>
          El conteo de expedientes no equivale a conteo de obras: un proyecto puede presentar más de
          un expediente.
        </li>
      </ul>
    ),
  },
  {
    titulo: 'Reproducibilidad',
    cuerpo: (
      <>
        Todo el proceso es abierto: el código del pipeline y las reglas de limpieza están en el
        repositorio, junto con los JSON derivados y el script que genera el video ambiental del hero.
        Con el archivo fuente del SEIA, <code className="font-mono text-[13px]">npm run build:data</code>{' '}
        regenera los 550 archivos de datos en segundos. Geografía de referencia: Natural Earth
        (dominio público).
      </>
    ),
  },
];

export default function DatosMetodologia() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
          <p className="oep-label text-slate-500">Transparencia</p>
          <h1 className="oep-headline mt-3 text-[36px] leading-10 tracking-tight">
            Datos y metodología
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-slate-600">
            Cada cifra de este observatorio es reproducible a partir de los expedientes públicos del
            SEIA. Estas son las reglas exactas con las que se construyen.
          </p>

          <div className="mt-10 space-y-10">
            {BLOQUES.map((b, i) => (
              <section key={b.titulo}>
                <h2 className="flex items-baseline gap-3 border-b border-slate-200 pb-3">
                  <span className="font-mono text-[13px] text-oep-copper-dark">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="oep-headline text-[20px] leading-6">{b.titulo}</span>
                </h2>
                <div className="mt-4 text-[15px] leading-7 text-slate-700">{b.cuerpo}</div>
              </section>
            ))}
          </div>

          <p className="oep-source mt-12 border-t border-slate-200 pt-4">
            Fuente: SEA, Sistema de Evaluación de Impacto Ambiental, presentaciones 1993–2026-T2.
            Cálculos OEP. Última actualización: 30.06.2026.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
