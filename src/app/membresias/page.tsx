import type { Metadata } from 'next';
import Link from 'next/link';
import { MembershipCards } from '@/components/MembershipCards';

export const metadata: Metadata = {
  title: 'Membresías | Fundación Pensamiento Libre',
  description:
    'Conviértete en miembro de la Fundación Pensamiento Libre. Apoya mensualmente nuestra misión y accede a beneficios exclusivos en salud mental, educación y desarrollo personal.',
};

const BENEFITS = [
  {
    emoji: '📅',
    title: 'Charlas mensuales',
    desc: 'Acceso a charlas y conferencias online con expertos en bienestar, psicología y educación.',
  },
  {
    emoji: '📰',
    title: 'Newsletter exclusiva',
    desc: 'Contenido curado sobre desarrollo personal, salud mental y pensamiento crítico.',
  },
  {
    emoji: '🏷️',
    title: 'Descuentos en servicios',
    desc: 'Precios preferenciales en talleres, consultas psicológicas y programas premium.',
  },
  {
    emoji: '🌐',
    title: 'Comunidad de miembros',
    desc: 'Espacio de conexión con personas comprometidas con el crecimiento personal y colectivo.',
  },
];

const FAQS = [
  {
    q: '¿Cuándo se realiza el cobro?',
    a: 'El primer cobro es inmediato. Los siguientes se realizan mensualmente el mismo día del mes en que te suscribiste.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. Puedes cancelar tu membresía desde tu panel de Stripe o contactándonos. No hay penalizaciones ni compromisos a largo plazo.',
  },
  {
    q: '¿Cómo accedo a los beneficios?',
    a: 'Al completar tu suscripción te enviaremos un email de bienvenida con los accesos y toda la información sobre tus beneficios.',
  },
  {
    q: '¿Mi donación tiene algún impacto fiscal?',
    a: 'La Fundación Pensamiento Libre es una persona jurídica de derecho privado sin fines de lucro legalmente constituida en Ecuador. Consulta con tu asesor fiscal para deducciones aplicables.',
  },
];

export default function MembresiasPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-bg py-20 md:py-28">
        <div className="container-page text-center max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/15 text-brand-gold font-semibold text-sm mb-6 border border-brand-gold/20">
            Apoyo continuo · Impacto real
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy leading-tight">
            Sé parte del cambio
            <br />
            <span className="gradient-text">cada mes</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto leading-relaxed">
            Al convertirte en miembro sostienes de forma continua nuestros programas de salud
            mental, educación y desarrollo personal. Tú decides cuánto y puedes cancelar cuando
            quieras.
          </p>
        </div>
      </section>

      {/* BENEFITS STRIP */}
      <section className="py-12 bg-brand-cream/60">
        <div className="container-page">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm border border-brand-navy/5 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{b.emoji}</div>
                <h3 className="font-bold text-brand-navy mb-2">{b.title}</h3>
                <p className="text-sm text-brand-navy/70 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP CARDS */}
      <section className="py-20">
        <div className="container-page">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 border border-brand-gold/20">
              Elige tu plan
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-navy">
              Tres formas de apoyarnos
            </h2>
            <p className="section-subtitle mt-4">
              Desde $10 al mes hasta alianzas corporativas. Elige el nivel que va contigo.
            </p>
          </div>
          <MembershipCards />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-brand-cream/40">
        <div className="container-page max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-brand-navy">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-2xl p-6 shadow-sm border border-brand-navy/5"
              >
                <h3 className="font-bold text-brand-navy mb-2">{faq.q}</h3>
                <p className="text-sm text-brand-navy/70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="container-page text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-4">
            ¿Prefieres donar sin compromiso mensual?
          </h2>
          <p className="text-white/75 mb-8">
            También puedes hacer una donación única por el monto que tú decides, o elegir un
            paquete de impacto directo.
          </p>
          <Link href="/donar" className="btn-primary">
            Ver opciones de donación
          </Link>
        </div>
      </section>
    </>
  );
}
