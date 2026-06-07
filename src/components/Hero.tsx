import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="hero-bg relative overflow-hidden">
      <div className="container-page py-16 md:py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/15 text-brand-gold-light text-sm font-semibold mb-6">
            Desarrollo personal integral
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
            <span className="text-brand-navy">Libera tu mente,</span>
            <br />
            <span className="gradient-text">transforma tu vida.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 leading-relaxed max-w-xl">
            En la <strong className="text-brand-navy">Fundación Pensamiento Libre</strong>{' '}
            acompañamos a las personas en su camino de bienestar mental, educación
            consciente y crecimiento humano.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/donar" className="btn-primary">
              Quiero donar
              <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-6-6l6 6-6 6"/>
              </svg>
            </Link>
            <Link href="/programas" className="btn-outline">
              Ver nuestros programas
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 max-w-md">
            <div>
              <dt className="text-sm text-brand-navy/60">Personas apoyadas</dt>
              <dd className="text-2xl md:text-3xl font-bold text-brand-navy">+2.500</dd>
            </div>
            <div>
              <dt className="text-sm text-brand-navy/60">Programas activos</dt>
              <dd className="text-2xl md:text-3xl font-bold text-brand-navy">12</dd>
            </div>
            <div>
              <dt className="text-sm text-brand-navy/60">Voluntarios</dt>
              <dd className="text-2xl md:text-3xl font-bold text-brand-navy">+80</dd>
            </div>
          </dl>
        </div>

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
    </section>
  );
}
