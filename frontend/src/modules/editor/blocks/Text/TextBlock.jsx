// frontend/src/modules/editor/blocks/Text/TextBlock.jsx
import React from 'react';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';

const TextBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const { 
        content = '', 
        tag = 'p', 
        fontFamily, 
        alignment = 'left',
        isBold = false,
        isItalic = false,
        isUnderline = false,
        height = 'small',
        styles = {}
    } = blockData;
    
    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        main: fontFamily
    }, siteData);

    const ValidTag = ['p', 'h1', 'h2', 'h3'].includes(tag) ? tag : 'p';
    const tagBaseStyles = {
        h1: { fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2' },
        h2: { fontSize: '2rem', fontWeight: '700', lineHeight: '1.3' },
        h3: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.4' },
        p:  { fontSize: '1rem', fontWeight: '400', lineHeight: '1.6' }
    };

    const paragraphs = content ? content.split('\n') : [];
    const uniqueClass = `text-scope-${blockData.id || 'preview'}`;
    const heightMap = { 
        small: 'auto', 
        medium: '400px', 
        large: '600px', 
        full: 'calc(100vh - 60px)' 
    };

    return (
        <div 
            className={uniqueClass}
            style={{ 
                width: '100%',
                overflowWrap: 'break-word',
                textAlign: alignment,
                backgroundColor: 'var(--site-bg)',
                color: 'var(--site-text-primary)',
                minHeight: heightMap[height] || 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                ...styles,
                ...style,
                ...cssVariables
            }}
        >
            <RenderFonts />
            <style>{`.${uniqueClass} { ${fontStyles.cssVars || ''} }`}</style>
            
            {paragraphs.length > 0 ? (
                paragraphs.map((line, index) => (
                    <ValidTag 
                        key={index}
                        style={{
                            ...tagBaseStyles[ValidTag],
                            fontFamily: fontStyles.main,
                            fontWeight: isBold ? 'bold' : tagBaseStyles[ValidTag].fontWeight,
                            fontStyle: isItalic ? 'italic' : 'normal',
                            textDecoration: isUnderline ? 'underline' : 'none',
                            
                            color: 'inherit',
                            display: 'block',
                            marginTop: 0,
                            marginBottom: index === paragraphs.length - 1 ? '0' : '1em', 
                            whiteSpace: 'pre-wrap', 
                            minHeight: line.trim() === '' ? '1em' : 'auto'
                        }}
                    >
                        {line || <br/>} 
                    </ValidTag>
                ))
            ) : (
                isEditorPreview && (
                    <div style={{opacity: 0.5, fontStyle: 'italic', padding: '10px 0'}}>
                        Натисніть, щоб додати текст...
                    </div>
                )
            )}
        </div>
    );
};

export default TextBlock;