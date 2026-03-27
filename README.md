# 🏰 Watchtower — Autonomous AI Security Agent for OneChain

> *An AI-powered guardian that proactively monitors your OneChain wallet, detects threats across OneDEX, OnePlay, and OnePoker, and deploys Move smart contract policies to protect your assets — all controlled through natural language.*

Built for **OneHack 3.0** on the OneChain ecosystem.

---

## 🛡️ What is Watchtower?

Watchtower is an **autonomous security agent** that sits between your OneWallet and the OneChain ecosystem. It:

1. **Proactively scans** your wallet for risky behavior patterns across OneDEX swaps, OnePlay bets, and OnePoker stakes
2. **Uses AI** (Venice AI / LLaMA 3.3 70B) to understand threats and generate protective policies
3. **Signs policy authorizations** cryptographically via OneWallet
4. **Enforces spending limits** in real-time when transactions violate your AI-generated rules

### The Problem
DeFi and GameFi users regularly lose funds to:
- Uncapped gambling streaks on gaming platforms (OnePlay, OnePoker)
- High-slippage swaps on low-liquidity DEX pairs (OneDEX)
- Unlimited token approvals to malicious contracts
- No spending controls across dApp interactions

### The Solution
Watchtower acts as an **always-on AI copilot** that watches your on-chain activity and automatically suggests + enforces protective policies. Think of it as a firewall for your Web3 wallet.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    WATCHTOWER                        │
│                                                      │
│  ┌──────────┐   ┌───────────┐   ┌────────────────┐  │
│  │ Dashboard │   │ AI Policy │   │ OnePlay        │  │
│  │ + Agent   │   │ Chat      │   │ Simulator      │  │
│  │ Alerts    │   │ (NL→Move) │   │ (Enforcement)  │  │
│  └─────┬─────┘   └─────┬─────┘   └───────┬────────┘  │
│        │               │                 │           │
│  ┌─────┴───────────────┴─────────────────┴────────┐  │
│  │           Zustand State + Policy Engine         │  │
│  └─────────────────────┬───────────────────────────┘  │
│                        │                              │
│  ┌─────────────────────┴───────────────────────────┐  │
│  │  OneWallet (signPersonalMessage) + OneChain RPC  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Venice AI Backend (LLaMA 3.3 70B)         │  │
│  │    /api/analyze-behavior  |  /api/parse-rule      │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🤖 Autonomous Threat Detection
- AI agent scans wallet activity patterns on connect
- Detects risks: unprotected spending, missing policies, gambling patterns
- Classifies threats as CRITICAL / HIGH / MEDIUM / LOW
- Suggests protective policies with one-click deployment

### 💬 Natural Language → Smart Contract Policies
- Chat interface: *"Don't let me spend more than 0.5 OCT on OnePlay today"*
- Venice AI (LLaMA 3.3 70B) parses intent into structured policy JSON
- Policies enforce spending limits per category (GameFi, DeFi, NFT) and timeframe

### ⛓️ On-Chain Integration
- **Real wallet connection** via OneWallet (Wallet Standard)
- **Real OCT balance** fetched from OneChain Testnet RPC
- **Real transaction building + dry-run** with actual gas coins
- **Cryptographic policy signing** via `signPersonalMessage`

### 🎮 OnePlay Simulator
- Real-time policy enforcement demo
- Place simulated bets → Watchtower blocks transactions exceeding your limits
- Proves the policy engine works before full on-chain deployment

### 📊 Dashboard
- Real testnet OCT balance display
- Active policy management
- Transaction history (persisted across sessions)
- OneChain product monitoring: OneDEX, OnePlay, OnePoker

---

## ⚠️ Current Scope & Honest Architecture

This is a **proof-of-concept** built for OneHack 3.0. Here's what's real and what's demonstrated:

### ✅ What's Real (On-Chain)
| Feature | Detail |
|---|---|
| Wallet connection | Real OneWallet via Wallet Standard, real private key |
| OCT balance | Fetched live from `rpc-testnet.onelabs.cc` via `suix_getBalance` |
| Transaction building | Real tx built with real OCT gas coins from your wallet |
| Dry-run verification | Real simulation against OneChain Testnet RPC |
| Policy signing | Real cryptographic signature via `signPersonalMessage` |

