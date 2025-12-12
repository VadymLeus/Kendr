// frontend/src/common/components/ui/Input.jsx
import React, { useState } from 'react';
import { IconEye, IconEyeOff, IconX } from './Icons';

export const Input = ({ 
  label, 
  error, 
  type = 'text',
  value,
  onChange,
  placeholder,
  name,
  style,
  disabled,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const syntheticEvent = {
        target: { name: name, value: '' }
    };
    onChange(syntheticEvent);
  };

  let paddingRight = 12;
  if (isPasswordType) paddingRight += 32;
  if (!disabled) paddingRight += 32;

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    paddingRight: `${paddingRight}px`,
    borderRadius: '8px',
    border: error ? '1px solid #e53e3e' : '1px solid var(--platform-border-color)',
    background: 'var(--platform-bg)',
    color: 'var(--platform-text-primary)',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    height: '42px',
    ...style
  };

  const inputHoverStyle = {
    borderColor: error ? '#c53030' : 'var(--platform-accent)',
    boxShadow: error ? '0 0 0 1px #e53e3e' : '0 0 0 1px var(--platform-accent)'
  };

  const actionsContainerStyle = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    zIndex: 5,
    height: '100%',
    pointerEvents: 'none'
  };

  const iconButtonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--platform-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background 0.2s, color 0.2s',
    height: '28px',
    width: '28px',
    pointerEvents: 'auto'
  };

  return (
    <div className="form-group" style={{ marginBottom: '20px', position: 'relative' }}>
      {label && <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.85rem' }}>{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={inputStyle}
          onMouseOver={(e) => !disabled && Object.assign(e.target.style, { ...inputStyle, ...inputHoverStyle })}
          onMouseOut={(e) => !disabled && Object.assign(e.target.style, inputStyle)}
          {...props}
        />
        
        <div style={actionsContainerStyle}>
            {isPasswordType && (
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={iconButtonStyle}
                    tabIndex="-1"
                    title={showPassword ? "Приховати" : "Показати"}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--platform-text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--platform-text-secondary)'}
                >
                     {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
            )}

            {!disabled && (
                <button 
                    type="button"
                    onClick={handleClear}
                    style={{
                        ...iconButtonStyle,
                        opacity: value ? 1 : 0.3,
                        cursor: value ? 'pointer' : 'default'
                    }}
                    title="Очистити"
                    tabIndex="-1"
                    onMouseEnter={(e) => {
                        if (value) {
                            e.currentTarget.style.color = 'var(--platform-danger)';
                            e.currentTarget.style.background = 'rgba(229,62,62,0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--platform-text-secondary)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <IconX size={16} />
                </button>
            )}
        </div>
      </div>
      
      {error && (
        <div style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '4px', animation: 'fadeIn 0.2s ease-in-out' }}>
          {error}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};