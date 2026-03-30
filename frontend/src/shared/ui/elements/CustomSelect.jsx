// frontend/src/shared/ui/elements/CustomSelect.jsx
import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ name, value, onChange, options = [], placeholder = "Оберіть...", disabled, error, style }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const flatOptions = useMemo(() => options.flatMap(opt => 
        opt.options ? [{ label: opt.label, isGroup: true }, ...opt.options] : opt
    ), [options]);

    const selected = flatOptions.find(o => !o.isGroup && String(o.value) === String(value))
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
            const idealMaxHeight = 260;
            let maxHeight, topStyle, bottomStyle;
            if (spaceBelow >= idealMaxHeight || spaceBelow > spaceAbove) {
                maxHeight = Math.min(idealMaxHeight, spaceBelow - 16);
                topStyle = `${rect.bottom + 4}px`;
                bottomStyle = 'auto';
            }
            else {
                maxHeight = Math.min(idealMaxHeight, spaceAbove - 16);
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
                zIndex: 9999,
                overflowY: 'auto'
            });
        }
    }, [isOpen, flatOptions.length]);

    const handleSelect = (val) => {
        onChange && onChange({ target: { name, value: val } });
        setIsOpen(false);
    };
    return (
        <>
            <div 
                ref={triggerRef}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`select-trigger ${error ? 'border-(--platform-danger)' : ''} ${isOpen ? 'open' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={style}
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {selected?.icon && <selected.icon size={18} className="opacity-80 shrink-0" />}
                    <span className={`truncate ${!selected ? 'text-(--platform-text-secondary)' : ''}`}>{selected?.label || placeholder}</span>
                </div>
                <ChevronDown size={16} className={`text-(--platform-text-secondary) transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && createPortal(
                <div ref={menuRef} className="select-dropdown-menu custom-scrollbar" style={menuStyle}>
                    {flatOptions.length ? flatOptions.map((opt, i) => (
                        opt.isGroup ? (
                            <div key={i} className="text-xs font-bold text-(--platform-text-secondary) uppercase px-3 py-1 mt-1">{opt.label}</div>
                        ) : (
                            <div 
                                key={opt.value} 
                                onClick={() => handleSelect(opt.value)}
                                className={`select-option ${String(opt.value) === String(value) ? 'selected' : ''}`}
                                style={{ paddingLeft: opt.isGroupChild ? '24px' : '12px' }}
                            >
                                {opt.icon && <opt.icon size={16} className={String(opt.value) === String(value) ? 'opacity-100' : 'opacity-70'} />}
                                <span className="flex-1 truncate">{opt.label}</span>
                                {String(opt.value) === String(value) && <Check size={16} />}
                            </div>
                        )
                    )) : <div className="p-3 text-center text-sm opacity-60">Немає варіантів</div>}
                </div>,
                document.body
            )}
        </>
    );
};

export default CustomSelect;