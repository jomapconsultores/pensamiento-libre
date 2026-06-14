'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/* ─────────────────────────── DATA ─────────────────────────── */

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
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.998 23.227 23.998 22.271V1.729C23.998.774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

type SocialKey = keyof typeof SOCIAL_ICONS;

type ServiceGroup = { title: string; icon: string; items: string[] };
type Stat = { label: string; value: string };
type Social = { name: string; url: string; icon: SocialKey };

type Company = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  bg: string;
  accent: string;
  textOnBg: string;
  url: string;
  platformLabel: string;
  services: ServiceGroup[];
  socials: Social[];
  stats: Stat[];
  videos?: { src: string; label: string }[];
};

const COMPANIES: Company[] = [
  {
    id: 'atlas',
    name: 'Atlas Centro de Estudios',
    tagline: 'Carga el conocimiento, conquista el futuro',
    description:
      'Centro educativo de excelencia con programas de nivelación académica, preparación preuniversitaria, psicología clínica y cursos especializados. Formamos estudiantes y profesionales con metodologías innovadoras y enfoque personalizado.',
    logo: '/logos/atlas.png',
    bg: 'from-[#1e3a8a] to-[#1e3a6d]',
    accent: '#d4a017',
    textOnBg: 'text-white',
    url: 'https://atlas-sistema.onrender.com',
    platformLabel: 'Sistema Atlas',
    services: [
      {
        title: 'Nivelación Académica',
        icon: '📚',
        items: [
          'Matemáticas: aritmética hasta cálculo integral',
          'Ciencias Naturales, Biología y Física',
          'Lenguaje, redacción y gramática',
          'Ciencias Sociales e Historia',
          'Genética Universitaria avanzada',
        ],
      },
      {
        title: 'Preparación Preuniversitaria',
        icon: '🎓',
        items: [
          'Evaluación diagnóstica personalizada',
          'Plan de estudio adaptado',
          'Simulacros de examen de admisión',
          'Matemáticas y Ciencias Aplicadas',
          'Lenguaje Crítico y análisis textual',
        ],
      },
      {
        title: 'Psicología Clínica',
        icon: '🧠',
        items: [
          'Evaluación psicológica integral',
          'Psicoterapia cognitivo-conductual',
          'Manejo de ansiedad y estrés',
          'Orientación y psicoeducación familiar',
          'Talleres de salud mental y neurociencias',
        ],
      },
      {
        title: 'Cursos Especiales',
        icon: '💼',
        items: [
          'Microsoft Office (Word, Excel, PowerPoint)',
          'Emprendimiento y modelo Canvas',
          'Investigación académica y metodología',
          'Contabilidad y Tributación básica',
          'Organización personal y metodología de estudio',
        ],
      },
    ],
    socials: [
      { name: 'Email', url: 'mailto:atlas.cenest@gmail.com', icon: 'email' },
      { name: 'WhatsApp', url: 'https://wa.me/593990948817', icon: 'whatsapp' },
    ],
    stats: [
      { label: 'Clase individual', value: '$15/hr' },
      { label: 'Grupos (2-10)', value: '$12/hr/est.' },
      { label: 'Modalidad', value: 'Presencial + Virtual' },
    ],
    videos: [
      { src: '/videos/atlas-preuniversitario.mp4', label: 'Programa Pre-Universitario' },
      { src: '/videos/atlas-ia.mp4', label: 'IA en tu Aprendizaje' },
      { src: '/videos/atlas-psicologia.mp4', label: 'Salud Mental y Bienestar' },
    ],
  },
  {
    id: 'capsa',
    name: 'CAPSA Consultoría',
    tagline: 'Rigor técnico · Pedagogía aplicada · Resultados concretos',
    description:
      'Consultora de vanguardia con más de dos décadas de experiencia en los sectores público, privado y académico. Ofrecemos capacitaciones especializadas, consultoría tributaria e institucional con metodologías vanguardistas y probadas.',
    logo: '/logos/capsa.png',
    bg: 'from-[#1a1a1a] to-[#2d2d2d]',
    accent: '#f59e0b',
    textOnBg: 'text-white',
    url: 'https://jomap-sistema.onrender.com',
    platformLabel: 'Portal JOMAP',
    services: [
      {
        title: 'Capacitaciones Especializadas',
        icon: '🖥️',
        items: [
          'ICE – Impuesto a Consumos Especiales',
          'Contratación Pública (plataforma SOCE)',
          'ArcGIS Pro: Análisis Espacial',
          'Excel Básico a Intermedio',
          'IA en Investigación Académica',
          'R: Análisis de Datos Avanzado',
          'STATA: Análisis Cuantitativo',
        ],
      },
      {
        title: 'Consultoría Tributaria',
        icon: '📊',
        items: [
          'Declaración de IVA mensual/semestral',
          'Impuesto a la Renta personal y empresarial',
          'Reclamos SRI y planificación fiscal',
          'Asesoría ICE para bebidas alcohólicas',
          'Actualización de RUC y recuperación de claves',
        ],
      },
      {
        title: 'Consultoría Institucional',
        icon: '🏛️',
        items: [
          'Reingeniería de procesos administrativos',
          'Acreditación y calidad CACES',
          'Planes estratégicos y sostenibilidad',
          'Gestión financiera para PyMEs',
          'Microsoft Project Avanzado',
        ],
      },
    ],
    socials: [
      { name: 'YouTube', url: 'https://www.youtube.com/@capsaconsultores', icon: 'youtube' },
      { name: 'Instagram', url: 'https://www.instagram.com/capsaconsultores/', icon: 'instagram' },
      { name: 'Facebook', url: 'https://www.facebook.com/CAPSAConsultoriaAsesoria', icon: 'facebook' },
      { name: 'TikTok', url: 'https://www.tiktok.com/@capsaconsultores', icon: 'tiktok' },
      { name: 'WhatsApp', url: 'https://api.whatsapp.com/message/TJEMWHICDY2CP1?autoload=1&app_absent=0', icon: 'whatsapp' },
      { name: 'Web', url: 'https://capsaconsultores.info/', icon: 'web' },
    ],
    stats: [
      { label: 'Experiencia', value: '+20 años' },
      { label: 'Sectores', value: 'Público · Privado · Académico' },
      { label: 'Cupos por curso', value: 'Máx. 20 participantes' },
    ],
    videos: [],
  },
  {
    id: 'cmaj',
    name: 'CMAJ Asociados S.A.S.',
    tagline: 'Tu firma electrónica e impuestos en un solo lugar',
    description:
      'CMAJ ASOCIADOS S.A.S. es una Sociedad por Acciones Simplificada constituida el 30 de septiembre de 2024, con domicilio en el Cantón Cuenca, Provincia del Azuay. Especializada en capacitación, asesoría empresarial y consultoría contable-tributaria, brinda firma electrónica con entrega inmediata, gestión ante el SRI y formación continua para personas naturales y empresas.',
    logo: '/logos/cmaj.png',
    bg: 'from-[#1e2d40] to-[#2d3e56]',
    accent: '#c9a84c',
    textOnBg: 'text-white',
    url: 'https://jomap-sistema.onrender.com',
    platformLabel: 'Portal JOMAP',
    services: [
      {
        title: 'Firma Electrónica',
        icon: '✍️',
        items: [
          '1 año — $18.70',
          '2 años — $25.00',
          '3 años — $39.40 ⭐ Recomendado',
          '4 años — $50.00',
          '5 años — $59.40',
          'Soporte técnico de instalación incluido',
        ],
      },
      {
        title: 'Gestión Tributaria SRI',
        icon: '🧾',
        items: [
          'Declaración de IVA — $17.25',
          'Impuesto a la Renta — $34.50 anual',
          'Gastos Personales — $57.50 anual',
          'Otros trámites SRI (cotizar)',
          'Validez legal completa garantizada',
        ],
      },
      {
        title: 'Formación y Liquidez',
        icon: '💡',
        items: [
          'Curso ICE: Profesionales $69 / Estudiantes $34.50',
          'Curso IA Aplicada: Prof. $138 / Est. $69',
          'Compra Notas de Crédito SRI al 85%',
          'Pago en 24 horas',
          'Educación continua institucional a medida',
        ],
      },
    ],
    socials: [
      { name: 'Email', url: 'mailto:jomapconsultores@outlook.com', icon: 'email' },
      { name: 'LinkedIn', url: 'https://linkedin.com/company/cmaj-asociados', icon: 'linkedin' },
      { name: 'WhatsApp', url: 'https://wa.me/593963511411', icon: 'whatsapp' },
    ],
    stats: [
      { label: 'Constituida', value: 'Sep. 2024' },
      { label: 'Firma electrónica', value: 'Entrega inmediata' },
      { label: 'Domicilio', value: 'Cuenca, Azuay' },
    ],
  },
  {
    id: 'tributos',
    name: 'Tributos Web',
    tagline: 'Cumplimiento tributario online, simple y seguro',
    description:
      'Plataforma digital especializada para la gestión de obligaciones tributarias. Realiza tus declaraciones, consulta tu estado fiscal y accede a asesoría experta desde cualquier dispositivo, en cualquier momento.',
    logo: '/logos/cmaj.png',
    bg: 'from-[#064e3b] to-[#065f46]',
    accent: '#34d399',
    textOnBg: 'text-white',
    url: 'https://tributos-web.onrender.com',
    platformLabel: 'Ir a Tributos Web',
    services: [
      {
        title: 'Servicios Tributarios',
        icon: '🗂️',
        items: [
          'Declaraciones de IVA en línea',
          'Gestión Impuesto a la Renta',
          'Planificación fiscal estratégica',
          'Cumplimiento normativo SRI',
          'Asesoría tributaria personalizada',
          'Alertas y recordatorios de vencimientos',
        ],
      },
    ],
    socials: [
      { name: 'Email', url: 'mailto:jomapconsultores@gmail.com', icon: 'email' },
      { name: 'WhatsApp', url: 'https://wa.me/593963511411', icon: 'whatsapp' },
    ],
    stats: [
      { label: 'Modalidad', value: '100% Online' },
      { label: 'Disponibilidad', value: '24/7' },
      { label: 'Soporte', value: 'Expertos tributarios' },
    ],
  },
  {
    id: 'calendarios',
    name: 'Calendarios MAP',
    tagline: 'Organiza, agenda y coordina con precisión',
    description:
      'Sistema inteligente de gestión de calendarios y agendamiento profesional. Coordina citas, eventos académicos, sesiones de consultoría y reuniones corporativas de forma eficiente y sincronizada.',
    logo: '/logos/capsa.png',
    bg: 'from-[#312e81] to-[#4338ca]',
    accent: '#a5b4fc',
    textOnBg: 'text-white',
    url: 'https://calendarios-map.onrender.com',
    platformLabel: 'Ir a Calendarios MAP',
    services: [
      {
        title: 'Gestión de Agendas',
        icon: '📅',
        items: [
          'Agendamiento de citas en línea',
          'Coordinación de eventos académicos',
          'Recordatorios automáticos',
          'Gestión multi-usuario y equipos',
          'Sincronización de calendarios',
          'Reportes de actividad y asistencia',
        ],
      },
    ],
    socials: [
      { name: 'Email', url: 'mailto:jomapconsultores@gmail.com', icon: 'email' },
      { name: 'WhatsApp', url: 'https://wa.me/593963511411', icon: 'whatsapp' },
    ],
    stats: [
      { label: 'Tipo', value: 'Cloud-based' },
      { label: 'Acceso', value: 'Multi-dispositivo' },
      { label: 'Integración', value: 'API disponible' },
    ],
  },
  {
    id: 'golden',
    name: 'Golden Gate',
    tagline: 'Aprende inglés de manera diferente',
    description:
      'Centro de inglés con metodología activa y certificaciones internacionales TOEFL y Cambridge. Clases presenciales y virtuales con grupos reducidos para máxima atención personalizada.',
    logo: '/logos/golden-gate.jpg',
    bg: 'from-[#7c2d12] to-[#c2410c]',
    accent: '#fb923c',
    textOnBg: 'text-white',
    url: '/golden-gate',
    platformLabel: 'Ver Golden Gate',
    services: [
      {
        title: 'Niveles de Inglés',
        icon: '📚',
        items: [
          'Básico A1-A2',
          'Intermedio B1-B2',
          'Avanzado C1-C2',
          'Clases presenciales y virtuales',
          'Grupos reducidos',
          'Metodología activa',
        ],
      },
      {
        title: 'Certificaciones',
        icon: '🏆',
        items: [
          'Preparación TOEFL',
          'Cambridge English',
          'Inglés de Negocios',
          'Inglés para entrevistas',
          'Certificados internacionales',
        ],
      },
    ],
    socials: [
      { name: 'WhatsApp', url: 'https://wa.me/593963051347', icon: 'whatsapp' },
      { name: 'Email', url: 'mailto:jomapconsultores@gmail.com', icon: 'email' },
    ],
    stats: [
      { label: 'Certificaciones', value: 'TOEFL · Cambridge' },
      { label: 'Modalidad', value: 'Presencial / Virtual' },
      { label: 'Contacto', value: '+593 96 305 1347' },
    ],
  },
];

