// frontend/src/features/editor/blocks/FeaturesBlock.jsx
import React from 'react';

const FeaturesBlock = ({ blockData, isEditorPreview }) => {
    const { title, items = [], columns = 3 } = blockData;

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
        background: isEditorPreview ?
            'var(--platform-bg)' : 'var(--site-card-bg)',
        padding: '1.5rem',
        border: `1px solid ${isEditorPreview ?
            'var(--platform-border-color)' : 'var(--site-border-color)'}`,
        borderRadius: '8px',
        textAlign: 'center',
        boxSizing: 'border-box',
        flexBasis: flexBasis,
        flexGrow: 1,
        minWidth: '220px'
    };

    return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <h2>{title}</h2>
            <div style={containerStyle}>
                {items.map((item, index) => (
                    <div key={item.id || index} style={itemStyle}>
                        <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                        <h4 style={{ margin: '0.75rem 0 0.5rem 0' }}>{item.title}</h4>
                        <p style={{ margin: 0 }}>{item.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturesBlock;