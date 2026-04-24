// frontend/src/modules/media/components/MediaGridItem.jsx
import React, { memo } from 'react';
import MediaFilePreview from '../../../shared/ui/complex/MediaFilePreview';
import { Star } from 'lucide-react';

const MediaGridItem = memo(({ file, selected, onSelect, onToggleFavorite, isChecked, onCheck }) => {
    return (
        <div 
            className={`
                group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-150 select-none
                ${selected ? 'border-[3px] border-(--platform-accent) scale-[0.98] shadow-md' : 
                  isChecked ? 'border-2 border-(--platform-accent) scale-[0.98] bg-[color-mix(in_srgb,var(--platform-accent),transparent_90%)]' : 
                  'border border-(--platform-border-color) bg-(--platform-card-bg)'}
            `}
            style={{ backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')" }}
            onClick={(e) => onSelect(file, e)}
        >
            <button 
                className={`
                    absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-none z-20 backdrop-blur-sm transition-all duration-200
                    ${file.is_favorite ? 'bg-black/60 text-yellow-400 opacity-100' : 'bg-black/40 text-white/90 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/60'}
                `}
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(file); }}
            >
                <Star size={14} fill={file.is_favorite ? "currentColor" : "none"} className="shrink-0" />
            </button>
            <div 
                className={`
                    absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center z-20 transition-all duration-200
                    ${isChecked ? 'bg-(--platform-accent) border-none text-white opacity-100' : 'bg-white/80 border border-gray-300 text-gray-800 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white'}
                `}
                onClick={(e) => { e.stopPropagation(); onCheck(file, e); }}
            >
                {isChecked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                )}
            </div>
            <div className="w-full h-full">
                <MediaFilePreview file={file} />
            </div>
            <div className={`
                absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/85 via-black/50 to-transparent p-2.5 pt-6 text-white text-[11px] sm:text-xs whitespace-nowrap overflow-hidden text-ellipsis z-10 transition-opacity duration-200 pointer-events-none
                ${selected || isChecked ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}
            `}>
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