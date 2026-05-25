// mpesa_server_example.js
// Minimal Express example showing how to initiate an M-Pesa STK Push
// Replace the placeholder values with your Daraja (Safaricom) credentials.

const express = require('express');
const fetch = require('node-fetch');
const base64 = require('base-64');
require('dotenv').config();

const app = express();
app.use(express.json());

const ADMIN_USERNAME = process.env.ADMIN_USER || 'Admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASS || 'password';

function authorizeAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Authentication required.');
  }

  const encoded = authHeader.split(' ')[1] || '';
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const [username, password] = decoded.split(':');

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Invalid credentials.');
  }

  next();
}

app.use(['/admin.html', '/donations/list', '/donations/stream', '/donations/add'], authorizeAdmin);
app.get('/admin', authorizeAdmin, (req, res) => res.redirect('/admin.html'));
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'YOUR_CONSUMER_KEY';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'YOUR_CONSUMER_SECRET';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379'; // example
const PASSKEY = process.env.MPESA_PASSKEY || 'YOUR_PASSKEY';

const SANDBOX = true; // change to false for production
const OAUTH_URL = SANDBOX
  ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
  : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const STK_PUSH_URL = SANDBOX
  ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';

async function getAccessToken() {
  const creds = base64.encode(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
  const res = await fetch(OAUTH_URL, {
    headers: { Authorization: `Basic ${creds}` },
  });
  const data = await res.json();
  return data.access_token;
}

function lipaNaMpesaPassword(shortcode, passkey, timestamp) {
  const toEncode = `${shortcode}${passkey}${timestamp}`;
  return base64.encode(toEncode);
}

// POST /mpesa/stk - body: { amount: number, phone: '2547XXXXXXXX' , accountRef?, description? }
app.post('/mpesa/stk', async (req, res) => {
  try {
    const { amount, phone, accountRef = 'MWFoundation', description = 'Donation' } = req.body;
    if (!amount || !phone) return res.status(400).json({ error: 'Missing amount or phone' });

    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = lipaNaMpesaPassword(SHORTCODE, PASSKEY, timestamp);

    if (!CALLBACK_URL) {
      return res.status(500).json({ error: 'MPESA_CALLBACK_URL is not configured. Set it in .env and expose your local server with ngrok.' });
    }

    const body = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountRef,
      TransactionDesc: description,
    };

    const r = await fetch(STK_PUSH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Simple donations persistence (file-based). In production use a real DB.
const DONATIONS_FILE = './donations.json';
function readDonations() {
  try {
    const raw = require('fs').readFileSync(DONATIONS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function saveDonations(list) {
  require('fs').writeFileSync(DONATIONS_FILE, JSON.stringify(list, null, 2));
}

// Endpoint for M-Pesa callback (Daraja will POST here)
app.post('/mpesa/callback', (req, res) => {
  // Acknowledge quickly
  res.json({ ResultCode: 0, ResultDesc: 'Received' });

  try {
    const body = req.body;
    // The STK callback payload is usually under body.Body.stkCallback
    const stk = body?.Body?.stkCallback;
    if (!stk) return;

    const resultCode = stk.ResultCode;
    const checkoutRequestID = stk.CheckoutRequestID;
    const merchantRequestID = stk.MerchantRequestID;

    if (resultCode === 0) {
      // Extract amount and phone from CallbackMetadata
      const items = stk.CallbackMetadata?.Item || [];
      const amountItem = items.find(i => i.Name === 'Amount');
      const phoneItem = items.find(i => i.Name === 'PhoneNumber');
      const amount = amountItem ? parseFloat(amountItem.Value) : 0;
      const phone = phoneItem ? String(phoneItem.Value) : undefined;

      const donations = readDonations();
      donations.push({ id: merchantRequestID || checkoutRequestID, amount, phone, timestamp: new Date().toISOString() });
      saveDonations(donations);
      console.log('Donation recorded:', { amount, phone });
    } else {
      console.log('STK result non-zero:', resultCode, stk.ResultDesc);
    }
  } catch (err) {
    console.error('Error handling MPesa callback', err);
  }
});

// API: get total donations
app.get('/donations/total', (req, res) => {
  const donations = readDonations();
  const total = donations.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  res.json({ total });
});

// API: list donations (admin)
app.get('/donations/list', (req, res) => {
  const donations = readDonations();
  res.json({ donations });
});

// Server-Sent Events for live total updates
app.get('/donations/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const send = () => {
    const donations = readDonations();
    const total = donations.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    res.write(`data: ${JSON.stringify({ total })}\n\n`);
  };

  const iv = setInterval(send, 10000);
  // send initial
  send();

  req.on('close', () => clearInterval(iv));
});

// Convenient test endpoint to add a donation (useful in development)
app.post('/donations/add', (req, res) => {
  const { amount = 0, phone = 'unknown' } = req.body || {};
  const donations = readDonations();
  donations.push({ id: 'dev-' + Date.now(), amount: Number(amount), phone, timestamp: new Date().toISOString() });
  saveDonations(donations);
  res.json({ ok: true });
});

// Paystack webhook verification and recording (optional)
const crypto = require('crypto');
app.post('/paystack/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || '';
  const signature = req.headers['x-paystack-signature'];
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(req.body).digest('hex');
  if (signature !== hash) {
    res.status(400).send('invalid signature');
    return;
  }

  const payload = JSON.parse(req.body.toString());
  // Handle successful charge event
  if (payload.event === 'charge.success') {
    const amount = (payload.data.amount || 0) / 100; // Paystack in minor units
    const email = payload.data.customer?.email || 'unknown';
    const donations = readDonations();
    donations.push({ id: payload.data.reference, amount, email, timestamp: new Date().toISOString() });
    saveDonations(donations);
    console.log('Paystack donation recorded', amount);
  }
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`MPesa example server running on http://localhost:${PORT}`);
  if (!CALLBACK_URL) {
    console.warn('Warning: MPESA_CALLBACK_URL is not set. STK requests will fail until this is configured in .env to a public HTTPS URL.');
  } else {
    console.log(`Using MPESA_CALLBACK_URL: ${CALLBACK_URL}`);
  }
});

/*
Instructions:
1. Install dependencies: npm install express node-fetch base-64 dotenv
2. Create a .env file with MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL
3. Run: node mpesa_server_example.js
4. From the frontend call POST /mpesa/stk with JSON { amount, phone } to initiate STK push.
*/
