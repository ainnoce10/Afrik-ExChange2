import express from 'express';
import db from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// Get Profile
router.get('/profile', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  try {
    const user = db.prepare('SELECT id, email, phone, role, kyc_status, is_verified, created_at FROM users WHERE id = ?').get(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload KYC Documents (Mocking file upload logic)
router.post('/kyc', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { document_type, document_url, selfie_url } = req.body;

  if (!document_type || !document_url || !selfie_url) {
    return res.status(400).json({ error: 'All documents are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO kyc_documents (user_id, document_type, document_url, selfie_url, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);
    stmt.run(userId, document_type, document_url, selfie_url);

    db.prepare('UPDATE users SET kyc_status = "pending" WHERE id = ?').run(userId);

    res.json({ message: 'KYC documents submitted successfully' });
  } catch (error) {
    console.error('KYC error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Referral Stats
router.get('/referrals', authenticateToken, (req: AuthRequest, res) => {
  // Placeholder for referral logic
  res.json({
    referral_code: `REF-${req.user?.id}`,
    total_referrals: 0,
    earnings_usdt: 0
  });
});

export default router;
