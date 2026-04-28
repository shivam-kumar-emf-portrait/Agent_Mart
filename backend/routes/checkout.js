import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB, saveDB } from '../db.js';

const router = Router();

router.post('/create', (req, res) => {
  try {
    const { service_id, buyer_input } = req.body;

    if (!service_id || !buyer_input) {
      return res.status(400).json({ error: 'Missing required fields: service_id and buyer_input' });
    }

    const db = getDB();

    // Look up service
    const stmt = db.prepare('SELECT * FROM services WHERE id = ?');
    stmt.bind([service_id]);
    let service = null;
    if (stmt.step()) {
      service = stmt.getAsObject();
    }
    stmt.free();

    if (!service) {
      return res.status(404).json({ error: `Service not found: ${service_id}` });
    }

    const session_id = `locus_session_${uuidv4()}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const checkoutSession = {
      id: session_id,
      amount: service.price_usdc,
      currency: 'USDC',
      status: 'open',
      metadata: {
        service_id,
        buyer_input: JSON.stringify(buyer_input)
      },
      success_url: `${frontendUrl}/result?session_id=${session_id}`,
      cancel_url: `${frontendUrl}/service/${service_id}`,
      checkout_url: `${frontendUrl}/checkout?session_id=${session_id}`
    };

    // Insert order
    db.run(
      `INSERT INTO orders (session_id, service_id, buyer_input, status, created_at) VALUES (?, ?, ?, 'pending', ?)`,
      [session_id, service_id, JSON.stringify(buyer_input), Date.now()]
    );
    saveDB();

    res.json({
      session_id: checkoutSession.id,
      checkout_url: checkoutSession.checkout_url,
      locus_component_props: {
        sessionId: checkoutSession.id,
        publicKey: process.env.LOCUS_PUBLIC_KEY || 'pk_test_demo',
        amount: service.price_usdc,
        currency: 'USDC',
        serviceName: service.name,
        sellerWallet: service.seller_wallet,
        successUrl: checkoutSession.success_url,
        cancelUrl: checkoutSession.cancel_url
      }
    });
  } catch (error) {
    console.error('[Checkout] Error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

export default router;
