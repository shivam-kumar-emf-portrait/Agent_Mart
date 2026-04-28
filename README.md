# AgentMart 🤖

**Pay-per-task AI agent marketplace — built for humans and autonomous AI agents equally.**

AgentMart is a full-stack web application where you can browse, purchase, and receive AI-powered micro-services, all settled in USDC on-chain via Locus Checkout. The defining feature is a **machine-readable service registry** — every service is described with structured JSON schemas, making the entire platform fully programmable by autonomous AI agents with zero human involvement.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| AI Tasks | OpenAI API (gpt-4o-mini) |
| Payments | Locus Checkout (simulated, Stripe-style) |
| Routing | React Router v6 |

---

## Project Structure

```
agentmart/
├── backend/
│   ├── index.js              # Express server
│   ├── db.js                 # SQLite setup + seed data
│   ├── .env                  # Environment variables
│   ├── routes/
│   │   ├── services.js       # GET /api/services
│   │   ├── checkout.js       # POST /api/checkout/create
│   │   ├── webhook.js        # POST /api/webhook/locus + simulate
│   │   └── orders.js         # GET /api/orders/:sessionId
│   └── agents/
│       ├── summarizer.js     # Document Summarizer agent
│       ├── codeReviewer.js   # AI Code Reviewer agent
│       └── dataExtractor.js  # URL Data Extractor agent
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        ├── pages/
        │   ├── Marketplace.jsx
        │   ├── ServiceDetail.jsx
        │   ├── CheckoutPage.jsx
        │   └── ResultPage.jsx
        └── components/
            ├── Navbar.jsx
            ├── ServiceCard.jsx
            └── AgentBadge.jsx
```

---

## Quick Start

### 1. Configure Environment Variables

Edit `backend/.env`:

```env
OPENAI_API_KEY=sk-...         # Required for AI tasks
LOCUS_SECRET_KEY=             # Locus SDK key (optional for demo)
LOCUS_WEBHOOK_SECRET=         # Locus webhook secret (optional for demo)
LOCUS_PUBLIC_KEY=pk_test_demo
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 2. Install & Run Backend

```bash
cd agentmart/backend
npm install
npm run dev
# → Running on http://localhost:3001
```

### 3. Install & Run Frontend

```bash
cd agentmart/frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

---

## Available Services

| Service | Price | Category |
|---------|-------|----------|
| Document Summarizer | 0.50 USDC | Text AI |
| AI Code Reviewer | 1.00 USDC | Code AI |
| URL Data Extractor | 0.25 USDC | Data AI |

---

## API Reference

### `GET /api/services`

Returns all services with `_agentmart` metadata for machine-readable discovery.

```json
{
  "_agentmart": {
    "version": "1.0",
    "description": "AgentMart machine-readable service registry...",
    "checkout_endpoint": "POST /api/checkout/create",
    "payment_currency": "USDC"
  },
  "services": [...]
}
```

### `POST /api/checkout/create`

Creates a checkout session.

```json
// Request
{ "service_id": "summarizer-v1", "buyer_input": { "text": "..." } }

// Response
{ "session_id": "locus_session_...", "checkout_url": "...", "locus_component_props": {...} }
```

### `POST /api/webhook/locus`

Locus calls this when on-chain payment is confirmed. Verifies signature, runs AI agent, stores result.

### `POST /api/webhook/simulate-payment`

**Demo only.** Simulates a payment confirmation and runs the AI task immediately.

```json
{ "session_id": "locus_session_..." }
```

### `GET /api/orders/:sessionId`

Poll for task status and result.

```json
{
  "session_id": "...",
  "service_id": "summarizer-v1",
  "status": "completed",
  "result": { "summary": "...", "key_points": [...] }
}
```

---

## Machine-Readable Agent API

Any autonomous AI agent can use AgentMart **programmatically with zero human involvement**:

### Step 1 — Discover Services

```http
GET https://agentmart.example.com/api/services
```

Returns JSON with `_agentmart` metadata explaining how to use the API.

### Step 2 — Create Checkout Session

```http
POST https://agentmart.example.com/api/checkout/create
Content-Type: application/json

{
  "service_id": "summarizer-v1",
  "buyer_input": {
    "text": "Paste the document text here..."
  }
}
```

Returns `{ session_id, checkout_url }`.

### Step 3 — Complete Payment

Agent opens `checkout_url` in its browser tool, connects wallet, approves USDC transaction.

### Step 4 — Poll for Result

```http
GET https://agentmart.example.com/api/orders/{session_id}
```

Poll every few seconds. When `status === "completed"`, read the `result` field.

---

## Design System

- **Background**: `#0f1117` dark navy
- **Accent**: `#7c3aed` violet/purple
- **USDC prices**: `#22c55e` green
- **Category borders**: Purple (text), Blue (code), Green (data)
- **Font**: Inter (body), JetBrains Mono (code/JSON)

---

## What Makes This Special

The core differentiator is the **machine-readable service registry**. Every service on AgentMart is described with structured input/output schemas in JSON, and the `/api/services` endpoint includes a `_agentmart` metadata block that teaches any AI agent how to discover, purchase, and consume services — completely autonomously, without a human in the loop.

One Locus Checkout integration serves both a polished human-facing React UI and a fully programmatic agent-facing API. This is the defining feature of the **agent economy**: infrastructure that works for humans and machines equally well.
