import type { Metadata } from 'next';
import Link from 'next/link';
import { MembershipCards } from '@/components/MembershipCards';

export const metadata: Metadata = {
  title: 'Membresías | Fundación Pensamiento Libre',
  description:
    'Conviértete en miembro de la Fundación Pensamiento Libre. Apoya mensualmente nuestra misión y accede a beneficios exclusivos en salud mental, educación y desarrollo personal.',
};

const HOW_IT_WORKS = [
  {
    step: '1',
    emoji: '✅',
    title: 'Elige tu plan',
    desc: 'Selecciona el nivel que se adapta a ti: Solidario ($10), Patrocinador ($30) o Corporativo.',
  },
  {
    step: '2',
    emoji: '💳',
    title: 'Suscripción mensual',
    desc: 'El cobro es automático cada mes. Puedes cancelar en cualquier momento sin penalización.',
  },
  {
    step: '3',
    emoji: '🌱',
    title: 'Tu dinero actúa',
    desc: 'Tu membresía financia directamente programas de salud mental, becas y talleres comunitarios.',
  },
  {
    step: '4',
    emoji: '📊',
    title: 'Informe de impacto',
    desc: 'Recibes actualizaciones mensuales sobre cómo tu aporte está transformando vidas.',
  },
];

const IMPACT_DESTINATIONS = [
  {
    emoji: '🧠',
    area: 'Salud Mental',
    desc: 'Consultas psicológicas solidarias para personas sin recursos. Tu membresía ayuda a financiar estas consultas cada mes.',
    programs: ['Consultas gratuitas', 'Grupos terapéuticos', 'Talleres de bienestar'],
    memberRequired: 'Solidario +',
  },
  {
    emoji: '📚',
    area: 'Becas Educativas',
    desc: 'Financiamos el acceso a educación para jóvenes en situación de vulnerabilidad en Cuenca y otras provincias de Ecuador.',
    programs: ['Beca mensual ($50)', 'Materiales didácticos', 'Tutorías personalizadas'],
    memberRequired: 'Solidario +',
  },
  {
    emoji: '💡',
    area: 'Talleres Comunitarios',
    desc: 'Llevamos inteligencia emocional, pensamiento crítico y habilidades sociales a barrios y escuelas rurales.',
    programs: ['Escuelas públicas', 'Barrios vulnerables', 'Centros comunitarios'],
    memberRequired: 'Solidario +',
  },
  {
    emoji: '🏃',
    area: 'Cultura Física',
    desc: 'Actividades deportivas y recreativas para niños, adolescentes y adultos mayores que mejoran su bienestar integral.',
    programs: ['Deporte comunitario', 'Recreación adultos mayores', 'Juegos inclusivos'],
    memberRequired: 'Patrocinador +',
  },
  {
    emoji: '👨‍👩‍👧',
    area: 'Apoyo Familiar',
    desc: 'Programas que fortalecen el núcleo familiar con orientación psicológica, económica y educativa.',
    programs: ['Orientación familiar', 'Talleres de crianza', 'Mediación familiar'],
    memberRequired: 'Patrocinador +',
  },
  {
    emoji: '🌐',
    area: 'Programas Virtuales',
    desc: 'Acceso a formación continua, webinars y contenido especializado para comunidades remotas o de otras ciudades.',
    programs: ['Cursos online', 'Webinars mensuales', 'Biblioteca digital'],
    memberRequired: 'Solidario +',
  },
];

const FAQS = [
  {
    q: '¿Cuándo se realiza el cobro mensual?',
    a: 'El primer cobro es inmediato al suscribirte. Los siguientes se realizan el mismo día de cada mes de forma automática mediante Stripe.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, absolutamente. Puedes cancelar tu membresía desde el portal de Stripe o escribiéndonos. No hay compromisos a largo plazo ni penalizaciones.',
  },
  {
    q: '¿Cómo sé que mi dinero realmente llega a las personas?',
    a: 'Enviamos un informe mensual a todos los miembros con datos reales: número de consultas realizadas, talleres ejecutados y personas beneficiadas directamente por las membresías.',
  },
  {
    q: '¿Puedo cambiar de plan después?',
    a: 'Sí. En cualquier momento puedes subir o bajar de plan. Simplemente contáctanos y gestionamos el cambio en el siguiente ciclo de facturación.',
  },
  {
    q: '¿Los beneficios son inmediatos?',
    a: 'Al completar tu suscripción recibirás un email de bienvenida con acceso a todos tus beneficios. Las charlas y talleres tienen calendario mensual que se comparte en ese mismo email.',
  },
  {
    q: '¿Qué diferencia hay entre membresía y donación?',
    a: 'La membresía es un apoyo mensual recurrente que incluye beneficios para ti (charlas, descuentos, talleres). La donación es puntual o libre, sin beneficios adicionales para el donante. Ambas impactan directamente en la misma causa.',
  },
];

