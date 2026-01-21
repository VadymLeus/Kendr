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
            className={`custom-switch-wrapper ${className}`} 
            style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '12px', 
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                ...style
            }}
        >
            <style>{`
                .custom-switch-input {
                    display: none;
                }
                
                .custom-switch-track {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    background-color: var(--platform-border-color);
                    border-radius: 99px;
                    transition: background-color 0.2s ease, border-color 0.2s ease;
                    flex-shrink: 0;
                    border: 1px solid transparent;
                }

                body[data-platform-mode="dark"] .custom-switch-track {
                    background-color: var(--platform-input-bg);
                    border-color: var(--platform-border-color);
                }

                .custom-switch-input:checked + .custom-switch-track {
                    background-color: var(--platform-accent);
                    border-color: var(--platform-accent);
                }

                .custom-switch-thumb {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 18px;
                    height: 18px;
                    background-color: white;
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
                    transition: transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
                }

                .custom-switch-input:checked + .custom-switch-track .custom-switch-thumb {
                    transform: translateX(20px);
                }
            `}</style>

            <input 
                type="checkbox" 
                className="custom-switch-input"
                checked={!!checked}
                onChange={handleChange}
                disabled={disabled}
            />
            
            <div className="custom-switch-track">
                <div className="custom-switch-thumb" />
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