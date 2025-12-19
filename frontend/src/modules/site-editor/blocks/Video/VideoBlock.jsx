// frontend/src/modules/site-editor/blocks/Video/VideoBlock.jsx
import React from 'react';

const API_URL = 'http://localhost:5000';

const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/')) return null;

    let embedUrl = null;
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.substring(1);
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        else if (urlObj.hostname.includes('vimeo.com')) {
            videoId = urlObj.pathname.substring(1);
            if (videoId && /^[0-9]+$/.test(videoId)) {
                embedUrl = `https://player.vimeo.com/video/${videoId}`;
            }
        }
    } catch (e) { return null; }
    return embedUrl;
};

const VideoBlock = ({ blockData, isEditorPreview, style }) => {
    const { url, sizePreset = 'medium' } = blockData;
    const embedUrl = getEmbedUrl(url);
    
    const isLocalVideo = url && (url.startsWith('/') || url.match(/\.(mp4|webm|ogg|mov)$/i));

    const textSecondary = 'var(--site-text-secondary)';
    const borderColor = 'var(--site-border-color)';
    const cardBg = 'var(--site-card-bg)';

    const sizeMap = { small: '400px', medium: '650px', large: '100%' };
    const maxWidth = sizeMap[sizePreset] || '650px';

    const wrapperStyle = {
        width: '100%',
        maxWidth: maxWidth,
        margin: '0 auto',
        background: isEditorPreview ? cardBg : 'transparent',
        borderRadius: '8px',
        overflow: 'hidden',
        border: isEditorPreview ? `1px dashed ${borderColor}` : 'none',
        ...style
    };

    const responsiveContainerStyle = {
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%',
        height: 0,
        backgroundColor: '#000'
    };

    const elementStyle = {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none'
    };

    if (!embedUrl && !isLocalVideo) {
        return (
            <div style={{
                ...wrapperStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                maxHeight: '300px',
                border: `1px dashed ${borderColor}`,
                backgroundColor: cardBg,
                padding: '20px',
                boxSizing: 'border-box'
            }}>
                <div style={{ textAlign: 'center', color: textSecondary }}>
                    <span style={{ fontSize: '2rem' }}>🎬</span>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--site-text-primary)' }}>Блок Відео</p>
                    <small style={{ color: textSecondary }}>Оберіть відео з бібліотеки або вставте посилання (YouTube, Vimeo).</small>
                </div>
            </div>
        );
    }

    if (isEditorPreview) {
        return (
            <div style={{ padding: '20px 0' }}> 
                <div style={wrapperStyle}>
                    <div style={responsiveContainerStyle}>
                        <div style={{
                            ...elementStyle, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: '#222', 
                            color: 'white', 
                            padding: '1rem', 
                            textAlign: 'center'
                        }}>
                            <span style={{ fontSize: '2.5rem' }}>{isLocalVideo ? '📹' : '▶️'}</span>
                            <p style={{ margin: '0.5rem 0 0 0' }}>
                                {isLocalVideo ? 'Локальне відео' : 'Зовнішнє відео'}
                            </p>
                            <small style={{ wordBreak: 'break-all', opacity: 0.7, fontSize: '0.75rem' }}>
                                {url}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={wrapperStyle}>
                <div style={responsiveContainerStyle}>
                    {isLocalVideo ? (
                        <video 
                            src={url.startsWith('http') ? url : `${API_URL}${url}`} 
                            controls 
                            playsInline
                            style={{...elementStyle, objectFit: 'contain'}}
                        />
                    ) : (
                        <iframe
                            style={elementStyle}
                            src={embedUrl}
                            title="Embedded video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoBlock;