// frontend/src/app/guards/ProtectedRoute.jsx
import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../providers/AuthContext';

const ProtectedRoute = ({ 
    requireAdmin = false, 
    requireStrictAdmin = false,
    onlyPublic = false, 
    excludeAdmin = false 
}) => {
    const { user, isAdmin, isModerator, isLoading, logout } = useContext(AuthContext); 
    const outletContext = useOutletContext();
    if (isLoading) {
        return (
            <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: 'var(--platform-text-secondary)' 
            }}>
                Перевірка доступу...
            </div>
        );
    }
    const isAnyAdmin = isAdmin || isModerator;
    if (user && user.status === 'deleted' && !onlyPublic) {
        setTimeout(() => {
            logout();
        }, 0);
        return <Navigate to="/login" replace />;
    }
    if (onlyPublic) {
        if (user && user.status !== 'deleted') {
            return isAnyAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
        }
        return <Outlet context={outletContext} />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireStrictAdmin && !isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (requireAdmin && !isAnyAdmin) {
        return <Navigate to="/login" replace />;
    }

    if (excludeAdmin && isAnyAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet context={outletContext} />;
};

export default ProtectedRoute;