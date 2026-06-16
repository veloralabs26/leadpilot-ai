# LeadPilot AI

**Autonomous AI agent for B2B WhatsApp sales inquiries — AUTOTHON 2026, KFU Industrial AI Track**

LeadPilot AI handles the full first-touch sales conversation on WhatsApp — replying in under 4 seconds, classifying the lead, routing it to the right branch, and pushing it into Odoo CRM automatically. Built for Al Barrak's Challenge 5 (unified customer experience) and Challenge 6 (unified sales intelligence).

---

## The Problem

Al Barrak operates 40+ branches across Saudi Arabia. Procurement teams send WhatsApp inquiries at all hours — pricing on roll-up doors, installation quotes, emergency maintenance, Aramco annual contracts. Each message lands on a personal phone with no unified inbox, no SLA, and no way to measure which channel or branch is generating revenue.

Industry average response time: **18 hours**. By then, the customer has called three competitors.  
70% of B2B buyers go with the first supplier to respond.

---

## The Solution

Three layers running in under 4 seconds:

**Layer 1 — AI Response**  
Every WhatsApp message triggers an AI-generated reply in fluent Arabic, using Al Barrak's product catalog and pricing. No human needed for first touch.

**Layer 2 — Classification & Routing**  
Every lead is auto-tagged: Hot / Warm / RFQ / Urgent / Technical. Routed to the correct branch based on location and urgency.

**Layer 3 — Odoo Integration**  
Every lead is pushed into Al Barrak's existing Odoo CRM — pre-classified and source-tagged. Sales teams open Odoo exactly as before, but find a pre-qualified pipeline already waiting. Odoo's built-in reporting now shows channel ROI automatically.

---

## Live Demo

- **Landing page:** https://leadpilot-three-xi.vercel.app  
- **Live dashboard:** https://leadpilot-three-xi.vercel.app/dashboard.html  
- **Ask the bot:** https://leadpilot-three-xi.vercel.app/ask.html

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Engine | Claude claude-sonnet-4-6 (Anthropic) |
| Messaging | WhatsApp Business Cloud API (Meta) |
| Backend | Node.js + Express |
| CRM Integration | Odoo JSON-RPC API |
| Frontend | Vanilla HTML/CSS/JS |
| Hosting | Vercel |

---

## Project Structure

```
leadpilot-ai/
├── index.html          # Bilingual landing page (AR/EN)
├── dashboard.html      # Real-time pipeline dashboard
├── ask.html            # Judge Q&A assistant
├── assets/             # CSS, fonts, icons
├── server/
│   ├── index.js        # Express server + webhook handler
│   ├── ai.js           # Claude AI response generation
│   ├── classifier.js   # Lead type + branch detection
│   ├── whatsapp.js     # WhatsApp Cloud API client
│   ├── odoo.js         # Odoo CRM integration
│   └── config.js       # Environment configuration
├── package.json
├── .env.example
└── ARCHITECTURE.md
```

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/ai247sa/leadpilot-ai.git
cd leadpilot-ai
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```
WHATSAPP_TOKEN=          # Meta WhatsApp Business token
WHATSAPP_VERIFY_TOKEN=   # Any string you choose for webhook verification
WHATSAPP_PHONE_NUMBER_ID= # From Meta Developer Console
ANTHROPIC_API_KEY=       # From console.anthropic.com
ODOO_URL=                # e.g. https://albarrak.odoo.com
ODOO_DB=                 # Your Odoo database name
ODOO_USERNAME=           # Odoo login email
ODOO_PASSWORD=           # Odoo password
PORT=3000
```

### 3. Run the server

```bash
npm start
```

### 4. Expose to the internet (for WhatsApp webhook)

```bash
npx ngrok http 3000
```

Use the ngrok URL as your webhook in the Meta Developer Console:  
`https://your-ngrok-url.ngrok.io/webhook`

### 5. Set the WhatsApp webhook

In [Meta Developer Console](https://developers.facebook.com):
- Webhook URL: `https://your-domain/webhook`
- Verify token: value from `WHATSAPP_VERIFY_TOKEN`
- Subscribe to: `messages`

---

## How It Works

```
Customer sends WhatsApp message
        ↓
Meta sends POST to /webhook
        ↓
extractMessage() parses the payload
        ↓
classifyLead() → type + urgency + estimated value
detectBranch() → nearest Al Barrak branch
        ↓
generateReply() → Claude generates Arabic response
        ↓
sendMessage() → reply delivered via WhatsApp API   ← ~4 seconds total
        ↓
pushLead() → Odoo CRM entry created (non-blocking)
        source_channel: WhatsApp
        lead_type: Hot/Warm/RFQ/Urgent/Technical
        branch: Riyadh HQ / Jeddah / Dammam / etc.
```

---

## Hackathon Challenges Addressed

**Challenge 5 — Unified Customer Experience**  
Every inquiry, from every branch, goes into one AI-powered intake layer. Customers get a professional response in 4 seconds. The sales team sees the full conversation history and lead context — regardless of which branch handles it.

**Challenge 6 — Unified Sales Intelligence**  
Every lead pushed to Odoo carries its source channel, branch, and classification tag. Al Barrak's existing Odoo reports now surface channel ROI automatically. No new reporting tool required.

---

## Built By

**AI 247 Inc.**  
AUTOTHON 2026 · KFU · Industrial AI Track  
© 2026 AI 247 Inc.
