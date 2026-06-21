import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre nosotros | Fundación Pensamiento Libre',
  description:
    'Fundación Pensamiento Libre — persona jurídica sin fines de lucro con domicilio en Cuenca, Azuay, Ecuador. Personería jurídica otorgada por el Ministerio de Educación, Deporte y Cultura mediante Resolución MINEDEC-CZ6-2025-01466-R.',
};

const EJES = [
  {
    letra: 'A',
    title: 'Educación Formal y Regular',
    icon: '🏫',
    description:
      'Creación y administración de instituciones educativas en niveles de Educación Inicial, EGB y Bachillerato, en modalidades presencial, semipresencial, a distancia y virtual.',
  },
  {
    letra: 'B',
    title: 'Educación Superior y Formación Continua',
    icon: '🎓',
    description:
      'Diseño y ejecución de cursos, talleres y seminarios de capacitación profesional. Convenios con universidades nacionales e internacionales.',
  },
  {
    letra: 'C',
    title: 'Desarrollo Psicológico y Bienestar',
    icon: '🧠',
    description:
      'Consejería estudiantil (DECE), gabinetes psicopedagógicos, orientación vocacional, soporte socioemocional y prevención de riesgos psicosociales.',
  },
];

export default function SobreNosotrosPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-bg py-20">
        <div className="container-page text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy">
            Sobre nosotros
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto">
            Una fundación legalmente constituida que promueve el desarrollo humano integral
            a través de la educación, la salud mental y la cultura física.
          </p>
        </div>
      </section>

      {/* ── HISTORIA / CONSTITUCIÓN ── */}
      <section className="py-20">
        <div className="container-page grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 border border-brand-gold/20">
              Historia y constitución
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-navy">
              Fundación Pensamiento Libre
            </h2>
            <p className="mt-6 text-brand-navy/75 leading-relaxed text-justify">
              La <strong>Fundación Pensamiento Libre</strong> es una persona jurídica de derecho
              privado sin fines de lucro, constituida en <strong>Cuenca, Azuay</strong>, con
              estatutos aprobados el <strong>20 de noviembre de 2025</strong>.
            </p>
            <p className="mt-4 text-brand-navy/75 leading-relaxed text-justify">
              El Ministerio de Educación, Deporte y Cultura otorgó la personería jurídica
              mediante <strong>Resolución MINEDEC-CZ6-2025-01466-R</strong> (29 dic. 2025),
              con directiva registrada para el período 2025 – 2029.
            </p>
          </div>
          <div className="relative flex flex-col items-center gap-6">
            {/* Horizontal logo */}
            <div className="relative w-full rounded-3xl overflow-hidden bg-white shadow-2xl p-8 border border-brand-navy/8">
              <Image
                src="/logo-horizontal.jpg"
                alt="Logo Fundación Pensamiento Libre"
                width={600}
                height={225}
                className="w-full h-auto"
                priority
              />
            </div>
            {/* Community photo below */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-xl aspect-video">
              <Image
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&h=400&fit=crop&q=80"
                alt="Comunidad Fundación Pensamiento Libre"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="inline-block px-3 py-1.5 rounded-full bg-brand-gold text-brand-navy text-xs font-bold">
                  Personería jurídica · Ministerio de Educación 2025
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISIÓN ── */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="container-page text-center max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-brand-gold text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
            Misión institucional
          </span>
          <blockquote className="text-xl md:text-2xl font-display leading-relaxed text-white/90">
            "Promover el desarrollo humano integral a lo largo de todo el ciclo vital
            — niños, adolescentes, adultos y adultos mayores — mediante la gestión de
            servicios de excelencia en educación, capacitación, salud mental y cultura
            física, utilizando metodologías presenciales y virtuales."
          </blockquote>
          <p className="mt-4 text-white/50 text-sm">Art. 4 — Estatuto de la Fundación Pensamiento Libre</p>
        </div>
      </section>

      {/* ── EJES / OBJETIVOS ── */}
      <section className="py-20">
        <div className="container-page">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 border border-brand-gold/20">
              Objetivos específicos
            </span>
            <h2 className="section-title font-display">Cinco ejes de acción</h2>
            <p className="section-subtitle">
              En el marco de las competencias del Ministerio de Educación y la normativa conexa,
              la Fundación persigue los siguientes ejes de trabajo (Art. 5 — Estatutos).
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EJES.map((eje) => (
              <div
                key={eje.letra}
                className="bg-white rounded-2xl p-8 shadow border border-brand-navy/5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{eje.icon}</span>
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20">
                    Eje {eje.letra}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-brand-navy">{eje.title}</h3>
                <p className="text-brand-navy/70 leading-relaxed text-sm">{eje.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATOS LEGALES ── */}
      <section className="py-16">
        <div className="container-page max-w-3xl mx-auto">
          <div className="bg-brand-navy/5 rounded-2xl p-8 border border-brand-navy/10">
            <h3 className="font-display font-bold text-brand-navy text-xl mb-6">Datos institucionales</h3>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-brand-gold font-semibold uppercase tracking-wide text-xs mb-1">Nombre oficial</dt>
                <dd className="text-brand-navy/80 font-medium">Fundación Pensamiento Libre</dd>
              </div>
              <div>
                <dt className="text-brand-gold font-semibold uppercase tracking-wide text-xs mb-1">Tipo de organización</dt>
                <dd className="text-brand-navy/80">Persona jurídica de derecho privado sin fines de lucro</dd>
              </div>
              <div>
                <dt className="text-brand-gold font-semibold uppercase tracking-wide text-xs mb-1">Domicilio</dt>
                <dd className="text-brand-navy/80">Cuenca, Azuay, Ecuador</dd>
              </div>
              <div>
                <dt className="text-brand-gold font-semibold uppercase tracking-wide text-xs mb-1">Resolución de personería</dt>
                <dd className="text-brand-navy/80">MINEDEC-CZ6-2025-01466-R (29 dic. 2025)</dd>
              </div>
              <div>
                <dt className="text-brand-gold font-semibold uppercase tracking-wide text-xs mb-1">Organismo de control</dt>
                <dd className="text-brand-navy/80">Ministerio de Educación, Deporte y Cultura — Coordinación Zonal 6</dd>
              </div>
              <div>
                <dt className="text-brand-gold font-semibold uppercase tracking-wide text-xs mb-1">Contacto</dt>
                <dd className="text-brand-navy/80">jomapconsultores@gmail.com</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── CTA TRIPLE ── */}
      <section className="py-20 bg-brand-navy text-white">
        <div className="container-page text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Únete a la transformación
          </h2>
          <p className="text-white/75 mb-10 text-lg max-w-2xl mx-auto">
            Hay muchas formas de ser parte de nuestra misión. Elige la que va mejor contigo.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/donar"
              className="bg-brand-gold text-brand-navy rounded-2xl p-6 hover:bg-brand-gold-light transition-all hover:-translate-y-0.5 hover:shadow-lg text-left"
            >
              <span className="text-2xl block mb-3">💛</span>
              <p className="font-bold text-lg mb-1">Quiero donar</p>
              <p className="text-sm text-brand-navy/70">Desde $10. Elige tu monto o un paquete de impacto.</p>
            </Link>
            <Link
              href="/membresias"
              className="bg-white/10 border border-white/20 text-white rounded-2xl p-6 hover:bg-white/20 transition-all hover:-translate-y-0.5 hover:shadow-lg text-left"
            >
              <span className="text-2xl block mb-3">🌳</span>
              <p className="font-bold text-lg mb-1">Hacerme miembro</p>
              <p className="text-sm text-white/60">Desde $10/mes. Apoyo continuo + beneficios exclusivos.</p>
            </Link>
            <Link
              href="/contacto"
              className="bg-white/10 border border-white/20 text-white rounded-2xl p-6 hover:bg-white/20 transition-all hover:-translate-y-0.5 hover:shadow-lg text-left"
            >
              <span className="text-2xl block mb-3">🤝</span>
              <p className="font-bold text-lg mb-1">Ser voluntario</p>
              <p className="text-sm text-white/60">Suma tu tiempo y talento. Te acompañamos en el proceso.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