/* ─────────────────────── FLOATING PARTICLES ─────────────────────── */

function Particles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10 animate-pulse"
          style={{
            width: `${20 + (i * 13) % 60}px`,
            height: `${20 + (i * 13) % 60}px`,
            background: color,
            left: `${(i * 23 + 5) % 100}%`,
            top: `${(i * 17 + 10) % 100}%`,
            animationDelay: `${(i * 0.4) % 3}s`,
            animationDuration: `${3 + (i % 3)}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────── VIDEO GALLERY ─────────────────────── */

function VideoGallery({ videos }: { videos: { src: string; label: string }[] }) {
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [active]);

  if (!videos || videos.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          key={videos[active].src}
          src={videos[active].src}
          className="w-full h-full object-contain bg-black"
          muted
          loop
          playsInline
          autoPlay
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-white text-sm font-semibold">{videos[active].label}</p>
        </div>
      </div>
      {videos.length > 1 && (
        <div className="flex gap-2 p-3 bg-black/80">
          {videos.map((v, i) => (
            <button
              key={v.src}
              onClick={() => setActive(i)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                i === active
                  ? 'bg-white text-black'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── STAT CARD ─────────────────────── */

function StatCard({ stat, accent }: { stat: Stat; accent: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all group">
      <p className="text-2xl font-bold group-hover:scale-110 transition-transform inline-block" style={{ color: accent }}>
        {stat.value}
      </p>
      <p className="text-white/70 text-sm mt-1">{stat.label}</p>
    </div>
  );
}

/* ─────────────────────── SERVICE CARD ─────────────────────── */

function ServiceCard({
  group,
  accent,
  delay,
}: {
  group: ServiceGroup;
  accent: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all hover:shadow-xl hover:-translate-y-1"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{group.icon}</span>
        <h3 className="font-bold text-white text-lg">{group.title}</h3>
      </div>
      <ul className="space-y-2">
        {group.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-white/80 text-sm">
            <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────── SOCIAL BUTTON ─────────────────────── */

function SocialButton({ social, accent }: { social: Social; accent: string }) {
  return (
    <a
      href={social.url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={social.name}
      className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white hover:scale-110 transition-all duration-200"
    >
      <span
        className="transition-colors"
        style={{ color: 'white' }}
      >
        <span className="group-hover:text-gray-800 transition-colors block">
          {SOCIAL_ICONS[social.icon]}
        </span>
      </span>
      <span className="text-white group-hover:text-gray-800 text-xs font-medium transition-colors">
        {social.name}
      </span>
    </a>
  );
}

/* ────────────────────── TAB BUTTON ────────────────────── */

function TabButton({
  company,
  active,
  onClick,
}: {
  company: Company;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
        active
          ? 'bg-white text-brand-navy shadow-lg scale-105'
          : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
      }`}
    >
      <div className={`w-6 h-6 rounded-full overflow-hidden shrink-0 ${active ? '' : 'opacity-70'}`}>
        <Image
          src={company.logo}
          alt={company.name}
          width={24}
          height={24}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="hidden sm:inline">{company.name.split(' ')[0]}</span>
      {active && (
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ background: company.accent }}
        />
      )}
    </button>
  );
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */

