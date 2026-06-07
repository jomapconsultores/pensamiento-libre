// Crea automáticamente los productos y precios en Stripe.
// Después escribe los IDs de precio resultantes en .env.local.
//
// Uso:  node scripts/setup-stripe.mjs
// Requiere STRIPE_SECRET_KEY en .env.local.

import Stripe from 'stripe';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('❌ Falta STRIPE_SECRET_KEY en .env.local');
  console.error('   Obtén tu clave en: https://dashboard.stripe.com/test/apikeys');
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' });

const PRODUCTS = [
  {
    envVar: 'STRIPE_MEMBERSHIP_BASIC_PRICE_ID',
    product: {
      name: 'Membresía Solidaria',
      description: 'Apoyo mensual a la Fundación Pensamiento Libre — plan Solidario.',
      metadata: { tier: 'basic', kind: 'membership' },
    },
    price: { unit_amount: 1000, currency: 'usd', recurring: { interval: 'month' } },
  },
  {
    envVar: 'STRIPE_MEMBERSHIP_PREMIUM_PRICE_ID',
    product: {
      name: 'Membresía Patrocinadora',
      description: 'Apoyo mensual premium con beneficios exclusivos.',
      metadata: { tier: 'premium', kind: 'membership' },
    },
    price: { unit_amount: 3000, currency: 'usd', recurring: { interval: 'month' } },
  },
  {
    envVar: 'STRIPE_SERVICE_CONSULTA_PRICE_ID',
    product: {
      name: 'Consulta psicológica individual',
      description: 'Sesión de 50 minutos con uno de nuestros psicólogos certificados.',
      metadata: { service_id: 'consulta', kind: 'service' },
    },
    price: { unit_amount: 4500, currency: 'usd' },
  },
  {
    envVar: 'STRIPE_SERVICE_TALLER_PRICE_ID',
    product: {
      name: 'Taller de Pensamiento Libre',
      description: 'Taller grupal de 3 horas con materiales y certificado.',
      metadata: { service_id: 'taller', kind: 'service' },
    },
    price: { unit_amount: 6000, currency: 'usd' },
  },
];

async function findExistingProduct(name) {
  // Buscar entre los últimos 100 productos activos
  const list = await stripe.products.list({ limit: 100, active: true });
  return list.data.find((p) => p.name === name);
}

async function findActivePriceForProduct(productId, expected) {
  const list = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return list.data.find((p) => {
    if (p.unit_amount !== expected.unit_amount) return false;
    if (p.currency !== expected.currency) return false;
    if (expected.recurring && (!p.recurring || p.recurring.interval !== expected.recurring.interval)) return false;
    if (!expected.recurring && p.recurring) return false;
    return true;
  });
}

async function ensure(item) {
  let product = await findExistingProduct(item.product.name);
  if (product) {
    console.log(`↪ Producto existente: ${product.name}`);
  } else {
    product = await stripe.products.create(item.product);
    console.log(`✚ Creado producto: ${product.name}`);
  }

  let price = await findActivePriceForProduct(product.id, item.price);
  if (price) {
    console.log(`  ↪ Precio existente: ${price.id} ($${item.price.unit_amount / 100})`);
  } else {
    price = await stripe.prices.create({ ...item.price, product: product.id });
    console.log(`  ✚ Creado precio: ${price.id} ($${item.price.unit_amount / 100})`);
  }

  return { envVar: item.envVar, priceId: price.id };
}

function updateEnvFile(updates) {
  const content = readFileSync(ENV_PATH, 'utf8').split('\n');
  for (const { envVar, priceId } of updates) {
    const idx = content.findIndex((line) => line.startsWith(`${envVar}=`));
    if (idx >= 0) content[idx] = `${envVar}=${priceId}`;
    else content.push(`${envVar}=${priceId}`);
  }
  writeFileSync(ENV_PATH, content.join('\n'));
}

console.log('🔌 Configurando productos y precios en Stripe...\n');

try {
  const results = [];
  for (const item of PRODUCTS) {
    results.push(await ensure(item));
  }

  updateEnvFile(results);
  console.log('\n📝 .env.local actualizado con los price IDs.');
  console.log('\n🎉 Setup completo. Reinicia el dev server para que cargue las nuevas variables:');
  console.log('   npx next dev');
} catch (err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
}
