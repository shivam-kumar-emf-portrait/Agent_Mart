import { Router } from 'express';
import { getDB, saveDB } from '../db.js';

const router = Router();

router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const db = getDB();

  // Get order
  const orderStmt = db.prepare('SELECT * FROM orders WHERE session_id = ?');
  orderStmt.bind([sessionId]);
  let order = null;
  if (orderStmt.step()) {
    order = orderStmt.getAsObject();
  }
  orderStmt.free();

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const response = {
    ...order,
    buyer_input: JSON.parse(order.buyer_input),
    result: order.result ? JSON.parse(order.result) : null
  };

  // Get service details
  const svcStmt = db.prepare('SELECT * FROM services WHERE id = ?');
  svcStmt.bind([order.service_id]);
  if (svcStmt.step()) {
    const service = svcStmt.getAsObject();
    response.service = {
      ...service,
      input_schema: JSON.parse(service.input_schema),
      output_schema: JSON.parse(service.output_schema)
    };
  }
  svcStmt.free();

  res.json(response);
});

export default router;
