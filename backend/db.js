import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'agentmart.db');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log('[DB] Created directory:', DB_DIR);
}
let db = null;
let SQL = null;

export async function initDB() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
    console.log('[DB] Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('[DB] Creating new database');

    // Create Tables
    db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        price_usdc REAL,
        input_schema TEXT,
        output_schema TEXT,
        category TEXT,
        seller_wallet TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
        session_id TEXT PRIMARY KEY,
        service_id TEXT,
        buyer_input TEXT,
        status TEXT,
        result TEXT,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        balance REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        wallet_id TEXT,
        type TEXT,
        amount REAL,
        description TEXT,
        created_at INTEGER
      );
    `);

    // Seed Services (15 Services)
    const services = [
      {
        id: 'summarizer-v1',
        name: 'Document Summarizer',
        description: 'Paste any text and receive a clean, concise summary with key bullet points extracted.',
        price_usdc: 0.50,
        input_schema: JSON.stringify({ text: 'string (required)' }),
        output_schema: JSON.stringify({ summary: 'string', key_points: 'string[]' }),
        category: 'text',
        seller_wallet: '0xSellerWallet001'
      },
      {
        id: 'code-reviewer-v1',
        name: 'AI Code Reviewer',
        description: 'Submit a code snippet and get a detailed review covering bugs, security issues, and improvements.',
        price_usdc: 1.00,
        input_schema: JSON.stringify({ code: 'string', language: 'string' }),
        output_schema: JSON.stringify({ issues: 'string[]', improvements: 'string[]', score: 'number' }),
        category: 'code',
        seller_wallet: '0xSellerWallet002'
      },
      {
        id: 'data-extractor-v1',
        name: 'URL Data Extractor',
        description: 'Provide a URL or raw HTML and extract structured data: title, main content, links, and metadata.',
        price_usdc: 0.25,
        input_schema: JSON.stringify({ url: 'string' }),
        output_schema: JSON.stringify({ title: 'string', content: 'string', meta: 'object' }),
        category: 'data',
        seller_wallet: '0xSellerWallet003'
      },
      {
        id: 'contract-auditor-v1',
        name: 'Smart Contract Auditor',
        description: 'Deep security scan for Solidity smart contracts. Detects reentrancy, overflow, and logic flaws.',
        price_usdc: 5.00,
        input_schema: JSON.stringify({ contract_code: 'string' }),
        output_schema: JSON.stringify({ vulnerabilities: 'object[]', risk_level: 'string' }),
        category: 'web3',
        seller_wallet: '0xCryptoSec'
      },
      {
        id: 'legal-analyzer-v1',
        name: 'Legal Contract Risk-Scan',
        description: 'Identify "hidden" risks and unfavorable clauses in NDAs, Service Agreements, and Employment contracts.',
        price_usdc: 2.50,
        input_schema: JSON.stringify({ agreement_text: 'string' }),
        output_schema: JSON.stringify({ risky_clauses: 'string[]', overall_safety: 'number' }),
        category: 'legal',
        seller_wallet: '0xLawNode'
      },
      {
        id: 'seo-optimizer-v1',
        name: 'SEO Content Guru',
        description: 'Optimize your blog posts for search engines. Get keyword suggestions and readability scores.',
        price_usdc: 0.75,
        input_schema: JSON.stringify({ article: 'string', keywords: 'string[]' }),
        output_schema: JSON.stringify({ optimized_article: 'string', suggestions: 'string[]' }),
        category: 'marketing',
        seller_wallet: '0xSEO_Master'
      },
      {
        id: 'tweet-storm-v1',
        name: 'Tweet Storm Generator',
        description: 'Turn any long-form article or thought into a high-engagement viral Twitter thread.',
        price_usdc: 0.30,
        input_schema: JSON.stringify({ source_text: 'string' }),
        output_schema: JSON.stringify({ thread: 'string[]' }),
        category: 'social',
        seller_wallet: '0xGrowthHacker'
      },
      {
        id: 'resume-booster-v1',
        name: 'Resume Optimizer AI',
        description: 'Upload your resume and a job description. We rewrite it to pass ATS systems and wow recruiters.',
        price_usdc: 1.50,
        input_schema: JSON.stringify({ resume: 'string', job_description: 'string' }),
        output_schema: JSON.stringify({ optimized_resume: 'string', match_score: 'number' }),
        category: 'career',
        seller_wallet: '0xCareerCoach'
      },
      {
        id: 'sentiment-pro-v1',
        name: ' Sentiment Analysis Pro',
        description: 'Bulk analyze customer reviews or social media comments to extract emotional tone and intent.',
        price_usdc: 0.20,
        input_schema: JSON.stringify({ comments: 'string[]' }),
        output_schema: JSON.stringify({ positive: 'number', negative: 'number', summary: 'string' }),
        category: 'data',
        seller_wallet: '0xDataInsights'
      },
      {
        id: 'sql-wizard-v1',
        name: 'Natural Language SQL Wizard',
        description: 'Convert plain English questions into complex, optimized SQL queries for Postgres or MySQL.',
        price_usdc: 0.50,
        input_schema: JSON.stringify({ question: 'string', schema_context: 'string' }),
        output_schema: JSON.stringify({ sql_query: 'string', explanation: 'string' }),
        category: 'code',
        seller_wallet: '0xQueryMaster'
      },
      {
        id: 'med-simplifier-v1',
        name: 'Medical Report Simplifier',
        description: 'Translate complex medical jargon and lab results into easy-to-understand language for patients.',
        price_usdc: 1.25,
        input_schema: JSON.stringify({ report_text: 'string' }),
        output_schema: JSON.stringify({ simplified_results: 'string', recommendations: 'string[]' }),
        category: 'health',
        seller_wallet: '0xHealthAI'
      },
      {
        id: 'logo-vision-v1',
        name: 'Logo Concept Generator',
        description: 'Generate 4 unique vector-style logo concepts based on your brand name and industry.',
        price_usdc: 2.00,
        input_schema: JSON.stringify({ brand_name: 'string', industry: 'string', vibe: 'string' }),
        output_schema: JSON.stringify({ concepts: 'string[]', color_palette: 'string[]' }),
        category: 'design',
        seller_wallet: '0xDesignBot'
      },
      {
        id: 'ecommerce-copy-v1',
        name: 'E-commerce Copywriter',
        description: 'Generate high-converting product descriptions, bullet points, and ad copy for Amazon/Shopify.',
        price_usdc: 0.40,
        input_schema: JSON.stringify({ product_features: 'string[]', target_audience: 'string' }),
        output_schema: JSON.stringify({ descriptions: 'string[]', headlines: 'string[]' }),
        category: 'marketing',
        seller_wallet: '0xShopifyPro'
      },
      {
        id: 'cyber-pentester-v1',
        name: 'Web Security Pentester',
        description: 'Automated vulnerability scan for web apps. Checks for XSS, SQLi, and misconfigurations.',
        price_usdc: 3.50,
        input_schema: JSON.stringify({ target_url: 'string' }),
        output_schema: JSON.stringify({ vulnerabilities: 'string[]', severity_map: 'object' }),
        category: 'security',
        seller_wallet: '0xPentestAgent'
      },
      {
        id: 'video-insight-pro',
        name: '[COMBO] Video Insight Pro',
        description: 'Multi-Agent Chain: Give a Video URL, and Agent 1 (Whisper) extracts transcript, Agent 2 (Llama) summarizes, and Agent 3 (Social Agent) creates a viral thread.',
        price_usdc: 1.50,
        input_schema: JSON.stringify({ video_url: 'string (YouTube/mp4)' }),
        output_schema: JSON.stringify({ transcript: 'string', summary: 'string', tweet_thread: 'string[]' }),
        category: 'chain',
        seller_wallet: '0xChainMaster'
      }
    ];

    const stmt = db.prepare(`INSERT INTO services VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const s of services) {
      stmt.run([s.id, s.name, s.description, s.price_usdc, s.input_schema, s.output_schema, s.category, s.seller_wallet]);
    }
    stmt.free();

    // Initial Wallet
    db.run("INSERT INTO wallets VALUES (?, ?)", ['demo-wallet', 10.00]);

    saveDB();
    console.log(`[DB] Database initialized and seeded with ${services.length} services and demo wallet`);
  }

  return db;
}

export function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  }
}

export function getDB() {
  return db;
}
