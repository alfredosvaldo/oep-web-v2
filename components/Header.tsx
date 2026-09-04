'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/explorador/', label: 'Explorador' },
  { href: '/mapa/', label: 'Mapa' },
  { href: '/perfiles/', label: 'Perfiles' },
  { href: '/rankings/', label: 'Rankings' },
  { href: '/datos-metodologia/', label: 'Datos y Metodología' },
];

export function Logo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {/* Hexágono isométrico: cobre arriba, esmeralda derecha, pizarra izquierda */}
      <polygon points="12,1 20,5.5 12,10 4,5.5" fill="#F59E0B" />
      <polygon points="20,5.5 20,14.5 12,19 12,10" fill="#10B981" />
      <polygon points="4,5.5 12,10 12,19 4,14.5" fill="#334155" />
    </svg>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-nav ${
        scrolled ? 'border-b border-white/10 bg-oep-slate/90 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-content items-center gap-6 px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <span className="font-display text-[15px] font-semibold tracking-tight">
            OEP <span className="hidden text-slate-300 sm:inline">· Observatorio Económico de Permisos</span>
          </span>
        </Link>
        <nav aria-label="Navegación principal" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-[14px] font-medium text-slate-200 transition-colors duration-nav hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="hidden rounded border border-slate-600 px-2 py-1 font-mono text-[11px] text-slate-300 md:inline">
          2026-T2
        </span>
        <span className="rounded border border-slate-600 px-2 py-1 font-mono text-[11px] text-slate-300">ES-CL</span>
      </div>
    </header>
  );
}
