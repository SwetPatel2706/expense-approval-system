// server/src/app.js
console.log('🟢 [app.js] Loading app.js module...');
import express from 'express';
import cors from 'cors';
console.log('🟢 [app.js] Importing prisma from db.js...');
import prisma from './db.js';
console.log('🟢 [app.js] Prisma imported:', !!prisma);

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  console.log('🟡 [app.js] /health endpoint called');
  console.log('🟡 [app.js] Prisma instance:', !!prisma);
  console.log('🟡 [app.js] Prisma type:', typeof prisma);
  
  try {
    console.log('🟡 [app.js] Executing prisma.$queryRaw...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ [app.js] Query successful!');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    console.error('❌ [app.js] Health check error occurred');
    console.error('❌ [app.js] Error name:', error.name);
    console.error('❌ [app.js] Error message:', error.message);
    console.error('❌ [app.js] Error stack:', error.stack);
    console.error('❌ [app.js] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
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

console.log('✅ [app.js] app.js module loaded successfully');
export default app;
