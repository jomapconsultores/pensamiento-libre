import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { DonationTabs } from '@/components/DonationTabs';

export const metadata: Metadata = {
  title: 'Donar | Fundación Pensamiento Libre',
  description:
    'Apoya nuestros programas de salud mental, educación y desarrollo personal. Donaciones únicas, recurrentes o paquetes de impacto directo en Cuenca, Ecuador.',
};

const STATS = [
  { number: '+2.500', label: 'Personas beneficiadas' },
  { number: '12', label: 'Programas activos' },
  { number: '+80', label: 'Voluntarios' },
  { number: '100%', label: 'Transparencia' },
];

const IMPACT_STORIES = [
  {
    photo: 'https://randomuser.me/api/portraits/women/22.jpg',
    program: 'Salud Mental',
    programColor: 'bg-brand-sky/15 text-brand-sky',
    quote:
      '"Gracias al programa psicológico pude superar la ansiedad que me tenía paralizada. Hoy vivo con libertad y acompaño a otros."',
    author: 'María F.',
    role: 'Beneficiaria — programa de salud mental',
  },
  {
    photo: 'https://randomuser.me/api/portraits/men/15.jpg',
    program: 'Becas Educativas',
    programColor: 'bg-brand-gold/15 text-brand-gold',
    quote:
      '"La beca de la Fundación me permitió terminar mis estudios cuando pensé que no podía. Hoy tengo trabajo y una carrera."',
    author: 'Carlos M.',
    role: 'Beneficiario — beca estudiantil',
  },
  {
    photo: 'https://randomuser.me/api/portraits/women/56.jpg',
    program: 'Talleres',
    programColor: 'bg-brand-green/15 text-brand-green',
    quote:
      '"Los talleres de inteligencia emocional cambiaron la forma en que me relaciono con mi familia y conmigo misma."',
    author: 'Ana L.',
    role: 'Participante — talleres comunitarios',
  },
];

const TRUST_ITEMS = [
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
    color: 'text-brand-gold bg-brand-gold/10',
    title: 'Pago 100% seguro',
    desc: 'Cifrado SSL por Stripe',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    ),
    color: 'text-brand-sky bg-brand-sky/10',
    title: 'Fundación legal',
    desc: 'Resolución MINEDEC-CZ6-2025-01466-R',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
    color: 'text-brand-green bg-brand-green/10',
    title: 'Recibo inmediato',
    desc: 'Comprobante enviado por email',
  },
];

export default function DonarPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-bg py-20 md:py-28">
        <div className="container-page text-center max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/15 text-brand-gold font-semibold text-sm mb-6 border border-brand-gold/20">
            Tu aporte transforma vidas reales
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy leading-tight">
            Cada donación es
            <br />
            <span className="gradient-text">una mente liberada</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto leading-relaxed">
            Con tu apoyo financiamos consultas psicológicas, becas educativas, talleres
            comunitarios y programas de desarrollo personal que llegan a quienes más los
            necesitan en Cuenca y Ecuador.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a href="#donar-ahora" className="btn-primary">
              Donar ahora
              <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14m7-7H5" />
              </svg>
            </a>
            <Link href="/membresias" className="btn-outline">
              Hacerme miembro mensual
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-10 bg-brand-navy">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold text-brand-gold">{s.number}</p>
                <p className="text-sm text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DONATION SECTION */}
      <section id="donar-ahora" className="py-20">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 border border-brand-gold/20">
              Elige cómo quieres impactar
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-navy">
              Donación libre o paquetes de impacto
            </h2>
            <p className="mt-4 text-brand-navy/70 max-w-2xl mx-auto">
              Dona el monto que prefieras o elige un{' '}
              <strong>paquete de impacto directo</strong> para financiar una clase, taller,
              consulta psicológica o beca específica.
            </p>
          </div>
          <DonationTabs />
        </div>
      </section>

      {/* IMPACT STORIES */}
      <section className="py-20 bg-brand-cream/40">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold font-semibold text-sm border border-brand-gold/20 mb-4">
              Historias reales
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-navy">
              Tu donación tiene nombre y apellido
            </h2>
            <p className="section-subtitle mt-4">
              Detrás de cada dólar hay una persona que recuperó su bienestar, una familia que encontró apoyo o un joven que pudo seguir estudiando.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {IMPACT_STORIES.map((story, i) => (
              <blockquote
                key={i}
                className="bg-white rounded-2xl shadow-md border border-brand-navy/5 hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
              >
                {/* Photo */}
                <div className="relative h-44 flex-shrink-0">
                  <Image
                    src={story.photo}
                    alt={story.author}
                    fill
                    className="object-cover object-[center_15%]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
                  <span className={`absolute bottom-3 left-4 text-xs font-semibold px-2.5 py-1 rounded-full ${story.programColor}`}>
                    {story.program}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-brand-navy/80 leading-relaxed mb-5 italic text-sm flex-1">
                    {story.quote}
                  </p>
                  <footer className="border-t border-brand-navy/8 pt-4 flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-gold/30">
                      <Image src={story.photo} alt={story.author} fill className="object-cover" sizes="36px" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-navy">{story.author}</p>
                      <p className="text-xs text-brand-navy/50">{story.role}</p>
                    </div>
                  </footer>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="py-16">
        <div className="container-page max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-lg border border-brand-navy/5 text-center">
            <h3 className="text-2xl font-display font-bold text-brand-navy mb-8">
              Tu donación es segura y transparente
            </h3>
            <div className="grid sm:grid-cols-3 gap-8">
              {TRUST_ITEMS.map((item) => (
                <div key={item.title} className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${item.color}`}>
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <p className="font-bold text-brand-navy">{item.title}</p>
                  <p className="text-sm text-brand-navy/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="container-page text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            ¿Prefieres apoyarnos mensualmente?
          </h2>
          <p className="text-white/75 mb-8 text-lg leading-relaxed">
            Con una membresía mensual sostienes nuestra labor de forma continua y accedes a
            beneficios exclusivos como charlas, talleres y contenido especializado.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/membresias" className="btn-primary">
              Ver planes de membresía
            </Link>
            <Link
              href="/contacto"
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20 font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Tengo preguntas
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
