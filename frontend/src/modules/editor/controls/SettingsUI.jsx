// frontend/src/modules/site-editor/components/common/SettingsUI.jsx
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
    <div style={{
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        color: 'var(--platform-text-secondary)',
        letterSpacing: '0.5px',
        margin: '1.5rem 0 0.8rem 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        ...style
    }}>
        {children}
        <div style={{ flex: 1, height: '1px', background: 'var(--platform-border-color)', opacity: 0.5 }}></div>
    </div>
);

export const ToggleButton = ({ isActive, onClick, children, style, title }) => (
    <button 
        type="button" 
        onClick={onClick}
        title={title}
        style={{
            flex: 1,
            padding: '8px 4px',
            border: 'none',
            background: isActive ? 'var(--platform-card-bg)' : 'transparent',
            color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: isActive ? '600' : '500',
            fontSize: '0.85rem',
            boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
            ...style
        }}
    >
        {children}
    </button>
);

export const ToggleGroup = ({ options, value, onChange }) => (
    <div style={commonStyles.toggleContainer}>
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

export const ToggleSwitch = ({ checked, onChange, label }) => (
    <label style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', padding: '0.75rem 0',
        borderBottom: '1px dashed var(--platform-border-color)',
        marginBottom: '0.5rem'
    }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--platform-text-primary)' }}>{label}</span>
        <div style={{ position: 'relative', width: '40px', height: '22px' }}>
            <input 
                type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} 
                style={{ opacity: 0, width: 0, height: 0 }} 
            />
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '20px',
                background: checked ? 'var(--platform-accent)' : 'var(--platform-input-bg)',
                border: checked ? 'none' : '1px solid var(--platform-border-color)',
                transition: 'background 0.2s',
            }}></div>
            <div style={{
                position: 'absolute', top: '2px', left: checked ? '20px' : '2px',
                width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}></div>
        </div>
    </label>
);