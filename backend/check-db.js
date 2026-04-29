import { initDB } from './db.js';

async function check() {
  const db = await initDB();
  const stmt = db.prepare('SELECT * FROM services');
  while (stmt.step()) {
    const row = stmt.getAsObject();
    console.log(`ID: ${row.id}, Name: ${row.name}, Category: ${row.category}`);
  }
  stmt.free();
}

check();
