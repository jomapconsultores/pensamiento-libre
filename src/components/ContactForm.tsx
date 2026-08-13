'use client';

import { useEffect, useState } from 'react';

const POLITICA_VERSION = 'pl-2026-08';
const UTM_STORE = 'pl_utm_first_touch';
const UTM_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'ttclid', 'msclkid',
];

const CONSENT_TEXTO =
  'Autorizo a Pensamiento Libre a contactarme para dar seguimiento a esta consulta. ' +
  'Puedo pedir la baja en cualquier momento.';

/** Lee la atribución guardada en el primer aterrizaje. */
function leerUtm(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_STORE) || '{}');
  } catch {
    return {};
  }
}

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Atribución first-touch: se guarda al aterrizar y sobrevive a la navegación
  // interna. Sin esto no hay forma de saber qué campaña trajo a cada persona.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(UTM_STORE)) return;
      const params = new URLSearchParams(window.location.search);
      const found: Record<string, string> = {};
      for (const k of UTM_KEYS) {
        const v = params.get(k);
        if (v) found[k] = v.slice(0, 200);
      }
      if (document.referrer) found.referrer = document.referrer.slice(0, 200);
      if (Object.keys(found).length) sessionStorage.setItem(UTM_STORE, JSON.stringify(found));
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Se guarda la referencia antes del await: React reutiliza el evento y
    // `currentTarget` queda en null cuando vuelve la petición.
    const form = e.currentTarget;
    const formData = new FormData(form);
    const entries = Object.fromEntries(formData.entries());
    const payload = {
      ...entries,
      consent: formData.get('consent') === 'on',
      consent_text: CONSENT_TEXTO,
      policy_version: POLITICA_VERSION,
      utm: leerUtm(),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el mensaje.');
      setStatus('success');
      form.reset();
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
        <label htmlFor="phone" className="block text-sm font-semibold text-brand-navy mb-2">
          WhatsApp / Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="099 999 9999"
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

      <label className="flex items-start gap-3 text-sm text-brand-navy/75 leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          name="consent"
          className="mt-1 w-4 h-4 shrink-0 accent-brand-gold cursor-pointer"
        />
        <span>{CONSENT_TEXTO}</span>
      </label>

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
