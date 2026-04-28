import { Router } from 'express';
import { getDB } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM services');
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();

  const services = rows.map(row => ({
    ...row,
    input_schema: JSON.parse(row.input_schema),
    output_schema: JSON.parse(row.output_schema)
  }));

  res.json({
    _agentmart: {
      version: "1.0",
      description: "AgentMart machine-readable service registry. AI agents can POST to /api/checkout/create with service_id and buyer_input to autonomously purchase any service.",
      checkout_endpoint: "POST /api/checkout/create",
      payment_currency: "USDC"
    },
    services
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM services WHERE id = ?');
  stmt.bind([id]);
  
  if (stmt.step()) {
    const row = stmt.getAsObject();
    const service = {
      ...row,
      input_schema: JSON.parse(row.input_schema),
      output_schema: JSON.parse(row.output_schema)
    };
    res.json(service);
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
  stmt.free();
});

export default router;
