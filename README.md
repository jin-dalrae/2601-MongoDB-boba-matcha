<div align="center">

# 🍵 Matcha

### Autonomous Advertising Contracts for Creator Economy

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**AI-powered agents that autonomously match creators with advertisers, negotiate deals, audit content, and settle payments via blockchain.**

[Demo](#demo) • [Features](#features) • [Architecture](#architecture) • [Quick Start](#quick-start) • [API Reference](#api-reference)

---

<img src="https://img.shields.io/badge/Status-Hackathon%20Project-brightgreen?style=flat-square" alt="Status" />

</div>

## 🎯 The Problem

The creator economy is broken:
- **Creators** spend hours negotiating deals instead of creating content
- **Advertisers** struggle to find authentic voices that match their brand
- **Trust** is fractured — payment disputes, fake metrics, unclear deliverables
- **Middlemen** take 30-50% cuts for simple matchmaking

## 💡 The Solution

**Matcha** deploys autonomous AI agents that handle the entire advertising workflow:

```
Creator ←→ AI Agent ←→ Smart Contract ←→ AI Agent ←→ Advertiser
```

Each party gets their own AI agent that:
- 🤝 **Negotiates** on their behalf using learned preferences
- 📊 **Analyzes** content quality and brand safety automatically
- ✅ **Verifies** deliverables against contract terms
- 💰 **Settles** payments via x402 protocol on blockchain

---

## ✨ Features

### For Creators
| Feature | Description |
|---------|-------------|
| 🎨 **AI Profile Analysis** | Automatic extraction of content style, audience demographics, and niche |
| 🤖 **Smart Matching** | Get matched with brands that fit your authentic voice |
| 💬 **Autonomous Negotiation** | Your AI agent negotiates rates based on your market value |
| ⚡ **Instant Payments** | Get paid automatically when content meets contract terms |

### For Advertisers
| Feature | Description |
|---------|-------------|
| 📋 **Campaign Dashboard** | Track budget, spend, and ROI in real-time |
| 🔍 **Creator Discovery** | AI-curated shortlists ranked by brand fit score |
| 🛡️ **Content Audit** | Automatic verification of brand safety and deliverables |
| 📈 **Performance Tracking** | Tier-based payments tied to actual performance |

### Technical Highlights
- **x402 Protocol Integration** — HTTP-native micropayments for content settlements
- **Shared Memory Architecture** — Agents remember past negotiations and learn preferences
- **Performance Embeddings** — ML-based creator matching using engagement metrics
- **Tiered Payouts** — Smart contracts that pay based on content quality scores

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────────┤
│  Creator App          │  Advertiser App         │  Landing Page  │
│  • Dashboard          │  • Overview             │  • Value Prop  │
│  • Deals              │  • Matches (Shortlist)  │  • How It Works│
│  • Active Campaigns   │  • Campaigns            │  • Trust       │
│  • Profile            │  • Settings Modal       │                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express + Node.js)                 │
├─────────────────────────────────────────────────────────────────┤
│  Routes                │  Controllers            │  Services      │
│  • /api/users          │  • UserController       │  • AgentService│
│  • /api/campaigns      │  • CampaignController   │  • x402Service │
│  • /api/contracts      │  • ContractController   │  • AuditService│
│  • /api/agent          │  • AgentController      │                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE (MongoDB Atlas)                   │
├─────────────────────────────────────────────────────────────────┤
│  Collections                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │    Users     │ │  Campaigns   │ │  Contracts   │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │SharedMemory  │ │  AgentLogs   │ │ AuditReports │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
│  ┌──────────────┐ ┌──────────────┐                               │
│  │X402Settlement│ │ContentSubmit │                               │
│  └──────────────┘ └──────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **MongoDB Atlas** account (or local MongoDB)
- **npm** or **yarn**

### 1. Clone & Install

```bash
git clone https://github.com/your-org/matcha.git
cd matcha

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# Server
PORT=3001

# x402 Protocol (optional)
X402_WALLET_ADDRESS=your-wallet-address
X402_PRIVATE_KEY=your-private-key
```

### 3. Seed the Database

```bash
npm run seed
```

This populates the database with sample creators, advertisers, campaigns, and contracts.

### 4. Start Development

