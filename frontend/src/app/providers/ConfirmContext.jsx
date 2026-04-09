// frontend/src/app/providers/ConfirmContext.jsx
import React, { createContext, useState, useCallback } from 'react';
import ConfirmModal from '../../shared/ui/complex/ConfirmModal';

export const ConfirmContext = createContext(null);
export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Підтвердити',
        cancelText: 'Скасувати',
        type: 'danger',
        requireInput: false,
        expectedInput: 'DELETE',
        requireReason: false,
        reasonPlaceholder: '',
        onConfirm: () => {},
        onCancel: () => {},
    });
    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                title: options.title || 'Підтвердження',
                message: options.message || 'Ви впевнені?',
                confirmText: options.confirmText || 'Підтвердити',
                cancelText: options.cancelText || 'Скасувати',
                type: options.danger ? 'danger' : (options.type || 'primary'),
                requireInput: options.requireInput || false,
                expectedInput: options.expectedInput || 'DELETE',
                requireReason: options.requireReason || false,
                reasonPlaceholder: options.reasonPlaceholder || 'Введіть причину...',
                onConfirm: (inputValue, reasonValue) => {
                    setConfirmState((prev) => ({ ...prev, isOpen: false }));
                    if (options.onConfirm) options.onConfirm(inputValue, reasonValue);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmState((prev) => ({ ...prev, isOpen: false }));
                    if (options.onCancel) options.onCancel();
                    resolve(false);
                },
            });
        });
    }, []);
    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                confirmLabel={confirmState.confirmText}
                cancelLabel={confirmState.cancelText}
                onConfirm={confirmState.onConfirm}
                onCancel={confirmState.onCancel}
                type={confirmState.type}
                requireInput={confirmState.requireInput}
                expectedInput={confirmState.expectedInput}
                requireReason={confirmState.requireReason}
                reasonPlaceholder={confirmState.reasonPlaceholder}
            />
        </ConfirmContext.Provider>
    );
};