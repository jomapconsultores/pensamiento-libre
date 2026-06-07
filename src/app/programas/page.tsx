import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Programas | Fundación Pensamiento Libre',
  description:
    'Conoce todos los programas que ofrece la Fundación Pensamiento Libre en salud mental, educación y desarrollo personal.',
};

const programs = [
  {
    title: 'Salud mental comunitaria',
    description:
      'Atención psicológica individual y grupal con tarifas solidarias o gratuitas para personas en situación de vulnerabilidad. Incluye grupos terapéuticos, talleres preventivos y campañas de sensibilización.',
    tag: 'Salud',
    color: 'bg-brand-sky/15 text-brand-sky',
  },
  {
    title: 'Escuela de pensamiento crítico',
    description:
      'Formación continua en filosofía aplicada, metacognición y comunicación consciente. Dirigida a jóvenes, educadores y profesionales en formación.',
    tag: 'Educación',
    color: 'bg-brand-gold/15 text-brand-gold',
  },
  {
    title: 'Mentoría de propósito',
    description:
      'Acompañamiento uno a uno para diseñar un plan de vida con sentido. Combina psicología, coaching y herramientas de propósito.',
    tag: 'Desarrollo',
    color: 'bg-brand-green/15 text-brand-green',
  },
  {
    title: 'Pensamiento Libre Escuelas',
    description:
      'Llevamos talleres de inteligencia emocional, pensamiento crítico y bienestar a escuelas públicas y rurales.',
    tag: 'Educación',
    color: 'bg-brand-gold/15 text-brand-gold',
  },
  {
    title: 'Cuidando al cuidador',
    description:
      'Programa para profesionales de salud, docentes y trabajadores sociales: prevención de burnout y acompañamiento emocional.',
    tag: 'Salud',
    color: 'bg-brand-sky/15 text-brand-sky',
  },
  {
    title: 'Red de voluntariado',
    description:
      'Formación, supervisión y comunidad para voluntarios que desean aportar tiempo y talento en nuestros programas.',
    tag: 'Comunidad',
    color: 'bg-brand-navy/15 text-brand-navy',
  },
];

export default function ProgramasPage() {
  return (
    <>
      <section className="hero-bg py-20">
        <div className="container-page text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy">
            Nuestros programas
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto">
            Iniciativas que conectan ciencia, conciencia y comunidad para impulsar
            el desarrollo personal integral.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p) => (
              <article
                key={p.title}
                className="bg-white rounded-2xl p-8 shadow border border-brand-navy/5 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${p.color} mb-4`}>
                  {p.tag}
                </span>
                <h3 className="text-xl font-display font-bold text-brand-navy mb-3">{p.title}</h3>
                <p className="text-brand-navy/75 leading-relaxed text-sm">{p.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-brand-navy/70 mb-6">¿Quieres apoyar algún programa específico?</p>
            <Link href="/donar" className="btn-primary">Donar a un programa</Link>
          </div>
        </div>
      </section>
    </>
  );
}
