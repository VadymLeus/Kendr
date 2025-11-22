// frontend/src/hooks/useConfirm.js
import { useContext } from 'react';
import { ConfirmContext } from '../providers/ConfirmContext';

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};