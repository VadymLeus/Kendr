// frontend/src/features/editor/blocks/AccordionItem.jsx
import React, { useState } from 'react';

const AccordionItem = ({ item, isEditorPreview }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const borderColor = isEditorPreview ? 'var(--platform-border-color)' : 'var(--site-border-color)';
    const headerBg = isEditorPreview ? 'var(--platform-bg)' : 'var(--site-card-bg)';
    const bodyBg = isEditorPreview ? 'var(--platform-card-bg)' : 'var(--site-bg)';
    const textPrimary = isEditorPreview ? 'var(--platform-text-primary)' : 'var(--site-text-primary)';
    const textSecondary = isEditorPreview ? 'var(--platform-text-secondary)' : 'var(--site-text-secondary)';
    const accent = isEditorPreview ? 'var(--platform-accent)' : 'var(--site-accent)';

    const itemStyle = {
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        background: bodyBg,
        transition: 'all 0.2s ease'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        cursor: 'pointer',
        background: headerBg,
        borderBottom: isExpanded ? `1px solid ${borderColor}` : 'none',
        userSelect: 'none'
    };

    const titleStyle = {
        fontWeight: '600',
        color: textPrimary,
        margin: 0
    };

    const iconStyle = {
        fontSize: '1.2rem',
        color: accent,
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease'
    };

    const bodyStyle = {
        padding: '1.5rem 1.25rem',
        color: textSecondary,
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        display: isExpanded ? 'block' : 'none'
    };

    return (
        <div style={itemStyle}>
            <div
                style={headerStyle}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={`accordion-content-${item.id}`}
                id={`accordion-title-${item.id}`}
            >
                <h4 style={titleStyle}>{item.title || 'Питання'}</h4>
                <span style={iconStyle}>▼</span>
            </div>
            <div
                style={bodyStyle}
                role="region"
                aria-labelledby={`accordion-title-${item.id}`}
                id={`accordion-content-${item.id}`}
            >
                {item.content || 'Відповідь...'}
            </div>
        </div>
    );
};

export default AccordionItem;