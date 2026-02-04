// server/src/server.ts

import { env } from './config/env.config.js';
// import 'dotenv/config';
import app from './app.js';
import { errorHandler } from "./middlewares/error-handler.js";

const PORT = process.env.PORT || 5000;

// Validate DATABASE_URL is set before starting server
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file');
  console.error('Please create a .env file in the server directory with:');
  console.error('DATABASE_URL=postgresql://username:password@localhost:5432/expense_db');
  process.exit(1);
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
});
