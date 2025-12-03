// frontend/src/modules/site-editor/blocks/Text/TextBlock.jsx
import React from 'react';

const TextBlock = ({ blockData, isEditorPreview, style }) => {
    const { content, alignment = 'left', style: textTag = 'p', fontFamily } = blockData;
    
    const Tag = ['p', 'h1', 'h2', 'h3'].includes(textTag) ? textTag : 'p';
    
    const textPrimary = 'var(--site-text-primary)';
    const textSecondary = 'var(--site-text-secondary)';
    
    const bgStyle = isEditorPreview ? 'var(--site-card-bg)' : 'transparent';
    const borderStyle = isEditorPreview ? '1px dashed var(--site-border-color)' : 'none';

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
        fontFamily: (fontFamily && fontFamily !== 'global') ? fontFamily : 'var(--site-font-main, inherit)'
    };

    return (
        <div style={{ 
            background: bgStyle,
            border: borderStyle, 
            borderRadius: '8px',
            transition: 'background 0.3s ease',
            paddingLeft: '20px',
            paddingRight: '20px',
            ...style 
        }}>
            <Tag style={blockStyle}>
                {content || (isEditorPreview ? 'Текстовий блок (порожній)' : '')}
            </Tag>
        </div>
    );
};

export default TextBlock;