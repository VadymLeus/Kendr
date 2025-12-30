// frontend/src/modules/media/components/ImageInput.jsx
import React, { useState } from 'react';
import MediaPickerModal from './MediaPickerModal';
import ImageCropperModal from "../../../common/components/ui/ImageCropperModal";
import apiClient from "../../../common/services/api";
import { toast } from 'react-toastify';
import { IconUpload, IconX } from "../../../common/components/ui/Icons";

const API_URL = 'http://localhost:5000';

const ImageInput = ({ 
    value, 
    onChange, 
    aspect = null, 
    circularCrop = false, 
    triggerStyle = null, 
    children 
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    const safeValue = typeof value === 'string' ? value : '';

    const handleSelectFromPicker = (file) => {
        if (!file) return;

        const fullPath = `${API_URL}${file.path_full}`;

        if (aspect) {
            setCropImageSrc(fullPath);
            setIsPickerOpen(false);
            setIsCropperOpen(true);
        } else {
            triggerChange(file.path_full);
            setIsPickerOpen(false);
        }
    };

    const handleCropComplete = async (croppedFile) => {
        const formData = new FormData();
        formData.append('mediaFile', croppedFile);

        try {
            const res = await apiClient.post('/media/upload', formData);
            if (res.data && res.data.path_full) {
                triggerChange(res.data.path_full);
                toast.success('Зображення оновлено');
            }
        } catch (error) {
            console.error("Upload cropped error:", error);
            toast.error('Помилка завантаження обробленого зображення');
        } finally {
            setIsCropperOpen(false);
            setCropImageSrc(null);
        }
    };

    const triggerChange = (newValue) => {
        const syntheticEvent = {
            target: {
                value: newValue
            }
        };
        if (onChange) {
            onChange(syntheticEvent);
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
        zIndex: 10,
        transition: 'background 0.2s',
        padding: 0
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
                <div onClick={() => setIsPickerOpen(true)} style={triggerStyle}>
                    {children}
                </div>
                
                <MediaPickerModal 
                    isOpen={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    onSelect={handleSelectFromPicker}
                    allowedTypes={['image']}
                />

                <ImageCropperModal 
                    isOpen={isCropperOpen}
                    onClose={() => setIsCropperOpen(false)}
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
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
                onClick={() => setIsPickerOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {safeValue ? (
                    <>
                        <img 
                            src={safeValue.startsWith('http') ? safeValue : `${API_URL}${safeValue}`} 
                            alt="Preview" 
                            style={imageStyle} 
                            onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = "https://placehold.co/400x300?text=Error"; 
                            }}
                        />
                        <div style={overlayStyle}>Змінити</div>
                        <button 
                            type="button" 
                            style={deleteButtonStyle}
                            onClick={handleClear}
                            title="Видалити фото"
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--platform-danger)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
                        >
                            <IconX size={14} />
                        </button>
                    </>
                ) : (
                    <div style={placeholderStyle}>
                        <IconUpload size={24} style={{ opacity: 0.7 }} />
                        <span>Вибрати фото...</span>
                    </div>
                )}
            </div>
            
            <MediaPickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleSelectFromPicker}
                allowedTypes={['image']}
            />

            <ImageCropperModal 
                isOpen={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                imageSrc={cropImageSrc}
                onCropComplete={handleCropComplete}
                aspect={aspect}
                circularCrop={circularCrop}
            />
        </div>
    );
};

export default ImageInput;