import { Router } from 'express';
import { getDB, saveDB } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { runAgentTask } from '../utils/agentRunner.js';

const router = Router();

// Get wallet balance
router.get('/balance', (req, res) => {
  const db = getDB();
  const stmt = db.prepare('SELECT balance FROM wallets WHERE id = ?');
  stmt.bind(['demo-wallet']);
  let balance = 0;
  if (stmt.step()) {
    balance = stmt.getAsObject().balance;
  }
  stmt.free();
  res.json({ balance });
});

// Deposit funds (Simulated)
router.post('/deposit', (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    console.log('[WALLET] Invalid deposit amount:', amount);
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const db = getDB();
    console.log('[WALLET] Depositing:', amount);
    db.run('UPDATE wallets SET balance = balance + ? WHERE id = ?', [amount, 'demo-wallet']);
    
    db.run('INSERT INTO transactions (id, wallet_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), 'demo-wallet', 'deposit', amount, 'Manual deposit', Date.now()]);
    
    saveDB();
    res.json({ success: true, message: `Deposited ${amount} USDC` });
  } catch (err) {
    console.error('[WALLET] Deposit DB error:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// Pay with wallet
router.post('/pay', async (req, res) => {
  const { service_id, buyer_input } = req.body;
  if (!service_id) return res.status(400).json({ error: 'Missing service_id' });

  const db = getDB();
  
  // Get service price
  const svcStmt = db.prepare('SELECT price_usdc, name FROM services WHERE id = ?');
  svcStmt.bind([service_id]);
  let service = null;
  if (svcStmt.step()) service = svcStmt.getAsObject();
  svcStmt.free();

  if (!service) return res.status(404).json({ error: 'Service not found' });

  // Check balance
  const walletStmt = db.prepare('SELECT balance FROM wallets WHERE id = ?');
  walletStmt.bind(['demo-wallet']);
  let balance = 0;
  if (walletStmt.step()) balance = walletStmt.getAsObject().balance;
  walletStmt.free();

  if (balance < service.price_usdc) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  // Deduct balance
  db.run('UPDATE wallets SET balance = balance - ? WHERE id = ?', [service.price_usdc, 'demo-wallet']);
  
  // Create or Update order
  let final_session_id = req.body.session_id;
  if (final_session_id) {
    db.run(
      `UPDATE orders SET status = 'paid' WHERE session_id = ?`,
      [final_session_id]
    );
  } else {
    final_session_id = `wallet_order_${uuidv4()}`;
    db.run(
      `INSERT INTO orders (session_id, service_id, buyer_input, status, created_at) VALUES (?, ?, ?, 'paid', ?)`,
      [final_session_id, service_id, JSON.stringify(buyer_input), Date.now()]
    );
  }

  // Record transaction
  db.run('INSERT INTO transactions (id, wallet_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'demo-wallet', 'payment', -service.price_usdc, `Paid for ${service.name}`, Date.now()]);

  saveDB();

  // START AGENT TASK IMMEDIATELY (Don't await, it runs in background)
  runAgentTask(final_session_id, service_id, buyer_input).catch(console.error);

  res.json({ success: true, session_id: final_session_id });
});

export default router;
