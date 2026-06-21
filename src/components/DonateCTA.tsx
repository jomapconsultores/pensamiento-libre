import Link from 'next/link';

const OPTIONS = [
  {
    emoji: '💛',
    title: 'Donación única',
    desc: 'Desde $10. Elige el monto que puedes dar hoy.',
    href: '/donar',
    style: 'bg-white text-brand-navy hover:bg-brand-cream',
  },
  {
    emoji: '🎁',
    title: 'Paquetes de impacto',
    desc: 'Clases, talleres, consultas y becas con impacto específico.',
    href: '/donar',
    style: 'bg-white text-brand-navy hover:bg-brand-cream',
  },
  {
    emoji: '🌳',
    title: 'Membresía mensual',
    desc: 'Desde $10/mes. Apoyo continuo y beneficios exclusivos.',
    href: '/membresias',
    style: 'bg-brand-gold text-brand-navy hover:bg-brand-gold-light',
  },
];

export function DonateCTA() {
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-navy-dark to-brand-navy p-10 md:p-16 text-white shadow-2xl">
          {/* Decorative blobs */}
          <div className="absolute inset-0 opacity-20" aria-hidden>
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-sky rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/20 text-brand-gold-light text-xs font-bold uppercase tracking-widest mb-6 border border-brand-gold/30">
              Únete al cambio
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
              Tu aporte libera mentes
              <br />
              <span className="text-brand-gold-light">y transforma comunidades.</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Hay muchas formas de sumar. Desde una donación única hasta una membresía mensual,
              cada gesto cuenta y tiene un impacto real medible.
            </p>

            {/* Options grid */}
            <div className="mt-12 grid sm:grid-cols-3 gap-4">
              {OPTIONS.map((opt) => (
                <Link
                  key={opt.title}
                  href={opt.href}
                  className={`rounded-2xl p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${opt.style}`}
                >
                  <span className="text-2xl block mb-3">{opt.emoji}</span>
                  <p className="font-bold text-base mb-1">{opt.title}</p>
                  <p className="text-sm opacity-75">{opt.desc}</p>
                </Link>
              ))}
            </div>

            {/* Volunteer link */}
            <p className="mt-8 text-white/60 text-sm">
              También puedes sumar como voluntario.{' '}
              <Link href="/contacto" className="text-brand-gold-light hover:text-brand-gold font-semibold underline-offset-2 hover:underline">
                Escríbenos aquí →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
