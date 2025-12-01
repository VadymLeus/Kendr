// frontend/src/features/media/ImageInput.jsx
import React, { useState } from 'react';
import MediaPickerModal from './MediaPickerModal';

const API_URL = 'http://localhost:5000';

const ImageInput = ({ value, onChange, aspect = null, circularCrop = false, triggerStyle = null, children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSelectImage = (input) => {
        let safeUrl = input;

        if (typeof input === 'object' && input !== null) {
            safeUrl = input.path_full || input.url || input.path || '';
        }

        safeUrl = String(safeUrl || '');

        const syntheticEvent = {
            target: {
                value: safeUrl
            }
        };

        if (onChange) {
            onChange(syntheticEvent);
        }
        setIsModalOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        const syntheticEvent = {
            target: {
                value: ''
            }
        };
        onChange(syntheticEvent);
    };

    const defaultContainerStyle = {
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: isHovered && !value ? 'var(--platform-card-bg)' : 'var(--platform-bg)',
        borderWidth: value ? '1px' : '2px',
        borderStyle: value ? 'solid' : 'dashed',
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

    const imageStyle = {
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
        fontWeight: '500'
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
        fontSize: '14px',
        zIndex: 10,
        transition: 'background 0.2s'
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
        transition: 'opacity 0.2s'
    };

    if (children) {
        return (
            <>
                <div onClick={() => setIsModalOpen(true)} style={triggerStyle}>
                    {children}
                </div>
                <MediaPickerModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSelectImage={handleSelectImage}
                    aspect={aspect}
                    circularCrop={circularCrop}
                />
            </>
        );
    }

    return (
        <div className="image-input-container" style={{height: '100%'}}>
            <div 
                style={appliedContainerStyle}
                onClick={() => setIsModalOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {value ? (
                    <>
                        <img 
                            src={value.startsWith('http') ? value : `${API_URL}${value}`} 
                            alt="Preview" 
                            style={imageStyle} 
                            onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = "https://placehold.co/400x300?text=Error"; 
                            }}
                        />
                        <div style={overlayStyle}>🖊️ Змінити</div>
                        <button 
                            type="button" 
                            style={deleteButtonStyle}
                            onClick={handleClear}
                            title="Видалити фото"
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--platform-danger)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
                        >
                            ✕
                        </button>
                    </>
                ) : (
                    <div style={placeholderStyle}>
                        <span style={{fontSize: '1.5rem'}}>📷</span>
                        <span>Вибрати фото...</span>
                    </div>
                )}
            </div>
            
            <MediaPickerModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectImage={handleSelectImage}
                aspect={aspect}
                circularCrop={circularCrop}
            />
        </div>
    );
};

export default ImageInput;