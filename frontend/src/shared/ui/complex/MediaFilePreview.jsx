// frontend/src/shared/ui/complex/MediaFilePreview.jsx
import React from 'react';
import { Play, Video } from 'lucide-react';
import { API_URL, checkeredStyle, getFileConfig, getFileExtension } from '../../../shared/utils/mediaUtils';

const MediaFilePreview = ({ file, className = '', style = {}, showVideoControls = false, onVideoMetadata }) => {
    const config = getFileConfig(file);
    const ext = getFileExtension(file.original_file_name);
    const baseStyle = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 'inherit',
        ...style
    };

    if (config.type === 'image') {
        return (
            <div style={{ ...baseStyle, ...checkeredStyle }} className={className}>
                <img 
                    src={`${API_URL}${file.path_full}`} 
                    alt={file.display_name} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
            </div>
        );
    }

    if (config.type === 'video') {
        if (showVideoControls) {
            return (
                <div style={{ ...baseStyle, background: '#000' }} className={className}>
                    <video 
                        src={`${API_URL}${file.path_full}`} 
                        controls 
                        autoPlay 
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onLoadedMetadata={onVideoMetadata}
                    />
                </div>
            );
        }

        return (
            <div style={{ ...baseStyle, background: '#1a202c' }} className={className}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div style={{ position: 'absolute', opacity: 0.1, transform: 'scale(1.5)' }}>
                    <Video size={80} color="white" />
                </div>
                <div style={{ 
                    background: 'rgba(255,255,255,0.15)', 
                    borderRadius: '50%', 
                    padding: '12px', 
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    zIndex: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Play size={24} color="white" style={{ marginLeft: '4px' }}/>
                </div>
                <span style={{ 
                    position: 'absolute', bottom: '10px', 
                    fontSize: '0.65rem', fontWeight: '700', 
                    color: 'rgba(255,255,255,0.8)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px', 
                    zIndex: 2, 
                    background: 'rgba(0,0,0,0.5)', 
                    padding: '2px 8px', 
                    borderRadius: '4px' 
                }}>
                    {ext}
                </span>
            </div>
        );
    }

    const { IconComponent, themeColor, bgColor, badgeBg } = config;

    return (
        <div style={{ 
            ...baseStyle,
            flexDirection: 'column', 
            background: bgColor, 
            gap: '8px'
        }} className={className}>
            <div style={{ 
                position: 'absolute', 
                top: '50%', left: '50%', 
                transform: 'translate(-50%, -50%) scale(3) rotate(-10deg)', 
                opacity: 0.07, 
                pointerEvents: 'none', 
                color: themeColor 
            }}>
                <IconComponent size={64} />
            </div>

            <div style={{ 
                background: 'var(--platform-card-bg)', 
                borderRadius: '12px', 
                padding: '8px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                position: 'relative', zIndex: 2 
            }}>
                <IconComponent size={24} color={themeColor} />
            </div>

            <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: '700', 
                color: themeColor, 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px', 
                zIndex: 2, 
                background: badgeBg, 
                padding: '2px 8px', 
                borderRadius: '8px', 
                minWidth: '36px', 
                textAlign: 'center' 
            }}>
                {ext}
            </span>
        </div>
    );
};

export default MediaFilePreview;