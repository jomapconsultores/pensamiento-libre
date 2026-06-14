'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PARTNERS = [
  {
    name: 'Atlas Centro de Estudios',
    tagline: 'Educación · Psicología · Cursos',
    logo: '/logos/atlas.png',
    bg: 'from-[#1e3a8a] to-[#1e3a6d]',
    accent: '#d4a017',
    url: 'https://atlas-sistema.onrender.com',
  },
  {
    name: 'CAPSA Consultoría',
    tagline: 'Capacitaciones · Asesoría · Resultados',
    logo: '/logos/capsa.png',
    bg: 'from-[#1a1a1a] to-[#2d2d2d]',
    accent: '#f59e0b',
    url: 'https://jomap-sistema.onrender.com',
  },
  {
    name: 'CMAJ Asociados',
    tagline: 'Tributos · Firma Electrónica · Consultoría',
    logo: '/logos/cmaj.png',
    bg: 'from-[#1e2d40] to-[#2d3e56]',
    accent: '#c9a84c',
    url: 'https://jomap-sistema.onrender.com',
  },
];

export function AliadosPreview() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-b from-white to-brand-cream overflow-hidden"
    >
      <div className="container-page">
        <div
          className="text-center mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 border border-brand-gold/20">
            Ecosistema aliado
          </span>
          <h2 className="section-title mb-4">
            Servicios que potencian tu desarrollo
          </h2>
          <p className="section-subtitle">
            Junto a nuestros aliados estratégicos te ofrecemos un ecosistema completo:
            educación, consultoría y tecnología al servicio de tu crecimiento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PARTNERS.map((p, i) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.6s ease ${i * 150}ms, transform 0.6s ease ${i * 150}ms, box-shadow 0.3s, translateY 0.3s`,
              }}
            >
              <div className={`bg-gradient-to-br ${p.bg} p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden`}>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: p.accent, transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: p.accent, transform: 'translate(-30%, 30%)' }} />

                <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/15 border-2 border-white/30 p-1.5 group-hover:scale-110 transition-transform">
                  <Image
                    src={p.logo}
                    alt={p.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="relative z-10">
                  <p className="font-bold text-white text-lg leading-tight">{p.name}</p>
                  <p className="text-white/60 text-sm mt-1">{p.tagline}</p>
                </div>
              </div>
              <div
                className="px-6 py-3 flex items-center justify-between"
                style={{ background: p.accent }}
              >
                <span className="text-xs font-bold text-black">Visitar plataforma</span>
                <svg
                  className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        <div
          className="text-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease 0.5s',
          }}
        >
          <Link href="/aliados" className="btn-secondary inline-flex items-center gap-2">
            Ver todos los servicios y plataformas
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
