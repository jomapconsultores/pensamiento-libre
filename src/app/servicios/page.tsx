import type { Metadata } from 'next';
import { ServicesCards } from '@/components/ServicesCards';

export const metadata: Metadata = {
  title: 'Servicios | Fundación Pensamiento Libre',
  description:
    'Accede a nuestros talleres, consultas psicológicas y programas de mentoría profesional.',
};

export default function ServiciosPage() {
  return (
    <>
      <section className="hero-bg py-20">
        <div className="container-page text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy">
            Servicios
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto">
            Talleres, consultas y programas profesionales que sostienen nuestra misión
            y te acompañan en tu camino.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <ServicesCards />
        </div>
      </section>
    </>
  );
}
