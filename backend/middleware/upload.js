// backend/middleware/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fixEncodingFilter = (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, true);
};
const mediaStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const FONT_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2'];
        const isFont = FONT_EXTENSIONS.includes(ext) || file.mimetype.includes('font');
        let resource_type = 'image';
        let format = 'webp';
        if (file.mimetype.startsWith('video/')) {
            resource_type = 'video';
            format = undefined; 
        } else if (isFont || !file.mimetype.startsWith('image/')) {
            resource_type = 'raw';
            format = undefined;
        }
        return {
            folder: 'kendr/media',
            resource_type: resource_type,
            format: format,
            allowed_formats: isFont || resource_type !== 'image' ? undefined : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            transformation: resource_type === 'image' ? [{ quality: 'auto', fetch_format: 'auto' }] : []
        };
    }
});

const mediaUpload = multer({
    storage: mediaStorage,
    fileFilter: fixEncodingFilter,
    limits: { fileSize: 1024 * 1024 * 16, files: 10 }
});

const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'kendr/general',
        format: async (req, file) => 'webp',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
    }
});

const upload = multer({
    storage: imageStorage,
    fileFilter: fixEncodingFilter,
    limits: { fileSize: 1024 * 1024 * 15 }
});

const ticketStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'kendr/tickets',
        format: async (req, file) => 'webp',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1920, crop: 'limit', quality: '85' }]
    }
});

const ticketUpload = multer({
    storage: ticketStorage,
    fileFilter: fixEncodingFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});
const processAndSaveImage = (subfolder, filenamePrefix, size = 128) => {
    return (req, res, next) => next();
};
const processAndSaveLogo = (size = 64) => {
    return (req, res, next) => next();
};
const processAndSaveGeneric = (subfolder, filenamePrefix, maxWidth = 1200) => {
    return (req, res, next) => next();
};
const processAndSaveTicketImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        req.attachmentUrls = [];
        return next();
    }
    req.attachmentUrls = req.files.map(file => file.path);
    next();
};
module.exports = {
    upload,
    processAndSaveImage,
    processAndSaveLogo,
    processAndSaveGeneric,
    mediaUpload,
    ticketUpload,
    processAndSaveTicketImages
};