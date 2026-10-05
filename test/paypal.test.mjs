import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

let serverProc;
const PORT = 8794;

before(async () => {
  serverProc = spawn('node', ['src/server.mjs'], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(PORT) }
  });
  await new Promise(r => setTimeout(r, 600));
});

after(() => {
  if (serverProc) serverProc.kill();
});

test('PayPal Twin /healthz endpoint', async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/healthz`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.ok, true);
  assert.strictEqual(data.service, 'paypal-service-twin');
});

test('PayPal Twin OAuth token generation', async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/v1/oauth2/token`, { method: 'POST' });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.access_token);
  assert.strictEqual(data.token_type, 'Bearer');
});

test('PayPal Twin Order creation & retrieval', async () => {
  const createRes = await fetch(`http://127.0.0.1:${PORT}/v2/checkout/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purchase_units: [{ amount: { value: '49.00', currency_code: 'EUR' } }] })
  });
  const order = await createRes.json();
  assert.strictEqual(createRes.status, 201);
  assert.strictEqual(order.status, 'CREATED');

  const getRes = await fetch(`http://127.0.0.1:${PORT}/v2/checkout/orders/${order.id}`);
  const getOrder = await getRes.json();
  assert.strictEqual(getRes.status, 200);
  assert.strictEqual(getOrder.status, 'APPROVED');
});

test('PayPal Twin Webhook verification', async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth_algo: 'SHA256withRSA', transmission_id: 'test_trans' })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.verification_status, 'SUCCESS');
});
