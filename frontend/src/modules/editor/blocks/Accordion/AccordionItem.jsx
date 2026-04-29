// frontend/src/modules/editor/blocks/Accordion/AccordionItem.jsx
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const AccordionItem = ({ item, titleFont, contentFont }) => {
    const [isExpanded, setIsExpanded] = useState(item.isOpenDefault || false);
    useEffect(() => {
        setIsExpanded(item.isOpenDefault || false);
    }, [item.isOpenDefault]);

    const handleClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div 
            className={`
                group relative bg-(--site-card-bg) rounded-xl @3xl:rounded-2xl transition-all duration-300
                border 
                ${isExpanded 
                    ? 'border-(--site-accent)/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.03)] z-10' 
                    : 'border-(--site-border-color) hover:border-(--site-accent)/30 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] z-0'}
            `}
        >
            <div className={`
                absolute left-0 top-3 bottom-3 @3xl:top-4 @3xl:bottom-4 w-1 rounded-r-full transition-all duration-300
                ${isExpanded ? 'bg-(--site-accent) opacity-100' : 'bg-transparent opacity-0'}
            `} />

            <div
                className="js-allow-click flex justify-between items-center px-4 @2xl:px-6 @3xl:px-8 py-4 @3xl:py-5 cursor-pointer select-none gap-3 @2xl:gap-4"
                onClick={handleClick}
                aria-expanded={isExpanded}
            >
                <h4 
                    className={`font-medium m-0 text-base @2xl:text-lg @3xl:text-xl transition-colors leading-tight ${isExpanded ? 'text-(--site-accent)' : 'text-(--site-text-primary)'}`}
                    style={{ fontFamily: titleFont || 'inherit' }}
                >
                    {item.title || 'Питання'}
                </h4>
                <div 
                    className={`
                        flex items-center justify-center shrink-0 transition-transform duration-300 w-8 h-8 @2xl:w-10 @2xl:h-10 rounded-full
                        ${isExpanded 
                            ? 'bg-(--site-accent) text-white rotate-180 shadow-md shadow-(--site-accent)/20' 
                            : 'bg-(--site-bg) text-(--site-text-secondary) group-hover:bg-(--site-accent)/10 group-hover:text-(--site-accent) rotate-0'}
                    `}
                >
                    <ChevronDown size={18} strokeWidth={2.5} className="@2xl:w-5 @2xl:h-5" />
                </div>
            </div>
            <div 
                className="grid transition-all duration-300 ease-in-out"
                style={{ 
                    gridTemplateRows: isExpanded ? '1fr' : '0fr',
                    opacity: isExpanded ? 1 : 0
                }}
            >
                <div className="overflow-hidden">
                    <div 
                        className="px-4 @2xl:px-6 @3xl:px-8 pb-5 @3xl:pb-7 pt-1 text-(--site-text-secondary) leading-relaxed whitespace-pre-wrap text-sm @2xl:text-base @3xl:text-lg"
                        style={{ fontFamily: contentFont || 'inherit' }}
                    >
                        {item.content || 'Відповідь...'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(AccordionItem, (prev, next) => {
    return prev.item.title === next.item.title && 
           prev.item.content === next.item.content && 
           prev.item.isOpenDefault === next.item.isOpenDefault &&
           prev.titleFont === next.titleFont &&
           prev.contentFont === next.contentFont;
});