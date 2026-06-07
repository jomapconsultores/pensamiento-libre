'use client';

import { useState } from 'react';

const presetAmounts = [10, 25, 50, 100, 250];

export function DonationForm() {
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recurring, setRecurring] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!effectiveAmount || effectiveAmount < 1) {
      setError('Ingresa un monto válido (mínimo $1).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'donation',
          amount: effectiveAmount,
          recurring,
          donorEmail: email || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'No se pudo iniciar el pago.');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleDonate} className="bg-white rounded-2xl p-8 shadow-lg border border-brand-navy/5">
      <fieldset>
        <legend className="font-bold text-brand-navy mb-3">Monto</legend>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {presetAmounts.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAmount(a);
                setCustomAmount('');
              }}
              className={`py-3 rounded-xl font-semibold transition-all ${
                amount === a && !customAmount
                  ? 'bg-brand-gold text-white shadow'
                  : 'bg-brand-cream text-brand-navy hover:bg-brand-gold/20'
              }`}
            >
              ${a}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="block text-sm text-brand-navy/70 mb-1" htmlFor="custom">
            Otro monto (USD)
          </label>
          <input
            id="custom"
            type="number"
            min="1"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Ingresa cualquier monto"
            className="w-full px-4 py-3 rounded-xl border border-brand-navy/15 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-bold text-brand-navy mb-3">Frecuencia</legend>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRecurring(false)}
            className={`py-3 rounded-xl font-semibold transition-all ${
              !recurring
                ? 'bg-brand-navy text-white shadow'
                : 'bg-brand-cream text-brand-navy hover:bg-brand-navy/10'
            }`}
          >
            Donación única
          </button>
          <button
            type="button"
            onClick={() => setRecurring(true)}
            className={`py-3 rounded-xl font-semibold transition-all ${
              recurring
                ? 'bg-brand-navy text-white shadow'
                : 'bg-brand-cream text-brand-navy hover:bg-brand-navy/10'
            }`}
          >
            Mensual
          </button>
        </div>
      </fieldset>

      <div className="mt-6">
        <label className="block text-sm font-semibold text-brand-navy mb-2" htmlFor="email">
          Email (opcional, para recibo)
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-4 py-3 rounded-xl border border-brand-navy/15 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
        />
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Redirigiendo...'
          : `Donar $${effectiveAmount || 0}${recurring ? '/mes' : ''}`}
      </button>

      <p className="mt-4 text-xs text-brand-navy/60 text-center">
        Procesado de forma segura por Stripe. Aceptamos tarjetas de crédito y débito.
      </p>
    </form>
  );
}
