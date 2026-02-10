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
        <div className="border border-(--site-border-color) rounded-lg mb-3 overflow-hidden bg-(--site-card-bg) transition-all duration-200">
            <div
                className={`
                    flex justify-between items-center px-5 py-4 cursor-pointer bg-transparent select-none
                    ${isExpanded ? 'border-b border-(--site-border-color)' : ''}
                `}
                onClick={handleClick}
                aria-expanded={isExpanded}
            >
                <h4 
                    className="font-semibold text-(--site-text-primary) m-0 text-lg"
                    style={{ fontFamily: titleFont || 'inherit' }}
                >
                    {item.title || 'Питання'}
                </h4>
                <div 
                    className={`
                        text-(--site-accent) flex items-center justify-center transition-transform duration-300
                        ${isExpanded ? 'rotate-180' : 'rotate-0'}
                    `}
                >
                    <ChevronDown size={20} />
                </div>
            </div>
            
            <div 
                className={`
                    px-5 py-6 text-(--site-text-secondary) leading-relaxed whitespace-pre-wrap bg-(--site-bg)
                    ${isExpanded ? 'block' : 'hidden'}
                `}
                style={{ fontFamily: contentFont || 'inherit' }}
            >
                {item.content || 'Відповідь...'}
            </div>
        </div>
    );
};

export default AccordionItem;