/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { changeMyPassword, updateMyProfile, type ActionResult } from './actions';

const MIN_PASSWORD = 8;

const campo =
  'mt-1 w-full rounded-lg border border-brand-navy/20 px-3 py-2 text-base';
const etiqueta = 'block text-sm font-medium text-brand-navy';
const boton =
  'w-full rounded-lg bg-brand-navy px-4 py-2.5 font-semibold text-white hover:bg-brand-navy/90 transition-colors disabled:opacity-60';

function Aviso({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p
      role="status"
      className={`mt-3 rounded-lg px-3 py-2 text-sm ${
        state.ok
          ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
          : 'bg-red-50 border border-red-300 text-red-800'
      }`}
    >
      {state.message}
    </p>
  );
}

function Enviar({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={boton}>
      {pending ? 'Guardando…' : children}
    </button>
  );
}

export function PerfilForm({
  fullName, email, phone, position,
}: {
  fullName: string; email: string; phone: string; position: string;
}) {
  const [state, action] = useFormState(updateMyProfile, null);

  return (
    <form action={action} className="space-y-4">
      <label className={etiqueta}>
        Nombre completo
        <input name="full_name" defaultValue={fullName} required className={campo} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={etiqueta}>
          Teléfono
          <input name="phone" type="tel" defaultValue={phone} placeholder="09XXXXXXXX" className={campo} />
        </label>
        <label className={etiqueta}>
          Cargo
          <input name="position" defaultValue={position} placeholder="Socio, funcionario…" className={campo} />
        </label>
      </div>
      <label className={etiqueta}>
        Correo de acceso
        <input name="email" type="email" defaultValue={email} required className={campo} />
        <span className="mt-1 block text-xs font-normal text-brand-navy/60">
          Es tu usuario para entrar. Si lo cambias, confirma tu clave actual abajo.
        </span>
      </label>
      <label className={etiqueta}>
        Clave actual (solo si cambias el correo)
        <input name="current_password" type="password" autoComplete="current-password" className={campo} />
      </label>
      <Enviar>Guardar mis datos</Enviar>
      <Aviso state={state} />
    </form>
  );
}

export function ClaveForm({ forzado }: { forzado: boolean }) {
  const [state, action] = useFormState(changeMyPassword, null);

  return (
    <form action={action} autoComplete="off" className="space-y-4">
      <label className={etiqueta}>
        {forzado ? 'Clave temporal' : 'Clave actual'}
        <input name="current_password" type="password" required autoComplete="current-password" className={campo} />
      </label>
      <label className={etiqueta}>
        Nueva clave
        <input
          name="new_password" type="password" required
          minLength={MIN_PASSWORD} autoComplete="new-password" className={campo}
        />
        <span className="mt-1 block text-xs font-normal text-brand-navy/60">
          Mínimo {MIN_PASSWORD} caracteres. Usa letras, números y algún símbolo.
        </span>
      </label>
      <label className={etiqueta}>
        Repetir nueva clave
        <input
          name="confirm_password" type="password" required
          minLength={MIN_PASSWORD} autoComplete="new-password" className={campo}
        />
      </label>
      <Enviar>Guardar nueva clave</Enviar>
      <Aviso state={state} />
    </form>
  );
}
