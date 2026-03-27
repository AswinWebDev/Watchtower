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

## ⚠️ Hackathon Architecture FAQ (What is Real vs Simulated?)

This is a **production-ready frontend** with a **proof-of-concept backend** built for OneHack 3.0. 

### Q: Are we using testnet tokens or dummy data?
**Both.** 
* **Real:** When you connect OneWallet, Watchtower fetches your *real* testnet OCT balance. When you click "Deploy Policy", it builds a *real* SUI transaction using your actual OCT gas coins, and requests a *real* cryptographic signature via `signPersonalMessage`.
* **Simulated:** The `OnePlay Simulator` uses dummy values (0.1, 0.2 OCT) to demonstrate *how* the UI blocks a transaction when a limit is exceeded. 

### Q: Why do daily limits only restrict me inside Watchtower? Isn't that a flaw?
**Yes, in the current demo.** Right now, policies are stored in the browser's `localStorage`. This means if a user goes directly to OneDEX.io, their wallet isn't restricted. 
**The Production Solution:** Watchtower is designed to act as a **Smart Contract Wallet (Guardian Vault)**. Once our `GuardianVault` Move contract is deployed to the OneChain testnet, users will deposit funds into *that* vault. Every transaction (no matter what application they use it on) must pass through the Move contract, where the AI policies are verified on-chain.

### Q: Why does my balance show 0 OCT after I reload the page sometimes?
Because we rely on standard Wallet connection states. We clear local storage to force users to re-authenticate, ensuring the latest connection object is used to pull the live balance. A persistent production version would rely entirely on on-chain queries.

### 🗺️ Path to Full On-Chain Enforcement
Our final step is deploying the `Guardian Vault Move Contract`. The logic is complete (see `/contracts`), but currently awaiting a deployment environment matching the testnet VM version. Once deployed, the local policy engine will be entirely replaced by on-chain verification, making the security rules inescapable across the entire OneChain ecosystem.

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
