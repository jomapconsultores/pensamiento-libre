import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';
import { SocialLinks } from '@/components/SocialLinks';

export const metadata: Metadata = {
  title: 'Contacto | Fundación Pensamiento Libre',
  description: 'Escríbenos. Estamos aquí para acompañarte en tu camino.',
};

export default function ContactoPage() {
  return (
    <>
      <section className="hero-bg py-20">
        <div className="container-page text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy">
            Hablemos
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto">
            ¿Quieres ser voluntario, aliado o conocer más sobre nuestros programas?
            Estamos a un mensaje de distancia.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-display font-bold text-brand-navy mb-6">
              Envíanos un mensaje
            </h2>
            <ContactForm />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-brand-navy mb-6">
              Otros canales
            </h2>
            <ul className="space-y-5">
              <li>
                <p className="font-semibold text-brand-navy text-sm mb-1">Email</p>
                <a
                  href="mailto:jomapconsultores@gmail.com"
                  className="text-brand-gold hover:text-brand-gold-light transition-colors font-medium"
                >
                  jomapconsultores@gmail.com
                </a>
              </li>
              <li>
                <p className="font-semibold text-brand-navy text-sm mb-2">Redes sociales</p>
                <SocialLinks variant="light" />
              </li>
              <li>
                <p className="font-semibold text-brand-navy text-sm mb-1">Aliados</p>
                <a
                  href="/aliados"
                  className="text-brand-gold hover:text-brand-gold-light transition-colors font-medium"
                >
                  Ver nuestros aliados →
                </a>
              </li>
            </ul>

            <div className="bg-brand-cream/60 rounded-2xl p-6 border border-brand-navy/8">
              <h3 className="font-bold text-brand-navy mb-2">Horario de atención</h3>
              <p className="text-brand-navy/75 text-sm">Lunes a viernes, 9:00 — 18:00</p>
              <p className="text-brand-navy/50 text-xs mt-1">Cuenca, Azuay, Ecuador</p>
            </div>

            {/* Quick actions */}
            <div className="bg-brand-navy rounded-2xl p-6 text-white">
              <p className="font-bold text-brand-gold-light mb-4">Actúa ahora</p>
              <div className="space-y-3">
                <a
                  href="/donar"
                  className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-base flex-shrink-0">💛</span>
                  Hacer una donación
                </a>
                <a
                  href="/membresias"
                  className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-base flex-shrink-0">🌳</span>
                  Hacerme miembro mensual
                </a>
                <a
                  href="/servicios"
                  className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-base flex-shrink-0">🧠</span>
                  Reservar una consulta
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
