// frontend/src/modules/site-editor/blocks/Accordion/AccordionItem.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const AccordionItem = ({ item, isEditorPreview }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const borderColor = 'var(--site-border-color)';
    const headerBg = 'var(--site-card-bg)'; 
    const bodyBg = 'var(--site-bg)';
    const textPrimary = 'var(--site-text-primary)';
    const textSecondary = 'var(--site-text-secondary)';
    const accent = 'var(--site-accent)';

    const itemStyle = {
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        background: headerBg, 
        transition: 'all 0.2s ease'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        cursor: 'pointer',
        background: 'transparent',
        borderBottom: isExpanded ? `1px solid ${borderColor}` : 'none',
        userSelect: 'none'
    };

    const titleStyle = {
        fontWeight: '600',
        color: textPrimary,
        margin: 0,
        fontFamily: 'inherit',
        fontSize: '1.1rem'
    };

    const iconWrapperStyle = {
        color: accent,
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const bodyStyle = {
        padding: '1.5rem 1.25rem',
        color: textSecondary,
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        display: isExpanded ? 'block' : 'none',
        backgroundColor: bodyBg,
        fontFamily: 'inherit'
    };

    const handleClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div style={itemStyle}>
            <div
                style={headerStyle}
                onClick={handleClick}
                aria-expanded={isExpanded}
            >
                <h4 style={titleStyle}>{item.title || 'Питання'}</h4>
                <div style={iconWrapperStyle}>
                    <ChevronDown size={20} />
                </div>
            </div>
            {isExpanded && (
                 <div style={bodyStyle}>
                    {item.content || 'Відповідь...'}
                </div>
            )}
        </div>
    );
};

export default AccordionItem;