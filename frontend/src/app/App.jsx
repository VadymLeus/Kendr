// frontend/src/app/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ConfirmProvider } from './providers/ConfirmContext';
import ProtectedRoute from './guards/ProtectedRoute';
import Layout from '../shared/ui/layouts/Layout';
import HomePage from '../pages/HomePage';
import RulesPage from '../pages/RulesPage';
import NotFoundPage from '../pages/NotFoundPage';
import AuthPage from '../modules/auth/AuthPage';
import AuthSuccessPage from '../modules/auth/AuthSuccessPage';
import VerifyEmailPage from '../modules/auth/VerifyEmailPage';
import ResetPasswordPage from '../modules/auth/ResetPasswordPage';
import ProfilePage from '../modules/profile/pages/ProfilePage';
import SettingsPage from '../modules/profile/pages/SettingsPage';
import SiteDashboardPage from '../modules/dashboard/pages/SiteDashboardPage';
import CreateSitePage from '../modules/dashboard/pages/CreateSitePage';
import MySitesPage from '../modules/dashboard/pages/MySitesPage';
import MediaLibraryPage from '../modules/media/pages/MediaLibraryPage';
import CatalogPage from '../modules/renderer/pages/CatalogPage';
import SiteDisplayPage from '../modules/renderer/pages/SiteDisplayPage';
import CartPage from '../modules/shop/CartPage';
import ProductDetailPage from '../modules/shop/ProductDetailPage';
import SupportPage from '../modules/support/pages/SupportPage';
import NewTicketPage from '../modules/support/pages/NewTicketPage';
import AppealPage from '../modules/support/pages/AppealPage';
import MyTicketsPage from '../modules/support/pages/MyTicketsPage';
import TicketDetailPage from '../modules/support/pages/TicketDetailPage';
import AdminDashboardPage from '../modules/admin/pages/AdminDashboardPage';
import AdminReportsPage from '../modules/admin/pages/AdminReportsPage';
import AdminUsersPage from '../modules/admin/pages/AdminUsersPage';
import AdminSitesPage from '../modules/admin/pages/AdminSitesPage';
import AdminTicketsPage from '../modules/admin/pages/AdminTicketsPage';
import AdminTemplatesPage from '../modules/admin/pages/AdminTemplatesPage';

function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <ConfirmProvider>
                <Routes>
                    <Route element={<Layout />}>
                        <Route element={<ProtectedRoute onlyPublic={true} />}>
                            <Route path="/login" element={<AuthPage />} />
                            <Route path="/register" element={<AuthPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                        </Route>

                        <Route path="/" element={<HomePage />} />
                        <Route path="/catalog" element={<CatalogPage />} />
                        <Route path="/profile/:username" element={<ProfilePage />} />
                        <Route path="/site/:site_path/product/:productId" element={<ProductDetailPage />} />
                        <Route path="/site/:site_path" element={<SiteDisplayPage />} />
                        <Route path="/site/:site_path/:slug" element={<SiteDisplayPage />} />
                        <Route path="/rules" element={<RulesPage />} />
                        <Route path="/auth/success" element={<AuthSuccessPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                        <Route element={<ProtectedRoute />}>
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/support/ticket/:ticketId" element={<TicketDetailPage />} />
                            <Route path="/dashboard/:site_path" element={<SiteDashboardPage />} />
                            <Route path="/my-sites" element={<MySitesPage />} />
                            <Route path="/create-site" element={<CreateSitePage />} />
                            <Route path="/media-library" element={<MediaLibraryPage />} />
                        </Route>

                        <Route element={<ProtectedRoute excludeAdmin={true} />}>
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/support" element={<SupportPage />} />
                            <Route path="/support/new-ticket" element={<NewTicketPage />} />
                            <Route path="/support/appeal" element={<AppealPage />} />
                            <Route path="/support/my-tickets" element={<MyTicketsPage />} />
                        </Route>
                        
                        <Route element={<ProtectedRoute requireAdmin={true} />}>
                            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                            <Route path="/admin/reports" element={<AdminReportsPage />} />
                            <Route path="/admin/users" element={<AdminUsersPage />} />
                            <Route path="/admin/sites" element={<AdminSitesPage />} />
                            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
                            <Route path="/admin/templates" element={<AdminTemplatesPage />} />
                            <Route path="/admin/support" element={<Navigate to="/admin/tickets" replace />} />
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
    );
}

export default App;