// frontend/src/components/common/ConfirmModal.jsx
import React, { useEffect, useRef } from 'react';

const ConfirmModal = ({ isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, type = 'danger' }) => {
    const overlayRef = useRef(null);

    // Закриття по ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) onCancel();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.2s ease-out'
    };

    const modalStyle = {
        backgroundColor: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '12px',
        padding: '2rem',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        transform: 'translateY(0)',
        animation: 'slideUp 0.2s ease-out'
    };

    const titleStyle = {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: type === 'danger' ? 'var(--platform-danger)' : 'var(--platform-text-primary)'
    };

    const messageStyle = {
        marginBottom: '2rem',
        lineHeight: '1.5',
        color: 'var(--platform-text-secondary)'
    };

    const buttonGroupStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem'
    };

    const btnBaseStyle = {
        padding: '10px 20px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'opacity 0.2s'
    };

    const cancelBtnStyle = {
        ...btnBaseStyle,
        backgroundColor: 'transparent',
        border: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-primary)'
    };

    const confirmBtnStyle = {
        ...btnBaseStyle,
        backgroundColor: type === 'danger' ? 'var(--platform-danger)' : 'var(--platform-accent)',
        color: '#fff'
    };

    return (
        <div style={overlayStyle} ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onCancel()}>
            <div style={modalStyle}>
                <h3 style={titleStyle}>{title}</h3>
                <p style={messageStyle}>{message}</p>
                <div style={buttonGroupStyle}>
                    <button style={cancelBtnStyle} onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button style={confirmBtnStyle} onClick={onConfirm} autoFocus>
                        {confirmLabel}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default ConfirmModal;