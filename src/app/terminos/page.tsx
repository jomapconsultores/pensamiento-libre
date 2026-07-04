import type { Metadata } from 'next';
import { LegalSection } from '@/components/LegalSection';

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
        <LegalSection title="1. Aceptación">
          <p>
            Al usar este sitio o cualquier servicio de la Fundación Pensamiento Libre aceptas estos
            términos. Si no estás de acuerdo, por favor no uses el sitio.
          </p>
        </LegalSection>

        <LegalSection title="2. Naturaleza de la organización">
          <p>
            La Fundación Pensamiento Libre es una organización sin fines de lucro dedicada al
            desarrollo personal integral. Los recursos recibidos vía donaciones, membresías y
            servicios se destinan a la operación y crecimiento de nuestros programas.
          </p>
        </LegalSection>

        <LegalSection title="3. Donaciones">
          <p>
            Las donaciones son voluntarias y, salvo excepción aplicable por ley, no son
            reembolsables. Si realizas una donación recurrente, puedes cancelarla en cualquier
            momento contactándonos o desde el portal de Stripe.
          </p>
        </LegalSection>

        <LegalSection title="4. Membresías">
          <p>
            Las membresías se renuevan automáticamente cada mes. Puedes cancelar tu membresía en
            cualquier momento; la cancelación tiene efecto al final del período pagado y no genera
            reembolsos por períodos ya facturados.
          </p>
        </LegalSection>

        <LegalSection title="5. Servicios profesionales">
          <p>
            Las consultas psicológicas y talleres son prestados por profesionales certificados. La
            atención psicológica online o presencial no sustituye la atención médica de urgencia. En
            caso de crisis, contacta a tu línea de emergencias local.
          </p>
          <p className="mt-3">
            Las sesiones reservadas pueden reprogramarse hasta 24 horas antes sin costo. Sesiones
            no asistidas sin aviso previo no son reembolsables.
          </p>
        </LegalSection>

        <LegalSection title="6. Conducta del usuario">
          <p>Te comprometes a no usar el sitio para:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Enviar contenido ilegal, ofensivo o engañoso.</li>
            <li>Suplantar la identidad de otra persona.</li>
            <li>Intentar acceder a partes restringidas del sistema.</li>
            <li>Hacer scraping masivo o uso automatizado abusivo.</li>
          </ul>
        </LegalSection>

        <LegalSection title="7. Propiedad intelectual">
          <p>
            Los textos, logotipos, imágenes y materiales del sitio son propiedad de la Fundación
            Pensamiento Libre o de sus respectivos titulares. Puedes compartirlos citando la fuente,
            pero no reproducirlos comercialmente sin autorización.
          </p>
        </LegalSection>

        <LegalSection title="8. Limitación de responsabilidad">
          <p>
            Hacemos el mejor esfuerzo para que la información del sitio sea precisa y útil, pero
            no garantizamos resultados específicos. La fundación no es responsable por daños
            indirectos derivados del uso del sitio.
          </p>
        </LegalSection>

        <LegalSection title="9. Cambios">
          <p>
            Podemos actualizar estos términos en cualquier momento. La fecha en el encabezado
            siempre indica la versión vigente. El uso continuado del sitio implica aceptación de
            los cambios.
          </p>
        </LegalSection>

        <LegalSection title="10. Contacto">
          <p>
            Para consultas relacionadas con estos términos, escríbenos a{' '}
            <a href="mailto:jomapconsultores@gmail.com" className="text-brand-gold hover:underline">
              jomapconsultores@gmail.com
            </a>
            .
          </p>
        </LegalSection>
      </div>
    </article>
  );
}
