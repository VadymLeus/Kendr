// frontend/src/modules/editor/blocks/Accordion/AccordionBlock.jsx
import React from 'react';
import AccordionItem from './AccordionItem';
import { HelpCircle } from 'lucide-react';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';

const AccordionBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const { 
        items = [], 
        titleFontFamily, 
        contentFontFamily 
    } = blockData;

    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        title: titleFontFamily,
        content: contentFontFamily
    }, siteData);
    
    const uniqueClass = `accordion-scope-${blockData.id || 'preview'}`;

    const containerStyle = {
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        background: 'transparent',
        border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none',
        borderRadius: isEditorPreview ? '8px' : '0',
        ...style,
        ...cssVariables
    };

    if (items.length === 0) {
        return (
            <div style={{
                ...containerStyle, 
                textAlign: 'center', 
                padding: '3rem',
                border: '1px dashed var(--platform-border-color)',
                backgroundColor: 'var(--site-card-bg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
            }}>
                <div style={{ color: 'var(--site-accent)', opacity: 0.7 }}>
                     <HelpCircle size={48} />
                </div>
                 <h4 style={{color: 'var(--site-text-primary)', margin: 0}}>Акордеон</h4>
                <p style={{color: 'var(--site-text-secondary)', margin: 0}}>
                     Блок порожній. Додайте елементи у налаштуваннях.
                </p>
            </div>
        );
    }

    return (
        <div style={containerStyle} className={uniqueClass}>
            <RenderFonts />
            <style>{`.${uniqueClass} { ${fontStyles.cssVars || ''} }`}</style>

            {items.map((item) => (
                <AccordionItem
                    key={item.id}
                    item={item}
                    isEditorPreview={isEditorPreview}
                    titleFont={fontStyles.title}
                    contentFont={fontStyles.content}
                />
            ))}
        </div>
    );
};

export default AccordionBlock;