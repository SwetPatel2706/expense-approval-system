// server/src/db.js
import 'dotenv/config';  // Must be imported FIRST to load environment variables
import { PrismaClient } from '@prisma/client';

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please check your .env file.'
  );
}

// Validate DATABASE_URL format
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  throw new Error(
    'DATABASE_URL must start with postgresql:// or postgres://. Current format: ' + 
    (dbUrl.length > 20 ? dbUrl.substring(0, 20) + '...' : dbUrl)
  );
}

// Check if password is present in connection string
const urlMatch = dbUrl.match(/postgres(ql)?:\/\/([^:]+):([^@]+)@/);
if (!urlMatch) {
  throw new Error(
    'DATABASE_URL format is incorrect. Expected format: postgresql://username:password@host:port/database'
  );
}

// Validate that password is not empty
const password = urlMatch[3];
if (!password || password.trim() === '') {
  throw new Error(
    'DATABASE_URL password is missing or empty. The password must be provided between the username and @ symbol. ' +
    'Format: postgresql://username:password@host:port/database. ' +
    'If your password contains special characters, URL-encode them (e.g., @ becomes %40).'
  );
}

const globalForPrisma = globalThis;

// Ensure DATABASE_URL is a proper string (not undefined, null, or empty)
const databaseUrl = String(process.env.DATABASE_URL).trim();
if (!databaseUrl || databaseUrl === 'undefined' || databaseUrl === 'null') {
  throw new Error('DATABASE_URL must be a valid string. Check your .env file.');
}

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

