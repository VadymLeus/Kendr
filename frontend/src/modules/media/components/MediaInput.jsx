// frontend/src/modules/media/components/MediaInput.jsx

import React, { useState } from 'react';
import MediaPickerModal from './MediaPickerModal';

const API_URL = 'http://localhost:5000';

const MediaInput = ({ value, onChange, type = 'image', placeholder = "Вибрати медіа..." }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelect = (url) => {
        if (!url) return;
        
        const relativeUrl = url.replace(API_URL, '');
        onChange(relativeUrl);
        setIsModalOpen(false);
    };

    const previewStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '8px',
        backgroundColor: '#000'
    };

    return (
        <>
            <div 
                style={{
                    border: '1px dashed var(--platform-border-color)',
                    borderRadius: '8px',
                    padding: '4px',
                    height: '120px',
                    cursor: 'pointer',
                    background: 'var(--platform-card-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onClick={() => setIsModalOpen(true)}
            >
                {value ? (
                    type === 'video' ? (
                        <video 
                            src={`${API_URL}${value}`} 
                            style={previewStyle}
                            muted
                            playsInline
                        />
                    ) : (
                        <img 
                            src={`${API_URL}${value}`} 
                            style={previewStyle} 
                            alt="Preview" 
                        />
                    )
                ) : (
                    <div style={{textAlign: 'center', color: 'var(--platform-text-secondary)'}}>
                        <div style={{fontSize: '1.5rem'}}>{type === 'video' ? '🎬' : '🖼️'}</div>
                        <span style={{fontSize: '0.8rem'}}>{placeholder}</span>
                    </div>
                )}
                
                {value && (
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onChange(''); 
                        }}
                        style={{
                            position: 'absolute', 
                            top: 5, 
                            right: 5,
                            background: 'rgba(0,0,0,0.5)', 
                            color: 'white',
                            border: 'none', 
                            borderRadius: '50%', 
                            width: 24, 
                            height: 24,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                )}
            </div>

            <MediaPickerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectImage={handleSelect}
                allowedTypes={type}
                aspect={type === 'image' ? 1.77 : undefined}
            />
        </>
    );
};

export default MediaInput;