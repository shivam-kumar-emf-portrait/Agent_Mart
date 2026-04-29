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

router.post('/', (req, res) => {
  const { name, description, price_usdc, category, input_schema, output_schema, seller_wallet } = req.body;
  
  if (!name || !description || price_usdc == null || !category || !input_schema || !output_schema || !seller_wallet) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate a simple ID
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

  const db = getDB();
  try {
    const stmt = db.prepare(`INSERT INTO services (id, name, description, price_usdc, input_schema, output_schema, category, seller_wallet) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run([id, name, description, parseFloat(price_usdc), input_schema, output_schema, category, seller_wallet]);
    stmt.free();
    
    // Save DB after insertion
    import('../db.js').then(({ saveDB }) => saveDB());

    res.status(201).json({ id, name, description, price_usdc, category, seller_wallet });
  } catch (error) {
    console.error('Failed to register service:', error);
    res.status(500).json({ error: 'Failed to register service' });
  }
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

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDB();
  try {
    const stmt = db.prepare('DELETE FROM services WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    import('../db.js').then(({ saveDB }) => saveDB());
    res.json({ success: true, deleted: id });
  } catch (error) {
    console.error('Failed to delete service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
