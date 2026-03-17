import express from 'express';
import db from '../db.ts';
import { checkTransactionStatus } from '../services/tronService.ts';

const router = express.Router();

// Tron Blockchain Webhook (or Polling endpoint)
router.post('/tron', async (req, res) => {
  const { tx_hash, address } = req.body;

  // In a real production app, you'd verify the signature of the webhook from TronGrid
  // or use a service like Tatum/Moralis.
  
  try {
    const tx = await checkTransactionStatus(tx_hash);
    if (tx && tx.ret && tx.ret[0].contractRet === 'SUCCESS') {
      // Find pending sell transaction for this address
      const transaction = db.prepare(`
        SELECT t.* FROM transactions t
        JOIN wallets w ON t.user_id = w.user_id
        WHERE w.address = ? AND t.status = 'pending' AND t.type = 'sell'
        ORDER BY t.created_at DESC LIMIT 1
      `).get(address) as any;

      if (transaction) {
        db.prepare('UPDATE transactions SET status = "completed", blockchain_tx_hash = ? WHERE id = ?')
          .run(tx_hash, transaction.id);
        
        // Trigger Mobile Money Payout here in a real app
        console.log(`Auto-payout triggered for transaction ${transaction.id}`);
      }
    }
    res.json({ status: 'processed' });
  } catch (error) {
    console.error('Tron webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mobile Money Webhook (e.g., CinetPay, Bizao)
router.post('/mobile-money', (req, res) => {
  const { transaction_id, status, signature } = req.body;

  // Verify signature here...

  try {
    if (status === 'ACCEPTED') {
      const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transaction_id) as any;
      if (transaction && transaction.status === 'pending' && transaction.type === 'buy') {
        db.prepare('UPDATE transactions SET status = "completed" WHERE id = ?').run(transaction_id);
        
        // Trigger USDT Send here in a real app
        console.log(`Auto-USDT send triggered for transaction ${transaction_id}`);
      }
    }
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('MM webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
