import type { Metadata } from 'next';
import Link from 'next/link';
import { ServicesCards } from '@/components/ServicesCards';

export const metadata: Metadata = {
  title: 'Servicios | Fundación Pensamiento Libre',
  description:
    'Consultas psicológicas, talleres de pensamiento crítico, mentoría de propósito y programas corporativos. Reserva en línea o consulta disponibilidad.',
};

const DIFFERENTIATORS = [
  {
    emoji: '🎓',
    title: 'Profesionales certificados',
    desc: 'Psicólogos y facilitadores con formación y experiencia verificable.',
  },
  {
    emoji: '🌐',
    title: 'Online y presencial',
    desc: 'Elige la modalidad que más se adapta a tu vida y ubicación.',
  },
  {
    emoji: '🤝',
    title: 'Tarifas solidarias',
    desc: 'Contamos con becas y precios preferenciales para casos de vulnerabilidad.',
  },
  {
    emoji: '💳',
    title: 'Pago seguro en línea',
    desc: 'Reserva y paga desde cualquier lugar con tarjeta de crédito o débito.',
  },
];

export default function ServiciosPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-bg py-20 md:py-28">
        <div className="container-page text-center max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/15 text-brand-gold font-semibold text-sm mb-6 border border-brand-gold/20">
            Servicios de calidad · Impacto real
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy leading-tight">
            Servicios que
            <br />
            <span className="gradient-text">transforman vidas</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto leading-relaxed">
            Talleres, consultas psicológicas y programas especializados que financian nuestra
            misión y te acompañan en tu camino de desarrollo personal integral.
          </p>
        </div>
      </section>

      {/* DIFFERENTIATORS */}
      <section className="py-12 bg-brand-cream/50">
        <div className="container-page">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DIFFERENTIATORS.map((d) => (
              <div
                key={d.title}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-brand-navy/5 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{d.emoji}</div>
                <h3 className="font-bold text-brand-navy mb-1">{d.title}</h3>
                <p className="text-sm text-brand-navy/65">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20">
        <div className="container-page">
          <ServicesCards />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="container-page text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-white/75 mb-8 leading-relaxed">
            Cuéntanos tu situación y diseñamos juntos una solución a tu medida. También
            brindamos consultas solidarias para quienes no pueden costear una sesión.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contacto" className="btn-primary">
              Escríbenos ahora
            </Link>
            <Link
              href="/donar"
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20 font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Apoyar consultas solidarias
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
