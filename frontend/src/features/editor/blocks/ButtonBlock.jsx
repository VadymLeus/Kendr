// frontend/src/features/editor/blocks/ButtonBlock.jsx
import React from 'react';
import { resolveSiteLink } from '../../../utils/linkUtils';

const ButtonBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const { text, link, styleType, alignment, targetBlank } = blockData;

    const themeClass = styleType === 'secondary' ? 'btn-site-secondary' : 'btn-site-primary';

    const containerStyle = {
        padding: '20px',
        textAlign: alignment || 'center',
        background: isEditorPreview ? 'var(--site-card-bg)' : 'transparent',
        border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none',
        borderRadius: isEditorPreview ? '8px' : '0',
        transition: 'all 0.3s ease',
        ...style
    };

    const handleClick = (e) => {
        if (isEditorPreview) {
            e.preventDefault();
        }
    };

    const finalLink = resolveSiteLink(link, siteData?.site_path);

    return (
        <div style={containerStyle}>
            <a 
                href={finalLink} 
                className={`btn-site ${themeClass}`}
                target={targetBlank ? '_blank' : '_self'}
                rel={targetBlank ? 'noopener noreferrer' : ''}
                onClick={handleClick}
                style={{
                    display: 'inline-block',
                    textDecoration: 'none',
                }}
            >
                {text || 'Кнопка'} 
            </a>
        </div>
    );
};

export default ButtonBlock;