// frontend/src/features/editor/settings/components/SettingsGroup.jsx
import React, { useState } from 'react';

const SettingsGroup = ({ title, children, defaultOpen = false, icon, storageKey }) => {
    const storageId = storageKey ? `group_state_${storageKey}` : null;

    const [isOpen, setIsOpen] = useState(() => {
        if (!storageId) return defaultOpen;
        const saved = localStorage.getItem(storageId);
        return saved !== null ? JSON.parse(saved) : defaultOpen;
    });

    const toggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (storageId) {
            localStorage.setItem(storageId, JSON.stringify(newState));
        }
    };

    const wrapperStyle = {
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        marginBottom: '12px',
        overflow: 'hidden',
        backgroundColor: 'var(--platform-card-bg)',
        transition: 'all 0.2s ease'
    };

    const headerStyle = {
        padding: '12px 16px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: '600',
        fontSize: '0.9rem',
        color: 'var(--platform-text-primary)',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        userSelect: 'none'
    };

    const contentStyle = {
        padding: '16px',
        borderTop: '1px solid var(--platform-border-color)',
        display: isOpen ? 'block' : 'none',
        backgroundColor: 'var(--platform-bg)'
    };

    const iconStyle = {
        marginRight: '8px',
        fontSize: '1.1em'
    };

    const arrowStyle = {
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
        color: 'var(--platform-text-secondary)'
    };

    return (
        <div style={wrapperStyle}>
            <div onClick={toggle} style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {icon && <span style={iconStyle}>{icon}</span>}
                    <span>{title}</span>
                </div>
                <span style={arrowStyle}>▼</span>
            </div>
            {isOpen && (
                <div style={contentStyle}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default SettingsGroup;