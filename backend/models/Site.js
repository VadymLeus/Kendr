// backend/models/Site.js
const db = require('../config/db');
const { deleteFile } = require('../utils/fileUtils');

class Site {
  static async getPublic({ searchTerm = '', userId = null, tag = null, sort = 'new', onlyFavorites = false, currentUserId = null }) {
    let query = `
        SELECT DISTINCT
            s.id, s.site_path, s.title, s.logo_url, s.status, s.view_count, s.created_at,
            s.cover_image, s.cover_layout, s.site_theme_accent, s.site_theme_mode,
            s.is_pinned, 
            u.username AS author, u.avatar_url AS author_avatar
        FROM sites s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN site_tags st ON s.id = st.site_id 
    `;
    
    if (onlyFavorites && currentUserId) {
        query += ` JOIN user_favorites uf ON s.id = uf.site_id AND uf.user_id = ${db.escape(currentUserId)} `;
    }
    
    const params = [];
    const conditions = [];

    if (userId) {
        conditions.push('s.user_id = ?');
        params.push(userId);
    } else {
        conditions.push("s.status = 'published'");
    }

    if (searchTerm) {
        conditions.push('s.title LIKE ?');
        params.push(`%${searchTerm}%`);
    }

    if (tag) {
        conditions.push('st.tag_id = ?');
        params.push(tag);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    let orderByClause = 'ORDER BY s.is_pinned DESC, s.created_at DESC';

    if (sort) {
        if (sort === 'popular') {
            orderByClause = 'ORDER BY s.is_pinned DESC, s.view_count DESC, s.created_at DESC';
        } else {
            const parts = sort.split(':');
            if (parts.length === 2) {
                const field = parts[0];
                const dir = parts[1].toUpperCase();
                const allowedFields = {
                    'created_at': 's.created_at',
                    'view_count': 's.view_count',
                    'title': 's.title',
                    'author': 'u.username',
                    'popularity': 's.view_count'
                };
                const validDir = (dir === 'ASC' || dir === 'DESC') ? dir : 'DESC';
                if (allowedFields[field]) {
                    orderByClause = `ORDER BY s.is_pinned DESC, ${allowedFields[field]} ${validDir}`;
                }
            }
        }
    }

    query += ` ${orderByClause}`;
    const [rows] = await db.query(query, params);

    for (let site of rows) {
        const [tags] = await db.query(`
            SELECT t.id, t.name 
            FROM tags t
            JOIN site_tags st ON t.id = st.tag_id
            WHERE st.site_id = ?
        `, [site.id]);
        site.tags = tags;
    }

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
            s.favicon_url, s.site_title_seo,
            s.cover_image, s.cover_layout,
            
            -- Новые поля
            s.cover_logo_size,
            s.cover_logo_radius,
            s.cover_title_size

        FROM sites s
        WHERE s.site_path = ?
    `, [sitePath]);
    
    if (!sites[0]) return null;
    const site = sites[0];
    
    try {
        if (typeof site.theme_settings === 'string') site.theme_settings = JSON.parse(site.theme_settings);
        if (typeof site.header_content === 'string') site.header_content = JSON.parse(site.header_content);
        if (typeof site.footer_content === 'string') site.footer_content = JSON.parse(site.footer_content);
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
    const [rows] = await db.query('SELECT * FROM sites WHERE id = ? AND user_id = ?', [siteId, userId]);
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
      title, status, site_theme_mode, site_theme_accent, theme_settings, 
      header_content, footer_content, favicon_url, site_title_seo, 
      cover_image, cover_layout, logo_url,
      
      cover_logo_size, cover_logo_radius, cover_title_size
    } = data;
    
    const safeStringify = (obj) => {
      if (!obj) return null;
      try { return JSON.stringify(obj); } 
      catch (error) { return null; }
    };

    let safeFaviconUrl = null;
    if (typeof favicon_url === 'string') safeFaviconUrl = favicon_url;

    const params = [
        title, 
        status, 
        site_theme_mode || 'light',
        site_theme_accent || 'orange',
        safeStringify(theme_settings),
        safeStringify(header_content),
        safeStringify(footer_content),
        safeFaviconUrl,
        site_title_seo || null,
        cover_image || null,
        cover_layout || 'centered',
        logo_url,
        cover_logo_size || 80,
        cover_logo_radius || 0,
        cover_title_size || 24,

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
            site_title_seo = ?,
            cover_image = ?, 
            cover_layout = ?,
            logo_url = ?,
            
            -- SQL для новых полей
            cover_logo_size = ?,
            cover_logo_radius = ?,
            cover_title_size = ?
            
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
    await db.query('UPDATE sites SET view_count = view_count + 1 WHERE id = ?', [siteId]);
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
      SELECT s.id, s.site_path, s.title, s.logo_url, s.status, 
             s.cover_image, s.cover_layout, s.site_theme_accent, s.site_theme_mode,
             s.is_pinned, s.view_count, s.created_at
      FROM sites s 
      WHERE s.user_id = ? 
      ORDER BY s.is_pinned DESC, s.updated_at DESC
    `, [userId]);
    
    for (let site of rows) {
        const [tags] = await db.query(`
            SELECT t.id, t.name 
            FROM tags t
            JOIN site_tags st ON t.id = st.tag_id
            WHERE st.site_id = ?
        `, [site.id]);
        site.tags = tags;
    }
    return rows;
  }

  static async findSuspendedForUser(userId) {
    const [rows] = await db.query(
      "SELECT id, site_path, title, deletion_scheduled_for FROM sites WHERE user_id = ? AND status = 'suspended'",
      [userId]
    );
    return rows;
  }

  static async togglePin(siteId) {
    await db.query('UPDATE sites SET is_pinned = NOT is_pinned WHERE id = ?', [siteId]);
    const [rows] = await db.query('SELECT is_pinned FROM sites WHERE id = ?', [siteId]);
    return rows[0] ? !!rows[0].is_pinned : false;
  }
}

module.exports = Site;