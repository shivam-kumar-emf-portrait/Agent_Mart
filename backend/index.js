import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import servicesRouter from './routes/services.js';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';
import ordersRouter from './routes/orders.js';
import walletRouter from './routes/wallet.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(cors({
  origin: true, // Allow all origins for easier deployment testing
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/services', servicesRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/wallet', walletRouter);

// Fallback for root routes (Render seems to be hitting these)
app.use('/services', servicesRouter);
app.use('/orders', ordersRouter);
app.use('/wallet', walletRouter);
app.use('/webhook', webhookRouter);
app.use('/checkout', checkoutRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AgentMart API', version: '1.0' });
});

// Initialize DB then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🤖 AgentMart API server running on http://localhost:${PORT}`);
    console.log(`   Services:  GET  http://localhost:${PORT}/api/services`);
    console.log(`   Checkout:  POST http://localhost:${PORT}/api/checkout/create`);
    console.log(`   Webhook:   POST http://localhost:${PORT}/api/webhook/locus`);
    console.log(`   Orders:    GET  http://localhost:${PORT}/api/orders/:sessionId`);
    console.log(`   Simulate:  POST http://localhost:${PORT}/api/webhook/simulate-payment\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});