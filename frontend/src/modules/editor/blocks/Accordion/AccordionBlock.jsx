// frontend/src/modules/editor/blocks/Accordion/AccordionBlock.jsx
import React from 'react';
import AccordionItem from './AccordionItem';
import { HelpCircle } from 'lucide-react';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';

const AccordionBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const { 
        items = [], 
        titleFontFamily, 
        contentFontFamily,
        height = 'auto'
    } = blockData;

    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        title: titleFontFamily,
        content: contentFontFamily
    }, siteData);
    
    const uniqueClass = `accordion-scope-${blockData.id || 'preview'}`;
    const heightClasses = {
        small: 'min-h-[300px]',
        medium: 'min-h-[500px]',
        large: 'min-h-[700px]',
        full: 'min-h-[calc(100vh-60px)]',
        auto: 'min-h-auto'
    };

    const currentHeightClass = heightClasses[height] || heightClasses.auto;
    if (items.length === 0) {
        return (
            <div 
                className={`
                    flex flex-col items-center justify-center gap-3 text-center p-12 
                    bg-(--site-card-bg) w-full
                    ${currentHeightClass}
                    ${isEditorPreview ? 'border border-dashed border-(--platform-border-color)' : ''}
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
                w-full flex flex-col justify-center py-10
                ${currentHeightClass}
                ${uniqueClass}
            `}
            style={{
                ...style,
                ...cssVariables,
                backgroundColor: 'var(--site-bg)'
            }}
        >
            <RenderFonts />
            <style>{`.${uniqueClass} { ${fontStyles.cssVars || ''} }`}</style>
            <div className="w-full max-w-225 mx-auto flex flex-col gap-3.5 px-5">
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
        </div>
    );
};

export default AccordionBlock;