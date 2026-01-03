// frontend/src/modules/site-editor/blocks/Video/VideoBlock.jsx
import React from 'react';

const API_URL = 'http://localhost:5000';
const VideoBlock = ({ blockData, isEditorPreview, style }) => {
    const { 
        url, 
        height = 'medium', 
        overlay_color = '#000000',
        overlay_opacity,
        block_theme = 'auto',
        autoplay = true,
        muted = true,
        loop = true,
        controls = false
    } = blockData;

    const safeOpacity = (overlay_opacity === undefined || isNaN(Number(overlay_opacity))) 
        ? 0.5 
        : Number(overlay_opacity);

    const fullVideoUrl = url 
        ? (url.startsWith('http') ? url : `${API_URL}${url}`) 
        : null;

    const heightMap = { 
        small: '300px', 
        medium: '500px', 
        large: '700px', 
        full: 'calc(100vh - 60px)' 
    };

    const containerStyle = {
        position: 'relative',
        width: '100%',
        height: heightMap[height] || '500px',
        minHeight: '300px',
        backgroundColor: 'var(--site-bg)', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style 
    };

    const isTransparent = overlay_color === 'transparent';

    return (
        <div style={containerStyle} className={`block-theme-${block_theme}`}>
            <div style={{
                position: 'absolute', 
                inset: 0, 
                zIndex: 0
            }}>
                {fullVideoUrl ? (
                    <video
                        src={fullVideoUrl}
                        autoPlay={autoplay}
                        muted={muted}
                        loop={loop}
                        controls={controls}
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover' 
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1a202c',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.4)',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '3rem' }}>▶</span>
                        <span style={{ fontSize: '0.9rem' }}>Додайте відео</span>
                    </div>
                )}
            </div>

            {!isTransparent && (
                <div style={{
                    position: 'absolute', 
                    inset: 0,
                    backgroundColor: overlay_color,
                    opacity: safeOpacity,
                    zIndex: 1,
                    pointerEvents: 'none', 
                    transition: 'background-color 0.3s, opacity 0.3s'
                }}></div>
            )}
        </div>
    );
};

export default VideoBlock;