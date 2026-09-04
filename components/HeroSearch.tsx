'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchSearchIndex, SEA_FICHA, type SearchIndex, type SearchRec } from '@/lib/search';
import { fmtMM } from '@/lib/format';

const MAX_RESULTS = 7;

interface Hit {
  rec: SearchRec;
  score: number;
}

function search(index: SearchIndex, q: string): Hit[] {
  const query = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hits: Hit[] = [];
  for (const rec of index.proyectos) {
    const nombre = rec.n.toLowerCase();
    const titular = rec.ti.toLowerCase();
    let score = -1;
    if (nombre.startsWith(query)) score = 3;
    else if (nombre.includes(query)) score = 2;
    else if (titular.includes(query)) score = 1;
    if (score < 0) continue;
    hits.push({ rec, score });
    if (hits.length > 400) break; // cap de seguridad; se re-ordena y recorta abajo
  }
  return hits.sort((a, b) => b.score - a.score || b.rec.m - a.rec.m).slice(0, MAX_RESULTS);
}

/**
 * Buscador del hero (estilo terminal de inteligencia): proyectos, titulares y
 * regiones de los 30.119 expedientes. El índice se carga al primer foco; el
 * resultado abre la ficha oficial en el SEA.
 */
export default function HeroSearch() {
  const [value, setValue] = useState('');
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const load = () => {
    if (index || loading) return;
    setLoading(true);
    fetchSearchIndex()
      .then(setIndex)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  const results = index && value.trim().length >= 2 ? search(index, value.trim()) : [];

  const go = (rec: SearchRec) => {
    setOpen(false);
    if (rec.sea != null) window.open(SEA_FICHA(rec.sea), '_blank', 'noopener');
  };

  return (
    <div ref={boxRef} className="relative mt-9 max-w-xl">
      <label htmlFor="oep-buscar" className="oep-label text-slate-300">
        Buscar en {index ? `${index.total.toLocaleString('es-CL')} ` : 'los '}expedientes
      </label>
      <div className="mt-2 flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 backdrop-blur-md transition-colors focus-within:border-oep-emerald">
        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-slate-300" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          id="oep-buscar"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onFocus={() => {
            load();
            setOpen(true);
          }}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results.length) go(results[0].rec);
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Proyecto, titular o región… (p. ej. Escondida, Enel, Antofagasta)"
          className="w-full bg-transparent py-3.5 text-[15px] text-white placeholder:text-slate-400 focus:outline-none"
        />
        {loading && <span className="font-mono text-[11px] text-slate-400">cargando…</span>}
      </div>

      {error && <p className="mt-2 text-[12px] text-oep-copper">No se pudo cargar el índice: {error}</p>}

      {open && value.trim().length >= 2 && index && (
        <ul className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white text-oep-slate shadow-2xl">
          {results.length === 0 && (
            <li className="px-4 py-3 text-[13px] text-slate-500">
              Sin resultados para «{value.trim()}»
            </li>
          )}
          {results.map(({ rec }, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => go(rec)}
                className="block w-full px-4 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <span className="block truncate text-[14px] font-medium">{rec.n}</span>
                <span className="mt-0.5 block font-mono text-[11px] text-slate-500">
                  {rec.ti} · {rec.rg} · US$ {fmtMM(rec.m)} MM
                  {rec.sea != null ? ' · ficha SEA ↗' : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
