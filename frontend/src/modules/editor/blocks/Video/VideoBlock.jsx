// frontend/src/modules/editor/blocks/Video/VideoBlock.jsx
import React, { useRef, useEffect } from 'react';
import { Video as VideoIcon } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const VideoBlock = ({ blockData, isEditorPreview, style }) => {
    const { 
        url, 
        poster,
        height = 'medium', 
        overlay_color = '#000000',
        overlay_opacity,
        block_theme = 'auto',
        autoplay = true,
        muted = true,
        loop = true,
        controls = false,
        styles = {}
    } = blockData;

    const videoRef = useRef(null);
    const safeOpacity = (overlay_opacity === undefined || isNaN(Number(overlay_opacity))) 
        ? 0.5 
        : Number(overlay_opacity);

    const fullVideoUrl = url 
        ? (url.startsWith('http') ? url : `${API_URL}${url}`) 
        : null;

    const fullPosterUrl = poster 
        ? (poster.startsWith('http') ? poster : `${API_URL}${poster}`) 
        : null;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (!controls && autoplay) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    if (muted) {
                        video.muted = true;
                        video.play().catch(e => console.error(e));
                    }
                });
            }
        }
    }, [controls, autoplay, muted, fullVideoUrl]);

    const heightMap = { 
        small: '300px', 
        medium: '500px', 
        large: '700px', 
        full: 'calc(100vh - 60px)',
        auto: 'auto'
    };

    const currentHeight = heightMap[height] || '500px';
    const containerStyle = {
        position: 'relative',
        width: '100%',
        minHeight: currentHeight,
        backgroundColor: 'var(--site-bg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        ...styles,
        ...style 
    };

    const isTransparent = overlay_color === 'transparent';
    const Placeholder = () => (
        <div style={{
            width: '100%',
            height: '100%',
            minHeight: '300px',
            padding: '3rem', 
            textAlign: 'center', 
            background: 'var(--site-card-bg, #f9f9f9)', 
            border: `1px dashed var(--site-border-color, #ccc)`,
            color: 'var(--site-text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxSizing: 'border-box'
        }}>
            <div style={{ opacity: 0.4, color: 'var(--site-text-primary)' }}>
                <VideoIcon size={64} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Відео не вибрано
            </div>
        </div>
    );

    const renderContent = () => {
        if (fullVideoUrl) {
            return (
                <video
                    ref={videoRef}
                    src={fullVideoUrl}
                    poster={fullPosterUrl}
                    autoPlay={autoplay}
                    muted={muted}
                    loop={loop}
                    controls={controls}
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                    }}
                />
            );
        }

        if (fullPosterUrl) {
            return (
                <img 
                    src={fullPosterUrl}
                    alt="Video poster"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                    }}
                />
            );
        }

        if (isEditorPreview) {
            return <Placeholder />;
        }

        return <div style={{ width: '100%', height: '100%', background: '#000', opacity: 0.1 }}></div>;
    };

    return (
        <div style={containerStyle} className={`block-theme-${block_theme}`}>
            <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: height === 'auto' ? 'auto' : '100%', 
                flex: 1, 
                display: 'flex'
            }}>
                <div style={{ width: '100%', height: '100%' }}>
                    {renderContent()}
                </div>

                {(fullVideoUrl || fullPosterUrl) && !isTransparent && (
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
        </div>
    );
};

export default VideoBlock;