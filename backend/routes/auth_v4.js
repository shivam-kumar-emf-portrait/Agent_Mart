import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB, saveDB } from '../db.js';

const router = express.Router();

const otps = new Map();

// Request OTP
router.post('/request-otp', (req, res) => {
  const { email, password, isRegister } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const db = getDB();
  
  try {
    if (isRegister) {
      const stmt = db.prepare('SELECT id FROM users WHERE email = ?');
      stmt.bind([email]);
      const exists = stmt.step();
      stmt.free();
      if (exists) return res.status(400).json({ error: 'Email already exists' });
    } else {
      const stmt = db.prepare('SELECT id FROM users WHERE email = ? AND password = ?');
      stmt.bind([email, password]);
      const exists = stmt.step();
      stmt.free();
      if (!exists) return res.status(401).json({ error: 'Invalid credentials' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(email, { otp, password, isRegister, expires: Date.now() + 300000 });

    console.log(`\n-----------------------------------------`);
    console.log(`[AUTH] OTP for ${email}: ${otp}`);
    console.log(`-----------------------------------------\n`);

    res.json({ success: true, message: 'OTP sent to email (Check Console)' });
  } catch (err) {
    console.error('[AUTH] Request OTP error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const stored = otps.get(email);

  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  const db = getDB();
  try {
    let user;
    let wallet;

    if (stored.isRegister) {
      const userId = uuidv4();
      db.run('INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)',
        [userId, email, stored.password, Date.now()]);

      const walletId = uuidv4();
      db.run('INSERT INTO final_wallets (id, user_id, balance, updated_at) VALUES (?, ?, ?, ?)',
        [walletId, userId, 5.00, Date.now()]);

      db.run('INSERT INTO transactions (id, wallet_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), walletId, 'bonus', 5.00, 'Registration Bonus', Date.now()]);

      saveDB();
      user = { id: userId, email };
      wallet = { id: walletId };
    } else {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      stmt.bind([email]);
      if (stmt.step()) user = stmt.getAsObject();
      stmt.free();

      const wStmt = db.prepare('SELECT id FROM final_wallets WHERE user_id = ?');
      wStmt.bind([user.id]);
      if (wStmt.step()) wallet = wStmt.getAsObject();
      wStmt.free();
    }

    otps.delete(email);
    res.json({ success: true, user: { id: user.id, email: user.email }, walletId: wallet.id });
  } catch (err) {
    console.error('[AUTH] Verify OTP error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mock Google Register
router.post('/google-register', (req, res) => {
  const { email } = req.body;
  const db = getDB();
  
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email]);
    let user = null;
    if (stmt.step()) user = stmt.getAsObject();
    stmt.free();

    let wallet;

    if (!user) {
      const userId = uuidv4();
      db.run('INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)',
        [userId, email, 'google_auth', Date.now()]);

      const walletId = uuidv4();
      db.run('INSERT INTO final_wallets (id, user_id, balance, updated_at) VALUES (?, ?, ?, ?)',
        [walletId, userId, 5.00, Date.now()]);

      db.run('INSERT INTO transactions (id, wallet_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), walletId, 'bonus', 5.00, 'Registration Bonus', Date.now()]);
      
      saveDB();
      user = { id: userId, email };
      wallet = { id: walletId };
    } else {
      const wStmt = db.prepare('SELECT id FROM final_wallets WHERE user_id = ?');
      wStmt.bind([user.id]);
      if (wStmt.step()) wallet = wStmt.getAsObject();
      wStmt.free();
    }

    res.json({ success: true, user: { id: user.id, email: user.email }, walletId: wallet.id });
  } catch (err) {
    console.error('[AUTH] Google Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sync Clerk User
router.post('/sync', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const db = getDB();
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email]);
    let user = null;
    if (stmt.step()) user = stmt.getAsObject();
    stmt.free();

    let walletId;

    if (!user) {
      // First time Clerk user - Create account and give bonus
      const userId = uuidv4();
      db.run('INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)',
        [userId, email, 'clerk_auth', Date.now()]);

      walletId = uuidv4();
      db.run('INSERT INTO final_wallets (id, user_id, balance, updated_at) VALUES (?, ?, ?, ?)',
        [walletId, userId, 5.00, Date.now()]);

      db.run('INSERT INTO transactions (id, wallet_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), walletId, 'bonus', 5.00, 'Registration Bonus', Date.now()]);
      
      saveDB();
      user = { id: userId, email };
    } else {
      const wStmt = db.prepare('SELECT id FROM final_wallets WHERE user_id = ?');
      wStmt.bind([user.id]);
      if (wStmt.step()) {
        const wallet = wStmt.getAsObject();
        walletId = wallet.id;
      }
      wStmt.free();
    }

    res.json({ success: true, user: { id: user.id, email: user.email }, walletId });
  } catch (err) {
    console.error('[AUTH] Sync error:', err);
    res.status(500).json({ error: 'Login Failed (V3-NEW): ' + err.message });
  }
});

export default router;
