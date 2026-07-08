// Endpoint liviano para el HEALTHCHECK del contenedor (Coolify/Docker).
// Devuelve 200 sin renderizar la home ni tocar Supabase/Stripe, así el estado
// de salud del contenedor NO depende de dependencias externas.
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response('OK', {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
