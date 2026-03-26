require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client with Venice AI configuration
const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY || 'MISSING_KEY',
  baseURL: 'https://api.venice.ai/api/v1',
});

// Helper to extract JSON from markdown blocks
function extractJson(text) {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (match) {
    return JSON.parse(match[1]);
  }
  // Try to parse raw text just in case
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Could not parse JSON from AI response');
  }
}

app.post('/api/parse-rule', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemPrompt = `You are the Watchtower Autonomous Agent, an on-chain safety copilot.
Your job is to translate human-language spending rules into a strict JSON policy object for a Move smart contract.
Rules represent constraints on an individual's OneChain web3 wallet.

Available Actions:
- BLOCK_CONTRACT: Blocks interactions with a specific contract or category
- SET_LIMIT: Sets a maximum spending limit over a timeframe
- REQUIRE_MFA: Requires secondary approval for a transaction type

You must return ONLY a JSON object with this exact structure, nothing else:
{
  "ruleName": "Short descriptive name",
  "action": "BLOCK_CONTRACT" | "SET_LIMIT" | "REQUIRE_MFA",
  "target": "Category (e.g., 'GameFi', 'DeFi') or specific address",
  "amountDetails": {
    "limit": number (or null),
    "timeframe": "DAILY" | "WEEKLY" | "MONTHLY" | null
  },
  "explanation": "A 1-sentence explanation of what this rule does"
}`;

    const completion = await venice.chat.completions.create({
      model: 'llama-3.3-70b', // Venice recommended model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1, // Low temp for deterministic JSON
    });

    const aiMessage = completion.choices[0].message.content;
    const jsonPolicy = extractJson(aiMessage);

    res.json({
      success: true,
      policy: jsonPolicy
    });

  } catch (error) {
    console.error('AI Parsing Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate policy', 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Watchtower Backend Agent running on http://localhost:${PORT}`);
});
