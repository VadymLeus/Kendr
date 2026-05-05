// backend/controllers/productController.js
const Product = require('../models/Product');
const Site = require('../models/Site');
const { deleteFile } = require('../utils/fileUtils');
const db = require('../config/db');
const parseDecimal = (value) => {
    if (value === '' || value === undefined || value === null) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

const parseIntNullable = (value) => {
    if (value === '' || value === undefined || value === null) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
};

exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не знайдено.' });
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
};

exports.getProductsForSite = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const products = await Product.findBySiteId(siteId);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const { ids, category, limit, siteId } = req.query;
        let idList = null;
        if (ids) {
            idList = ids.split(',').filter(id => id.trim() !== '');
        }
        const products = await Product.findWithFilters({
            ids: idList,
            categoryId: category,
            limit: limit,
            siteId: siteId
        });
        res.json(products);
    } catch (error) {
        next(error);
    }
};

exports.addProduct = async (req, res, next) => {
    const { site_id, name, description, price, category_ids, stock_quantity, image_gallery, variants, sale_percentage, type, digital_file_url } = req.body;
    const userId = req.user.id;
    try {
        const site = await Site.findByIdAndUserId(site_id, userId);
        if (!site) {
            return res.status(403).json({ message: 'У вас немає прав для додавання товарів на цей сайт.' });
        }
        let galleryData = [];
        if (Array.isArray(image_gallery)) {
            galleryData = image_gallery;
        } else if (typeof image_gallery === 'string') {
            galleryData = [image_gallery];
        }
        let catIds = [];
        if (category_ids) {
            catIds = Array.isArray(category_ids) ? category_ids : [category_ids];
        }
        const cleanPrice = parseDecimal(price);
        const cleanSale = parseDecimal(sale_percentage);
        const cleanStock = parseIntNullable(stock_quantity);
        const newProduct = await Product.create({ 
            site_id, 
            name, 
            description, 
            price: cleanPrice, 
            image_path: galleryData.length > 0 ? galleryData[0] : null,
            category_ids: catIds, 
            stock_quantity: cleanStock,
            variants,
            sale_percentage: cleanSale,
            image_gallery: JSON.stringify(galleryData),
            type,
            digital_file_url
        });
        res.status(201).json(newProduct);
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    const { productId } = req.params;
    const { name, description, price, category_ids, stock_quantity, image_gallery, variants, sale_percentage, type, digital_file_url } = req.body;
    const userId = req.user.id;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не знайдено.' });
        }
        const site = await Site.findByIdAndUserId(product.site_id, userId);
        if (!site) {
            return res.status(403).json({ message: 'У вас немає прав для зміни цього товару.' });
        }
        let catIds = product.categories?.map(c => c.id) || [];
        if (category_ids !== undefined) {
            catIds = Array.isArray(category_ids) ? category_ids : [category_ids];
        }
        const cleanPrice = parseDecimal(price);
        const cleanSale = parseDecimal(sale_percentage);
        const cleanStock = parseIntNullable(stock_quantity);
        const updateData = { 
            name, 
            description, 
            price: cleanPrice, 
            category_ids: catIds, 
            stock_quantity: cleanStock, 
            variants, 
            sale_percentage: cleanSale,
            type,
            digital_file_url
        };
        if (image_gallery !== undefined) {
            updateData.image_gallery = JSON.stringify(Array.isArray(image_gallery) ? image_gallery : [image_gallery]);
        }
        await Product.update(productId, updateData);
        res.json({ message: 'Товар успішно оновлено.' });
    } catch (error) {
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user.id;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не знайдено.' });
        }
        const site = await Site.findByIdAndUserId(product.site_id, userId);
        if (!site) {
            return res.status(403).json({ message: 'У вас немає прав для видалення товарів на цьому сайті.' });
        }
        await Product.delete(productId);
        res.json({ message: 'Товар успішно видалено.' });
    } catch (error) {
        next(error);
    }
};

exports.addToGallery = async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user.id;
    const newImagePath = req.file ? req.file.path : null;
    try {
        if (!newImagePath) return res.status(400).json({ message: 'Файл не завантажено.' });
        const product = await Product.findById(productId);
        if (!product) {
            await deleteFile(newImagePath);
            return res.status(404).json({ message: 'Товар не знайдено.' });
        }
        const site = await Site.findByIdAndUserId(product.site_id, userId);
        if (!site) {
            await deleteFile(newImagePath);
            return res.status(403).json({ message: 'У вас немає прав для зміни цього товару.' });
        }
        const currentGallery = product.image_gallery || [];
        const updatedGallery = [...currentGallery, newImagePath];
        await Product.update(productId, { 
            image_gallery: JSON.stringify(updatedGallery) 
        });
        res.json({ 
            message: 'Зображення додано до галереї.',
            image_gallery: updatedGallery 
        });
    } catch (error) {
        if (newImagePath) await deleteFile(newImagePath);
        next(error);
    }
};

