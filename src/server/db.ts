import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Initialize Tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_verified INTEGER DEFAULT 0,
      kyc_status TEXT DEFAULT 'pending', -- pending, approved, rejected
      two_fa_secret TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS kyc_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      document_url TEXT NOT NULL,
      selfie_url TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset TEXT NOT NULL, -- USDT, BTC, BNB, USDC
      local_currency TEXT NOT NULL, -- XOF, XAF
      base_rate REAL NOT NULL DEFAULT 0,
      buy_rate REAL NOT NULL,
      sell_rate REAL NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(asset, local_currency)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- buy, sell
      asset TEXT NOT NULL, -- USDT, BTC, etc.
      local_currency TEXT NOT NULL, -- XOF, XAF
      amount_asset REAL NOT NULL,
      amount_local REAL NOT NULL,
      rate REAL NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, processing, completed, cancelled, failed
      payment_method TEXT NOT NULL, -- orange, mtn, moov, wave, visa
      payment_details TEXT, -- phone number or tx hash
      blockchain_tx_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      address TEXT UNIQUE NOT NULL,
      private_key TEXT NOT NULL, -- Encrypted in production
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id)
    );
  `);

  // Migration: Add base_rate if it doesn't exist
  try {
    db.exec('ALTER TABLE rates ADD COLUMN base_rate REAL NOT NULL DEFAULT 0');
  } catch (e) {
    // Column likely already exists
  }

  // Ensure all assets exist in rates table
  const initialAssets = ['USDT', 'USDC', 'BNB', 'TRON', 'BTC', 'ETH', 'SHIBA', 'PEPE', 'PI', 'BEBYDOGE', 'ADA', 'SOL', 'USDT(BEP20)', 'USDT(TRC20)'];
  const currencies = ['XOF', 'XAF'];
  const insertRate = db.prepare('INSERT OR IGNORE INTO rates (asset, local_currency, base_rate, buy_rate, sell_rate) VALUES (?, ?, ?, ?, ?)');
  
  initialAssets.forEach(asset => {
    currencies.forEach(currency => {
      // Default initial rates, will be updated by rateService
      insertRate.run(asset, currency, 640, 652.8, 627.2);
    });
  });
}

export default db;
