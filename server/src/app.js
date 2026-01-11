// server/src/app.js
import express from 'express';
import cors from 'cors';
import prisma from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    console.error('Health check error:', error);
    
    // Provide more helpful error messages
    let errorMessage = error.message;
    if (error.message.includes('password must be a string')) {
      errorMessage = 'Database password configuration error. Check your DATABASE_URL in .env file. Format: postgresql://username:password@host:port/database';
    } else if (error.message.includes('authentication failed')) {
      errorMessage = 'Database authentication failed. Check your username and password in DATABASE_URL';
    } else if (error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to database server. Check if PostgreSQL is running and DATABASE_URL host/port are correct';
    }
    
    res.status(500).json({ 
      status: 'error', 
      db: 'disconnected', 
      error: errorMessage,
      hint: 'Check your .env file for DATABASE_URL configuration'
    });
  }
});

export default app;
