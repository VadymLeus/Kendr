// frontend/src/modules/media/components/MediaInput.jsx
import React, { useState } from 'react';
import MediaPickerModal from './MediaPickerModal';
import { IconUpload, IconX, IconVideo, IconImage, IconPlay } from "../../../shared/ui/elements/Icons";

const API_URL = 'http://localhost:5000';
const MediaInput = ({ 
    value, 
    onChange, 
    type = 'image', 
    placeholder = "Вибрати медіа...",
    triggerStyle = null
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const safeValue = typeof value === 'string' ? value : '';

    const handleSelectFromPicker = (file) => {
        if (!file) return;
        const relativePath = file.path_full; 
        triggerChange(relativePath);
        setIsPickerOpen(false);
    };

    const triggerChange = (newValue) => {
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        triggerChange('');
    };

    const defaultContainerStyle = {
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: isHovered && !safeValue ? 'var(--platform-card-bg)' : 'var(--platform-bg)',
        borderWidth: safeValue ? '1px' : '2px',
        borderStyle: safeValue ? 'solid' : 'dashed',
        borderColor: isHovered ? 'var(--platform-accent)' : 'var(--platform-border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: 'var(--platform-text-secondary)',
    };

    const appliedContainerStyle = triggerStyle || defaultContainerStyle;

    const mediaStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
    };

    const placeholderStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        fontWeight: '500',
        textAlign: 'center',
        padding: '10px'
    };

    const deleteButtonStyle = {
        position: 'absolute',
        top: '6px',
        right: '6px',
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        transition: 'background 0.2s',
        padding: 0,
        opacity: isHovered ? 1 : 0 
    };

    const overlayStyle = {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '600',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s',
        zIndex: 5
    };

    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    return (
        <div className="media-input-container" style={{height: '100%'}}>
            <div 
                style={appliedContainerStyle}
                onClick={() => setIsPickerOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {safeValue ? (
                    <>
                        {type === 'video' ? (
                            <div style={{width: '100%', height: '100%', position: 'relative'}}>
                                <video 
                                    src={getFullUrl(safeValue)} 
                                    style={mediaStyle}
                                    muted
                                    loop
                                    autoPlay
                                    playsInline
                                />
                                <div style={{
                                    position: 'absolute', bottom: '8px', left: '8px', 
                                    background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px',
                                    display: 'flex', opacity: 0.8
                                }}>
                                    <IconPlay size={12} color="white"/>
                                </div>
                            </div>
                        ) : (
                            <img 
                                src={getFullUrl(safeValue)} 
                                alt="Preview" 
                                style={mediaStyle} 
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/400x300?text=Error"; 
                                }}
                            />
                        )}

                        <div style={overlayStyle}>Змінити</div>
                        
                        <button 
                            type="button" 
                            style={deleteButtonStyle}
                            onClick={handleClear}
                            title="Очистити"
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--platform-danger)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
                        >
                            <IconX size={14} />
                        </button>
                    </>
                ) : (
                    <div style={placeholderStyle}>
                        {type === 'video' ? (
                            <IconVideo size={24} style={{ opacity: 0.7 }} />
                        ) : (
                            <IconImage size={24} style={{ opacity: 0.7 }} />
                        )}
                        <span>{placeholder}</span>
                    </div>
                )}
            </div>
            
            <MediaPickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleSelectFromPicker}
                allowedTypes={[type]} 
                title={type === 'video' ? "Вибір відео" : "Вибір зображення"}
            />
        </div>
    );
};

export default MediaInput;