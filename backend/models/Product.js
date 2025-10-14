// backend/models/Product.js
const db = require('../db');

class Product {
    // Знайти товар за ID. Запит також повертає user_id власника сайту.
    static async findById(productId) {
        const [rows] = await db.query(
            `SELECT p.*, s.user_id
             FROM products p
             JOIN sites s ON p.site_id = s.id
             WHERE p.id = ?`,
            [productId]
        );
        return rows[0];
    }

    // Створити новий товар для сайту
    static async create(productData) {
        const { site_id, name, description, price, image_url, category_id, stock_quantity } = productData;
        const [result] = await db.query(
            'INSERT INTO products (site_id, name, description, price, image_url, category_id, stock_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [site_id, name, description, price || 0, image_url, category_id || null, stock_quantity || null]
        );
        const newProduct = await this.findById(result.insertId);
        return newProduct;
    }

    // Оновити існуючий товар
    static async update(productId, productData) {
        const { name, description, price, image_url, category_id = null, stock_quantity } = productData;
        const [result] = await db.query(
            'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, stock_quantity = ? WHERE id = ?',
            [name, description, price, image_url, category_id, stock_quantity, productId]
        );
        return result;
    }

    // Видалити товар
    static async delete(productId) {
        const [result] = await db.query(
            'DELETE FROM products WHERE id = ?',
            [productId]
        );
        return result;
    }
}

module.exports = Product;