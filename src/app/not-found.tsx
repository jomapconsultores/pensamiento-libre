import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <section className="hero-bg py-24">
      <div className="container-page text-center max-w-2xl mx-auto">
        <Image
          src="/logo.png"
          alt="Logo"
          width={120}
          height={120}
          className="mx-auto mb-6 opacity-60"
        />
        <p className="text-6xl font-display font-bold text-brand-gold mb-2">404</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-navy">
          Esta página voló libre.
        </h1>
        <p className="mt-6 text-lg text-brand-navy/70">
          La dirección que buscas no existe o fue movida. Pero hay mucho que descubrir en
          el sitio.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/" className="btn-secondary">Volver al inicio</Link>
          <Link href="/programas" className="btn-outline">Ver programas</Link>
        </div>
      </div>
    </section>
  );
}
