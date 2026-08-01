/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/adminAuth';
import { ClaveForm, PerfilForm } from './CuentaForms';

export const dynamic = 'force-dynamic';

// Ojo: esta página NO usa requireAdminUser(). Es justamente el destino al que
// ese guard manda a quien arrastra una clave temporal; llamarlo aquí sería un
// bucle de redirecciones.
export default async function CuentaPage() {
  const me = await getAdminUser();
  if (!me) redirect('/admin/login');

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold text-brand-navy">Mi cuenta</h1>
      <p className="mt-1 text-sm text-brand-navy/60">
        Actualiza tus datos y cambia tu clave. Si la olvidas, pide a un administrador que la
        restablezca: te entregará una clave temporal de un solo uso.
      </p>

      {me.must_change_password && (
        <div className="mt-5 rounded-lg bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-900">
          <strong>Cambio obligatorio.</strong> Estás usando una clave temporal entregada por un
          administrador. Define tu clave personal para poder usar el panel.
        </div>
      )}

      <section className="mt-6 rounded-2xl bg-white border border-brand-navy/10 p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-brand-navy mb-4">Mis datos</h2>
        <PerfilForm
          fullName={me.full_name ?? ''}
          email={me.email}
          phone={me.phone ?? ''}
          position={me.position ?? ''}
        />
      </section>

      <section className="mt-5 rounded-2xl bg-white border border-brand-navy/10 p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-brand-navy mb-4">Mi clave</h2>
        <ClaveForm forzado={me.must_change_password} />
        {me.password_updated_at && (
          <p className="mt-3 text-xs text-brand-navy/50">
            Última actualización: {String(me.password_updated_at).slice(0, 10)}
          </p>
        )}
      </section>
    </div>
  );
}
