import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre nosotros | Fundación Pensamiento Libre',
  description:
    'Conoce nuestra historia, equipo y propósito. Una fundación dedicada al desarrollo personal integral.',
};

export default function SobreNosotrosPage() {
  return (
    <>
      <section className="hero-bg py-20">
        <div className="container-page text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy">
            Sobre nosotros
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto">
            Nacemos del deseo de construir una sociedad más consciente, libre y compasiva.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-navy">
              Nuestra historia
            </h2>
            <p className="mt-6 text-brand-navy/75 leading-relaxed">
              La Fundación Pensamiento Libre nació en 2018 como respuesta a una necesidad
              urgente: ofrecer espacios donde las personas pudieran reconectar con su
              esencia y desarrollar todo su potencial humano.
            </p>
            <p className="mt-4 text-brand-navy/75 leading-relaxed">
              Lo que comenzó como un pequeño grupo de profesionales comprometidos hoy es
              una red de psicólogos, educadores, voluntarios y donantes que sostienen
              programas en distintas comunidades.
            </p>
            <p className="mt-4 text-brand-navy/75 leading-relaxed">
              Creemos que la salud mental, la educación consciente y el crecimiento
              personal son derechos, no privilegios. Por eso trabajamos cada día para
              hacerlos accesibles a quienes más lo necesitan.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-sky/20 to-brand-gold/20 rounded-3xl blur-2xl" />
            <Image
              src="/logo.png"
              alt="Logo"
              width={500}
              height={500}
              className="relative w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-cream/40">
        <div className="container-page">
          <h2 className="section-title font-display">Pilares de nuestro trabajo</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Mente',
                description:
                  'Promovemos salud mental accesible y desestigmatizada para todas las personas.',
              },
              {
                title: 'Conocimiento',
                description:
                  'Impulsamos una educación que invita a pensar por sí mismo, con criterio y compasión.',
              },
              {
                title: 'Comunidad',
                description:
                  'Tejemos redes de apoyo donde el crecimiento personal se nutre del encuentro con otros.',
              },
            ].map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-8 shadow border border-brand-navy/5">
                <h3 className="text-xl font-display font-bold text-brand-navy mb-3">{p.title}</h3>
                <p className="text-brand-navy/70 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page text-center max-w-3xl mx-auto">
          <h2 className="section-title font-display">Únete a la transformación</h2>
          <p className="section-subtitle">
            Hay muchas formas de ser parte: como voluntario, como donante o como aliado.
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
