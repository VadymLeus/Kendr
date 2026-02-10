// frontend/src/modules/editor/blocks/Map/MapBlock.jsx
import React from 'react';
import { MapPin } from 'lucide-react';

const parseSrcFromIframe = (embedCode) => {
    if (!embedCode || typeof embedCode !== 'string') return null;
    const match = embedCode.match(/src="([^"]+)"/);
    return (match && match[1]) ? match[1] : null;
};

const MapBlock = ({ blockData, isEditorPreview, style }) => {
    const { embed_code, sizePreset = 'medium' } = blockData;
    const mapSrc = parseSrcFromIframe(embed_code);
    const maxWidthClasses = {
        small: 'max-w-[400px]',
        medium: 'max-w-[800px]',
        large: 'max-w-full'
    };
    
    const wrapperClass = `mx-auto w-full ${maxWidthClasses[sizePreset] || 'max-w-[800px]'}`;
    if (!mapSrc) {
        return (
            <div className="py-5">
                <div 
                    className={`
                        py-10 px-5 text-center bg-(--site-card-bg) rounded-lg text-(--site-text-secondary) min-h-62.5 flex flex-col items-center justify-center gap-3
                        ${wrapperClass}
                        ${isEditorPreview ? 'border border-dashed border-(--site-border-color)' : ''}
                    `}
                    style={style}
                >
                    <div className="text-(--site-accent) opacity-70">
                        <MapPin size={48} />
                    </div>
                    <div>
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
            </div>
        );
    }
    
    const iframeContent = (
        <iframe
            src={mapSrc}
            className={`
                border-0 block w-full rounded-lg shadow-sm
                ${sizePreset === 'large' ? 'h-125' : 'h-100'}
            `}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
        />
    );

    if (isEditorPreview) {
        return (
            <div className="py-5">
                <div 
                    className={`
                        border border-dashed border-(--site-border-color) p-1 rounded-xl pointer-events-none
                        ${wrapperClass}
                    `}
                    style={style}
                >
                    {iframeContent}
                </div>
            </div>
        );
    }

    return (
        <div className="py-5">
            <div className={wrapperClass} style={style}>
                {iframeContent}
            </div>
        </div>
    );
};

export default MapBlock;