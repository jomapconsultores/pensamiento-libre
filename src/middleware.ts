/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession, verifySession } from '@/lib/auth';

// El panel dejó de protegerse con una clave compartida en variables de entorno:
// ahora cada persona tiene su cuenta (tabla admin_users). El middleware solo
// comprueba que haya sesión firmada; quién es y qué puede hacer lo resuelve
// src/lib/adminAuth.ts contra la base, que es donde se puede revocar de verdad.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  // La pantalla de acceso tiene que ser alcanzable sin sesión.
  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  const secret = process.env.SESSION_SECRET ?? '';
  if (!secret) {
    return new NextResponse(
      'Panel no configurado: define SESSION_SECRET en el entorno (una cadena larga y aleatoria).',
      { status: 503 },
    );
  }

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value, secret);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Ventana deslizante: se reemite el token con marca de tiempo fresca, así la
  // sesión caduca sola tras una hora sin navegar.
  const res = NextResponse.next();
  res.cookies.set(SESSION_COOKIE, await signSession(session, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
