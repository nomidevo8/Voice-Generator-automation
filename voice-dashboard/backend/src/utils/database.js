import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/voice_generator.db');

let db;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initializeDatabase() {
  const database = getDatabase();
  
  // Create recordings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      voice TEXT DEFAULT 'default',
      status TEXT DEFAULT 'pending',
      audioPath TEXT,
      alignmentPath TEXT,
      chunkedContentPath TEXT,
      metadataPath TEXT,
      duration REAL DEFAULT 0,
      fileSize INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create index for faster queries
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_recordings_status ON recordings(status);
    CREATE INDEX IF NOT EXISTS idx_recordings_createdAt ON recordings(createdAt);
  `);

  console.log('✅ Database initialized');
  return database;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
