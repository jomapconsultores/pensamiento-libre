/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

import Link from 'next/link';
import Image from 'next/image';
import { getAdminUser } from '@/lib/adminAuth';
import { logout } from './login/actions';

export const dynamic = 'force-dynamic';

const tabs = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/mensajes', label: 'Mensajes' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/donaciones', label: 'Donaciones' },
  { href: '/admin/membresias', label: 'Membresías' },
  { href: '/admin/servicios', label: 'Servicios' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();

  // Sin sesión solo se llega aquí por /admin/login: se muestra tal cual, sin el
  // marco del panel (menú, usuario, salir), que no tendría a qué apuntar.
  if (!user) return <>{children}</>;

  const menu = user.role === 'admin' ? [...tabs, { href: '/admin/usuarios', label: 'Usuarios' }] : tabs;

  return (
    <div className="min-h-screen bg-brand-cream/30">
      <header className="bg-white border-b border-brand-navy/10 sticky top-0 z-40 shadow-sm">
        <div className="container-page py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
            <div>
              <p className="text-sm text-brand-navy/60 leading-none">Panel administrativo</p>
              <p className="font-display font-bold text-brand-navy">Fundación Pensamiento Libre</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-brand-navy/60 hidden sm:inline">
              {user.full_name || user.email} · {user.role}
            </span>
            <Link href="/admin/cuenta" className="text-brand-navy/70 hover:text-brand-gold">
              Mi cuenta
            </Link>
            <form action={logout}>
              <button type="submit" className="text-brand-navy/70 hover:text-brand-gold">
                Salir
              </button>
            </form>
            <Link href="/" className="text-brand-navy/70 hover:text-brand-gold">← Sitio</Link>
          </div>
        </div>
        <nav className="container-page pb-3 -mb-px overflow-x-auto">
          <ul className="flex gap-1 min-w-max">
            {menu.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="inline-block px-4 py-2 rounded-lg text-sm font-medium text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/5 transition-colors"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="container-page py-8">{children}</main>
    </div>
  );
}
