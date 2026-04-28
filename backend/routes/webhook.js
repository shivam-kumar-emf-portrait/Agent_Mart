import { Router } from 'express';
import { getDB, saveDB } from '../db.js';
import { runAgentTask } from '../utils/agentRunner.js';

const router = Router();

router.post('/locus', async (req, res) => {
  try {
    const event = req.body;
    console.log('[Webhook] Received event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const { session_id, metadata } = event.data;
      const { service_id, buyer_input } = metadata;
      const parsedInput = typeof buyer_input === 'string' ? JSON.parse(buyer_input) : buyer_input;

      const db = getDB();
      db.run('UPDATE orders SET status = ? WHERE session_id = ?', ['paid', session_id]);
      saveDB();
      console.log(`[Webhook] Order ${session_id} marked as paid`);

      // Run agent task in background
      runAgentTask(session_id, service_id, parsedInput).catch(console.error);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Demo: simulate payment
router.post('/simulate-payment', async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

    const db = getDB();

    const stmt = db.prepare('SELECT * FROM orders WHERE session_id = ?');
    stmt.bind([session_id]);
    let order = null;
    if (stmt.step()) order = stmt.getAsObject();
    stmt.free();

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: `Order already ${order.status}` });

    db.run('UPDATE orders SET status = ? WHERE session_id = ?', ['paid', session_id]);
    saveDB();
    console.log(`[Simulate] Order ${session_id} marked as paid`);

    const parsedInput = JSON.parse(order.buyer_input);
    
    // Run agent task and return result for simulation
    const result = await runAgentTask(session_id, order.service_id, parsedInput);

    res.json({ success: true, status: 'completed', result });
  } catch (error) {
    console.error('[Simulate] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
