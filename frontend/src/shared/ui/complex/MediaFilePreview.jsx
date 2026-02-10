// frontend/src/shared/ui/complex/MediaFilePreview.jsx
import React from 'react';
import { API_URL, getFileConfig, getFileExtension } from '../../../shared/utils/mediaUtils';
import { Play, Video } from 'lucide-react';

const MediaFilePreview = ({ file, className = '', style = {}, showVideoControls = false, onVideoMetadata }) => {
    const config = getFileConfig(file);
    const ext = getFileExtension(file.original_file_name);
    const containerClasses = `w-full h-full flex items-center justify-center overflow-hidden relative rounded-[inherit] ${className}`;
    if (config.type === 'image') {
        return (
            <div 
                className={containerClasses}
                style={style} 
            >
                <img 
                    src={`${API_URL}${file.path_full}`} 
                    alt={file.display_name} 
                    className="w-full h-full object-contain"
                />
            </div>
        );
    }

    if (config.type === 'video') {
        if (showVideoControls) {
            return (
                <div 
                    className={`${containerClasses} bg-black`}
                    style={style}
                >
                    <video 
                        src={`${API_URL}${file.path_full}`} 
                        controls 
                        autoPlay 
                        muted
                        className="w-full h-full object-contain"
                        onLoadedMetadata={onVideoMetadata}
                    />
                </div>
            );
        }

        return (
            <div 
                className={`${containerClasses} bg-[#1a202c]`}
                style={style}
            >
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute opacity-10 scale-150 pointer-events-none">
                    <Video size={80} color="white" />
                </div>
                <div className="bg-white/15 rounded-full p-3 backdrop-blur-xs border border-white/10 z-2 flex items-center justify-center">
                    <Play size={24} color="white" className="ml-1"/>
                </div>
                <span className="absolute bottom-2.5 text-[0.65rem] font-bold text-white/80 uppercase tracking-wider z-2 bg-black/50 px-2 py-0.5 rounded">
                    {ext}
                </span>
            </div>
        );
    }

    const { IconComponent, themeColor, bgColor, badgeBg } = config;

    return (
        <div 
            className={`${containerClasses} flex-col gap-2`}
            style={{ ...style, background: bgColor }} 
        >
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[3] -rotate-10 opacity-[0.07] pointer-events-none"
                style={{ color: themeColor }}
            >
                <IconComponent size={64} />
            </div>

            <div className="bg-(--platform-card-bg) rounded-xl p-2 shadow-sm flex items-center justify-center relative z-2">
                <IconComponent size={24} color={themeColor} />
            </div>

            <span 
                className="text-[0.65rem] font-bold uppercase tracking-wider z-2 px-2 py-0.5 rounded-lg min-w-9 text-center"
                style={{ color: themeColor, background: badgeBg }}
            >
                {ext}
            </span>
        </div>
    );
};

export default MediaFilePreview;