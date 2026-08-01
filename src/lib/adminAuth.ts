/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

// Resuelve "quién es el administrador conectado" para Server Components y
// Server Actions. Server-only: depende de next/headers.

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  position: string | null;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
  password_hash: string | null;
  password_updated_at: string | null;
};

export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySession(token, process.env.SESSION_SECRET ?? '');
  if (!session) return null;

  const { data } = await supabaseAdmin()
    .from('admin_users')
    .select('id, email, full_name, phone, position, role, is_active, must_change_password, password_hash, password_updated_at')
    .eq('id', session.uid)
    .maybeSingle();

  if (!data || data.is_active === false) return null;
  return data as AdminUser;
});

/** Exige sesión. Si arrastra una clave temporal, lo retiene en /admin/cuenta. */
export async function requireAdminUser(): Promise<AdminUser> {
  const u = await getAdminUser();
  if (!u) redirect('/admin/login');
  if (u.must_change_password) redirect('/admin/cuenta');
  return u;
}

/** Exige además rol de administrador (gestión de usuarios). */
export async function requireAdminRole(): Promise<AdminUser> {
  const u = await requireAdminUser();
  if (u.role !== 'admin') redirect('/admin');
  return u;
}

/** ¿Todavía no hay ninguna cuenta? Habilita el arranque con la clave del entorno. */
export async function sinCuentas(): Promise<boolean> {
  try {
    const { count } = await supabaseAdmin()
      .from('admin_users')
      .select('id', { count: 'exact', head: true });
    return (count ?? 0) === 0;
  } catch {
    return false;
  }
}
