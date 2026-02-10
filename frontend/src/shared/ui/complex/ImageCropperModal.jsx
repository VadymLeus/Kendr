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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-[5px] z-9999 flex items-center justify-center p-5 animate-in fade-in duration-200">
            <div className="bg-(--platform-card-bg) rounded-2xl w-full max-w-150 max-h-[90vh] flex flex-col border border-(--platform-border-color) shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-(--platform-border-color) flex justify-between items-center shrink-0">
                    <h3 className="m-0 text-(--platform-text-primary) text-lg flex gap-2.5 items-center font-semibold">
                        <Crop size={20} className="text-(--platform-accent)"/>
                        Кадрування
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="bg-transparent border-none text-(--platform-text-secondary) cursor-pointer hover:text-(--platform-text-primary) p-1 rounded transition-colors"
                    >
                        <X size={20}/>
                    </button>
                </div>
                
                <div className="p-5 overflow-auto flex justify-center items-center bg-(--platform-bg) bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-repeat flex-1 min-h-75">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        circularCrop={circularCrop}
                        className="shadow-xl"
                    >
                        <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imageSrc}
                            onLoad={onImageLoad}
                            className="block max-w-full max-h-[60vh] object-contain shadow-lg"
                            crossOrigin="anonymous"
                        />
                    </ReactCrop>
                </div>

                <div className="px-5 py-4 border-t border-(--platform-border-color) flex justify-end gap-2.5 bg-(--platform-card-bg) shrink-0">
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
        </div>,
        document.body
    );
};

export default ImageCropperModal;