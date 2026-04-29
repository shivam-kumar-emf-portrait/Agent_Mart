import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Portable path — works on Windows (local) and Linux (Render)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'agentmart_v10.db');

console.log('[DB] Database path:', DB_FILE);

let db = null;
let SQL = null;

export async function initDB() {
  if (db) return db;
  SQL = await initSqlJs();
  
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  if (fs.existsSync(DB_FILE)) {
    db = new SQL.Database(fs.readFileSync(DB_FILE));
    console.log('[DB] Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('[DB] Creating NEW database');
  }

  // Define Tables with NEW NAME: final_wallets
  db.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, created_at INTEGER)`);
  db.run(`CREATE TABLE IF NOT EXISTS services (id TEXT PRIMARY KEY, name TEXT, description TEXT, price_usdc REAL, input_schema TEXT, output_schema TEXT, category TEXT, seller_wallet TEXT)`);
  
  db.run(`CREATE TABLE IF NOT EXISTS final_wallets (
    id TEXT PRIMARY KEY, 
    user_id TEXT, 
    balance REAL DEFAULT 0, 
    updated_at INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    session_id TEXT PRIMARY KEY,
    service_id TEXT,
    buyer_input TEXT,
    status TEXT DEFAULT 'pending',
    result TEXT,
    created_at INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, wallet_id TEXT, type TEXT, amount REAL, description TEXT, created_at INTEGER)`);

  saveDB();
  return db;
}

export function saveDB() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  }
}

export function getDB() { return db; }
