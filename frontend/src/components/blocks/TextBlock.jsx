// frontend/src/components/blocks/TextBlock.jsx
import React from 'react';

const TextBlock = ({ blockData, isEditorPreview }) => {
    const { headerTitle, aboutText } = blockData;

    const textPrimary = isEditorPreview ? 'var(--platform-text-primary)' : 'var(--site-text-primary)';
    const textSecondary = isEditorPreview ? 'var(--platform-text-secondary)' : 'var(--site-text-secondary)';
    
    return (
        <div style={{ 
            padding: '20px',
            background: 'transparent',
        }}>
            <h2 style={{ 
                margin: '0 0 10px 0',
                color: textPrimary
            }}>{headerTitle}</h2>
            <p style={{ 
                margin: '0', 
                color: textSecondary
            }}>{aboutText}</p>
        </div>
    );
};
export default TextBlock;