// frontend/src/shared/ui/elements/Button.jsx
import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon,
  style,
  title,
  ...props
}) => {
  const variantMap = {
      'primary': 'btn-primary',
      'secondary': 'btn-secondary',
      'danger': 'btn-danger',
      'ghost': 'btn-ghost',
      'outline': 'btn-outline',
      'square-accent': 'btn-secondary btn-icon-square',
      'square-danger': 'btn-danger btn-icon-square'
  };

  const variantClass = variantMap[variant] || `btn-${variant}`;

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};