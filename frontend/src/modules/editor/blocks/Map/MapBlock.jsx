// frontend/src/modules/editor/blocks/Map/MapBlock.jsx
import React from 'react';
import { IconMapPin } from '../../../../shared/ui/elements/Icons';

const parseSrcFromIframe = (embedCode) => {
    if (!embedCode || typeof embedCode !== 'string') return null;
    const match = embedCode.match(/src="([^"]+)"/);
    return (match && match[1]) ? match[1] : null;
};

const MapBlock = ({ blockData, isEditorPreview, style }) => {
    const { embed_code, sizePreset = 'medium' } = blockData;
    const mapSrc = parseSrcFromIframe(embed_code);

    const sizeMap = { small: '400px', medium: '800px', large: '100%' }; 
    const maxWidth = sizeMap[sizePreset] || '800px';

    const wrapperStyle = {
        maxWidth: maxWidth,
        margin: '0 auto',
        width: '100%',
        ...style
    };

    if (!mapSrc) {
        return (
            <div style={{ padding: '20px 0' }}>
                <div style={{
                    ...wrapperStyle,
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: 'var(--site-card-bg)', 
                    border: isEditorPreview ? `1px dashed var(--site-border-color)` : 'none',
                    borderRadius: '8px',
                    color: 'var(--site-text-secondary)',
                    minHeight: '250px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ color: 'var(--site-accent)', opacity: 0.7 }}>
                        <IconMapPin size={48} />
                    </div>
                    <div>
                        <p style={{ margin: '0', fontWeight: '600', color: 'var(--site-text-primary)', fontSize: '1.1rem' }}>
                            Карту не додано
                        </p> 
                        {isEditorPreview && (
                            <small style={{ display:'block', marginTop: '4px', opacity: 0.8 }}>
                                Вставте код iframe у налаштуваннях блоку
                            </small>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    const iframeContent = (
        <iframe
            src={mapSrc}
            width="100%"
            height="450"
            style={{ 
                border: 0, 
                display: 'block', 
                borderRadius: '8px',
                width: '100%',
                height: sizePreset === 'large' ? '500px' : '400px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
        />
    );

    if (isEditorPreview) {
        return (
            <div style={{ padding: '20px 0' }}>
                <div style={{ 
                    ...wrapperStyle,
                    border: `1px dashed var(--site-border-color)`, 
                    padding: '4px',
                    borderRadius: '10px',
                    pointerEvents: 'none',
                }}>
                    {iframeContent}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={wrapperStyle}>
                {iframeContent}
            </div>
        </div>
    );
};

export default MapBlock;