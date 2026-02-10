// frontend/src/app/providers/ConfirmContext.jsx
import React, { createContext, useState, useCallback } from 'react';
import ConfirmModal from '../../shared/ui/complex/ConfirmModal';
export const ConfirmContext = createContext();
export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: 'Підтвердити',
        cancelLabel: 'Скасувати',
        type: 'danger',
        resolve: null
    });
    const confirm = useCallback((options = {}) => {
        const title = typeof options === 'string' ? 'Підтвердження' : (options.title || 'Ви впевнені?');
        const message = typeof options === 'string' ? options : (options.message || '');
        const confirmLabel = options.confirmLabel || 'Підтвердити';
        const cancelLabel = options.cancelLabel || 'Скасувати';
        const type = options.type || 'danger';
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                title,
                message,
                confirmLabel,
                cancelLabel,
                type,
                resolve
            });
        });
    }, []);
    const handleConfirm = () => {
        if (confirmState.resolve) confirmState.resolve(true);
        setConfirmState({ ...confirmState, isOpen: false });
    };
    const handleCancel = () => {
        if (confirmState.resolve) confirmState.resolve(false);
        setConfirmState({ ...confirmState, isOpen: false });
    };
    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal 
                {...confirmState} 
                onConfirm={handleConfirm} 
                onCancel={handleCancel} 
            />
        </ConfirmContext.Provider>
    );
};