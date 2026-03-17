import express from 'express';
import db from '../db.ts';
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth.ts';
import { sendUsdt } from '../services/tronService.ts';
import { updateRatesFromLive } from '../services/rateService.ts';
import { jsonToCsv } from '../utils/export.ts';

const router = express.Router();

router.use(authenticateToken, isAdmin);

// Refresh rates from live market
router.post('/rates/refresh', async (req, res) => {
  try {
    await updateRatesFromLive();
    const rates = db.prepare('SELECT * FROM rates').all();
    res.json({ message: 'Rates refreshed successfully', rates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh rates' });
  }
});

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT t.*, u.email, u.phone 
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at DESC
    `).all();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update rates
router.post('/rates', async (req, res) => {
  const { asset, local_currency, buy_rate, sell_rate } = req.body;
  try {
    db.prepare('UPDATE rates SET buy_rate = ?, sell_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE asset = ? AND local_currency = ?')
      .run(buy_rate, sell_rate, asset, local_currency);
    res.json({ message: 'Rates updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate Transaction (Admin manually confirms payment received or assets sent)
router.post('/transactions/:id/validate', async (req, res) => {
  const { id } = req.params;
  const { status, tx_hash } = req.body; // status: completed, cancelled

  try {
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    if (status === 'completed' && transaction.type === 'buy' && transaction.asset === 'USDT') {
      // If it's a buy, we need to send USDT to user (only if USDT for now)
      const userWallet = db.prepare('SELECT address FROM wallets WHERE user_id = ?').get(transaction.user_id) as any;
      if (userWallet) {
        // Automation logic would go here
      }
    }

    db.prepare('UPDATE transactions SET status = ?, blockchain_tx_hash = ? WHERE id = ?')
      .run(status, tx_hash || transaction.blockchain_tx_hash, id);

    res.json({ message: `Transaction ${status}` });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const totalVolume = db.prepare('SELECT SUM(amount_local) as volume FROM transactions WHERE status = "completed"').get() as any;
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const pendingTransactions = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE status = "pending"').get() as any;

    res.json({
      volume: totalVolume.volume || 0,
      users: userCount.count,
      pending: pendingTransactions.count
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export transactions to CSV
router.get('/export', async (req, res) => {
  try {
    const transactions = db.prepare('SELECT * FROM transactions').all();
    const csv = jsonToCsv(transactions);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
