// frontend/src/shared/ui/elements/Button.jsx
import React, { useState } from 'react';

const VARIANTS = {
    primary: {
        base: {
            background: 'var(--platform-accent)',
            color: 'white',
            border: 'none',
        },
        hover: {
            background: 'var(--platform-accent-hover)',
        }
    },
    danger: {
        base: {
            background: '#e53e3e',
            color: 'white',
            border: 'none',
        },
        hover: {
            background: '#c53030',
        }
    },
    success: {
        base: {
            background: '#10b981',
            color: 'white',
            border: 'none',
        },
        hover: {
            background: '#059669',
        }
    },
    warning: {
        base: {
            background: '#f59e0b',
            color: 'white',
            border: 'none',
        },
        hover: {
            background: '#d97706',
        }
    },
    'outline-warning': {
        base: {
            background: 'transparent',
            color: '#d97706',
            border: '1px solid #d97706',
        },
        hover: {
            background: 'rgba(217, 119, 6, 0.05)',
            color: '#b45309',
            border: '1px solid #b45309',
        }
    },
    'secondary-danger': {
        base: {
            background: '#fff5f5',
            color: '#c53030',
            border: '1px solid #fc8181',
        },
        hover: {
            background: '#fee2e2',
            color: '#9b2c2c',
            border: '1px solid #f87171',
        }
    },
    'outline-danger': {
        base: {
            background: 'transparent',
            color: 'var(--platform-text-secondary)',
            border: '1px solid var(--platform-border-color)',
        },
        hover: {
            background: 'transparent', 
            color: '#c53030',
            border: '1px solid #c53030',
        }
    },
    outline: {
        base: {
            background: 'transparent',
            color: 'var(--platform-text-primary)',
            border: '1px solid var(--platform-border-color)',
        },
        hover: {
            border: '1px solid var(--platform-accent)',
            color: 'var(--platform-accent)',
            background: 'color-mix(in srgb, var(--platform-accent), transparent 90%)',
        }
    },
    ghost: {
        base: {
            background: 'transparent',
            color: 'var(--platform-text-primary)',
            border: '1px solid transparent',
        },
        hover: {
            background: 'rgba(0,0,0,0.05)',
            color: 'var(--platform-text-primary)',
        }
    },
    'square-danger': {
        base: {
            background: 'var(--platform-card-bg)',
            color: 'var(--platform-text-secondary)',
            border: '1px solid var(--platform-border-color)',
            padding: 0,
            width: '38px',
            height: '38px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        hover: {
            background: '#e53e3e',
            color: 'white',
            border: '1px solid #e53e3e',
        }
    },
    'square-accent': {
        base: {
            background: 'var(--platform-card-bg)',
            color: 'var(--platform-text-secondary)',
            border: '1px solid var(--platform-border-color)',
            padding: 0,
            width: '38px',
            height: '38px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        hover: {
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-accent)',
            color: 'var(--platform-accent)',
        },
        activeState: {
            border: '1px solid var(--platform-accent)',
            color: 'var(--platform-accent)',
            background: 'color-mix(in srgb, var(--platform-accent), transparent 90%)'
        }
    },
    'toggle-danger': {
        base: {
            background: 'var(--platform-bg)',
            color: 'var(--platform-text-secondary)',
            border: '1px solid var(--platform-border-color)',
            padding: 0,
            width: '38px',
            height: '38px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        hover: {
            border: '1px solid var(--platform-danger)',
            color: 'var(--platform-danger)',
            background: 'var(--platform-bg)',
        },
        activeState: {
            background: 'var(--platform-danger)',
            border: '1px solid var(--platform-danger)',
            color: 'white',
        },
        activeHover: {
            background: '#c53030',
            border: '1px solid #c53030',
            color: 'white'
        }
    }
};

export const Button = ({
  children,
  variant = 'primary',
  disabled = false,
  active = false,
  type = 'button',
  onClick,
  style,
  className,
  title,
  icon,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    boxShadow: 'none',
    opacity: disabled ? 0.7 : 1,
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
  };

  const variantConfig = VARIANTS[variant] || VARIANTS.primary;
  let finalStyle = { ...baseStyle, ...variantConfig.base };

  if (style) {
    finalStyle = { ...finalStyle, ...style };
  }

  if (active && variantConfig.activeState) {
    finalStyle = { ...finalStyle, ...variantConfig.activeState };
  }

  if (isHovered && !disabled) {
    if (active && variantConfig.activeHover) {
        finalStyle = { ...finalStyle, ...variantConfig.activeHover };
    }
    else if (variantConfig.hover) {
        finalStyle = { ...finalStyle, ...variantConfig.hover };
    }
  }

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={finalStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
      {...props}
    >
      {icon && icon}
      {children}
    </button>
  );
};