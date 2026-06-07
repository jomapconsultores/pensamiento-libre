export function MissionVision() {
  return (
    <section id="mision" className="py-20 bg-brand-cream/40">
      <div className="container-page">
        <h2 className="section-title font-display">Quiénes somos</h2>
        <p className="section-subtitle">
          Una fundación dedicada al desarrollo personal integral, donde mente,
          emoción y propósito convergen para transformar vidas.
        </p>

        <div className="mt-14 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <article className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-brand-navy/5 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-full bg-brand-sky/15 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-brand-sky" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-navy mb-3">Misión</h3>
            <p className="text-brand-navy/75 leading-relaxed">
              Acompañar a personas y comunidades en su proceso de desarrollo personal
              integral, brindando herramientas de salud mental, educación consciente
              y crecimiento humano que fomenten la libertad de pensamiento y el
              bienestar integral.
            </p>
          </article>

          <article className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-brand-navy/5 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-full bg-brand-gold/15 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-navy mb-3">Visión</h3>
            <p className="text-brand-navy/75 leading-relaxed">
              Ser una organización referente en Latinoamérica en la promoción del
              pensamiento libre y el desarrollo integral del ser humano, generando
              comunidades más conscientes, resilientes y comprometidas con su
              bienestar y el de su entorno.
            </p>
          </article>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-display font-bold text-brand-navy text-center mb-8">
            Nuestros valores
          </h3>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Libertad', icon: '🕊️' },
              { label: 'Integridad', icon: '🤝' },
              { label: 'Empatía', icon: '💙' },
              { label: 'Excelencia', icon: '✨' },
            ].map((v) => (
              <li
                key={v.label}
                className="bg-white rounded-xl p-5 text-center shadow border border-brand-navy/5"
              >
                <div className="text-3xl mb-2">{v.icon}</div>
                <p className="font-semibold text-brand-navy">{v.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
