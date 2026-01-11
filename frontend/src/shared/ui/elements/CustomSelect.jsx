// frontend/src/shared/ui/elements/CustomSelect.jsx
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomSelect = ({ 
    name, 
    value, 
    onChange, 
    options = [], 
    placeholder = "Оберіть...", 
    disabled = false, 
    style, 
    variant = 'default',
    error = false 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const normalizedOptions = options.map(opt => (typeof opt === 'object' && opt !== null) ? opt : { label: opt, value: opt });
    
    const selectedOption = normalizedOptions.find(opt => opt.value === String(value) || opt.value === value);
    const selectedLabel = selectedOption ? selectedOption.label : placeholder;
    const SelectedIcon = selectedOption?.icon;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (triggerRef.current && !triggerRef.current.contains(e.target) && menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleScroll = (e) => {
            if (menuRef.current && menuRef.current.contains(e.target)) return;
            if (isOpen) setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleScroll);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    useLayoutEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuHeight = Math.min(normalizedOptions.length * 40 + 10, 300);
            const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

            setMenuStyle({
                position: 'fixed',
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                top: openUpwards ? 'auto' : `${rect.bottom + 6}px`,
                bottom: openUpwards ? `${window.innerHeight - rect.top + 6}px` : 'auto',
                maxHeight: '300px',
                overflow: 'auto',
                background: 'var(--platform-card-bg)',
                border: '1px solid var(--platform-border-color)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                padding: '4px'
            });
        }
    }, [isOpen, normalizedOptions.length]);

    const handleSelect = (val) => {
        if (onChange) onChange({ target: { name, value: val } });
        setIsOpen(false);
    };

    const isMinimal = variant === 'minimal';
    
    const styles = `
        .custom-select-menu::-webkit-scrollbar { width: 6px; height: 6px; }
        
        .custom-select-menu::-webkit-scrollbar-track { background: transparent; }
        .custom-select-menu::-webkit-scrollbar-thumb { background-color: var(--platform-border-color); border-radius: 3px; }
        .custom-select-menu::-webkit-scrollbar-thumb:hover { background-color: var(--platform-accent); }
        
        .custom-select-menu::-webkit-scrollbar-corner { background: transparent; }

        .custom-select-option {
            padding: 10px 12px;
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--platform-text-primary);
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.15s ease;
            white-space: nowrap;
        }

        .custom-select-option:hover { 
            background-color: var(--platform-accent); 
            color: white; 
        }
        
        .custom-select-option:hover svg { 
            stroke: white; 
            opacity: 1 !important; 
        }
        
        .custom-select-option.selected { 
            background-color: color-mix(in srgb, var(--platform-accent) 10%, transparent); 
            color: var(--platform-accent); 
            font-weight: 500; 
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <div 
                ref={triggerRef} 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: isMinimal ? '6px 10px' : '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${error ? 'var(--platform-danger)' : (isOpen ? 'var(--platform-accent)' : 'var(--platform-border-color)')}`,
                    background: disabled ? 'rgba(0,0,0,0.04)' : 'var(--platform-input-bg)',
                    color: value ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)',
                    fontSize: isMinimal ? '0.85rem' : '0.9rem',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    height: style?.height || 'auto',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: isOpen && !error ? '0 0 0 2px color-mix(in srgb, var(--platform-accent) 20%, transparent)' : 'none',
                    opacity: disabled ? 0.7 : 1,
                    ...style
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                    {SelectedIcon && (
                        <SelectedIcon 
                            size={18} 
                            style={{ opacity: 0.8, ...selectedOption.iconStyle }} 
                            fill={selectedOption.iconProps?.filled ? "currentColor" : "none"}
                            {...(() => {
                                const { filled, ...rest } = selectedOption.iconProps || {};
                                return rest;
                            })()}
                        />
                    )}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedLabel}
                    </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>

            {isOpen && createPortal(
                <div ref={menuRef} style={menuStyle} className="custom-select-menu">
                    {normalizedOptions.length > 0 ? (
                        normalizedOptions.map(opt => {
                            const isSelected = opt.value === value;
                            const Icon = opt.icon;
                            const { filled, ...restIconProps } = opt.iconProps || {};

                            return (
                                <div key={opt.value} onClick={() => handleSelect(opt.value)} className={`custom-select-option ${isSelected ? 'selected' : ''}`}>
                                    {Icon && (
                                        <Icon 
                                            size={18} 
                                            style={{ opacity: isSelected ? 1 : 0.7, ...opt.iconStyle }} 
                                            fill={filled ? "currentColor" : "none"}
                                            {...restIconProps}
                                        />
                                    )} 
                                    <span>{opt.label}</span> 
                                    {isSelected && (
                                        <div style={{ marginLeft: 'auto', paddingLeft: '8px' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--platform-text-secondary)', fontSize: '0.85rem' }}>Немає варіантів</div>
                    )}
                </div>, 
                document.body
            )}
        </>
    );
};

export default CustomSelect;