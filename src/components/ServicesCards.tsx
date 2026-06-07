'use client';

import { useState } from 'react';

const services = [
  {
    id: 'consulta' as const,
    name: 'Consulta psicológica',
    price: '$45',
    description:
      'Sesión individual de 50 minutos con uno de nuestros psicólogos certificados. Modalidad online o presencial.',
    duration: '50 min',
    features: ['Modalidad online o presencial', 'Profesionales certificados', 'Confidencialidad total'],
  },
  {
    id: 'taller' as const,
    name: 'Taller de pensamiento libre',
    price: '$60',
    description:
      'Taller grupal de 3 horas para desarrollar herramientas de pensamiento crítico, autoconocimiento y bienestar.',
    duration: '3 horas',
    features: ['Material incluido', 'Grupo reducido (10 personas)', 'Certificado de participación'],
  },
];

export function ServicesCards() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {services.map((s) => (
          <article
            key={s.id}
            className="bg-white rounded-2xl p-8 shadow-lg border border-brand-navy/5 hover:shadow-xl transition-shadow flex flex-col"
          >
            <h3 className="text-2xl font-display font-bold text-brand-navy mb-3">{s.name}</h3>
            <p className="text-brand-navy/75 leading-relaxed mb-6">{s.description}</p>
            <ul className="space-y-2 mb-8 text-sm text-brand-navy/80">
              {s.features.map((f) => (
                <li key={f} className="flex gap-2 items-start">
                  <svg className="w-4 h-4 mt-0.5 text-brand-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-end justify-between border-t border-brand-navy/10 pt-6">
              <div>
                <p className="text-3xl font-bold text-brand-navy">{s.price}</p>
                <p className="text-sm text-brand-navy/60">{s.duration}</p>
              </div>
              <button
                onClick={() => buy(s.id)}
                disabled={loading !== null}
                className="btn-primary disabled:opacity-60"
              >
                {loading === s.id ? 'Redirigiendo...' : 'Reservar'}
              </button>
            </div>
          </article>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-red-600 bg-red-50 rounded-lg p-3 max-w-md mx-auto">
          {error}
        </p>
      )}
    </>
  );
}
