// frontend/src/shared/ui/complex/ImageCropperModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '../../utils/canvasUtils';
import { toast } from 'react-toastify';
import { Button } from '../elements/Button';
import { X, Check, Crop } from 'lucide-react';

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

const ImageCropperModal = ({ 
    isOpen,
    imageSrc, 
    onClose, 
    onCropComplete, 
    aspect = 1, 
    circularCrop = false 
}) => {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef(null);
    useEffect(() => {
        if (!isOpen) {
            setCrop(undefined);
            setCompletedCrop(undefined);
        }
    }, [isOpen]);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const initCrop = centerAspectCrop(width, height, aspect);
        setCrop(initCrop);
        setCompletedCrop(initCrop);
    };

    const handleConfirm = async () => {
        if (!completedCrop || !imgRef.current) {
            toast.warning('Виділіть область для обрізки.');
            return;
        }

        setIsProcessing(true);
        try {
            const blob = await getCroppedImg(imgRef.current, completedCrop);
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            await onCropComplete(file);
            onClose();
        } catch (e) {
            console.error(e);
            toast.error('Помилка обробки');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen || !imageSrc) return null;
    return ReactDOM.createPortal(
        <div className="cropper-overlay">
            <div className="cropper-modal">
                <div className="cropper-header">
                    <h3>
                        <Crop size={20} style={{ color: 'var(--platform-accent)' }}/>
                        Кадрування
                    </h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={20}/>
                    </button>
                </div>
                
                <div className="cropper-body custom-scrollbar">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        circularCrop={circularCrop}
                        className="react-crop-component"
                    >
                        <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imageSrc}
                            onLoad={onImageLoad}
                            style={{ maxWidth: '100%', maxHeight: '60vh' }}
                            crossOrigin="anonymous"
                        />
                    </ReactCrop>
                </div>

                <div className="cropper-footer">
                    <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
                        Скасувати
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleConfirm} 
                        disabled={isProcessing}
                        icon={isProcessing ? null : <Check size={18}/>}
                    >
                        {isProcessing ? 'Обробка...' : 'Зберегти'}
                    </Button>
                </div>
            </div>

            <style>{`
                .cropper-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(5px);
                    z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px;
                    animation: fadeIn 0.2s ease-out;
                }
                .cropper-modal {
                    background: var(--platform-card-bg);
                    border-radius: 16px;
                    width: 100%; max-width: 600px;
                    max-height: 90vh;
                    display: flex; flex-direction: column;
                    border: 1px solid var(--platform-border-color);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }
                .cropper-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--platform-border-color);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .cropper-header h3 { margin: 0; color: var(--platform-text-primary); font-size: 1.1rem; display: flex; gap: 10px; align-items: center;}
                .close-btn { background: none; border: none; color: var(--platform-text-secondary); cursor: pointer; }
                
                .cropper-body {
                    padding: 20px;
                    overflow: auto;
                    display: flex; justify-content: center;
                    align-items: center;
                    background-color: var(--platform-bg);
                    background-image: url('https://transparenttextures.com/patterns/cubes.png');
                    flex: 1;
                    min-height: 300px;
                }
                .react-crop-component img {
                    display: block;
                    max-width: 100%;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .cropper-footer {
                    padding: 16px 20px;
                    border-top: 1px solid var(--platform-border-color);
                    display: flex; justify-content: flex-end; gap: 10px;
                    background: var(--platform-card-bg);
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>,
        document.body
    );
};

export default ImageCropperModal;