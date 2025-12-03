// frontend/src/common/components/ui/Button.jsx
import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  disabled = false,
  type = 'button',
  onClick,
  style,
  ...props 
}) => {
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    opacity: disabled ? 0.7 : 1,
    ...style
  };

  const variants = {
    primary: {
      background: 'var(--platform-accent)',
      color: 'white',
      '&:hover:not(:disabled)': {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
      }
    },
    danger: {
      background: '#e53e3e',
      color: 'white',
      '&:hover:not(:disabled)': {
        background: '#c53030',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(229, 62, 62, 0.3)'
      }
    },
    warning: {
      background: 'var(--platform-warning)',
      color: 'white',
      '&:hover:not(:disabled)': {
        background: 'var(--platform-warning-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(237, 137, 54, 0.3)'
      }
    }
  };

  const variantStyle = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        background: variantStyle.background,
        color: variantStyle.color,
      }}
      onMouseOver={(e) => {
        if (!disabled && variantStyle['&:hover:not(:disabled)']) {
          Object.assign(e.target.style, variantStyle['&:hover:not(:disabled)']);
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, {
            ...baseStyle,
            background: variantStyle.background,
            color: variantStyle.color,
            transform: 'none',
            boxShadow: baseStyle.boxShadow
          });
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};