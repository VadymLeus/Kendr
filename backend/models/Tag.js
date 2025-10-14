// backend/models/Tag.js
const db = require('../db');

class Tag {
  // Отримати всі існуючі теги
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM tags ORDER BY name ASC');
    return rows;
  }

  // Знайти теги, присвоєні конкретному сайту
  static async findBySiteId(siteId) {
    const [rows] = await db.query(
      `SELECT t.id, t.name 
       FROM tags t
       JOIN site_tags st ON t.id = st.tag_id
       WHERE st.site_id = ?`,
      [siteId]
    );
    return rows;
  }
}

module.exports = Tag;