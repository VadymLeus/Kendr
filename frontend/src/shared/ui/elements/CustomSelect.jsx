// frontend/src/shared/ui/elements/CustomSelect.jsx
import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ 
    name, value, onChange, options = [], placeholder = "Оберіть...", 
    disabled, error, style, multiple = false, maxSelections,
    dropdownClassName = '', dropdownStyle = {}
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const flatOptions = useMemo(() => options.flatMap(opt => 
        opt.options ? [{ label: opt.label, isGroup: true }, ...opt.options] : opt
    ), [options]);
    useEffect(() => {
        if (!isOpen) return;
        const close = (e) => {
            if (e.type === 'mousedown') {
                if (triggerRef.current && !triggerRef.current.contains(e.target) && menuRef.current && !menuRef.current.contains(e.target)) {
                    setIsOpen(false);
                }
            } else {
                if (menuRef.current && menuRef.current.contains(e.target)) return;
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        window.addEventListener('resize', close);
        window.addEventListener('scroll', close, true);
        return () => { 
            document.removeEventListener('mousedown', close); 
            window.removeEventListener('resize', close); 
            window.removeEventListener('scroll', close, true); 
        };
    }, [isOpen]);

    useLayoutEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const idealMaxHeight = 300;
            let maxHeight, topStyle, bottomStyle;
            if (spaceBelow >= idealMaxHeight || spaceBelow > spaceAbove) {
                maxHeight = Math.max(150, spaceBelow - 16);
                topStyle = `${rect.bottom + 4}px`;
                bottomStyle = 'auto';
            } else {
                maxHeight = Math.max(150, spaceAbove - 16);
                topStyle = 'auto';
                bottomStyle = `${window.innerHeight - rect.top + 4}px`;
            }
            
            setMenuStyle({
                position: 'fixed',
                top: topStyle,
                bottom: bottomStyle,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                maxHeight: `${maxHeight}px`,
                zIndex: 999999,
                overflowY: 'auto',
                backgroundColor: 'var(--platform-card-bg, #ffffff)',
                border: '1px solid var(--platform-border-color, #e5e7eb)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                padding: '6px 0',
                display: 'flex',
                flexDirection: 'column'
            });
        }
    }, [isOpen, flatOptions.length]);

    const handleSelect = (val) => {
        if (multiple) {
            let currentValues = Array.isArray(value) ? [...value] : [];
            const strVal = String(val);
            if (currentValues.includes(strVal)) {
                currentValues = currentValues.filter(v => v !== strVal);
            } else {
                if (maxSelections && currentValues.length >= maxSelections) {
                    return;
                }
                currentValues.push(strVal);
            }
            onChange && onChange({ target: { name, value: currentValues } });
        } else {
            onChange && onChange({ target: { name, value: val } });
            setIsOpen(false);
        }
    };

    let displayLabel = placeholder;
    let SingleIcon = null;
    if (multiple) {
        if (Array.isArray(value) && value.length > 0) {
            const selectedOpts = flatOptions.filter(o => !o.isGroup && value.includes(String(o.value)));
            if (selectedOpts.length > 0) {
                displayLabel = selectedOpts.map(o => o.label).join(', ');
            }
        }
    } else {
        const selected = flatOptions.find(o => !o.isGroup && String(o.value) === String(value));
        if (selected) {
            displayLabel = selected.label;
            SingleIcon = selected.icon;
        }
    }

    return (
        <>
            <div 
                ref={triggerRef}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`select-trigger ${error ? 'border-(--platform-danger)' : ''} ${isOpen ? 'open' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--platform-bg)',
                    border: `1px solid ${error ? 'var(--platform-danger)' : 'var(--platform-border-color)'}`,
                    borderRadius: '8px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    ...style
                }}
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {!multiple && SingleIcon && <SingleIcon size={18} className="opacity-80 shrink-0" />}
                    <span className={`truncate text-sm font-medium ${displayLabel === placeholder ? 'text-(--platform-text-secondary)' : 'text-(--platform-text-primary)'}`}>
                        {displayLabel}
                    </span>
                </div>
                <ChevronDown size={16} className={`text-(--platform-text-secondary) transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && createPortal(
                <div 
                    ref={menuRef} 
                    className={`custom-scrollbar ${dropdownClassName}`} 
                    style={{...menuStyle, ...dropdownStyle}}
                >
                    {flatOptions.length ? flatOptions.map((opt, i) => {
                        if (opt.isGroup) {
                            return <div key={i} className="text-xs font-bold text-(--platform-text-secondary) uppercase px-3 py-1 mt-1">{opt.label}</div>;
                        }
                        const isSelected = multiple 
                            ? (Array.isArray(value) && value.includes(String(opt.value)))
                            : (String(opt.value) === String(value));
                        return (
                            <div 
                                key={opt.value} 
                                onClick={() => handleSelect(opt.value)}
                                style={{ 
                                    padding: `10px ${opt.isGroupChild ? '24px' : '14px'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    color: isSelected && !multiple ? 'var(--platform-accent)' : 'var(--platform-text-primary)',
                                    backgroundColor: isSelected && !multiple ? 'color-mix(in srgb, var(--platform-accent), transparent 90%)' : 'transparent',
                                    fontSize: '14px',
                                    fontWeight: isSelected ? '600' : '500',
                                    transition: 'background 0.2s',
                                    userSelect: 'none'
                                }}
                                onMouseOver={(e) => {
                                    if (!isSelected || multiple) e.currentTarget.style.backgroundColor = 'var(--platform-bg)';
                                }}
                                onMouseOut={(e) => {
                                    if (!isSelected || multiple) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {multiple && (
                                    <div className={`w-4 h-4 mr-2 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-(--platform-accent) border-(--platform-accent) text-white' : 'border-(--platform-border-color)'}`}>
                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                )}
                                {!multiple && opt.icon && <opt.icon size={16} className={isSelected ? 'opacity-100' : 'opacity-60'} />}
                                <span className="flex-1 truncate">{opt.label}</span>
                                {!multiple && isSelected && <Check size={16} />}
                            </div>
                        );
                    }) : <div className="p-3 text-center text-sm opacity-60">Немає варіантів</div>}
                </div>,
                document.body
            )}
        </>
    );
};

export default CustomSelect;