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
      'Creación y administración de instituciones educativas en niveles de Educación Inicial, Educación General Básica (EGB) y Bachillerato en Ciencias y Técnico, en modalidades presencial, semipresencial, a distancia y virtual.',
  },
  {
    letra: 'B',
    title: 'Educación Superior y Formación Continua',
    icon: '🎓',
    description:
      'Diseño y ejecución de programas de Formación Continua y Capacitación Profesional (cursos, talleres, seminarios). Gestión de convenios con universidades nacionales e internacionales e impulso de institutos superiores tecnológicos.',
  },
  {
    letra: 'C',
    title: 'Desarrollo Psicológico y Bienestar',
    icon: '🧠',
    description:
      'Establece Departamentos de Consejería Estudiantil (DECE) y Gabinetes Psicopedagógicos para diagnóstico, terapia, orientación vocacional y soporte socioemocional. Implementa programas de prevención de riesgos psicosociales y escuelas para padres.',
  },
  {
    letra: 'D',
    title: 'Cultura Física, Deporte y Recreación',
    icon: '⚽',
    description:
      'Fomenta la Educación Física y el Deporte Recreativo como herramientas pedagógicas para el desarrollo del carácter, mediante clubes formativos, escuelas deportivas extracurriculares y campamentos vacacionales.',
  },
  {
    letra: 'E',
    title: 'Inclusión Intergeneracional',
    icon: '👴👶',
    description:
      'Programas de Gerontagogía (educación para adultos mayores), alfabetización digital, gimnasia cerebral y terapia ocupacional. Centros de desarrollo infantil y estimulación temprana para primera infancia.',
  },
];

const DIRECTIVA = [
  {
    cargo: 'Presidente',
    nombre: 'Marco Antonio Posligua San Martín',
  },
  {
    cargo: 'Secretaria / Tesorera',
    nombre: 'Johanna Maricela Nievecela Lema',
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
            <p className="mt-6 text-brand-navy/75 leading-relaxed">
              La <strong>Fundación Pensamiento Libre</strong> es una persona jurídica de derecho
              privado, sin fines de lucro, constituida en la ciudad de <strong>Cuenca, Cantón
              Cuenca, Provincia del Azuay</strong> (Calles Las Palmeras 177 y Casuarina). Sus
              estatutos fueron aprobados por la asamblea fundadora el <strong>20 de noviembre de
              2025</strong>.
            </p>
            <p className="mt-4 text-brand-navy/75 leading-relaxed">
              El Ministerio de Educación, Deporte y Cultura otorgó la <strong>personalidad
              jurídica</strong> mediante <strong>Resolución Nro. MINEDEC-CZ6-2025-01466-R</strong> el
              29 de diciembre de 2025, y registró a su directiva electa mediante Oficio
              Nro. MINEDEC-CZ6-2026-00029-OF el 13 de enero de 2026, para el período
              comprendido desde el 29 de diciembre de 2025 hasta el 29 de diciembre de 2029.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-sky/20 to-brand-gold/20 rounded-3xl blur-2xl" />
            <Image
              src="/logo.png"
              alt="Logo Fundación Pensamiento Libre"
              width={500}
              height={500}
              className="relative w-full max-w-md mx-auto"
            />
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

      {/* ── DIRECTIVA ── */}
      <section className="py-16 bg-brand-cream/40">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 border border-brand-gold/20">
              Directiva 2025 – 2029
            </span>
            <h2 className="section-title font-display">Quiénes nos lideran</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto">
            {DIRECTIVA.map((d) => (
              <div
                key={d.cargo}
                className="bg-white rounded-2xl px-10 py-8 shadow border border-brand-navy/5 text-center flex-1 min-w-[220px]"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-navy/10 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <p className="font-display font-bold text-brand-navy text-lg leading-tight">{d.nombre}</p>
                <p className="text-brand-gold font-semibold text-sm mt-1">{d.cargo}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-brand-navy/40 text-xs mt-8">
            Registrado mediante Oficio Nro. MINEDEC-CZ6-2026-00029-OF · Período 29/12/2025 — 29/12/2029
          </p>
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
                <dd className="text-brand-navy/80">Las Palmeras 177 y Casuarina, Cuenca, Azuay, Ecuador</dd>
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

      {/* ── CTA ── */}
      <section className="py-20 bg-brand-cream/40">
        <div className="container-page text-center max-w-3xl mx-auto">
          <h2 className="section-title font-display">Únete a la transformación</h2>
          <p className="section-subtitle">
            Hay muchas formas de ser parte: como voluntario, como donante o como aliado estratégico.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/donar" className="btn-primary">Quiero donar</Link>
            <Link href="/contacto" className="btn-outline">Quiero ser voluntario</Link>
          </div>
        </div>
      </section>
    </>
  );
}
