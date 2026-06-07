import Link from 'next/link';
import Image from 'next/image';
import { SocialLinks } from './SocialLinks';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-16">
      <div className="container-page py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="Fundación Pensamiento Libre"
              width={64}
              height={64}
              className="h-16 w-auto bg-white rounded-lg p-1"
            />
            <div>
              <p className="font-display text-xl font-bold">Fundación</p>
              <p className="font-display text-brand-gold-light">Pensamiento Libre</p>
            </div>
          </div>
          <p className="text-white/70 max-w-md leading-relaxed">
            Impulsamos el desarrollo personal integral a través de la salud mental,
            la educación consciente y el crecimiento humano. Liberamos mentes para
            transformar vidas.
          </p>
          <div className="mt-6">
            <SocialLinks />
          </div>
          <div className="mt-8 max-w-md">
            <p className="font-bold text-brand-gold-light mb-3">Recibe inspiración</p>
            <NewsletterForm />
          </div>
        </div>

        <div>
          <h3 className="font-bold text-brand-gold-light mb-4">Navegación</h3>
          <ul className="space-y-2 text-white/80">
            <li><Link href="/sobre-nosotros" className="hover:text-brand-gold-light transition-colors">Sobre nosotros</Link></li>
            <li><Link href="/programas" className="hover:text-brand-gold-light transition-colors">Programas</Link></li>
            <li><Link href="/servicios" className="hover:text-brand-gold-light transition-colors">Servicios</Link></li>
            <li><Link href="/membresias" className="hover:text-brand-gold-light transition-colors">Membresías</Link></li>
            <li><Link href="/donar" className="hover:text-brand-gold-light transition-colors">Donar</Link></li>
            <li><Link href="/contacto" className="hover:text-brand-gold-light transition-colors">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-brand-gold-light mb-4">Contacto</h3>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>
              <a href="mailto:jomapconsultores@gmail.com" className="hover:text-brand-gold-light transition-colors">
                jomapconsultores@gmail.com
              </a>
            </li>
            <li className="pt-4">
              <p className="font-semibold text-white">Aliados</p>
              <a href="https://jomapconsultores.com" target="_blank" rel="noreferrer noopener" className="hover:text-brand-gold-light transition-colors text-sm">
                JOMAP Consultores
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-white/60">
          <p>© {new Date().getFullYear()} Fundación Pensamiento Libre. Todos los derechos reservados.</p>
          <p>
            <Link href="/politica-privacidad" className="hover:text-brand-gold-light transition-colors">
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
