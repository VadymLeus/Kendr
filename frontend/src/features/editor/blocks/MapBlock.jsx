// frontend/src/features/editor/blocks/MapBlock.jsx
import React from 'react';

const parseSrcFromIframe = (embedCode) => {
    if (!embedCode || typeof embedCode !== 'string') return null;
    const match = embedCode.match(/src="([^"]+)"/);
    return (match && match[1]) ? match[1] : null;
};

const MapBlock = ({ blockData, isEditorPreview }) => {
    const { embed_code, sizePreset = 'medium' } = blockData;
    const mapSrc = parseSrcFromIframe(embed_code);

    const textSecondary = isEditorPreview ? 'var(--platform-text-secondary)' : 'var(--site-text-secondary)';
    const borderColor = isEditorPreview ? 'var(--platform-border-color)' : 'var(--site-border-color)';

    const sizeMap = {
        small: '400px',
        medium: '650px',
        large: '100%',
    };
    const maxWidth = sizeMap[sizePreset] || '650px';

    if (!mapSrc) {
        return (
            <div style={{
                padding: '3rem',
                textAlign: 'center',
                background: isEditorPreview ? 'var(--platform-bg)' : 'transparent',
                border: isEditorPreview ? `1px dashed ${borderColor}` : 'none',
                borderRadius: '8px',
                color: textSecondary,
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <span style={{ fontSize: '2.5rem' }}>🗺️</span>
                <p style={{ margin: '0.5rem 0 0 0', fontWeight: '500' }}>Блок карти</p>
                {isEditorPreview && <small>Вставте код iframe в налаштуваннях блоку.</small>}
            </div>
        );
    }
    
    const iframe = (
        <iframe
            src={mapSrc}
            width="100%"
            height="450"
            style={{ border: 0, display: 'block', borderRadius: '8px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    );

    if (isEditorPreview) {
        return (
            <div style={{ 
                maxWidth: maxWidth,
                margin: '0 auto',
                padding: '20px',
                border: '1px dashed var(--platform-border-color)', 
                borderRadius: '8px', 
                overflow: 'hidden',
                pointerEvents: 'none' 
            }}>
                {iframe}
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 0', maxWidth: maxWidth, margin: '0 auto' }}>
            {iframe}
        </div>
    );
};

export default MapBlock;