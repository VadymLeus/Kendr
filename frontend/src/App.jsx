// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Імпортуємо Layout'и
import Layout from './components/Layout';
import AdminLayout from './admin/AdminLayout';

// Імпортуємо "Гарди" (Guards)
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
import EditSitePage from './templates/SimpleBio/EditSitePage';
import EditShopPage from './templates/Shop/EditShopPage';
import CatalogPage from './features/sites/CatalogPage';
import MySitesPage from './features/sites/MySitesPage';
import ProfilePage from './features/profile/ProfilePage';
import PublicProfilePage from './features/profile/PublicProfilePage';
import CartPage from './features/cart/CartPage';
import ProductDetailPage from './features/products/ProductDetailPage';
import DashboardPage from './admin/DashboardPage';


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
            {/* Сюди зможуть зайти лише НЕавторизовані користувачі */}
            <Route element={<PublicOnlyRouteGuard />}>
                <Route element={<Layout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Route>

            {/* === ГРУПА МАРШРУТІВ ДЛЯ ЗВИЧАЙНИХ КОРИСТУВАЧІВ ТА ГОСТЕЙ === */}
            {/* Сюди не зможе зайти авторизований адміністратор */}
            <Route element={<UserAreaGuard />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    {/* Усі інші маршрути, крім /login та /register */}
                    <Route path="/create-site" element={<CreateSitePage />} />
                    <Route path="/rules" element={<RulesPage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/my-sites" element={<MySitesPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/user/:username" element={<PublicProfilePage />} />
                    <Route path="/product/:productId" element={<ProductDetailPage />} />
                    <Route path="/site/:site_path" element={<SiteDisplayPage />} />
                    <Route path="/edit-site/:site_path" element={<EditSitePage />} />
                    <Route path="/edit-shop/:site_path" element={<EditShopPage />} />
                </Route>
            </Route>

            {/* Маршрут для обробки всіх інших не знайдених сторінок */}
            <Route path="*" element={<div><h2>404: Сторінку не знайдено</h2></div>} />
        </Routes>
    );
}

export default App;