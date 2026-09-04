'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchAgg, type AggItem } from '@/lib/kpis';
import { fmtInt, fmtMM, fmtPct1 } from '@/lib/format';

type Dim = 'region' | 'sector' | 'titular' | 'tipologia' | 'estado';

const DIMS: { id: Dim; label: string; blurb: string }[] = [
  { id: 'region', label: 'Región', blurb: 'Dónde se presenta la inversión' },
  { id: 'sector', label: 'Sector', blurb: 'En qué se invierte' },
  { id: 'titular', label: 'Titular', blurb: 'Quién presenta los proyectos' },
  { id: 'tipologia', label: 'Tipología', blurb: 'Qué tipo de evaluación' },
  { id: 'estado', label: 'Estado', blurb: 'En qué quedó cada expediente' },
];

const MAX_ROWS = 150;

type SortKey = 'nombre' | 'proyectos' | 'inversion_mmu' | 'aprobados_n' | 'tasa_aprobacion' | 'mediana_dias';

const HEADERS: { key: SortKey; label: string; align: 'left' | 'right'; numeric: boolean }[] = [
  { key: 'nombre', label: 'Nombre', align: 'left', numeric: false },
  { key: 'proyectos', label: 'Proyectos', align: 'right', numeric: true },
  { key: 'inversion_mmu', label: 'Inversión US$ MM', align: 'right', numeric: true },
  { key: 'aprobados_n', label: 'Aprobados', align: 'right', numeric: true },
  { key: 'tasa_aprobacion', label: 'Tasa apr.', align: 'right', numeric: true },
  { key: 'mediana_dias', label: 'Mediana días', align: 'right', numeric: true },
];

function cellValue(it: AggItem, key: SortKey): string | number | null {
  return it[key];
}

export default function Rankings() {
  const [dim, setDim] = useState<Dim>('region');
  const [items, setItems] = useState<AggItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'inversion_mmu', dir: -1 });
  const [query, setQuery] = useState('');

  useEffect(() => {
    setItems(null);
    setQuery('');
    fetchAgg(dim)
      .then((d) => setItems(d.items))
      .catch((e) => setError(String(e)));
  }, [dim]);

  const rows = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    let list = q
      ? items.filter((it) => it.nombre.toLowerCase().includes(q))
      : [...items];
    list.sort((a, b) => {
      const va = cellValue(a, sort.key);
      const vb = cellValue(b, sort.key);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'es');
      return cmp * sort.dir;
    });
    return list;
  }, [items, sort, query]);

  const maxMmu = useMemo(() => Math.max(...rows.slice(0, MAX_ROWS).map((r) => r.inversion_mmu), 1), [rows]);
  const visible = rows.slice(0, MAX_ROWS);
  const dimMeta = DIMS.find((d) => d.id === dim)!;

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'nombre' ? 1 : -1 }));

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <div className="mx-auto max-w-content px-6 py-12 lg:px-10">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <h1 className="oep-headline text-[32px] leading-9">Rankings</h1>
            <p className="font-mono text-[12px] text-slate-500">1993–2026-T2 · ordena cualquier columna</p>
          </div>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-500">
            Los mismos datos del mapa, tabulados: {DIMS.map((d) => d.blurb).join(' · ').toLowerCase()}.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {DIMS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDim(d.id)}
                aria-pressed={dim === d.id}
                className={`rounded-md px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-nav ${
                  dim === d.id ? 'bg-oep-slate text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
            <span className="ml-auto hidden font-mono text-[12px] text-slate-500 md:inline">
              {items ? `${fmtInt(items.length)} ${dimMeta.label.toLowerCase()}s` : 'cargando…'}
            </span>
          </div>

          {dim === 'titular' && (
            <div className="mt-4">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar titulares… (p. ej. Codelco, Enel)"
                className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[14px] placeholder:text-slate-400 focus:border-oep-emerald focus:outline-none"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="mt-8 rounded-lg border border-oep-copper bg-slate-50 p-4 text-[14px]">
              No se pudieron cargar los datos: {error}
            </p>
          )}

          {items ? (
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-[14px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="w-12 px-4 py-3 font-mono text-[11px] font-medium text-slate-400">#</th>
                      {HEADERS.map((h) => (
                        <th
                          key={h.key}
                          className={`px-4 py-3 ${h.align === 'right' ? 'text-right' : 'text-left'}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSort(h.key)}
                            className={`oep-label inline-flex items-center gap-1 text-slate-500 hover:text-oep-slate ${
                              sort.key === h.key ? 'text-oep-slate' : ''
                            }`}
                          >
                            {h.label}
                            <span className="text-[9px]">
                              {sort.key === h.key ? (sort.dir === 1 ? '▲' : '▼') : '△'}
                            </span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visible.map((it, i) => (
                      <tr key={it.slug} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-[12px] tabular text-slate-400">{i + 1}</td>
                        <td className="max-w-[340px] truncate px-4 py-3 font-medium">{it.nombre}</td>
                        <td className="px-4 py-3 text-right tabular">{fmtInt(it.proyectos)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 lg:block">
                              <span
                                className="block h-full rounded-full bg-oep-copper"
                                style={{ width: `${Math.max((it.inversion_mmu / maxMmu) * 100, 1.5)}%` }}
                              />
                            </span>
                            <span className="tabular">{fmtMM(it.inversion_mmu)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular">{fmtInt(it.aprobados_n)}</td>
                        <td className="px-4 py-3 text-right tabular">
                          {it.tasa_aprobacion != null ? fmtPct1(it.tasa_aprobacion) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right tabular">
                          {it.mediana_dias != null ? fmtInt(it.mediana_dias) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > MAX_ROWS && (
                <p className="border-t border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[12px] text-slate-500">
                  Mostrando {MAX_ROWS} de {fmtInt(rows.length)} — {dim === 'titular' ? 'usa el filtro para acotar' : 'ordena para explorar el resto'}.
                </p>
              )}
            </div>
          ) : (
            !error && (
              <div className="mt-6 flex h-64 animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                <p className="font-mono text-[12px] text-slate-500">Cargando ranking…</p>
              </div>
            )
          )}

          <p className="oep-source mt-4 border-t border-slate-200 pt-3">
            Fuente: SEA. Cálculos OEP. Tasa de aprobación = RCA favorable / calificados con RCA. Mediana de días
            presentación → calificación, por dimensión.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
