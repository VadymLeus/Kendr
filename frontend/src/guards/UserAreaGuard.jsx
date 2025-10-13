// frontend/src/guards/UserAreaGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';

const UserAreaGuard = () => {
    const { isAdmin, isLoading } = useContext(AuthContext);

    // Поки триває перевірка, показуємо індикатор завантаження
    if (isLoading) {
        return <div>Завантаження...</div>;
    }
    
    // Якщо користувач — адмін, перенаправляємо його в адмін-панель.
    // Звичайні користувачі та гості побачать вміст.
    return isAdmin ? <Navigate to="/admin" replace /> : <Outlet />;
};

export default UserAreaGuard;