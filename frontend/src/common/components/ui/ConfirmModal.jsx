// frontend/src/common/components/ui/ConfirmModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { IconAlertCircle, IconHelpCircle, IconCheckCircle } from './Icons';

const ConfirmModal = ({ 
    isOpen, 
    title, 
    message, 
    confirmLabel, 
    cancelLabel, 
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
                    icon: <IconAlertCircle size={24} />,
                    iconColor: 'var(--platform-danger)',
                    iconBg: 'rgba(229, 62, 62, 0.1)',
                    confirmVariant: 'danger'
                };
            case 'success':
                return {
                    icon: <IconCheckCircle size={24} />,
                    iconColor: 'var(--platform-success)',
                    iconBg: 'rgba(56, 161, 105, 0.1)',
                    confirmVariant: 'primary'
                };
            case 'warning':
                return {
                    icon: <IconAlertCircle size={24} />,
                    iconColor: 'var(--platform-warning)',
                    iconBg: 'rgba(221, 107, 32, 0.1)',
                    confirmVariant: 'warning'
                };
            default: 
                return {
                    icon: <IconHelpCircle size={24} />,
                    iconColor: 'var(--platform-accent)',
                    iconBg: 'rgba(66, 153, 225, 0.1)',
                    confirmVariant: 'primary'
                };
        }
    };

    const config = getTypeConfig();

    const overlayStyle = {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out'
    };

    const modalStyle = {
        backgroundColor: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '16px',
        padding: '0', 
        width: '90%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
        opacity: isOpen ? 1 : 0,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    };

    const contentStyle = {
        padding: '24px',
        flex: 1
    };

    const headerStyle = {
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
    };

    const iconBoxStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: config.iconBg,
        color: config.iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    };

    const textContainerStyle = {
        paddingTop: '2px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    };

    const titleStyle = {
        fontSize: '1.15rem',
        fontWeight: '600',
        margin: 0,
        color: 'var(--platform-text-primary)',
        lineHeight: '1.2'
    };

    const messageStyle = {
        margin: 0,
        fontSize: '0.95rem',
        lineHeight: '1.5',
        color: 'var(--platform-text-secondary)'
    };

    const footerStyle = {
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'var(--platform-bg)',
        borderTop: '1px solid var(--platform-border-color)'
    };

    return (
        <div style={overlayStyle} ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onCancel()}>
            <div style={modalStyle}>
                
                <div style={contentStyle}>
                    <div style={headerStyle}>
                        <div style={iconBoxStyle}>
                            {config.icon}
                        </div>
                        
                        <div style={textContainerStyle}>
                            <h3 style={titleStyle}>{title}</h3>
                            <p style={messageStyle}>{message}</p>
                        </div>
                    </div>
                </div>

                <div style={footerStyle}>
                    <Button 
                        variant="outline" 
                        onClick={onCancel}
                        style={{ minWidth: '90px' }}
                    >
                        {cancelLabel}
                    </Button>
                    <Button 
                        variant={config.confirmVariant} 
                        onClick={onConfirm} 
                        autoFocus
                        style={{ 
                            minWidth: '90px', 
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
                        }}
                    >
                        {confirmLabel}
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default ConfirmModal;