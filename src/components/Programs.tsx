import Image from 'next/image';
import Link from 'next/link';

const programs = [
  {
    title: 'Salud mental comunitaria',
    description:
      'Consultas psicológicas, grupos de apoyo y talleres preventivos accesibles para personas de bajos recursos.',
    photo: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=700&q=85',
    photoPos: 'object-center',
    photoAlt: 'Grupo de apoyo de salud mental en sesión comunitaria',
    accent: 'bg-brand-sky',
    accentText: 'text-brand-sky',
    donateAmount: 35,
  },
  {
    title: 'Educación consciente',
    description:
      'Talleres, conferencias y formación continua en pensamiento crítico, neurodesarrollo y aprendizaje significativo.',
    photo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=85',
    photoPos: 'object-center',
    photoAlt: 'Estudiantes en un taller de educación consciente',
    accent: 'bg-brand-gold',
    accentText: 'text-brand-gold',
    donateAmount: 25,
  },
  {
    title: 'Desarrollo personal',
    description:
      'Coaching, mentoría y programas de transformación para potenciar tu propósito de vida y bienestar integral.',
    photo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=700&q=85',
    photoPos: 'object-[center_30%]',
    photoAlt: 'Grupo en taller de desarrollo personal y coaching',
    accent: 'bg-brand-green',
    accentText: 'text-brand-green',
    donateAmount: 50,
  },
  {
    title: 'Voluntariado social',
    description:
      'Acompañamos a comunidades vulnerables con voluntarios formados que multiplican el impacto en territorio.',
    photo: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=700&q=85',
    photoPos: 'object-center',
    photoAlt: 'Voluntarios trabajando juntos en la comunidad',
    accent: 'bg-brand-navy',
    accentText: 'text-brand-navy',
    donateAmount: 10,
  },
];

export function Programs() {
  return (
    <section id="programas" className="py-20">
      <div className="container-page">
        <h2 className="section-title font-display">Nuestros programas</h2>
        <p className="section-subtitle">
          Iniciativas que conectan ciencia, conciencia y comunidad para impulsar el desarrollo
          personal integral en toda la familia.
        </p>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((p) => (
            <article
              key={p.title}
              className="rounded-2xl overflow-hidden shadow-md border border-brand-navy/5 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col bg-white"
            >
              {/* Photo header */}
              <div className="relative h-52 flex-shrink-0 overflow-hidden">
                <Image
                  src={p.photo}
                  alt={p.photoAlt}
                  fill
                  className={`object-cover ${p.photoPos}`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-brand-navy/10 to-transparent" />
                <span className={`absolute bottom-3 left-4 w-2.5 h-2.5 rounded-full ${p.accent} ring-2 ring-white`} />
              </div>
              {/* Card body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-brand-navy mb-2">{p.title}</h3>
                <p className="text-sm text-brand-navy/70 leading-relaxed flex-1">{p.description}</p>
                <Link
                  href="/donar"
                  className={`mt-5 text-xs font-bold ${p.accentText} hover:opacity-70 flex items-center gap-1 transition-opacity`}
                >
                  Apoyar desde ${p.donateAmount}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center flex flex-wrap gap-4 justify-center">
          <Link href="/programas" className="btn-secondary">
            Ver todos los programas
          </Link>
          <Link href="/donar" className="btn-primary">
            Apoyar un programa
          </Link>
        </div>
      </div>
    </section>
  );
}
