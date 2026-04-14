// frontend/src/modules/editor/blocks/Accordion/AccordionItem.jsx
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const AccordionItem = ({ item, isEditorPreview, titleFont, contentFont }) => {
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
                group relative bg-(--site-card-bg) rounded-2xl transition-all duration-300
                border 
                ${isExpanded 
                    ? 'border-(--site-accent)/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.03)] z-10' 
                    : 'border-(--site-border-color) hover:border-(--site-accent)/30 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] z-0'}
            `}
        >
            <div className={`
                absolute left-0 top-4 bottom-4 w-0.75 rounded-r-full transition-all duration-300
                ${isExpanded ? 'bg-(--site-accent) opacity-100' : 'bg-transparent opacity-0'}
            `} />

            <div
                className="flex justify-between items-center px-6 md:px-8 py-5 cursor-pointer select-none gap-4"
                onClick={handleClick}
                aria-expanded={isExpanded}
            >
                <h4 
                    className={`font-medium m-0 text-lg md:text-xl transition-colors leading-tight ${isExpanded ? 'text-(--site-accent)' : 'text-(--site-text-primary)'}`}
                    style={{ fontFamily: titleFont || 'inherit' }}
                >
                    {item.title || 'Питання'}
                </h4>
                <div 
                    className={`
                        flex items-center justify-center shrink-0 transition-all duration-300 w-10 h-10 rounded-full
                        ${isExpanded 
                            ? 'bg-(--site-accent) text-white rotate-180 shadow-md shadow-(--site-accent)/20' 
                            : 'bg-(--site-bg) text-(--site-text-secondary) group-hover:bg-(--site-accent)/10 group-hover:text-(--site-accent) rotate-0'}
                    `}
                >
                    <ChevronDown size={20} strokeWidth={2.5} />
                </div>
            </div>
            <div 
                className={`
                    px-6 md:px-8 pb-7 pt-1 text-(--site-text-secondary) leading-relaxed whitespace-pre-wrap text-base md:text-lg
                    ${isExpanded ? 'block animate-in fade-in slide-in-from-top-3 duration-300' : 'hidden'}
                `}
                style={{ fontFamily: contentFont || 'inherit' }}
            >
                {item.content || 'Відповідь...'}
            </div>
        </div>
    );
};

export default AccordionItem;