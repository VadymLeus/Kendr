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
                rounded-xl overflow-hidden bg-(--site-card-bg) transition-all duration-300
                border border-transparent hover:border-(--site-accent)/20
                shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgba(255,255,255,0.02)]
            `}
        >
            <div
                className={`
                    flex justify-between items-center px-6 py-5 cursor-pointer bg-transparent select-none transition-colors
                    hover:bg-black/2 dark:hover:bg-white/2
                `}
                onClick={handleClick}
                aria-expanded={isExpanded}
            >
                <h4 
                    className={`font-semibold text-(--site-text-primary) m-0 text-lg transition-colors ${isExpanded ? 'text-(--site-accent)' : ''}`}
                    style={{ fontFamily: titleFont || 'inherit' }}
                >
                    {item.title || 'Питання'}
                </h4>
                <div 
                    className={`
                        flex items-center justify-center transition-all duration-300 w-8 h-8 rounded-full
                        ${isExpanded ? 'text-(--site-accent) bg-(--site-accent)/10 rotate-180' : 'text-(--site-text-secondary) bg-black/5 dark:bg-white/5 rotate-0'}
                    `}
                >
                    <ChevronDown size={18} />
                </div>
            </div>
            <div 
                className={`
                    px-6 pb-6 pt-1 text-(--site-text-secondary) leading-relaxed whitespace-pre-wrap text-base
                    ${isExpanded ? 'block animate-in fade-in slide-in-from-top-2' : 'hidden'}
                `}
                style={{ fontFamily: contentFont || 'inherit' }}
            >
                {item.content || 'Відповідь...'}
            </div>
        </div>
    );
};

export default AccordionItem;