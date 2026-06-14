'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/programas', label: 'Programas' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/aliados', label: 'Aliados' },
  { href: '/cmaj', label: 'CMAJ' },
  { href: '/golden-gate', label: 'Golden Gate' },
  { href: '/membresias', label: 'Membresías' },
  { href: '/contacto', label: 'Contacto' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-navy/10 shadow-sm">
      <nav className="container-page flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3" aria-label="Inicio">
          <Image
            src="/logo.png"
            alt="Fundación Pensamiento Libre"
            width={56}
            height={56}
            priority
            className="h-14 w-auto"
          />
          <span className="hidden sm:block font-display font-bold text-brand-navy leading-tight">
            <span className="block text-base">Fundación</span>
            <span className="block text-sm text-brand-gold">Pensamiento Libre</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-brand-navy/80 hover:text-brand-gold font-medium transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/donar" className="btn-primary text-sm">
            Donar
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 text-brand-navy"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-white border-t border-brand-navy/10">
          <ul className="container-page py-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 text-brand-navy/80 hover:text-brand-gold font-medium"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/donar" className="btn-primary w-full" onClick={() => setOpen(false)}>
                Donar
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
