'use client';

import { useState } from 'react';

const PRESETS = [
  { amount: 10, label: 'Semilla', impact: 'Cubre materiales de una clase de pensamiento crítico' },
  { amount: 25, label: 'Raíz', impact: 'Financia un taller de inteligencia emocional completo' },
  { amount: 50, label: 'Árbol', impact: 'Sostiene una beca educativa durante un mes' },
  { amount: 100, label: 'Bosque', impact: 'Apoya integralmente a una familia durante un mes' },
  { amount: 250, label: 'Selva', impact: 'Financia una jornada comunitaria para 20+ personas' },
];

export function DonationForm() {
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recurring, setRecurring] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const currentPreset = PRESETS.find((p) => p.amount === amount && !customAmount);

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
    <form
      onSubmit={handleDonate}
      className="bg-white rounded-2xl p-8 shadow-xl border border-brand-navy/5"
    >
      {/* Amount presets */}
      <fieldset>
        <legend className="font-bold text-brand-navy mb-4 text-lg">Elige tu monto</legend>
        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.amount}
              type="button"
              onClick={() => {
                setAmount(p.amount);
                setCustomAmount('');
              }}
              className={`py-3 rounded-xl font-semibold transition-all flex flex-col items-center gap-0.5 ${
                amount === p.amount && !customAmount
                  ? 'bg-brand-gold text-white shadow-md scale-105'
                  : 'bg-brand-cream text-brand-navy hover:bg-brand-gold/20'
              }`}
            >
              <span className="text-sm font-bold">${p.amount}</span>
              <span
                className={`text-[10px] font-normal ${
                  amount === p.amount && !customAmount
                    ? 'text-white/80'
                    : 'text-brand-navy/60'
                }`}
              >
                {p.label}
              </span>
            </button>
          ))}
        </div>

        {currentPreset && (
          <div className="mt-4 bg-brand-gold/8 border border-brand-gold/20 rounded-xl px-4 py-3">
            <p className="text-sm text-brand-navy/80">
              <span className="font-bold text-brand-gold">Con ${currentPreset.amount}:</span>{' '}
              {currentPreset.impact}.
            </p>
          </div>
        )}

        <div className="mt-4">
          <label
            className="block text-sm text-brand-navy/70 mb-1.5"
            htmlFor="custom-amount"
          >
            Otro monto (USD)
          </label>
          <input
            id="custom-amount"
            type="number"
            min="1"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Ingresa cualquier monto"
            className="w-full px-4 py-3 rounded-xl border border-brand-navy/15 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
        </div>
      </fieldset>

      {/* Frequency */}
      <fieldset className="mt-6">
        <legend className="font-bold text-brand-navy mb-3">Frecuencia</legend>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRecurring(false)}
            className={`py-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-1 ${
              !recurring
                ? 'bg-brand-navy text-white shadow-md'
                : 'bg-brand-cream text-brand-navy hover:bg-brand-navy/10'
            }`}
          >
            <span>Una vez</span>
            <span
              className={`text-xs font-normal ${
                !recurring ? 'text-white/70' : 'text-brand-navy/50'
              }`}
            >
              Donación puntual
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRecurring(true)}
            className={`py-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-1 ${
              recurring
                ? 'bg-brand-navy text-white shadow-md'
                : 'bg-brand-cream text-brand-navy hover:bg-brand-navy/10'
            }`}
          >
            <span>Mensual</span>
            <span
              className={`text-xs font-normal ${
                recurring ? 'text-white/70' : 'text-brand-navy/50'
              }`}
            >
              Apoyo continuo
            </span>
          </button>
        </div>
        {recurring && (
          <p className="mt-2 text-xs text-brand-sky bg-brand-sky/8 border border-brand-sky/20 rounded-lg px-3 py-2">
            ↺ Al donar mensualmente multiplicas tu impacto. Puedes cancelar cuando quieras.
          </p>
        )}
      </fieldset>

      {/* Email */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-brand-navy mb-2" htmlFor="email">
          Email{' '}
          <span className="font-normal text-brand-navy/60">(opcional, para recibo)</span>
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
        className="btn-primary w-full mt-6 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Redirigiendo a pago...'
          : `Donar $${effectiveAmount || 0}${recurring ? '/mes' : ''} ahora`}
      </button>

      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-brand-navy/50 flex-wrap">
        <span className="flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Pago cifrado SSL
        </span>
        <span>·</span>
        <span>Procesado por Stripe</span>
        <span>·</span>
        <span>Sin guardar datos de tarjeta</span>
      </div>
    </form>
  );
}
