import express from 'express';
import corsMiddleware from 'cors';
import dotenv from 'dotenv';
import { aiRouter } from './routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enterprise Middlewares
app.use(corsMiddleware({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/v1/ai', aiRouter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'watchtower-ai-engine', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Watchtower Server] Enterprise AI Engine running on port ${PORT}`);
});
