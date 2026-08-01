/* ------------------------------------------------------------
 * Desarrollado por Marco Antonio Posligua San Martín
 * ------------------------------------------------------------ */

// Sesión del panel administrativo, firmada con HMAC-SHA256. Usa WebCrypto, así
// que el mismo módulo sirve en Node y en el runtime Edge del middleware.
//
// El token es: base64url(JSON.stringify({uid, email, role, ts})) + "." + firma.
// `ts` implementa la ventana deslizante de inactividad: el middleware reemite el
// token en cada navegación, de modo que la sesión muere sola si nadie navega.

const te = new TextEncoder();
const td = new TextDecoder();

export const SESSION_COOKIE = 'pl_admin';
export const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hora sin actividad
export const SESSION_MAX_AGE_SECONDS = 60 * 60;

/** Longitud mínima al DEFINIR una clave nueva. */
export const MIN_PASSWORD = 8;

export type SessionData = { uid: string; email: string; role: string };

function toB64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string): string {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return td.decode(bytes);
}

async function hmac(message: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw', te.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, te.encode(message)));
}

/** Comparación en tiempo constante: una comparación normal filtra la firma byte a byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(data: SessionData, secret: string): Promise<string> {
  const payload = JSON.stringify({ ...data, ts: Date.now() });
  const sig = toB64url(await hmac(payload, secret));
  return toB64url(te.encode(payload)) + '.' + sig;
}

export async function verifySession(
  token: string | undefined,
  secret: string,
): Promise<SessionData | null> {
  if (!token || !secret) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  let raw: string;
  try {
    raw = fromB64url(payload);
  } catch {
    return null;
  }
  if (!safeEqual(sig, toB64url(await hmac(raw, secret)))) return null;
  try {
    const { uid, email, role, ts } = JSON.parse(raw);
    if (typeof uid !== 'string' || typeof email !== 'string') return null;
    if (typeof ts === 'number' && Date.now() - ts > IDLE_TIMEOUT_MS) return null;
    return { uid, email, role: typeof role === 'string' ? role : 'funcionario' };
  } catch {
    return null;
  }
}

// ---------- Cifrado de contraseñas (PBKDF2-SHA256, 100 000 iteraciones) ----------
function bytesToHex(b: Uint8Array): string {
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(h: string): Uint8Array {
  const a = new Uint8Array(h.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16);
  return a;
}

async function pbkdf2Hex(password: string, saltHex: string): Promise<string> {
  const k = await crypto.subtle.importKey(
    'raw', te.encode(password) as BufferSource, 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex) as BufferSource, iterations: 100000, hash: 'SHA-256' },
    k, 256,
  );
  return bytesToHex(new Uint8Array(bits));
}

/** Genera "salt:hash" para guardar una contraseña. */
export async function hashPassword(password: string): Promise<string> {
  const saltHex = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  return saltHex + ':' + (await pbkdf2Hex(password, saltHex));
}

/** Verifica una contraseña contra el "salt:hash" guardado. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, h] = (stored || '').split(':');
  if (!saltHex || !h) return false;
  return safeEqual(await pbkdf2Hex(password, saltHex), h);
}

/** Clave temporal legible: sin caracteres ambiguos (0/O, 1/l/I) para poder
 *  dictarla por teléfono sin errores. Aleatoriedad criptográfica. */
export function generateTempPassword(length = 12): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
