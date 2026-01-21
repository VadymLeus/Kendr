// frontend/src/shared/ui/complex/ImageUploadTrigger.jsx
import React, { useState, useRef } from 'react';
import ImageCropperModal from './ImageCropperModal';
import { toast } from 'react-toastify';

const ImageUploadTrigger = ({ 
    children, 
    onUpload, 
    aspect = 1, 
    circularCrop = false, 
    uploading = false,
    triggerStyle = {}
}) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Будь ласка, виберіть зображення (JPG, PNG, WebP)');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Файл занадто великий (макс. 10MB)');
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setSelectedImage(reader.result);
            setIsCropperOpen(true);
            e.target.value = '';
        });
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedFile) => {
        if (onUpload) {
            await onUpload(croppedFile);
        }
        setIsCropperOpen(false);
        setSelectedImage(null);
    };

    const handleClose = () => {
        setIsCropperOpen(false);
        setSelectedImage(null);
    };

    const handleClick = (e) => {
        e.stopPropagation();
        
        if (!uploading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <>
            <div 
                onClick={handleClick} 
                style={{ display: 'inline-block', ...triggerStyle }}
                className={uploading ? 'disabled-uploader' : ''}
            >
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    disabled={uploading}
                />
                {children}
            </div>
            {isCropperOpen && (
                <ImageCropperModal
                    isOpen={isCropperOpen}
                    imageSrc={selectedImage}
                    onClose={handleClose}
                    onCropComplete={handleCropComplete}
                    aspect={aspect}
                    circularCrop={circularCrop}
                />
            )}
        </>
    );
};

export default ImageUploadTrigger;