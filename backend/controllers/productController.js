// backend/controllers/productController.js
const Product = require('../models/Product');
const Site = require('../models/Site');
const { deleteFile } = require('../utils/fileUtils');

const safeParseGallery = (galleryData) => {
    if (!galleryData) return [];
    if (Array.isArray(galleryData)) return galleryData;
    if (typeof galleryData === 'string') {
        try {
            const parsed = JSON.parse(galleryData);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            if (galleryData.startsWith('/')) return [galleryData];
            return [];
        }
    }
    return [];
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

exports.addProduct = async (req, res, next) => {
    const { site_id, name, description, price, category_id, stock_quantity } = req.body;
    const userId = req.user.id;
    const image_path = req.file ? req.file.path : null; 
    
    try {
        const site = await Site.findByIdAndUserId(site_id, userId);
        if (!site) {
            if (image_path) await deleteFile(image_path); 
            return res.status(403).json({ message: 'У вас немає прав для додавання товарів на цей сайт.' });
        }
        
        const newProduct = await Product.create({ 
            site_id, name, description, price, image_path, category_id, stock_quantity 
        });
        
        res.status(201).json(newProduct);
    } catch (error) {
        if (image_path) await deleteFile(image_path); 
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    const { productId } = req.params;
    const { name, description, price, category_id, stock_quantity } = req.body;
    const userId = req.user.id;
    const newImagePath = req.file ? req.file.path : null;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            if (newImagePath) await deleteFile(newImagePath);
            return res.status(404).json({ message: 'Товар не знайдено.' });
        }

        const site = await Site.findByIdAndUserId(product.site_id, userId);
        if (!site) {
            if (newImagePath) await deleteFile(newImagePath);
            return res.status(403).json({ message: 'У вас немає прав для зміни цього товару.' });
        }

        const updateData = { name, description, price, category_id, stock_quantity };

        const oldImageGallery = product.image_gallery;
        let oldImagePath = (oldImageGallery.length > 0) ? oldImageGallery[0] : null;

        if (newImagePath) {
            updateData.image_gallery = JSON.stringify([newImagePath]);
        } else {
            oldImagePath = null;
        }

        await Product.update(productId, updateData);
        
        if (newImagePath && oldImagePath) {
            await deleteFile(oldImagePath);
        }

        res.json({ message: 'Товар успішно оновлено.' });
    } catch (error) {
        if (newImagePath) await deleteFile(newImagePath);
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
        
        const imageGallery = product.image_gallery;
        await Product.delete(productId);

        if (imageGallery.length > 0) {
            for (const imagePath of imageGallery) {
                await deleteFile(imagePath);
            }
        }
        
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

        const currentGallery = product.image_gallery;
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

        const currentGallery = product.image_gallery;
        const updatedGallery = currentGallery.filter(img => img !== imagePath);
        
        await Product.update(productId, { 
            image_gallery: JSON.stringify(updatedGallery) 
        });
        await deleteFile(imagePath);

        res.json({ 
            message: 'Зображення видалено з галереї.',
            image_gallery: updatedGallery 
        });
    } catch (error) {
        next(error);
    }
};