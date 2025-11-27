// frontend/src/features/editor/blocks/AccordionBlock.jsx
import React from 'react';
import AccordionItem from './AccordionItem';

const AccordionBlock = ({ blockData, isEditorPreview, style }) => {
    const { items = [], fontFamily } = blockData;
    
    const containerStyle = {
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        background: 'transparent',
        fontFamily: (fontFamily && fontFamily !== 'global') ? fontFamily : 'var(--site-font-main, inherit)',
        
        border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none',
        borderRadius: isEditorPreview ? '8px' : '0',
        ...style
    };

    if (items.length === 0) {
        return (
            <div style={{
                ...containerStyle, 
                textAlign: 'center', 
                padding: '3rem',
                border: '1px dashed var(--platform-border-color)',
                backgroundColor: 'rgba(0,0,0,0.02)'
            }}>
                <span style={{fontSize: '2rem'}}>❓</span>
                 <h4 style={{color: 'var(--platform-text-primary)', margin: '1rem 0 0.5rem 0'}}>Акордеон</h4>
                <p style={{color: 'var(--platform-text-secondary)', margin: 0}}>
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