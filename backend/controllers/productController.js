// backend/controllers/productController.js
const Product = require('../models/Product');
const Site = require('../models/Site');
const { deleteFile } = require('../utils/fileUtils');

// Отримати товар за його ID
exports.getProductById = async (req, res, next) => {
    const product = await Product.findById(req.params.productId);
    if (!product) {
        return res.status(404).json({ message: 'Товар не знайдено.' });
    }
    res.json(product);
};

// Додати новий товар до сайту
exports.addProduct = async (req, res, next) => {
    const { site_id, name, description, price, category_id } = req.body;
    const userId = req.user.id;
    const image_url = req.file ? req.file.path : null;

    try {
        // Перевірка, чи користувач є власником сайту
        const site = await Site.findByIdAndUserId(site_id, userId);
        if (!site) {
            if (image_url) await deleteFile(image_url); // Видаляємо завантажене зображення, якщо права не підтверджено
            return res.status(403).json({ message: 'У вас немає прав для додавання товарів на цей сайт.' });
        }
        
        const newProduct = await Product.create({ site_id, name, description, price, image_url, category_id });
        res.status(201).json(newProduct);
    } catch (error) {
        if (image_url) await deleteFile(image_url); // Видаляємо зображення у разі іншої помилки
        next(error);
    }
};

// Оновити дані існуючого товару
exports.updateProduct = async (req, res, next) => {
    const { productId } = req.params;
    const { name, description, price, category_id } = req.body;
    const userId = req.user.id;
    let newImagePath = req.file ? req.file.path : null;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            if (newImagePath) await deleteFile(newImagePath);
            return res.status(404).json({ message: 'Товар не знайдено.' });
        }
        
        const oldImageUrl = product.image_url;
        const site = await Site.findByIdAndUserId(product.site_id, userId);
        if (!site) {
            if (newImagePath) await deleteFile(newImagePath);
            return res.status(403).json({ message: 'У вас немає прав для зміни цього товару.' });
        }

        const updateData = { name, description, price, category_id };
        updateData.image_url = newImagePath || product.image_url;

        await Product.update(productId, updateData);
        
        // Якщо було завантажено нове зображення, видаляємо старе
        if (newImagePath && oldImageUrl) {
            await deleteFile(oldImageUrl);
        }

        res.json({ message: 'Товар успішно оновлено.' });
    } catch (error) {
        if (newImagePath) await deleteFile(newImagePath);
        next(error);
    }
};

// Видалити товар
exports.deleteProduct = async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не знайдено.' });
        }

        // Перевірка прав власності перед видаленням
        const site = await Site.findByIdAndUserId(product.site_id, userId);
        if (!site) {
            return res.status(403).json({ message: 'У вас немає прав для видалення товарів на цьому сайті.' });
        }

        const imageUrlToDelete = product.image_url;
        await Product.delete(productId);
        
        // Видаляємо пов'язане зображення, якщо воно існує
        if (imageUrlToDelete) {
            await deleteFile(imageUrlToDelete);
        }
        
        res.json({ message: 'Товар успішно видалено.' });
    } catch (error) {
        next(error);
    }
};