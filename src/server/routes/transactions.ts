import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getUsdtBalance } from '../services/tronService';

const router = express.Router();

// Get current rates
router.get('/rates', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM rates');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  try {
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0] as any;
    
    const walletResult = await db.query('SELECT address FROM wallets WHERE user_id = $1', [userId]);
    const wallet = walletResult.rows[0] as any;
    
    const transactionsResult = await db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [userId]);
    const transactions = transactionsResult.rows;
    
    const ratesResult = await db.query('SELECT * FROM rates');
    const rates = ratesResult.rows;
    
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
    const rateResult = await db.query('SELECT buy_rate FROM rates WHERE asset = $1 AND local_currency = $2', [asset, local_currency]);
    const rate = rateResult.rows[0] as any;
    if (!rate) return res.status(400).json({ error: 'Invalid asset or currency pair' });

    const amount_local = amount_asset * rate.buy_rate;

    const result = await db.query(`
      INSERT INTO transactions (user_id, type, asset, local_currency, amount_asset, amount_local, rate, payment_method, payment_details, status)
      VALUES ($1, 'buy', $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING id
    `, [userId, asset, local_currency, amount_asset, amount_local, rate.buy_rate, payment_method, phone_number]);

    res.status(201).json({
      message: 'Transaction created. Please proceed to payment.',
      transaction_id: result.rows[0].id,
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
    const rateResult = await db.query('SELECT sell_rate FROM rates WHERE asset = $1 AND local_currency = $2', [asset, local_currency]);
    const rate = rateResult.rows[0] as any;
    if (!rate) return res.status(400).json({ error: 'Invalid asset or currency pair' });

    const amount_local = amount_asset * rate.sell_rate;

    const result = await db.query(`
      INSERT INTO transactions (user_id, type, asset, local_currency, amount_asset, amount_local, rate, payment_method, payment_details, status)
      VALUES ($1, 'sell', $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING id
    `, [userId, asset, local_currency, amount_asset, amount_local, rate.sell_rate, payment_method, phone_number]);

    res.status(201).json({
      message: 'Transaction created. Please send assets to the provided address.',
      transaction_id: result.rows[0].id,
      amount_local
    });
  } catch (error) {
    console.error('Sell error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
