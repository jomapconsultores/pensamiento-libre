const testimonials = [
  {
    quote:
      'Gracias a los talleres de la fundación reencontré mi propósito. Hoy acompaño a otros en su proceso.',
    name: 'María Fernanda',
    role: 'Beneficiaria del programa de salud mental',
  },
  {
    quote:
      'La educación que reciben mis hijos aquí va más allá del aula: aprenden a pensar y a sentir libremente.',
    name: 'Carlos Mendoza',
    role: 'Padre de familia',
  },
  {
    quote:
      'Ser voluntario me cambió la vida. Comprendí que cuidar mi mente también es un acto colectivo.',
    name: 'Lucía Ramírez',
    role: 'Voluntaria activa',
  },
];

export function Testimonials() {
  return (
    <section id="testimonios" className="py-20 bg-brand-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" aria-hidden>
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-sky rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-brand-gold rounded-full blur-3xl" />
      </div>

      <div className="container-page relative">
        <h2 className="section-title text-white font-display">Historias que inspiran</h2>
        <p className="section-subtitle text-white/70">
          Voces reales de personas transformadas por nuestra labor.
        </p>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <svg className="w-10 h-10 text-brand-gold-light mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
              </svg>
              <blockquote className="text-lg leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-6">
                <p className="font-bold text-brand-gold-light">{t.name}</p>
                <p className="text-sm text-white/70">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
