// backend/controllers/orderController.js
const db = require('../config/db');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
exports.processCheckout = async (req, res, next) => {
    const { cartItems, customerData } = req.body;
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Кошик порожній.' });
    }
    if (!customerData || !customerData.name || !customerData.email) {
        return res.status(400).json({ message: 'Неповні контактні дані.' });
    }

    const isDigitalOnly = cartItems.every(item => item.type === 'digital');
    if (!isDigitalOnly && (!customerData.address || !customerData.address.trim())) {
        return res.status(400).json({ message: 'Адреса доставки обов\'язкова для фізичних товарів.' });
    }

    const siteId = cartItems[0].site_id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [sites] = await connection.query('SELECT liqpay_public_key, liqpay_private_key FROM sites WHERE id = ?', [siteId]);
        if (!sites[0] || !sites[0].liqpay_public_key || !sites[0].liqpay_private_key) {
            return res.status(400).json({ 
                message: 'Вибачте, продавець ще не налаштував прийом платежів на своєму сайті.' 
            });
        }

        const sitePublicKey = sites[0].liqpay_public_key;
        const sitePrivateKey = sites[0].liqpay_private_key;
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                site_id INT NOT NULL,
                customer_name VARCHAR(255),
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                delivery_address TEXT,
                total_amount DECIMAL(10,2),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                product_name VARCHAR(255),
                quantity INT,
                price DECIMAL(10,2),
                type VARCHAR(50) DEFAULT 'physical',
                digital_file_url TEXT,
                options JSON
            )
        `);

        const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        const [orderRes] = await connection.query(
            `INSERT INTO orders (site_id, customer_name, customer_email, customer_phone, delivery_address, total_amount, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [siteId, customerData.name, customerData.email, customerData.phone, isDigitalOnly ? 'Цифрова доставка' : customerData.address, total]
        );
        const orderId = orderRes.insertId;
        for (const item of cartItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, type, digital_file_url, options) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderId, item.id, item.name, item.quantity, item.price, item.type || 'physical', item.digital_file_url || null, JSON.stringify(item.selectedOptions || {})]
            );

            if (item.type !== 'digital') {
                await connection.query(
                    `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?`,
                    [item.quantity, item.id, item.quantity]
                );
            }
        }

        await connection.commit();
        const liqpayParams = {
            public_key: sitePublicKey,
            version: '3',
            action: 'pay',
            amount: total,
            currency: 'UAH',
            description: `Замовлення #${orderId} на суму ${total} UAH`,
            order_id: `${orderId}_${Date.now()}`, 
            server_url: `${BACKEND_URL}/api/orders/liqpay-callback`, 
            result_url: `${FRONTEND_URL}/`, 
        };

        const jsonString = JSON.stringify(liqpayParams);
        const dataStr = Buffer.from(jsonString).toString('base64');
        const signature = crypto.createHash('sha1').update(sitePrivateKey + dataStr + sitePrivateKey).digest('base64');
        res.status(200).json({ data: dataStr, signature });

    } catch (error) {
        await connection.rollback();
        console.error("Помилка при створенні замовлення:", error);
        res.status(500).json({ message: 'Не вдалося створити замовлення. Можливо, товару немає в наявності.' });
    } finally {
        connection.release();
    }
};

exports.liqpayCallback = async (req, res) => {
    const { data, signature } = req.body;
    if (!data || !signature) return res.status(400).send('Missing data or signature');
    try {
        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
        const { order_id: liqpayOrderId, status } = decodedData;
        const realOrderId = liqpayOrderId.split('_')[0];
        const [orders] = await db.query(`SELECT * FROM orders WHERE id = ?`, [realOrderId]);
        const order = orders[0];
        if (!order) return res.status(404).send('Order not found');
        const [sites] = await db.query('SELECT liqpay_private_key FROM sites WHERE id = ?', [order.site_id]);
        if (!sites[0] || !sites[0].liqpay_private_key) {
            return res.status(400).send('Private key missing for site');
        }

        const sitePrivateKey = sites[0].liqpay_private_key;
        const expectedSignature = crypto.createHash('sha1').update(sitePrivateKey + data + sitePrivateKey).digest('base64');
        if (signature !== expectedSignature) {
            console.error('Невірний підпис LiqPay для замовлення', realOrderId);
            return res.status(403).send('Invalid signature');
        }
        if (status === 'success' || status === 'wait_accept') {
            await db.query(`UPDATE orders SET status = 'paid' WHERE id = ?`, [realOrderId]);
            const [items] = await db.query(`SELECT * FROM order_items WHERE order_id = ?`, [realOrderId]);
            const digitalItems = items.filter(item => item.type === 'digital' && item.digital_file_url);
            if (digitalItems.length > 0) {
                await emailService.sendDigitalGoodsEmail(order.customer_email, order.customer_name, digitalItems);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Помилка в LiqPay Webhook:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getSiteOrders = async (req, res) => {
    const { siteId } = req.params;
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE site_id = ? ORDER BY created_at DESC', [siteId]);
        for (let order of orders) {
            const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            order.items = items;
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error("Помилка отримання замовлень:", error);
        res.status(500).json({ message: 'Помилка отримання замовлень' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Статус оновлено' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка оновлення статусу' });
    }
};