// frontend/src/common/components/ui/Input.jsx
import React, { useState, useRef } from 'react';
import { IconEye, IconEyeOff, IconX, IconChevronUp, IconChevronDown } from './Icons';

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
  min,
  max,
  step = 1,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const isPasswordType = type === 'password';
  const isNumberType = type === 'number';
  
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;
  
  const safeValue =
    isNumberType && (value === 'all' || value === null || value === undefined)
      ? ''
      : value;

  const currentLength = safeValue ? String(safeValue).length : 0;
  const showClearButton = !disabled && currentLength > 0 && !rightIcon && !isNumberType;

  const triggerChange = (newValue) => {
    if (disabled) return;
    const syntheticEvent = { target: { name: name, value: newValue } };
    onChange(syntheticEvent);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    triggerChange('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleIncrement = (e) => {
    e.preventDefault(); 
    if (disabled) return;
    let currentVal = safeValue === '' ? 0 : parseFloat(safeValue);
    if (isNaN(currentVal)) currentVal = 0;
    
    let nextVal = currentVal + Number(step);
    if (max !== undefined && nextVal > max) nextVal = max;
    
    nextVal = Math.round(nextVal * 100) / 100;
    
    triggerChange(nextVal);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    if (disabled) return;
    let currentVal = safeValue === '' ? 0 : parseFloat(safeValue);
    if (isNaN(currentVal)) currentVal = 0;

    let nextVal = currentVal - Number(step);
    if (min !== undefined && nextVal < min) nextVal = min;
    
    nextVal = Math.round(nextVal * 100) / 100;

    triggerChange(nextVal);
  };

  let paddingRight = 12;
  if (isPasswordType) paddingRight += 32;
  if (showClearButton) paddingRight += 32;
  if (rightIcon) paddingRight += 32;
  
  if (isNumberType && !disabled) paddingRight += 24; 

  let paddingLeft = 12;
  if (leftIcon) paddingLeft += 32;

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
            
            .custom-input::-webkit-outer-spin-button,
            .custom-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            .custom-input[type=number] {
                -moz-appearance: textfield;
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

            .number-controls {
                display: flex; flex-direction: column; 
                height: 100%; justify-content: center;
                margin-right: 4px;
            }
            .number-btn {
                flex: 1; display: flex; align-items: center; justify-content: center;
                cursor: pointer; color: var(--platform-text-secondary);
                background: transparent; border: none; padding: 0;
                transition: color 0.2s; height: 50%; width: 20px;
            }
            .number-btn:hover { color: var(--platform-accent); background: var(--platform-hover-bg); border-radius: 2px; }
            .number-btn:active { opacity: 0.7; }
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
          ref={inputRef}
          name={name}
          type={inputType}
          value={safeValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
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
        
        <div style={{ position: 'absolute', right: '8px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', gap: '2px', zIndex: 5 }}>
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

            {isNumberType && !disabled && (
                <div className="number-controls">
                    <button type="button" onClick={handleIncrement} className="number-btn" tabIndex={-1}>
                        <IconChevronUp size={12} />
                    </button>
                    <button type="button" onClick={handleDecrement} className="number-btn" tabIndex={-1}>
                        <IconChevronDown size={12} />
                    </button>
                </div>
            )}
        </div>
      </div>
      
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