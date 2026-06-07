import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gracias | Fundación Pensamiento Libre',
  description: 'Tu aporte ya está haciendo la diferencia.',
};

export default function GraciasPage() {
  return (
    <section className="hero-bg py-32">
      <div className="container-page text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-gold mb-6">
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-navy">
          ¡Gracias por tu aporte!
        </h1>
        <p className="mt-6 text-lg text-brand-navy/75">
          Tu donación ya está siendo procesada. Recibirás un correo de confirmación en
          breve. Eres parte del cambio que transforma vidas.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/" className="btn-secondary">Volver al inicio</Link>
          <Link href="/programas" className="btn-outline">Conocer programas</Link>
        </div>
      </div>
    </section>
  );
}
