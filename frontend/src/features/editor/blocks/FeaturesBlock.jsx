// frontend/src/features/editor/blocks/FeaturesBlock.jsx
import React from 'react';

const FeaturesBlock = ({ blockData, isEditorPreview, style }) => {
    const { title, items = [], columns = 3 } = blockData;
    const wrapperStyle = {
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: isEditorPreview ? 'var(--site-card-bg)' : 'transparent',
        border: isEditorPreview ? `1px dashed var(--site-border-color)` : 'none',
        borderRadius: isEditorPreview ? '8px' : '0',
        ...style
    };

    const containerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '20px',
    };

    let flexBasis = '30%';
    
    if (columns == 1) {
        flexBasis = '100%';
    } else if (columns == 2) {
        flexBasis = '45%';
    } else if (columns == 4) {
        flexBasis = '22%';
    }

    const itemStyle = {
        background: 'var(--site-card-bg)',
        padding: '1.5rem',
        border: `1px solid var(--site-border-color)`,
        borderRadius: '8px',
        textAlign: 'center',
        boxSizing: 'border-box',
        flexBasis: flexBasis,
        flexGrow: 1,
        minWidth: '220px',
        boxShadow: isEditorPreview ? '0 1px 3px rgba(0,0,0,0.05)' : 'none', 
        transition: 'box-shadow 0.3s'
    };

    return (
        <div style={wrapperStyle}>
            <h2>{title}</h2>
            <div style={containerStyle}>
                {items.map((item, index) => (
                    <div key={item.id || index} style={itemStyle}>
                        <span style={{ fontSize: '2rem', color: 'var(--site-accent)' }}>{item.icon}</span>
                        <h4 style={{ margin: '0.75rem 0 0.5rem 0' }}>{item.title}</h4>
                        <p style={{ margin: 0, color: 'var(--site-text-secondary)' }}>{item.text}</p>
                    </div>
                ))}
            </div>
            {isEditorPreview && items.length === 0 && (
                <div style={{
                    color: 'var(--site-text-secondary)',
                    marginTop: '20px',
                    fontSize: '0.9rem',
                }}>
                    (Блок "Особливості": додайте елементи через налаштування)
                </div>
            )}
        </div>
    );
};

export default FeaturesBlock;