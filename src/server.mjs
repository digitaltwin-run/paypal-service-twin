import http from 'node:http';

const PORT = process.env.PORT || 8793;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const method = req.method;

  let bodyText = '';
  for await (const chunk of req) {
    bodyText += chunk;
  }
  let bodyJson = {};
  try {
    if (bodyText) bodyJson = JSON.parse(bodyText);
  } catch {
    // raw text
  }

  // Set standard CORS & JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // 1. Healthcheck Endpoint
  if (method === 'GET' && url.pathname === '/healthz') {
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, service: 'paypal-service-twin', version: '0.1.0' }));
  }

  // 2. OAuth Token Endpoint
  if (method === 'POST' && url.pathname === '/v1/oauth2/token') {
    res.statusCode = 200;
    return res.end(JSON.stringify({
      access_token: 'mock_paypal_access_token_twin_8793',
      token_type: 'Bearer',
      app_id: 'APP-80W284485P519543T',
      expires_in: 32400,
      nonce: '2026-08-12T10:49:00Z-mock-nonce'
    }));
  }

  // 3. Create Checkout Order Endpoint
  if (method === 'POST' && url.pathname === '/v2/checkout/orders') {
    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    res.statusCode = 201;
    return res.end(JSON.stringify({
      id: orderId,
      status: 'CREATED',
      intent: 'CAPTURE',
      purchase_units: bodyJson.purchase_units || [],
      links: [
        { href: `http://localhost:${PORT}/v2/checkout/orders/${orderId}`, rel: 'self', method: 'GET' },
        { href: `http://localhost:${PORT}/checkoutnow?token=${orderId}`, rel: 'approve', method: 'GET' }
      ]
    }));
  }

  // 4. Get Checkout Order Status Endpoint
  if (method === 'GET' && url.pathname.startsWith('/v2/checkout/orders/')) {
    const orderId = url.pathname.split('/').pop();
    res.statusCode = 200;
    return res.end(JSON.stringify({
      id: orderId,
      status: 'APPROVED',
      intent: 'CAPTURE',
      payer: {
        email_address: 'customer-twin@example.test',
        payer_id: 'PAYER-TWIN-999'
      }
    }));
  }

  // 5. Verify Webhook Signature Endpoint
  if (method === 'POST' && url.pathname === '/v1/notifications/verify-webhook-signature') {
    res.statusCode = 200;
    return res.end(JSON.stringify({
      verification_status: 'SUCCESS'
    }));
  }

  // 6. Subscription Status Endpoint
  if (method === 'GET' && url.pathname.startsWith('/v1/billing/subscriptions/')) {
    const subId = url.pathname.split('/').pop();
    res.statusCode = 200;
    return res.end(JSON.stringify({
      id: subId,
      status: 'ACTIVE',
      plan_id: 'P-STARTER-MOCK-PLAN',
      subscriber: {
        email_address: 'subscriber-twin@example.test'
      },
      create_time: '2026-08-12T10:00:00Z'
    }));
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'endpoint_not_found', path: url.pathname }));
});

server.listen(PORT, () => {
  console.log(`PayPal Digital Twin running on http://127.0.0.1:${PORT}`);
});
