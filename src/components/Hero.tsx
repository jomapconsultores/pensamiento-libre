import Link from 'next/link';
import Image from 'next/image';

const STATS = [
  { number: '+2.500', label: 'Personas apoyadas' },
  { number: '12', label: 'Programas activos' },
  { number: '+80', label: 'Voluntarios' },
];

const TRUST_BADGES = [
  { text: 'Fundación legal · Ecuador', icon: '✅' },
  { text: 'Ministerio de Educación', icon: '🏛️' },
  { text: 'Personería jurídica 2025', icon: '📋' },
];

export function Hero() {
  return (
    <section className="hero-bg relative overflow-hidden">
      <div className="container-page py-16 md:py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT — COPY */}
        <div className="animate-fade-up">
          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TRUST_BADGES.map((b) => (
              <span
                key={b.text}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navy/5 text-brand-navy/70 text-xs font-medium border border-brand-navy/10"
              >
                <span>{b.icon}</span>
                {b.text}
              </span>
            ))}
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/15 text-brand-gold font-semibold text-sm mb-4 border border-brand-gold/20">
            Desarrollo personal integral
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
            <span className="text-brand-navy">Libera tu mente,</span>
            <br />
            <span className="gradient-text">transforma tu vida.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 leading-relaxed max-w-xl">
            En la <strong className="text-brand-navy">Fundación Pensamiento Libre</strong>{' '}
            acompañamos a personas y comunidades en salud mental, educación consciente y
            crecimiento humano.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/donar" className="btn-primary text-base py-4 px-8">
              Quiero apoyar
              <svg
                className="ml-2 w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
            </Link>
            <Link href="/programas" className="btn-outline text-base py-4 px-8">
              Ver programas
            </Link>
          </div>

          <p className="mt-4 text-sm text-brand-navy/50">
            También puedes{' '}
            <Link href="/membresias" className="text-brand-gold hover:underline font-medium">
              hacerte miembro mensual
            </Link>{' '}
            desde $10/mes.
          </p>

          {/* Stats */}
          <dl className="mt-12 grid grid-cols-3 gap-4 max-w-md">
            {STATS.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <dd className="text-2xl md:text-3xl font-bold text-brand-navy">{s.number}</dd>
                <dt className="text-xs text-brand-navy/60 mt-1">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* RIGHT — LOGO */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-sky/20 via-transparent to-brand-gold/20 rounded-full blur-3xl" />
          <div className="relative animate-fly">
            <Image
              src="/logo.png"
              alt="Logo Fundación Pensamiento Libre"
              width={560}
              height={560}
              priority
              className="w-full max-w-md lg:max-w-lg h-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM STRIP — valores */}
      <div className="border-t border-brand-navy/8 bg-white/50 backdrop-blur-sm">
        <div className="container-page py-4 flex flex-wrap gap-6 justify-center items-center">
          {['Salud Mental', 'Educación Consciente', 'Desarrollo Personal', 'Cultura Física', 'Inclusión'].map(
            (v) => (
              <span key={v} className="text-xs font-semibold text-brand-navy/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold inline-block" />
                {v}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
