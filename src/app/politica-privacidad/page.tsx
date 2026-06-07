import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de privacidad | Fundación Pensamiento Libre',
  description:
    'Cómo recolectamos, usamos y protegemos tus datos personales en la Fundación Pensamiento Libre.',
};

export default function PoliticaPrivacidadPage() {
  return (
    <article className="container-page py-16 max-w-3xl prose-content">
      <h1 className="text-4xl font-display font-bold text-brand-navy mb-2">
        Política de privacidad
      </h1>
      <p className="text-brand-navy/60 mb-10">Última actualización: 6 de junio de 2026</p>

      <div className="space-y-8 text-brand-navy/85 leading-relaxed">
        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">1. Quiénes somos</h2>
          <p>
            La Fundación Pensamiento Libre es una organización sin fines de lucro dedicada al
            desarrollo personal integral. Esta política describe cómo tratamos los datos personales
            que nos compartes al usar nuestro sitio o nuestros servicios.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">2. Qué datos recolectamos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Formulario de contacto:</strong> nombre, email, asunto y mensaje.
            </li>
            <li>
              <strong>Newsletter:</strong> dirección de email.
            </li>
            <li>
              <strong>Donaciones y pagos:</strong> nombre, email, monto y datos de pago — estos
              últimos procesados directamente por Stripe; nosotros nunca almacenamos números de
              tarjeta.
            </li>
            <li>
              <strong>Datos técnicos:</strong> dirección IP, navegador y páginas visitadas, recolectados
              de forma agregada para mejorar el sitio.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">3. Cómo usamos tus datos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Responder tus mensajes y consultas.</li>
            <li>Enviar boletines y novedades de la fundación (solo si te suscribes).</li>
            <li>Procesar donaciones, membresías y pagos.</li>
            <li>Cumplir obligaciones legales o fiscales.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">4. Con quién compartimos tus datos</h2>
          <p>
            Trabajamos con proveedores que nos ayudan a operar el sitio:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Supabase</strong> — almacenamiento seguro de datos.</li>
            <li><strong>Stripe</strong> — procesamiento de pagos.</li>
            <li><strong>Resend</strong> — envío de emails transaccionales.</li>
            <li><strong>Render</strong> — alojamiento del sitio.</li>
          </ul>
          <p className="mt-3">
            No vendemos ni alquilamos tu información a terceros con fines comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">5. Tus derechos</h2>
          <p>Puedes en cualquier momento:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Solicitar acceso, rectificación o eliminación de tus datos.</li>
            <li>Cancelar tu suscripción al newsletter (enlace en el pie de cada email).</li>
            <li>Cancelar membresías recurrentes desde el portal de cliente de Stripe.</li>
          </ul>
          <p className="mt-3">
            Para ejercer estos derechos, escríbenos a{' '}
            <a href="mailto:jomapconsultores@gmail.com" className="text-brand-gold hover:underline">
              jomapconsultores@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">6. Seguridad</h2>
          <p>
            Aplicamos medidas técnicas y organizativas para proteger tus datos: cifrado en tránsito
            (HTTPS), control de acceso, claves rotables y auditoría de logs. Aun así, ningún sistema
            es 100% inviolable; te recomendamos usar contraseñas únicas y no compartir información
            sensible en canales públicos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">7. Cookies</h2>
          <p>
            Usamos cookies estrictamente necesarias para el funcionamiento del sitio (sesión de
            administración) y cookies anónimas de medición. No usamos cookies de publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-3">8. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política cuando cambien nuestras prácticas o los requisitos
            legales. La fecha en el encabezado siempre indica la versión vigente.
          </p>
        </section>
      </div>
    </article>
  );
}
