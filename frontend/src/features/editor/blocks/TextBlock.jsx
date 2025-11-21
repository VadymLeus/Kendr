// frontend/src/features/editor/blocks/TextBlock.jsx
import React from 'react';

const TextBlock = ({ blockData, isEditorPreview }) => {
    const { content, alignment = 'left', style = 'p', fontFamily } = blockData;
    
    const Tag = ['p', 'h1', 'h2', 'h3'].includes(style) ? style : 'p';
    
    const textPrimary = isEditorPreview ? 'var(--platform-text-primary)' : 'var(--site-text-primary)';
    const textSecondary = isEditorPreview ? 'var(--platform-text-secondary)' : 'var(--site-text-secondary)';

    const styleMap = {
        h1: { fontSize: '2.5rem', fontWeight: 'bold', color: textPrimary, margin: '0 0 1rem 0', lineHeight: '1.2' },
        h2: { fontSize: '2rem', fontWeight: 'bold', color: textPrimary, margin: '0 0 1rem 0', lineHeight: '1.3' },
        h3: { fontSize: '1.5rem', fontWeight: 'bold', color: textPrimary, margin: '0 0 1rem 0', lineHeight: '1.4' },
        p: { fontSize: '1rem', color: textSecondary, margin: '0', lineHeight: '1.6' }
    };

    const blockStyle = {
        textAlign: alignment,
        ...(styleMap[Tag] || styleMap.p),
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: (fontFamily && fontFamily !== 'global') ? fontFamily : undefined
    };

    return (
        <div style={{ 
            padding: '20px',
            background: 'transparent',
        }}>
            <Tag style={blockStyle}>
                {content || (isEditorPreview ? 'Текстовий блок' : '')}
            </Tag>
        </div>
    );
};

export default TextBlock;