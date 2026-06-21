'use client';

import { useState } from 'react';

type Category = 'todos' | 'clases' | 'talleres' | 'servicios' | 'educacion';

interface DonationPackage {
  id: string;
  category: Exclude<Category, 'todos'>;
  name: string;
  emoji: string;
  amount: number;
  badgeText: string | null;
  badgeStyle: string;
  impact: string;
  includes: string[];
  supportsMonthly: boolean;
}

const PACKAGES: DonationPackage[] = [
  {
    id: 'clase-pensamiento',
    category: 'clases',
    name: 'Clase de Pensamiento Crítico',
    emoji: '💡',
    amount: 10,
    badgeText: 'Para empezar',
    badgeStyle: 'bg-brand-sky/15 text-brand-sky border-brand-sky/30',
    impact: 'Cubre los materiales y participación de 1 persona en una clase de pensamiento crítico y filosofía aplicada.',
    includes: [
      'Clase grupal (2 horas)',
      'Material didáctico impreso',
      'Recursos digitales de apoyo',
    ],
    supportsMonthly: true,
  },
  {
    id: 'taller-emocional',
    category: 'talleres',
    name: 'Taller Inteligencia Emocional',
    emoji: '💙',
    amount: 25,
    badgeText: 'Más elegido',
    badgeStyle: 'bg-brand-gold/20 text-brand-gold border-brand-gold/30',
    impact: 'Financia los materiales completos y la facilitación de un taller de 3 horas de inteligencia emocional para 1 persona.',
    includes: [
      'Taller grupal (3 horas)',
      'Kit de materiales completo',
      'Certificado de participación',
    ],
    supportsMonthly: false,
  },
  {
    id: 'consulta-solidaria',
    category: 'servicios',
    name: 'Consulta Psicológica Solidaria',
    emoji: '🤝',
    amount: 35,
    badgeText: null,
    badgeStyle: '',
    impact: 'Financia una consulta psicológica de 50 minutos para alguien que lo necesita y no puede costearla.',
    includes: [
      'Sesión individual (50 min)',
      'Evaluación y orientación',
      'Seguimiento y derivación si necesario',
    ],
    supportsMonthly: false,
  },
  {
    id: 'beca-estudiantil',
    category: 'educacion',
    name: 'Beca Estudiantil Mensual',
    emoji: '📚',
    amount: 50,
    badgeText: 'Alto impacto',
    badgeStyle: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    impact: 'Sostiene un mes completo de formación educativa para un joven o joven en situación de vulnerabilidad.',
    includes: [
      'Acceso a programas educativos',
      'Materiales y recursos del mes',
      'Tutoría semanal personalizada',
      'Certificado de avance mensual',
    ],
    supportsMonthly: true,
  },
  {
    id: 'apoyo-familiar',
    category: 'servicios',
    name: 'Apoyo Familiar Integral',
    emoji: '🏡',
    amount: 100,
    badgeText: 'Transformador',
    badgeStyle: 'bg-brand-navy/10 text-brand-navy border-brand-navy/20',
    impact: 'Brinda apoyo completo a toda una familia: salud mental, orientación educativa y recursos durante un mes.',
    includes: [
      '2 consultas psicológicas',
      'Orientación familiar grupal',
      'Materiales educativos',
      'Seguimiento mensual personalizado',
    ],
    supportsMonthly: true,
  },
  {
    id: 'programa-comunitario',
    category: 'talleres',
    name: 'Jornada Comunitaria',
    emoji: '🌳',
    amount: 250,
    badgeText: 'Máximo impacto',
    badgeStyle: 'bg-purple-100 text-purple-700 border-purple-200',
    impact: 'Financia una jornada comunitaria completa en escuelas o barrios, beneficiando a más de 20 personas directamente.',
    includes: [
      'Taller comunitario (4 horas)',
      'Materiales para 20+ personas',
      'Facilitador especializado',
      'Informe de impacto detallado',
    ],
    supportsMonthly: false,
  },
];

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'todos', label: 'Todos', emoji: '🌟' },
  { id: 'clases', label: 'Clases', emoji: '💡' },
  { id: 'talleres', label: 'Talleres', emoji: '💙' },
  { id: 'servicios', label: 'Servicios', emoji: '🤝' },
  { id: 'educacion', label: 'Educación', emoji: '📚' },
];

export function DonationPackages() {
  const [activeCategory, setActiveCategory] = useState<Category>('todos');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const filtered =
    activeCategory === 'todos'
      ? PACKAGES
      : PACKAGES.filter((p) => p.category === activeCategory);

  async function handlePackage(pkg: DonationPackage) {
    if (loading) return;
    setError(null);
    setLoading(pkg.id);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'donation',
          amount: pkg.amount,
          recurring: false,
          donorEmail: email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Error al procesar.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="max-w-md mx-auto mb-8">
        <label className="block text-sm font-medium text-brand-navy/70 mb-2 text-center">
          Email para recibo (opcional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-4 py-3 rounded-xl border border-brand-navy/15 text-center focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? 'bg-brand-navy text-white shadow-md'
                : 'bg-brand-cream text-brand-navy hover:bg-brand-navy/10'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pkg) => (
          <article
            key={pkg.id}
            className="bg-white rounded-2xl p-6 shadow-lg border border-brand-navy/5 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
          >
            {pkg.badgeText && (
              <span
                className={`inline-block self-start text-xs font-bold px-3 py-1 rounded-full border mb-3 ${pkg.badgeStyle}`}
              >
                {pkg.badgeText}
              </span>
            )}
            {!pkg.badgeText && <div className="h-6 mb-3" />}

            <div className="text-3xl mb-3">{pkg.emoji}</div>
            <h3 className="text-lg font-display font-bold text-brand-navy mb-1 leading-tight">
              {pkg.name}
            </h3>
            <p className="text-3xl font-bold text-brand-gold mb-4">
              ${pkg.amount}{' '}
              <span className="text-base font-normal text-brand-navy/40">USD</span>
            </p>

            <p className="text-sm text-brand-navy/70 leading-relaxed mb-4 flex-1">
              {pkg.impact}
            </p>

            <ul className="space-y-1.5 mb-5 border-t border-brand-navy/8 pt-4">
              {pkg.includes.map((item) => (
                <li key={item} className="flex gap-2 items-start text-xs text-brand-navy/75">
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 text-brand-gold flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {pkg.supportsMonthly && (
              <p className="text-xs text-brand-sky font-medium mb-3">
                ↺ También disponible como donación mensual
              </p>
            )}

            <button
              onClick={() => handlePackage(pkg)}
              disabled={loading !== null}
              className="btn-primary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === pkg.id ? 'Procesando...' : `Apoyar con $${pkg.amount}`}
            </button>
          </article>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-red-600 bg-red-50 rounded-lg p-3 max-w-md mx-auto">
          {error}
        </p>
      )}

      <p className="mt-8 text-center text-sm text-brand-navy/50">
        Pagos procesados de forma segura por Stripe · No almacenamos datos de tarjeta
      </p>
    </div>
  );
}
