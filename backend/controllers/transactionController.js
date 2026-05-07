// backend/controllers/transactionController.js
const db = require('../config/db');
const crypto = require('crypto');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PLATFORM_LIQPAY_PUBLIC = process.env.LIQPAY_PUBLIC_KEY;
const PLATFORM_LIQPAY_PRIVATE = process.env.LIQPAY_PRIVATE_KEY;
const generatePlatformLiqPayData = (transactionId, amount, description) => {
    const callbackUrl = process.env.NGROK_URL 
        ? `${process.env.NGROK_URL}/api/transactions/liqpay-callback`
        : `${BACKEND_URL}/api/transactions/liqpay-callback`;
    const liqpayParams = {
        public_key: PLATFORM_LIQPAY_PUBLIC,
        version: '3',
        action: 'pay',
        amount: amount,
        currency: 'UAH',
        description: description,
        order_id: transactionId,
        server_url: callbackUrl, 
        result_url: `${FRONTEND_URL}/settings`,
        sandbox: 1
    };
    const jsonString = JSON.stringify(liqpayParams);
    const dataStr = Buffer.from(jsonString).toString('base64');
    const signature = crypto.createHash('sha1').update(PLATFORM_LIQPAY_PRIVATE + dataStr + PLATFORM_LIQPAY_PRIVATE).digest('base64');
    return { data: dataStr, signature };
};

exports.processUpgrade = async (req, res) => {
    const userId = req.user.id;
    const amount = 299.00;
    const description = `Оплата довічного тарифу Kendr PLUS для користувача #${userId}`;
    const transactionId = crypto.randomUUID();
    if (!PLATFORM_LIQPAY_PUBLIC || !PLATFORM_LIQPAY_PRIVATE) {
        return res.status(500).json({ message: "Ключі LiqPay платформи не налаштовані в системі." });
    }

    try {
        const [users] = await db.query('SELECT plan FROM users WHERE id = ?', [userId]);
        if (users[0] && users[0].plan === 'PLUS') {
            return res.status(400).json({ message: 'У вас вже активовано тариф PLUS.' });
        }
        await db.query(
            `INSERT INTO transactions (id, user_id, amount, currency, status, description) VALUES (?, ?, ?, 'UAH', 'pending', ?)`,
            [transactionId, userId, amount, description]
        );
        const paymentData = generatePlatformLiqPayData(transactionId, amount, description);
        res.status(200).json(paymentData);
    } catch (error) {
        console.error('Помилка при генерації оплати тарифу:', error);
        res.status(500).json({ message: 'Помилка сервера при створенні транзакції.' });
    }
};

