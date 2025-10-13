import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function createJourneysTable() {
  try {
    console.log('Creating journeys table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS journeys (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        description TEXT NOT NULL,
        destinations JSONB NOT NULL,
        total_nights INTEGER NOT NULL,
        price_min NUMERIC(10,2) NOT NULL,
        price_max NUMERIC(10,2) NOT NULL,
        season TEXT[],
        tags TEXT[],
        audience_tags TEXT[],
        rating NUMERIC(3,2) DEFAULT 0,
        popularity INTEGER DEFAULT 0,
        hero_image TEXT,
        images TEXT[],
        daily_itinerary JSONB,
        costs_breakdown JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Journeys table created successfully');
    
    // Check if table has data
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM journeys`);
    console.log('Current journey count:', result[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

createJourneysTable();
