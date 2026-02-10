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
    if (items.length === 0) {
        return (
            <div 
                className={`
                    flex flex-col items-center justify-center gap-3 text-center p-12 
                    border border-dashed border-(--platform-border-color) bg-(--site-card-bg)
                    max-w-225 mx-auto
                    ${isEditorPreview ? 'rounded-lg' : ''}
                `}
                style={style}
            >
                <div className="text-(--site-accent) opacity-70">
                     <HelpCircle size={48} />
                </div>
                 <h4 className="text-(--site-text-primary) m-0 font-medium text-lg">Акордеон</h4>
                <p className="text-(--site-text-secondary) m-0">
                     Блок порожній. Додайте елементи у налаштуваннях.
                </p>
            </div>
        );
    }

    return (
        <div 
            className={`
                p-5 max-w-225 mx-auto bg-transparent
                ${isEditorPreview ? 'border border-dashed border-(--site-border-color) rounded-lg' : ''}
                ${uniqueClass}
            `}
            style={{
                ...style,
                ...cssVariables
            }}
        >
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