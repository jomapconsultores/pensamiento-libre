import { NextResponse, type NextRequest } from 'next/server';

function unauthorized() {
  return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin Pensamiento Libre"' },
  });
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      'Admin no configurado. Define ADMIN_USERNAME y ADMIN_PASSWORD en .env.local.',
      { status: 503 }
    );
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) return unauthorized();

  try {
    const decoded = atob(authHeader.slice(6));
    const idx = decoded.indexOf(':');
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    if (user === expectedUser && pass === expectedPass) return NextResponse.next();
  } catch {}

  return unauthorized();
}

export const config = {
  matcher: ['/admin/:path*'],
};
