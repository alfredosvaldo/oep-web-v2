'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchSearchIndex, SEA_FICHA, type SearchIndex, type SearchRec } from '@/lib/search';
import { fmtInt, fmtMM } from '@/lib/format';

const PAGE_SIZE = 25;
type SortKey = 'm' | 'fp' | 'n';

const EG_LIST = ['Aprobado', 'En evaluación', 'Rechazado', 'Desistido-Caducado', 'No calificado-No admitido'];

export default function Explorador() {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [estado, setEstado] = useState('');
  const [anio, setAnio] = useState('');
  const [sort, setSort] = useState<SortKey>('m');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchSearchIndex()
      .then(setIndex)
      .catch((e) => setError(String(e)));
  }, []);

  const regiones = useMemo(
    () => (index ? Array.from(new Set(index.proyectos.map((p) => p.rg))).sort((a, b) => a.localeCompare(b, 'es')) : []),
    [index],
  );

  const filtered = useMemo(() => {
    if (!index) return [];
    const q = query.trim().toLowerCase();
    const list = index.proyectos.filter((p) => {
      if (region && p.rg !== region) return false;
      if (estado && p.eg !== estado) return false;
      if (anio && !p.fp.startsWith(anio)) return false;
      if (q && !p.n.toLowerCase().includes(q) && !p.ti.toLowerCase().includes(q)) return false;
      return true;
    });
    list.sort((a, b) => (sort === 'm' ? b.m - a.m : sort === 'fp' ? (a.fp < b.fp ? 1 : -1) : a.n.localeCompare(b.n, 'es')));
    return list;
  }, [index, query, region, estado, anio, sort]);

  useEffect(() => setPage(0), [query, region, estado, anio, sort]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const select =
    'rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 focus:border-oep-emerald focus:outline-none';

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <div className="mx-auto max-w-content px-6 py-12 lg:px-10">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <h1 className="oep-headline text-[32px] leading-9">Explorador</h1>
            <p className="font-mono text-[12px] text-slate-500">
              {index ? `${fmtInt(filtered.length)} de ${fmtInt(index.total)} expedientes` : 'cargando…'}
            </p>
          </div>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-500">
            Todos los proyectos del SEIA en una tabla filtrable. El índice se descarga una sola vez y
            el filtrado es instantáneo.
          </p>

          {error && (
            <p role="alert" className="mt-8 rounded-lg border border-oep-copper bg-slate-50 p-4 text-[14px]">
              No se pudieron cargar los datos: {error}
            </p>
          )}

          {index && (
            <>
              <div className="mt-8 flex flex-wrap gap-2">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o titular…"
                  className={`${select} min-w-[220px] flex-1`}
                />
                <select value={region} onChange={(e) => setRegion(e.target.value)} className={select} aria-label="Región">
                  <option value="">Todas las regiones</option>
                  {regiones.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <select value={estado} onChange={(e) => setEstado(e.target.value)} className={select} aria-label="Estado">
                  <option value="">Todos los estados</option>
                  {EG_LIST.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
                <select value={anio} onChange={(e) => setAnio(e.target.value)} className={select} aria-label="Año">
                  <option value="">Todos los años</option>
                  {Array.from({ length: 2026 - 1993 + 1 }, (_, i) => 2026 - i).map((a) => (
                    <option key={a} value={String(a)}>{a}</option>
                  ))}
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className={select}
                  aria-label="Orden"
                >
                  <option value="m">Mayor inversión</option>
                  <option value="fp">Más reciente</option>
                  <option value="n">Nombre A–Z</option>
                </select>
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] border-collapse text-[14px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left">
                        {['Proyecto', 'Titular', 'Región', 'Presentado', 'Estado', 'Inversión'].map((h, i) => (
                          <th key={h} className={`oep-label px-4 py-3 text-slate-500 ${i >= 3 ? 'text-right' : ''} ${i === 5 ? 'text-right' : ''}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((p: SearchRec) => (
                        <tr key={`${p.sea ?? 'x'}-${p.fp}-${p.n}`} className="transition-colors hover:bg-slate-50">
                          <td className="max-w-[300px] truncate px-4 py-3 font-medium">
                            {p.sea != null ? (
                              <a href={SEA_FICHA(p.sea)} target="_blank" rel="noopener" className="hover:underline">
                                {p.n} <span className="text-slate-400">↗</span>
                              </a>
                            ) : (
                              p.n
                            )}
                          </td>
                          <td className="max-w-[220px] truncate px-4 py-3 text-[13px] text-slate-600">{p.ti}</td>
                          <td className="px-4 py-3 text-[13px] text-slate-600">{p.rg}</td>
                          <td className="px-4 py-3 text-right font-mono text-[12px] tabular text-slate-500">{p.fp}</td>
                          <td className="px-4 py-3 text-right text-[13px]">{p.eg}</td>
                          <td className="px-4 py-3 text-right font-mono text-[13px] tabular">
                            US$ {fmtMM(p.m)} MM
                          </td>
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-slate-500">
                            Sin resultados con estos filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="font-mono text-[12px] text-slate-500">
                  página {page + 1} de {fmtInt(Math.max(pages, 1))}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-md border border-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    disabled={page >= pages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-md border border-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </>
          )}

          <p className="oep-source mt-6 border-t border-slate-200 pt-3">
            Fuente: SEA. Cálculos OEP. El enlace ↗ abre la ficha oficial del expediente.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
