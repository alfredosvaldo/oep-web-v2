'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/explorador/', label: 'Explorador' },
  { href: '/mapa/', label: 'Mapa' },
  { href: '/perfiles/', label: 'Perfiles' },
  { href: '/rankings/', label: 'Rankings' },
  { href: '/datos-metodologia/', label: 'Datos y Metodología' },
];

/**
 * Marca OEP: anillo del observatorio con meridiano; el punto esmeralda es el
 * objeto observado. Monocromo-capaz (hereda currentColor para la tinta).
 */
export function Logo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <circle cx="12" cy="7" r="2.4" fill="#0E9F6E" />
    </svg>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-oep-ink transition-all duration-nav ${
        scrolled ? 'border-b border-oep-line bg-oep-paper/85 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-content items-center gap-6 px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-oep-ink">
          <Logo />
          <span className="font-display text-[17px] font-semibold tracking-tight">
            OEP <span className="hidden text-oep-ink/55 sm:inline">· Observatorio Económico de Permisos</span>
          </span>
        </Link>
        <nav aria-label="Navegación principal" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative rounded-md px-3 py-2 text-[14px] font-medium transition-colors duration-nav ${
                  active ? 'text-oep-ink' : 'text-oep-ink/60 hover:text-oep-ink'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-3 -bottom-px h-px bg-oep-emerald transition-transform duration-nav ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>
        <span className="hidden font-mono text-[11px] tracking-wide text-oep-ink/50 md:inline">1993–2026 · T2</span>
      </div>
    </header>
  );
}
