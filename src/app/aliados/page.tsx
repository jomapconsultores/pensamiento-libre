import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const AliadosHub = dynamic(
  () => import('@/components/AliadosHub').then((m) => ({ default: m.AliadosHub })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Aliados y Ecosistema | Fundación Pensamiento Libre',
  description:
    'Conoce el ecosistema de aliados de la Fundación Pensamiento Libre: Atlas Centro de Estudios, CAPSA Consultoría, CMAJ Asociados, Golden Gate English Center, Tributos Web y Calendarios MAP.',
  keywords: [
    'Atlas Centro de Estudios',
    'CAPSA consultoría',
    'CMAJ Asociados',
    'nivelación académica',
    'psicología clínica',
    'firma electrónica',
    'gestión tributaria',
    'contratación pública',
    'cursos online Ecuador',
    'clases de inglés',
    'TOEFL',
    'Cambridge',
  ],
};

export default function AliadosPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-bg py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #5ab4e3 0%, transparent 40%), radial-gradient(circle at 80% 20%, #d4a017 0%, transparent 40%)',
          }}
        />
        <div className="container-page text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold text-sm font-semibold mb-6 border border-brand-gold/20">
            Ecosistema de Servicios
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy mb-6 leading-tight">
            Aliados que transforman
            <span className="block gradient-text">tu futuro</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-navy/70 max-w-3xl mx-auto leading-relaxed">
            La Fundación Pensamiento Libre trabaja junto a un ecosistema de empresas especializadas
            en educación, consultoría tributaria, salud mental y tecnología para ofrecerte
            soluciones integrales de desarrollo personal y profesional.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#ecosystem" className="btn-primary">
              Explorar servicios
            </a>
            <a href="/contacto" className="btn-outline">
              Contáctanos
            </a>
          </div>
        </div>
      </section>

      {/* Metrics strip */}
      <section className="bg-brand-navy py-10">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '6', label: 'Empresas aliadas', suffix: '' },
              { value: '20', label: 'Años de experiencia', suffix: '+' },
              { value: '14', label: 'Cursos especializados', suffix: '+' },
              { value: '3', label: 'Áreas de expertise', suffix: '' },
            ].map((m) => (
              <div key={m.label} className="group">
                <p className="text-4xl font-bold text-brand-gold group-hover:scale-110 transition-transform inline-block">
                  {m.value}
                  <span className="text-brand-gold-light">{m.suffix}</span>
                </p>
                <p className="text-white/60 text-sm mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main interactive hub */}
      <AliadosHub />
    </>
  );
}
