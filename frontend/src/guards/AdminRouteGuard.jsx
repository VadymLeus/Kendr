// frontend/src/guards/AdminRouteGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';

const AdminRouteGuard = () => {
    const { user, isAdmin, isLoading } = useContext(AuthContext);

    // Поки триває перевірка авторизації, показуємо індикатор завантаження
    if (isLoading) {
        return <div>Перевірка доступу...</div>;
    }

    // Якщо перевірка завершена, і користувач є адміном, показуємо вміст.
    // В іншому випадку — перенаправляємо на сторінку входу.
    return user && isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRouteGuard;