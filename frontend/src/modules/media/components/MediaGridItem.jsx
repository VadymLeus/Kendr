// frontend/src/modules/media/components/MediaGridItem.jsx
import React, { memo } from 'react';
import { Star } from 'lucide-react';
import MediaFilePreview from '../../../shared/ui/complex/MediaFilePreview';

const MediaGridItem = memo(({ file, selected, onSelect, onToggleFavorite, isChecked, onCheck }) => {
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
        transition: 'all 0.1s ease-in-out',
        transform: selected || isChecked ? 'scale(0.98)' : 'scale(1)',
        boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        userSelect: 'none'
    };

    const infoBarStyle = {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
        padding: '28px 10px 10px', color: 'white', fontSize: '0.85rem',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        opacity: selected || isChecked ? 1 : 0, 
        transition: 'opacity 0.2s', zIndex: 10, pointerEvents: 'none'
    };

    const actionBtnStyle = (active) => ({
        position: 'absolute', width: '28px', height: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 20, transition: 'all 0.2s',
        opacity: active ? 1 : 0
    });

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
            `}</style>

            <button 
                className="fav-btn"
                style={{
                    ...actionBtnStyle(file.is_favorite),
                    top: '8px', 
                    left: '8px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)', border: 'none',
                    color: file.is_favorite ? '#ecc94b' : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(4px)'
                }}
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(file); }}
            >
                <Star size={14} fill={file.is_favorite ? "currentColor" : "none"} />
            </button>

            <div 
                className="select-checkbox"
                style={{
                    ...actionBtnStyle(isChecked),
                    top: '8px', 
                    right: '8px',
                    borderRadius: '6px',
                    background: isChecked ? 'var(--platform-accent)' : 'rgba(255,255,255,0.8)',
                    border: isChecked ? 'none' : '1px solid #ccc',
                }}
                onClick={(e) => { e.stopPropagation(); onCheck(file, e); }}
            >
                {isChecked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                )}
            </div>

            <MediaFilePreview file={file} />

            <div className="info-bar" style={infoBarStyle}>
                {file.display_name}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.selected === nextProps.selected &&
        prevProps.isChecked === nextProps.isChecked &&
        prevProps.file.is_favorite === nextProps.file.is_favorite &&
        prevProps.file.id === nextProps.file.id
    );
});

export default MediaGridItem;