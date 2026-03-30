import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/voice_generator.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

// Helper function to promisify database operations
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to SQLite database');
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
      }
    });
  }
  return db;
}

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    // Create recordings table
    const createTableSQL = `
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
    `;

    database.exec(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        reject(err);
        return;
      }

      // Create indexes
      const indexSQL = `
        CREATE INDEX IF NOT EXISTS idx_recordings_status ON recordings(status);
        CREATE INDEX IF NOT EXISTS idx_recordings_createdAt ON recordings(createdAt);
      `;

      database.exec(indexSQL, (err) => {
        if (err) {
          console.error('Error creating indexes:', err);
          reject(err);
        } else {
          console.log('✅ Database initialized');
          resolve(database);
        }
      });
    });
  });
}

// Export helper functions for use in models
export { dbRun, dbGet, dbAll };

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
