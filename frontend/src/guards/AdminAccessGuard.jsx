// frontend/src/guards/AdminAccessGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';

const AdminAccessGuard = () => {
    const { isAdmin, isLoading } = useContext(AuthContext);
    const outletContext = useOutletContext();

    if (isLoading) {
        return <div>Перевірка доступу...</div>;
    }

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }
    return <Outlet context={outletContext} />;
};

export default AdminAccessGuard;