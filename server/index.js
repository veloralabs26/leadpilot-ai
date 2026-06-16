require('dotenv').config();
const express = require('express');
const path = require('path');
const config = require('./config');
const { extractMessage, sendMessage, markRead } = require('./whatsapp');
const { generateReply } = require('./ai');
const { classifyLead, detectBranch } = require('./classifier');
const { pushLead } = require('./odoo');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ── Webhook verification (Meta requires GET to verify the endpoint) ──────────
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    console.log('Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ── Incoming WhatsApp messages ───────────────────────────────────────────────
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Acknowledge immediately to avoid Meta retries

  const msg = extractMessage(req.body);
  if (!msg) return;

  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Incoming from ${msg.from}: ${msg.text}`);

  try {
    // 1. Classify lead
    const classification = classifyLead(msg.text);
    const branch = detectBranch(msg.text);

    // 2. Generate AI reply
    const reply = await generateReply(msg.text, classification);

    // 3. Send reply via WhatsApp
    await sendMessage(msg.from, reply);
    await markRead(msg.messageId);

    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[${new Date().toISOString()}] Replied in ${responseTime}s | type=${classification.type} | branch=${branch}`);

    // 4. Push to Odoo CRM (non-blocking — don't let Odoo failures affect response time)
    pushLead({
      customerPhone: msg.from,
      customerMessage: msg.text,
      aiReply: reply,
      leadType: classification.type,
      estimatedValue: classification.estimatedValue,
      branch,
    }).catch(err => console.error('Odoo push failed:', err.message));

  } catch (err) {
    console.error('Handler error:', err.message);
  }
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`LeadPilot AI server running on port ${config.port}`);
  console.log(`Webhook URL: http://localhost:${config.port}/webhook`);
});
