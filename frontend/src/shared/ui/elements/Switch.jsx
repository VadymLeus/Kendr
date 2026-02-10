// frontend/src/shared/ui/elements/Switch.jsx
import React from 'react';
export const Switch = ({ 
    checked, 
    onChange, 
    label, 
    disabled = false,
    className = '',
    style = {}
}) => {
    
    const handleChange = (e) => {
        if (disabled || !onChange) return;
        onChange(e.target.checked);
    };

    return (
        <label 
            className={`switch-wrapper ${className}`} 
            style={{ 
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                ...style
            }}
        >
            <input 
                type="checkbox" 
                className="switch-input"
                checked={!!checked}
                onChange={handleChange}
                disabled={disabled}
            />
            
            <div className="switch-track">
                <div className="switch-thumb" />
            </div>

            {label && (
                <span style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: '500', 
                    color: 'var(--platform-text-primary)',
                    userSelect: 'none'
                }}>
                    {label}
                </span>
            )}
        </label>
    );
};

export default Switch;