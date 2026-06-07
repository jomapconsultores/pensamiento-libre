import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y condiciones | Fundación Pensamiento Libre',
  description:
    'Términos de uso del sitio y servicios de la Fundación Pensamiento Libre.',
};

export default function TerminosPage() {
  return (
    <article className="container-page py-16 max-w-3xl">
      <h1 className="text-4xl font-display font-bold text-brand-navy mb-2">
        Términos y condiciones
      </h1>
      <p className="text-brand-navy/60 mb-10">Última actualización: 6 de junio de 2026</p>

      <div className="space-y-8 text-brand-navy/85 leading-relaxed">
        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">1. Aceptación</h2>
          <p>
            Al usar este sitio o cualquier servicio de la Fundación Pensamiento Libre aceptas estos
            términos. Si no estás de acuerdo, por favor no uses el sitio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">2. Naturaleza de la organización</h2>
          <p>
            La Fundación Pensamiento Libre es una organización sin fines de lucro dedicada al
            desarrollo personal integral. Los recursos recibidos vía donaciones, membresías y
            servicios se destinan a la operación y crecimiento de nuestros programas.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">3. Donaciones</h2>
          <p>
            Las donaciones son voluntarias y, salvo excepción aplicable por ley, no son
            reembolsables. Si realizas una donación recurrente, puedes cancelarla en cualquier
            momento contactándonos o desde el portal de Stripe.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">4. Membresías</h2>
          <p>
            Las membresías se renuevan automáticamente cada mes. Puedes cancelar tu membresía en
            cualquier momento; la cancelación tiene efecto al final del período pagado y no genera
            reembolsos por períodos ya facturados.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">5. Servicios profesionales</h2>
          <p>
            Las consultas psicológicas y talleres son prestados por profesionales certificados. La
            atención psicológica online o presencial no sustituye atención médica de urgencia. En
            caso de crisis, contacta a tu línea de emergencias local.
          </p>
          <p className="mt-3">
            Las sesiones reservadas pueden reprogramarse hasta 24 horas antes sin costo. Sesiones
            no asistidas sin aviso previo no son reembolsables.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">6. Conducta del usuario</h2>
          <p>Te comprometes a no usar el sitio para:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Enviar contenido ilegal, ofensivo o engañoso.</li>
            <li>Suplantar la identidad de otra persona.</li>
            <li>Intentar acceder a partes restringidas del sistema.</li>
            <li>Hacer scraping masivo o uso automatizado abusivo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">7. Propiedad intelectual</h2>
          <p>
            Los textos, logotipos, imágenes y materiales del sitio son propiedad de la Fundación
            Pensamiento Libre o de sus respectivos titulares. Puedes compartirlos citando la fuente,
            pero no reproducirlos comercialmente sin autorización.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">8. Limitación de responsabilidad</h2>
          <p>
            Hacemos el mejor esfuerzo para que la información del sitio sea precisa y útil, pero
            no garantizamos resultados específicos. La fundación no es responsable por daños
            indirectos derivados del uso del sitio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">9. Cambios</h2>
          <p>
            Podemos actualizar estos términos en cualquier momento. La fecha en el encabezado
            siempre indica la versión vigente. El uso continuado del sitio implica aceptación de
            los cambios.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">10. Contacto</h2>
          <p>
            Para consultas relacionadas con estos términos, escríbenos a{' '}
            <a href="mailto:jomapconsultores@gmail.com" className="text-brand-gold hover:underline">
              jomapconsultores@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
