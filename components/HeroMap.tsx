'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { ScatterChart } from 'echarts/charts';
import { GeoComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ScatterSeriesOption } from 'echarts/charts';
import type { EChartsCoreOption } from 'echarts/core';
import { EG_LABEL, fetchChileOutline, fetchGeoPoints, type ChileOutline, type GeoPoints } from '@/lib/geo';
import { fmtMM } from '@/lib/format';

echarts.use([ScatterChart, GeoComponent, TooltipComponent, CanvasRenderer]);

const EG_COLOR: Record<number, string> = {
  0: '#34D399', // Aprobado
  1: '#F59E0B', // En evaluación
  2: '#F97316', // Rechazado
  3: '#64748B', // Desistido-Caducado
  4: '#475569', // No calificado-No admitido
};
const EG_OPACITY: Record<number, number> = { 0: 0.5, 1: 0.95, 2: 0.55, 3: 0.3, 4: 0.3 };
const EG_ORDER = [0, 1, 3, 2, 4];

const symbolSize = (mmu: number) => Math.min(1.6 + Math.sqrt(Math.max(mmu, 0)) / 8, 14);
const LOOP_SECONDS = 16;
const HOLD_SECONDS = 1.6;
const FRAME_MS = 83; // ~12 fps: suficiente para la deriva sin saturar el canvas

type Row = { value: [number, number, number, number, number]; idx: number };

/**
 * Fondo vivo del hero: el mapa de puntos se construye año a año (1993 → hoy)
 * en bucle, con deriva de cámara suave. Al pasar el cursor se pausa y cada
 * punto es explorado (tooltip). Es el mismo dataset que la sección «mapa».
 */