### 🔶 What's Demonstrated (Local Policy Engine)
| Feature | Detail |
|---|---|
| Spending limits | Enforced locally in the browser's policy engine, not by an on-chain contract |
| OnePlay bets | Simulated coin flip to demonstrate policy blocking, not real OnePlay |
| Transaction history | Stored in browser localStorage, not indexed from on-chain |

### 🗺️ Path to Full On-Chain Enforcement
For true on-chain enforcement, Watchtower needs:
1. **Guardian Vault Move Contract** — A proxy wallet contract that holds user funds and checks spending limits on-chain before forwarding any transaction
2. **On-chain policy storage** — Policies stored as Move objects, not localStorage
3. **dApp integration** — OnePlay, OneDEX, OnePoker routing transactions through the vault

This is the standard architecture for smart contract wallets (like Safe on Ethereum). The current demo proves the entire pipeline works — from AI threat detection through policy signing — and is ready for contract deployment when the Guardian Vault Move contract is published.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | TailwindCSS |
| State | Zustand (persisted to localStorage) |
| AI Engine | Venice AI (LLaMA 3.3 70B) |
| Blockchain | OneChain Testnet (`rpc-testnet.onelabs.cc`) |
| Wallet | OneWallet Extension (Wallet Standard) |
| SDK | `@onelabs/sui` (native OneChain SDK) |
| Backend | Node.js + Express |

---

## 🚀 Quick Start

### Prerequisites
- [OneWallet Extension](https://chromewebstore.google.com/detail/onewallet/gclmcgmpkgblaglfokkaclneihpnbkli)
- [Node.js 18+](https://nodejs.org/)
- OneChain Testnet OCT tokens via [OneBox Faucet](https://onebox.onelabs.cc/dashboard)

### 1. Clone & Install

```bash
git clone <repo-url>
cd Watchtower

# Frontend
npm install

# Backend
cd server && npm install
```

### 2. Configure Environment

```bash
# server/.env
VENICE_API_KEY=your_venice_api_key_here
```

Get a free Venice AI key at [venice.ai](https://venice.ai).

### 3. Run

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev
```

Open `http://localhost:5173`

---

## 🧪 Demo Flow

1. **Connect OneWallet** → Real testnet OCT balance displayed (~3 OCT)
2. **Autonomous Agent** scans wallet → detects zero policies → CRITICAL alert
3. **Approve & Deploy** → OneWallet signs policy → 0.5 OCT daily limit activated
4. **AI Policies** → Type *"Limit my OnePlay bets to 0.5 OCT daily"* → Policy deployed
5. **OnePlay Simulator** → Bet 0.2 OCT ✅ → Bet 0.5 OCT ❌ **BLOCKED!**
6. **Reload** → Balance, policies, spending, and history all persist

---

## 🔗 OneChain Integration

| Product | Integration |
|---|---|
| **OneWallet** | Wallet connection, `signPersonalMessage`, real tx signing |
| **OnePlay** | Simulated enforcement with policy blocking |
| **OneDEX** | Swap monitoring + DeFi spending limit policies |
| **OnePoker** | Stake monitoring + GameFi category rules |
| **OneChain RPC** | Balance, gas coins, transaction dry-run |

---

## 📁 Project Structure

```
Watchtower/
├── src/
│   ├── App.tsx                 # Main app with sidebar navigation
│   ├── store.ts                # Zustand state (wallet, rules, persisted)
│   └── components/
│       ├── Dashboard.tsx       # Vault stats + OneChain monitoring
│       ├── AgentAlerts.tsx     # Autonomous AI threat detection + signing
│       ├── AiPolicies.tsx      # NL→Policy chat interface
│       └── GameSimulator.tsx   # OnePlay bet simulator
├── server/
│   ├── index.js                # Venice AI backend
│   └── .env                    # VENICE_API_KEY
└── README.md
```

---

## 📜 License

MIT — Built with ❤️ for OneHack 3.0
