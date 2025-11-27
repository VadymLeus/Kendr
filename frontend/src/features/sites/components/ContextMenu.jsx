// frontend/src/features/sites/components/ContextMenu.jsx
import React, { useEffect, useRef } from 'react';

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
        backgroundColor: '#2d3748',
        color: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        padding: '6px 0',
        minWidth: '180px',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.1s ease-out'
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
        e.currentTarget.style.backgroundColor = '#4a5568';
    };
    
    const unhoverHandler = (e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
    };

    const deleteHoverHandler = (e) => {
        e.currentTarget.style.backgroundColor = '#e53e3e';
    };

    return (
        <div ref={menuRef} style={menuStyle} className="context-menu">
            <button 
                style={itemStyle} 
                onClick={() => onAction('edit')}
                onMouseEnter={hoverHandler}
                onMouseLeave={unhoverHandler}
            >
                ⚙️ Налаштувати
            </button>
            
            <button 
                style={itemStyle} 
                onClick={() => onAction('duplicate')}
                onMouseEnter={hoverHandler}
                onMouseLeave={unhoverHandler}
            >
                📋 Дублювати
            </button>

            <div style={{ height: '1px', background: '#4a5568', margin: '4px 0' }} />

            <button 
                style={itemStyle} 
                onClick={() => onAction('moveUp')}
                onMouseEnter={hoverHandler}
                onMouseLeave={unhoverHandler}
            >
                ⬆️ Вгору
            </button>
            <button 
                style={itemStyle} 
                onClick={() => onAction('moveDown')}
                onMouseEnter={hoverHandler}
                onMouseLeave={unhoverHandler}
            >
                ⬇️ Вниз
            </button>

            <div style={{ height: '1px', background: '#4a5568', margin: '4px 0' }} />

            <button 
                style={itemStyle} 
                onClick={() => onAction('delete')}
                onMouseEnter={deleteHoverHandler}
                onMouseLeave={unhoverHandler}
            >
                ❌ Видалити
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