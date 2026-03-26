import { Router } from 'express';
import { generatePolicy } from '../controllers/ai.controller';

export const aiRouter = Router();

aiRouter.post('/generate-policy', generatePolicy);
