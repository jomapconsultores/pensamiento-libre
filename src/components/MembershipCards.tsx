'use client';

import { useState } from 'react';

const tiers = [
  {
    id: 'basic' as const,
    name: 'Miembro Solidario',
    price: '$10',
    period: '/mes',
    features: [
      'Acceso a charlas mensuales online',
      'Newsletter exclusiva con contenido inspirador',
      'Reconocimiento como miembro activo',
      'Tu nombre en la página de aliados',
    ],
    cta: 'Hacerme Solidario',
    highlighted: false,
  },
  {
    id: 'premium' as const,
    name: 'Miembro Patrocinador',
    price: '$30',
    period: '/mes',
    features: [
      'Todo lo del plan Solidario',
      'Acceso a talleres premium',
      'Sesión grupal mensual con especialistas',
      'Descuentos en servicios y eventos',
      'Reconocimiento especial en eventos anuales',
    ],
    cta: 'Hacerme Patrocinador',
    highlighted: true,
  },
];

export function MembershipCards() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(tier: 'basic' | 'premium') {
    setError(null);
    setLoading(tier);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'membership', tier }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'No se pudo iniciar la suscripción.');
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
        {tiers.map((tier) => (
          <article
            key={tier.id}
            className={`rounded-3xl p-8 md:p-10 shadow-lg border-2 transition-all ${
              tier.highlighted
                ? 'bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white border-brand-gold shadow-2xl scale-105'
                : 'bg-white text-brand-navy border-brand-navy/10'
            }`}
          >
            {tier.highlighted && (
              <span className="inline-block px-3 py-1 rounded-full bg-brand-gold text-brand-navy text-xs font-bold mb-4">
                MÁS POPULAR
              </span>
            )}
            <h3 className={`text-2xl font-display font-bold ${tier.highlighted ? 'text-white' : 'text-brand-navy'}`}>
              {tier.name}
            </h3>
            <p className="mt-4">
              <span className="text-5xl font-bold">{tier.price}</span>
              <span className={tier.highlighted ? 'text-white/70' : 'text-brand-navy/60'}>
                {tier.period}
              </span>
            </p>

            <ul className="mt-8 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-3 items-start">
                  <svg
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 ${
                      tier.highlighted ? 'text-brand-gold-light' : 'text-brand-gold'
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={tier.highlighted ? 'text-white/90' : 'text-brand-navy/80'}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => subscribe(tier.id)}
              disabled={loading !== null}
              className={`mt-10 w-full py-4 rounded-full font-bold transition-all disabled:opacity-60 ${
                tier.highlighted
                  ? 'bg-brand-gold text-brand-navy hover:bg-brand-gold-light'
                  : 'bg-brand-navy text-white hover:bg-brand-navy-dark'
              }`}
            >
              {loading === tier.id ? 'Redirigiendo...' : tier.cta}
            </button>
          </article>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-red-600 bg-red-50 rounded-lg p-3 max-w-md mx-auto">
          {error}
        </p>
      )}

      <p className="mt-12 text-center text-sm text-brand-navy/60">
        Puedes cancelar tu membresía en cualquier momento. Procesado por Stripe.
      </p>
    </>
  );
}
