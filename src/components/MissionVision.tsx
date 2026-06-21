import Link from 'next/link';

const VALUES = [
  { label: 'Libertad', icon: '🕊️', desc: 'Pensamiento libre sin juicios' },
  { label: 'Integridad', icon: '🤝', desc: 'Transparencia en cada acción' },
  { label: 'Empatía', icon: '💙', desc: 'Escucha activa y compasión' },
  { label: 'Excelencia', icon: '✨', desc: 'Calidad en todos los servicios' },
];

const IMPACT_NUMBERS = [
  { number: '+2.500', label: 'Personas beneficiadas', color: 'text-brand-gold' },
  { number: '5', label: 'Ejes de acción', color: 'text-brand-sky' },
  { number: '12', label: 'Programas activos', color: 'text-brand-green' },
  { number: '+80', label: 'Voluntarios', color: 'text-brand-gold' },
];

export function MissionVision() {
  return (
    <section id="mision" className="py-20 bg-brand-cream/40">
      <div className="container-page">
        <h2 className="section-title font-display">Quiénes somos</h2>
        <p className="section-subtitle">
          Una fundación legalmente constituida dedicada al desarrollo personal integral, donde
          mente, emoción y propósito convergen para transformar vidas en Ecuador y Latinoamérica.
        </p>

        {/* Misión / Visión */}
        <div className="mt-14 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <article className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-brand-navy/5 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-full bg-brand-sky/15 flex items-center justify-center mb-6">
              <svg
                className="w-7 h-7 text-brand-sky"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-navy mb-3">Misión</h3>
            <p className="text-brand-navy/75 leading-relaxed">
              Promover el desarrollo humano integral a lo largo de todo el ciclo vital — niños,
              adolescentes, adultos y adultos mayores — mediante servicios de excelencia en
              educación, capacitación, salud mental y cultura física.
            </p>
          </article>

          <article className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-brand-navy/5 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-full bg-brand-gold/15 flex items-center justify-center mb-6">
              <svg
                className="w-7 h-7 text-brand-gold"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-navy mb-3">Visión</h3>
            <p className="text-brand-navy/75 leading-relaxed">
              Ser una organización referente en Latinoamérica en la promoción del pensamiento
              libre y el desarrollo integral del ser humano, generando comunidades más
              conscientes, resilientes y comprometidas con su bienestar.
            </p>
          </article>
        </div>

        {/* Impact numbers */}
        <div className="mt-16 bg-brand-navy rounded-3xl p-10 text-white text-center">
          <h3 className="text-xl font-bold text-white/80 mb-8">Nuestro impacto en números</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {IMPACT_NUMBERS.map((n) => (
              <div key={n.label}>
                <p className={`text-3xl md:text-4xl font-bold ${n.color}`}>{n.number}</p>
                <p className="text-white/70 text-sm mt-2">{n.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-display font-bold text-brand-navy text-center mb-8">
            Nuestros valores
          </h3>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v) => (
              <li
                key={v.label}
                className="bg-white rounded-xl p-6 text-center shadow border border-brand-navy/5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="text-3xl mb-3">{v.icon}</div>
                <p className="font-bold text-brand-navy">{v.label}</p>
                <p className="text-xs text-brand-navy/60 mt-1">{v.desc}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/sobre-nosotros" className="btn-outline">
            Conocer nuestra historia
          </Link>
        </div>
      </div>
    </section>
  );
}
