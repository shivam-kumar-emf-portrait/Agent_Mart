import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB, saveDB } from '../db.js';

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const db = getDB();
  try {
    const userId = uuidv4();
    db.run('INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)',
      [userId, email, password, Date.now()]);

    // Create wallet with 5 USDC bonus
    const walletId = uuidv4();
    db.run('INSERT INTO wallets (id, user_id, balance, updated_at) VALUES (?, ?, ?, ?)',
      [walletId, userId, 5.00, Date.now()]);

    // Add bonus transaction
    db.run('INSERT INTO transactions (id, wallet_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), walletId, 'bonus', 5.00, 'Registration Bonus', Date.now()]);

    saveDB();
    res.json({ success: true, user: { id: userId, email }, walletId });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').getAsObject({ 1: email, 2: password });
  
  if (!user.id) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const wallet = db.prepare('SELECT id FROM wallets WHERE user_id = ?').getAsObject({ 1: user.id });

  res.json({ 
    success: true, 
    user: { id: user.id, email: user.email },
    walletId: wallet.id 
  });
});

export default router;
