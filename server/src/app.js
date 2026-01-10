// server/src/app.js
import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  const result = await pool.query('SELECT 1');
  res.json({ status: 'ok', db: result.rows[0] });
});

export default app;
