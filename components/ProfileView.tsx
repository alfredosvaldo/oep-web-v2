'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import CountUp from '@/components/CountUp';
import type { BreakdownItem, Profile, ProjectRec } from '@/lib/profile';
import { fmtInt, fmtMM, fmtPct1 } from '@/lib/format';

const ProfileChart = dynamic(() => import('@/components/ProfileChart'), { ssr: false });

const TIPO_LABEL: Record<Profile['tipo'], string> = {
  region: 'Región',
  sector: 'Sector',
  titular: 'Titular',
};

function Kpi({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-5">
      <dt className="oep-label text-slate-500">{label}</dt>
      <dd className="mt-2 font-display text-[26px] font-semibold leading-8 tracking-tight tabular">{children}</dd>
    </div>
  );
}

function Breakdown({
  titulo,
  items,
  linkPrefix,
}: {
  titulo: string;
  items: BreakdownItem[];
  linkPrefix: string | null;
}) {
  const max = Math.max(...items.map((i) => i.inversion_mmu), 1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <h3 className="oep-label border-b border-slate-200 px-5 py-4 text-slate-500">{titulo}</h3>
      <ul className="divide-y divide-slate-100">
        {items.slice(0, 10).map((it) => (
          <li key={it.slug} className="px-5 py-3">
            {linkPrefix ? (
              <Link href={`/perfiles/${linkPrefix}${it.slug}/`} className="block hover:underline">
                <BreakdownRow it={it} max={max} />
              </Link>
            ) : (
              <BreakdownRow it={it} max={max} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BreakdownRow({ it, max }: { it: BreakdownItem; max: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[13px] font-medium">{it.nombre}</span>
        <span className="font-mono text-[12px] tabular text-slate-500">US$ {fmtMM(it.inversion_mmu)} MM</span>
      </div>
      <div className="mt-1 flex items-center gap-3">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <span
            className="block h-full rounded-full bg-oep-emerald"
            style={{ width: `${Math.max((it.inversion_mmu / max) * 100, 1.5)}%` }}
          />
        </span>
        <span className="w-14 text-right font-mono text-[11px] tabular text-slate-400">
          {fmtInt(it.proyectos)} exp.
        </span>
      </div>
    </div>
  );
}

function ProjectRows({ items, cap }: { items: ProjectRec[]; cap: number }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.slice(0, cap).map((p) => (
        <li key={p.id}>
          <a
            href={p.lk ?? '#'}
            target={p.lk ? '_blank' : undefined}
            rel="noopener"
            className="group flex items-baseline justify-between gap-4 px-5 py-3 transition-colors hover:bg-slate-50"
          >
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium group-hover:underline">{p.n}</span>
              <span className="mt-0.5 block font-mono text-[11px] text-slate-400">
                {p.fp.slice(0, 4)}-{p.t} · {p.e}
                {p.lk ? ' · ficha SEA ↗' : ''}
              </span>
            </span>
            <span className="shrink-0 font-mono text-[12px] tabular text-slate-500">US$ {fmtMM(p.m)} MM</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ProfileView({ p }: { p: Profile }) {
  const breakdown = p.por_sector ?? p.por_region ?? null;
  const breakdownTitle = p.por_sector ? 'Sectores del perfil' : 'Regiones del perfil';
  const breakdownLink = p.por_sector ? '/perfiles/sector-' : p.por_region ? '/perfiles/region-' : null;
  const projects = p.ultimos_proyectos ?? p.proyectos ?? [];
  const maxEg = Math.max(...(p.por_estado ?? []).map((e) => e.inversion_mmu), 1);

  return (
    <main className="min-h-screen pt-16">
      <div className="mx-auto max-w-content px-6 py-12 lg:px-10">
        <nav aria-label="Miga de pan" className="font-mono text-[12px] text-slate-500">
          <Link href="/perfiles/" className="hover:underline">
            Perfiles
          </Link>
          {' / '}
          {TIPO_LABEL[p.tipo]}
        </nav>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h1 className="oep-headline text-[36px] leading-10 tracking-tight">{p.nombre}</h1>
          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">
            {TIPO_LABEL[p.tipo]}
            {p.rank != null ? ` · N° ${p.rank} por inversión` : ''}
          </span>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 lg:grid-cols-4">
          <Kpi label="Proyectos">
            <CountUp value={p.kpi.proyectos} format={fmtInt} />
          </Kpi>
          <Kpi label="Inversión declarada">
            <CountUp value={p.kpi.inversion_mmu} format={(n) => `US$ ${fmtMM(n)}`} />
            <span className="ml-1 text-[13px] font-medium text-slate-500">MM</span>
          </Kpi>
          <Kpi label="Aprobados">
            <CountUp value={p.kpi.aprobados_n} format={fmtInt} />
            <span className="ml-2 text-[14px] font-medium text-slate-500">
              {p.kpi.tasa_aprobacion != null ? fmtPct1(p.kpi.tasa_aprobacion) : '—'}
            </span>
          </Kpi>
          <Kpi label="En evaluación">
            <CountUp value={p.kpi.evaluacion_mmu} format={(n) => `US$ ${fmtMM(n)}`} />
            <span className="ml-1 text-[13px] font-medium text-slate-500">MM</span>
          </Kpi>
        </dl>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <div className="rounded-lg border border-slate-200 bg-white">
              <h3 className="oep-label border-b border-slate-200 px-5 py-4 text-slate-500">Serie anual</h3>
              <div className="p-4">
                <ProfileChart serie={p.serie_anual} />
              </div>
            </div>

            {breakdown && <Breakdown titulo={breakdownTitle} items={breakdown} linkPrefix={breakdownLink} />}

            {p.por_estado && (
              <div className="rounded-lg border border-slate-200 bg-white">
                <h3 className="oep-label border-b border-slate-200 px-5 py-4 text-slate-500">Por estado</h3>
                <ul className="divide-y divide-slate-100">
                  {p.por_estado.map((e) => (
                    <li key={e.estado_grupo} className="px-5 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13px] font-medium">{e.estado_grupo}</span>
                        <span className="font-mono text-[12px] tabular text-slate-500">
                          {fmtInt(e.proyectos)} · US$ {fmtMM(e.inversion_mmu)} MM
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            e.estado_grupo === 'Aprobado'
                              ? 'bg-oep-emerald'
                              : e.estado_grupo === 'En evaluación'
                                ? 'bg-oep-copper'
                                : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.max((e.inversion_mmu / maxEg) * 100, 1.5)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-8">
            {p.top_titulares && (
              <Breakdown titulo="Principales titulares" items={p.top_titulares} linkPrefix={null} />
            )}

            <div className="rounded-lg border border-slate-200 bg-white">
              <h3 className="oep-label border-b border-slate-200 px-5 py-4 text-slate-500">
                {p.ultimos_proyectos ? 'Últimos proyectos' : 'Proyectos'}
              </h3>
              <ProjectRows items={projects} cap={p.ultimos_proyectos ? 12 : 30} />
              {!p.ultimos_proyectos && projects.length > 30 && (
                <p className="border-t border-slate-200 bg-slate-50 px-5 py-3 font-mono text-[12px] text-slate-500">
                  Mostrando 30 de {fmtInt(projects.length)} expedientes.
                </p>
              )}
            </div>
          </aside>
        </div>

        <p className="oep-source mt-8 border-t border-slate-200 pt-3">
          Fuente: SEA. Cálculos OEP.{' '}
          <Link href="/rankings/" className="hover:underline">
            Ver en rankings →
          </Link>
        </p>
      </div>
    </main>
  );
}
