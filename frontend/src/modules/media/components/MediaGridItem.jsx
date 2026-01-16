// frontend/src/modules/media/components/MediaGridItem.jsx
import React from 'react';
import { Star, File, Video, Play, FileText, Type, Presentation } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const MediaGridItem = ({ file, selected, onSelect, onToggleFavorite, isChecked, onCheck }) => {
    const isImage = file.mime_type.startsWith('image/');
    const isVideo = file.mime_type.startsWith('video/');
    const isFont = file.mime_type.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(file.original_file_name);
    const ext = file.original_file_name.split('.').pop().toLowerCase();
    const isPdf = ext === 'pdf';
    const isWord = ext === 'docx' || ext === 'doc';
    const isPpt = ext === 'pptx' || ext === 'ppt';
    const containerStyle = {
        position: 'relative',
        aspectRatio: '1/1',
        borderRadius: '12px',
        overflow: 'hidden',
        border: selected 
            ? '3px solid var(--platform-accent)' 
            : isChecked 
                ? '2px solid var(--platform-accent)' 
                : '1px solid var(--platform-border-color)',
        background: isChecked ? 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.05)' : 'var(--platform-card-bg)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: selected || isChecked ? 'scale(0.98)' : 'scale(1)',
        boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        userSelect: 'none'
    };

    const infoBarStyle = {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
        padding: '28px 10px 10px', 
        color: 'white',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        opacity: selected || isChecked ? 1 : 0, 
        transition: 'opacity 0.2s',
        zIndex: 10,
        lineHeight: '1.2', 
        pointerEvents: 'none' 
    };

    const favButtonStyle = {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'rgba(0,0,0,0.5)',
        border: 'none',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: file.is_favorite ? '#ecc94b' : 'rgba(255,255,255,0.9)',
        zIndex: 20,
        opacity: file.is_favorite ? 1 : 0,
        transition: 'all 0.2s',
        backdropFilter: 'blur(4px)'
    };

    const checkboxStyle = {
        position: 'absolute',
        top: '8px',
        left: '8px',
        width: '24px',
        height: '24px',
        zIndex: 20,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        background: isChecked ? 'var(--platform-accent)' : 'rgba(255,255,255,0.8)',
        border: isChecked ? 'none' : '1px solid #ccc',
        opacity: isChecked ? 1 : 0, 
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const renderContent = () => {
        if (isImage) {
            return (
                <div style={{ width: '100%', height: '100%', backgroundImage: `url(${API_URL}${file.path_thumb || file.path_full})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            );
        }
        
        if (isVideo) {
            return (
                <div style={{ 
                    width: '100%', height: '100%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    background: '#1a202c',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    <div style={{position: 'absolute', opacity: 0.1, transform: 'scale(1.5)'}}>
                         <Video size={100} color="white" />
                    </div>

                    <div style={{ 
                        background: 'rgba(255,255,255,0.15)', 
                        borderRadius: '50%', 
                        padding: '16px', 
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        zIndex: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Play size={32} color="white" style={{marginLeft: '4px'}}/>
                    </div>
                </div>
            );
        }

        let IconComponent = File;
        let themeColor = 'var(--platform-text-secondary)';
        let bgColor = 'var(--platform-bg)';
        let badgeBg = 'rgba(0,0,0,0.05)';

        if (isPdf) { IconComponent = FileText; themeColor = '#e53e3e'; bgColor = 'rgba(229, 62, 62, 0.04)'; badgeBg = 'rgba(229, 62, 62, 0.1)'; }
        else if (isWord) { IconComponent = FileText; themeColor = '#2b6cb0'; bgColor = 'rgba(43, 108, 176, 0.04)'; badgeBg = 'rgba(43, 108, 176, 0.1)'; }
        else if (isPpt) { IconComponent = Presentation; themeColor = '#dd6b20'; bgColor = 'rgba(221, 107, 32, 0.04)'; badgeBg = 'rgba(221, 107, 32, 0.1)'; }
        else if (isFont) { IconComponent = Type; themeColor = '#38a169'; bgColor = 'rgba(56, 161, 105, 0.04)'; badgeBg = 'rgba(56, 161, 105, 0.1)'; }

        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bgColor, gap: '8px', position: 'relative' }}>
                <div style={{ position: 'absolute', opacity: 0.05, transform: 'scale(3) rotate(-10deg)', pointerEvents: 'none', color: themeColor }}>
                    <IconComponent size={64} />
                </div>
                <div style={{ background: 'var(--platform-card-bg)', borderRadius: '16px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                    <IconComponent size={28} color={themeColor} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 2, background: badgeBg, padding: '4px 10px', borderRadius: '12px', minWidth: '40px', textAlign: 'center' }}>
                    {ext}
                </span>
            </div>
        );
    };

    return (
        <div 
            style={containerStyle}
            onClick={(e) => onSelect(file, e)}
            className="media-item-wrapper"
        >
            <style>{`
                .media-item-wrapper:hover .info-bar { opacity: 1 !important; }
                .media-item-wrapper:hover .fav-btn { opacity: 1 !important; }
                .media-item-wrapper:hover .select-checkbox { opacity: 1 !important; }
                .media-item-wrapper .fav-btn:hover { background: rgba(255, 255, 255, 0.2) !important; color: #ecc94b !important; }
            `}</style>

            <div 
                className="select-checkbox"
                style={checkboxStyle}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onCheck) onCheck(file, e); 
                }}
            >
                {isChecked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                )}
            </div>

            <button 
                className="fav-btn"
                style={favButtonStyle}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(file);
                }}
            >
                <Star size={14} fill={file.is_favorite ? "currentColor" : "none"} />
            </button>

            {renderContent()}

            <div className="info-bar" style={infoBarStyle}>
                {file.display_name}
            </div>
        </div>
    );
};

export default MediaGridItem;