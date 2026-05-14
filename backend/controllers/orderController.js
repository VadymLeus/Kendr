// backend/controllers/orderController.js
const db = require('../config/db');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const { decrypt } = require('../utils/encryption');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const generateOrderNumber = (size = 12) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let id = '';
    const bytes = crypto.randomBytes(size);
    for (let i = 0; i < size; i++) {
        id += chars[bytes[i] % chars.length];
    }
    return id;
};

const getGlobalSettings = async () => {
    try {
        const [rows] = await db.query('SELECT billing_enabled FROM global_settings LIMIT 1');
        if (rows && rows.length > 0) return rows[0];
    } catch (e) {
        console.warn('Таблиця global_settings не знайдена або порожня.');
    }
    return { billing_enabled: 1 };
};

const generateLiqPayData = (orderId, amount, publicKey, privateKey) => {
    const callbackUrl = process.env.NGROK_URL 
        ? `${process.env.NGROK_URL}/api/orders/liqpay-callback`
        : `${BACKEND_URL}/api/orders/liqpay-callback`;
    const liqpayParams = {
        public_key: publicKey,
        version: '3',
        action: 'pay',
        amount: amount,
        currency: 'UAH',
        description: `Замовлення #${orderId} на суму ${amount} UAH`,
        order_id: `${orderId}_${Date.now()}`,
        server_url: callbackUrl, 
        result_url: `${FRONTEND_URL}/my-orders`,
        sandbox: 1
    };
    const jsonString = JSON.stringify(liqpayParams);
    const dataStr = Buffer.from(jsonString).toString('base64');
    const signature = crypto.createHash('sha1').update(privateKey + dataStr + privateKey).digest('base64');
    return { data: dataStr, signature };
};

