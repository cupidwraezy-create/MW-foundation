MPesa Integration and Local Server (README)

Overview
- This repo includes a minimal Node/Express example that demonstrates initiating an M-Pesa STK Push (`/mpesa/stk`) and receiving the STK callback (`/mpesa/callback`).
- Confirmed donations are saved to `donations.json`. The frontend polls `/donations/total` to show the confirmed total.

Files added/modified
- `mpesa_server_example.js` - Express server: STK initiation, callback webhook, donation persistence, and helper endpoints.
- `donations.json` - Simple file storing recorded donations.
- `index.html` - Frontend now includes M-Pesa phone input, Paystack and M-Pesa buttons, and polling of `/donations/total`.

Setup (local sandbox testing)
1. Install dependencies

```bash
npm install express node-fetch base-64 dotenv
```

2. Create `.env` in the project root with these variables (get sandbox keys from Safaricom Daraja):

```
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_sandbox_passkey
MPESA_CALLBACK_URL=https://<your-public-url>/mpesa/callback
```

3. Start server

```bash
node mpesa_server_example.js
```

4. Expose your local server to the internet (required for M-Pesa callbacks). Use `ngrok`:

```bash
ngrok http 3000
# set MPESA_CALLBACK_URL to the https://xxxxx.ngrok.io/mpesa/callback URL in your .env and in the Safaricom sandbox app settings
```

4. On the frontend, open the site through the local server in your browser:

```bash
http://localhost:3000/index.html
```

Testing STK Push
- Use the M-Pesa phone input and the "Pay with M-Pesa" button. Enter the number in Kenyan format: `2547XXXXXXXX`.
- The server POSTs to Safaricom STK endpoint and Safaricom will push to the phone and then POST the result to `/mpesa/callback`.
- Confirmed donations are saved to `donations.json` and will appear in the UI after `/donations/total` polling refresh.

Notes & Next steps
- This example uses file-based persistence for simplicity. For production use a database (Postgres, MySQL, or a hosted DB).
- Secure your server and validate incoming callbacks (verify signatures if available).
- Add server-side verification and reconcilers for missing callbacks.
- Admin access is protected with HTTP Basic Auth using:
  - username: `Admin`
  - password: `password`
- If you want, I can add a `package.json`, a webhook verification example, or a small admin page to view donations.
