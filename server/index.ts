import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { registerRoutes } from './routes.js';
import { setupVite } from './vite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoints for monitoring
  app.get('/health', async (_req, res) => {
    try {
      // Test Supabase connection
      const { getSupabaseAdmin } = await import('./supabase.js');
      const supabase = getSupabaseAdmin();
      
      // Quick connection test
      const { data, error } = await supabase.from('destinations').select('count').limit(1);
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: error ? 'error' : 'connected',
          supabase: error ? 'disconnected' : 'connected'
        }
      });
    } catch (err) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  });

  app.get('/ready', (_req, res) => {
    res.json({ 
      status: 'ready',
      timestamp: new Date().toISOString(),
      port: PORT 
    });
  });

  // Enhanced destinations endpoint with photos for user interface
  app.get('/api/destinations', async (_req, res) => {
    try {
      const { getSupabaseAdmin } = await import('./supabase.js');
      const supabase = getSupabaseAdmin();
      console.log('Fetching destinations with photos for user view...');
      
      // Get destinations with their photos
      const { data: destinations, error: destError } = await supabase
        .from('destinations')
        .select(`
          id,
          location_id,
          name,
          latitude,
          longitude,
          city,
          state,
          country,
          address_string,
          web_url,
          photo_count,
          created_at
        `)
        .order('name');

      if (destError) {
        console.error('Destinations error:', destError);
        return res.status(500).json({ 
          error: destError.message,
          details: destError.details,
          hint: destError.hint,
          code: destError.code
        });
      }

      // Get photos for all destinations
      const { data: photos, error: photoError } = await supabase
        .from('location_photos')
        .select(`
          location_id,
          photo_url,
          thumbnail_url,
          caption,
          width,
          height
        `)
        .eq('location_category', 'destination')
        .order('id');

      if (photoError) {
        console.log('Photos query error (continuing without photos):', photoError.message);
      }

      // Combine destinations with their photos
      const destinationsWithPhotos = destinations?.map(dest => ({
        ...dest,
        photos: photos?.filter(photo => photo.location_id === dest.location_id) || [],
        mainPhoto: photos?.find(photo => photo.location_id === dest.location_id)?.thumbnail_url || 
                   photos?.find(photo => photo.location_id === dest.location_id)?.photo_url,
        coordinates: dest.latitude && dest.longitude ? {
          lat: parseFloat(dest.latitude),
          lng: parseFloat(dest.longitude)
        } : null
      })) || [];

      console.log(`Found ${destinationsWithPhotos.length} destinations with photos`);
      res.json({
        success: true,
        count: destinationsWithPhotos.length,
        destinations: destinationsWithPhotos
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        message: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  });

  // Dashboard API endpoint - registered before Vite middleware
  app.get('/api/dashboard/tables', async (_req, res) => {
    try {
      const { getActualTables } = await import('./supabase.js');
      const tablesData = await getActualTables();
      
      // Group tables by category for better display
      const categorizedTables = {
        "Places & Locations": tablesData.filter(t => 
          ['destinations', 'accommodations', 'attractions', 'restaurants', 
           'places', 'place_reviews', 'location_photos', 'location_ancestors'].includes(t.table_name)
        ),
        "Users & Auth": tablesData.filter(t => 
          ['users', 'sessions', 'user_connections'].includes(t.table_name)
        ),
        "Travel Planning": tablesData.filter(t => 
          ['trips', 'expenses'].includes(t.table_name)
        ),
        "Gamification": tablesData.filter(t => 
          ['achievements'].includes(t.table_name)
        ),
        "Community": tablesData.filter(t => 
          ['chat_rooms', 'messages', 'travel_buddy_posts'].includes(t.table_name)
        ),
        "Data Processing": tablesData.filter(t => 
          ['raw_responses', 'ingestion_runs', 'ingestion_jobs', 'ingestion_dead_letters'].includes(t.table_name)
        )
      };
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        total_tables: tablesData.length,
        tables: tablesData,
        categorized: categorizedTables
      });
    } catch (error) {
      console.error("Error fetching database dashboard:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch database dashboard data",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  await registerRoutes(app);

  // Get port from configuration
  const { config } = await import('./config.js');
  const PORT = config.server.port;
  const HOST = config.server.host;
  
  const server = createServer(app);
  
  // Configure timeouts for Replit stability
  server.keepAliveTimeout = 61000;
  server.headersTimeout = 65000;
  server.requestTimeout = 60000;
  server.timeout = 65000;

  // Setup Vite in development mode
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    // Production mode - serve static files
    const publicDir = path.join(__dirname, '../dist/public');
    app.use(express.static(publicDir));

    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return res.status(404).end();
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`[server] BackpackBuddy listening on http://${HOST}:${PORT}`);
    console.log(`[server] Environment: ${config.server.nodeEnv}`);
    console.log(`[server] Health check: http://${HOST}:${PORT}/health`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});