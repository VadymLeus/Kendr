// backend/controllers/adminController.js
const Site = require('../models/Site');
const User = require('../models/User');

exports.getAllSites = async (req, res, next) => {
    try {
        const allSites = await Site.getPublic();
        res.json(allSites);
    } catch (error) {
        next(error);
    }
};

exports.deleteSiteByAdmin = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        
        const site = await Site.findByPath(site_path);

        if (!site) {
            return res.status(404).json({ message: 'Сайт з такою адресою не знайдено.' });
        }

        await Site.delete(site.id);
        
        if (site.logo_url && !site.logo_url.includes('/default/')) {
            const { deleteFile } = require('../utils/fileUtils');
            await deleteFile(site.logo_url);
        }

        res.json({ message: `Сайт "${site.title}" було успішно видалено адміністратором.` });
    } catch (error) {
        next(error);
    }
};

exports.updateSiteStatus = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        const { status } = req.body;

        if (!['published', 'draft', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Недійсний статус.' });
        }

        const site = await Site.findByPath(site_path);
        if (!site) {
            return res.status(404).json({ message: 'Сайт не знайдено.' });
        }

        let deletionDate = null;
        if (status === 'suspended') {
            const date = new Date();
            date.setDate(date.getDate() + 3);
            deletionDate = date;
        }

        await Site.updateStatus(site.id, status, deletionDate);

        res.json({ message: `Статус сайту "${site.title}" оновлено.` });
    } catch (error) {
        next(error);
    }
};
