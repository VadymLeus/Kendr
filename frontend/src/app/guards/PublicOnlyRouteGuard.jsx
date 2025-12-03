// frontend/src/app/guards/PublicOnlyRouteGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../providers/AuthContext';

const PublicOnlyRouteGuard = () => {
    const { user, isAdmin, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <div>Завантаження...</div>;
    }

    if (!user) {
        return <Outlet />;
    }

    return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
};

export default PublicOnlyRouteGuard;