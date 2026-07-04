'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/* ── TYPES ── */
type Course = {
  icon: string;
  level: string;
  code: string;
  desc: string;
};

type Feature = {
  icon: string;
  title: string;
  desc: string;
};

/* ── DATA ── */
const COURSES: Course[] = [
  { icon: '🌱', level: 'Nivel Básico', code: 'A1-A2', desc: 'Para comenzar desde cero con bases sólidas' },
  { icon: '📈', level: 'Nivel Intermedio', code: 'B1-B2', desc: 'Conversación fluida y comprensión avanzada' },
  { icon: '🎯', level: 'Nivel Avanzado', code: 'C1-C2', desc: 'Dominio profesional del idioma' },
  { icon: '📝', level: 'Preparación TOEFL', code: 'Exam Prep', desc: 'Estrategias y práctica para el examen internacional' },
  { icon: '🎓', level: 'Cambridge English', code: 'Cambridge', desc: 'Certificación reconocida mundialmente' },
  { icon: '💼', level: 'Inglés de Negocios', code: 'Business', desc: 'Para entrevistas, reuniones y presentaciones profesionales' },
];

const FEATURES: Feature[] = [
  { icon: '⚡', title: 'Metodología Activa', desc: 'Aprende haciendo, no memorizando' },
  { icon: '👥', title: 'Grupos Reducidos', desc: 'Máxima atención personalizada' },
  { icon: '🏆', title: 'Certificación Internacional', desc: 'TOEFL y Cambridge reconocidos' },
  { icon: '📱', title: 'Clases Virtuales y Presenciales', desc: 'Aprende como prefieras' },
];

const STATS = [
  { icon: '🏫', value: '4', label: 'Aulas equipadas' },
  { icon: '📜', value: 'TOEFL & Cambridge', label: 'Certificaciones' },
  { icon: '👨‍🎓', value: '+500', label: 'Estudiantes' },
  { icon: '⚡', value: 'Activa', label: 'Metodología' },
];

const CLASSROOMS = [
  { src: '/images/golden-aula1.png', alt: 'Aula Golden Gate 1' },
  { src: '/images/golden-aula2.png', alt: 'Aula Golden Gate 2' },
  { src: '/images/golden-aula3.png', alt: 'Aula Golden Gate 3' },
];

