import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.ts';
import { createWallet } from '../services/tronService.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/register', async (req, res) => {
  const { email, phone, password } = req.body;

  if (!email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userResult = await db.query(
      'INSERT INTO users (email, phone, password) VALUES ($1, $2, $3) RETURNING id',
      [email, phone, hashedPassword]
    );
    const userId = userResult.rows[0].id;

    // Create wallet for user
    const wallet = await createWallet();
    await db.query(
      'INSERT INTO wallets (user_id, address, private_key) VALUES ($1, $2, $3)',
      [userId, wallet.address, wallet.privateKey]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    if (error.message.includes('unique constraint')) {
      return res.status(400).json({ error: 'Email or phone already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0] as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kyc_status: user.kyc_status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
