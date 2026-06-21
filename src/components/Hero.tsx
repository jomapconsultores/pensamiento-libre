import Link from 'next/link';
import Image from 'next/image';

const STATS = [
  { number: '+2.500', label: 'Personas impactadas', icon: '🧠' },
  { number: '12', label: 'Programas activos', icon: '📚' },
  { number: '+80', label: 'Voluntarios activos', icon: '🤝' },
  { number: '100%', label: 'Transparencia total', icon: '✅' },
];

const FLOATING_TAGS = [
  { label: 'Salud Mental', color: 'bg-brand-sky/90 text-white', pos: 'top-4 left-0' },
  { label: 'Becas Educativas', color: 'bg-brand-gold text-brand-navy', pos: 'top-1/3 -right-4' },
  { label: 'Talleres', color: 'bg-white/90 text-brand-navy', pos: 'bottom-8 left-4' },
  { label: 'Voluntariado', color: 'bg-brand-navy-dark/90 text-white border border-white/20', pos: 'bottom-1/4 -right-2' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-navy">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-sky/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-gold/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-brand-sky/5 rounded-full blur-2xl" />
        {/* Diagonal grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="container-page relative py-16 md:py-24 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT — COPY */}
        <div>
          {/* Social proof pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
            <div className="flex -space-x-1.5">
              {['🧑‍🎓', '👩‍💼', '👨‍🏫'].map((e, i) => (
                <span key={i} className="w-6 h-6 rounded-full bg-brand-gold/30 border border-white/30 flex items-center justify-center text-xs">
                  {e}
                </span>
              ))}
            </div>
            <span className="text-white/90 text-sm font-medium">
              +2.500 personas ya transformaron su vida
            </span>
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] text-white">
            Construye un Ecuador mejor
            <br />
            <span className="text-brand-gold">mente a mente.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 leading-relaxed max-w-xl">
            La <strong className="text-white">Fundación Pensamiento Libre</strong> acompaña a
            personas y comunidades con salud mental, educación consciente y crecimiento humano —
            desde $10 puedes ser parte del cambio.
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/donar"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-gold text-brand-navy font-bold text-base shadow-lg shadow-brand-gold/25 hover:bg-yellow-400 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              💛 Quiero donar ahora
            </Link>
            <Link
              href="/membresias"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white font-semibold text-base border border-white/25 hover:bg-white/20 hover:-translate-y-0.5 transition-all backdrop-blur-sm"
            >
              🌱 Hacerme miembro · $10/mes
            </Link>
          </div>

          {/* Secondary CTA */}
          <div className="mt-4 flex items-center gap-4">
            <Link
              href="/programas"
              className="text-white/60 hover:text-white/90 transition-colors text-sm flex items-center gap-1.5"
            >
              Ver todos los programas
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
            </Link>
            <span className="text-white/20">·</span>
            <Link
              href="/servicios"
              className="text-white/60 hover:text-white/90 transition-colors text-sm"
            >
              Servicios profesionales
            </Link>
          </div>

          {/* Stats */}
          <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center hover:bg-white/10 transition-colors"
              >
                <div className="text-xl mb-1">{s.icon}</div>
                <dd className="text-2xl font-bold text-brand-gold">{s.number}</dd>
                <dt className="text-xs text-white/55 mt-1 leading-tight">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* RIGHT — LOGO with floating tags */}
        <div className="relative flex items-center justify-center min-h-[360px]">
          {/* Glow behind logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-60 h-60 bg-brand-sky/10 rounded-full blur-2xl" />
          </div>

          {/* Logo */}
          <div className="relative z-10 animate-fly">
            <Image
              src="/logo.png"
              alt="Logo Fundación Pensamiento Libre"
              width={500}
              height={500}
              priority
              className="w-full max-w-xs md:max-w-sm lg:max-w-md h-auto drop-shadow-2xl"
            />
          </div>

          {/* Floating program tags */}
          {FLOATING_TAGS.map((tag) => (
            <span
              key={tag.label}
              className={`absolute ${tag.pos} ${tag.color} text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm z-20 hidden md:block`}
            >
              {tag.label}
            </span>
          ))}

          {/* Legal badge */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-center backdrop-blur-sm z-20 hidden lg:block">
            <p className="text-white/90 text-xs font-semibold">Personería jurídica otorgada por</p>
            <p className="text-brand-gold text-xs font-bold">Ministerio de Educación · Resolución 2025</p>
          </div>
        </div>
      </div>

      {/* BOTTOM STRIP — valores on dark */}
      <div className="border-t border-white/8 bg-brand-navy-dark/50 backdrop-blur-sm">
        <div className="container-page py-3.5 flex flex-wrap gap-x-8 gap-y-2 justify-center items-center">
          {[
            { label: 'Salud Mental', icon: '🧠' },
            { label: 'Educación Consciente', icon: '📚' },
            { label: 'Desarrollo Personal', icon: '🌱' },
            { label: 'Cultura Física', icon: '🏃' },
            { label: 'Inclusión Social', icon: '🤝' },
          ].map((v) => (
            <span key={v.label} className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
              <span>{v.icon}</span>
              {v.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
