'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { EChartsCoreOption } from 'echarts/core';
import type { SerieAnual } from '@/lib/profile';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

/** Serie anual compacta de un perfil: barras = proyectos, línea = inversión. */
export default function ProfileChart({ serie }: { serie: SerieAnual[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);

    const bar: BarSeriesOption = {
      type: 'bar',
      name: 'Proyectos',
      data: serie.map((d) => d.proyectos),
      itemStyle: { color: '#CBD5E1', borderRadius: [2, 2, 0, 0] },
      emphasis: { itemStyle: { color: '#10B981' } },
      yAxisIndex: 0,
      barMaxWidth: 14,
    };
    const line: LineSeriesOption = {
      type: 'line',
      name: 'Inversión US$ MM',
      data: serie.map((d) => d.inversion_mmu),
      itemStyle: { color: '#F59E0B' },
      lineStyle: { width: 2 },
      symbol: 'none',
      yAxisIndex: 1,
    };

    const option: EChartsCoreOption = {
      animationDuration: 400,
      grid: { left: 44, right: 56, top: 24, bottom: 28 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0F172A',
        borderWidth: 0,
        textStyle: { color: '#F8FAFC', fontSize: 12, fontFamily: 'Inter, sans-serif' },
        valueFormatter: (v: number) => new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(v),
      },
      xAxis: {
        type: 'category',
        data: serie.map((d) => String(d.anio)),
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748B', fontSize: 10, fontFamily: "'Roboto Mono', monospace", interval: 4 },
      },
      yAxis: [
        {
          type: 'value',
          splitLine: { lineStyle: { color: '#F1F5F9' } },
          axisLabel: { color: '#64748B', fontSize: 10, fontFamily: "'Roboto Mono', monospace" },
        },
        {
          type: 'value',
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
  }, [serie]);

  return (
    <div className="h-[240px] w-full" ref={ref} role="img" aria-label="Serie anual del perfil" />
  );
}
