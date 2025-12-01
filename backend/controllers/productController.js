// backend/controllers/productController.js
const Product = require('../models/Product');
const Site = require('../models/Site');
const { deleteFile } = require('../utils/fileUtils');

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
    const { site_id, name, description, price, category_id, stock_quantity, image_gallery, variants, sale_percentage } = req.body;
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

        const newProduct = await Product.create({ 
            site_id, 
            name, 
            description, 
            price, 
            image_path: galleryData.length > 0 ? galleryData[0] : null,
            category_id, 
            stock_quantity,
            variants,
            sale_percentage,
            image_gallery: JSON.stringify(galleryData)
        });
        
        res.status(201).json(newProduct);
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    const { productId } = req.params;
    const { name, description, price, category_id, stock_quantity, image_gallery, variants, sale_percentage } = req.body;
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

        const updateData = { name, description, price, category_id, stock_quantity, variants, sale_percentage };

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