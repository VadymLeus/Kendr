// frontend/src/guards/AdminRouteGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../providers/AuthContext';

const AdminRouteGuard = () => {
    const { user, isAdmin, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <div>Перевірка доступу...</div>;
    }

    return user && isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRouteGuard;