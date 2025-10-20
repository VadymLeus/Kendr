// frontend/src/guards/AdminAccessGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';

const AdminAccessGuard = () => {
    const { isAdmin, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <div>Перевірка доступу...</div>;
    }

    // Якщо користувач є адміністратором, перенаправляємо його на головну сторінку адмін-панелі.
    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    // Якщо це звичайний користувач або гість, дозволяємо доступ.
    return <Outlet />;
};

export default AdminAccessGuard;