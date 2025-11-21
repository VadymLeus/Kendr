// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const siteRoutes = require('./routes/siteRoutes');
const pageRoutes = require('./routes/pageRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tagRoutes = require('./routes/tagRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const supportRoutes = require('./routes/supportRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const formRoutes = require('./routes/formRoutes');
const publicFormRoutes = require('./routes/publicFormRoutes');
const savedBlockRoutes = require('./routes/savedBlockRoutes');
const errorHandler = require('./middleware/errorHandler');
const verifyToken = require('./middleware/verifyToken');
const userTemplateRoutes = require('./routes/userTemplateRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршрути API
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/form', verifyToken, formRoutes);
app.use('/api/public/form', publicFormRoutes);
app.use('/api/saved-blocks', savedBlockRoutes);
app.use('/api/templates/personal', userTemplateRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Kendr API!');
});

app.use(errorHandler);
app.listen(PORT, async () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});