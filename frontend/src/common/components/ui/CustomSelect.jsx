// frontend/src/common/components/ui/CustomSelect.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomSelect = ({ name, value, onChange, options, placeholder = "Оберіть...", style }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                triggerRef.current && 
                !triggerRef.current.contains(event.target) &&
                menuRef.current && 
                !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const menuHeight = Math.min(options.length * 36 + 10, 300);
            const spaceBelow = windowHeight - rect.bottom;

            let top, bottom, transformOrigin;
            
            if (spaceBelow < menuHeight && rect.top > menuHeight) {
                top = 'auto';
                bottom = windowHeight - rect.top + 5;
                transformOrigin = 'bottom';
            } else {
                top = rect.bottom + 5;
                bottom = 'auto';
                transformOrigin = 'top';
            }

            setMenuStyle({
                position: 'fixed',
                left: rect.left,
                width: rect.width,
                top: top !== 'auto' ? `${top}px` : 'auto',
                bottom: bottom !== 'auto' ? `${bottom}px` : 'auto',
                maxHeight: '300px',
                overflowY: 'auto',
                background: 'var(--platform-card-bg)',
                border: '1px solid var(--platform-border-color)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 9999,
                transformOrigin,
                animation: 'scaleIn 0.2s ease'
            });
        }
    }, [isOpen, options.length]);

    const handleSelect = (selectedValue) => {
        onChange({ target: { name, value: selectedValue } });
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    const triggerStyle = {
        ...style,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative'
    };

    const itemStyle = (isSelected) => ({
        padding: '8px 12px',
        cursor: 'pointer',
        background: isSelected ? 'var(--platform-accent)' : 'transparent',
        color: isSelected ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
        transition: 'background 0.2s',
        fontSize: '0.9rem'
    });

    const arrowStyle = {
        fontSize: '0.7rem',
        marginLeft: '8px',
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
        color: 'var(--platform-text-secondary)'
    };

    return (
        <>
            <div 
                ref={triggerRef} 
                style={triggerStyle} 
                onClick={() => setIsOpen(!isOpen)}
                className="custom-select-trigger"
            >
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {selectedLabel}
                </span>
                <span style={arrowStyle}>▼</span>
            </div>

            {isOpen && createPortal(
                <div ref={menuRef} style={menuStyle} className="custom-select-menu custom-scrollbar">
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => handleSelect(opt.value)}
                            style={itemStyle(opt.value === value)}
                            onMouseEnter={(e) => {
                                if (opt.value !== value) e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                if (opt.value !== value) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>,
                document.body
            )}
            
            <style>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scaleY(0.9); }
                    to { opacity: 1; transform: scaleY(1); }
                }
            `}</style>
        </>
    );
};

export default CustomSelect;