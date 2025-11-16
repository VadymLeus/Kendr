// frontend/src/guards/AuthenticatedRouteGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../providers/AuthContext';

const AuthenticatedRouteGuard = () => {
    const { user, isLoading } = useContext(AuthContext);
    const outletContext = useOutletContext();

    if (isLoading) {
        return (
            <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                color: 'var(--platform-text-secondary)'
            }}>
                Перевірка сесії...
            </div>
        );
    }

    return user ? <Outlet context={outletContext} /> : <Navigate to="/login" replace />;
};

export default AuthenticatedRouteGuard;