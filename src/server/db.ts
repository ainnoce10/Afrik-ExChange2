import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize Tables
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        kyc_status TEXT DEFAULT 'pending', -- pending, approved, rejected
        two_fa_secret TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS kyc_documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        document_type TEXT NOT NULL,
        document_url TEXT NOT NULL,
        selfie_url TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rates (
        id SERIAL PRIMARY KEY,
        asset TEXT NOT NULL, -- USDT, BTC, BNB, USDC
        local_currency TEXT NOT NULL, -- XOF, XAF
        base_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
        buy_rate DOUBLE PRECISION NOT NULL,
        sell_rate DOUBLE PRECISION NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(asset, local_currency)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL, -- buy, sell
        asset TEXT NOT NULL, -- USDT, BTC, etc.
        local_currency TEXT NOT NULL, -- XOF, XAF
        amount_asset DOUBLE PRECISION NOT NULL,
        amount_local DOUBLE PRECISION NOT NULL,
        rate DOUBLE PRECISION NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, processing, completed, cancelled, failed
        payment_method TEXT NOT NULL, -- orange, mtn, moov, wave, visa
        payment_details TEXT, -- phone number or tx hash
        blockchain_tx_hash TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        address TEXT UNIQUE NOT NULL,
        private_key TEXT NOT NULL, -- Encrypted in production
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure all assets exist in rates table
    const initialAssets = ['USDT', 'USDC', 'BNB', 'TRON', 'BTC', 'ETH', 'SHIBA', 'PEPE', 'PI', 'BEBYDOGE', 'ADA', 'SOL', 'USDT(BEP20)', 'USDT(TRC20)'];
    const currencies = ['XOF', 'XAF'];
    
    for (const asset of initialAssets) {
      for (const currency of currencies) {
        await client.query(
          'INSERT INTO rates (asset, local_currency, base_rate, buy_rate, sell_rate) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (asset, local_currency) DO NOTHING',
          [asset, currency, 640, 652.8, 627.2]
        );
      }
    }
    console.log('Database initialized successfully with Neon (PostgreSQL)');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

export const db = pool;
export default db;
