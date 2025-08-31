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

  // Health check endpoint for monitoring
  app.get('/health-check', (_req, res) => res.send('OK'));

  // Test destination endpoint directly in index.ts to bypass route issues
  app.get('/api/destinations', async (_req, res) => {
    try {
      const { supabaseAdmin } = await import('./supabase.js');
      console.log('Fetching destinations from Supabase...');
      
      const { data, error } = await supabaseAdmin
        .from('destinations')
        .select('*')
        .limit(50);

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      }

      console.log(`Found ${data?.length || 0} destinations`);
      res.json(data || []);
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
      const { getTableCounts } = await import('./supabase.js');
      const tablesData = await getTableCounts();
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        total_tables: tablesData.length,
        tables: tablesData
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

  const PORT = Number(process.env.PORT) || 5000;
  const HOST = '0.0.0.0';
  const server = createServer(app);
  server.keepAliveTimeout = 61000;
  server.headersTimeout = 65000;
  server.requestTimeout = 60000;

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
    console.log(`[server] listening on http://${HOST}:${PORT}`);
    console.log(`[server] PORT env = ${process.env.PORT ?? "(undefined)"}`);
  });
}

startServer().catch(console.error);

// טיפול בשגיאות גלובליות
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});