// frontend/src/common/components/ui/ImageUploader.jsx
import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '../../utils/canvasUtils';
import { toast } from 'react-toastify';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const ImageUploader = ({ 
    onUpload, 
    aspect, 
    circularCrop = false, 
    children, 
    uploading = false 
}) => {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Файл занадто великий (макс 5MB)');
                return;
            }
            
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setIsModalOpen(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const onImageLoad = (e) => {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        } else {
             setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
        }
    };

    const handleConfirmCrop = async () => {
        if (!completedCrop || !imgRef.current) {
            toast.warning('Будь ласка, обріжте зображення.');
            return;
        }

        setIsProcessing(true);
        try {
            const blob = await getCroppedImg(imgRef.current, completedCrop);
            
            const file = new File([blob], 'cropped-avatar.jpg', { type: 'image/jpeg' });
            
            await onUpload(file);
            
            handleCancel();
            toast.success('Зображення успішно обрізано та завантажено.');
        } catch (e) {
            console.error(e);
            toast.error('Помилка при обробці зображення');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setImgSrc('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setCompletedCrop(undefined);
    };

    const modalOverlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)', zIndex: 99999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
    };

    const modalContentStyle = {
        background: 'var(--platform-card-bg)', padding: '20px', borderRadius: '12px',
        maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    };

    const triggerContainerStyle = {
        display: 'inline-block',
        cursor: uploading ? 'wait' : 'pointer'
    };

    return (
        <>
            <div 
                onClick={() => !uploading && fileInputRef.current?.click()} 
                style={triggerContainerStyle}
                title="Натисніть, щоб завантажити фото"
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                />
                {children}
            </div>

            {/* 2. Модальне вікно кадрування */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ color: 'var(--platform-text-primary)', marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>
                            Кадрування зображення
                        </h3>
                        
                        <div style={{ overflow: 'auto', maxHeight: '60vh', display: 'flex', justifyContent: 'center', background: '#333', borderRadius: '4px' }}>
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                                circularCrop={circularCrop}
                                style={{ maxHeight: '60vh' }}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    style={{ transform: `scale(1)`, maxWidth: '100%', maxHeight: '60vh' }}
                                    onLoad={onImageLoad}
                                />
                            </ReactCrop>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button 
                                onClick={handleCancel}
                                className="btn btn-secondary"
                                disabled={isProcessing}
                            >
                                Скасувати
                            </button>
                            <button 
                                onClick={handleConfirmCrop}
                                className="btn btn-primary"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Обробка...' : '✂️ Обрізати та Зберегти'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageUploader;