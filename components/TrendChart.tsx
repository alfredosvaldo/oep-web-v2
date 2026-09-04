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
      itemStyle: { color: '#CBD5E1', borderRadius: [2, 2, 0, 0] },
      emphasis: { itemStyle: { color: '#10B981' } },
      yAxisIndex: 0,
      barMaxWidth: 22,
    };
    const line: LineSeriesOption = {
      type: 'line',
      name: 'Inversión declarada (US$ MM)',
      data: inversion,
      itemStyle: { color: '#F59E0B' },
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
        backgroundColor: '#0F172A',
        borderWidth: 0,
        textStyle: { color: '#F8FAFC', fontSize: 12, fontFamily: 'Inter, sans-serif' },
        valueFormatter: (v: number) => new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(v),
      },
      xAxis: {
        type: 'category',
        data: cats,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748B', fontSize: 11, fontFamily: "'Roboto Mono', monospace", interval: modo === 'trimestral' ? 11 : 3 },
      },
      yAxis: [
        {
          type: 'value',
          name: 'proyectos',
          nameTextStyle: { color: '#94A3B8', fontSize: 10, fontFamily: "'Roboto Mono', monospace" },
          splitLine: { lineStyle: { color: '#F1F5F9' } },
          axisLabel: { color: '#64748B', fontSize: 10, fontFamily: "'Roboto Mono', monospace" },
        },
        {
          type: 'value',
          name: 'US$ MM',
          nameTextStyle: { color: '#94A3B8', fontSize: 10, fontFamily: "'Roboto Mono', monospace" },
          splitLine: { show: false },
          axisLabel: { color: '#64748B', fontSize: 10, fontFamily: "'Roboto Mono', monospace" },
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
      <div className="flex h-[380px] w-full rounded-lg border border-slate-200 bg-white lg:h-[420px]">
        <div ref={ref} className="h-full w-full" role="img" aria-label="Gráfico de proyectos e inversión declarada por período" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        {(['anual', 'trimestral'] as Modo[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            aria-pressed={modo === m}
            className={`rounded-md px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors duration-nav ${
              modo === m ? 'bg-oep-slate text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {m}
          </button>
        ))}
        <span className="ml-auto hidden items-center gap-4 text-[12px] text-slate-500 sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> proyectos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-oep-copper" /> inversión US$ MM
          </span>
        </span>
      </div>
    </div>
  );
}
