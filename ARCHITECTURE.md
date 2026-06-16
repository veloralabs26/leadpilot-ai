# LeadPilot AI — Architecture Document

**AUTOTHON 2026 · KFU · Industrial AI Track**  
Version 1.0 | June 2026

---

## Overview

LeadPilot AI is a three-layer autonomous sales agent designed for Saudi industrial B2B companies. It sits in front of an existing Odoo CRM as an intelligent intake layer, handling WhatsApp procurement inquiries end-to-end without human intervention.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CUSTOMER                            │
│              (WhatsApp message sent)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              META WHATSAPP CLOUD API                    │
│         (webhook POST to /webhook endpoint)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                LEADPILOT AI SERVER                      │
│                 (Node.js / Express)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  CLASSIFIER  │  │   AI ENGINE  │  │  WA CLIENT   │  │
│  │ classifyLead │  │ generateReply│  │ sendMessage  │  │
│  │ detectBranch │  │  (Claude AI) │  │  markRead    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ (non-blocking)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    ODOO CRM                             │
│              (crm.lead record created)                  │
│   source_channel | lead_type | branch | deal_value      │
└─────────────────────────────────────────────────────────┘
```

---

## Component Decisions

### 1. WhatsApp Cloud API (Meta)

**Why:** WhatsApp is the dominant B2B communication channel in Saudi Arabia (95%+ penetration among business professionals). Al Barrak's buyers already use it. No new app, no friction.

**Implementation:** Meta's Cloud API receives incoming messages as HTTP POST webhooks. The server acknowledges immediately (HTTP 200) before processing to prevent Meta retry loops.

### 2. Claude claude-sonnet-4-6 as AI Engine

**Why:** Claude was chosen over GPT-4 for its stronger Arabic language performance and more predictable response length for WhatsApp — where verbose replies hurt conversion. The system prompt is written in Arabic, enforcing dialect consistency and industrial terminology.

**Prompt design:** A single system prompt defines the Al Barrak persona, product catalog with pricing ranges, and response rules (max 3-4 sentences, always end with the team sign-off). Context-aware injections adjust the prompt based on lead type — urgent messages get a faster-close instruction; RFQ messages get a data-gathering prompt.

**Token budget:** Max 300 output tokens keeps replies concise and cost-effective.

### 3. Two-Stage Lead Classification

**Why not use the AI for classification?** Speed and cost. Running a second AI call for classification adds 1-2 seconds and doubles API cost per message. Keyword-based classification runs in <1ms and covers 95% of real procurement messages accurately.

**Stage 1 — Keyword classifier (`classifier.js`):**  
Scans the message for intent signals across five categories: Urgent, RFQ, Hot, Technical, Warm (default). Returns type, urgency flag, and a deal value estimate derived from historical Al Barrak averages.

**Stage 2 — Branch detection (`detectBranch`):**  
Scans for city names and known customer names (e.g., "Aramco" → Dhahran Branch). Falls back to Riyadh HQ. This enables the dashboard to show geographic lead distribution across Al Barrak's 40+ branches.

### 4. Odoo Integration via JSON-RPC

**Why Odoo JSON-RPC over a custom webhook?** Al Barrak already runs Odoo. Integrating at the CRM model layer (`crm.lead`) means leads appear in their existing sales pipeline without any process change for the sales team.

**Key design decision — non-blocking push:** The Odoo push happens after the WhatsApp reply is sent, in a `.catch()`-wrapped async call. This ensures Odoo latency (network, auth) never delays the customer-facing 4-second response.

**Source tagging strategy:** Three custom fields are added to `crm.lead`:
- `x_source_channel`: always `"WhatsApp"` — enables Odoo reports to filter by channel
- `x_lead_type`: Hot / Warm / RFQ / Urgent / Technical — enables pipeline segmentation
- `x_branch`: branch name — enables per-branch revenue attribution

This answers Challenge 6 (sales intelligence) using Odoo's native reporting — no new analytics tool required.

### 5. Frontend (Static HTML/CSS/JS)

**Why not React/Vue?** Zero build step. The frontend is deployed on Vercel as static files. No framework overhead, no hydration delay — the dashboard loads instantly on mobile.

Three pages:
- `index.html` — bilingual (AR/EN) landing page with full RTL support
- `dashboard.html` — real-time pipeline dashboard with live demo trigger
- `ask.html` — judge Q&A assistant with comprehensive knowledge base

---

## Data Flow (Sequence)

```
T+0ms    Customer sends WhatsApp message
T+50ms   Meta delivers POST to /webhook
T+52ms   Server sends HTTP 200 (prevents Meta retry)
T+55ms   classifyLead() + detectBranch() run (< 1ms)
T+60ms   generateReply() calls Claude API
T+3500ms Claude returns Arabic reply
T+3600ms sendMessage() delivers reply to customer
T+3650ms markRead() marks message as seen
T+3700ms pushLead() called (non-blocking)
T+4200ms Odoo CRM lead created with source tags
```

**Total customer-facing latency: ~3.5-4 seconds** (dominated by Claude API response time)

---

## Security Considerations

- Webhook verification token checked on every GET request from Meta
- `.env` file excluded from version control via `.gitignore`
- Odoo session re-authenticated on each server restart
- No customer data persisted outside Odoo

---

## Scalability

The current architecture handles Al Barrak's volume (estimated 200-500 WhatsApp messages/day) on a single server. For higher throughput:
- Replace synchronous Odoo push with a message queue (BullMQ + Redis)
- Add Redis caching for Odoo session tokens
- Deploy on Railway or Render with auto-scaling

---

## Built By

AI 247 Inc. — AUTOTHON 2026 · KFU · Industrial AI Track
