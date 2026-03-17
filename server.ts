import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { initDb } from './src/server/db';
import { updateRatesFromLive } from './src/server/services/rateService';
import authRoutes from './src/server/routes/auth';
import transactionRoutes from './src/server/routes/transactions';
import adminRoutes from './src/server/routes/admin';
import userRoutes from './src/server/routes/user';
import webhookRoutes from './src/server/routes/webhooks';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize App
const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());

// Lazy DB Initialization middleware
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized && req.path.startsWith('/api')) {
    try {
      await initDb();
      dbInitialized = true;
      updateRatesFromLive();
    } catch (err) {
      console.error('Database initialization failed:', err);
    }
  }
  next();
});

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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Afrik-ExChange API is running',
    database: dbInitialized ? 'connected' : 'initializing'
  });
});

// Vite / Static Files
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Only listen if not on Vercel
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
