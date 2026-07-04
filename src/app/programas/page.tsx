import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Programas | Fundación Pensamiento Libre',
  description:
    'Conoce todos los programas de la Fundación Pensamiento Libre en salud mental, educación consciente, desarrollo personal, cultura física e inclusión intergeneracional.',
};

const programs = [
  {
    title: 'Salud mental comunitaria',
    description:
      'Atención psicológica individual y grupal con tarifas solidarias o gratuitas para personas en situación de vulnerabilidad. Incluye grupos terapéuticos, talleres preventivos y campañas de sensibilización.',
    tag: 'Salud Mental',
    emoji: '🧠',
    tagStyle: 'bg-brand-sky/15 text-brand-sky border-brand-sky/20',
    donateAmount: 35,
    donateLabel: 'Financiar una consulta solidaria',
  },
  {
    title: 'Escuela de pensamiento crítico',
    description:
      'Formación continua en filosofía aplicada, metacognición y comunicación consciente. Dirigida a jóvenes, educadores y profesionales en formación.',
    tag: 'Educación',
    emoji: '💡',
    tagStyle: 'bg-brand-gold/15 text-brand-gold border-brand-gold/20',
    donateAmount: 10,
    donateLabel: 'Financiar una clase',
  },
  {
    title: 'Mentoría de propósito',
    description:
      'Acompañamiento uno a uno para diseñar un plan de vida con sentido. Combina psicología, coaching y herramientas de propósito.',
    tag: 'Desarrollo Personal',
    emoji: '🎯',
    tagStyle: 'bg-brand-green/15 text-brand-green border-brand-green/20',
    donateAmount: 50,
    donateLabel: 'Apoyar una mentoría',
  },
  {
    title: 'Pensamiento Libre Escuelas',
    description:
      'Llevamos talleres de inteligencia emocional, pensamiento crítico y bienestar a escuelas públicas y rurales de Cuenca.',
    tag: 'Educación',
    emoji: '🏫',
    tagStyle: 'bg-brand-gold/15 text-brand-gold border-brand-gold/20',
    donateAmount: 25,
    donateLabel: 'Financiar un taller escolar',
  },
  {
    title: 'Cuidando al cuidador',
    description:
      'Programa para profesionales de salud, docentes y trabajadores sociales: prevención de burnout y acompañamiento emocional continuo.',
    tag: 'Salud Mental',
    emoji: '💙',
    tagStyle: 'bg-brand-sky/15 text-brand-sky border-brand-sky/20',
    donateAmount: 35,
    donateLabel: 'Apoyar este programa',
  },
  {
    title: 'Red de voluntariado',
    description:
      'Formación, supervisión y comunidad para voluntarios que desean aportar tiempo y talento en nuestros programas comunitarios.',
    tag: 'Comunidad',
    emoji: '🤝',
    tagStyle: 'bg-brand-navy/10 text-brand-navy border-brand-navy/20',
    donateAmount: 10,
    donateLabel: 'Apoyar el voluntariado',
  },
  {
    title: 'Cultura física y recreación',
    description:
      'Actividades deportivas, recreativas y de bienestar físico para todas las edades. Integramos el movimiento como herramienta de salud mental.',
    tag: 'Cultura Física',
    emoji: '⚽',
    tagStyle: 'bg-brand-green/15 text-brand-green border-brand-green/20',
    donateAmount: 25,
    donateLabel: 'Apoyar actividades físicas',
  },
  {
    title: 'Inclusión intergeneracional',
    description:
      'Programas que conectan a adultos mayores, adultos, jóvenes y niños en espacios de aprendizaje mutuo, respeto y bienestar compartido.',
    tag: 'Inclusión',
    emoji: '👨‍👩‍👧‍👦',
    tagStyle: 'bg-brand-purple/15 text-brand-purple border-brand-purple/20',
    donateAmount: 50,
    donateLabel: 'Apoyar la inclusión',
  },
];

export default function ProgramasPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-bg py-20 md:py-28">
        <div className="container-page text-center max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/15 text-brand-gold font-semibold text-sm mb-6 border border-brand-gold/20">
            6 ejes de acción · 8 programas activos
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy leading-tight">
            Programas que
            <br />
            <span className="gradient-text">liberan mentes</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto leading-relaxed">
            Iniciativas que conectan ciencia, conciencia y comunidad para impulsar el desarrollo
            personal integral en todas las etapas de la vida.
          </p>
        </div>
      </section>

      {/* PROGRAMS GRID */}
      <section className="py-20">
        <div className="container-page">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {programs.map((p) => (
              <article
                key={p.title}
                className="bg-white rounded-2xl p-6 shadow border border-brand-navy/5 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
              >
                <div className="text-3xl mb-3">{p.emoji}</div>
                <span
                  className={`inline-block self-start text-xs font-bold px-3 py-1 rounded-full border mb-3 ${p.tagStyle}`}
                >
                  {p.tag}
                </span>
                <h3 className="text-lg font-display font-bold text-brand-navy mb-2">{p.title}</h3>
                <p className="text-brand-navy/70 leading-relaxed text-sm flex-1">{p.description}</p>
                <Link
                  href="/donar"
                  className="mt-5 text-xs font-semibold text-brand-gold hover:text-brand-gold-light flex items-center gap-1 transition-colors"
                >
                  {p.donateLabel} ${p.donateAmount}
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-brand-navy rounded-3xl p-10 text-white text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              ¿Quieres apoyar un programa específico?
            </h2>
            <p className="text-white/75 mb-8 max-w-xl mx-auto">
              Elige el paquete de impacto que deseas financiar: clases, talleres, consultas
              psicológicas o becas educativas.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/donar" className="btn-primary">
                Ver paquetes de impacto
              </Link>
              <Link
                href="/contacto"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Ser voluntario
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
