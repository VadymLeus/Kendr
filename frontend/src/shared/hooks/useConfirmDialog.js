// frontend/src/shared/hooks/useConfirmDialog.js
import { useState, useCallback } from 'react';

export const useConfirmDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        confirmLabel: 'Підтвердити',
        cancelLabel: 'Скасувати',
        type: 'danger',
        onConfirm: () => {}
    });

    const requestConfirm = useCallback(({ title, message, confirmLabel, type = 'danger', onConfirm }) => {
        setConfig({
            title,
            message,
            confirmLabel: confirmLabel || 'Підтвердити',
            cancelLabel: 'Скасувати',
            type,
            onConfirm: async () => {
                if (onConfirm) await onConfirm();
                setIsOpen(false);
            }
        });
        setIsOpen(true);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    return {
        isOpen,
        config,
        requestConfirm,
        close
    };
};