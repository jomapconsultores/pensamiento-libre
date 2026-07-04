'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const PAID_SERVICES = [
  {
    id: 'consulta' as const,
    emoji: '🧠',
    name: 'Consulta Psicológica',
    // Precio de referencia — se reemplaza en cuanto carga el precio real desde Stripe.
    price: '$45',
    duration: '50 min',
    description:
      'Sesión individual con uno de nuestros psicólogos certificados. Diagnóstico, orientación y plan de acompañamiento personalizado.',
    features: [
      'Modalidad online o presencial en Cuenca',
      'Psicólogos certificados y colegiados',
      'Confidencialidad total garantizada',
      'Primera sesión con evaluación incluida',
    ],
    highlight: false,
  },
  {
    id: 'taller' as const,
    emoji: '💙',
    name: 'Taller Pensamiento Libre',
    // Precio de referencia — se reemplaza en cuanto carga el precio real desde Stripe.
    price: '$60',
    duration: '3 horas',
    description:
      'Taller grupal para desarrollar herramientas de pensamiento crítico, inteligencia emocional y bienestar integral.',
    features: [
      'Material didáctico incluido',
      'Grupo reducido (máx. 10 personas)',
      'Certificado de participación',
      'Acceso a recursos digitales post-taller',
    ],
    highlight: true,
  },
] as const;

const INFO_SERVICES = [
  {
    emoji: '🎯',
    name: 'Mentoría de Propósito',
    description:
      'Acompañamiento 1 a 1 de 8 sesiones para diseñar tu plan de vida con sentido. Combina psicología, coaching y herramientas de propósito.',
    details: 'Programa de 8 sesiones',
    tags: ['Coaching', 'Desarrollo Personal'],
  },
  {
    emoji: '🏢',
    name: 'Talleres Corporativos',
    description:
      'Programas de bienestar empresarial, manejo del estrés, comunicación efectiva e inteligencia emocional para equipos de trabajo.',
    details: 'Grupos desde 10 personas',
    tags: ['Empresas', 'Bienestar Laboral'],
  },
  {
    emoji: '🏫',
    name: 'Pensamiento Libre Escuelas',
    description:
      'Llevamos talleres de inteligencia emocional, pensamiento crítico y bienestar a escuelas públicas y rurales de Cuenca.',
    details: 'Programa anual',
    tags: ['Educación', 'Comunidad'],
  },
];

export function ServicesCards() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/services/prices')
      .then((res) => res.json())
      .then((data: { consulta: string | null; taller: string | null }) => {
        setLivePrices({
          ...(data.consulta ? { consulta: data.consulta } : {}),
          ...(data.taller ? { taller: data.taller } : {}),
        });
      })
      .catch(() => {
        // Stripe no disponible: se mantiene el precio de referencia estático.
      });
  }, []);

  async function buy(serviceId: 'taller' | 'consulta') {
    setError(null);
    setLoading(serviceId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'service', serviceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'No se pudo iniciar el pago.');
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
      setLoading(null);
    }
  }

  return (
    <div className="space-y-16">
      {/* PAID SERVICES */}
      <div>
        <h2 className="text-2xl font-display font-bold text-brand-navy text-center mb-2">
          Reserva tu sesión ahora
        </h2>
        <p className="text-brand-navy/60 text-center mb-8 text-sm">
          Pago seguro en línea. Recibirás confirmación y detalles de acceso por email.
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PAID_SERVICES.map((s) => (
            <article
              key={s.id}
              className={`rounded-2xl p-8 shadow-lg border-2 flex flex-col transition-all hover:shadow-xl ${
                s.highlight
                  ? 'border-brand-gold bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white'
                  : 'border-brand-navy/10 bg-white text-brand-navy hover:border-brand-gold/30'
              }`}
            >
              {s.highlight && (
                <span className="inline-block self-start text-xs font-bold px-3 py-1 rounded-full bg-brand-gold text-brand-navy mb-4">
                  ⭐ RECOMENDADO
                </span>
              )}
              <div className="text-3xl mb-3">{s.emoji}</div>
              <h3
                className={`text-2xl font-display font-bold mb-2 ${
                  s.highlight ? 'text-white' : 'text-brand-navy'
                }`}
              >
                {s.name}
              </h3>
              <p
                className={`leading-relaxed mb-6 text-sm ${
                  s.highlight ? 'text-white/80' : 'text-brand-navy/75'
                }`}
              >
                {s.description}
              </p>

              <ul className="space-y-2 mb-8 flex-1">
                {s.features.map((f) => (
                  <li key={f} className="flex gap-2 items-start">
                    <svg
                      aria-hidden="true"
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        s.highlight ? 'text-brand-gold-light' : 'text-brand-gold'
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span
                      className={`text-sm ${
                        s.highlight ? 'text-white/90' : 'text-brand-navy/80'
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div
                className={`flex items-end justify-between border-t pt-6 ${
                  s.highlight ? 'border-white/10' : 'border-brand-navy/10'
                }`}
              >
                <div>
                  <p
                    className={`text-4xl font-bold ${
                      s.highlight ? 'text-brand-gold-light' : 'text-brand-navy'
                    }`}
                  >
                    {livePrices[s.id] ?? s.price}
                  </p>
                  <p
                    className={`text-sm ${
                      s.highlight ? 'text-white/50' : 'text-brand-navy/50'
                    }`}
                  >
                    {s.duration}
                  </p>
                </div>
                <button
                  onClick={() => buy(s.id)}
                  disabled={loading !== null}
                  className={`py-3 px-6 rounded-full font-bold transition-all disabled:opacity-60 text-sm ${
                    s.highlight
                      ? 'bg-brand-gold text-brand-navy hover:bg-brand-gold-light'
                      : 'btn-primary'
                  }`}
                >
                  {loading === s.id ? 'Redirigiendo...' : 'Reservar'}
                </button>
              </div>
            </article>
          ))}
        </div>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600 bg-red-50 rounded-lg p-3 max-w-md mx-auto">
            {error}
          </p>
        )}
      </div>

      {/* INFORMATIONAL SERVICES */}
      <div>
        <h2 className="text-2xl font-display font-bold text-brand-navy text-center mb-2">
          Más servicios especializados
        </h2>
        <p className="text-brand-navy/60 text-center mb-8 text-sm">
          Para conocer tarifas y disponibilidad, contáctanos directamente.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {INFO_SERVICES.map((s) => (
            <article
              key={s.name}
              className="bg-white rounded-2xl p-6 shadow-md border border-brand-navy/5 hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col"
            >
              <div className="text-3xl mb-3">{s.emoji}</div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">{s.name}</h3>
              <p className="text-sm text-brand-navy/70 leading-relaxed mb-4 flex-1">
                {s.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-brand-navy/50 mb-4">{s.details}</p>
              <Link
                href="/contacto"
                className="text-center text-sm font-semibold text-brand-navy border border-brand-navy/20 rounded-full py-2.5 px-4 hover:bg-brand-navy hover:text-white transition-all"
              >
                Consultar disponibilidad →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