exports.removeFromGallery = async (req, res, next) => {
    const { productId } = req.params;
    const { imagePath } = req.body;
    const userId = req.user.id;
    try {
        if (!imagePath) return res.status(400).json({ message: 'Шлях до зображення не вказано.' });
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Товар не знайдено.' });
        const site = await Site.findByIdAndUserId(product.site_id, userId);
        if (!site) return res.status(403).json({ message: 'У вас немає прав для зміни цього товару.' });
        const currentGallery = product.image_gallery || [];
        const updatedGallery = currentGallery.filter(img => img !== imagePath);
        await Product.update(productId, { 
            image_gallery: JSON.stringify(updatedGallery) 
        });
        res.json({ 
            message: 'Зображення видалено з галереї.',
            image_gallery: updatedGallery 
        });
    } catch (error) {
        next(error);
    }
};

exports.getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Product.getReviews(req.params.productId);
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

exports.addProductReview = async (req, res, next) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    try {
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Рейтинг має бути від 1 до 5.' });
        }
        if (!comment || comment.trim() === '') {
            return res.status(400).json({ message: 'Коментар не може бути порожнім.' });
        }
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Товар не знайдено.' });
        const [orders] = await db.query(`
            SELECT o.id 
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_id = ? AND oi.product_id = ? AND o.status IN ('paid', 'shipped', 'completed')
            LIMIT 1
        `, [userId, productId]);

        if (orders.length === 0) {
            return res.status(403).json({ message: 'Ви можете залишити відгук лише на товар, який ви придбали.' });
        }
        await Product.addReview(productId, userId, rating, comment);
        res.status(201).json({ message: 'Відгук успішно додано.' });
    } catch (error) {
        next(error);
    }
};

exports.replyToReview = async (req, res, next) => {
    const { productId, reviewId } = req.params;
    const { owner_reply } = req.body;
    const userId = req.user.id;
    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Товар не знайдено.' });
        const site = await Site.findByIdAndUserId(product.site_id, userId);
        if (!site) return res.status(403).json({ message: 'Тільки власник магазину може відповідати на відгуки.' });
        await Product.updateReviewReply(reviewId, owner_reply || null);
        res.json({ message: 'Відповідь збережено.' });
    } catch (error) {
        next(error);
    }
};

exports.deleteReview = async (req, res, next) => {
    const { productId, reviewId } = req.params;
    const userId = req.user.id;
    try {
        const [reviews] = await db.query('SELECT user_id FROM product_reviews WHERE id = ?', [reviewId]);
        if (reviews.length === 0) return res.status(404).json({ message: 'Відгук не знайдено.' });
        const reviewAuthorId = reviews[0].user_id;
        const isAuthor = reviewAuthorId === userId;
        const isPlatformStaff = req.user.role === 'admin' || req.user.role === 'moderator';
        let isSiteOwner = false;
        if (!isAuthor && !isPlatformStaff) {
             const product = await Product.findById(productId);
             if (product) {
                 const site = await Site.findByIdAndUserId(product.site_id, userId);
                 if (site) isSiteOwner = true;
             }
        }
        if (!isAuthor && !isSiteOwner && !isPlatformStaff) {
            return res.status(403).json({ message: 'У вас немає прав для видалення цього відгуку.' });
        }
        await Product.deleteReview(reviewId);
        res.json({ message: 'Відгук видалено.' });
    } catch (error) {
        next(error);
    }
};

exports.checkPurchaseStatus = async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user.id;
    try {
        const existingReview = await Product.getReviewByUser(productId, userId);
        const [orders] = await db.query(`
            SELECT o.id 
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_id = ? AND oi.product_id = ? AND o.status IN ('paid', 'shipped', 'completed')
            LIMIT 1
        `, [userId, productId]);
        const hasPurchased = orders.length > 0;
        res.json({ 
            hasPurchased, 
            hasReviewed: !!existingReview,
            existingReview: existingReview || null
        });
    } catch (error) {
        next(error);
    }
};