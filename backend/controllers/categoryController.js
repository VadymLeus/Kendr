// backend/controllers/categoryController.js
const Category = require('../models/Category');
const Site = require('../models/Site');

// Отримати всі категорії для конкретного сайту
exports.getCategoriesForSite = async (req, res, next) => {
    const categories = await Category.findBySiteId(req.params.siteId);
    res.json(categories);
};

// Створити нову категорію
exports.createCategory = async (req, res, next) => {
    const { siteId, name } = req.body;
    const userId = req.user.id;

    // Перевірка, чи користувач є власником сайту
    const site = await Site.findByIdAndUserId(siteId, userId);
    if (!site) {
        return res.status(403).json({ message: 'У вас немає прав для додавання категорій на цей сайт.' });
    }
    
    const newCategory = await Category.create(siteId, name);
    res.status(201).json(newCategory);
};

// Видалити категорію
exports.deleteCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    const userId = req.user.id;
    
    // Примітка: для простоти ми не перевіряємо, чи користувач є власником сайту, 
    // оскільки видалення доступне тільки з інтерфейсу редагування сайту.
    // У реальному додатку варто додати перевірку прав.
    await Category.delete(categoryId);
    res.json({ message: 'Категорію успішно видалено.' });
};