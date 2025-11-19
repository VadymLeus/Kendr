// backend/controllers/savedBlockController.js
const SavedBlock = require('../models/SavedBlock');

exports.saveBlock = async (req, res, next) => {
    try {
        const { name, type, content } = req.body;
        if (!name || !content) {
            return res.status(400).json({ message: 'Назва та вміст блоку обов\'язкові.' });
        }

        const id = await SavedBlock.create(req.user.id, name, type, content);
        res.status(201).json({ message: 'Блок збережено в бібліотеку.', id });
    } catch (error) {
        next(error);
    }
};

exports.getSavedBlocks = async (req, res, next) => {
    try {
        const blocks = await SavedBlock.findAllForUser(req.user.id);
        res.json(blocks);
    } catch (error) {
        next(error);
    }
};

exports.updateSavedBlock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, content } = req.body;
        
        if (!name && !content) {
            return res.status(400).json({ message: 'Потрібно вказати назву або вміст для оновлення.' });
        }

        const success = await SavedBlock.update(id, req.user.id, { name, content });
        if (!success) {
            return res.status(404).json({ message: 'Блок не знайдено.' });
        }
        
        res.json({ message: 'Блок оновлено.' });
    } catch (error) {
        next(error);
    }
};

exports.deleteSavedBlock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const success = await SavedBlock.delete(id, req.user.id);
        if (!success) {
            return res.status(404).json({ message: 'Блок не знайдено.' });
        }
        res.json({ message: 'Блок видалено.' });
    } catch (error) {
        next(error);
    }
};