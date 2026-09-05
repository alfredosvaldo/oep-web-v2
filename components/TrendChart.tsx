'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { EChartsCoreOption } from 'echarts/core';
import type { Quarter, Year } from '@/lib/series';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

type Modo = 'anual' | 'trimestral';

export default function TrendChart({ anual, trimestral }: { anual: Year[]; trimestral: Quarter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<Modo>('anual');

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);

    const cats = modo === 'anual' ? anual.map((d) => String(d.anio)) : trimestral.map((d) => d.periodo);
    const proyectos = modo === 'anual' ? anual.map((d) => d.proyectos) : trimestral.map((d) => d.proyectos);
    const inversion = modo === 'anual' ? anual.map((d) => d.inversion_mmu) : trimestral.map((d) => d.inversion_mmu);

    const bar: BarSeriesOption = {
      type: 'bar',
      name: 'Proyectos presentados',
      data: proyectos,
      itemStyle: { color: 'rgba(194,112,61,0.30)', borderRadius: [2, 2, 0, 0] },
      emphasis: { itemStyle: { color: '#C2703D' } },
      yAxisIndex: 0,
      barMaxWidth: 22,
    };
    const line: LineSeriesOption = {
      type: 'line',
      name: 'Inversión declarada (US$ MM)',
      data: inversion,
      itemStyle: { color: '#0E9F6E' },
      lineStyle: { width: 2 },
      symbol: 'none',
      yAxisIndex: 1,
    };

    const option: EChartsCoreOption = {
      animationDuration: 400,
      grid: { left: 48, right: 64, top: 32, bottom: modo === 'trimestral' ? 44 : 32 },
      legend: { show: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#10141A',
        borderWidth: 0,
        padding: [10, 12],
        textStyle: { color: '#F8FAFC', fontSize: 12, fontFamily: 'Inter, sans-serif' },
        valueFormatter: (v: number) => new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(v),
      },
      xAxis: {
        type: 'category',
        data: cats,
        axisLine: { lineStyle: { color: 'rgba(20,23,28,0.20)' } },
        axisTick: { show: false },
        axisLabel: {
          color: 'rgba(20,23,28,0.55)',
          fontSize: 11,
          fontFamily: "'IBM Plex Mono', monospace",
          interval: modo === 'trimestral' ? 11 : 3,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'proyectos',
          nameTextStyle: {
            color: 'rgba(20,23,28,0.45)',
            fontSize: 10,
            fontFamily: "'IBM Plex Mono', monospace",
          },
          splitLine: { lineStyle: { color: 'rgba(20,23,28,0.08)' } },
          axisLabel: {
            color: 'rgba(20,23,28,0.55)',
            fontSize: 10,
            fontFamily: "'IBM Plex Mono', monospace",
          },
        },
        {
          type: 'value',
          name: 'US$ MM',
          nameTextStyle: {
            color: 'rgba(20,23,28,0.45)',
            fontSize: 10,
            fontFamily: "'IBM Plex Mono', monospace",
          },
          splitLine: { show: false },
          axisLabel: {
            color: 'rgba(20,23,28,0.55)',
            fontSize: 10,
            fontFamily: "'IBM Plex Mono', monospace",
          },
        },
      ],
      series: [bar, line],
    };
    chart.setOption(option);

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.dispose();
    };
  }, [modo, anual, trimestral]);

  return (
    <div>
      <div className="flex h-[380px] w-full rounded-[10px] border border-oep-line bg-white lg:h-[420px]">
        <div ref={ref} className="h-full w-full" role="img" aria-label="Gráfico de proyectos e inversión declarada por período" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-[10px] border border-oep-line p-0.5" role="group" aria-label="Frecuencia de la serie">
          {(['anual', 'trimestral'] as Modo[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              aria-pressed={modo === m}
              className={`rounded-[8px] px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-nav ${
                modo === m ? 'bg-oep-ink text-oep-paper' : 'text-oep-ink/55 hover:text-oep-ink'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <span className="ml-auto hidden items-center gap-4 text-[12px] text-oep-ink/60 sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-oep-copper/40" /> proyectos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-oep-emerald" /> inversión US$ MM
          </span>
        </span>
      </div>
    </div>
  );
}
