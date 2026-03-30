import { getDatabase } from '../utils/database.js';

export class Recording {
  static create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO recordings (title, text, voice, status)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.title,
      data.text,
      data.voice || 'default',
      'pending'
    );
    
    return this.getById(result.lastInsertRowid);
  }

  static getById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM recordings WHERE id = ?');
    return stmt.get(id);
  }

  static getAll(limit = 50, offset = 0) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM recordings 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  }

  static update(id, data) {
    const db = getDatabase();
    const updates = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE recordings 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.getById(id);
  }

  static delete(id) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM recordings WHERE id = ?');
    stmt.run(id);
    return true;
  }

  static getByStatus(status) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM recordings 
      WHERE status = ? 
      ORDER BY createdAt DESC
    `);
    return stmt.all(status);
  }

  static getTotalCount() {
    const db = getDatabase();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM recordings');
    return stmt.get().count;
  }

  static getStats() {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(fileSize) as totalSize
      FROM recordings
    `);
    return stmt.get();
  }
}