export default function HeroMap({ onReady }: { onReady?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{ geo: GeoPoints; outline: ChileOutline } | null>(null);
  const [estado, setEstado] = useState<{ anio: number; playing: boolean; progreso: number }>({
    anio: 0,
    playing: true,
    progreso: 0,
  });

  useEffect(() => {
    let alive = true;
    Promise.all([fetchGeoPoints(), fetchChileOutline()])
      .then(([geo, outline]) => {
        if (!alive) return;
        setData({ geo, outline });
        onReady?.();
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [onReady]);

  useEffect(() => {
    if (!data || !ref.current) return;
    const { geo, outline } = data;
    const chart = echarts.init(ref.current);
    echarts.registerMap('Chile', outline as never);

    const anioIni = geo.anio_ini;
    const anioFin = Math.max(...geo.points.map((p) => p[4]));
    const span = anioFin - anioIni + 1;

    // Puntos agrupados por año de presentación (se suman al avanzar el cursor)
    const byYear = new Map<number, Row[]>();
    geo.points.forEach((p, idx) => {
      const row: Row = { value: p, idx };
      if (!byYear.has(p[4])) byYear.set(p[4], []);
      byYear.get(p[4])!.push(row);
    });

    const visible: Record<number, Row[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    let loadedYear = anioIni - 1;

    const series: ScatterSeriesOption[] = EG_ORDER.map((eg) => ({
      type: 'scatter',
      name: EG_LABEL[eg],
      coordinateSystem: 'geo',
      data: visible[eg],
      symbolSize: (val: number[]) => symbolSize(val[2]),
      itemStyle: { color: EG_COLOR[eg], opacity: EG_OPACITY[eg], borderWidth: 0 },
      emphasis: { scale: 1.8, itemStyle: { opacity: 1 } },
      progressive: 8000,
      animation: false,
    }));

    const option: EChartsCoreOption = {
      animation: false,
      tooltip: {
        show: false, // solo durante la pausa por hover
        trigger: 'item',
        backgroundColor: '#0F172A',
        borderWidth: 0,
        padding: [10, 12],
        textStyle: { color: '#F8FAFC', fontSize: 12, fontFamily: 'Inter, sans-serif' },
        formatter: (params: { data?: Row }) => {
          const d = params.data;
          if (!d) return '';
          const [, , mmu, eg, anio] = d.value;
          return [
            `<div style="max-width:260px;font-weight:600;line-height:1.35">${geo.nombres[d.idx]}</div>`,
            `<div style="margin-top:6px;font-family:'Roboto Mono',monospace;font-size:11px;color:#CBD5E1">${EG_LABEL[eg]} · presentado ${anio}</div>`,
            `<div style="font-family:'Roboto Mono',monospace;font-size:11px;color:#CBD5E1">US$ ${fmtMM(mmu)} MM</div>`,
          ].join('');
        },
      },
      geo: {
        map: 'Chile',
        silent: true,
        roam: false,
        aspectScale: 0.82,
        center: [-71.3, -34],
        zoom: 1.15,
        itemStyle: { areaColor: '#131F38', borderColor: '#24334F', borderWidth: 1 },
      },
      series,
    };
    chart.setOption(option);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hoverPause = false;
    let cursor = 0;
    let lastTick = performance.now();
    let lastRender = 0;
    let raf = 0;

    const renderFrame = () => {
      const yearFloat = anioIni + cursor * span;
      const yearNow = Math.min(Math.floor(yearFloat), anioFin);
      while (loadedYear < yearNow) {
        loadedYear++;
        for (const row of byYear.get(loadedYear) || []) visible[row.value[3]].push(row);
      }
      chart.setOption({
        geo: {
          center: [
            -71.3 + 1.0 * Math.sin(2 * Math.PI * cursor),
            -34 + 2.0 * Math.sin(2 * Math.PI * cursor * 0.75 + 1.2),
          ],
          zoom: 1.15 + 0.07 * Math.sin(2 * Math.PI * cursor * 2),
        },
        series: EG_ORDER.map((eg) => ({ name: EG_LABEL[eg], data: visible[eg] })),
      } as EChartsCoreOption);
      lastRender = performance.now();
      setEstado({ anio: yearNow, playing: !hoverPause, progreso: cursor });
    };

    const tick = (now: number) => {
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      if (!hoverPause) {
        const hold = HOLD_SECONDS / (LOOP_SECONDS + HOLD_SECONDS);
        cursor += (dt * (1 - hold)) / LOOP_SECONDS;
        if (cursor >= 1) {
          cursor = 0;
          loadedYear = anioIni - 1;
          for (const eg of EG_ORDER) visible[eg] = [];
        }
        if (now - lastRender > FRAME_MS) renderFrame();
      }
      raf = requestAnimationFrame(tick);
    };

    if (reduceMotion) {
      cursor = 1;
      renderFrame();
      setEstado((s) => ({ ...s, playing: false, progreso: 1 }));
    } else {
      renderFrame();
      raf = requestAnimationFrame(tick);
    }

    const el = ref.current;
    const onEnter = () => {
      hoverPause = true;
      chart.setOption({ tooltip: { show: true } } as EChartsCoreOption);
    };
    const onLeave = () => {
      hoverPause = false;
      chart.setOption({ tooltip: { show: false } } as EChartsCoreOption);
    };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      chart.dispose();
    };
  }, [data]);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* Cubre el video de respaldo cuando el dataset está listo */}
      <div
        ref={ref}
        className={`h-full w-full transition-opacity duration-1000 ${data ? 'opacity-100' : 'opacity-0'}`}
      />
      {data && estado.anio > 0 && (
        <div className="pointer-events-none absolute bottom-24 right-6 text-right lg:right-10">
          <p className="font-display text-[64px] font-semibold leading-none tracking-tight text-white/90 tabular lg:text-[84px]">
            {estado.anio}
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
            {estado.playing ? 'construyendo el mapa' : 'en pausa · explora los puntos'}
          </p>
          <div className="ml-auto mt-2 h-0.5 w-40 overflow-hidden rounded bg-white/15">
            <div className="h-full bg-oep-emerald transition-[width] duration-150" style={{ width: `${estado.progreso * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
