import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use the DATABASE_URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

console.log('Using DATABASE_URL from environment variables');

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
export const db = drizzle(pool, { schema });