// frontend/src/shared/ui/complex/ConfirmModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../elements/Button';
import { AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    title, 
    message, 
    confirmLabel = 'Підтвердити',
    cancelLabel = 'Скасувати',
    onConfirm, 
    onCancel, 
    type = 'danger' 
}) => {
    const overlayRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) onCancel();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onCancel]);

    if (!isVisible && !isOpen) return null;
    const getTypeConfig = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <AlertCircle size={24} />,
                    iconColor: 'var(--platform-danger)',
                    iconBg: 'rgba(229, 62, 62, 0.1)',
                    confirmVariant: 'danger',
                    confirmStyle: {} 
                };
            case 'success':
                return {
                    icon: <CheckCircle size={24} />,
                    iconColor: 'var(--platform-success)',
                    iconBg: 'rgba(56, 161, 105, 0.1)',
                    confirmVariant: 'primary',
                    confirmStyle: { backgroundColor: 'var(--platform-success)', borderColor: 'var(--platform-success)', color: '#fff' }
                };
            case 'warning':
                return {
                    icon: <AlertCircle size={24} />,
                    iconColor: 'var(--platform-warning)',
                    iconBg: 'rgba(221, 107, 32, 0.1)',
                    confirmVariant: 'warning',
                    confirmStyle: { 
                        backgroundColor: 'var(--platform-warning)', 
                        borderColor: 'var(--platform-warning)', 
                        color: '#fff' 
                    }
                };
            default:
                return {
                    icon: <HelpCircle size={24} />,
                    iconColor: 'var(--platform-accent)',
                    iconBg: 'rgba(66, 153, 225, 0.1)',
                    confirmVariant: 'primary',
                    confirmStyle: {}
                };
        }
    };

    const config = getTypeConfig();

    return (
        <div 
            ref={overlayRef} 
            className={`
                fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-200
                ${isOpen ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={(e) => e.target === overlayRef.current && onCancel()}
        >
            <div 
                className={`
                    bg-(--platform-card-bg) text-(--platform-text-primary) border border-(--platform-border-color) rounded-2xl w-[90%] max-w-105 shadow-2xl overflow-hidden flex flex-col transition-all duration-200
                    ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2.5 opacity-0'}
                `}
            >
                <div className="p-6 flex-1">
                    <div className="flex gap-4 items-start">
                        <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: config.iconBg, color: config.iconColor }}
                        >
                            {config.icon}
                        </div>
                        
                        <div className="pt-0.5 flex flex-col gap-1.5">
                            <h3 className="text-lg font-semibold m-0 text-(--platform-text-primary) leading-tight">{title}</h3>
                            <p className="m-0 text-[0.95rem] leading-relaxed text-(--platform-text-secondary)">{message}</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 flex justify-end items-center gap-3 bg-(--platform-bg) border-t border-(--platform-border-color)">
                    <Button 
                        variant="outline" 
                        onClick={onCancel}
                        className="min-w-22.5"
                    >
                        {cancelLabel}
                    </Button>
                    <Button 
                        variant={config.confirmVariant} 
                        onClick={onConfirm} 
                        autoFocus
                        className="min-w-22.5 shadow-sm text-white"
                        style={config.confirmStyle}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;