// server/src/app.ts
import express from 'express';
import cors from 'cors';
import { httpConfig } from './config/http.config.js';
import prisma from './db.js';
import expenseRoutes from './routes/expenses.js';
import { errorHandler } from './middlewares/error-handler.js';

const app = express();

app.use(cors(httpConfig.cors));
app.use(express.json({ limit: httpConfig.bodyLimit }));

app.get('/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
});

app.use('/expenses', expenseRoutes);

app.use(errorHandler);

export default app;
