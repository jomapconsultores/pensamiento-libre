'use client';

import { useState } from 'react';
import Image from 'next/image';

/* ── SOCIAL ICONS ── */

const SOCIAL_ICONS = {
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.52V6.78a4.85 4.85 0 01-1.02-.09z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  web: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx={12} cy={12} r={10} />
      <line x1={2} y1={12} x2={22} y2={12} />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

type SocialKey = keyof typeof SOCIAL_ICONS;
type Social = { name: string; url: string; icon: SocialKey };

/* ── PLATFORM LINKS (expandable at top) ── */

const PLATFORMS = [
  {
    name: 'Sistema Atlas',
    label: 'Atlas Centro de Estudios',
    url: 'https://atlas-sistema.onrender.com',
    logo: '/logos/atlas.png',
    bg: '#1e3a8a',
    accent: '#d4a017',
    desc: 'Educación · Psicología · Nivelación académica',
  },
  {
    name: 'Portal JOMAP',
    label: 'CAPSA Consultoría',
    url: 'https://jomap-sistema.onrender.com',
    logo: '/logos/capsa.png',
    bg: '#1a1a1a',
    accent: '#f59e0b',
    desc: 'Capacitaciones · Tributos · Consultoría institucional',
  },
  {
    name: 'Tributos Web',
    label: 'Tributos Web',
    url: 'https://tributos-web.onrender.com',
    logo: '/logos/cmaj.png',
    bg: '#064e3b',
    accent: '#34d399',
    desc: 'Declaraciones · Gestión SRI · 100% online',
  },
  {
    name: 'Calendarios MAP',
    label: 'Calendarios MAP',
    url: 'https://calendarios-map.onrender.com',
    logo: '/logos/capsa.png',
    bg: '#312e81',
    accent: '#a5b4fc',
    desc: 'Agendas · Citas · Coordinación de equipos',
  },
];

/* ── COMPANY CARDS ── */

type Company = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  bgFrom: string;
  bgTo: string;
  accent: string;
  url: string;
  platformLabel: string;
  contact: { label: string; value: string; href: string }[];
  socials: Social[];
};

