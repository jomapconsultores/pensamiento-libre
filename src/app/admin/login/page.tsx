/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

import Image from 'next/image';
import { sinCuentas } from '@/lib/adminAuth';
import { login } from './actions';

export const dynamic = 'force-dynamic';

const MENSAJES: Record<string, string> = {
  '1': 'Correo o contraseña incorrectos.',
  inactivo: 'Tu cuenta está desactivada. Contacta al administrador.',
  caducada:
    'La clave temporal que te entregó el administrador ya caducó. Pídele que la restablezca nuevamente.',
  config: 'Falta configurar SESSION_SECRET en el entorno.',
  bd: 'No se pudo crear la cuenta inicial. Revisa la conexión con Supabase.',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const error = searchParams.error ? MENSAJES[searchParams.error] ?? 'No se pudo iniciar sesión.' : null;
  const primeraVez = await sinCuentas();

  return (
    <div className="min-h-screen bg-brand-cream/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-brand-navy/10 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <Image src="/logo.png" alt="Logo" width={56} height={56} className="h-14 w-auto mb-3" />
          <p className="font-display font-bold text-brand-navy">Panel administrativo</p>
          <p className="text-sm text-brand-navy/60">Fundación Pensamiento Libre</p>
        </div>

        {primeraVez && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-300 px-3 py-2 text-sm text-amber-900">
            <strong>Primera vez.</strong> Todavía no hay cuentas. Entra con el usuario y la clave
            definidos en <code>ADMIN_USERNAME</code> / <code>ADMIN_PASSWORD</code>: se creará tu
            cuenta de administrador y podrás quitar esas variables del entorno.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-300 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <input type="hidden" name="next" value={searchParams.next ?? ''} />
          <label className="block text-sm font-medium text-brand-navy">
            Correo electrónico
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-brand-navy/20 px-3 py-2 text-base"
            />
          </label>
          <label className="block text-sm font-medium text-brand-navy">
            Contraseña
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-brand-navy/20 px-3 py-2 text-base"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-navy px-4 py-2.5 font-semibold text-white hover:bg-brand-navy/90 transition-colors"
          >
            Entrar
          </button>
        </form>

        <details className="mt-5 text-sm text-brand-navy/60">
          <summary className="cursor-pointer">¿Olvidaste tu contraseña?</summary>
          <p className="mt-2 leading-relaxed">
            Por seguridad no se envían contraseñas por correo. Pide a un <strong>administrador</strong>{' '}
            que entre en <em>Usuarios</em> y use <em>Restablecer clave</em>: te entregará una clave
            temporal de un solo uso, válida 72 horas, que deberás cambiar apenas ingreses.
          </p>
        </details>

        <p className="mt-6 text-center text-xs text-brand-navy/40">
          Desarrollado por Marco Antonio Posligua San Martín
        </p>
      </div>
    </div>
  );
}
