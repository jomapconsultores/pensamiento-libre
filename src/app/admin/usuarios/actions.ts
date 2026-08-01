/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminRole } from '@/lib/adminAuth';
import { generateTempPassword, hashPassword } from '@/lib/auth';

export type ResetResult = { ok: boolean; message: string; password?: string };
export type CrearResult = { ok: boolean; message: string; password?: string };

const ROLES = new Set(['admin', 'socio', 'funcionario']);

/** Alta de una persona. Se crea con clave temporal: nadie —ni quien la crea—
 *  conoce la clave definitiva, que la define el titular al entrar. */
export async function crearUsuario(
  _prev: CrearResult | null,
  formData: FormData,
): Promise<CrearResult> {
  const admin = await requireAdminRole();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') ?? '').trim();
  const role = String(formData.get('role') ?? 'funcionario');

  if (!email.includes('@')) return { ok: false, message: 'Correo inválido.' };
  if (!ROLES.has(role)) return { ok: false, message: 'Rol inválido.' };

  const db = supabaseAdmin();
  const { data: existe } = await db.from('admin_users').select('id').eq('email', email).maybeSingle();
  if (existe) return { ok: false, message: 'Ya existe una cuenta con ese correo.' };

  const temporal = generateTempPassword();
  const { error } = await db.from('admin_users').insert({
    email,
    full_name: fullName,
    role,
    is_active: true,
    password_hash: await hashPassword(temporal),
    must_change_password: true,
    temp_password_expires: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    password_reset_by: admin.id,
  });
  if (error) return { ok: false, message: 'No se pudo crear: ' + error.message };

  revalidatePath('/admin/usuarios');
  return {
    ok: true,
    password: temporal,
    message: `Cuenta creada. Entrega esta clave a ${email} en persona: caduca en 72 horas y deberá cambiarla al entrar. No se volverá a mostrar.`,
  };
}

/** Recuperación de clave olvidada: genera una clave temporal de un solo uso. */
export async function resetUserPassword(
  targetUserId: string,
  _prev: ResetResult | null,
): Promise<ResetResult> {
  const admin = await requireAdminRole();
  const db = supabaseAdmin();

  const { data: target } = await db
    .from('admin_users').select('id, email, full_name').eq('id', targetUserId).maybeSingle();
  if (!target) return { ok: false, message: 'Usuario no encontrado.' };

  const temporal = generateTempPassword();
  const { error } = await db
    .from('admin_users')
    .update({
      password_hash: await hashPassword(temporal),
      must_change_password: true,
      temp_password_expires: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      password_reset_by: admin.id,
    })
    .eq('id', targetUserId);
  if (error) return { ok: false, message: 'No se pudo restablecer: ' + error.message };

  try {
    await db.from('admin_password_log').insert({
      user_id: targetUserId, action: 'reset_admin', executed_by: admin.id,
    });
  } catch {
    // La bitácora es auxiliar: no debe frenar el restablecimiento.
  }

  revalidatePath('/admin/usuarios');
  return {
    ok: true,
    password: temporal,
    message: `Entrega esta clave a ${target.full_name || target.email} en persona. Caduca en 72 horas y deberá cambiarla al entrar. No se volverá a mostrar.`,
  };
}

/** Activa o desactiva una cuenta. Nunca deja el panel sin ningún administrador. */
export async function toggleUsuario(targetUserId: string) {
  await requireAdminRole();
  const db = supabaseAdmin();

  const { data: u } = await db
    .from('admin_users').select('id, role, is_active').eq('id', targetUserId).maybeSingle();
  if (!u) return;

  if (u.is_active && u.role === 'admin') {
    const { count } = await db
      .from('admin_users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('is_active', true);
    if ((count ?? 0) <= 1) return; // sería el último administrador activo
  }

  await db.from('admin_users').update({ is_active: !u.is_active }).eq('id', targetUserId);
  revalidatePath('/admin/usuarios');
}

/** Cambia el rol. Mismo resguardo: no puede quedar el panel sin administrador. */
export async function cambiarRol(targetUserId: string, formData: FormData) {
  await requireAdminRole();
  const role = String(formData.get('role') ?? '');
  if (!ROLES.has(role)) return;

  const db = supabaseAdmin();
  const { data: u } = await db
    .from('admin_users').select('id, role').eq('id', targetUserId).maybeSingle();
  if (!u) return;

  if (u.role === 'admin' && role !== 'admin') {
    const { count } = await db
      .from('admin_users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('is_active', true);
    if ((count ?? 0) <= 1) return;
  }

  await db.from('admin_users').update({ role }).eq('id', targetUserId);
  revalidatePath('/admin/usuarios');
}
