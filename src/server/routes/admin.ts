import express from 'express';
import db from '../db';
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth';
import { sendUsdt } from '../services/tronService';
import { updateRatesFromLive } from '../services/rateService';
import { jsonToCsv } from '../utils/export';

const router = express.Router();

router.use(authenticateToken, isAdmin);

// Refresh rates from live market
router.post('/rates/refresh', async (req, res) => {
  try {
    await updateRatesFromLive();
    const result = await db.query('SELECT * FROM rates');
    res.json({ message: 'Rates refreshed successfully', rates: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh rates' });
  }
});

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, u.email, u.phone 
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update rates
router.post('/rates', async (req, res) => {
  const { asset, local_currency, buy_rate, sell_rate } = req.body;
  try {
    await db.query('UPDATE rates SET buy_rate = $1, sell_rate = $2, updated_at = CURRENT_TIMESTAMP WHERE asset = $3 AND local_currency = $4',
      [buy_rate, sell_rate, asset, local_currency]);
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
    const transactionResult = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
    const transaction = transactionResult.rows[0] as any;
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    if (status === 'completed' && transaction.type === 'buy' && transaction.asset === 'USDT') {
      // If it's a buy, we need to send USDT to user (only if USDT for now)
      const userWalletResult = await db.query('SELECT address FROM wallets WHERE user_id = $1', [transaction.user_id]);
      const userWallet = userWalletResult.rows[0] as any;
      if (userWallet) {
        // Automation logic would go here
      }
    }

    await db.query('UPDATE transactions SET status = $1, blockchain_tx_hash = $2 WHERE id = $3',
      [status, tx_hash || transaction.blockchain_tx_hash, id]);

    res.json({ message: `Transaction ${status}` });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const totalVolumeResult = await db.query("SELECT SUM(amount_local) as volume FROM transactions WHERE status = 'completed'");
    const totalVolume = totalVolumeResult.rows[0] as any;
    
    const userCountResult = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult.rows[0] as any;
    
    const pendingTransactionsResult = await db.query("SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'");
    const pendingTransactions = pendingTransactionsResult.rows[0] as any;

    res.json({
      volume: parseFloat(totalVolume.volume) || 0,
      users: parseInt(userCount.count),
      pending: parseInt(pendingTransactions.count)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export transactions to CSV
router.get('/export', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM transactions');
    const csv = jsonToCsv(result.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
