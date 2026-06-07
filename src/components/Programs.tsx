import Link from 'next/link';

const programs = [
  {
    title: 'Salud mental comunitaria',
    description:
      'Consultas psicológicas, grupos de apoyo y talleres preventivos accesibles para personas de bajos recursos.',
    color: 'from-brand-sky/15 to-brand-sky/5',
    iconColor: 'text-brand-sky',
    icon: (
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    ),
  },
  {
    title: 'Educación consciente',
    description:
      'Talleres, conferencias y formación continua en pensamiento crítico, neurodesarrollo y aprendizaje significativo.',
    color: 'from-brand-gold/15 to-brand-gold/5',
    iconColor: 'text-brand-gold',
    icon: (
      <>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </>
    ),
  },
  {
    title: 'Desarrollo personal',
    description:
      'Coaching, mentoría y programas de transformación para potenciar tu propósito de vida y bienestar integral.',
    color: 'from-brand-green/15 to-brand-green/5',
    iconColor: 'text-brand-green',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-2a6 6 0 0112 0v2" />
      </>
    ),
  },
  {
    title: 'Voluntariado social',
    description:
      'Acompañamos a comunidades vulnerables con voluntarios formados que multiplican el impacto en territorio.',
    color: 'from-brand-navy/15 to-brand-navy/5',
    iconColor: 'text-brand-navy',
    icon: (
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    ),
  },
];

export function Programs() {
  return (
    <section id="programas" className="py-20">
      <div className="container-page">
        <h2 className="section-title font-display">Nuestros programas</h2>
        <p className="section-subtitle">
          Iniciativas que conectan ciencia, conciencia y comunidad para impulsar
          el desarrollo personal integral.
        </p>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((p) => (
            <article
              key={p.title}
              className={`relative rounded-2xl p-6 bg-gradient-to-br ${p.color} border border-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all`}
            >
              <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow ${p.iconColor}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {p.icon}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">{p.title}</h3>
              <p className="text-sm text-brand-navy/75 leading-relaxed">{p.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/programas" className="btn-secondary">
            Conocer todos los programas
          </Link>
        </div>
      </div>
    </section>
  );
}
