// frontend/src/shared/ui/elements/Button.jsx
import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  className = '',
  icon,
  style,
  title,
  active,
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
  const activeClass = active ? 'active' : '';
  const isDisabled = disabled || isLoading;
  return (
    <button
      type={type}
      className={`btn ${variantClass} ${activeClass} ${className}`.trim()}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      style={style}
      {...props}
    >
      {isLoading ? (
          <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {children}
          </span>
      ) : (
          <>
            {icon}
            {children}
          </>
      )}
    </button>
  );
};