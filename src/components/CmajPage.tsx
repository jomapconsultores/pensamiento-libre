'use client';

import { useState, useEffect, useRef } from 'react';

/* ── TYPES ── */
type PricingPlan = { years: number; price: string; popular?: boolean };
type Benefit = { icon: string; text: string };
type Service = { icon: string; title: string; price: string; note?: string };
type Course = { icon: string; title: string; prof: string; student: string };

/* ── DATA ── */
const FIRMA_PLANS: PricingPlan[] = [
  { years: 1, price: '$18.70' },
  { years: 2, price: '$25.00' },
  { years: 3, price: '$39.40', popular: true },
  { years: 4, price: '$50.00' },
  { years: 5, price: '$59.40' },
];

const FIRMA_BENEFITS: Benefit[] = [
  { icon: '⚡', text: 'Entrega inmediata' },
  { icon: '🔧', text: 'Soporte técnico de instalación incluido' },
  { icon: '🏛️', text: 'Válida ante el SRI' },
  { icon: '💾', text: 'Token físico o archivo' },
  { icon: '✅', text: 'Compatible con todos los trámites' },
];

const SRI_SERVICES: Service[] = [
  { icon: '📋', title: 'Declaración mensual IVA', price: '$17.25', note: 'por declaración' },
  { icon: '📊', title: 'Impuesto a la Renta anual', price: '$34.50', note: 'anual' },
  { icon: '🧾', title: 'Gastos Personales', price: '$57.50', note: 'anual' },
  { icon: '🔍', title: 'Otros trámites SRI', price: 'Cotizar', note: 'a tu medida' },
];

const COURSES: Course[] = [
  {
    icon: '💰',
    title: 'Curso ICE — Impuesto a los Consumos Especiales',
    prof: '$69',
    student: '$34.50',
  },
  {
    icon: '🤖',
    title: 'Curso IA Aplicada a la Contabilidad',
    prof: '$138',
    student: '$69',
  },
];

/* ── ANIMATED COUNTER ── */
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const num = parseFloat(value.replace(/[^0-9.]/g, ''));
          if (isNaN(num)) { setDisplay(value); return; }
          let frame = 0;
          const total = 40;
          const timer = setInterval(() => {
            frame++;
            const progress = frame / total;
            const current = num * Math.min(progress, 1);
            setDisplay((current % 1 === 0 ? current.toFixed(0) : current.toFixed(2)));
            if (frame >= total) clearInterval(timer);
          }, 30);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