exports.liqpayWebhook = async (req, res) => {
    const { data, signature } = req.body;
    if (!data || !signature) {
        return res.status(400).send('Missing data or signature');
    }
    try {
        const expectedSignature = crypto.createHash('sha1').update(PLATFORM_LIQPAY_PRIVATE + data + PLATFORM_LIQPAY_PRIVATE).digest('base64');
        if (signature !== expectedSignature) {
            return res.status(403).send('Invalid signature');
        }

        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
        const { order_id: transactionId, status, payment_id } = decodedData;
        if (status === 'success' || status === 'sandbox' || status === 'wait_accept') {
            const [txs] = await db.query(`SELECT * FROM transactions WHERE id = ?`, [transactionId]);
            const transaction = txs[0];
            if (transaction && transaction.status === 'pending') {
                await db.query(`UPDATE transactions SET status = 'success', provider_id = ? WHERE id = ?`, [payment_id, transactionId]);
                await db.query(`UPDATE users SET plan = 'PLUS' WHERE id = ?`, [transaction.user_id]);
                console.log(`[Billing] Користувач ${transaction.user_id} успішно оплатив тариф PLUS.`);
            }
        }
        res.status(200).send('OK');
    } catch (error) {
        console.error('Помилка в LiqPay Webhook (Transactions):', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAdminTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;
        const queryParams = [];
        let baseQuery = `
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE 1=1
        `;
        if (status && status !== 'all') {
            baseQuery += ` AND t.status = ?`;
            queryParams.push(status);
        }
        if (search) {
            baseQuery += ` AND (u.email LIKE ? OR t.id LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }
        if (startDate) {
            baseQuery += ` AND t.created_at >= ?`;
            queryParams.push(startDate + " 00:00:00");
        }
        if (endDate) {
            baseQuery += ` AND t.created_at <= ?`;
            queryParams.push(endDate + " 23:59:59");
        }
        const [countResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, queryParams);
        const total = countResult[0].total;
        const dataQuery = `
            SELECT 
                t.id, t.amount, t.currency, t.status, t.description, t.created_at, t.provider_id,
                u.id as user_id, u.email as user_email, u.username as user_name, u.slug as user_slug, u.avatar_url as user_avatar
            ${baseQuery}
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const dataParams = [...queryParams, parseInt(limit), parseInt(offset)];
        const [transactions] = await db.query(dataQuery, dataParams);
        let summaryQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN t.status = 'success' THEN t.amount ELSE 0 END), 0) AS totalEarned,
                COUNT(CASE WHEN t.status = 'success' AND t.created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01') THEN 1 END) AS successfulThisMonth,
                COUNT(CASE WHEN t.status = 'pending' THEN 1 END) AS pendingCount
            ${baseQuery}
        `;
        const [summaryResult] = await db.query(summaryQuery, queryParams);
        const summary = {
            totalEarned: Number(summaryResult[0].totalEarned).toFixed(2),
            successfulThisMonth: summaryResult[0].successfulThisMonth,
            pendingCount: summaryResult[0].pendingCount
        };
        res.json({
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            },
            summary
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Помилка сервера при завантаженні транзакцій' });
    }
};

exports.getAdminOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;
        const queryParams = [];
        let baseQuery = `
            FROM orders o
            JOIN sites s ON o.site_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE 1=1
        `;
        if (status && status !== 'all') {
            baseQuery += ` AND o.status = ?`;
            queryParams.push(status);
        }
        if (search) {
            baseQuery += ` AND (o.id LIKE ? OR o.customer_email LIKE ? OR s.title LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (startDate) {
            baseQuery += ` AND o.created_at >= ?`;
            queryParams.push(startDate + " 00:00:00");
        }
        if (endDate) {
            baseQuery += ` AND o.created_at <= ?`;
            queryParams.push(endDate + " 23:59:59");
        }
        const [countResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, queryParams);
        const total = countResult[0].total;
        const dataQuery = `
            SELECT 
                o.id, o.total_amount as amount, 'UAH' as currency, o.status, 
                o.created_at, o.customer_email, o.customer_name, o.customer_phone,
                s.title as site_title, s.site_path, s.logo_url as site_logo,
                u.id as owner_id, u.email as owner_email, u.username as owner_name, u.slug as owner_slug, u.avatar_url as owner_avatar,
                (SELECT GROUP_CONCAT(product_name SEPARATOR ', ') FROM order_items WHERE order_id = o.id) as products
            ${baseQuery}
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const dataParams = [...queryParams, parseInt(limit), parseInt(offset)];
        const [orders] = await db.query(dataQuery, dataParams);
        const summaryQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN o.status IN ('paid', 'shipped', 'completed') THEN o.total_amount ELSE 0 END), 0) AS totalVolume,
                COUNT(CASE WHEN o.status IN ('paid', 'shipped', 'completed') AND o.created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01') THEN 1 END) AS successfulThisMonth,
                COUNT(*) AS totalOrders
            ${baseQuery}
        `;
        const [summaryResult] = await db.query(summaryQuery, queryParams);
        res.json({
            orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            },
            summary: {
                totalEarned: Number(summaryResult[0].totalVolume).toFixed(2),
                successfulThisMonth: summaryResult[0].successfulThisMonth,
                pendingCount: summaryResult[0].totalOrders
            }
        });

    } catch (error) {
        console.error('Error fetching admin orders:', error);
        res.status(500).json({ message: 'Помилка сервера при завантаженні замовлень' });
    }
};