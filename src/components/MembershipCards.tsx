'use client';

import { useState } from 'react';
import Link from 'next/link';

const TIER_ICONS = {
  solidario: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
      <path d="M12 22C12 22 4 16 4 10a8 8 0 0116 0c0 6-8 12-8 12z" />
      <circle cx={12} cy={10} r={3} fill="currentColor" stroke="none" />
    </svg>
  ),
  patrocinador: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
    </svg>
  ),
  corporativo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
      <rect x={2} y={7} width={20} height={14} rx={2} />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1={12} y1={12} x2={12} y2={16} />
      <line x1={10} y1={14} x2={14} y2={14} />
    </svg>
  ),
};

const tiers = [
  {
    id: 'basic' as const,
    name: 'Miembro Solidario',
    subtitle: 'Empieza tu compromiso',
    price: '$10',
    period: '/mes',
    icon: 'solidario' as keyof typeof TIER_ICONS,
    iconBg: 'bg-brand-sky/15',
    iconColor: 'text-brand-sky',
    features: [
      'Acceso a charlas mensuales online',
      'Newsletter exclusiva con contenido inspirador',
      'Reconocimiento como miembro activo en la web',
      'Actualizaciones de impacto de tu aporte',
    ],
    cta: 'Hacerme Solidario',
    highlighted: false,
    note: null,
  },
  {
    id: 'premium' as const,
    name: 'Miembro Patrocinador',
    subtitle: 'El más elegido',
    price: '$30',
    period: '/mes',
    icon: 'patrocinador' as keyof typeof TIER_ICONS,
    iconBg: 'bg-brand-gold/20',
    iconColor: 'text-brand-gold',
    features: [
      'Todo lo del plan Solidario',
      'Acceso a talleres premium exclusivos',
      'Sesión grupal mensual con especialistas',
      'Descuentos en servicios y eventos',
      'Reconocimiento en eventos anuales',
      'Acceso anticipado a nuevos programas',
    ],
    cta: 'Hacerme Patrocinador',
    highlighted: true,
    note: null,
  },
  {
    id: null,
    name: 'Aliado Corporativo',
    subtitle: 'Para empresas e instituciones',
    price: 'A convenir',
    period: '',
    icon: 'corporativo' as keyof typeof TIER_ICONS,
    iconBg: 'bg-brand-navy/10',
    iconColor: 'text-brand-navy',
    features: [
      'Todo lo del plan Patrocinador',
      'Mención como patrocinador oficial',
      'Logo de tu empresa en nuestra web y eventos',
      'Talleres corporativos de bienestar',
      'Informe de impacto social personalizado',
      'Contacto directo con la directiva',
    ],
    cta: 'Contactar para más información',
    highlighted: false,
    note: 'Ideal para RSE corporativa',
  },
] as const;

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
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className={`rounded-3xl p-8 shadow-lg border-2 transition-all flex flex-col ${
              tier.highlighted
                ? 'bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white border-brand-gold shadow-2xl scale-105'
                : 'bg-white text-brand-navy border-brand-navy/10 hover:border-brand-gold/30 hover:shadow-xl'
            }`}
          >
            {tier.highlighted && (
              <span className="inline-block px-3 py-1 rounded-full bg-brand-gold text-brand-navy text-xs font-bold mb-4 self-start">
                ⭐ MÁS POPULAR
              </span>
            )}
            {tier.note && !tier.highlighted && (
              <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold mb-4 self-start border border-brand-gold/20">
                {tier.note}
              </span>
            )}
            {!tier.highlighted && !tier.note && <div className="h-6 mb-4" />}

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 flex-shrink-0 ${tier.highlighted ? 'bg-white/15' : tier.iconBg}`}>
              <span className={tier.highlighted ? 'text-brand-gold-light' : tier.iconColor}>
                {TIER_ICONS[tier.icon]}
              </span>
            </div>
            <p
              className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                tier.highlighted ? 'text-brand-gold-light' : 'text-brand-gold'
              }`}
            >
              {tier.subtitle}
            </p>
            <h3
              className={`text-2xl font-display font-bold ${
                tier.highlighted ? 'text-white' : 'text-brand-navy'
              }`}
            >
              {tier.name}
            </h3>
            <p className="mt-4 mb-6">
              <span className="text-4xl font-bold">{tier.price}</span>
              <span
                className={`text-sm ${
                  tier.highlighted ? 'text-white/60' : 'text-brand-navy/50'
                }`}
              >
                {tier.period}
              </span>
            </p>

            <ul className="space-y-3 mb-8 flex-1">
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
                  <span
                    className={`text-sm ${
                      tier.highlighted ? 'text-white/90' : 'text-brand-navy/80'
                    }`}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            {tier.id ? (
              <button
                onClick={() => subscribe(tier.id as 'basic' | 'premium')}
                disabled={loading !== null}
                className={`w-full py-4 rounded-full font-bold transition-all disabled:opacity-60 text-sm ${
                  tier.highlighted
                    ? 'bg-brand-gold text-brand-navy hover:bg-brand-gold-light shadow-lg'
                    : 'bg-brand-navy text-white hover:bg-brand-navy-dark'
                }`}
              >
                {loading === tier.id ? 'Redirigiendo...' : tier.cta}
              </button>
            ) : (
              <Link
                href="/contacto"
                className={`w-full py-4 rounded-full font-bold transition-all text-sm text-center block ${
                  tier.highlighted
                    ? 'bg-brand-gold text-brand-navy hover:bg-brand-gold-light'
                    : 'bg-brand-cream text-brand-navy hover:bg-brand-gold/20 border border-brand-navy/10'
                }`}
              >
                {tier.cta}
              </Link>
            )}
          </article>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-red-600 bg-red-50 rounded-lg p-3 max-w-md mx-auto">
          {error}
        </p>
      )}

      <p className="mt-10 text-center text-sm text-brand-navy/60">
        Puedes cancelar tu membresía en cualquier momento. Sin compromiso. Procesado por
        Stripe.
      </p>
    </>
  );
}
