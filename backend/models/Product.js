// backend/models/Product.js
const db = require('../config/db');
const safeParseGallery = (galleryData) => {
    if (!galleryData) return [];
    if (Array.isArray(galleryData)) return galleryData;
    if (typeof galleryData === 'string') {
        try {
            const parsed = JSON.parse(galleryData);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            if (galleryData.startsWith('/')) {
                return [galleryData];
            }
            return [];
        }
    }
    return [];
};

const safeParseVariants = (variantsData) => {
    if (!variantsData) return null;
    if (typeof variantsData === 'string') {
        try {
            return JSON.parse(variantsData);
        } catch (e) {
            return null;
        }
    }
    return variantsData;
};

const safeParseCategories = (catsData) => {
    if (!catsData) return [];
    if (typeof catsData === 'string') {
        try {
            return JSON.parse(catsData) || [];
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(catsData) ? catsData : [];
};

class Product {
    static async findById(productId) {
        const [rows] = await db.query(
            `SELECT p.*, 
                    s.user_id, s.site_path,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT('id', c.id, 'name', c.name, 'discount_percentage', c.discount_percentage)
                        )
                        FROM product_categories pc
                        JOIN categories c ON pc.category_id = c.id
                        WHERE pc.product_id = p.id
                    ) AS categories
             FROM products p
             JOIN sites s ON p.site_id = s.id
             WHERE p.id = ?`,
            [productId]
        );
        if (!rows[0]) return null;
        rows[0].image_gallery = safeParseGallery(rows[0].image_gallery);
        rows[0].variants = safeParseVariants(rows[0].variants);
        rows[0].categories = safeParseCategories(rows[0].categories);
        return rows[0];
    }

    static async findBySiteId(siteId) {
        const [rows] = await db.query(`
            SELECT p.*, 
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT('id', c.id, 'name', c.name, 'discount_percentage', c.discount_percentage)
                    )
                    FROM product_categories pc
                    JOIN categories c ON pc.category_id = c.id
                    WHERE pc.product_id = p.id
                ) AS categories
            FROM products p
            WHERE p.site_id = ?
            ORDER BY p.created_at DESC
        `, [siteId]);
        
        return rows.map(product => {
            product.image_gallery = safeParseGallery(product.image_gallery);
            product.variants = safeParseVariants(product.variants);
            product.categories = safeParseCategories(product.categories);
            return product;
        });
    }

    static async create(productData) {
        const { site_id, name, description, price, image_path, category_ids, stock_quantity, variants, sale_percentage, type, digital_file_url } = productData;
        const image_gallery = image_path ? JSON.stringify([image_path]) : (productData.image_gallery ? JSON.stringify(productData.image_gallery) : null);
        const variantsJson = variants ? JSON.stringify(variants) : null;
        const [result] = await db.query(
            'INSERT INTO products (site_id, name, description, price, image_gallery, stock_quantity, variants, sale_percentage, type, digital_file_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [site_id, name, description, price || 0, image_gallery, stock_quantity || null, variantsJson, sale_percentage || 0, type || 'physical', digital_file_url || null]
        );
        const productId = result.insertId;
        if (Array.isArray(category_ids) && category_ids.length > 0) {
            const values = category_ids.map(cId => [productId, cId]);
            await db.query('INSERT INTO product_categories (product_id, category_id) VALUES ?', [values]);
        }
        return this.findById(productId);
    }

    static async update(productId, productData) {
        const { name, description, price, category_ids, stock_quantity, image_gallery, variants, sale_percentage, type, digital_file_url } = productData;
        let query = 'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, sale_percentage = ?, type = ?, digital_file_url = ?';
        const params = [name, description, price, stock_quantity, sale_percentage || 0, type || 'physical', digital_file_url || null];
        if ('image_gallery' in productData) {
            query += ', image_gallery = ?';
            params.push(JSON.stringify(image_gallery));
        }
        if ('variants' in productData) {
            query += ', variants = ?';
            params.push(variants ? JSON.stringify(variants) : null);
        }
        query += ' WHERE id = ?';
        params.push(productId);
        await db.query(query, params);
        if (category_ids !== undefined) {
            await db.query('DELETE FROM product_categories WHERE product_id = ?', [productId]);
            if (Array.isArray(category_ids) && category_ids.length > 0) {
                const values = category_ids.map(cId => [productId, cId]);
                await db.query('INSERT INTO product_categories (product_id, category_id) VALUES ?', [values]);
            }
        }
        return true;
    }

    static async delete(productId) {
        const [result] = await db.query(
            'DELETE FROM products WHERE id = ?',
            [productId]
        );
        return result;
    }

    static async findWithFilters({ ids, categoryId, limit, siteId }) {
        let query = `
            SELECT p.*,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT('id', c.id, 'name', c.name, 'discount_percentage', c.discount_percentage)
                    )
                    FROM product_categories pc
                    JOIN categories c ON pc.category_id = c.id
                    WHERE pc.product_id = p.id
                ) AS categories
            FROM products p
            WHERE 1=1
        `;
        const params = [];
        if (siteId) {
            query += ' AND p.site_id = ?';
            params.push(siteId);
        }
        if (ids && ids.length > 0) {
            const placeholders = ids.map(() => '?').join(',');
            query += ` AND p.id IN (${placeholders})`;
            params.push(...ids);
        }
        if (categoryId && categoryId !== 'all') {
            query += ' AND p.id IN (SELECT product_id FROM product_categories WHERE category_id = ?)';
            params.push(categoryId);
        }
        query += ' ORDER BY p.created_at DESC';
        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }
        const [rows] = await db.query(query, params);
        return rows.map(product => {
            product.image_gallery = safeParseGallery(product.image_gallery);
            product.variants = safeParseVariants(product.variants);
            product.categories = safeParseCategories(product.categories);
            return product;
        });
    }
}

module.exports = Product;