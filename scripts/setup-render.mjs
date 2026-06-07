// Crea el servicio Web en Render vía API y configura todas las env vars.
// Uso:  node scripts/setup-render.mjs
// Requiere RENDER_API_KEY en .env.local (o como env var)

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const ENV_PATH = join(ROOT, '.env.local');

function loadEnv() {
  if (!existsSync(ENV_PATH)) return;
  const content = readFileSync(ENV_PATH, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}
loadEnv();

const RENDER_API_KEY = process.env.RENDER_API_KEY;
const REPO_URL = process.env.RENDER_REPO_URL ?? 'https://github.com/jomapconsultores/pensamiento-libre';
const SERVICE_NAME = 'pensamiento-libre';
const REGION = 'oregon';
const BRANCH = 'main';

if (!RENDER_API_KEY) {
  console.error('❌ Falta RENDER_API_KEY en .env.local');
  console.error('   Generala en: https://dashboard.render.com/u/settings#api-keys');
  process.exit(1);
}

const API = 'https://api.render.com/v1';
const headers = {
  Authorization: `Bearer ${RENDER_API_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...(opts.headers ?? {}) } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${opts.method ?? 'GET'} ${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

// Recolectar todas las env vars no-Stripe y no-DB desde .env.local
function collectEnvVars() {
  const vars = [
    'NODE_ENV',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_DONATION_PRICE_ID',
    'STRIPE_MEMBERSHIP_BASIC_PRICE_ID',
    'STRIPE_MEMBERSHIP_PREMIUM_PRICE_ID',
    'STRIPE_SERVICE_TALLER_PRICE_ID',
    'STRIPE_SERVICE_CONSULTA_PRICE_ID',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'CONTACT_EMAIL',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'NEXT_PUBLIC_SITE_URL',
  ];
  const out = [];
  for (const key of vars) {
    let value = process.env[key];
    if (key === 'NODE_ENV') value = 'production';
    if (value === undefined || value === '') continue;
    out.push({ key, value });
  }
  return out;
}

async function findOwner() {
  const data = await api('/owners');
  const owner = data?.[0]?.owner ?? data?.[0];
  if (!owner?.id) throw new Error('No se pudo obtener el owner ID de Render.');
  return owner;
}

async function findExistingService(ownerId) {
  const data = await api(`/services?name=${encodeURIComponent(SERVICE_NAME)}&ownerId=${ownerId}`);
  return data?.[0]?.service ?? null;
}

async function createService(ownerId, envVars) {
  console.log(`\n📦 Creando servicio "${SERVICE_NAME}" en ${REGION}...`);
  return api('/services', {
    method: 'POST',
    body: JSON.stringify({
      type: 'web_service',
      name: SERVICE_NAME,
      ownerId,
      repo: REPO_URL,
      autoDeploy: 'yes',
      branch: BRANCH,
      rootDir: '',
      envVars,
      serviceDetails: {
        env: 'node',
        plan: 'free',
        region: REGION,
        buildCommand: 'npm install && npm run build',
        startCommand: 'npm run start',
        healthCheckPath: '/',
      },
    }),
  });
}

async function updateEnvVars(serviceId, envVars) {
  console.log(`🔐 Actualizando ${envVars.length} variables de entorno...`);
  return api(`/services/${serviceId}/env-vars`, {
    method: 'PUT',
    body: JSON.stringify(envVars),
  });
}

async function triggerDeploy(serviceId) {
  console.log('🚀 Lanzando deploy...');
  return api(`/services/${serviceId}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'do_not_clear' }),
  });
}

try {
  const envVars = collectEnvVars();
  console.log(`📋 Variables a configurar: ${envVars.length}`);

  const owner = await findOwner();
  console.log(`👤 Owner: ${owner.name ?? owner.email} (${owner.id})`);

  let service = await findExistingService(owner.id);
  let deploy;
  if (service) {
    console.log(`✓ Servicio ya existe: ${service.id}`);
    await updateEnvVars(service.id, envVars);
    deploy = await triggerDeploy(service.id);
  } else {
    const created = await createService(owner.id, envVars);
    service = created.service ?? created;
    deploy = created.deploy;
  }

  console.log('\n✅ Servicio listo.');
  console.log(`   URL: ${service.serviceDetails?.url ?? `https://${service.slug ?? SERVICE_NAME}.onrender.com`}`);
  console.log(`   Dashboard: https://dashboard.render.com/web/${service.id}`);
  if (deploy?.id) console.log(`   Deploy: ${deploy.id} (${deploy.status})`);
  console.log('\n⏳ El build tarda ~3-5 min. Monitorea el progreso en el dashboard.');
} catch (err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
}
