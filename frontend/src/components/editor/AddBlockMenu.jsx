// frontend/src/components/editor/AddBlockMenu.jsx
import React, { useState } from 'react';

const AddBlockMenu = ({ library, onSelect, onClose }) => {
    const [showLayoutPresets, setShowLayoutPresets] = useState(false);
    const layoutBlock = library.find(b => b.type === 'layout');

    const handleSelect = (blockType, presetData = null) => {
        if (blockType === 'layout' && !presetData) {
            setShowLayoutPresets(true);
            return;
        }
        onSelect(blockType, presetData);
        onClose();
    };

    const modalStyle = {
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--site-card-bg)',
        border: '1px solid var(--site-border-color)',
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
        color: 'var(--site-text-primary)',
    };

    const subItemStyle = { 
        ...itemStyle, 
        paddingLeft: '30px',
        fontSize: '14px'
    };

    const closeButtonStyle = {
        marginTop: '10px',
        width: '100%',
        padding: '8px 16px',
        backgroundColor: 'var(--site-card-bg)',
        color: 'var(--site-text-primary)',
        border: '1px solid var(--site-border-color)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s ease'
    };

    const handleMouseEnter = (e) => {
        e.currentTarget.style.backgroundColor = 'var(--site-border-color)';
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
    };

    const handleCloseMouseEnter = (e) => {
        e.target.style.backgroundColor = 'var(--site-accent)';
        e.target.style.color = 'var(--site-accent-text)';
        e.target.style.borderColor = 'var(--site-accent)';
    };

    const handleCloseMouseLeave = (e) => {
        e.target.style.backgroundColor = 'var(--site-card-bg)';
        e.target.style.color = 'var(--site-text-primary)';
        e.target.style.borderColor = 'var(--site-border-color)';
    };

    return (
        <div style={modalStyle}>
            <h4 style={{ 
                margin: '0 0 10px 0', 
                color: 'var(--site-text-primary)',
                fontSize: '16px',
                fontWeight: '600'
            }}>
                {showLayoutPresets ? 'Виберіть макет' : 'Виберіть тип блоку'}
            </h4>

            {showLayoutPresets ? (
                <>
                    <div 
                        style={itemStyle}
                        onClick={() => setShowLayoutPresets(false)}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span style={{ fontSize: '18px' }}>⬅️</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Назад</span>
                    </div>
                    {layoutBlock?.presets?.map(preset => (
                        <div
                            key={preset.preset}
                            style={subItemStyle}
                            onClick={() => handleSelect('layout', { preset: preset.preset, columns: preset.columns })}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{preset.name}</span>
                        </div>
                    ))}
                </>
            ) : (
                <>
                    {library.map(block => (
                        <div 
                            key={block.type} 
                            style={itemStyle} 
                            onClick={() => handleSelect(block.type)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span style={{ fontSize: '18px' }}>{block.icon}</span>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{block.name}</span>
                        </div>
                    ))}
                </>
            )}

            <button 
                onClick={onClose} 
                style={closeButtonStyle}
                onMouseEnter={handleCloseMouseEnter}
                onMouseLeave={handleCloseMouseLeave}
            >
                Закрити
            </button>
        </div>
    );
};

export default AddBlockMenu;
