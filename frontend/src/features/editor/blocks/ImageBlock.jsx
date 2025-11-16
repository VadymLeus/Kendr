// frontend/src/features/editor/blocks/ImageBlock.jsx
import React from 'react';
const API_URL = 'http://localhost:5000';

const formatBorderRadius = (radius) => {
    if (!radius) return '0px';
    if (String(radius).match(/^[0-9]+$/)) { 
        return `${radius}px`;
    }
    return radius; 
};

const ImageBlock = ({ blockData, isEditorPreview }) => {
    const { imageUrl, alt, objectFit, borderRadius, link, targetBlank } = blockData;
    const fullUrl = imageUrl?.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`;

    const containerStyle = {
        padding: '20px', 
        textAlign: 'center',
        background: 'transparent',
        ...(isEditorPreview && {
            maxWidth: '600px',
            margin: '0 auto',
            padding: '1rem',
            background: 'var(--platform-bg)',
            border: '1px dashed var(--platform-border-color)'
        })
    };

    const imgStyle = {
        maxWidth: '100%',
        width: '100%', 
        height: 'auto', 
        borderRadius: formatBorderRadius(borderRadius),
        objectFit: objectFit || 'cover',
    };

    if (!imageUrl) {
        return (
            <div style={containerStyle}>
                <div style={{
                    ...imgStyle, 
                    height: '150px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'var(--platform-bg)',
                    border: '1px dashed var(--platform-border-color)',
                    borderRadius: formatBorderRadius(borderRadius),
                    color: 'var(--platform-text-secondary)',
                    fontSize: '1rem'
                }}>
                    🏞️ Немає зображення
                </div>
            </div>
        );
    }

    const imageElement = (
        <img src={fullUrl} alt={alt || ''} style={imgStyle} />
    );

    return (
        <div style={containerStyle}>
            {link ? (
                <a 
                    href={link} 
                    target={targetBlank ? '_blank' : '_self'} 
                    rel={targetBlank ? 'noopener noreferrer' : ''}
                    onClick={isEditorPreview ? (e) => e.preventDefault() : undefined}
                >
                    {imageElement}
                </a>
            ) : (
                imageElement
            )}
        </div>
    );
};
export default ImageBlock;