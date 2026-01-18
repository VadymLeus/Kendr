// frontend/src/modules/media/components/MediaGridItem.jsx
import React from 'react';
import { Star } from 'lucide-react';
import MediaFilePreview from '../../../shared/ui/complex/MediaFilePreview';

const MediaGridItem = ({ file, selected, onSelect, onToggleFavorite, isChecked, onCheck }) => {
    
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

            <MediaFilePreview file={file} />

            <div className="info-bar" style={infoBarStyle}>
                {file.display_name}
            </div>
        </div>
    );
};

export default MediaGridItem;