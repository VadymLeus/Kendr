import React from 'react';

export const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  error,
  style,
  ...props 
}) => {
  const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: error ? '1px solid #e53e3e' : '1px solid var(--platform-border-color)',
    background: 'var(--platform-bg)',
    color: 'var(--platform-text-primary)',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    appearance: 'none',
    ...style
  };

  const selectHoverStyle = {
    borderColor: error ? '#c53030' : 'var(--platform-accent)',
    boxShadow: error ? '0 0 0 1px #e53e3e' : '0 0 0 1px var(--platform-accent)'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: 'var(--platform-text-primary)',
    fontSize: '0.9rem'
  };

  return (
    <div className="form-group" style={{ marginBottom: '24px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        style={selectStyle}
        onMouseOver={(e) => {
          Object.assign(e.target.style, { ...selectStyle, ...selectHoverStyle });
        }}
        onMouseOut={(e) => {
          Object.assign(e.target.style, selectStyle);
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div style={{ 
          color: '#e53e3e', 
          fontSize: '0.8rem', 
          marginTop: '6px' 
        }}>
          {error}
        </div>
      )}
    </div>
  );
};