// frontend/src/modules/editor/ui/ContextMenu.jsx
import React, { useEffect, useRef } from 'react';
import { Settings, Copy, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

const ContextMenu = ({ x, y, visible, onClose, onAction }) => {
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        
        const handleScroll = () => onClose();
        if (visible) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('contextmenu', handleClickOutside);
            window.addEventListener('scroll', handleScroll, { capture: true });
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('contextmenu', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, { capture: true });
        };
    }, [visible, onClose]);

    if (!visible) return null;
    const positionStyle = {
        top: y,
        left: x,
    };

    if (y + 250 > window.innerHeight) {
        positionStyle.top = 'auto';
        positionStyle.bottom = window.innerHeight - y;
    }

    const itemClass = "w-full text-left px-4 py-2.5 cursor-pointer flex items-center gap-2.5 text-sm transition-colors duration-200 border-none bg-transparent text-inherit hover:bg-(--platform-bg) focus:outline-none";
    const deleteItemClass = "w-full text-left px-4 py-2.5 cursor-pointer flex items-center gap-2.5 text-sm transition-colors duration-200 border-none bg-transparent text-inherit hover:bg-(--platform-danger) hover:text-white focus:outline-none";

    return (
        <div 
            ref={menuRef} 
            style={positionStyle} 
            className="fixed z-9999 bg-(--platform-card-bg) text-(--platform-text-primary) rounded-lg shadow-xl py-1.5 min-w-45 flex flex-col border border-(--platform-border-color) animate-in fade-in zoom-in-95 duration-100"
        >
            <button 
                className={itemClass}
                onClick={() => onAction('edit')}
            >
                <Settings size={16} /> Налаштувати
            </button>
            
            <button 
                className={itemClass}
                onClick={() => onAction('duplicate')}
            >
                <Copy size={16} /> Дублювати
            </button>

            <div className="h-px bg-(--platform-border-color) my-1" />

            <button 
                className={itemClass}
                onClick={() => onAction('moveUp')}
            >
                <ArrowUp size={16} /> Вгору
            </button>
            <button 
                className={itemClass}
                onClick={() => onAction('moveDown')}
            >
                <ArrowDown size={16} /> Вниз
            </button>

            <div className="h-px bg-(--platform-border-color) my-1" />

            <button 
                className={deleteItemClass}
                onClick={() => onAction('delete')}
            >
                <Trash2 size={16} /> Видалити
            </button>
        </div>
    );
};

export default ContextMenu;