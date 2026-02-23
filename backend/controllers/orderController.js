// backend/controllers/orderController.js
const db = require('../config/db');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const generateLiqPayData = (orderId, amount, publicKey, privateKey) => {
    const liqpayParams = {
        public_key: publicKey,
        version: '3',
        action: 'pay',
        amount: amount,
        currency: 'UAH',
        description: `Замовлення #${orderId} на суму ${amount} UAH`,
        order_id: `${orderId}_${Date.now()}`,
        // server_url: `${BACKEND_URL}/api/orders/liqpay-callback`,
        server_url: `https://townless-cruciferous-hildegarde.ngrok-free.dev/api/orders/liqpay-callback`,
        result_url: `${FRONTEND_URL}/my-orders`,
    };
    const jsonString = JSON.stringify(liqpayParams);
    const dataStr = Buffer.from(jsonString).toString('base64');
    const signature = crypto.createHash('sha1').update(privateKey + dataStr + privateKey).digest('base64');
    return { data: dataStr, signature };
};

exports.processCheckout = async (req, res, next) => {
    const { siteId, items, customerData } = req.body;
    const userId = req.user.id;
    if (!siteId) {
        return res.status(400).json({ message: 'Не вказано магазин для оформлення.' });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Список товарів порожній.' });
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [users] = await connection.query('SELECT username, email FROM users WHERE id = ?', [userId]);
        if (!users[0]) throw new Error('Користувача не знайдено');
        const realUserEmail = users[0].email;
        const deliveryName = (customerData && customerData.name) ? customerData.name : users[0].username;
        const deliveryPhone = (customerData && customerData.phone) ? customerData.phone : '';
        const [sites] = await connection.query('SELECT liqpay_public_key, liqpay_private_key FROM sites WHERE id = ?', [siteId]);
        if (!sites[0] || !sites[0].liqpay_public_key || !sites[0].liqpay_private_key) {
            return res.status(400).json({ 
                message: 'Вибачте, продавець ще не налаштував прийом платежів на своєму сайті.' 
            });
        }
        const sitePublicKey = sites[0].liqpay_public_key;
        const sitePrivateKey = sites[0].liqpay_private_key;
        let total = 0;
        let isDigitalOnly = true;
        const validatedItems = [];
        for (const reqItem of items) {
            const [dbProducts] = await connection.query(
                'SELECT id, name, price, type, digital_file_url, stock_quantity FROM products WHERE id = ? AND site_id = ? AND is_available = 1',
                [reqItem.id, siteId]
            );
            const product = dbProducts[0];
            if (!product) {
                throw new Error(`Деякі товари недоступні або не належать цьому магазину.`);
            }
            if (product.type !== 'digital' && product.stock_quantity !== null) {
                if (reqItem.quantity > product.stock_quantity) {
                    throw new Error(`Недостатньо товару "${product.name}" на складі.`);
                }
                isDigitalOnly = false;
            } else if (product.type !== 'digital') {
                 isDigitalOnly = false;
            }
            total += parseFloat(product.price) * reqItem.quantity;
            validatedItems.push({
                ...product,
                quantity: reqItem.quantity,
                options: reqItem.options || {}
            });
        }

        if (!isDigitalOnly && (!customerData || !customerData.address || !customerData.address.trim())) {
            throw new Error('Адреса доставки обов\'язкова для фізичних товарів.');
        }

        const [orderRes] = await connection.query(
            `INSERT INTO orders (site_id, customer_id, customer_name, customer_email, customer_phone, delivery_address, total_amount, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [siteId, userId, deliveryName, realUserEmail, deliveryPhone, isDigitalOnly ? 'Цифрова доставка' : customerData.address, total]
        );
        
        const orderId = orderRes.insertId;
        for (const item of validatedItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, type, digital_file_url, options) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderId, item.id, item.name, item.quantity, item.price, item.type || 'physical', item.digital_file_url || null, JSON.stringify(item.options)]
            );
        }
        await connection.commit();
        const paymentData = generateLiqPayData(orderId, total, sitePublicKey, sitePrivateKey);
        res.status(200).json(paymentData);
    } catch (error) {
        await connection.rollback();
        console.error("Помилка при створенні замовлення:", error);
        res.status(400).json({ message: error.message || 'Не вдалося створити замовлення. Можливо, товару немає в наявності.' });
    } finally {
        connection.release();
    }
};

exports.generatePaymentForOrder = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id;
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [orderId, userId]);
        if (!orders[0]) return res.status(404).json({ message: 'Замовлення не знайдено' });
        const order = orders[0];
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Це замовлення вже оплачено або скасовано.' });
        }
        const [items] = await db.query('SELECT product_id, quantity, type FROM order_items WHERE order_id = ?', [orderId]);
        for (const item of items) {
            if (item.type !== 'digital') {
                const [product] = await db.query('SELECT stock_quantity, name FROM products WHERE id = ?', [item.product_id]);
                if (product[0] && product[0].stock_quantity !== null && product[0].stock_quantity < item.quantity) {
                     return res.status(400).json({ message: `Недостатньо товару "${product[0].name}" на складі.` });
                }
            }
        }

        const [sites] = await db.query('SELECT liqpay_public_key, liqpay_private_key FROM sites WHERE id = ?', [order.site_id]);
        if (!sites[0] || !sites[0].liqpay_public_key || !sites[0].liqpay_private_key) {
            return res.status(400).json({ message: 'Магазин тимчасово не може приймати оплату.' });
        }
        const paymentData = generateLiqPayData(order.id, order.total_amount, sites[0].liqpay_public_key, sites[0].liqpay_private_key);
        res.status(200).json(paymentData);
    } catch (error) {
        console.error("Помилка генерації оплати:", error);
        res.status(500).json({ message: 'Помилка сервера при створенні оплати.' });
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
        const [sites] = await db.query('SELECT liqpay_private_key, site_theme_accent FROM sites WHERE id = ?', [order.site_id]);
        if (!sites[0] || !sites[0].liqpay_private_key) {
            return res.status(400).send('Private key missing for site');
        }
        const sitePrivateKey = sites[0].liqpay_private_key;
        const siteAccentColor = sites[0].site_theme_accent || 'blue';
        const expectedSignature = crypto.createHash('sha1').update(sitePrivateKey + data + sitePrivateKey).digest('base64');
        if (signature !== expectedSignature) {
            console.error('Невірний підпис LiqPay для замовлення', realOrderId);
            return res.status(403).send('Invalid signature');
        }
        
        if (status === 'success' || status === 'wait_accept') {
            if (order.status === 'pending') {
                await db.query(`UPDATE orders SET status = 'paid' WHERE id = ?`, [realOrderId]);
                const [items] = await db.query(`SELECT * FROM order_items WHERE order_id = ?`, [realOrderId]);
                for (const item of items) {
                    if (item.type !== 'digital' && item.product_id) {
                        await db.query(
                            `UPDATE products SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE id = ? AND stock_quantity IS NOT NULL`,
                            [item.quantity, item.product_id]
                        );
                    }
                }

                const digitalItems = items.filter(item => item.type === 'digital' && item.digital_file_url);
                if (digitalItems.length > 0) {
                    await emailService.sendDigitalGoodsEmail(order.customer_email, order.customer_name, digitalItems, siteAccentColor);
                }
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

exports.getMyOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', [userId]);
        for (let order of orders) {
            const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            if (order.status !== 'paid' && order.status !== 'completed') {
                items.forEach(item => { item.digital_file_url = null; });
            }
            order.items = items;
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error("Помилка отримання моїх замовлень:", error);
        res.status(500).json({ message: 'Помилка отримання замовлень' });
    }
};