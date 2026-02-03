// frontend/src/app/guards/ProtectedRoute
import React, { useContext } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../providers/AuthContext';

const ProtectedRoute = ({ 
    requireAdmin = false, 
    onlyPublic = false, 
    excludeAdmin = false 
}) => {
    const { user, isAdmin, isLoading } = useContext(AuthContext);
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

    if (onlyPublic) {
        if (user) {
            return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
        }
        return <Outlet context={outletContext} />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    if (excludeAdmin && isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet context={outletContext} />;
};

export default ProtectedRoute;