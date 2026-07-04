'use client';

import { useState } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el mensaje.');
      setStatus('success');
      e.currentTarget.reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido.');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-900 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white mb-4">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">¡Mensaje enviado!</h3>
        <p>Te responderemos a la brevedad. Gracias por escribirnos.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm text-green-700 hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-brand-navy mb-2">
          Nombre completo *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-4 py-3 rounded-xl border border-brand-navy/15 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-brand-navy mb-2">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-xl border border-brand-navy/15 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
        />
      </div>

      <div>
        <label htmlFor="topic" className="block text-sm font-semibold text-brand-navy mb-2">
          Asunto
        </label>
        <select
          id="topic"
          name="topic"
          className="w-full px-4 py-3 rounded-xl border border-brand-navy/15 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
        >
          <option value="general">Consulta general</option>
          <option value="voluntariado">Quiero ser voluntario</option>
          <option value="alianza">Propuesta de alianza</option>
          <option value="servicio">Información sobre servicios</option>
          <option value="prensa">Prensa y medios</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-brand-navy mb-2">
          Mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full px-4 py-3 rounded-xl border border-brand-navy/15 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
      </button>

      <p className="text-xs text-brand-navy/60 text-center">
        Al enviar este formulario aceptas nuestra{' '}
        <a href="/politica-privacidad" className="underline hover:text-brand-navy">
          política de privacidad
        </a>
        .
      </p>
    </form>
  );
}
