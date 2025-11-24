// backend/models/Site.js
const db = require('../db');
const { deleteFile } = require('../utils/fileUtils');

class Site {
  static async getPublic(searchTerm = '', userId = null) {
    let query = `
        SELECT
            s.id, s.site_path, s.title, s.logo_url, s.status,
            u.username AS author
        FROM sites s
        JOIN users u ON s.user_id = u.id
    `;
    const params = [];

    if (userId) {
        query += ' WHERE s.user_id = ?';
        params.push(userId);
        if (searchTerm) {
            query += ' AND s.title LIKE ?';
            params.push(`%${searchTerm}%`);
        }
    } 
    else {
         query += " WHERE s.status = 'published'";
        if (searchTerm) {
            query += ' AND s.title LIKE ?';
            params.push(`%${searchTerm}%`);
        }
    }
    query += ' ORDER BY s.created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
  }

  static async findAllForAdmin() {
    const [rows] = await db.query(`
        SELECT
             s.id, s.site_path, s.title, s.logo_url, s.status, s.deletion_scheduled_for,
            u.username AS author
        FROM sites s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.updated_at DESC
    `);
    return rows;
  }

  static async findByPath(sitePath) {
    const [sites] = await db.query(`
        SELECT
            s.id, s.user_id, s.title, s.logo_url, s.status,
            s.view_count, s.site_theme_mode, s.site_theme_accent,
            s.site_path, s.theme_settings, s.header_content, s.footer_content, s.footer_layout,
            s.favicon_url, s.site_title_seo  -- ДОДАНО: нові поля
        FROM sites s
        WHERE s.site_path = ?
    `, [sitePath]);
    
    if (!sites[0]) return null;
    const site = sites[0];
    
    try {
        if (typeof site.theme_settings === 'string') {
            site.theme_settings = JSON.parse(site.theme_settings);
        }
        if (typeof site.header_content === 'string') {
            site.header_content = JSON.parse(site.header_content);
        }
        if (typeof site.footer_content === 'string') {
            site.footer_content = JSON.parse(site.footer_content);
        }
    } catch (error) {
        console.error('Error parsing JSON fields for site:', sitePath, error);
        site.theme_settings = site.theme_settings || {};
        site.header_content = site.header_content || [];
        site.footer_content = site.footer_content || [];
    }

    const [productRows] = await db.query(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.site_id = ?
        ORDER BY p.created_at DESC
    `, [site.id]);

    return { ...site, products: productRows };
  }

  static async findByIdAndUserId(siteId, userId) {
    const [rows] = await db.query(
      'SELECT * FROM sites WHERE id = ? AND user_id = ?',
      [siteId, userId]
    );
    return rows[0] || null;
  }

  static async create(userId, sitePath, title, logoUrl) {
    const [result] = await db.query(
      'INSERT INTO sites (user_id, site_path, title, logo_url, status) VALUES (?, ?, ?, ?, ?)',
      [userId, sitePath, title, logoUrl, 'draft']
    );
    return { 
      id: result.insertId, 
      user_id: userId, 
      site_path: sitePath, 
      title: title, 
      logo_url: logoUrl, 
      status: 'draft' 
    };
  }

  static async updateSettings(siteId, data) {
    const { 
      title, 
      status, 
      site_theme_mode, 
      site_theme_accent, 
      theme_settings, 
      header_content,
      footer_content,
      favicon_url,
      site_title_seo
    } = data;
    
    const safeStringify = (obj) => {
      if (!obj) return null;
      try {
        return JSON.stringify(obj);
      } catch (error) {
        console.error('Error stringifying object:', error);
        return null;
      }
    };

    const params = [
        title, 
        status, 
        site_theme_mode || 'light',
        site_theme_accent || 'orange',
        safeStringify(theme_settings),
        safeStringify(header_content),
        safeStringify(footer_content),
        favicon_url || null,
        site_title_seo || null,
        siteId
    ];

    const query = `
        UPDATE sites 
        SET 
            title = ?, 
            status = ?, 
            site_theme_mode = ?, 
            site_theme_accent = ?,
            theme_settings = ?,
            header_content = ?,
            footer_content = ?,
            favicon_url = ?, 
            site_title_seo = ?
        WHERE id = ?
    `;
    
    const [result] = await db.query(query, params);
    return result;
  }

  static async updateStatus(siteId, status, deletionDate = null) {
    const [result] = await db.query(
         'UPDATE sites SET status = ?, deletion_scheduled_for = ? WHERE id = ?',
        [status, deletionDate, siteId]
    );
    return result;
  }

  static async incrementViewCount(siteId) {
    await db.query(
      'UPDATE sites SET view_count = view_count + 1 WHERE id = ?',
      [siteId]
    );
  }

  static async updateTags(siteId, tagIds = []) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM site_tags WHERE site_id = ?', [siteId]);
        if (tagIds.length > 0) {
            const values = tagIds.map(tagId => [siteId, tagId]);
            await connection.query('INSERT INTO site_tags (site_id, tag_id) VALUES ?', [values]);
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }

  static async delete(siteId) {
    const [result] = await db.query('DELETE FROM sites WHERE id = ?', [siteId]);
    return result;
  }

  static async deleteByPathAndUserId(sitePath, userId) {
    const [sites] = await db.query(
      'SELECT id, logo_url FROM sites WHERE site_path = ? AND user_id = ?',
      [sitePath, userId]
    );
    if (sites.length === 0) return null;
    const siteToDelete = sites[0];
    const { id: siteId, logo_url: logoUrl } = siteToDelete;
    const result = await this.delete(siteId);
    if (logoUrl && !logoUrl.includes('/default/')) {
      await deleteFile(logoUrl);
    }
    return result;
  }

  static async getUserSites(userId) {
    const [rows] = await db.query(`
      SELECT s.id, s.site_path, s.title, s.logo_url, s.status
      FROM sites s 
       WHERE s.user_id = ? 
      ORDER BY s.created_at DESC
    `, [userId]);
    return rows;
  }

  static async findSuspendedForUser(userId) {
    const [rows] = await db.query(
      "SELECT id, site_path, title, deletion_scheduled_for FROM sites WHERE user_id = ? AND status = 'suspended'",
      [userId]
    );
    return rows;
  }
}

module.exports = Site;