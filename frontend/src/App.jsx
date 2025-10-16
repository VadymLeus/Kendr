// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import AdminLayout from './admin/AdminLayout';

import AdminRouteGuard from './guards/AdminRouteGuard';
import UserAreaGuard from './guards/UserAreaGuard';
import PublicOnlyRouteGuard from './guards/PublicOnlyRouteGuard';

import HomePage from './pages/HomePage';
import RulesPage from './pages/RulesPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import CreateSitePage from './features/sites/CreateSitePage';
import SiteDisplayPage from './features/sites/SiteDisplayPage';
import SiteDashboardPage from './features/sites/SiteDashboardPage';
import CatalogPage from './features/sites/CatalogPage';
import MySitesPage from './features/sites/MySitesPage';
import ProfilePage from './features/profile/ProfilePage';
import CartPage from './features/cart/CartPage';
import ProductDetailPage from './features/products/ProductDetailPage';
import DashboardPage from './admin/DashboardPage';
import FavoritesPage from './features/favorites/FavoritesPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import NewTicketPage from './features/support/NewTicketPage';
import MyTicketsPage from './features/support/MyTicketsPage';
import TicketDetailPage from './features/support/TicketDetailPage';
import AdminSupportPage from './admin/AdminSupportPage';

function App() {
    return (
        <Routes>
            <Route element={<AdminRouteGuard />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<DashboardPage />} />
                    <Route path="/admin/support" element={<AdminSupportPage />} />
                </Route>
            </Route>

            <Route element={<PublicOnlyRouteGuard />}>
                <Route element={<Layout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Route>

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
                    <Route path="/dashboard/:site_path" element={<SiteDashboardPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/support/new-ticket" element={<NewTicketPage />} />
                    <Route path="/support/my-tickets" element={<MyTicketsPage />} />
                    <Route path="/support/ticket/:ticketId" element={<TicketDetailPage />} />
                </Route>
            </Route>

            <Route path="*" element={<div><h2>404: Сторінку не знайдено</h2></div>} />
        </Routes>
    );
}

export default App;