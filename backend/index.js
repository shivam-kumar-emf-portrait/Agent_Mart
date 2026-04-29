import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB, getDB, saveDB } from './db.js';
import servicesRouter from './routes/services.js';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';
import ordersRouter from './routes/orders.js';
import walletRouter from './routes/wallet.js';
import authRouter from './routes/auth_v4.js';

const app = express();
const PORT = process.env.PORT || 3001;

console.log("\n*************************************************");
console.log("--- AgentMart API Server v2 ---");
console.log("*************************************************\n");

// Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/services', servicesRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/auth', authRouter);

// Fallback root routes for Render deployment
app.use('/services', servicesRouter);
app.use('/orders', ordersRouter);
app.use('/wallet', walletRouter);
app.use('/webhook', webhookRouter);
app.use('/checkout', checkoutRouter);
app.use('/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AgentMart API', version: '2.0' });
});

// Auto-seed services if table is empty
function autoSeed() {
  const db = getDB();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM services');
  stmt.step();
  const count = stmt.getAsObject().count;
  stmt.free();

  if (count === 0) {
    console.log('[SEED] Services table empty — auto-seeding 15 agents...');
    const services = [
      { id: 'code-reviewer-001', name: 'Code Reviewer Pro', description: 'AI-powered code review that analyzes your code for bugs, security vulnerabilities, and performance issues. Provides actionable suggestions with severity ratings.', price_usdc: 2.50, input_schema: '{"code":"string","language":"string"}', output_schema: '{"review":"string","score":"number","issues":"array"}', category: 'development', seller_wallet: 'agent_wallet_dev_001' },
      { id: 'seo-auditor-002', name: 'SEO Audit Agent', description: 'Comprehensive SEO analysis of any webpage. Checks meta tags, heading structure, keyword density, performance metrics, and provides a prioritized action plan.', price_usdc: 3.00, input_schema: '{"url":"string"}', output_schema: '{"score":"number","issues":"array","improvements":"array"}', category: 'marketing', seller_wallet: 'agent_wallet_mkt_001' },
      { id: 'content-writer-003', name: 'Blog Post Generator', description: 'Creates high-quality, SEO-optimized blog posts on any topic. Includes meta descriptions, heading structure, and internal linking suggestions.', price_usdc: 1.50, input_schema: '{"topic":"string","tone":"string","word_count":"number"}', output_schema: '{"article":"string","meta_description":"string","key_points":"array"}', category: 'content', seller_wallet: 'agent_wallet_cnt_001' },
      { id: 'data-extractor-004', name: 'Web Data Extractor', description: 'Extracts structured data from any webpage. Supports product listings, contact info, pricing tables, and custom extraction patterns.', price_usdc: 1.00, input_schema: '{"url":"string","extraction_type":"string"}', output_schema: '{"data":"object","meta_data":"object"}', category: 'data', seller_wallet: 'agent_wallet_dat_001' },
      { id: 'summarizer-005', name: 'Document Summarizer', description: 'Condenses long documents, articles, or research papers into clear, structured summaries. Preserves key insights and citations.', price_usdc: 0.75, input_schema: '{"text":"string","summary_length":"string"}', output_schema: '{"summary":"string","key_points":"array"}', category: 'content', seller_wallet: 'agent_wallet_cnt_002' },
      { id: 'sql-generator-006', name: 'SQL Query Builder', description: 'Converts natural language questions into optimized SQL queries. Supports PostgreSQL, MySQL, and SQLite with schema-aware generation.', price_usdc: 1.25, input_schema: '{"question":"string","schema":"string","dialect":"string"}', output_schema: '{"sql_query":"string","explanation":"string"}', category: 'development', seller_wallet: 'agent_wallet_dev_002' },
      { id: 'sentiment-analyzer-007', name: 'Sentiment Analyzer', description: 'Analyzes text for emotional tone, brand sentiment, and customer satisfaction signals. Ideal for review monitoring and social listening.', price_usdc: 0.50, input_schema: '{"text":"string"}', output_schema: '{"sentiment":"string","score":"number","key_phrases":"array"}', category: 'analytics', seller_wallet: 'agent_wallet_anl_001' },
      { id: 'image-captioner-008', name: 'Image Caption AI', description: 'Generates accurate, descriptive captions for images. Supports accessibility alt-text, social media captions, and product descriptions.', price_usdc: 0.80, input_schema: '{"image_url":"string","style":"string"}', output_schema: '{"caption":"string","tags":"array"}', category: 'content', seller_wallet: 'agent_wallet_cnt_003' },
      { id: 'contract-reviewer-009', name: 'Smart Contract Auditor', description: 'Security audit for Solidity smart contracts. Detects reentrancy, overflow, and access control vulnerabilities with remediation steps.', price_usdc: 5.00, input_schema: '{"contract_code":"string","chain":"string"}', output_schema: '{"vulnerabilities":"array","score":"number","review":"string"}', category: 'security', seller_wallet: 'agent_wallet_sec_001' },
      { id: 'email-composer-010', name: 'Email Composer', description: 'Crafts professional emails for any context — cold outreach, follow-ups, customer support replies, and investor updates.', price_usdc: 0.50, input_schema: '{"context":"string","tone":"string","recipient":"string"}', output_schema: '{"subject":"string","body":"string"}', category: 'content', seller_wallet: 'agent_wallet_cnt_004' },
      { id: 'api-tester-011', name: 'API Endpoint Tester', description: 'Tests REST API endpoints for response time, status codes, schema validation, and error handling. Generates detailed test reports.', price_usdc: 1.50, input_schema: '{"endpoint_url":"string","method":"string","headers":"string"}', output_schema: '{"status":"number","response_time":"number","issues":"array"}', category: 'development', seller_wallet: 'agent_wallet_dev_003' },
      { id: 'translation-agent-012', name: 'Multi-Language Translator', description: 'Context-aware translation across 50+ languages. Preserves idiomatic expressions and cultural nuances for natural-sounding output.', price_usdc: 0.75, input_schema: '{"text":"string","target_language":"string"}', output_schema: '{"translated_text":"string","confidence":"number"}', category: 'content', seller_wallet: 'agent_wallet_cnt_005' },
      { id: 'pitch-deck-reviewer-013', name: 'Pitch Deck Reviewer', description: 'Evaluates startup pitch decks for investor readiness. Scores narrative flow, market sizing, competitive analysis, and financial projections.', price_usdc: 4.00, input_schema: '{"pitch_text":"string","stage":"string"}', output_schema: '{"score":"number","review":"string","improvements":"array"}', category: 'business', seller_wallet: 'agent_wallet_biz_001' },
      { id: 'resume-optimizer-014', name: 'Resume Optimizer', description: 'Optimizes resumes for ATS compatibility and recruiter appeal. Suggests keyword improvements, formatting fixes, and impact-driven bullet points.', price_usdc: 2.00, input_schema: '{"resume_text":"string","target_role":"string"}', output_schema: '{"optimized_resume":"string","score":"number","improvements":"array"}', category: 'career', seller_wallet: 'agent_wallet_car_001' },
      { id: 'podcast-to-thread-015', name: 'Podcast to Thread Agent', description: 'Chain agent: Transcribes audio, summarizes with Llama, generates a viral tweet thread. Full content pipeline in one call.', price_usdc: 3.50, input_schema: '{"audio_url":"string"}', output_schema: '{"transcript":"string","summary":"string","tweet_thread":"array"}', category: 'content', seller_wallet: 'agent_wallet_cnt_006' }
    ];

    for (const svc of services) {
      try {
        db.run('INSERT INTO services (id, name, description, price_usdc, input_schema, output_schema, category, seller_wallet) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [svc.id, svc.name, svc.description, svc.price_usdc, svc.input_schema, svc.output_schema, svc.category, svc.seller_wallet]);
      } catch (e) { /* ignore duplicates */ }
    }
    saveDB();
    console.log('[SEED] ✅ Auto-seeded 15 agents');
  } else {
    console.log(`[SEED] Found ${count} services — skipping seed`);
  }
}

// Initialize DB then start server
initDB().then(() => {
  autoSeed();
  app.listen(PORT, () => {
    console.log(`\n🤖 AgentMart API server running on http://localhost:${PORT}`);
    console.log(`   Services:  GET  http://localhost:${PORT}/api/services`);
    console.log(`   Checkout:  POST http://localhost:${PORT}/api/checkout/create`);
    console.log(`   Wallet:    GET  http://localhost:${PORT}/api/wallet/balance`);
    console.log(`   Auth:      POST http://localhost:${PORT}/api/auth/sync\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});