/* ── FADE-IN SECTION ── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
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
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── FLOATING PARTICLES ── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            width: `${15 + (i * 11) % 50}px`,
            height: `${15 + (i * 11) % 50}px`,
            background: i % 2 === 0 ? '#c9a84c' : '#1e3a6d',
            opacity: 0.08,
            left: `${(i * 23 + 3) % 100}%`,
            top: `${(i * 17 + 7) % 100}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            animationDuration: `${3 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export function CmajPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-[#0f1e36] via-[#1e3a6d] to-[#2d4f8a] overflow-hidden">
        <Particles />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 40%, rgba(201,168,76,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(30,58,109,0.3) 0%, transparent 50%)',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 container mx-auto px-4 py-24 text-center">
          {/* Badge */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-[#c9a84c]/20 border border-[#c9a84c]/40 rounded-full px-5 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
              <span className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase">
                Sociedad por Acciones Simplificada · Cuenca, Ecuador
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block text-[#c9a84c]">CMAJ ASOCIADOS</span>
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-light text-white/80 mt-2">S.A.S.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Soluciones legales y tributarias para tu negocio
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/593963511411"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8923e] text-black font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                <span>✍️</span>
                Obtener Firma Electrónica
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105"
              >
                Ver servicios ↓
              </a>
            </div>
          </FadeIn>

          {/* Stats row */}
          <FadeIn delay={400}>
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { label: 'Firma electrónica', value: 'Inmediata', icon: '⚡' },
                { label: 'Constituida', value: 'Sep. 2024', icon: '🏢' },
                { label: 'Domicilio', value: 'Cuenca, Azuay', icon: '📍' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <p className="font-bold text-[#c9a84c] text-sm">{stat.value}</p>
                  <p className="text-white/60 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FIRMA ELECTRÓNICA (BIG FEATURE) ── */}
      <section id="firma" className="py-24 bg-gradient-to-b from-[#0f1e36] to-[#1e2d40] relative overflow-hidden">
        <Particles />
        <div className="relative z-10 container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#c9a84c]/20 border border-[#c9a84c]/40 rounded-full px-4 py-2 mb-6">
                <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">✍️ Servicio Principal</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Firma Electrónica
                <span className="block text-[#c9a84c] text-3xl font-light mt-1">con entrega inmediata</span>
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto text-lg">
                Válida para facturación electrónica, contratos digitales y trámites gubernamentales
              </p>
            </div>
          </FadeIn>

          {/* Pricing cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-16 max-w-5xl mx-auto">
            {FIRMA_PLANS.map((plan, i) => (
              <FadeIn key={plan.years} delay={i * 80}>
                <div
                  className={`relative rounded-2xl p-6 text-center transition-all hover:scale-105 cursor-pointer ${
                    plan.popular
                      ? 'bg-[#c9a84c] border-2 border-[#c9a84c] shadow-2xl shadow-[#c9a84c]/30 scale-105'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#1e3a6d] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      ⭐ Más popular
                    </div>
                  )}
                  <p className={`text-4xl font-bold mb-1 ${plan.popular ? 'text-black' : 'text-[#c9a84c]'}`}>
                    {plan.years}
                  </p>
                  <p className={`text-xs uppercase tracking-widest mb-4 ${plan.popular ? 'text-black/60' : 'text-white/50'}`}>
                    {plan.years === 1 ? 'año' : 'años'}
                  </p>
                  <p className={`text-2xl font-bold ${plan.popular ? 'text-black' : 'text-white'}`}>
                    {plan.price}
                  </p>
                  <a
                    href="https://wa.me/593963511411"
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`mt-4 block py-2 rounded-lg text-xs font-bold transition-all ${
                      plan.popular
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/40'
                    }`}
                  >
                    Obtener
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {FIRMA_BENEFITS.map((b, i) => (
              <FadeIn key={b.text} delay={i * 60}>
                <div className="flex flex-col items-center text-center gap-3 bg-white/5 border border-white/10 rounded-xl p-5">
                  <span className="text-3xl">{b.icon}</span>
                  <p className="text-white/80 text-sm font-medium">{b.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS SRI ── */}
      <section id="servicios" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#1e3a6d]/10 border border-[#1e3a6d]/20 rounded-full px-4 py-2 mb-6">
                <span className="text-[#1e3a6d] text-sm font-semibold uppercase tracking-widest">🧾 Gestión Tributaria</span>
              </div>
              <h2 className="text-4xl font-bold text-[#1e3a6d] mb-4">Servicios SRI</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Cumplimiento tributario ágil y confiable con profesionales especializados
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {SRI_SERVICES.map((s, i) => (
              <FadeIn key={s.title} delay={i * 80}>
                <div className="group rounded-2xl border-2 border-gray-100 p-6 hover:border-[#1e3a6d] hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <h3 className="font-bold text-[#1e3a6d] mb-2">{s.title}</h3>
                  <p className="text-3xl font-bold text-[#c9a84c] mb-1">{s.price}</p>
                  {s.note && <p className="text-xs text-gray-400">{s.note}</p>}
                  <a
                    href="https://wa.me/593963511411"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-4 block text-center py-2 bg-[#1e3a6d] text-white rounded-lg text-sm font-semibold hover:bg-[#2d4f8a] transition-colors"
                  >
                    Solicitar
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTAS DE CRÉDITO ── */}
      <section className="py-20 bg-gradient-to-br from-[#1e3a6d] to-[#2d4f8a] relative overflow-hidden">
        <Particles />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-3xl p-10 text-center">
                <div className="text-6xl mb-6">💡</div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Compra de Notas de Crédito SRI
                </h2>
                <p className="text-white/70 mb-8 text-lg">
                  Convierte tus notas de crédito en liquidez inmediata
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: '💰', value: '85%', label: 'Compramos al 85% del valor nominal' },
                    { icon: '⚡', value: '24h', label: 'Pago garantizado en 24 horas' },
                    { icon: '🔒', value: '100%', label: 'Proceso seguro y legal' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/10 rounded-xl p-5 flex flex-col items-center">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <p className="text-[#c9a84c] text-3xl font-black">
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-white/80 text-sm mt-2 font-medium leading-tight">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <a
                  href="https://wa.me/593963511411"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 bg-[#c9a84c] text-black font-bold px-8 py-4 rounded-xl hover:bg-[#b8923e] transition-all hover:scale-105"
                >
                  💬 Consultar ahora
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FORMACIÓN PROFESIONAL ── */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#1e3a6d]/10 border border-[#1e3a6d]/20 rounded-full px-4 py-2 mb-6">
                <span className="text-[#1e3a6d] text-sm font-semibold uppercase tracking-widest">📋 Formación</span>
              </div>
              <h2 className="text-4xl font-bold text-[#1e3a6d] mb-4">Cursos Profesionales</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Capacitación especializada con tarifas diferenciadas para profesionales y estudiantes
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {COURSES.map((course, i) => (
              <FadeIn key={course.title} delay={i * 100}>
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 hover:border-[#c9a84c] hover:shadow-xl transition-all group">
                  <div className="text-5xl mb-6">{course.icon}</div>
                  <h3 className="font-bold text-[#1e3a6d] text-lg mb-6 leading-tight">{course.title}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1e3a6d] rounded-xl p-4 text-center">
                      <p className="text-white/60 text-xs mb-1">Profesionales</p>
                      <p className="text-[#c9a84c] text-2xl font-bold">{course.prof}</p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-xs mb-1">Estudiantes</p>
                      <p className="text-[#1e3a6d] text-2xl font-bold">{course.student}</p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/593963511411"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-6 block text-center py-3 bg-[#1e3a6d] text-white rounded-xl font-semibold hover:bg-[#2d4f8a] transition-colors"
                  >
                    Inscribirme
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMPRESA INFO ── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-[#1e3a6d] mb-4">Sobre CMAJ Asociados</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                <strong>CMAJ ASOCIADOS S.A.S.</strong> es una Sociedad por Acciones Simplificada constituida
                el <strong>30 de septiembre de 2024</strong>, con domicilio en el Cantón Cuenca, Provincia
                del Azuay, Ecuador. Especializada en capacitación, asesoría empresarial y consultoría
                contable-tributaria.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">📍 Cuenca, Azuay</span>
                <span>·</span>
                <span className="flex items-center gap-1">📅 Constituida sep. 2024</span>
                <span>·</span>
                <span className="flex items-center gap-1">🏛️ S.A.S.</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-gradient-to-br from-[#0f1e36] via-[#1e3a6d] to-[#2d4f8a] relative overflow-hidden">
        <Particles />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Contáctanos ahora y obtén tu firma electrónica hoy mismo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/593963511411"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold px-10 py-5 rounded-xl text-lg hover:bg-[#1ebe5d] transition-all hover:scale-105 hover:shadow-2xl"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp: +593 96 351 1411
              </a>
              <a
                href="mailto:jomapconsultores@gmail.com"
                className="inline-flex items-center gap-3 border-2 border-white/30 text-white font-bold px-10 py-5 rounded-xl text-lg hover:bg-white/10 transition-all hover:scale-105"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                jomapconsultores@gmail.com
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
