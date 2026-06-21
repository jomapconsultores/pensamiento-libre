import Link from 'next/link';

const testimonials = [
  {
    emoji: '🧠',
    quote:
      'Gracias a los talleres de la Fundación reencontré mi propósito. La psicología y el pensamiento crítico me dieron herramientas que uso cada día.',
    name: 'María Fernanda',
    role: 'Beneficiaria del programa de salud mental',
    metric: '+2 años de seguimiento',
  },
  {
    emoji: '📚',
    quote:
      'La educación que reciben mis hijos aquí va más allá del aula: aprenden a pensar, a sentir y a relacionarse con libertad y respeto.',
    name: 'Carlos Mendoza',
    role: 'Padre de familia — programa Escuelas',
    metric: '3 hijos beneficiados',
  },
  {
    emoji: '💙',
    quote:
      'Ser voluntario me cambió la vida. Comprendí que cuidar mi mente también es un acto colectivo y que el cambio empieza dentro.',
    name: 'Lucía Ramírez',
    role: 'Voluntaria activa desde 2024',
    metric: '+80 horas de voluntariado',
  },
];

export function Testimonials() {
  return (
    <section id="testimonios" className="py-20 bg-brand-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" aria-hidden>
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-sky rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-brand-gold rounded-full blur-3xl" />
      </div>

      <div className="container-page relative">
        <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-brand-gold-light text-xs font-bold uppercase tracking-widest mb-6 border border-white/20 mx-auto block w-fit">
          Historias reales
        </span>
        <h2 className="section-title text-white font-display">Voces que inspiran</h2>
        <p className="section-subtitle text-white/70">
          Personas reales, impacto real. Cada historia representa a cientos de personas que
          han transformado su vida con nuestros programas.
        </p>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors flex flex-col"
            >
              <div className="text-3xl mb-4">{t.emoji}</div>
              <svg
                className="w-8 h-8 text-brand-gold-light mb-4 opacity-60"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
              </svg>
              <blockquote className="text-base leading-relaxed text-white/85 flex-1">
                "{t.quote}"
              </blockquote>
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="font-bold text-brand-gold-light">{t.name}</p>
                <p className="text-xs text-white/60 mt-0.5">{t.role}</p>
                <span className="inline-block mt-2 text-xs bg-brand-gold/20 text-brand-gold-light px-2.5 py-1 rounded-full font-medium">
                  {t.metric}
                </span>
              </div>
            </figure>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/60 mb-6 text-sm">
            ¿Quieres que más personas vivan esto?
          </p>
          <Link href="/donar" className="btn-primary">
            Donar y generar más historias
          </Link>
        </div>
      </div>
    </section>
  );
}
