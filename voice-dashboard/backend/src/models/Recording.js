import { dbRun, dbGet, dbAll } from '../utils/database.js';

export class Recording {
  static async create(data) {
    const result = await dbRun(
      `INSERT INTO recordings (title, text, voice, status)
       VALUES (?, ?, ?, ?)`,
      [data.title, data.text, data.voice || 'default', 'pending']
    );
    
    return this.getById(result.lastID);
  }

  static async getById(id) {
    return dbGet('SELECT * FROM recordings WHERE id = ?', [id]);
  }

  static async getAll(limit = 50, offset = 0) {
    return dbAll(
      `SELECT * FROM recordings 
       ORDER BY createdAt DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }

  static async update(id, data) {
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

    await dbRun(
      `UPDATE recordings 
       SET ${updates.join(', ')}
       WHERE id = ?`,
      values
    );
    
    return this.getById(id);
  }

  static async delete(id) {
    await dbRun('DELETE FROM recordings WHERE id = ?', [id]);
    return true;
  }

  static async getByStatus(status) {
    return dbAll(
      `SELECT * FROM recordings 
       WHERE status = ? 
       ORDER BY createdAt DESC`,
      [status]
    );
  }

  static async getTotalCount() {
    const result = await dbGet('SELECT COUNT(*) as count FROM recordings');
    return result.count;
  }

  static async getStats() {
    return dbGet(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(fileSize) as totalSize
       FROM recordings`
    );
  }
}
