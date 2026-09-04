'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchAgg, type AggItem } from '@/lib/kpis';
import { EG_LABEL, fetchChileOutline, fetchGeoPoints, VISTA_BBOX, type ChileOutline, type GeoPoints } from '@/lib/geo';
import { fmtInt, fmtMM } from '@/lib/format';

// echarts pesa ~180 kB: se descarga solo cuando la sección entra al viewport.
const ChileMap = dynamic(() => import('@/components/ChileMap'), { ssr: false });

const EG_DOT: Record<number, string> = {
  0: '#10B981',
  1: '#F59E0B',
  2: '#B45309',
  3: '#64748B',
  4: '#CBD5E1',
};

const enVista = (lon: number, lat: number) =>
  lon >= VISTA_BBOX.lon[0] && lon <= VISTA_BBOX.lon[1] && lat >= VISTA_BBOX.lat[0] && lat <= VISTA_BBOX.lat[1];

function Skeleton() {
  return (
    <div className="flex h-[420px] animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-slate-50 lg:h-[560px]">
      <p className="font-mono text-[12px] text-slate-500">Cargando mapa…</p>
    </div>
  );
}

export default function MapSection({ carteraMmu, carteraN }: { carteraMmu: number; carteraN: number }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [geo, setGeo] = useState<GeoPoints | null>(null);
  const [outline, setOutline] = useState<ChileOutline | null>(null);
  const [regiones, setRegiones] = useState<AggItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    Promise.all([fetchGeoPoints(), fetchChileOutline(), fetchAgg('region')])
      .then(([g, o, r]) => {
        setGeo(g);
        setOutline(o);
        setRegiones(r.items.filter((i) => i.slug !== 'interregional-nacional').slice(0, 6));
      })
      .catch((e) => setError(String(e)));
  }, [visible]);

  const { vista, counts, excluidos } = useMemo(() => {
    if (!geo) return { vista: [], counts: {} as Record<number, number>, excluidos: 0 };
    const vista = geo.points
      .map((p, idx) => ({ p, idx }))
      .filter((v) => enVista(v.p[0], v.p[1]));
    const counts = {} as Record<number, number>;
    for (const v of vista) counts[v.p[3]] = (counts[v.p[3]] || 0) + 1;
    return { vista, counts, excluidos: geo.points.length - vista.length };
  }, [geo]);

  const maxCartera = Math.max(...regiones.map((r) => r.evaluacion_mmu), 1);

  return (
    <section ref={ref} id="mapa" aria-label="Mapa de proyectos" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-content px-6 py-12 lg:px-10 lg:py-16">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <h2 className="oep-headline text-[24px] leading-7">US$ {fmtMM(carteraMmu)} siguen en evaluación</h2>
          <p className="font-mono text-[12px] text-slate-500">
            {fmtInt(carteraN)} proyectos en calificación · cada punto es un expediente SEIA
          </p>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-500">
          Tamaño del punto = inversión declarada. El cobre destaca lo que aún no tiene RCA: la
          cartera viva del sistema.
        </p>

        {error && (
          <p role="alert" className="mt-8 rounded-lg border border-oep-copper bg-slate-50 p-4 text-[14px]">
            No se pudieron cargar los datos: {error}
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {!geo || !outline ? (
              visible && !error ? (
                <Skeleton />
              ) : (
                <div aria-hidden="true" className="hidden h-[560px] rounded-lg border border-slate-200 bg-slate-50 lg:block" />
              )
            ) : (
              <div className="h-[420px] rounded-lg border border-slate-200 lg:h-[560px]">
                <ChileMap geo={geo} vista={vista} outline={outline} />
              </div>
            )}
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {[0, 1, 2, 3, 4].map((eg) => (
                <li key={eg} className="flex items-center gap-2 text-[12px] text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: EG_DOT[eg] }} />
                  {EG_LABEL[eg]}
                  <span className="font-mono tabular">{counts[eg] ? fmtInt(counts[eg]) : '—'}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside aria-label="Cartera en evaluación por región">
            <h3 className="oep-label text-slate-500">Dónde está la cartera</h3>
            <p className="mt-1 font-mono text-[11px] text-slate-500">Inversión en evaluación · US$ MM</p>
            <ul className="mt-4 space-y-3">
              {regiones.map((r) => (
                <li key={r.slug}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[13px] font-medium">{r.nombre}</span>
                    <span className="font-mono text-[12px] tabular text-slate-500">{fmtMM(r.evaluacion_mmu)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-oep-copper"
                      style={{ width: `${Math.max((r.evaluacion_mmu / maxCartera) * 100, 1.5)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="oep-source mt-6 border-t border-slate-200 pt-3">
              Fuente: SEA. Cálculos OEP. Geografía: Natural Earth, vista continental
              {excluidos > 0 ? ` (${fmtInt(excluidos)} proyectos insulares fuera de vista)` : ''}.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
