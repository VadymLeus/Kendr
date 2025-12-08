// frontend/src/app/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';

import { ConfirmProvider } from './providers/ConfirmContext';

import Layout from '../common/components/layout/Layout';

import AdminRouteGuard from './guards/AdminRouteGuard';
import PublicOnlyRouteGuard from './guards/PublicOnlyRouteGuard';
import AdminAccessGuard from './guards/AdminAccessGuard';
import AuthenticatedRouteGuard from './guards/AuthenticatedRouteGuard';

import HomePage from '../pages/HomePage';
import RulesPage from '../pages/RulesPage';
import SettingsPage from '../modules/profile/pages/SettingsPage';
import MediaLibraryPage from '../modules/media/pages/MediaLibraryPage';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import CreateSitePage from '../modules/site-dashboard/pages/CreateSitePage';
import SiteDisplayPage from '../modules/site-render/pages/SiteDisplayPage';
import SiteDashboardPage from '../pages/SiteDashboardPage';
import CatalogPage from '../modules/site-render/pages/CatalogPage';
import MySitesPage from '../modules/site-dashboard/pages/MySitesPage';
import ProfilePage from '../modules/profile/pages/ProfilePage';
import CartPage from '../modules/shop/pages/CartPage';
import ProductDetailPage from '../modules/shop/pages/ProductDetailPage';
import NewTicketPage from '../modules/support/pages/NewTicketPage';
import AppealPage from '../modules/support/pages/AppealPage';
import MyTicketsPage from '../modules/support/pages/MyTicketsPage';
import TicketDetailPage from '../modules/support/pages/TicketDetailPage';
import SupportPage from '../modules/support/pages/SupportPage';

import AdminDashboardPage from '../modules/admin/pages/DashboardPage';
import AdminSupportPage from '../modules/admin/pages/AdminSupportPage';
import NotFoundPage from '../common/components/ui/NotFoundPage';

function App() {
    return (
        <HelmetProvider>
            <DndProvider backend={HTML5Backend}>
                <ConfirmProvider>
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
                                <Route path="/admin" element={<AdminDashboardPage />} />
                                <Route path="/admin/support" element={<AdminSupportPage />} />
                            </Route>

                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                    </Routes>

                    <ToastContainer
                        position="bottom-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                    />
                </ConfirmProvider>
            </DndProvider>
        </HelmetProvider>
    );
}

export default App;