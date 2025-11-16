// frontend/src/guards/AdminAccessGuard.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../providers/AuthContext';

const AdminAccessGuard = () => {
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

    if (!user) return <Navigate to="/login" replace />;

    if (isAdmin) return <Navigate to="/admin" replace />;

    return <Outlet context={outletContext} />;
};

export default AdminAccessGuard;