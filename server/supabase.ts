// server/supabase.ts - Singleton Supabase client for server-side operations
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';

// Singleton pattern - create client once only
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseInstance) {
    console.log('Creating Supabase admin client...');
    supabaseInstance = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: { persistSession: false },
        db: { schema: 'public' },
        global: {
          headers: {
            'User-Agent': 'BackpackBuddy/1.0'
          }
        }
      }
    );
  }
  return supabaseInstance;
}

// Legacy export for backward compatibility
export const supabaseAdmin = getSupabaseAdmin();

// Database table inspection and count helper
export async function getActualTables() {
  const supabase = getSupabaseAdmin();
  
  // Test each expected table to see which ones actually exist
  const expectedTables = [
    'destinations', 'accommodations', 'attractions', 'restaurants', 
    'places', 'place_reviews', 'location_photos', 'location_ancestors',
    'users', 'sessions', 'trips', 'expenses', 'achievements',
    'chat_rooms', 'messages', 'user_connections', 'travel_buddy_posts',
    'raw_responses', 'ingestion_runs', 'ingestion_jobs', 'ingestion_dead_letters'
  ];

  return await getTableCountsForTables(expectedTables);
}

async function getTableCountsForTables(tables: string[]) {
  const supabase = getSupabaseAdmin();
  const tableCounts = [];

  for (const tableName of tables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      tableCounts.push({
        table_name: tableName,
        approx_row_count: error ? 0 : (count || 0),
        error: error ? error.message : undefined
      });
    } catch (error) {
      tableCounts.push({
        table_name: tableName,
        approx_row_count: 0,
        error: 'Access denied'
      });
    }
  }

  return tableCounts.sort((a, b) => b.approx_row_count - a.approx_row_count);
}

async function getTableCountsFallback() {
  const expectedTables = [
    'destinations', 'accommodations', 'attractions', 'restaurants', 
    'places', 'place_reviews', 'location_photos', 'location_ancestors',
    'users', 'sessions', 'trips', 'expenses', 'achievements',
    'chat_rooms', 'messages', 'user_connections', 'travel_buddy_posts',
    'raw_responses', 'ingestion_runs', 'ingestion_jobs', 'ingestion_dead_letters'
  ];

  return await getTableCountsForTables(expectedTables);
}

// Legacy export
export const getTableCounts = getActualTables;