'use client';

import { useState } from 'react';

type CheckoutBody =
  | { type: 'donation'; amount: number; recurring: boolean; donorEmail?: string }
  | { type: 'membership'; tier: 'basic' | 'premium'; donorEmail?: string }
  | { type: 'service'; serviceId: 'taller' | 'consulta'; donorEmail?: string };

export function useCheckout() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(
    body: CheckoutBody,
    opts: { key?: string; fallbackError?: string } = {}
  ) {
    const { key = 'default', fallbackError = 'No se pudo iniciar el pago.' } = opts;
    setError(null);
    setLoading(key);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || fallbackError);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
      setLoading(null);
    }
  }

  return { start, loading, error, setError };
}
