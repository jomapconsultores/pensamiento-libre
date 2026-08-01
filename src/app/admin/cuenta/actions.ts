/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { getAdminUser } from '@/lib/adminAuth';
import {
  MIN_PASSWORD,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  hashPassword,
  signSession,
  verifyPassword,
} from '@/lib/auth';

export type ActionResult = { ok: boolean; message: string };

/** Bitácora de cambios de clave. Nunca guarda la clave, solo el hecho. */
async function logPassword(userId: string, action: string, executedBy: string | null) {
  try {
    await supabaseAdmin()
      .from('admin_password_log')
      .insert({ user_id: userId, action, executed_by: executedBy });
  } catch {
    // Auxiliar: si la tabla aún no está migrada no debe frenar el cambio.
  }
}

/** El propio usuario actualiza sus datos. Cambiar el correo —que es la credencial
 *  de acceso— exige confirmar la clave actual. */
export async function updateMyProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getAdminUser();
  if (!me) redirect('/admin/login');

  const fullName = String(formData.get('full_name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const position = String(formData.get('position') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const currentPassword = String(formData.get('current_password') ?? '');

  if (!fullName) return { ok: false, message: 'El nombre no puede quedar vacío.' };

  const db = supabaseAdmin();
  const patch: Record<string, unknown> = { full_name: fullName, phone, position };

  if (email && email !== me.email.toLowerCase()) {
    if (!me.password_hash || !(await verifyPassword(currentPassword, me.password_hash))) {
      return { ok: false, message: 'Para cambiar el correo tienes que confirmar tu clave actual.' };
    }
    const { data: taken } = await db
      .from('admin_users').select('id').eq('email', email).maybeSingle();
    if (taken) return { ok: false, message: 'Ya existe una cuenta con ese correo.' };
    patch.email = email;
  }

  const { error } = await db.from('admin_users').update(patch).eq('id', me.id);
  if (error) return { ok: false, message: 'No se pudieron guardar los datos: ' + error.message };

  // La sesión lleva el correo firmado: si cambió, hay que reemitir la cookie.
  if (patch.email) {
    cookies().set(SESSION_COOKIE, await signSession(
      { uid: me.id, email: String(patch.email), role: me.role }, process.env.SESSION_SECRET ?? '',
    ), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  }

  revalidatePath('/admin/cuenta');
  return { ok: true, message: 'Datos actualizados.' };
}

/** Cambio de clave propia: exige la anterior (o la temporal que entregó el
 *  administrador). Al guardarla se levanta el bloqueo de clave temporal. */
export async function changeMyPassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getAdminUser();
  if (!me) redirect('/admin/login');

  const current = String(formData.get('current_password') ?? '');
  const next = String(formData.get('new_password') ?? '');
  const confirm = String(formData.get('confirm_password') ?? '');

  if (next.length < MIN_PASSWORD) {
    return { ok: false, message: `La nueva clave debe tener al menos ${MIN_PASSWORD} caracteres.` };
  }
  if (next !== confirm) return { ok: false, message: 'La nueva clave y su confirmación no coinciden.' };
  if (!me.password_hash || !(await verifyPassword(current, me.password_hash))) {
    return { ok: false, message: 'La clave actual no es correcta.' };
  }
  if (await verifyPassword(next, me.password_hash)) {
    return { ok: false, message: 'La nueva clave debe ser distinta de la anterior.' };
  }

  const { error } = await supabaseAdmin()
    .from('admin_users')
    .update({
      password_hash: await hashPassword(next),
      must_change_password: false,
      temp_password_expires: null,
      password_updated_at: new Date().toISOString(),
    })
    .eq('id', me.id);
  if (error) return { ok: false, message: 'No se pudo guardar la clave: ' + error.message };

  await logPassword(me.id, 'self_change', me.id);
  revalidatePath('/admin/cuenta');
  return { ok: true, message: 'Clave actualizada correctamente.' };
}