export default function MembresiasPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-bg py-20 md:py-28">
        <div className="container-page text-center max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/15 text-brand-gold font-semibold text-sm mb-6 border border-brand-gold/20">
            Apoyo continuo · Impacto real · Beneficios exclusivos
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy leading-tight">
            Sé parte del cambio
            <br />
            <span className="gradient-text">cada mes</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto leading-relaxed">
            Al hacerte miembro, financias directamente consultas psicológicas, becas educativas
            y talleres comunitarios en Cuenca y el resto de Ecuador — y a la vez accedes a beneficios
            diseñados para tu propio desarrollo personal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a href="#planes" className="btn-primary">
              Ver planes desde $10/mes
            </a>
            <Link href="/donar" className="btn-outline">
              Prefiero donar una vez
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-brand-cream/50">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-brand-navy">¿Cómo funciona?</h2>
            <p className="section-subtitle mt-3">Simple, transparente y cancelable en cualquier momento.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="bg-white rounded-2xl p-6 shadow-sm border border-brand-navy/5 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{step.emoji}</div>
                <div className="w-7 h-7 rounded-full bg-brand-gold text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">
                  {step.step}
                </div>
                <h3 className="font-bold text-brand-navy mb-2">{step.title}</h3>
                <p className="text-sm text-brand-navy/65 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT DESTINATIONS */}
      <section className="py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="badge-gold mb-4">¿A dónde va tu membresía?</span>
            <h2 className="text-3xl font-display font-bold text-brand-navy mt-4">
              Programas y lugares de destino
            </h2>
            <p className="section-subtitle mt-3">
              Tu membresía financia directamente estos programas. Cada mes recibes un informe
              de impacto con datos reales.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMPACT_DESTINATIONS.map((dest) => (
              <div
                key={dest.area}
                className="bg-white rounded-2xl p-6 shadow border border-brand-navy/5 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <div className="text-3xl mb-3">{dest.emoji}</div>
                <h3 className="font-bold text-brand-navy text-lg mb-2">{dest.area}</h3>
                <p className="text-sm text-brand-navy/70 leading-relaxed mb-4">{dest.desc}</p>
                <ul className="space-y-1 mb-4">
                  {dest.programs.map((p) => (
                    <li key={p} className="flex gap-2 items-center text-xs text-brand-navy/65">
                      <svg className="w-3 h-3 text-brand-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                  Desde plan {dest.memberRequired}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP PLANS */}
      <section id="planes" className="py-20 bg-brand-cream/40">
        <div className="container-page">
          <div className="text-center mb-14">
            <span className="badge-gold mb-4">Elige tu plan</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-navy mt-4">
              Tres formas de apoyarnos
            </h2>
            <p className="section-subtitle mt-4">
              Desde $10 al mes hasta alianzas corporativas. Cancela cuando quieras.
            </p>
          </div>
          <MembershipCards />
        </div>
      </section>

      {/* VOLUNTARY DONATION CALLOUT */}
      <section className="py-16 bg-white border-y border-brand-navy/8">
        <div className="container-page max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="badge-sky mb-4 inline-block">Donación voluntaria</span>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-navy mt-4 mb-4">
                ¿Prefieres donar sin compromiso mensual?
              </h2>
              <p className="text-brand-navy/70 leading-relaxed mb-6">
                Puedes hacer una donación única por el monto que tú decidas — desde $1. Sin suscripción,
                sin compromisos. También puedes elegir un <strong>paquete de impacto directo</strong> para
                financiar una clase, taller, consulta o beca específica.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/donar" className="btn-primary">
                  Donar ahora
                </Link>
                <Link href="/donar" className="btn-outline text-sm">
                  Ver paquetes de impacto
                </Link>
              </div>
            </div>
            <div className="bg-brand-cream rounded-2xl p-6 border border-brand-navy/8">
              <p className="font-bold text-brand-navy mb-4">Montos sugeridos de donación voluntaria:</p>
              <div className="space-y-3">
                {[
                  { amount: '$10', label: 'Semilla', desc: 'Materiales de una clase' },
                  { amount: '$25', label: 'Raíz', desc: 'Taller de inteligencia emocional' },
                  { amount: '$50', label: 'Árbol', desc: 'Beca estudiantil de un mes' },
                  { amount: '$100', label: 'Bosque', desc: 'Apoyo familiar integral' },
                  { amount: '$250', label: 'Selva', desc: 'Jornada comunitaria para 20+ personas' },
                ].map((item) => (
                  <div key={item.amount} className="flex items-center gap-3">
                    <span className="w-14 text-center font-bold text-brand-gold bg-brand-gold/10 rounded-lg py-1.5 text-sm">
                      {item.amount}
                    </span>
                    <div>
                      <span className="font-semibold text-brand-navy text-sm">{item.label}</span>
                      <span className="text-brand-navy/60 text-xs"> · {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-brand-cream/30">
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
            ¿Listo para marcar la diferencia?
          </h2>
          <p className="text-white/75 mb-8 leading-relaxed">
            Cada mes que eres miembro, contribuyes a que alguien reciba apoyo psicológico,
            un joven acceda a educación o una comunidad tenga un taller de bienestar.
          </p>
          <a href="#planes" className="btn-primary">
            Elegir mi plan ahora
          </a>
        </div>
      </section>
    </>
  );
}
