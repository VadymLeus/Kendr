// frontend/src/modules/editor/ui/configuration/SettingsGroup.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

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

    const containerStyle = {
        marginBottom: '16px',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        overflow: 'hidden'
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        cursor: 'pointer',
        userSelect: 'none',
        color: isOpen ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)',
        background: 'transparent',
        transition: 'all 0.2s ease',
        borderBottom: isOpen ? '1px solid var(--platform-border-color)' : 'none'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle} onClick={toggle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontSize: '0.9rem' }}>
                    {icon && <span style={{ color: isOpen ? 'var(--platform-accent)' : 'inherit', display: 'flex' }}>{icon}</span>}
                    {title}
                </div>
                <div style={{ color: 'var(--platform-text-secondary)', display: 'flex' }}>
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
            </div>
            
            {isOpen && (
                <div style={{ 
                    padding: '16px',
                    animation: 'slideDown 0.2s ease-out'
                }}>
                    {children}
                </div>
            )}
            <style>{`
                @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default SettingsGroup;