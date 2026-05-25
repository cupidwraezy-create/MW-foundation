// mpesa_server_example.js
// Minimal Express example showing how to initiate an M-Pesa STK Push
// Replace the placeholder values with your Daraja (Safaricom) credentials.

const express = require('express');
const fetch = require('node-fetch');
const base64 = require('base-64');
require('dotenv').config();

const app = express();
app.use(express.json());

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

    const body = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://your-server.example.com/mpesa/callback',
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

app.listen(PORT, () => console.log(`MPesa example server running on http://localhost:${PORT}`));

/*
Instructions:
1. Install dependencies: npm install express node-fetch base-64 dotenv
2. Create a .env file with MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL
3. Run: node mpesa_server_example.js
4. From the frontend call POST /mpesa/stk with JSON { amount, phone } to initiate STK push.
*/
