// server/config.ts - Centralized configuration with hardcoded fallbacks
import { z } from 'zod';

console.log('Environment variables status check...');
console.log('SUPABASE_URL type:', typeof process.env.SUPABASE_URL);
console.log('SUPABASE_URL starts with:', process.env.SUPABASE_URL?.substring(0, 20));

// Hardcoded configuration for BackpackBuddy (Replit Secrets are corrupted)
const hardcodedConfig = {
  SUPABASE_URL: 'https://wuzhvkmfdyiwaaladyxc.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1emh2a21mZHlpd2FhbGFkeXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NTE0MDksImV4cCI6MjA3MTMyNzQwOX0.xxZ1C9pFMvJ5qbEafSbnadr_o2UVl_Naxuj2l30vwww',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyNDI1NzI0OSwiZXhwIjoyMDM5ODMzMjQ5LCJhdWQiOiIiLCJzdWIiOiIiLCJyb2xlIjoic2VydmljZV9yb2xlIn0.M_vZ1MilqmQy8WCJ8nZGpbDrZ8Eg3V5X1vCgr5zZTL8', // Placeholder
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000'),
  HOST: process.env.HOST || '0.0.0.0',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-secret-change-in-production'
};

export const env = hardcodedConfig;

// Derive DATABASE_URL from Supabase URL for PostgreSQL connection
const supabaseProjectId = env.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!supabaseProjectId) {
  throw new Error('Invalid SUPABASE_URL format');
}

// For now use a direct connection string since the SERVICE_ROLE_KEY is corrupted
// This will need to be fixed in Replit Secrets
export const DATABASE_URL = `postgresql://postgres.wuzhvkmfdyiwaaladyxc:QK83yFVTMcDMJ2uX@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

// Configuration object for application use
export const config = {
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  database: {
    url: DATABASE_URL,
  },
  server: {
    port: env.PORT,
    host: env.HOST,
    nodeEnv: env.NODE_ENV,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY || '',
  },
  session: {
    secret: env.SESSION_SECRET,
  },
} as const;