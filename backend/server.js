// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Імпортуємо сервіс для роботи з шаблонами
const TemplateService = require('./utils/templateService');

const authRoutes = require('./routes/authRoutes');
const siteRoutes = require('./routes/siteRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');
const tagRoutes = require('./routes/tagRoutes'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Проміжне ПЗ (Middleware)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршрути (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tags', tagRoutes);

app.get('/', (req, res) => {
    res.send('Ласкаво просимо до GreenKendr API!');
});

app.listen(PORT, async () => {
    // Запускаємо синхронізацію шаблонів під час старту сервера
    await TemplateService.syncWithDB();
    console.log(`Сервер запущено на порті ${PORT}`);
});