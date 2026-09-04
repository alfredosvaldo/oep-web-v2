'use client';

import CountUp from './CountUp';

interface KpiCardProps {
  label: string;
  value: number;
  format: (n: number) => string;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  definition: string;
  footer: string;
  dark?: boolean;
}

/**
 * KPI card §4: etiqueta small-caps → cifra Space Grotesk + unidad explícita →
 * delta vs período previo → definición de una línea → pie técnico Roboto Mono.
 */
export default function KpiCard({
  label,
  value,
  format,
  unit,
  delta,
  deltaLabel,
  definition,
  footer,
  dark = false,
}: KpiCardProps) {
  const text = dark ? 'text-white' : 'text-oep-slate';
  const muted = dark ? 'text-slate-300' : 'text-slate-500';
  const border = dark ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className={`rounded-lg border ${border} ${dark ? 'bg-white/[0.04]' : 'bg-white'} p-5`}>
      <p className={`oep-label ${muted}`}>{label}</p>
      <p className={`mt-2 font-display text-[36px] font-semibold leading-10 tracking-tight ${text}`}>
        <CountUp value={value} format={format} />
        {unit && <span className={`ml-1.5 text-[16px] font-medium ${muted}`}>{unit}</span>}
      </p>
      {delta !== undefined && (
        <p
          className={`mt-1.5 text-[13px] font-medium tabular ${
            delta > 0 ? 'text-oep-emerald' : delta < 0 ? 'text-oep-copper-dark' : muted
          }`}
          aria-label={`${deltaLabel ?? 'Variación'}: ${delta > 0 ? 'aumento' : delta < 0 ? 'disminución' : 'sin cambio'}`}
        >
          {delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : ''}
          {format(Math.abs(delta))}
          <span className={`font-normal ${muted}`}> {deltaLabel}</span>
        </p>
      )}
      <p className={`mt-3 text-[13px] leading-5 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{definition}</p>
      <p className={`mt-3 border-t ${border} pt-2.5 font-mono text-[11px] ${muted}`}>{footer}</p>
    </div>
  );
}
