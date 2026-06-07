import Link from 'next/link';

export function DonateCTA() {
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-navy-dark to-brand-navy p-10 md:p-16 text-white text-center shadow-2xl">
          <div className="absolute inset-0 opacity-20" aria-hidden>
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-sky rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
              Tu aporte libera mentes.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-white/85">
              Con cada donación, financiamos consultas psicológicas, becas educativas
              y programas comunitarios. <strong>Súmate al cambio.</strong>
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donar" className="btn-primary">
                Donar ahora
              </Link>
              <Link href="/membresias" className="bg-white text-brand-navy hover:bg-brand-cream font-semibold px-6 py-3 rounded-full transition-colors">
                Hacerme miembro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
