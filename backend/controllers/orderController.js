// backend/controllers/orderController.js
const db = require('../db');

exports.processCheckout = async (req, res, next) => {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Кошик порожній.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        for (const item of cartItems) {
            // Зменшуємо кількість товару на складі
            await connection.query(
                `UPDATE products 
                 SET stock_quantity = stock_quantity - ? 
                 WHERE id = ? AND stock_quantity >= ?`,
                [item.quantity, item.id, item.quantity]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Замовлення успішно оброблено!' });

    } catch (error) {
        await connection.rollback();
        console.error("Помилка при обробці замовлення:", error);
        next(new Error('Не вдалося обробити замовлення.'));
    } finally {
        connection.release();
    }
};
