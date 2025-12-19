// backend/controllers/mediaController.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/db');
const { deleteFile } = require('../utils/fileUtils');

exports.getAll = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { search, type, sort, favorite, extension } = req.query;
        let query = 'SELECT * FROM user_media WHERE user_id = ?';
        const params = [userId];

        if (search) {
            query += ' AND (display_name LIKE ? OR original_file_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (type && type !== 'all') {
            query += " AND file_type = ?";
            params.push(type);
        }

        if (extension && extension !== 'all') {
            query += " AND original_file_name LIKE ?";
            params.push(`%.${extension}`);
        }

        if (favorite === 'true') {
            query += ' AND is_favorite = 1';
        }

        let orderBy = 'ORDER BY is_favorite DESC, created_at DESC';
        if (sort === 'oldest') orderBy = 'ORDER BY is_favorite DESC, created_at ASC';
        if (sort === 'az') orderBy = 'ORDER BY is_favorite DESC, display_name ASC';
        if (sort === 'size_desc') orderBy = 'ORDER BY is_favorite DESC, file_size_kb DESC';

        query += ` ${orderBy}`;

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

exports.upload = async (req, res, next) => {
    if (!req.file) return res.status(400).json({ message: 'Файл не завантажено.' });

    const tempPath = req.file.path;
    const userId = req.user.id;
    const originalName = req.file.originalname; 
    const mimeType = req.file.mimetype;
    
    const ext = path.extname(originalName).toLowerCase();
    const displayName = originalName.replace(ext, '');

    try {
        let fileType = 'document';
        const FONT_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2'];
        
        if (mimeType.startsWith('image/')) fileType = 'image';
        else if (mimeType.startsWith('video/')) fileType = 'video';
        else if (FONT_EXTENSIONS.includes(ext) || mimeType.includes('font')) fileType = 'font';
        
        const baseFileName = `user-${userId}-${Date.now()}`;
        let finalFileName = `${baseFileName}${ext}`;
        let finalPath = path.join(__dirname, '..', 'uploads', 'media', finalFileName);
        let publicPath = `/uploads/media/${finalFileName}`;
        let thumbPath = null;
        let width = null;
        let height = null;

        if (fileType === 'image') {
            const metadata = await sharp(tempPath).metadata();
            width = metadata.width;
            height = metadata.height;

            if (width > 1920) {
                finalFileName = `${baseFileName}.webp`;
                finalPath = path.join(__dirname, '..', 'uploads', 'media', finalFileName);
                publicPath = `/uploads/media/${finalFileName}`;
                
                await sharp(tempPath)
                    .resize({ width: 1920, fit: 'inside' })
                    .webp({ quality: 80 })
                    .toFile(finalPath);
                
                const thumbName = `${baseFileName}-thumb.webp`;
                const thumbDiskPath = path.join(__dirname, '..', 'uploads', 'media', thumbName);
                await sharp(tempPath)
                    .resize(300, 300, { fit: 'cover' })
                    .webp({ quality: 70 })
                    .toFile(thumbDiskPath);
                
                thumbPath = `/uploads/media/${thumbName}`;
                await fs.unlink(tempPath); 
            } else {
                await fs.rename(tempPath, finalPath);
            }
        } else {
            await fs.rename(tempPath, finalPath);
        }

        const stats = await fs.stat(finalPath);
        const fileSizeKb = Math.round(stats.size / 1024);

        const [result] = await db.query(
            `INSERT INTO user_media 
            (user_id, path_full, path_thumb, original_file_name, display_name, mime_type, file_size_kb, file_type, width, height) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, publicPath, thumbPath, originalName, displayName, mimeType, fileSizeKb, fileType, width, height]
        );

        const [newMedia] = await db.query('SELECT * FROM user_media WHERE id = ?', [result.insertId]);
        res.status(201).json(newMedia[0]);

    } catch (error) {
        try { await fs.unlink(tempPath); } catch (e) {} 
        console.error('Upload Error:', error);
        next(error);
    }
};

exports.updateMedia = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { display_name, alt_text, description, is_favorite } = req.body;

        const [check] = await db.query('SELECT id FROM user_media WHERE id = ? AND user_id = ?', [id, userId]);
        if (check.length === 0) return res.status(404).json({ message: 'Файл не знайдено' });

        const updates = [];
        const params = [];

        if (display_name !== undefined) { updates.push('display_name = ?'); params.push(display_name); }
        if (alt_text !== undefined) { updates.push('alt_text = ?'); params.push(alt_text); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (is_favorite !== undefined) { updates.push('is_favorite = ?'); params.push(is_favorite ? 1 : 0); }

        if (updates.length > 0) {
            const query = `UPDATE user_media SET ${updates.join(', ')} WHERE id = ?`;
            params.push(id);
            await db.query(query, params);
        }

        const [updated] = await db.query('SELECT * FROM user_media WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (error) {
        next(error);
    }
};

exports.deleteMedia = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [media] = await db.query('SELECT * FROM user_media WHERE id = ? AND user_id = ?', [id, userId]);
        if (media.length === 0) return res.status(404).json({ message: 'Файл не знайдено' });

        const file = media[0];

        await deleteFile(file.path_full);
        if (file.path_thumb) await deleteFile(file.path_thumb);

        await db.query('DELETE FROM user_media WHERE id = ?', [id]);

        res.json({ message: 'Файл успішно видалено', id });
    } catch (error) {
        next(error);
    }
};