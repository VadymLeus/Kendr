// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Імпортуємо Layout'и
import Layout from './components/Layout';
import AdminLayout from './admin/AdminLayout';

// Імпортуємо Guards
import AdminRouteGuard from './guards/AdminRouteGuard';
import UserAreaGuard from './guards/UserAreaGuard';
import PublicOnlyRouteGuard from './guards/PublicOnlyRouteGuard';

// Імпортуємо всі сторінки
import HomePage from './pages/HomePage';
import RulesPage from './pages/RulesPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import CreateSitePage from './features/sites/CreateSitePage';
import SiteDisplayPage from './features/sites/SiteDisplayPage';
import SiteDashboardPage from './features/sites/SiteDashboardPage'; // Універсальна панель керування сайтом
import CatalogPage from './features/sites/CatalogPage';
import MySitesPage from './features/sites/MySitesPage';
import ProfilePage from './features/profile/ProfilePage';
import CartPage from './features/cart/CartPage';
import ProductDetailPage from './features/products/ProductDetailPage';
import DashboardPage from './admin/DashboardPage';
import FavoritesPage from './features/favorites/FavoritesPage';
import SettingsPage from './pages/SettingsPage';


function App() {
    return (
        <Routes>
            {/* === ГРУПА МАРШРУТІВ ДЛЯ АДМІНІСТРАТОРА === */}
            <Route element={<AdminRouteGuard />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<DashboardPage />} />
                </Route>
            </Route>

            {/* === ГРУПА ПУБЛІЧНИХ МАРШРУТІВ (LOGIN / REGISTER) === */}
            <Route element={<PublicOnlyRouteGuard />}>
                <Route element={<Layout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Route>

            {/* === ГРУПА МАРШРУТІВ ДЛЯ ЗВИЧАЙНИХ КОРИСТУВАЧІВ ТА ГОСТЕЙ === */}
            <Route element={<UserAreaGuard />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/create-site" element={<CreateSitePage />} />
                    <Route path="/rules" element={<RulesPage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/my-sites" element={<MySitesPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/product/:productId" element={<ProductDetailPage />} />
                    <Route path="/site/:site_path" element={<SiteDisplayPage />} />
                    
                    {/* Уніфікований маршрут для керування сайтом */}
                    <Route path="/dashboard/:site_path" element={<SiteDashboardPage />} />
                </Route>
            </Route>

            {/* Маршрут для обробки всіх інших не знайдених сторінок */}
            <Route path="*" element={<div><h2>404: Сторінку не знайдено</h2></div>} />
        </Routes>
    );
}

export default App;