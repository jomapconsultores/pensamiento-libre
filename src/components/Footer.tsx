/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */
import Link from 'next/link';
import { SocialLinks } from './SocialLinks';
import { FooterContact } from './FooterContact';
import { NewsletterForm } from './NewsletterForm';

const PARTNER_LINKS: { label: string; href: string; internal?: boolean }[] = [
  { label: 'CMAJ Asociados', href: '/cmaj', internal: true },
  { label: 'Golden Gate English Center', href: '/golden-gate', internal: true },
  { label: 'Calendarios MAP', href: 'https://calendario.pensamiento-libre.org' },
];

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-16">
      <div className="container-page py-12 grid gap-10 md:grid-cols-4">
        {/* Brand + contact form */}
        <div className="md:col-span-2">
          <div className="mb-5">
            <p className="font-display text-2xl font-bold text-white">Fundación</p>
            <p className="font-display text-brand-gold-light text-lg font-semibold">Pensamiento Libre</p>
          </div>
          <p className="text-white/70 max-w-md leading-relaxed text-sm">
            Persona jurídica de derecho privado sin fines de lucro. Promovemos el desarrollo
            humano integral en educación, salud mental y cultura física.
            <br />
            <span className="text-white/40 text-xs mt-1 block">
              Resolución MINEDEC-CZ6-2025-01466-R · Cuenca, Azuay, Ecuador.
            </span>
          </p>
          <div className="mt-4">
            <SocialLinks />
          </div>

          {/* Newsletter */}
          <div className="mt-8 max-w-md">
            <p className="font-bold text-brand-gold-light mb-1">Newsletter</p>
            <p className="text-white/50 text-xs mb-4">
              Recibe novedades e historias de impacto directamente en tu correo.
            </p>
            <NewsletterForm />
          </div>

          {/* Contact form */}
          <div className="mt-8 max-w-md">
            <p className="font-bold text-brand-gold-light mb-1">Conecta con nosotros</p>
            <p className="text-white/50 text-xs mb-4">
              Escríbenos directamente — te respondemos a la brevedad.
            </p>
            <FooterContact />
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-bold text-brand-gold-light mb-4">Navegación</h3>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>
              <Link href="/sobre-nosotros" className="hover:text-brand-gold-light transition-colors">
                Sobre nosotros
              </Link>
            </li>
            <li>
              <Link href="/programas" className="hover:text-brand-gold-light transition-colors">
                Programas
              </Link>
            </li>
            <li>
              <Link href="/servicios" className="hover:text-brand-gold-light transition-colors">
                Servicios
              </Link>
            </li>
            <li>
              <Link href="/aliados" className="hover:text-brand-gold-light transition-colors">
                Aliados
              </Link>
            </li>
            <li>
              <Link href="/cmaj" className="hover:text-brand-gold-light transition-colors">
                CMAJ
              </Link>
            </li>
            <li>
              <Link href="/golden-gate" className="hover:text-brand-gold-light transition-colors">
                Golden Gate
              </Link>
            </li>
            <li>
              <Link href="/membresias" className="hover:text-brand-gold-light transition-colors">
                Membresías
              </Link>
            </li>
            <li>
              <Link
                href="/donar"
                className="text-brand-gold-light font-semibold hover:text-brand-gold transition-colors"
              >
                💛 Donar ahora
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-brand-gold-light transition-colors">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        {/* Plataformas aliadas */}
        <div>
          <h3 className="font-bold text-brand-gold-light mb-4">Plataformas aliadas</h3>
          <ul className="space-y-2 text-white/80 text-sm">
            {PARTNER_LINKS.map((p) =>
              p.internal ? (
                <li key={p.label}>
                  <Link href={p.href} className="hover:text-brand-gold-light transition-colors">
                    {p.label}
                  </Link>
                </li>
              ) : (
                <li key={p.label}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-brand-gold-light transition-colors"
                  >
                    {p.label}
                  </a>
                </li>
              )
            )}
            <li className="pt-3 space-y-1">
              <a
                href="mailto:jomapconsultores@gmail.com"
                className="block hover:text-brand-gold-light transition-colors text-xs"
              >
                jomapconsultores@gmail.com
              </a>
              <a
                href="https://wa.me/593963511411"
                target="_blank"
                rel="noreferrer noopener"
                className="block hover:text-brand-gold-light transition-colors text-xs"
              >
                WhatsApp +593 96 351 1411
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-white/60">
          <p>
            © {new Date().getFullYear()} Fundación Pensamiento Libre. Todos los derechos reservados.
            <span className="mx-2 text-white/30">·</span>
            <span className="text-white/40">Desarrollado por Marco Antonio Posligua San Martín</span>
          </p>
          <p>
            <Link
              href="/politica-privacidad"
              className="hover:text-brand-gold-light transition-colors"
            >
              Política de privacidad
            </Link>
            <span className="mx-2">·</span>
            <Link href="/terminos" className="hover:text-brand-gold-light transition-colors">
              Términos
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