export function AliadosHub() {
  const [activeId, setActiveId] = useState('atlas');
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const company = COMPANIES.find((c) => c.id === activeId)!;

  function switchTab(id: string) {
    setActiveId(id);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  if (!mounted) return null;

  return (
    <div>
      {/* ── PARTNER LOGOS STRIP ── */}
      <section className="py-16 bg-white border-b border-brand-navy/10">
        <div className="container-page">
          <p className="text-center text-sm font-semibold text-brand-navy/50 uppercase tracking-widest mb-10">
            Nuestro ecosistema de aliados
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            {COMPANIES.filter((c) => ['atlas', 'capsa', 'cmaj', 'golden'].includes(c.id)).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  switchTab(c.id);
                  document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex flex-col items-center gap-3 hover:scale-110 transition-transform duration-300"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow border border-gray-100">
                  <Image
                    src={c.logo}
                    alt={c.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <span className="text-xs font-semibold text-brand-navy/70 group-hover:text-brand-navy transition-colors text-center max-w-[100px]">
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM SECTION ── */}
      <section id="ecosystem" className="py-4">
        {/* Gradient header with tabs */}
        <div className={`bg-gradient-to-br ${company.bg} relative overflow-hidden`}>
          <Particles color={company.accent} />
          <div className="container-page relative z-10">
            {/* Tab strip */}
            <div className="pt-10 pb-6 flex gap-2 overflow-x-auto scrollbar-hide">
              {COMPANIES.map((c) => (
                <TabButton
                  key={c.id}
                  company={c}
                  active={c.id === activeId}
                  onClick={() => switchTab(c.id)}
                />
              ))}
            </div>

            {/* Hero content */}
            <div className="pb-12 grid md:grid-cols-2 gap-10 items-center">
              {/* Left: info */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/30 p-1 shrink-0">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      {company.name}
                    </h2>
                    <p className="text-white/60 text-sm mt-1 italic">{company.tagline}</p>
                  </div>
                </div>

                <p className="text-white/80 leading-relaxed mb-8">{company.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {company.stats.map((s) => (
                    <StatCard key={s.label} stat={s} accent={company.accent} />
                  ))}
                </div>

                {/* Social media */}
                {company.socials.length > 0 && (
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Conecta con nosotros</p>
                    <div className="flex flex-wrap gap-2">
                      {company.socials.map((s) => (
                        <SocialButton key={s.name} social={s} accent={company.accent} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: video or logo showcase */}
              <div>
                {company.videos && company.videos.length > 0 ? (
                  <VideoGallery videos={company.videos} />
                ) : (
                  <div className="rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-8 flex flex-col items-center justify-center min-h-64 gap-4">
                    <div className="w-32 h-32">
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-white/60 text-center text-sm">{company.tagline}</p>
                  </div>
                )}

                {/* CTA button */}
                <a
                  href={company.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                  style={{ background: company.accent, color: '#111' }}
                >
                  <span>Acceder a {company.platformLabel}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Services grid */}
        <div ref={contentRef} className={`bg-gradient-to-b ${company.bg} py-12`}>
          <div className="container-page">
            <h3 className="text-xl font-bold text-white/80 mb-8 text-center uppercase tracking-widest text-sm">
              Servicios y Productos
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {company.services.map((group, i) => (
                <ServiceCard
                  key={group.title}
                  group={group}
                  accent={company.accent}
                  delay={i * 100}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORMS STRIP ── */}
      <section className="py-20 bg-brand-cream">
        <div className="container-page">
          <h2 className="section-title mb-4">Plataformas en línea</h2>
          <p className="section-subtitle mb-12">
            Accede directamente a nuestros sistemas digitales especializados
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMPANIES.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group block rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-2 duration-300"
              >
                <div className={`bg-gradient-to-br ${c.bg} p-6 relative overflow-hidden`}>
                  <Particles color={c.accent} />
                  <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/20 p-1">
                      <Image
                        src={c.logo}
                        alt={c.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <p className="text-white/60 text-xs mt-1">{c.tagline.split('·')[0].trim()}</p>
                    </div>
                  </div>
                </div>
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ background: c.accent }}
                >
                  <span className="text-xs font-bold text-black">{c.platformLabel}</span>
                  <svg className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL MEDIA WALL ── */}
      <section className="py-16 bg-brand-navy">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Síguenos en redes sociales</h2>
          <p className="text-white/60 text-center mb-10 text-sm">
            Mantente al día con cursos, noticias y contenido de valor
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'YouTube CAPSA', url: 'https://www.youtube.com/@capsaconsultores', icon: 'youtube' as SocialKey, brand: '#FF0000' },
              { name: 'Instagram CAPSA', url: 'https://www.instagram.com/capsaconsultores/', icon: 'instagram' as SocialKey, brand: '#E1306C' },
              { name: 'Facebook CAPSA', url: 'https://www.facebook.com/CAPSAConsultoriaAsesoria', icon: 'facebook' as SocialKey, brand: '#1877F2' },
              { name: 'TikTok CAPSA', url: 'https://www.tiktok.com/@capsaconsultores', icon: 'tiktok' as SocialKey, brand: '#010101' },
              { name: 'Facebook Fundación', url: 'https://www.facebook.com/profile.php?id=61588510303020', icon: 'facebook' as SocialKey, brand: '#1877F2' },
              { name: 'Web CAPSA', url: 'https://capsaconsultores.info/', icon: 'web' as SocialKey, brand: '#f59e0b' },
              { name: 'WhatsApp', url: 'https://api.whatsapp.com/message/TJEMWHICDY2CP1?autoload=1&app_absent=0', icon: 'whatsapp' as SocialKey, brand: '#25D366' },
            ].map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-3 bg-white/10 hover:bg-white border border-white/20 rounded-xl px-4 py-3 transition-all hover:scale-105"
              >
                <span className="text-white group-hover:text-gray-800 transition-colors">
                  {SOCIAL_ICONS[s.icon]}
                </span>
                <span className="text-white group-hover:text-gray-800 text-sm font-medium transition-colors">
                  {s.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
