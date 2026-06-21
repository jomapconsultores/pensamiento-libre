'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/sobre-nosotros', label: 'Nosotros' },
  { href: '/programas', label: 'Programas' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/aliados', label: 'Aliados' },
  { href: '/membresias', label: 'Membresías' },
  { href: '/contacto', label: 'Contacto' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-navy/10 shadow-sm">
      <nav className="container-page flex items-center justify-between h-20">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Inicio">
          <Image
            src="/logo-navbar.png"
            alt="Fundación Pensamiento Libre"
            width={192}
            height={79}
            priority
            quality={90}
            className="h-12 w-auto"
          />
          <span className="hidden sm:block font-display font-bold text-brand-navy leading-tight">
            <span className="block text-sm">Fundación</span>
            <span className="block text-xs text-brand-gold font-semibold">Pensamiento Libre</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <ul className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-brand-gold bg-brand-gold/8'
                      : 'text-brand-navy/75 hover:text-brand-navy hover:bg-brand-navy/5'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* DESKTOP CTA */}
        <div className="hidden xl:flex items-center gap-2">
          <Link href="/membresias" className="text-sm font-semibold text-brand-navy/70 hover:text-brand-navy px-3 py-2 transition-colors">
            Hacerme miembro
          </Link>
          <Link href="/donar" className="btn-primary text-sm py-2.5 px-5">
            💛 Donar
          </Link>
        </div>

        {/* MOBILE BURGER */}
        <button
          type="button"
          className="xl:hidden p-2 text-brand-navy rounded-lg hover:bg-brand-navy/5 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
          aria-expanded={open}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* MOBILE MENU */}
      {open && (
        <div className="xl:hidden bg-white border-t border-brand-navy/10 shadow-lg">
          <div className="container-page py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-brand-gold bg-brand-gold/8'
                    : 'text-brand-navy/80 hover:text-brand-navy hover:bg-brand-navy/5'
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 pb-1 space-y-2">
              <Link
                href="/membresias"
                className="block w-full text-center btn-outline py-2.5 text-sm"
                onClick={() => setOpen(false)}
              >
                Hacerme miembro
              </Link>
              <Link
                href="/donar"
                className="block w-full text-center btn-primary py-2.5 text-sm"
                onClick={() => setOpen(false)}
              >
                💛 Donar ahora
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