const COMPANIES: Company[] = [
  {
    id: 'atlas',
    name: 'Atlas Centro de Estudios',
    tagline: 'Carga el conocimiento, conquista el futuro',
    description:
      'Centro educativo con programas de nivelación académica, preparación preuniversitaria, psicología clínica y cursos especializados. Formamos estudiantes y profesionales con metodologías innovadoras y enfoque personalizado.',
    logo: '/logos/atlas.png',
    bgFrom: '#1e3a8a',
    bgTo: '#1e3a6d',
    accent: '#d4a017',
    url: 'https://atlas-sistema.onrender.com',
    platformLabel: 'Acceder a Sistema Atlas',
    contact: [
      { label: 'Email', value: 'atlas.cenest@gmail.com', href: 'mailto:atlas.cenest@gmail.com' },
      { label: 'WhatsApp', value: '+593 99 094 8817', href: 'https://wa.me/593990948817' },
      { label: 'Tarifa individual', value: '$15/hr', href: '' },
      { label: 'Grupos', value: '$12/hr/est.', href: '' },
    ],
    socials: [
      { name: 'Email', url: 'mailto:atlas.cenest@gmail.com', icon: 'email' },
      { name: 'WhatsApp', url: 'https://wa.me/593990948817', icon: 'whatsapp' },
    ],
  },
  {
    id: 'capsa',
    name: 'CAPSA Consultoría',
    tagline: 'Rigor técnico · Pedagogía aplicada · Resultados concretos',
    description:
      'Consultora con más de dos décadas de experiencia en los sectores público, privado y académico. Capacitaciones especializadas, consultoría tributaria e institucional con metodologías probadas.',
    logo: '/logos/capsa.png',
    bgFrom: '#1a1a1a',
    bgTo: '#2d2d2d',
    accent: '#f59e0b',
    url: 'https://jomap-sistema.onrender.com',
    platformLabel: 'Acceder a Portal JOMAP',
    contact: [
      { label: 'Web', value: 'capsaconsultores.info', href: 'https://capsaconsultores.info/' },
      { label: 'WhatsApp', value: 'Escribir ahora', href: 'https://api.whatsapp.com/message/TJEMWHICDY2CP1?autoload=1&app_absent=0' },
    ],
    socials: [
      { name: 'YouTube', url: 'https://www.youtube.com/@capsaconsultores', icon: 'youtube' },
      { name: 'Instagram', url: 'https://www.instagram.com/capsaconsultores/', icon: 'instagram' },
      { name: 'Facebook', url: 'https://www.facebook.com/CAPSAConsultoriaAsesoria', icon: 'facebook' },
      { name: 'TikTok', url: 'https://www.tiktok.com/@capsaconsultores', icon: 'tiktok' },
      { name: 'WhatsApp', url: 'https://api.whatsapp.com/message/TJEMWHICDY2CP1?autoload=1&app_absent=0', icon: 'whatsapp' },
      { name: 'Web', url: 'https://capsaconsultores.info/', icon: 'web' },
    ],
  },
  {
    id: 'cmaj',
    name: 'CMAJ Asociados S.A.S.',
    tagline: 'Tu firma electrónica e impuestos en un solo lugar',
    description:
      'Sociedad por Acciones Simplificada con domicilio en Cuenca, Azuay. Especializada en firma electrónica con entrega inmediata, gestión ante el SRI, asesoría contable-tributaria y formación continua.',
    logo: '/logos/cmaj.png',
    bgFrom: '#1e2d40',
    bgTo: '#2d3e56',
    accent: '#c9a84c',
    url: 'https://jomap-sistema.onrender.com',
    platformLabel: 'Acceder a Portal JOMAP',
    contact: [
      { label: 'Email', value: 'jomapconsultores@outlook.com', href: 'mailto:jomapconsultores@outlook.com' },
      { label: 'WhatsApp', value: '+593 96 351 1411', href: 'https://wa.me/593963511411' },
    ],
    socials: [
      { name: 'Email', url: 'mailto:jomapconsultores@outlook.com', icon: 'email' },
      { name: 'LinkedIn', url: 'https://linkedin.com/company/cmaj-asociados', icon: 'linkedin' },
      { name: 'WhatsApp', url: 'https://wa.me/593963511411', icon: 'whatsapp' },
    ],
  },
  {
    id: 'golden',
    name: 'Golden Gate English Center',
    tagline: 'Aprende inglés de manera diferente',
    description:
      'Centro de inglés con metodología activa, grupos reducidos y preparación para certificaciones internacionales TOEFL y Cambridge. Modalidades presencial y virtual disponibles.',
    logo: '/logos/golden-gate.jpg',
    bgFrom: '#7c2d12',
    bgTo: '#c2410c',
    accent: '#fb923c',
    url: '/golden-gate',
    platformLabel: 'Ver Golden Gate',
    contact: [
      { label: 'WhatsApp', value: '+593 96 305 1347', href: 'https://wa.me/593963051347' },
      { label: 'Email', value: 'jomapconsultores@gmail.com', href: 'mailto:jomapconsultores@gmail.com' },
    ],
    socials: [
      { name: 'WhatsApp', url: 'https://wa.me/593963051347', icon: 'whatsapp' },
      { name: 'Email', url: 'mailto:jomapconsultores@gmail.com', icon: 'email' },
    ],
  },
  {
    id: 'tributos',
    name: 'Tributos Web',
    tagline: 'Cumplimiento tributario online, simple y seguro',
    description:
      'Plataforma digital para la gestión de obligaciones tributarias. Realiza declaraciones, consulta tu estado fiscal y accede a asesoría experta desde cualquier dispositivo.',
    logo: '/logos/cmaj.png',
    bgFrom: '#064e3b',
    bgTo: '#065f46',
    accent: '#34d399',
    url: 'https://tributos-web.onrender.com',
    platformLabel: 'Ir a Tributos Web',
    contact: [
      { label: 'Email', value: 'jomapconsultores@gmail.com', href: 'mailto:jomapconsultores@gmail.com' },
      { label: 'WhatsApp', value: '+593 96 351 1411', href: 'https://wa.me/593963511411' },
    ],
    socials: [
      { name: 'Email', url: 'mailto:jomapconsultores@gmail.com', icon: 'email' },
      { name: 'WhatsApp', url: 'https://wa.me/593963511411', icon: 'whatsapp' },
    ],
  },
  {
    id: 'calendarios',
    name: 'Calendarios MAP',
    tagline: 'Organiza, agenda y coordina con precisión',
    description:
      'Sistema inteligente de gestión de calendarios y agendamiento profesional. Coordina citas, eventos y reuniones corporativas de forma eficiente y sincronizada.',
    logo: '/logos/capsa.png',
    bgFrom: '#312e81',
    bgTo: '#4338ca',
    accent: '#a5b4fc',
    url: 'https://calendarios-map.onrender.com',
    platformLabel: 'Ir a Calendarios MAP',
    contact: [
      { label: 'Email', value: 'jomapconsultores@gmail.com', href: 'mailto:jomapconsultores@gmail.com' },
      { label: 'WhatsApp', value: '+593 96 351 1411', href: 'https://wa.me/593963511411' },
    ],
    socials: [
      { name: 'Email', url: 'mailto:jomapconsultores@gmail.com', icon: 'email' },
      { name: 'WhatsApp', url: 'https://wa.me/593963511411', icon: 'whatsapp' },
    ],
  },
];

