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

## ⚠️ Smart Contract Architecture (The Guardian Vault)

While the Watchtower dashboard provides the user interface and AI interactions, the actual security is designed to be enforced entirely on-chain through the **Guardian Vault Smart Contract Proxy** (`contracts/sources/guardian_vault.move`).

### How It Works (The Proxy Pattern)
To eliminate the risk of users bypassing the UI and interacting with OneDEX or OnePlay directly, Watchtower requires users to generate a `SmartVault` and deposit their OCT directly into it.
1. **Deposit**: Users transfer `Coin<SUI>` into their vault. Wait, does this mean they can't use it? No!
2. **AI Rules Engine**: The Venice AI agent detects threats and automatically proposes `PolicyRule` configurations (action, target, limit_amount). When the user clicks "Deploy", the frontend signs a transaction (`sui:signAndExecuteTransactionBlock`) pushing this policy directly into the SmartVault's state.
3. **Supervised Transfer**: Instead of interacting directly with dApps, users route their desired transactions (swaps, bets, etc) through the Vault's `safe_transfer(vault, amount, recipient)` entrypoint. 
4. **On-Chain Enforcement**: The contract iterates through all active rules (`if (vault.daily_spent + amount) <= rule.limit_amount`). If a hacker tries to drain the wallet or the user tries to place a OnePlay bet larger than their deployed AI policy, the contract mathematically aborts (`EExceedsDailyLimit`) and reverts the transaction.

### Hackathon MVP Scope
For the OneHack 3.0 submission, the frontend proves the **entire AI→On-Chain pipeline** in real-time. Wait time and hackathon dev-net limitations meant we could not integrate and deploy the full `guardian_vault.move` smart contract to every testnet actor. Therefore:
- The `AgentAlerts`/Policy Deployment performs a real on-chain cryptographic transaction via Wallet Standard.
- The `GameSimulator` (OnePlay Demo) simulates the `safe_transfer` routing logic described above, demonstrating the exact user experience of having a transaction blocked locally before presenting the complete Guardian Vault architecture to judges.

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
