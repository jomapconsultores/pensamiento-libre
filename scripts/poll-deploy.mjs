const KEY = process.env.RENDER_API_KEY ?? process.argv[2];
const SVC = process.argv[3] ?? 'srv-d8iggrnlk1mc7385a160';

if (!KEY) {
  console.error('Falta API key');
  process.exit(1);
}

const FINAL = ['live', 'build_failed', 'update_failed', 'pre_deploy_failed', 'canceled', 'deactivated'];

async function check() {
  const res = await fetch(`https://api.render.com/v1/services/${SVC}/deploys?limit=1`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const data = await res.json();
  return data[0].deploy;
}

let last = '';
while (true) {
  const d = await check();
  const stamp = new Date().toLocaleTimeString('es-EC');
  if (d.status !== last) {
    console.log(`${stamp} → ${d.status} (${d.id})`);
    last = d.status;
  }
  if (FINAL.includes(d.status)) {
    console.log(`\nFinalizado: ${d.status}`);
    if (d.status === 'live') {
      console.log(`URL: ${d.serviceDetails?.url ?? 'https://pensamiento-libre.onrender.com'}`);
    }
    break;
  }
  await new Promise((r) => setTimeout(r, 15000));
}