/* ── EXPANDABLE PLATFORMS BAR ── */

function PlatformsBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-brand-navy/5 border-b border-brand-navy/10">
      <div className="container-page">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-brand-gold/15 flex items-center justify-center text-sm">🌐</span>
            <span className="font-bold text-brand-navy text-sm">Plataformas en línea</span>
            <span className="text-xs text-brand-navy/50 hidden sm:inline">— Accede directamente a nuestros sistemas digitales</span>
          </div>
          <svg
            className={`w-5 h-5 text-brand-navy/60 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="pb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PLATFORMS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-3 p-4 rounded-xl border border-brand-navy/10 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: p.bg }}
                >
                  <Image
                    src={p.logo}
                    alt={p.label}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-brand-navy text-sm truncate">{p.label}</p>
                  <p className="text-xs text-brand-navy/50 truncate">{p.desc}</p>
                </div>
                <svg
                  className="w-4 h-4 text-brand-navy/30 group-hover:text-brand-gold flex-shrink-0 transition-colors ml-auto"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── COMPANY CARD ── */

function CompanyCard({ company }: { company: Company }) {
  return (
    <article className="bg-white rounded-3xl shadow-lg border border-brand-navy/5 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col">
      {/* Card header with gradient */}
      <div
        className="p-6 flex items-start gap-4"
        style={{
          background: `linear-gradient(135deg, ${company.bgFrom}, ${company.bgTo})`,
        }}
      >
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/15 border-2 border-white/30 p-1.5 flex-shrink-0">
          <Image
            src={company.logo}
            alt={company.name}
            width={64}
            height={64}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg leading-tight">{company.name}</h3>
          <p className="text-white/60 text-xs mt-1 italic">{company.tagline}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1">
        <p className="text-brand-navy/75 text-sm leading-relaxed mb-5">{company.description}</p>

        {/* Contact info */}
        {company.contact.length > 0 && (
          <div className="mb-5 space-y-2">
            {company.contact.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                <span className="text-brand-gold font-semibold text-xs w-20 flex-shrink-0">{c.label}</span>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer noopener"
                    className="text-brand-navy/80 hover:text-brand-gold transition-colors font-medium truncate"
                  >
                    {c.value}
                  </a>
                ) : (
                  <span className="text-brand-navy/80">{c.value}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Social media */}
        {company.socials.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-brand-navy/50 uppercase tracking-widest mb-2">Redes y contacto</p>
            <div className="flex flex-wrap gap-2">
              {company.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.name}
                  title={s.name}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-brand-navy/5 text-brand-navy hover:bg-brand-gold hover:text-white transition-all border border-brand-navy/10"
                >
                  {SOCIAL_ICONS[s.icon]}
                  <span>{s.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Visit CTA */}
        <a
          href={company.url}
          target={company.url.startsWith('http') ? '_blank' : undefined}
          rel={company.url.startsWith('http') ? 'noreferrer noopener' : undefined}
          className="mt-auto flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-95"
          style={{ background: company.accent, color: '#111' }}
        >
          <span>{company.platformLabel}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </article>
  );
}

/* ── MAIN EXPORT ── */

export function AliadosHub() {
  return (
    <div>
      {/* Expandable platforms bar — at the TOP */}
      <PlatformsBar />

      {/* Company cards grid */}
      <section className="py-20 bg-white" id="ecosystem">
        <div className="container-page">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 border border-brand-gold/20">
              Aliados estratégicos
            </span>
            <h2 className="section-title font-display">Nuestro ecosistema de aliados</h2>
            <p className="section-subtitle mt-4">
              Cada aliado tiene su propia plataforma, equipo y contacto. Haz clic en «Visitar» para conocer
              sus servicios, productos y tarifas en su propio sitio web.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COMPANIES.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