exports.processCheckout = async (req, res, next) => {
    const settings = await getGlobalSettings();
    if (!settings.billing_enabled) {
        return res.status(403).json({ message: 'Прийом платежів тимчасово призупинено адміністрацією платформи.' });
    }
    const { siteId, items, customerData, paymentMethod } = req.body;
    const userId = req.user.id;
    const method = paymentMethod === 'cod' ? 'cod' : 'online';
    if (!siteId) return res.status(400).json({ message: 'Не вказано магазин для оформлення.' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'Список товарів порожній.' });
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [sites] = await connection.query('SELECT user_id, liqpay_public_key, liqpay_private_key, is_online_payment_enabled, is_cod_enabled FROM sites WHERE id = ?', [siteId]);
        if (!sites[0]) {
            const error = new Error('Магазин не знайдено.');
            error.status = 404;
            throw error;
        }

        if (String(sites[0].user_id) === String(userId)) {
            const error = new Error('Ви не можете купувати товари у власному магазині.');
            error.status = 403;
            throw error;
        }

        const [collaborators] = await connection.query('SELECT site_id FROM site_collaborators WHERE site_id = ? AND user_id = ?', [siteId, userId]);
        if (collaborators.length > 0) {
            const error = new Error('Співавтори не можуть оформлювати замовлення на цьому сайті.');
            error.status = 403;
            throw error;
        }

        if (method === 'online' && !sites[0].is_online_payment_enabled) {
            const error = new Error('Продавець тимчасово не приймає онлайн оплату.');
            error.status = 400;
            throw error;
        }
        if (method === 'cod' && !sites[0].is_cod_enabled) {
            const error = new Error('Продавець не відправляє товари післяплатою.');
            error.status = 400;
            throw error;
        }
        const [users] = await connection.query('SELECT username, email FROM users WHERE id = ?', [userId]);
        if (!users[0]) throw new Error('Користувача не знайдено');
        const realUserEmail = users[0].email;
        const deliveryName = (customerData && customerData.name) ? customerData.name : users[0].username;
        const deliveryPhone = (customerData && customerData.phone) ? customerData.phone : '';
        let spamQuery = `SELECT COUNT(*) as count FROM orders WHERE site_id = ? AND status = 'pending' AND (customer_id = ? OR customer_email = ?`;
        let spamParams = [siteId, userId, realUserEmail];
        if (deliveryPhone && deliveryPhone.trim() !== '') {
            spamQuery += ` OR customer_phone = ?`;
            spamParams.push(deliveryPhone);
        }
        spamQuery += `)`;
        const [pendingOrders] = await connection.query(spamQuery, spamParams);
        if (pendingOrders[0].count >= 5) {
            const error = new Error('Ви досягли ліміту неоплачених замовлень (5). Будь ласка, оплатіть або скасуйте попередні замовлення перед створенням нових.');
            error.status = 429;
            throw error;
        }
        let sitePublicKey = null;
        let sitePrivateKey = null;
        if (method === 'online') {
            if (sites[0].liqpay_public_key && sites[0].liqpay_private_key) {
                sitePublicKey = sites[0].liqpay_public_key;
                sitePrivateKey = decrypt(sites[0].liqpay_private_key);
                if (!sitePrivateKey) {
                    const error = new Error('Помилка дешифрування ключа оплати.');
                    error.status = 500;
                    throw error;
                }
            }
        }
        let total = 0;
        let isDigitalOnly = true;
        const validatedItems = [];
        for (const reqItem of items) {
            const [dbProducts] = await connection.query(
                'SELECT id, name, price, type, digital_file_url, stock_quantity FROM products WHERE id = ? AND site_id = ? AND is_available = 1',
                [reqItem.id, siteId]
            );
            const product = dbProducts[0];
            if (!product) throw new Error(`Деякі товари недоступні або не належать цьому магазину.`);
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
        if (isDigitalOnly && method === 'cod') {
            throw new Error('Цифрові товари не можна замовити післяплатою.');
        }
        const orderId = generateOrderNumber();
        await connection.query(
            `INSERT INTO orders (id, site_id, customer_id, customer_name, customer_email, customer_phone, delivery_address, total_amount, status, payment_method) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [orderId, siteId, userId, deliveryName, realUserEmail, deliveryPhone, isDigitalOnly ? 'Цифрова доставка' : customerData.address, total, method]
        );
        for (const item of validatedItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, type, digital_file_url, options) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderId, item.id, item.name, item.quantity, item.price, item.type || 'physical', item.digital_file_url || null, JSON.stringify(item.options)]
            );
        }
        await connection.commit();
        if (method === 'online') {
            if (sitePublicKey && sitePrivateKey) {
                const paymentData = generateLiqPayData(orderId, total, sitePublicKey, sitePrivateKey);
                res.status(200).json({ 
                    liqpayData: paymentData.data, 
                    liqpaySignature: paymentData.signature, 
                    orderId, 
                    paymentMethod: method 
                });
            } else {
                res.status(200).json({ orderId, paymentMethod: method });
            }
        } else {
            res.status(200).json({ orderId, paymentMethod: method });
        }
    } catch (error) {
        await connection.rollback();
        const status = error.status || 400;
        if (status >= 500 || !error.status) {
            console.error("Критична помилка при створенні замовлення:", error);
        }
        res.status(status).json({ message: error.message || 'Не вдалося створити замовлення. Можливо, товару немає в наявності.' });
    } finally {
        connection.release();
    }
};

exports.generatePaymentForOrder = async (req, res) => {
    const settings = await getGlobalSettings();
    if (!settings.billing_enabled) {
        return res.status(403).json({ message: 'Прийом платежів тимчасово призупинено адміністрацією платформи.' });
    }
    const orderId = req.params.id;
    const userId = req.user.id;
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [orderId, userId]);
        if (!orders[0]) return res.status(404).json({ message: 'Замовлення не знайдено' });
        const order = orders[0];
        const [sites] = await db.query('SELECT user_id, liqpay_public_key, liqpay_private_key, is_online_payment_enabled FROM sites WHERE id = ?', [order.site_id]);
        if (sites[0] && String(sites[0].user_id) === String(userId)) {
            return res.status(403).json({ message: 'Ви не можете оплачувати власні товари.' });
        }
        const [collaborators] = await db.query('SELECT site_id FROM site_collaborators WHERE site_id = ? AND user_id = ?', [order.site_id, userId]);
        if (collaborators.length > 0) {
            return res.status(403).json({ message: 'Співавтори не можуть оплачувати товари на цьому сайті.' });
        }
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Це замовлення вже оплачено або скасовано.' });
        }
        if (order.payment_method === 'cod') {
            return res.status(400).json({ message: 'Це замовлення оформлено з оплатою при отриманні. Онлайн оплата недоступна.' });
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
        if (!sites[0] || !sites[0].is_online_payment_enabled) {
            return res.status(400).json({ message: 'Магазин тимчасово не може приймати онлайн оплату.' });
        }
        if (!sites[0].liqpay_public_key || !sites[0].liqpay_private_key) {
            return res.status(200).json({ orderId: order.id, amount: order.total_amount });
        }
        const sitePrivateKey = decrypt(sites[0].liqpay_private_key);
        if (!sitePrivateKey) return res.status(500).json({ message: 'Помилка конфігурації ключів оплати продавця.' });
        const paymentData = generateLiqPayData(order.id, order.total_amount, sites[0].liqpay_public_key, sitePrivateKey);
        res.status(200).json({
            liqpayData: paymentData.data,
            liqpaySignature: paymentData.signature
        });
    } catch (error) {
        console.error("Помилка генерації оплати:", error);
        res.status(500).json({ message: 'Помилка сервера при створенні оплати.' });
    }
};

exports.liqpayCallback = async (req, res) => {
    const { data, signature } = req.body;
    if (!data || !signature) {
        return res.status(400).send('Missing data or signature');
    }
    try {
        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
        const { order_id: liqpayOrderId, status } = decodedData;
        const realOrderId = liqpayOrderId.split('_')[0];
        const [orders] = await db.query(`SELECT * FROM orders WHERE id = ?`, [realOrderId]);
        const order = orders[0];
        if (!order) {
            return res.status(404).send('Order not found');
        }
        const [sites] = await db.query('SELECT liqpay_private_key, site_theme_accent FROM sites WHERE id = ?', [order.site_id]);
        if (!sites[0] || !sites[0].liqpay_private_key) {
            return res.status(400).send('Private key missing for site');
        }
        const sitePrivateKey = decrypt(sites[0].liqpay_private_key);
        if (!sitePrivateKey) return res.status(500).send('Private key decryption failed');
        const siteAccentColor = sites[0].site_theme_accent || 'blue';
        const expectedSignature = crypto.createHash('sha1').update(sitePrivateKey + data + sitePrivateKey).digest('base64');
        if (signature !== expectedSignature) {
            return res.status(403).send('Invalid signature');
        }
        if (status === 'success' || status === 'wait_accept' || status === 'sandbox') {
            if (order.status === 'pending') {
                const [items] = await db.query(`SELECT * FROM order_items WHERE order_id = ?`, [realOrderId]);
                const isDigitalOnly = items.length > 0 && items.every(item => item.type === 'digital');
                const newStatus = isDigitalOnly ? 'completed' : 'paid';
                await db.query(`UPDATE orders SET status = ? WHERE id = ?`, [newStatus, realOrderId]);
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

exports.processGooglePay = async (req, res) => {
    const { orderId } = req.params;
    const { paymentData } = req.body;
    const userId = req.user.id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Замовлення не знайдено' });
        }

        const order = orders[0];
        if (String(order.customer_id) !== String(userId)) {
            await connection.rollback();
            return res.status(403).json({ message: 'Доступ заборонено' });
        }
        if (order.status === 'paid' || order.status === 'completed') {
            await connection.rollback();
            return res.status(400).json({ message: 'Замовлення вже оплачено' });
        }
        const [items] = await connection.query(`SELECT * FROM order_items WHERE order_id = ?`, [orderId]);
        const isDigitalOnly = items.length > 0 && items.every(item => item.type === 'digital');
        const newStatus = isDigitalOnly ? 'completed' : 'paid';
        await connection.query(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [newStatus, orderId]
        );
        for (const item of items) {
            if (item.type !== 'digital' && item.product_id) {
                await connection.query(
                    `UPDATE products SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE id = ? AND stock_quantity IS NOT NULL`,
                    [item.quantity, item.product_id]
                );
            }
        }
        const [sites] = await connection.query('SELECT user_id, site_theme_accent FROM sites WHERE id = ?', [order.site_id]);
        const siteOwnerId = sites[0].user_id;
        const siteAccentColor = sites[0].site_theme_accent || 'blue';
        const digitalItems = items.filter(item => item.type === 'digital' && item.digital_file_url);
        if (digitalItems.length > 0) {
            await emailService.sendDigitalGoodsEmail(order.customer_email, order.customer_name, digitalItems, siteAccentColor);
        }
        const providerId = paymentData?.paymentMethodData?.tokenizationData?.token 
            ? 'gpay_' + paymentData.paymentMethodData.tokenizationData.token.substring(0, 20) 
            : 'gpay_test_' + Date.now();
        await connection.query(
            `INSERT INTO transactions (id, user_id, amount, currency, status, provider_id, description) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                crypto.randomUUID(), 
                siteOwnerId, 
                order.total_amount, 
                'UAH', 
                'success', 
                providerId, 
                `Оплата замовлення #${orderId} через Google Pay`
            ]
        );
        await connection.commit();
        res.json({ success: true, message: 'Оплату успішно проведено' });

    } catch (error) {
        await connection.rollback();
        console.error('Помилка обробки Google Pay:', error);
        res.status(500).json({ message: 'Помилка на сервері при обробці платежу' });
    } finally {
        connection.release();
    }
};

exports.getSiteOrders = async (req, res) => {
    const { siteId } = req.params;
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE site_id = ? ORDER BY created_at DESC', [siteId]);
        for (let order of orders) {
            const [items] = await db.query(`
                SELECT oi.*, p.image_gallery 
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
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
            const [items] = await db.query(`
                SELECT oi.*, p.image_gallery 
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
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