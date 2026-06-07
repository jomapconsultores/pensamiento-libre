// Aplica la migración SQL inicial al proyecto Supabase
// Uso:  node scripts/apply-migration.mjs
// Requiere SUPABASE_DB_PASSWORD en .env.local

import postgres from 'postgres';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Cargar .env.local manualmente (Next.js no lo expone a scripts standalone)
function loadEnv() {
  try {
    const content = readFileSync(join(ROOT, '.env.local'), 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  } catch {}
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL en .env.local');
  process.exit(1);
}
if (!dbPassword) {
  console.error('❌ Falta SUPABASE_DB_PASSWORD en .env.local');
  console.error('   → Obtén la contraseña en:');
  console.error('     https://supabase.com/dashboard/project/przkcufncvwejpllbxbo/settings/database');
  console.error('   → Agrega:  SUPABASE_DB_PASSWORD=tu_password');
  process.exit(1);
}

const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

// Usar el connection pooler (puerto 6543, region us-east-1 por defecto en Supabase)
// El pooler funciona desde cualquier red, mientras que :5432 directo a veces tiene IPv6.
const connectionString =
  `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}` +
  `@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
});

const migrationsDir = join(ROOT, 'supabase', 'migrations');
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

console.log(`🗂  Encontradas ${files.length} migración(es): ${files.join(', ')}`);
console.log(`🔌 Conectando a ${projectRef}...`);

try {
  for (const file of files) {
    const content = readFileSync(join(migrationsDir, file), 'utf8');
    console.log(`\n▶ Aplicando ${file}...`);
    await sql.unsafe(content);
    console.log(`✅ ${file} aplicado.`);
  }

  // Verificación
  const tables = await sql`
    select tablename from pg_tables
    where schemaname = 'public'
    order by tablename
  `;
  console.log('\n📋 Tablas en public:');
  for (const t of tables) console.log(`   • ${t.tablename}`);
  console.log('\n🎉 Migración completada con éxito.');
} catch (err) {
  console.error('\n❌ Error aplicando migración:');
  console.error(err.message);
  process.exit(1);
} finally {
  await sql.end();
}
