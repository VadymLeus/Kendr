// frontend/src/shared/ui/elements/Input.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

export const Input = ({ 
    label, 
    error, 
    helperText, 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    name,
    disabled, 
    className = '', 
    leftIcon, 
    rightIcon, 
    maxLength, 
    showCounter, 
    min, 
    max, 
    step = 1,
    wrapperStyle,
    style,
    debounceTime,
    ...props 
}) => {
    const isSearchInput = type === 'search' || 
                          name === 'search' || 
                          (placeholder && placeholder.toLowerCase().includes('пошук'));
    const effectiveDebounce = debounceTime !== undefined ? debounceTime : (isSearchInput ? 500 : 0);
    const [localValue, setLocalValue] = useState(value || '');
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef(null);
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    useEffect(() => {
        if (!effectiveDebounce || localValue === (value || '')) return;
        const handler = setTimeout(() => {
            if (onChange) {
                onChange({ target: { name, value: localValue } });
            }
        }, effectiveDebounce);
        return () => clearTimeout(handler);
    }, [localValue, effectiveDebounce, onChange, name, value]);
    const handleChange = (e) => {
        setLocalValue(e.target.value);
        if (!effectiveDebounce && onChange) {
            onChange(e);
        }
    };
    const isPassword = type === 'password';
    const isNumber = type === 'number';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const safeValue = isNumber && (localValue === null || localValue === undefined) ? '' : localValue;
    const currentLen = safeValue ? String(safeValue).length : 0;
    const showClear = !disabled && currentLen > 0 && !rightIcon && !isNumber;
    const handleClear = (e) => {
        e.preventDefault(); e.stopPropagation();
        setLocalValue('');
        onChange({ target: { name, value: '' } });
        inputRef.current?.focus();
    };
    const paddingLeft = leftIcon ? '40px' : '12px';
    let paddingRight = '12px';
    const hasRightElement = rightIcon || showClear || isPassword;
    if (hasRightElement) {
        paddingRight = '40px'; 
    }
    return (
        <div className={`form-group mb-4 ${className}`} style={wrapperStyle}>
            <style>{`
                .hide-browser-spinners::-webkit-outer-spin-button,
                .hide-browser-spinners::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .hide-browser-spinners {
                    -moz-appearance: textfield;
                }
            `}</style>
            {label && <label className="block mb-1.5 font-medium text-sm text-(--platform-text-primary)">{label}</label>}
            <div className={`
                input-wrapper relative w-full h-11 flex items-center bg-(--platform-input-bg) border border-(--platform-border-color) rounded-lg transition-all duration-200
                focus-within:border-(--platform-accent) focus-within:ring-2 focus-within:ring-(--platform-accent)/20
                ${error ? 'border-(--platform-danger)!' : ''}
                ${disabled ? 'opacity-60 cursor-not-allowed bg-(--platform-hover-bg)' : ''}
            `}>
                {leftIcon && (
                    <div className="absolute left-0 top-0 bottom-0 w-10 text-(--platform-text-secondary) pointer-events-none z-10 flex items-center justify-center">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={inputRef}
                    name={name}
                    type={inputType}
                    value={safeValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    className="custom-input appearance-none w-full bg-transparent border-none outline-none text-(--platform-text-primary) placeholder:text-(--platform-text-secondary)/50 hide-browser-spinners"
                    style={{ 
                        paddingLeft: paddingLeft, 
                        paddingRight: paddingRight,
                        height: '100%',
                        ...style
                    }} 
                    {...props} 
                />
                <div className="absolute right-2 top-0 bottom-0 flex items-center gap-1 z-10">
                    {rightIcon && <div className="p-1 opacity-50 flex items-center">{rightIcon}</div>}
                    {showClear && (
                        <button type="button" onClick={handleClear} className="p-1 text-(--platform-text-secondary) hover:text-(--platform-text-primary) transition-colors rounded" title="Очистити">
                            <X size={16} />
                        </button>
                    )}

                    {isPassword && (
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-(--platform-text-secondary) hover:text-(--platform-text-primary) transition-colors rounded">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>
            </div>
            {(error || helperText || maxLength || showCounter) && (
                <div className="flex justify-between mt-1 min-h-4.5 text-xs leading-tight">
                    <div className="flex-1 pr-2">
                        {error ? <span className="text-(--platform-danger)">{error}</span> : 
                         helperText ? <span className="text-(--platform-text-secondary) opacity-80">{helperText}</span> : null}
                    </div>
                    {(maxLength || showCounter) && (
                        <div className={currentLen >= maxLength ? 'text-(--platform-danger) font-bold' : 'text-(--platform-text-secondary)'}>
                            {currentLen}{maxLength ? ` / ${maxLength}` : ''}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};