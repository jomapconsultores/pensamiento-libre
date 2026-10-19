import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tecnología | Fundación Pensamiento Libre',
  description:
    'Sistemas en producción de la Fundación Pensamiento Libre: gestión tributaria ante el SRI, contabilidad con IA, ERP educativo, planificación, contratación pública, firma electrónica, inventario y vinculación con graduados.',
};

const SISTEMAS: { title: string; icon: string; description: string; href?: string }[] = [
  {
    title: 'Gestor Tributario',
    icon: '🧾',
    description:
      'Descarga y clasifica los comprobantes electrónicos del SRI, prepara las declaraciones y gestiona la devolución de IVA a adultos mayores.',
    href: 'https://tributos.pensamiento-libre.org',
  },
  {
    title: 'Contabilidad con IA',
    icon: '📊',
    description:
      'Conciliación bancaria asistida por inteligencia artificial, asientos contables y envíos al SRI a partir de estados de cuenta y documentos.',
  },
  {
    title: 'ATLAS',
    icon: '🎓',
    description: 'ERP educativo integrado con Moodle para la gestión académica y las aulas virtuales.',
    href: 'https://atlas.pensamiento-libre.org',
  },
  {
    title: 'Calendario y planificación',
    icon: '🗓️',
    description:
      'Proyectos, cronogramas y avisos de plazos. Con IA importa directorios desde Excel, PDF o Word y propone cronogramas.',
    href: 'https://calendario.pensamiento-libre.org',
  },
  {
    title: 'Contratación pública',
    icon: '🏛️',
    description: 'Cronograma y control de cambios de los procesos de compra pública de entidades locales.',
    href: 'https://contratacion.pensamiento-libre.org',
  },
  {
    title: 'Firma electrónica',
    icon: '✍️',
    description: 'Emisión y gestión de firmas electrónicas.',
  },
  {
    title: 'Kardex',
    icon: '📦',
    description: 'Inventario valorado al costo y al precio de venta, utilidad por operación y control de caja.',
    href: 'https://kardex.pensamiento-libre.org',
  },
  {
    title: 'Conecta',
    icon: '🤝',
    description: 'Seguimiento a graduados, empleabilidad y servicios para la Universidad de Cuenca.',
    href: 'https://conecta.pensamiento-libre.org',
  },
  {
    title: 'Índice de documentos',
    icon: '🗂️',
    description: 'Mantiene al día un índice de documentos: renombra y clasifica cada archivo nuevo de forma automática.',
  },
];

// Cifras agregadas de las bases de producción, 17 de octubre de 2026.
const CIFRAS = [
  { valor: '214', etiqueta: 'contribuyentes administrados' },
  { valor: '3.248', etiqueta: 'comprobantes electrónicos procesados' },
  { valor: '94', etiqueta: 'declaraciones presentadas al SRI' },
  { valor: '3.528', etiqueta: 'graduados con seguimiento' },
];

export default function TecnologiaPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-bg py-20">
        <div className="container-page text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy">Tecnología</h1>
          <p className="mt-6 text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto">
            Desarrollamos y operamos software para quienes cargan con más trámites y menos apoyo:
            pequeños contribuyentes, contadores, adultos mayores y equipos de gobiernos locales.
          </p>
        </div>
      </section>

      {/* ── CIFRAS ── */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="container-page">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {CIFRAS.map((c) => (
              <div key={c.etiqueta}>
                <p className="text-3xl md:text-4xl font-display font-bold text-brand-gold-light">{c.valor}</p>
                <p className="mt-2 text-sm text-white/70">{c.etiqueta}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-white/40 text-xs">Datos de producción al 17 de octubre de 2026.</p>
        </div>
      </section>

      {/* ── SISTEMAS ── */}
      <section className="py-20">
        <div className="container-page">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 border border-brand-gold/20">
              En producción
            </span>
            <h2 className="section-title font-display">Nueve sistemas en uso</h2>
            <p className="section-subtitle">
              Un equipo de dos personas los desarrolla con Claude Code (Anthropic) y los mantiene en
              servidores propios.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SISTEMAS.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-2xl p-8 shadow border border-brand-navy/5 flex flex-col gap-3"
              >
                <span className="text-2xl">{s.icon}</span>
                <h3 className="text-lg font-display font-bold text-brand-navy">{s.title}</h3>
                <p className="text-brand-navy/70 leading-relaxed text-sm flex-1">{s.description}</p>
                {s.href && (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm font-semibold text-brand-gold hover:text-brand-navy transition-colors"
                  >
                    Visitar →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IA ── */}
      <section className="py-16">
        <div className="container-page max-w-3xl mx-auto">
          <div className="bg-brand-navy/5 rounded-2xl p-8 border border-brand-navy/10">
            <h3 className="font-display font-bold text-brand-navy text-xl mb-4">Cómo usamos la inteligencia artificial</h3>
            <ul className="space-y-3 text-brand-navy/75 text-sm leading-relaxed list-disc pl-5">
              <li>
                Convertimos archivos desordenados (Excel, PDF, Word) en datos estructurados y validados,
                listos para el sistema.
              </li>
              <li>Proponemos cronogramas con fechas, responsables y dependencias para proyectos y compras públicas.</li>
              <li>Conciliamos movimientos bancarios y clasificamos gastos para la contabilidad.</li>
              <li>
                Trabajamos en un agente que reparte tareas entre varias computadoras y continúa el trabajo si
                una se apaga.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── ENGLISH ── */}
      <section className="py-16 bg-brand-cream/60">
        <div className="container-page max-w-3xl mx-auto" lang="en">
          <h2 className="font-display font-bold text-brand-navy text-2xl mb-4">In English</h2>
          <p className="text-brand-navy/75 leading-relaxed text-justify">
            Fundación Pensamiento Libre (Cuenca, Ecuador) builds and runs software for small taxpayers,
            accountants, older adults and local-government teams. Nine systems are in production: tax
            compliance with Ecuador&rsquo;s tax authority (SRI), AI-assisted accounting, an education ERP on
            Moodle, project and procurement planning, electronic signatures, inventory, graduate follow-up for
            a public university and automatic document indexing. They manage 214 taxpayers and have filed 94
            tax returns. A two-person team builds them with Claude Code.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-brand-navy text-white">
        <div className="container-page text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">¿Necesitas un sistema así?</h2>
          <p className="text-white/75 mb-8 text-lg">Escríbenos y conversemos sobre tu caso.</p>
          <Link href="/contacto" className="btn-primary">
            Contáctanos
          </Link>
        </div>
      </section>
    </>
  );
}
