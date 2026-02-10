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

    return (
        <div className="mb-4 border border-(--platform-border-color) rounded-lg overflow-hidden bg-(--platform-card-bg)">
            <div 
                onClick={toggle}
                className={`
                    flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors duration-200
                    ${isOpen ? 'border-b border-(--platform-border-color)' : ''}
                    hover:bg-(--platform-hover-bg)
                `}
            >
                <div className="flex items-center gap-2.5 font-semibold text-sm text-(--platform-text-primary)">
                    {icon && <span className={isOpen ? 'text-(--platform-accent)' : 'text-(--platform-text-secondary)'}>{icon}</span>}
                    {title}
                </div>
                <div className="text-(--platform-text-secondary)">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
            </div>
            
            {isOpen && (
                <div className="p-4 animate-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default SettingsGroup;