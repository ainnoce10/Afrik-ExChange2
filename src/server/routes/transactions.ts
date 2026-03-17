import express from 'express';
import db from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';
import { getUsdtBalance } from '../services/tronService.ts';

const router = express.Router();

// Get current rates
router.get('/rates', async (req, res) => {
  try {
    const rates = db.prepare('SELECT * FROM rates').all();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    const wallet = db.prepare('SELECT address FROM wallets WHERE user_id = ?').get(userId) as any;
    const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(userId);
    const rates = db.prepare('SELECT * FROM rates').all();
    
    const balance = wallet ? await getUsdtBalance(wallet.address) : '0';

    res.json({
      user: {
        email: user.email,
        phone: user.phone,
        kyc_status: user.kyc_status,
        is_verified: user.is_verified
      },
      wallet: {
        address: wallet?.address,
        balance
      },
      transactions,
      rates
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Buy Transaction
router.post('/buy', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { asset, local_currency, amount_asset, payment_method, phone_number } = req.body;

  try {
    const rate = db.prepare('SELECT buy_rate FROM rates WHERE asset = ? AND local_currency = ?').get(asset, local_currency) as any;
    if (!rate) return res.status(400).json({ error: 'Invalid asset or currency pair' });

    const amount_local = amount_asset * rate.buy_rate;

    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, type, asset, local_currency, amount_asset, amount_local, rate, payment_method, payment_details, status)
      VALUES (?, 'buy', ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    
    const result = stmt.run(userId, asset, local_currency, amount_asset, amount_local, rate.buy_rate, payment_method, phone_number);

    res.status(201).json({
      message: 'Transaction created. Please proceed to payment.',
      transaction_id: result.lastInsertRowid,
      amount_local
    });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Sell Transaction
router.post('/sell', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { asset, local_currency, amount_asset, payment_method, phone_number } = req.body;

  try {
    const rate = db.prepare('SELECT sell_rate FROM rates WHERE asset = ? AND local_currency = ?').get(asset, local_currency) as any;
    if (!rate) return res.status(400).json({ error: 'Invalid asset or currency pair' });

    const amount_local = amount_asset * rate.sell_rate;

    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, type, asset, local_currency, amount_asset, amount_local, rate, payment_method, payment_details, status)
      VALUES (?, 'sell', ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    
    const result = stmt.run(userId, asset, local_currency, amount_asset, amount_local, rate.sell_rate, payment_method, phone_number);

    res.status(201).json({
      message: 'Transaction created. Please send assets to the provided address.',
      transaction_id: result.lastInsertRowid,
      amount_local
    });
  } catch (error) {
    console.error('Sell error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
