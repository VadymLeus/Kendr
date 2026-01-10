// frontend/src/modules/site-editor/components/ContextMenu.jsx
import React, { useEffect, useRef } from 'react';
import { IconSettings, IconCopy, IconArrowUp, IconArrowDown, IconTrash } from "../../../shared/ui/elements/Icons";

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

    const menuStyle = {
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 9999,
        backgroundColor: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '6px 0',
        minWidth: '180px',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.1s ease-out',
        border: '1px solid var(--platform-border-color)'
    };

    if (y + 250 > window.innerHeight) {
        menuStyle.top = 'auto';
        menuStyle.bottom = window.innerHeight - y;
    }

    const itemStyle = {
        padding: '10px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        transition: 'background 0.2s',
        border: 'none',
        background: 'transparent',
        color: 'inherit',
        textAlign: 'left',
        width: '100%',
        outline: 'none'
    };

    const hoverHandler = (e) => {
        e.currentTarget.style.backgroundColor = 'var(--platform-bg)';
    };
    
    const unhoverHandler = (e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
    };

    const deleteHoverHandler = (e) => {
        e.currentTarget.style.backgroundColor = '#e53e3e';
        e.currentTarget.style.color = '#fff';
    };

    const deleteUnhoverHandler = (e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'inherit';
    };

    return (
        <div ref={menuRef} style={menuStyle} className="context-menu">
            <button 
                style={itemStyle} 
                onClick={() => onAction('edit')}
                onMouseEnter={hoverHandler}
                onMouseLeave={unhoverHandler}
            >
                <IconSettings size={16} /> Налаштувати
            </button>
            
            <button 
                style={itemStyle} 
                onClick={() => onAction('duplicate')}
                onMouseEnter={hoverHandler}
                onMouseLeave={unhoverHandler}
            >
                <IconCopy size={16} /> Дублювати
            </button>

            <div style={{ height: '1px', background: 'var(--platform-border-color)', margin: '4px 0' }} />

            <button 
                style={itemStyle} 
                onClick={() => onAction('moveUp')}
                onMouseEnter={hoverHandler}
                onMouseLeave={unhoverHandler}
            >
                <IconArrowUp size={16} /> Вгору
            </button>
            <button 
                style={itemStyle} 
                onClick={() => onAction('moveDown')}
                onMouseEnter={hoverHandler}
                onMouseLeave={unhoverHandler}
            >
                <IconArrowDown size={16} /> Вниз
            </button>

            <div style={{ height: '1px', background: 'var(--platform-border-color)', margin: '4px 0' }} />

            <button 
                style={itemStyle} 
                onClick={() => onAction('delete')}
                onMouseEnter={deleteHoverHandler}
                onMouseLeave={deleteUnhoverHandler}
            >
                <IconTrash size={16} /> Видалити
            </button>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ContextMenu;