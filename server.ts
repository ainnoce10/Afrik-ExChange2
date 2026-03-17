import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { initDb } from './src/server/db.ts';
import { updateRatesFromLive } from './src/server/services/rateService.ts';
import authRoutes from './src/server/routes/auth.ts';
import transactionRoutes from './src/server/routes/transactions.ts';
import adminRoutes from './src/server/routes/admin.ts';
import userRoutes from './src/server/routes/user.ts';
import webhookRoutes from './src/server/routes/webhooks.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start Server
async function startServer() {
  // Initialize Database
  await initDb();

  // Initial Rates Update
  updateRatesFromLive();

  const app = express();
  const PORT = 3000;

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors());
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use('/api/', limiter);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/webhooks', webhookRoutes);

  app.get('/api/health', async (req, res) => {
    try {
      const dbCheck = await initDb(); // Re-run init to check connection
      res.json({ 
        status: 'ok', 
        message: 'Afrik-ExChange API is running',
        database: 'connected'
      });
    } catch (err: any) {
      res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed',
        error: err.message
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
