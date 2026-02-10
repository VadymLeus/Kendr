// frontend/src/modules/editor/ui/configuration/SettingsUI.jsx
import React from 'react';

export const commonStyles = {
    formGroup: { marginBottom: '1.25rem' },
    label: { 
        display: 'block', marginBottom: '0.4rem', 
        color: 'var(--platform-text-primary)', fontWeight: '500', fontSize: '0.85rem'
    },
    input: { 
        width: '100%', padding: '10px 12px', 
        border: '1px solid var(--platform-border-color)', borderRadius: '8px', 
        fontSize: '0.9rem', background: 'var(--platform-bg)', 
        color: 'var(--platform-text-primary)', boxSizing: 'border-box',
        outline: 'none', transition: 'border-color 0.2s'
    },
    textarea: {
        width: '100%', padding: '10px 12px', 
        border: '1px solid var(--platform-border-color)', borderRadius: '8px', 
        fontSize: '0.9rem', background: 'var(--platform-bg)', 
        color: 'var(--platform-text-primary)', boxSizing: 'border-box',
        outline: 'none', transition: 'border-color 0.2s',
        resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5', minHeight: '80px'
    },
    toggleContainer: {
        display: 'flex',
        background: 'var(--platform-bg)',
        padding: '3px',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        marginBottom: '1rem',
        gap: '2px'
    }
};

export const SectionTitle = ({ children, style }) => (
    <div 
        className="text-xs font-bold uppercase text-(--platform-text-secondary) tracking-wider mt-6 mb-3 flex items-center gap-2"
        style={style}
    >
        {children}
        <div className="flex-1 h-px bg-(--platform-border-color) opacity-50"></div>
    </div>
);

export const ToggleButton = ({ isActive, onClick, children, style, title }) => (
    <button 
        type="button" 
        onClick={onClick}
        title={title}
        className={`
            flex-1 py-2 px-1 border-none rounded-md cursor-pointer font-medium text-sm
            flex flex-col items-center justify-center gap-1 transition-all duration-200
            ${isActive 
                ? 'bg-(--platform-card-bg) text-(--platform-accent) shadow-sm font-semibold' 
                : 'bg-transparent text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}
        `}
        style={style}
    >
        {children}
    </button>
);

export const ToggleGroup = ({ options, value, onChange }) => (
    <div className="flex bg-(--platform-bg) p-1 rounded-lg border border-(--platform-border-color) mb-4 gap-0.5">
        {options.map((option) => (
            <ToggleButton
                key={option.value}
                isActive={value === option.value}
                onClick={() => onChange(option.value)}
                title={option.title}
            >
                {option.icon && <span>{option.icon}</span>}
                {option.label}
            </ToggleButton>
        ))}
    </div>
);

export const ToggleSwitch = ({ checked, onChange, label, icon }) => (
    <label className="flex items-center justify-between cursor-pointer py-3 border-b border-dashed border-(--platform-border-color) mb-2 last:border-0">
        <div className="flex items-center gap-2">
            {icon && <span className="text-(--platform-text-secondary)">{icon}</span>}
            <span className="text-sm text-(--platform-text-primary)">{label}</span>
        </div>
        
        <div className="relative w-10 h-5.5">
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                className="sr-only" 
            />
            <div className={`
                absolute inset-0 rounded-full transition-colors duration-200 border
                ${checked 
                    ? 'bg-(--platform-accent) border-(--platform-accent)' 
                    : 'bg-(--platform-input-bg) border-(--platform-border-color)'}
            `}></div>
            <div className={`
                absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-200
                ${checked ? 'left-5' : 'left-0.5'}
            `}></div>
        </div>
    </label>
);