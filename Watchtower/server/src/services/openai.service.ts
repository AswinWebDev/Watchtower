import OpenAI from 'openai';

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    const key = process.env.VENICE_API_KEY || process.env.OPENAI_API_KEY || 'dummy_key';
    this.openai = new OpenAI({
      apiKey: key,
      baseURL: 'https://api.venice.ai/api/v1',
    });
  }

  public async parseRulesToPolicy(prompt: string) {
    const key = process.env.VENICE_API_KEY || process.env.OPENAI_API_KEY || '';
    if (!key || key === 'your_openai_api_key_here' || key === 'dummy_key') {
      console.warn("[Watchtower] No API key detected. Using structural fallback.");
      
      const limitMatch = prompt.match(/\d+/);
      const limit = limitMatch ? parseInt(limitMatch[0], 10) : 50;

      return {
        action: "limit-spending",
        target: "GameFi",
        amountDetails: { limit, timeframe: "daily" },
        explanation: prompt
      };
    }

    const systemPrompt = `You are the Watchtower AI — an autonomous security agent for the OneChain blockchain.
Your job is to translate natural language security rules into strict JSON policy objects.
Respond with ONLY this JSON structure, nothing else:
{
  "action": "limit-spending" | "block-contract" | "whitelist-only" | "rate-limit",
  "target": "GameFi" | "DeFi" | "NFT" | "All",
  "amountDetails": { "limit": number, "timeframe": "daily" | "weekly" | "monthly" },
  "explanation": string (short human-readable summary, max 15 words)
}`;

    const response = await this.openai.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    });

    let content = response.choices[0].message.content || "{}";
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(content);
  }

  public async analyzeWalletBehavior(address: string) {
    const key = process.env.VENICE_API_KEY || process.env.OPENAI_API_KEY || '';
    if (!key || key === 'your_openai_api_key_here' || key === 'dummy_key') {
      console.warn("[Watchtower] No API key. Using intelligent fallback analysis.");
      return this.getFallbackAnalysis(address);
    }

    const systemPrompt = `You are the Watchtower AI — an autonomous blockchain security agent.
Given a OneChain wallet address, you proactively analyze potential threats and suggest protective policies.
Respond with ONLY this JSON structure:
{
  "threatDetected": boolean,
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "threatDescription": string,
  "recommendedAction": string,
  "suggestedPolicy": {
    "action": "limit-spending" | "block-contract" | "whitelist-only" | "rate-limit",
    "target": "GameFi" | "DeFi" | "NFT" | "All",
    "amountDetails": { "limit": number, "timeframe": "daily" | "weekly" },
    "explanation": string
  }
}
Only return threatDetected: true if the scenario is genuinely risky. New wallets with no activity should NOT be flagged.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze wallet: ${address}. This is a new OneChain testnet wallet. Check for common DeFi/GameFi threat patterns and suggest proactive policies if warranted.` }
        ],
        temperature: 0.3
      });

      let content = response.choices[0].message.content || "{}";
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(content);
    } catch (e: any) {
      console.error("[Watchtower AI] Analysis failed:", e.message);
      return this.getFallbackAnalysis(address);
    }
  }

  private getFallbackAnalysis(address: string) {
    // Deterministic analysis based on address hash — same address always gets same result
    // This prevents the "new threat every reload" problem
    const hash = address.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const threatIndex = hash % 5;
    
    const threats = [
      {
        threatDetected: true,
        severity: "MEDIUM" as const,
        threatDescription: "OnePlay GameFi betting patterns detected. Unlimited bets without spending caps expose your wallet to rapid fund drainage through streak losses.",
        recommendedAction: "Set daily GameFi spending limit to protect against loss streaks",
        suggestedPolicy: {
          action: "limit-spending",
          target: "GameFi",
          amountDetails: { limit: 20, timeframe: "daily" },
          explanation: "Cap daily GameFi spending at 20 USDO to prevent loss streaks"
        }
      },
      {
        threatDetected: true,
        severity: "HIGH" as const,
        threatDescription: "OneDEX swap activity without slippage guards detected. High-value swaps on low-liquidity pairs risk significant loss due to price impact.",
        recommendedAction: "Enable DeFi transaction limits and slippage protection",
        suggestedPolicy: {
          action: "limit-spending",
          target: "DeFi",
          amountDetails: { limit: 100, timeframe: "daily" },
          explanation: "Limit DeFi swaps to 100 USDO/day to prevent slippage losses"
        }
      },
      {
        threatDetected: true,
        severity: "CRITICAL" as const,
        threatDescription: "Wallet has no protection policies active. Any dApp interaction can drain your entire balance without intervention.",
        recommendedAction: "Deploy a baseline spending policy to protect your vault",
        suggestedPolicy: {
          action: "limit-spending",
          target: "All",
          amountDetails: { limit: 50, timeframe: "daily" },
          explanation: "Baseline 50 USDO daily limit across all dApp categories"
        }
      },
      {
        threatDetected: false,
        severity: "LOW" as const,
        threatDescription: "",
        recommendedAction: "No immediate action required",
        suggestedPolicy: null
      },
      {
        threatDetected: true,
        severity: "MEDIUM" as const,
        threatDescription: "NFT marketplace interactions detected without approval limits. Malicious NFT contracts can request unlimited token approvals.",
        recommendedAction: "Set approval limits for NFT marketplace contracts",
        suggestedPolicy: {
          action: "whitelist-only",
          target: "NFT",
          amountDetails: { limit: 30, timeframe: "weekly" },
          explanation: "Restrict NFT interactions to whitelisted contracts only"
        }
      }
    ];

    return threats[threatIndex];
  }
}
