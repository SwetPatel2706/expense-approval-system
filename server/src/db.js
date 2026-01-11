// server/src/db.js
console.log('🔵 [db.js] Loading db.js module...');
import 'dotenv/config';  // Must be imported FIRST to load environment variables
console.log('🔵 [db.js] dotenv/config imported');

import { PrismaClient } from '@prisma/client';
console.log('🔵 [db.js] PrismaClient imported');

// Validate DATABASE_URL is set
console.log('🔵 [db.js] Checking DATABASE_URL...');
console.log('🔵 [db.js] DATABASE_URL exists?', !!process.env.DATABASE_URL);
console.log('🔵 [db.js] DATABASE_URL type:', typeof process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('❌ [db.js] DATABASE_URL is not set!');
  throw new Error(
    'DATABASE_URL environment variable is not set. Please check your .env file.'
  );
}

// Validate DATABASE_URL format
const dbUrl = process.env.DATABASE_URL;
console.log('🔵 [db.js] DATABASE_URL length:', dbUrl.length);
console.log('🔵 [db.js] DATABASE_URL preview:', dbUrl.substring(0, 30) + '...');

if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.error('❌ [db.js] DATABASE_URL does not start with postgresql:// or postgres://');
  throw new Error(
    'DATABASE_URL must start with postgresql:// or postgres://. Current format: ' + 
    (dbUrl.length > 20 ? dbUrl.substring(0, 20) + '...' : dbUrl)
  );
}

// Check if password is present in connection string
console.log('🔵 [db.js] Parsing DATABASE_URL...');
const urlMatch = dbUrl.match(/postgres(ql)?:\/\/([^:]+):([^@]+)@/);
if (!urlMatch) {
  console.error('❌ [db.js] DATABASE_URL format does not match expected pattern');
  throw new Error(
    'DATABASE_URL format is incorrect. Expected format: postgresql://username:password@host:port/database'
  );
}

// Validate that password is not empty
const username = urlMatch[2];
const password = urlMatch[3];
console.log('🔵 [db.js] Parsed username:', username);
console.log('🔵 [db.js] Parsed password type:', typeof password);
console.log('🔵 [db.js] Parsed password length:', password ? password.length : 'null/undefined');
console.log('🔵 [db.js] Parsed password is empty?', password === '');

if (!password || password.trim() === '') {
  console.error('❌ [db.js] Password is missing or empty!');
  throw new Error(
    'DATABASE_URL password is missing or empty. The password must be provided between the username and @ symbol. ' +
    'Format: postgresql://username:password@host:port/database. ' +
    'If your password contains special characters, URL-encode them (e.g., @ becomes %40).'
  );
}

const globalForPrisma = globalThis;

// Ensure DATABASE_URL is a proper string (not undefined, null, or empty)
const databaseUrl = String(process.env.DATABASE_URL).trim();
console.log('🔵 [db.js] Final databaseUrl type:', typeof databaseUrl);
console.log('🔵 [db.js] Final databaseUrl length:', databaseUrl.length);
console.log('🔵 [db.js] Final databaseUrl preview:', databaseUrl.substring(0, 30) + '...');

if (!databaseUrl || databaseUrl === 'undefined' || databaseUrl === 'null') {
  console.error('❌ [db.js] databaseUrl is invalid!');
  throw new Error('DATABASE_URL must be a valid string. Check your .env file.');
}

console.log('🔵 [db.js] Creating PrismaClient...');
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
console.log('✅ [db.js] PrismaClient created successfully');

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  console.log('🔵 [db.js] PrismaClient cached in globalThis');
}

console.log('✅ [db.js] db.js module loaded successfully');
export default prisma;