```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
matcha/
├── 📂 frontend/               # React + Vite frontend
│   ├── 📂 src/
│   │   ├── 📂 components/     # Shared components
│   │   │   ├── BottomNav.jsx
│   │   │   └── AdvertiserNav.jsx
│   │   ├── 📂 pages/
│   │   │   ├── 📂 advertiser/ # Advertiser dashboard
│   │   │   │   ├── AdvertiserDashboard.jsx
│   │   │   │   ├── AdvertiserShortlist.jsx
│   │   │   │   ├── AdvertiserCampaigns.jsx
│   │   │   │   └── advertiser-theme.css
│   │   │   ├── Dashboard.jsx  # Creator dashboard
│   │   │   ├── Deals.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── App.jsx
│   │   └── index.css          # Global design system
│   └── package.json
│
├── 📂 server/                 # Express backend
│   ├── 📂 controllers/
│   ├── 📂 routes/
│   └── 📂 services/
│
├── models.js                  # Mongoose schemas
├── seed.js                    # Database seeder
├── server.js                  # Express entry point
└── package.json
```

---

## 🎨 Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--adv-bg-primary` | `#F7F9F8` | Light theme background |
| `--adv-bg-card` | `#FFFFFF` | Card backgrounds |
| `--adv-accent-primary` | `#9FE870` | Matcha green accent |
| `--adv-text-primary` | `#1A1D1C` | Primary text |
| `--adv-text-secondary` | `#5C6662` | Secondary text |
| `--adv-divider` | `#E2E8E5` | Borders and dividers |

### Typography

- **Brand**: `Gluten` (logo and headers)
- **UI**: `Inter` (body text and interface)

### Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Live/Active | 🟢 Green | `#9FE870` |
| Matching/Progress | 🟡 Yellow | `#F2E394` |
| Review/Alert | 🔴 Rose | `#E5989B` |
| Draft/Muted | ⚪ Gray | `#8A9491` |

---

## 🔌 API Reference

### Users

```http
GET    /api/users/:id           # Get user by ID
POST   /api/users               # Create new user
GET    /api/users/creators      # List all creators
GET    /api/users/advertisers   # List all advertisers
```

### Campaigns

```http
GET    /api/campaigns                    # List all campaigns
GET    /api/campaigns/:id                # Get campaign details
POST   /api/campaigns                    # Create campaign
GET    /api/campaigns/advertiser/:id     # Get advertiser's campaigns
```

### Contracts

```http
GET    /api/contracts/:id                           # Get contract details
GET    /api/contracts/creator/:creatorId            # Get creator's contracts
GET    /api/contracts/advertiser/:advertiserId      # Get advertiser's contracts
POST   /api/contracts                               # Create contract
PATCH  /api/contracts/:id/status                    # Update contract status
```

### Agent

```http
POST   /api/agent/match          # AI matching for campaign
POST   /api/agent/negotiate      # Start negotiation
POST   /api/agent/audit          # Audit submitted content
POST   /api/agent/settle         # Settle payment via x402
```

---

## 🧪 Data Models

### User Schema
```javascript
{
  email: String,
  role: "creator" | "advertiser",
  social_handle: String,
  profile_data: {
    niche: [String],
    avg_engagement: Number,
    follower_breakdown: Object
  }
}
```

### Campaign Schema
```javascript
{
  advertiserId: ObjectId,
  name: String,
  budget: Number,
  status: "draft" | "matching" | "active" | "completed",
  requirements: {
    niche: [String],
    min_followers: Number,
    content_type: String
  }
}
```

### Contract Schema
```javascript
{
  campaignId: ObjectId,
  creatorId: ObjectId,
  advertiserId: ObjectId,
  terms: {
    deliverables: String,
    deadline: Date,
    base_payment: Number,
    bonus_tiers: [{
      threshold: Number,
      bonus: Number
    }]
  },
  status: "proposed" | "negotiating" | "active" | "completed"
}
```

---

## 🛣️ Roadmap

- [x] Creator & Advertiser Dashboards
- [x] AI-based Creator Matching
- [x] Contract Negotiation Flow
- [x] Content Audit System
- [x] x402 Payment Integration
- [x] Responsive Desktop Layout
- [ ] Real-time Notifications
- [ ] Multi-platform Analytics
- [ ] Mobile App (React Native)
- [ ] Decentralized Reputation System

---

## 🏆 Built For

<div align="center">

**MongoDB Hackathon 2026**

*Demonstrating the power of MongoDB for AI-driven agent workflows*

</div>

---

## 👥 Team

| Role | Contributor |
|------|-------------|
| 🎨 Design & Frontend | Team Matcha |
| ⚙️ Backend & Database | Team Matcha |
| 🤖 AI Agents | Team Matcha |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with 🍵 by Team Matcha**

[⬆ Back to Top](#-matcha)

</div>
