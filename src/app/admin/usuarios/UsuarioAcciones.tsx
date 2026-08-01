/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { crearUsuario, resetUserPassword, type CrearResult, type ResetResult } from './actions';

const campo = 'mt-1 w-full rounded-lg border border-brand-navy/20 px-3 py-2 text-base';
const etiqueta = 'block text-sm font-medium text-brand-navy';

/** Caja que muestra la clave temporal UNA sola vez. */
function ClaveGenerada({ state }: { state: { ok: boolean; message: string; password?: string } | null }) {
  if (!state) return null;
  return (
    <div
      role="status"
      className={`mt-3 rounded-lg px-3 py-3 text-sm ${
        state.ok
          ? 'bg-amber-50 border border-amber-300 text-amber-900'
          : 'bg-red-50 border border-red-300 text-red-800'
      }`}
    >
      {state.password && (
        <div className="mb-2 select-all text-center font-mono text-xl tracking-widest">
          {state.password}
        </div>
      )}
      {state.message}
    </div>
  );
}

function BotonReset({ nombre }: { nombre: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        const ok = window.confirm(
          `¿Restablecer la clave de ${nombre}?\n\nSe generará una clave temporal de un solo uso que deberás entregarle. Su clave actual dejará de funcionar.`,
        );
        if (!ok) e.preventDefault();
      }}
      className="rounded-lg border border-amber-400 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
    >
      {pending ? 'Generando…' : '🔑 Restablecer clave'}
    </button>
  );
}

export function ResetPasswordButton({ userId, nombre }: { userId: string; nombre: string }) {
  const [state, action] = useFormState<ResetResult | null>(
    resetUserPassword.bind(null, userId),
    null,
  );
  return (
    <div>
      <form action={action}>
        <BotonReset nombre={nombre} />
      </form>
      <ClaveGenerada state={state} />
    </div>
  );
}

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-navy px-4 py-2.5 font-semibold text-white hover:bg-brand-navy/90 disabled:opacity-60"
    >
      {pending ? 'Creando…' : 'Crear cuenta'}
    </button>
  );
}

export function NuevoUsuarioForm() {
  const [state, action] = useFormState(crearUsuario, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={etiqueta}>
          Nombre completo
          <input name="full_name" className={campo} />
        </label>
        <label className={etiqueta}>
          Correo
          <input name="email" type="email" required className={campo} />
        </label>
        <label className={etiqueta}>
          Rol
          <select name="role" defaultValue="funcionario" className={campo}>
            <option value="funcionario">Funcionario</option>
            <option value="socio">Socio</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
      </div>
      <p className="text-xs text-brand-navy/60">
        La cuenta se crea con una clave temporal de un solo uso: la persona define la suya al
        entrar, así nadie más la conoce.
      </p>
      <BotonCrear />
      <ClaveGenerada state={state as CrearResult | null} />
    </form>
  );
}
