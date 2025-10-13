// backend/controllers/adminController.js
const Site = require('../models/Site');
const User = require('../models/User');

// Отримання списку всіх сайтів для адмін-панелі
exports.getAllSites = async (req, res, next) => {
    try {
        // Можна трохи змінити Site.getPublic або створити новий метод,
        // але для простоти поки що отримаємо всі сайти, поєднавши їх з даними автора.
        const allSites = await Site.getPublic(); // Метод getPublic поверне всі публічні сайти
        res.json(allSites);
    } catch (error) {
        next(error);
    }
};

// Видалення сайту адміністратором
exports.deleteSiteByAdmin = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        
        // На відміну від видалення користувачем, адміністратору не потрібно підтверджувати володіння.
        // Знаходимо сайт за його шляхом, щоб отримати ID та дані для видалення файлу логотипа
        const site = await Site.findByPath(site_path);

        if (!site) {
            return res.status(404).json({ message: 'Сайт з такою адресою не знайдено.' });
        }

        // Видаляємо сайт за його ID
        await Site.delete(site.id);
        
        // Видаляємо файл логотипа, якщо він не є стандартним
        if (site.logo_url && !site.logo_url.includes('/default/')) {
            const { deleteFile } = require('../utils/fileUtils');
            await deleteFile(site.logo_url);
        }

        res.json({ message: `Сайт "${site.title}" було успішно видалено адміністратором.` });
    } catch (error) {
        next(error);
    }
};