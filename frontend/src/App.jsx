// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Layout from './components/Layout';
import AdminRouteGuard from './guards/AdminRouteGuard';
import PublicOnlyRouteGuard from './guards/PublicOnlyRouteGuard';
import AdminAccessGuard from './guards/AdminAccessGuard';
import AuthenticatedRouteGuard from './guards/AuthenticatedRouteGuard';

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
import AppealPage from './features/support/AppealPage';
import MyTicketsPage from './features/support/MyTicketsPage';
import TicketDetailPage from './features/support/TicketDetailPage';
import AdminSupportPage from './admin/AdminSupportPage';
import MediaLibraryPage from './pages/MediaLibraryPage';

function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <Routes>
                <Route element={<Layout />}>
                    <Route element={<PublicOnlyRouteGuard />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>

                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    
                    <Route path="/site/:site_path" element={<SiteDisplayPage />} />
                    <Route path="/site/:site_path/:slug" element={<SiteDisplayPage />} />

                    <Route path="/product/:productId" element={<ProductDetailPage />} />
                    <Route path="/rules" element={<RulesPage />} />

                    <Route element={<AuthenticatedRouteGuard />}>
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/support/ticket/:ticketId" element={<TicketDetailPage />} />
                    </Route>

                    <Route element={<AdminAccessGuard />}>
                        <Route path="/my-sites" element={<MySitesPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/create-site" element={<CreateSitePage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/dashboard/:site_path" element={<SiteDashboardPage />} />
                        <Route path="/media-library" element={<MediaLibraryPage />} />
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/support/new-ticket" element={<NewTicketPage />} />
                        <Route path="/support/appeal" element={<AppealPage />} />
                        <Route path="/support/my-tickets" element={<MyTicketsPage />} />
                    </Route>

                    <Route element={<AdminRouteGuard />}>
                        <Route path="/admin" element={<DashboardPage />} />
                        <Route path="/admin/support" element={<AdminSupportPage />} />
                    </Route>

                    <Route path="*" element={<div><h2>404: Сторінку не знайдено</h2></div>} />
                </Route>
            </Routes>
        </DndProvider>
    );
}

export default App;