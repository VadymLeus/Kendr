// frontend/src/modules/editor/blocks/Video/VideoBlock.jsx
import React, { useRef, useEffect } from 'react';
import { BASE_URL } from '../../../../shared/config';
import { Video as VideoIcon } from 'lucide-react';

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
        ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) 
        : null;
    const fullPosterUrl = poster 
        ? (poster.startsWith('http') ? poster : `${BASE_URL}${poster}`) 
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
    const isTransparent = overlay_color === 'transparent';
    const Placeholder = () => (
        <div className="w-full h-full min-h-75 p-12 text-center bg-(--site-card-bg) border border-dashed border-(--site-border-color) text-(--site-text-secondary) flex flex-col items-center justify-center gap-3 box-border">
            <div className="opacity-40 text-(--site-text-primary)">
                <VideoIcon size={64} />
            </div>
            <div className="text-sm font-medium">
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
                    className="w-full h-full object-cover block"
                />
            );
        }

        if (fullPosterUrl) {
            return (
                <img 
                    src={fullPosterUrl}
                    alt="Video poster"
                    className="w-full h-full object-cover block"
                />
            );
        }
        if (isEditorPreview) {
            return <Placeholder />;
        }

        return <div className="w-full h-full bg-black/10"></div>;
    };

    return (
        <div 
            className={`block-theme-${block_theme} relative w-full overflow-hidden flex flex-col justify-center`}
            style={{
                minHeight: currentHeight,
                backgroundColor: 'var(--site-bg)',
                ...styles,
                ...style 
            }}
        >
            <div 
                className="relative w-full flex-1 flex"
                style={{ height: height === 'auto' ? 'auto' : '100%' }}
            >
                <div className="w-full h-full">
                    {renderContent()}
                </div>

                {(fullVideoUrl || fullPosterUrl) && !isTransparent && (
                    <div 
                        className="absolute inset-0 z-1 pointer-events-none transition-all duration-300"
                        style={{
                            backgroundColor: overlay_color,
                            opacity: safeOpacity,
                        }}
                    ></div>
                )}
            </div>
        </div>
    );
};

export default VideoBlock;