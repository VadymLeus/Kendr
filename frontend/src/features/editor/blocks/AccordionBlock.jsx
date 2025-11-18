// frontend/src/features/editor/blocks/AccordionBlock.jsx
import React from 'react';
import AccordionItem from './AccordionItem';

const AccordionBlock = ({ blockData, isEditorPreview }) => {
    const { items = [] } = blockData;

    const textSecondary = isEditorPreview ? 'var(--platform-text-secondary)' : 'var(--site-text-secondary)';
    const borderColor = isEditorPreview ? 'var(--platform-border-color)' : 'var(--site-border-color)';

    const containerStyle = {
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        background: isEditorPreview ? 'var(--platform-card-bg)' : 'transparent',
        ...(isEditorPreview && {
             border: `1px dashed ${borderColor}`,
             borderRadius: '8px'
        })
    };

    if (items.length === 0) {
        return (
            <div style={{...containerStyle, textAlign: 'center', padding: '3rem'}}>
                <span style={{fontSize: '2rem'}}>❓</span>
                 <h4 style={{color: 'var(--platform-text-primary)', margin: '1rem 0 0.5rem 0'}}>Акордеон</h4>
                <p style={{color: textSecondary, margin: 0}}>
                     Блок порожній. Додайте елементи у налаштуваннях.
                </p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {items.map((item) => (
                <AccordionItem
                    key={item.id}
                    item={item}
                    isEditorPreview={isEditorPreview}
                />
            ))}
        </div>
    );
};

export default AccordionBlock;