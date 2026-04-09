// frontend/src/modules/editor/blocks/Map/MapBlock.jsx
import React from 'react';
import { MapPin } from 'lucide-react';

const parseSrcFromIframe = (embedCode) => {
    if (!embedCode || typeof embedCode !== 'string') return null;
    const match = embedCode.match(/src="([^"]+)"/);
    return (match && match[1]) ? match[1] : null;
};

const MapBlock = ({ blockData, isEditorPreview, style }) => {
    const { embed_code, height = 'medium' } = blockData;
    const mapSrc = parseSrcFromIframe(embed_code);
    const heightClasses = {
        small: 'h-[300px]',
        medium: 'h-[500px]',
        large: 'h-[700px]',
        full: 'h-[calc(100vh-60px)]',
        auto: 'h-[500px]'
    };

    const currentHeightClass = heightClasses[height] || heightClasses.medium;
    if (!mapSrc) {
        return (
            <div 
                className={`
                    w-full bg-(--site-card-bg) text-(--site-text-secondary) flex flex-col items-center justify-center gap-3
                    ${currentHeightClass}
                    ${isEditorPreview ? 'border border-dashed border-(--site-border-color)' : ''}
                `}
                style={style}
            >
                <div className="text-(--site-accent) opacity-70">
                    <MapPin size={48} />
                </div>
                <div className="text-center">
                    <p className="m-0 font-semibold text-(--site-text-primary) text-lg">
                        Карту не додано
                    </p> 
                    {isEditorPreview && (
                        <small className="block mt-1 opacity-80">
                            Вставте код iframe у налаштуваннях блоку
                        </small>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div 
            className={`relative w-full overflow-hidden ${currentHeightClass}`}
            style={style}
        >
            <iframe
                src={mapSrc}
                className="absolute inset-0 w-full h-full border-0"
                style={{
                    pointerEvents: isEditorPreview ? 'none' : 'auto' 
                }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map"
            />
        </div>
    );
};

export default MapBlock;