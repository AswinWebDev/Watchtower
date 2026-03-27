import { Request, Response } from 'express';
import { OpenAIService } from '../services/openai.service';

const aiService = new OpenAIService();

/**
 * POST /api/v1/ai/generate-policy
 * Also aliased as POST /api/parse-rule
 * Translates a natural language prompt into a structured JSON policy.
 */
export const generatePolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const policy = await aiService.parseRulesToPolicy(prompt);
    res.status(200).json({ success: true, policy });
  } catch (error: any) {
    console.error('[AI Controller Error]', error.message);
    res.status(500).json({ error: 'Failed to process AI request. Check API configuration.' });
  }
};

/**
 * POST /api/analyze-behavior
 * Proactive threat analysis — the AI agent examines the wallet address context
 * and returns potential threats with suggested policies.
 */
export const analyzeBehavior = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.body;
    
    if (!address) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    const analysis = await aiService.analyzeWalletBehavior(address);
    res.status(200).json({ success: true, analysis });
  } catch (error: any) {
    console.error('[Behavior Analysis Error]', error.message);
    res.status(500).json({ error: 'Analysis engine failed.' });
  }
};
