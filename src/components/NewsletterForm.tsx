'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error.');
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido.');
    }
  }

  if (status === 'success') {
    return (
      <p className="text-brand-gold-light text-sm">
        ✨ ¡Listo! Te enviaremos novedades muy pronto.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <label htmlFor="newsletter-email" className="sr-only">Email</label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="flex-1 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-5 py-2.5 rounded-full bg-brand-gold text-brand-navy font-semibold hover:bg-brand-gold-light transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? '...' : 'Suscribirme'}
      </button>
      {status === 'error' && (
        <p className="text-red-300 text-xs sm:absolute sm:mt-12">{errorMsg}</p>
      )}
    </form>
  );
}
