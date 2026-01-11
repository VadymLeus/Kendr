// frontend/src/modules/site-editor/blocks/Accordion/AccordionBlock.jsx
import React from 'react';
import AccordionItem from './AccordionItem';
import { HelpCircle } from 'lucide-react';

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
                backgroundColor: 'var(--site-card-bg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
            }}>
                <div style={{ color: 'var(--site-accent)', opacity: 0.7 }}>
                     <HelpCircle size={48} />
                </div>
                 <h4 style={{color: 'var(--site-text-primary)', margin: 0}}>Акордеон</h4>
                <p style={{color: 'var(--site-text-secondary)', margin: 0}}>
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