const WHATSAPP_NUMBER = '593963593300';
const WHATSAPP_DISPLAY = '+593 96 359 3300';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ── FADE-IN ── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── FLOATING ORBS ── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {[
        { size: 300, x: '10%', y: '20%', color: 'rgba(234,88,12,0.15)' },
        { size: 200, x: '80%', y: '60%', color: 'rgba(249,115,22,0.1)' },
        { size: 150, x: '60%', y: '10%', color: 'rgba(234,88,12,0.08)' },
        { size: 250, x: '20%', y: '70%', color: 'rgba(255,255,255,0.05)' },
      ].map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl animate-pulse"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${4 + i}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export function GoldenGatePage() {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImg((prev) => (prev + 1) % CLASSROOMS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] overflow-hidden">
        <FloatingOrbs />

        {/* Background banner image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/golden-servicios.jpg"
            alt="Golden Gate English Center"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/90 via-[#1e1b4b]/80 to-[#ea580c]/30" />
        </div>

        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#ea580c 1px, transparent 1px), linear-gradient(90deg, #ea580c 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 container mx-auto px-4 py-28 text-center">
          {/* Badge */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-full px-5 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              <span className="text-orange-400 text-sm font-semibold tracking-widest uppercase">
                Golden Gate English Center
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
              Aprende{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Inglés
              </span>
              <span className="block text-3xl sm:text-5xl font-light text-white/70 mt-2">
                de manera <span className="text-orange-400 font-bold">diferente</span>
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
              Prepárate para tu examen, entrevista o vida en el exterior con metodología activa y dinámica
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Inscríbete ahora
              </a>
              <a
                href="#cursos"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-bold px-10 py-5 rounded-2xl text-lg transition-all hover:scale-105"
              >
                Ver cursos ↓
              </a>
            </div>
            <p className="text-white/40 text-sm">📞 {WHATSAPP_DISPLAY}</p>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-orange-400 to-transparent" />
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-500 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="font-black text-white text-xl">{stat.value}</p>
                <p className="text-white/70 text-xs uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section id="cursos" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
                <span className="text-orange-600 text-sm font-semibold uppercase tracking-widest">Nuestros Cursos</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                Elige tu nivel,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> conquista el idioma</span>
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto text-lg">
                Desde cero hasta nivel profesional con metodología activa y grupos reducidos
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((course, i) => (
              <FadeIn key={course.level} delay={i * 70}>
                <div className="group relative bg-white rounded-2xl border-2 border-gray-100 p-7 hover:border-orange-400 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                  {/* Accent corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-3xl" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{course.icon}</span>
                      <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                        {course.code}
                      </span>
                    </div>
                    <h3 className="font-black text-gray-900 text-xl mb-2">{course.level}</h3>
                    <p className="text-gray-500 leading-relaxed">{course.desc}</p>

                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-6 inline-flex items-center gap-2 text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all"
                    >
                      Consultar →
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY ── */}
      <section className="py-24 bg-gray-950">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white mb-4">
                Nuestras{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                  aulas
                </span>
              </h2>
              <p className="text-white/50 max-w-md mx-auto">
                Espacios modernos diseñados para el aprendizaje activo
              </p>
            </div>
          </FadeIn>

          {/* Main featured image */}
          <FadeIn delay={100}>
            <div className="relative max-w-4xl mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10">
              <div className="relative aspect-video">
                {CLASSROOMS.map((img, i) => (
                  <div
                    key={img.src}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === activeImg ? 1 : 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {CLASSROOMS.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      aria-label={`Ver ${img.alt}`}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === activeImg ? 'bg-orange-400 w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Thumbnail grid */}
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {CLASSROOMS.map((img, i) => (
              <FadeIn key={img.src} delay={i * 80}>
                <button
                  onClick={() => setActiveImg(i)}
                  className={`relative rounded-xl overflow-hidden aspect-video group transition-all ${
                    i === activeImg ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-950' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY GOLDEN GATE ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
                <span className="text-orange-600 text-sm font-semibold uppercase tracking-widest">¿Por qué elegirnos?</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                Golden Gate,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                  la diferencia
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 80}>
                <div className="group text-center p-8 rounded-2xl bg-gray-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-orange-600 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/20">
                  <div className="text-5xl mb-5">{feature.icon}</div>
                  <h3 className="font-black text-gray-900 group-hover:text-white text-lg mb-2 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 group-hover:text-white/80 text-sm transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOGO BANNER ── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
                <Image
                  src="/logos/golden-gate.jpg"
                  alt="Golden Gate English Center"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Golden Gate English Center</h3>
                <p className="text-gray-500 mb-4 leading-relaxed">
                  Centro de inglés con metodología activa, grupos reducidos y certificaciones TOEFL y Cambridge.
                  Clases presenciales y virtuales en Cuenca, Ecuador.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#1ebe5d] transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:+${WHATSAPP_NUMBER}`}
                    className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors"
                  >
                    📞 {WHATSAPP_DISPLAY}
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-gradient-to-br from-orange-600 via-orange-500 to-[#ea580c] relative overflow-hidden">
        <FloatingOrbs />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_0%,_transparent_70%)]" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-4">
              ¿Listo para dar el siguiente paso?
            </h2>
            <p className="text-white/70 text-xl mb-10 max-w-xl mx-auto">
              Inscríbete hoy y empieza tu viaje hacia el dominio del inglés
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-3 bg-white text-orange-600 font-black px-12 py-6 rounded-2xl text-xl hover:bg-gray-50 transition-all hover:scale-105 hover:shadow-2xl"
            >
              <WhatsAppIcon className="w-7 h-7" />
              Inscríbete ahora — {WHATSAPP_DISPLAY}
            </a>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
