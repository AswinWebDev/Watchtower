import { Router } from 'express';
import { generatePolicy, analyzeBehavior } from '../controllers/ai.controller';

export const aiRouter = Router();

// AI Policy Generation — used by the AI Policies chat interface
aiRouter.post('/generate-policy', generatePolicy);

// Proactive Threat Analysis — used by the Agent Alerts on the dashboard
aiRouter.post('/analyze-behavior', analyzeBehavior);
