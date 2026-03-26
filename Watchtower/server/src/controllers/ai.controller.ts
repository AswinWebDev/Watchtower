import { Request, Response } from 'express';
import { OpenAIService } from '../services/openai.service';

const aiService = new OpenAIService();

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
