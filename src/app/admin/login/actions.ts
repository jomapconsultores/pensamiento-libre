/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  hashPassword,
  signSession,
  verifyPassword,
} from '@/lib/auth';

/** Ruta interna de destino tras entrar (evita redirecciones a sitios externos). */
function destinoSeguro(next: string | null): string {
  if (!next || !next.startsWith('/admin') || next.startsWith('//')) return '/admin';
  return next;
}

async function abrirSesion(u: { id: string; email: string; role: string }, next: string | null) {
  cookies().set(SESSION_COOKIE, await signSession(
    { uid: u.id, email: u.email, role: u.role }, process.env.SESSION_SECRET ?? '',
  ), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '') || null;

  if (!process.env.SESSION_SECRET) redirect('/admin/login?error=config');

  const db = supabaseAdmin();
  const { data: u } = await db
    .from('admin_users')
    .select('id, email, role, is_active, password_hash, must_change_password, temp_password_expires')
    .eq('email', email)
    .maybeSingle();

  // ── Arranque ──────────────────────────────────────────────────────────────
  // Mientras no exista ninguna cuenta, se acepta una sola vez la clave
  // compartida del entorno para crear la primera (administrador). Después se
  // pueden borrar ADMIN_USERNAME / ADMIN_PASSWORD del despliegue.
  if (!u) {
    const { count } = await db.from('admin_users').select('id', { count: 'exact', head: true });
    const primeraVez = (count ?? 0) === 0;
    const envUser = (process.env.ADMIN_USERNAME ?? '').trim().toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD ?? '';
    if (primeraVez && envUser && envPass && email === envUser && password === envPass) {
      const { data: creado, error } = await db
        .from('admin_users')
        .insert({
          email,
          full_name: 'Administrador',
          role: 'admin',
          is_active: true,
          password_hash: await hashPassword(password),
          password_updated_at: new Date().toISOString(),
        })
        .select('id, email, role')
        .single();
      if (error || !creado) redirect('/admin/login?error=bd');
      await abrirSesion(creado, next);
      redirect(destinoSeguro(next));
    }
    redirect('/admin/login?error=1');
  }

  if (!u.is_active) redirect('/admin/login?error=inactivo');

  // Una clave temporal caducada no sirve: hay que pedir otro restablecimiento.
  if (
    u.must_change_password &&
    u.temp_password_expires &&
    new Date(u.temp_password_expires).getTime() < Date.now()
  ) {
    redirect('/admin/login?error=caducada');
  }

  if (!u.password_hash || !(await verifyPassword(password, u.password_hash))) {
    redirect('/admin/login?error=1');
  }

  await db.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', u.id);
  await abrirSesion(u, next);
  // Con clave temporal, el guard de /admin lo mandaría igual a la cuenta.
  redirect(u.must_change_password ? '/admin/cuenta' : destinoSeguro(next));
}

export async function logout() {
  cookies().set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  redirect('/admin/login');
}
