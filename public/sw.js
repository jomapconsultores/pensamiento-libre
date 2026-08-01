/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

/* Service worker de la Fundación Pensamiento Libre.
 *
 * Hace instalable el sitio (PWA) y le da una pantalla digna sin conexión. Es
 * deliberadamente conservador:
 *
 *   - NUNCA cachea /admin ni /api. El panel muestra datos que cambian y decide
 *     permisos: servir una copia vieja sería mostrar información equivocada o
 *     dejar ver algo a quien ya no debería.
 *   - Para la navegación usa "red primero": si hay internet manda el servidor;
 *     si no, se responde con lo último visto y, si no hay nada, con /offline.
 *   - Para los estáticos usa "caché primero", que es donde esto rinde.
 */

const VERSION = 'fpl-v1';
const CACHE_PAGINAS = `${VERSION}-paginas`;
const CACHE_ESTATICOS = `${VERSION}-estaticos`;
const OFFLINE = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_PAGINAS).then((c) => c.addAll([OFFLINE])).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

/** Rutas que jamás deben servirse desde caché. */
function esPrivado(url) {
  return url.pathname.startsWith('/admin') || url.pathname.startsWith('/api');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (esPrivado(url)) return; // se deja pasar a la red, sin tocar

  // Navegación: red primero, con respaldo de lo último visto.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Solo se guarda lo que llegó bien y de este mismo servidor. Sin esta
          // comprobación, un error 500 o una redirección se quedaban guardados
          // y luego se servían como si fueran la página buena.
          if (res.ok && res.type === 'basic') {
            const copia = res.clone();
            caches.open(CACHE_PAGINAS).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(OFFLINE))),
    );
    return;
  }

  // Estáticos: caché primero.
  if (/\.(?:css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cacheado) => cacheado || fetch(req).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copia = res.clone();
          caches.open(CACHE_ESTATICOS).then((c) => c.put(req, copia));
        }
        return res;
      })),
    );
  }
});
