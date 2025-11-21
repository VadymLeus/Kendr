// backend/models/Tag.js
const db = require('../db');

class Tag {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM tags ORDER BY name ASC');
    return rows;
  }

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