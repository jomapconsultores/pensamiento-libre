/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminRole } from '@/lib/adminAuth';
import { cambiarRol, toggleUsuario } from './actions';
import { NuevoUsuarioForm, ResetPasswordButton } from './UsuarioAcciones';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  position: string | null;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
};

const ROL_LABEL: Record<string, string> = {
  admin: 'Administrador',
  socio: 'Socio',
  funcionario: 'Funcionario',
};

export default async function UsuariosPage() {
  const me = await requireAdminRole();

  const { data } = await supabaseAdmin()
    .from('admin_users')
    .select('id, email, full_name, phone, position, role, is_active, must_change_password, last_login_at')
    .order('full_name', { ascending: true });
  const usuarios = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-navy">Usuarios del panel</h1>
      <p className="mt-1 text-sm text-brand-navy/60">
        Cada persona entra con su propia cuenta y su propia clave. Si alguien la olvida, usa
        <em> Restablecer clave</em>: se genera una clave temporal de un solo uso que debes
        entregarle en persona.
      </p>

      <section className="mt-6 rounded-2xl bg-white border border-brand-navy/10 p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-brand-navy mb-4">Nueva cuenta</h2>
        <NuevoUsuarioForm />
      </section>

      <section className="mt-5 space-y-4">
        {usuarios.map((u) => (
          <div key={u.id} className="rounded-2xl bg-white border border-brand-navy/10 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-navy">
                  {u.full_name || u.email}
                  {u.id === me.id && (
                    <span className="ml-2 text-xs font-normal text-brand-navy/50">(tú)</span>
                  )}
                </p>
                <p className="text-sm text-brand-navy/60">{u.email}</p>
                {(u.phone || u.position) && (
                  <p className="text-xs text-brand-navy/50">
                    {[u.position, u.phone].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!u.is_active && (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                    Inactivo
                  </span>
                )}
                {u.must_change_password && (
                  <span
                    className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900"
                    title="Tiene una clave temporal sin cambiar"
                  >
                    Clave temporal
                  </span>
                )}
                <span className="rounded-full bg-brand-navy/10 px-2.5 py-1 text-xs font-medium text-brand-navy">
                  {ROL_LABEL[u.role] ?? u.role}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              {u.id !== me.id && (
                <>
                  <form action={cambiarRol.bind(null, u.id)} className="flex items-end gap-2">
                    <label className="text-sm text-brand-navy">
                      Rol
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="mt-1 block rounded-lg border border-brand-navy/20 px-3 py-1.5 text-sm"
                      >
                        <option value="funcionario">Funcionario</option>
                        <option value="socio">Socio</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg border border-brand-navy/20 px-3 py-1.5 text-sm hover:bg-brand-navy/5"
                    >
                      Guardar
                    </button>
                  </form>

                  <form action={toggleUsuario.bind(null, u.id)}>
                    <button
                      type="submit"
                      className="rounded-lg border border-brand-navy/20 px-3 py-1.5 text-sm hover:bg-brand-navy/5"
                    >
                      {u.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </form>

                  <ResetPasswordButton userId={u.id} nombre={u.full_name || u.email} />
                </>
              )}
              {u.id === me.id && (
                <p className="text-xs text-brand-navy/50">
                  Tu propia cuenta se administra en <em>Mi cuenta</em>.
                </p>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
