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
    if (!key || key === 'your_openai_api_key_here') {
      console.warn("[Watchtower Warn] NO REAL OPENAI API KEY DETECTED. Returning structural fallback JSON for test purposes.");
      
      const limitMatch = prompt.match(/\d+/);
      const limit = limitMatch ? parseInt(limitMatch[0], 10) : 50;

      return {
        category: "GameFi",
        limit: limit,
        period: "daily",
        description: prompt
      };
    }

    const systemPrompt = `
      You are an enterprise financial AI agent for a Web3 smart wallet called Watchtower.
      Your job is to translate natural language constraints into strict JSON policy objects that will be fed into Move smart contracts.
      The JSON MUST strictly follow this interface:
      {
        "category": "GameFi" | "DeFi" | "NFT" | "All",
        "limit": number,
        "period": "daily" | "weekly" | "monthly",
        "description": string (the summarized intent, less than 10 words)
      }
      Always return valid JSON only. Do not wrap in markdown or backticks.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'llama-3.3-70b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    });

    let content = response.choices[0].message.content || "{}";
    // Clean markdown wrapping if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(content);
  }
}
