// frontend/src/guards/AuthenticatedRouteGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';

const AuthenticatedRouteGuard = () => {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <div>Перевірка сесії...</div>;
    }

    // Якщо користувач авторизований, дозволяємо доступ.
    // Якщо ні - перенаправляємо на сторінку входу.
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthenticatedRouteGuard;