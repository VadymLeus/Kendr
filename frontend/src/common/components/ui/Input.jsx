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
  wrapperStyle, 
  disabled,
  className,
  leftIcon,
  rightIcon,
  maxLength,
  showCounter = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;
  
  const currentLength = value ? String(value).length : 0;
  const showClearButton = !disabled && currentLength > 0 && !rightIcon;

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const syntheticEvent = { target: { name: name, value: '' } };
    onChange(syntheticEvent);
  };

  let paddingRight = 12;
  if (isPasswordType) paddingRight += 32;
  if (showClearButton) paddingRight += 32;
  if (rightIcon) paddingRight += 32;

  let paddingLeft = 12;
  if (leftIcon) paddingLeft += 32;

  // FIX: Определяем, нужно ли вообще показывать нижнюю панель
  const hasBottomContent = error || maxLength || showCounter;

  return (
    <div className={`form-group ${className || ''}`} style={{ position: 'relative', marginBottom: label ? '20px' : '0', ...wrapperStyle }}>
        <style>{`
            .custom-input {
                width: 100%;
                border-radius: 8px;
                background: var(--platform-bg);
                color: var(--platform-text-primary);
                font-size: 0.9rem;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid var(--platform-border-color);
                outline: none;
                box-sizing: border-box; 
            }
            .custom-input:hover:not(:disabled) { border-color: var(--platform-accent); }
            .custom-input:focus:not(:disabled) {
                border-color: var(--platform-accent);
                box-shadow: 0 0 0 3px var(--platform-accent-transparent, rgba(66, 153, 225, 0.15));
            }
            .custom-input:disabled { opacity: 0.6; cursor: not-allowed; }
            .custom-input.has-error { border-color: #e53e3e; }
            
            .input-btn-icon {
                background: transparent; border: none; cursor: pointer;
                color: var(--platform-text-secondary); display: flex;
                align-items: center; justify-content: center;
                padding: 4px; border-radius: 4px; transition: all 0.2s;
                height: 28px; width: 28px;
            }
            .input-btn-icon:hover { color: var(--platform-text-primary); background: rgba(0,0,0,0.05); }
        `}</style>

      {label && (
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.85rem' }}>
            {label}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {leftIcon && (
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--platform-text-secondary)', pointerEvents: 'none', zIndex: 5, display: 'flex' }}>
                {leftIcon}
            </div>
        )}

        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`custom-input ${error ? 'has-error' : ''}`}
          style={{
            padding: '10px 12px',
            paddingRight: `${paddingRight}px`,
            paddingLeft: `${paddingLeft}px`,
            height: '42px', 
            ...style 
          }}
          {...props}
        />
        
        <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '2px', zIndex: 5 }}>
           {rightIcon && (
               <div className="input-btn-icon" style={{ cursor: 'default' }}>
                   {rightIcon}
               </div>
           )}

           {showClearButton && (
                <button type="button" onClick={handleClear} className="input-btn-icon" title="Очистити">
                    <IconX size={16} />
                </button>
            )}

            {isPasswordType && (
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="input-btn-icon">
                     {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
            )}
        </div>
      </div>
      
      {/* FIX: Рендерим нижний блок, ТОЛЬКО если есть контент (ошибка или счетчик) */}
      {hasBottomContent && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '4px', minHeight: '18px' }}>
            <div style={{ flex: 1 }}>
              {error && <div style={{ color: '#e53e3e', fontSize: '0.75rem', lineHeight: '1.2' }}>{error}</div>}
            </div>
            
            {(maxLength || showCounter) && (
              <div style={{ 
                  fontSize: '0.75rem', 
                  color: currentLength >= maxLength ? '#e53e3e' : 'var(--platform-text-secondary)',
                  marginLeft: '8px',
                  whiteSpace: 'nowrap'
              }}>
                  {currentLength}{maxLength ? ` / ${maxLength}` : ''}
              </div>
            )}
        </div>
      )}
    </div>
  );
};