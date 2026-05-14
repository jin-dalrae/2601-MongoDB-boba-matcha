<div align="center">

# 🍵 Matcha

### Autonomous Advertising Contracts for the Creator Economy

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge)](https://langchain-ai.github.io/langgraph/)

**AI agents that match creators with advertisers, negotiate deals end-to-end, audit submitted content, and settle payments on Base via the x402 protocol.**

[Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Data Model](#-data-model) • [Status](#-status)

</div>

---

## 🎯 The Problem

The creator economy is broken:

- **Creators** spend hours negotiating deals instead of creating content.
- **Advertisers** struggle to find authentic voices that match their brand.
- **Trust** is fractured — payment disputes, fake metrics, unclear deliverables.
- **Middlemen** take 30–50% cuts for simple matchmaking.

## 💡 The Solution

Matcha gives both parties an autonomous agent that talks to the other party's agent:

```
Creator ⇄ Creator Agent ⇄ Smart Contract ⇄ Advertiser Agent ⇄ Advertiser
                              │
                              ▼
                      x402 settlement on Base
```

Each agent:

- 🤝 **Negotiates** rates and terms based on learned preferences.
- 📊 **Audits** submitted content for brand-safety and quality (LLM-based).
- ✅ **Verifies** deliverables against the on-record contract terms.
- 💰 **Settles** payments in USDC/EURC/cbBTC via x402 on Base.

---

## 🏗️ Architecture

Three services, one MongoDB. The database name is pinned to `matcha` in both the Node and Python layers.

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND  (Vite + React)                  │
│                          http://localhost:5173                  │
│   Creator flow:     Dashboard · Discovery · Deals · Contracts   │
│   Advertiser flow:  Dashboard · Campaigns · Shortlist · Results │
│   Onboarding:       Role → TikTok handle → Bank → Done          │
└─────────────────────────────────────────────────────────────────┘
            │                                       │
            │  REST  (services/api.js)              │  REST  (services/agents.js)
            ▼                                       ▼
┌─────────────────────────────┐    ┌──────────────────────────────────────┐
│  NODE API   (Express +      │    │  AGENTS API   (FastAPI + LangGraph)  │
│  Mongoose)                  │    │  http://localhost:8000               │
│  http://localhost:3001/api  │    │                                      │
│                             │    │  POST  /negotiate    LLM negotiation │
│  /api/users                 │    │  POST  /audit        Content audit   │
│  /api/campaigns             │    │  POST  /settle       Audit + x402    │
│  /api/deals     (AutoBids)  │    │  GET   /negotiations/{contract_id}   │
│  /api/contracts             │    │  GET   /settlement/{contract_id}     │
│  /api/advertisers           │    │  GET   /agent-logs/{entity_id}       │
└─────────────────────────────┘    └──────────────────────────────────────┘
            │                                       │
            └──────────────────┬────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MongoDB Atlas — database: `matcha`             │
│                                                                 │
│  users · sns_accounts · agent_configs · wallets                 │
│  campaigns · auto_bids · negotiation_logs · contracts           │
│  shipments · content_submissions · audit_reports                │
│  x402_settlements · agent_logs · shared_memory                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10 (for the agents service)
- **MongoDB Atlas** account (or local MongoDB)
- An **Anthropic** *or* **OpenAI** API key (for the negotiation + audit agents)
- *(Optional)* Base wallet credentials for real on-chain settlement

### 1. Install

```bash
git clone https://github.com/your-org/matcha.git
cd matcha

# Node API
npm install

# Frontend
cd frontend && npm install && cd ..

# Python agents
cd agents
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Configure

Copy `.env.example` → `.env` in the repo root. The same file is read by **both** the Node server (`dotenv`) and the Python agents (`python-dotenv`). The frontend has its own file at `frontend/.env`.

```bash
cp .env.example .env
# then edit MONGODB_URI, ANTHROPIC_API_KEY (or OPENAI_API_KEY), etc.
```

The MongoDB **database name is pinned to `matcha`** in code (via Mongoose's `dbName` option and PyMongo's `client.matcha`), so the connection URI does not need a path component.

### 3. Seed

```bash
npm run seed
```

Populates `matcha` with 20 advertisers, 50 creators, ~30 campaigns, sample auto-bids, contracts, content submissions, audit reports, and settlements.

### 4. Run (three terminals)

```bash
# Terminal 1 — Node API           (port 3001)
npm run dev

# Terminal 2 — Frontend           (port 5173)
cd frontend && npm run dev

# Terminal 3 — Python agents      (port 8000)
cd agents && source venv/bin/activate && python server.py
```

Open <http://localhost:5173>.

---

## 📁 Project Structure

```
matcha/
├── frontend/                       Vite + React (port 5173)
│   ├── src/
│   │   ├── components/             Shared UI + modals (Negotiation, SubmitContent, …)
│   │   ├── pages/
│   │   │   ├── advertiser/         Dashboard · Campaigns · Shortlist · Results
│   │   │   ├── onboarding/         Role · Account · Bank · Completion
│   │   │   ├── Dashboard.jsx       Creator home
│   │   │   ├── Discovery.jsx       Browse campaigns
│   │   │   ├── Deals.jsx           AutoBids and active negotiations
│   │   │   ├── ActiveCampaigns.jsx Contracts in flight
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   ├── api.js              Single client for the Node API
│   │   │   └── agents.js           Client for the FastAPI agents
│   │   └── lib/advertiser.js       Advertiser-id resolution helper
│   └── .env                        VITE_API_BASE_URL, VITE_AGENTS_BASE_URL
│
├── server/                         Express + Mongoose (port 3001)
│   ├── index.js                    Entry point — pins dbName to `matcha`
│   ├── models.js                   All Mongoose schemas (one file)
│   ├── seed.js                     Faker-based seeder (npm run seed)
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── campaignController.js
│   │   ├── dealController.js
│   │   ├── contractController.js
│   │   └── advertiserController.js
│   └── routes/                     One file per resource
│
├── agents/                         FastAPI + LangGraph (port 8000)
│   ├── server.py                   FastAPI entry point
│   ├── negotiation_agent.py        Multi-round LLM negotiation graph
│   ├── payment_agent.py            Audit + x402 settlement on Base
│   ├── state.py                    TypedDict graph state
│   └── requirements.txt
│
├── .env.example                    Env vars for server + agents
└── package.json                    npm run dev | seed
```

---

## 🔌 API Reference

### Node API (`http://localhost:3001/api`)

#### Users
```http
GET    /users/:id                      User by id
GET    /users/:id/profile              User with wallet, SNS, agent config
GET    /users/role/:role               Users by role (Creator | Advertiser)
POST   /users                          Create user (used by onboarding)
PUT    /users/:id                      Update user
```

#### Campaigns
```http
GET    /campaigns/active               All active campaigns
GET    /campaigns/:id                  Campaign details
GET    /campaigns/:id/stats            Campaign stats
GET    /campaigns/advertiser/:id       Campaigns for an advertiser
POST   /campaigns                      Create campaign
PUT    /campaigns/:id                  Update campaign
```

#### Deals (AutoBids)
```http
GET    /deals/:id                                  Deal with negotiation log
GET    /deals/creator/:creatorId                   Deals for a creator
GET    /deals/creator/:creatorId/status/:status    Filtered by status
GET    /deals/campaign/:campaignId                 Deals for a campaign
POST   /deals                                      Create AutoBid
PUT    /deals/:id                                  Update AutoBid
```

#### Contracts
```http
GET    /contracts/active                                Active contracts
GET    /contracts/:id                                   Contract + submission + audit + settlement
GET    /contracts/creator/:creatorId                    Contracts for a creator
GET    /contracts/advertiser/:advertiserId              Contracts for an advertiser
GET    /contracts/advertiser/:advertiserId/submissions  With submission/audit/settlement nested
POST   /contracts                                       Create contract
POST   /contracts/:id/submission                        Submit content URL for a contract
PUT    /contracts/:id                                   Update contract
```

#### Advertiser dashboard
```http
GET    /advertisers/sample                                Pick any advertiser (dev helper)
GET    /advertisers/:id/overview                          Budget + agent activity
GET    /advertisers/:id/shortlist                         Ranked creator matches for active campaign
GET    /advertisers/:id/campaigns/summary?limit=N         Campaign cards
GET    /advertisers/:id/campaigns/:campaignId/detail      Timeline + creator performance
```

### Agents API (`http://localhost:8000`)

```http
POST   /negotiate                Run the LangGraph negotiation between agents
POST   /audit                    Audit submitted content (no payment)
POST   /settle                   Audit + execute x402 transfer on Base
GET    /negotiations/{cid}       Negotiation history for a contract
GET    /settlement/{cid}         Settlement record for a contract
GET    /agent-logs/{entityId}    Recent agent activity for an entity
```

---

## 🧪 Data Model

13 collections, all defined in `server/models.js`. Highlights:

```
User                role: Advertiser | Creator
                    onboarding_status, name, email

Campaign            advertiserId · title · product_info · budget_limit · status

AutoBid             campaignId · creatorId · current_bid · status
                    (status ∈ Negotiating | Accepted | Cancelled | Proposed)

NegotiationLog      autoBidId · round_history[]  ← written by negotiation agent
                    agent_logic_summary

Contract            autoBidId · advertiserId · creatorId
                    base_payout · conditional_tiers · audit_criteria
                    status ∈ Draft | Signed | Active | Auditing | Settled | …

ContentSubmission   contractId · content_url
AuditReport        submissionId · content_score · tier_achieved · reasoning_log
X402Settlement     contractId · auditReportId · status · total_paid · receipt_hash

AgentLog · SharedMemory · SNSAccount · AgentConfig · Wallet · Shipment
```

End-to-end flow:

```
onboarding   → POST /api/users
discovery    → GET  /api/campaigns/active
bid          → POST /api/deals
negotiate    → POST :8000/negotiate          (writes NegotiationLog)
contract     → POST /api/contracts
submit       → POST /api/contracts/:id/submission   (creates ContentSubmission, contract.status = Auditing)
audit        → POST :8000/audit                     (writes AuditReport)
settle       → POST :8000/settle                    (writes X402Settlement, on-chain transfer if X402_* set)
```

---

## 🧭 Status

What's wired today vs what's WIP. Be honest with yourself.

| Capability | State | Notes |
|---|---|---|
| Onboarding persists user | ✅ Wired | `OnboardingFlow` now `POST`s `/api/users` and stores `matcha_user_id` |
| Creator browses campaigns | ✅ Wired | Real fetch via `campaignAPI.getActiveCampaigns()` |
| Place auto-bid | ✅ Wired | `dealAPI.createDeal` |
| AI negotiation | 🟡 Available, opt-in | `NegotiationModal` accepts `dealContext` prop → calls `:8000/negotiate`. Call sites still demo-mode by default. |
| Content submission | 🟡 Available, opt-in | `SubmitContentModal` accepts `contractId` prop → real `POST /contracts/:id/submission` + `:8000/audit`. Without the prop, scripted demo flow. |
| Advertiser dashboard | ✅ Wired | Overview / campaigns / shortlist / results all on real endpoints |
| x402 settlement | ✅ Endpoint exists | Real transfers when `X402_WALLET_ADDRESS` and `X402_PRIVATE_KEY` are set; otherwise simulated |
| Auth | ❌ Not implemented | Routes are open — anyone with an id can hit any endpoint |

---

## 🎨 Design System

Light, calm, matcha-green. Two fonts: **Gluten** for the wordmark, **Inter** for everything else.

| Token | Value |
|---|---|
| `--adv-bg-primary` | `#F7F9F8` |
| `--adv-bg-card` | `#FFFFFF` |
| `--adv-accent-primary` | `#9FE870` |
| `--adv-text-primary` | `#1A1D1C` |
| `--adv-text-secondary` | `#5C6662` |
| `--adv-divider` | `#E2E8E5` |

Status palette: 🟢 Live `#9FE870` · 🟡 Matching `#F2E394` · 🔴 Review `#E5989B` · ⚪ Draft `#8A9491`

---

## 🏆 Built For

<div align="center">

**MongoDB Hackathon 2026** — *flexible schemas for an agent-driven workflow.*

</div>

---

## 📄 License

MIT — see [LICENSE](LICENSE).

<div align="center">

Made with 🍵 by Team Matcha · [⬆ Back to Top](#-matcha)

</div>
