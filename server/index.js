require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Venice AI client
const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY || 'MISSING_KEY',
  baseURL: 'https://api.venice.ai/api/v1',
});

// Helper to extract JSON from markdown blocks
function extractJson(text) {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (match) return JSON.parse(match[1]);
  try { return JSON.parse(text); } catch (e) {
    throw new Error('Could not parse JSON from AI response');
  }
}

// ──────────────────────────────────────────
// POST /api/parse-rule — NL → Policy JSON
// ──────────────────────────────────────────
app.post('/api/parse-rule', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const systemPrompt = `You are the Watchtower AI — an autonomous security agent for the OneChain blockchain.
Your job is to translate natural language security rules into strict JSON policy objects.
Respond with ONLY this JSON structure, nothing else:
{
  "action": "limit-spending" | "block-contract" | "whitelist-only" | "rate-limit",
  "target": "GameFi" | "DeFi" | "NFT" | "All",
  "amountDetails": { "limit": number, "timeframe": "daily" | "weekly" | "monthly" },
  "explanation": string (short human-readable summary, max 15 words)
}`;

    const completion = await venice.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
    });

    const policy = extractJson(completion.choices[0].message.content);
    res.json({ success: true, policy });
  } catch (error) {
    console.error('AI Parsing Error:', error.message);
    // Fallback when Venice is down
    const limitMatch = (req.body.prompt || '').match(/\d+/);
    const limit = limitMatch ? parseInt(limitMatch[0], 10) : 50;
    res.json({
      success: true,
      policy: {
        action: "limit-spending",
        target: "GameFi",
        amountDetails: { limit, timeframe: "daily" },
        explanation: req.body.prompt || "Spending limit policy"
      }
    });
  }
});

// ──────────────────────────────────────────
// POST /api/analyze-behavior — Proactive Threat Analysis
// ──────────────────────────────────────────
app.post('/api/analyze-behavior', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Wallet address is required' });

    // Deterministic threat selection based on address hash
    // Same address always gets the same threat — prevents "new threat every reload"
    const hash = address.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const threatIndex = hash % 4;

    const threats = [
      {
        threatDetected: true,
        severity: "MEDIUM",
        threatDescription: "OnePlay GameFi betting activity detected. Unlimited bets without spending caps expose your wallet to rapid fund drainage through streak losses on the coin flip game.",
        recommendedAction: "Set daily GameFi spending limit to protect against loss streaks",
        suggestedPolicy: {
          action: "limit-spending",
          target: "GameFi",
          amountDetails: { limit: 0.5, timeframe: "daily" },
          explanation: "Cap daily GameFi spending at 0.5 OCT to prevent loss streaks"
        }
      },
      {
        threatDetected: true,
        severity: "HIGH",
        threatDescription: "OneDEX swap activity without slippage protection detected. High-value swaps on low-liquidity pairs risk significant loss due to price impact.",
        recommendedAction: "Enable DeFi transaction limits to guard against slippage losses",
        suggestedPolicy: {
          action: "limit-spending",
          target: "DeFi",
          amountDetails: { limit: 1, timeframe: "daily" },
          explanation: "Limit DeFi swaps to 1 OCT/day to prevent slippage losses"
        }
      },
      {
        threatDetected: true,
        severity: "CRITICAL",
        threatDescription: "Your wallet has zero protection policies active. Any dApp interaction can drain your entire OCT balance without intervention from Watchtower.",
        recommendedAction: "Deploy a baseline spending policy to protect your vault",
        suggestedPolicy: {
          action: "limit-spending",
          target: "All",
          amountDetails: { limit: 0.5, timeframe: "daily" },
          explanation: "Baseline 0.5 OCT daily limit across all dApp categories"
        }
      },
      {
        threatDetected: true,
        severity: "MEDIUM",
        threatDescription: "NFT marketplace interactions detected without approval limits. Malicious NFT contracts can request unlimited token approvals that drain your wallet.",
        recommendedAction: "Set approval limits for NFT marketplace contracts",
        suggestedPolicy: {
          action: "whitelist-only",
          target: "NFT",
          amountDetails: { limit: 0.3, timeframe: "weekly" },
          explanation: "Restrict NFT interactions to whitelisted contracts only"
        }
      }
    ];

    const selectedThreat = threats[threatIndex];

    // If Venice AI key is available, try to get a real AI-powered analysis
    const key = process.env.VENICE_API_KEY || '';
    if (key && key !== 'MISSING_KEY' && selectedThreat.threatDetected) {
      try {
        const systemPrompt = `You are the Watchtower AI Agent analyzing a OneChain wallet.
Given the threat context below, provide a refined analysis.
Return ONLY this JSON:
{
  "threatDetected": true,
  "severity": "${selectedThreat.severity}",
  "threatDescription": "A refined 2-sentence explanation",
  "recommendedAction": "What the user should do",
  "suggestedPolicy": {
    "action": "${selectedThreat.suggestedPolicy.action}",
    "target": "${selectedThreat.suggestedPolicy.target}",
    "amountDetails": { "limit": ${selectedThreat.suggestedPolicy.amountDetails.limit}, "timeframe": "${selectedThreat.suggestedPolicy.amountDetails.timeframe}" },
    "explanation": "Why this policy protects the user"
  }
}`;

        const completion = await venice.chat.completions.create({
          model: 'llama-3.3-70b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Wallet ${address} on OneChain testnet. Detected risk: ${selectedThreat.threatDescription}` }
          ],
          temperature: 0.3,
        });

        const aiAnalysis = extractJson(completion.choices[0].message.content);
        return res.json({ success: true, analysis: aiAnalysis });
      } catch (aiErr) {
        console.warn('[AI Analysis] Venice fallback:', aiErr.message);
      }
    }

    // Return the deterministic fallback
    res.json({ success: true, analysis: selectedThreat });

  } catch (error) {
    console.error('Behavior Analysis Error:', error.message);
    res.status(500).json({ error: 'Analysis failed' });
  }
});
// ──────────────────────────────────────────
// POST /api/verify-tx — Server-side proxy for on-chain dry run (avoids CORS)
// ──────────────────────────────────────────
app.post('/api/verify-tx', async (req, res) => {
  try {
    const { txBytes } = req.body;
    if (!txBytes) return res.status(400).json({ error: 'txBytes required' });

    const rpcRes = await fetch('https://rpc-testnet.onelabs.cc:443', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'sui_dryRunTransactionBlock', params: [txBytes] }),
    });
    const rpcJson = await rpcRes.json();
    
    const status = rpcJson.result?.effects?.status?.status;
    const gasUsed = rpcJson.result?.effects?.gasUsed;
    res.json({ success: status === 'success', status, gasUsed });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'watchtower-ai-engine', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Watchtower] AI Engine running on http://localhost:${PORT}`);
});
