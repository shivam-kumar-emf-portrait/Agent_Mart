import { initDB, getDB, saveDB } from './db.js';

const services = [
  {
    id: 'code-reviewer-001',
    name: 'Code Reviewer Pro',
    description: 'AI-powered code review that analyzes your code for bugs, security vulnerabilities, and performance issues. Provides actionable suggestions with severity ratings.',
    price_usdc: 2.50,
    input_schema: JSON.stringify({ code: 'string', language: 'string' }),
    output_schema: JSON.stringify({ review: 'string', score: 'number', issues: 'array' }),
    category: 'development',
    seller_wallet: 'agent_wallet_dev_001'
  },
  {
    id: 'seo-auditor-002',
    name: 'SEO Audit Agent',
    description: 'Comprehensive SEO analysis of any webpage. Checks meta tags, heading structure, keyword density, performance metrics, and provides a prioritized action plan.',
    price_usdc: 3.00,
    input_schema: JSON.stringify({ url: 'string' }),
    output_schema: JSON.stringify({ score: 'number', issues: 'array', improvements: 'array' }),
    category: 'marketing',
    seller_wallet: 'agent_wallet_mkt_001'
  },
  {
    id: 'content-writer-003',
    name: 'Blog Post Generator',
    description: 'Creates high-quality, SEO-optimized blog posts on any topic. Includes meta descriptions, heading structure, and internal linking suggestions.',
    price_usdc: 1.50,
    input_schema: JSON.stringify({ topic: 'string', tone: 'string', word_count: 'number' }),
    output_schema: JSON.stringify({ article: 'string', meta_description: 'string', key_points: 'array' }),
    category: 'content',
    seller_wallet: 'agent_wallet_cnt_001'
  },
  {
    id: 'data-extractor-004',
    name: 'Web Data Extractor',
    description: 'Extracts structured data from any webpage. Supports product listings, contact info, pricing tables, and custom extraction patterns.',
    price_usdc: 1.00,
    input_schema: JSON.stringify({ url: 'string', extraction_type: 'string' }),
    output_schema: JSON.stringify({ data: 'object', meta_data: 'object' }),
    category: 'data',
    seller_wallet: 'agent_wallet_dat_001'
  },
  {
    id: 'summarizer-005',
    name: 'Document Summarizer',
    description: 'Condenses long documents, articles, or research papers into clear, structured summaries. Preserves key insights and citations.',
    price_usdc: 0.75,
    input_schema: JSON.stringify({ text: 'string', summary_length: 'string' }),
    output_schema: JSON.stringify({ summary: 'string', key_points: 'array' }),
    category: 'content',
    seller_wallet: 'agent_wallet_cnt_002'
  },
  {
    id: 'sql-generator-006',
    name: 'SQL Query Builder',
    description: 'Converts natural language questions into optimized SQL queries. Supports PostgreSQL, MySQL, and SQLite with schema-aware generation.',
    price_usdc: 1.25,
    input_schema: JSON.stringify({ question: 'string', schema: 'string', dialect: 'string' }),
    output_schema: JSON.stringify({ sql_query: 'string', explanation: 'string' }),
    category: 'development',
    seller_wallet: 'agent_wallet_dev_002'
  },
  {
    id: 'sentiment-analyzer-007',
    name: 'Sentiment Analyzer',
    description: 'Analyzes text for emotional tone, brand sentiment, and customer satisfaction signals. Ideal for review monitoring and social listening.',
    price_usdc: 0.50,
    input_schema: JSON.stringify({ text: 'string' }),
    output_schema: JSON.stringify({ sentiment: 'string', score: 'number', key_phrases: 'array' }),
    category: 'analytics',
    seller_wallet: 'agent_wallet_anl_001'
  },
  {
    id: 'image-captioner-008',
    name: 'Image Caption AI',
    description: 'Generates accurate, descriptive captions for images. Supports accessibility alt-text, social media captions, and product descriptions.',
    price_usdc: 0.80,
    input_schema: JSON.stringify({ image_url: 'string', style: 'string' }),
    output_schema: JSON.stringify({ caption: 'string', tags: 'array' }),
    category: 'content',
    seller_wallet: 'agent_wallet_cnt_003'
  },
  {
    id: 'contract-reviewer-009',
    name: 'Smart Contract Auditor',
    description: 'Security audit for Solidity smart contracts. Detects reentrancy, overflow, and access control vulnerabilities with remediation steps.',
    price_usdc: 5.00,
    input_schema: JSON.stringify({ contract_code: 'string', chain: 'string' }),
    output_schema: JSON.stringify({ vulnerabilities: 'array', score: 'number', review: 'string' }),
    category: 'security',
    seller_wallet: 'agent_wallet_sec_001'
  },
  {
    id: 'email-composer-010',
    name: 'Email Composer',
    description: 'Crafts professional emails for any context — cold outreach, follow-ups, customer support replies, and investor updates.',
    price_usdc: 0.50,
    input_schema: JSON.stringify({ context: 'string', tone: 'string', recipient: 'string' }),
    output_schema: JSON.stringify({ subject: 'string', body: 'string' }),
    category: 'content',
    seller_wallet: 'agent_wallet_cnt_004'
  },
  {
    id: 'api-tester-011',
    name: 'API Endpoint Tester',
    description: 'Tests REST API endpoints for response time, status codes, schema validation, and error handling. Generates detailed test reports.',
    price_usdc: 1.50,
    input_schema: JSON.stringify({ endpoint_url: 'string', method: 'string', headers: 'string' }),
    output_schema: JSON.stringify({ status: 'number', response_time: 'number', issues: 'array' }),
    category: 'development',
    seller_wallet: 'agent_wallet_dev_003'
  },
  {
    id: 'translation-agent-012',
    name: 'Multi-Language Translator',
    description: 'Context-aware translation across 50+ languages. Preserves idiomatic expressions and cultural nuances for natural-sounding output.',
    price_usdc: 0.75,
    input_schema: JSON.stringify({ text: 'string', target_language: 'string' }),
    output_schema: JSON.stringify({ translated_text: 'string', confidence: 'number' }),
    category: 'content',
    seller_wallet: 'agent_wallet_cnt_005'
  },
  {
    id: 'pitch-deck-reviewer-013',
    name: 'Pitch Deck Reviewer',
    description: 'Evaluates startup pitch decks for investor readiness. Scores narrative flow, market sizing, competitive analysis, and financial projections.',
    price_usdc: 4.00,
    input_schema: JSON.stringify({ pitch_text: 'string', stage: 'string' }),
    output_schema: JSON.stringify({ score: 'number', review: 'string', improvements: 'array' }),
    category: 'business',
    seller_wallet: 'agent_wallet_biz_001'
  },
  {
    id: 'resume-optimizer-014',
    name: 'Resume Optimizer',
    description: 'Optimizes resumes for ATS compatibility and recruiter appeal. Suggests keyword improvements, formatting fixes, and impact-driven bullet points.',
    price_usdc: 2.00,
    input_schema: JSON.stringify({ resume_text: 'string', target_role: 'string' }),
    output_schema: JSON.stringify({ optimized_resume: 'string', score: 'number', improvements: 'array' }),
    category: 'career',
    seller_wallet: 'agent_wallet_car_001'
  },
  {
    id: 'podcast-to-thread-015',
    name: 'Podcast → Thread Agent',
    description: 'Chain agent: Transcribes audio → summarizes with Llama → generates a viral tweet thread. Full content pipeline in one call.',
    price_usdc: 3.50,
    input_schema: JSON.stringify({ audio_url: 'string' }),
    output_schema: JSON.stringify({ transcript: 'string', summary: 'string', tweet_thread: 'array' }),
    category: 'content',
    seller_wallet: 'agent_wallet_cnt_006'
  }
];

async function seed() {
  await initDB();
  const db = getDB();

  // Clear existing services
  db.run('DELETE FROM services');

  for (const svc of services) {
    try {
      const stmt = db.prepare(
        'INSERT INTO services (id, name, description, price_usdc, input_schema, output_schema, category, seller_wallet) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      stmt.run([svc.id, svc.name, svc.description, svc.price_usdc, svc.input_schema, svc.output_schema, svc.category, svc.seller_wallet]);
      stmt.free();
      console.log(`✅ Seeded: ${svc.name}`);
    } catch (err) {
      console.error(`❌ Failed to seed ${svc.name}:`, err.message);
    }
  }

  saveDB();
  console.log(`\n🌱 Seeded ${services.length} services successfully!`);
}

seed().catch(console.error);
