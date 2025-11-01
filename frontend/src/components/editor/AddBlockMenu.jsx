// frontend/src/components/editor/AddBlockMenu.jsx
import React from 'react';

const AddBlockMenu = ({ library, onSelect, onClose }) => {
    const modalStyle = {
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--platform-card-bg)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '10px',
        zIndex: 20,
        minWidth: '250px',
        marginTop: '10px',
    };

    const itemStyle = {
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'background-color 0.2s',
    };

    return (
        <div style={modalStyle}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--platform-text-primary)' }}>Оберіть тип блоку</h4>
            {library.map(block => (
                <div 
                    key={block.type} 
                    style={itemStyle} 
                    onClick={() => { onSelect(block.type); onClose(); }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--platform-border-color)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span>{block.icon}</span>
                    <span>{block.name}</span>
                </div>
            ))}
            <button onClick={onClose} style={{ marginTop: '10px', width: '100%' }}>Закрити</button>
        </div>
    );
};

export default AddBlockMenu;
