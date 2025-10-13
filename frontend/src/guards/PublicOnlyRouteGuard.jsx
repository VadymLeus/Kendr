// frontend/src/guards/PublicOnlyRouteGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';

const PublicOnlyRouteGuard = () => {
    const { user, isAdmin, isLoading } = useContext(AuthContext);

    // Показуємо заглушку, поки триває перевірка
    if (isLoading) {
        return <div>Завантаження...</div>;
    }

    // Якщо користувач не авторизований, показуємо сторінку (наприклад, /login)
    if (!user) {
        return <Outlet />;
    }

    // Якщо користувач авторизований, перенаправляємо його:
    // Адміна — в /admin, звичайного користувача — на головну
    return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
};

export default PublicOnlyRouteGuard;