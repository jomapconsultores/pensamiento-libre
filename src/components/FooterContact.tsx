'use client';

import { useState } from 'react';

const INTERESTS = [
  'Programas educativos',
  'Salud mental y psicología',
  'Donaciones y aportes',
  'Voluntariado',
  'Membresías',
  'Talleres y capacitaciones',
  'Alianzas corporativas',
  'Consulta psicológica',
  'Información general',
];

export function FooterContact() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    topic: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    if (!form.message.trim()) {
      setStatus('error');
      setErrorMsg('Por favor escribe un mensaje.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          topic: form.topic || 'general',
          message: `Tel: ${form.phone || 'N/A'}\nInterés: ${form.topic}\n\n${form.message}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar.');
      setStatus('success');
      setForm({ name: '', phone: '', email: '', topic: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido.');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/20">
        <div className="text-3xl mb-3">✅</div>
        <p className="font-bold text-brand-gold-light mb-1">¡Mensaje recibido!</p>
        <p className="text-white/70 text-sm">Te responderemos a la brevedad.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-white/60 mb-1" htmlFor="footer-name">
            Nombre *
          </label>
          <input
            id="footer-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
        </div>
        <div>
          <label className="block text-xs text-white/60 mb-1" htmlFor="footer-phone">
            Teléfono
          </label>
          <input
            id="footer-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+593..."
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1" htmlFor="footer-email">
          Email *
        </label>
        <input
          id="footer-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
        />
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1" htmlFor="footer-interest">
          ¿En qué podemos ayudarte?
        </label>
        <select
          id="footer-interest"
          value={form.topic}
          onChange={(e) => update('topic', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-brand-navy"
        >
          <option value="">Selecciona un área...</option>
          {INTERESTS.map((i) => (
            <option key={i} value={i} className="bg-brand-navy text-white">
              {i}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1" htmlFor="footer-message">
          Mensaje breve
        </label>
        <textarea
          id="footer-message"
          rows={3}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder="Cuéntanos más sobre lo que necesitas..."
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-red-300 text-xs bg-red-900/20 rounded p-2">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-2.5 rounded-full bg-brand-gold text-brand-navy font-bold text-sm hover:bg-brand-gold-light transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
