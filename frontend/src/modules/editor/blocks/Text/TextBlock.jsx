// frontend/src/modules/editor/blocks/Text/TextBlock.jsx
import React from 'react';

const API_URL = 'http://localhost:5000';

const TextBlock = ({ blockData, isEditorPreview, style }) => {
    const { content, alignment = 'left', style: textTag = 'p', fontFamily } = blockData;
    
    const Tag = ['p', 'h1', 'h2', 'h3'].includes(textTag) ? textTag : 'p';
    
    const textPrimary = 'var(--site-text-primary)';
    const textSecondary = 'var(--site-text-secondary)';
    
    const bgStyle = isEditorPreview ? 'var(--site-card-bg)' : 'transparent';
    const borderStyle = isEditorPreview ? '1px dashed var(--site-border-color)' : 'none';
    const isCustomFile = fontFamily && (fontFamily.includes('uploads') || fontFamily.includes('http'));
    
    const getFontFamily = (font) => {
        if (font === 'site_heading') return 'var(--site-font-heading, sans-serif)';
        if (font === 'site_body') return 'var(--site-font-body, sans-serif)';
        
        if (isCustomFile) {
            return `CustomFont-${font.replace(/[^a-zA-Z0-9]/g, '-')}`;
        }
        
        if (font && font !== 'global') return font;
        return 'inherit';
    };

    const currentFont = getFontFamily(fontFamily);
    const renderCustomFontStyle = () => {
        if (!isCustomFile) return null;

        let fontUrl = fontFamily;
        if (!fontFamily.startsWith('http')) {
             const path = fontFamily.startsWith('/') ? fontFamily : `/${fontFamily}`;
             fontUrl = `${API_URL}${path}`;
        }

        const fontName = currentFont;
        
        let format = 'truetype';
        if (fontUrl.endsWith('.woff2')) format = 'woff2';
        else if (fontUrl.endsWith('.woff')) format = 'woff';
        else if (fontUrl.endsWith('.otf')) format = 'opentype';

        return (
            <style>{`
                @font-face {
                    font-family: '${fontName}';
                    src: url('${fontUrl}') format('${format}');
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
            `}</style>
        );
    };

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
        fontFamily: currentFont
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
            {renderCustomFontStyle()}
            
            <Tag style={blockStyle}>
                {content || (isEditorPreview ? 'Текстовий блок (порожній)' : '')}
            </Tag>
        </div>
    );
};

export default TextBlock;