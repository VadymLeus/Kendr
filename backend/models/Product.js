// backend/models/Product.js
const db = require('../db');

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

class Product {
    static async findById(productId) {
        const [rows] = await db.query(
            `SELECT p.*, 
                    c.name as category_name, 
                    c.discount_percentage as category_discount,
                    s.user_id, s.site_path
             FROM products p
             JOIN sites s ON p.site_id = s.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = ?`,
            [productId]
        );
        if (!rows[0]) return null;

        rows[0].image_gallery = safeParseGallery(rows[0].image_gallery);
        rows[0].variants = safeParseVariants(rows[0].variants);
        return rows[0];
    }

    static async findBySiteId(siteId) {
        const [rows] = await db.query(`
            SELECT p.*, 
                   c.name as category_name,
                   c.discount_percentage as category_discount
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.site_id = ?
            ORDER BY p.created_at DESC
        `, [siteId]);
        
        return rows.map(product => {
            product.image_gallery = safeParseGallery(product.image_gallery);
            product.variants = safeParseVariants(product.variants);
            return product;
        });
    }

    static async create(productData) {
        const { site_id, name, description, price, image_path, category_id, stock_quantity, variants, sale_percentage } = productData;
        
        const image_gallery = image_path ? JSON.stringify([image_path]) : null;
        const variantsJson = variants ? JSON.stringify(variants) : null;

        const [result] = await db.query(
            'INSERT INTO products (site_id, name, description, price, image_gallery, category_id, stock_quantity, variants, sale_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [site_id, name, description, price || 0, image_gallery, category_id || null, stock_quantity || null, variantsJson, sale_percentage || 0]
        );
        
        return this.findById(result.insertId);
    }

    static async update(productId, productData) {
        const { name, description, price, category_id = null, stock_quantity, image_gallery, variants, sale_percentage } = productData;
        
        let query = 'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock_quantity = ?, sale_percentage = ?';
        const params = [name, description, price, category_id, stock_quantity, sale_percentage || 0];
        
        if ('image_gallery' in productData) {
            query += ', image_gallery = ?';
            params.push(image_gallery);
        }

        if ('variants' in productData) {
            query += ', variants = ?';
            params.push(variants ? JSON.stringify(variants) : null);
        }
        
        query += ' WHERE id = ?';
        params.push(productId);

        const [result] = await db.query(query, params);
        return result;
    }

    static async delete(productId) {
        const [result] = await db.query(
            'DELETE FROM products WHERE id = ?',
            [productId]
        );
        return result;
    }
}

module.exports = Product;