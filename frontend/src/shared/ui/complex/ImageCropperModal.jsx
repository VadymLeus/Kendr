// frontend/src/shared/ui/complex/ImageCropperModal.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '../../utils/canvasUtils';
import { toast } from 'react-toastify';
import { Button } from '../elements/Button';
import Switch from '../elements/Switch';
import RangeSlider from '../elements/RangeSlider';
import { X, Check, Crop } from 'lucide-react';

function getInitialCrop(mediaWidth, mediaHeight, currentAspect) {
    if (!currentAspect) {
        return {
            unit: '%',
            width: 90,
            height: 90,
            x: 5,
            y: 5
        };
    }

    const imageAspect = mediaWidth / mediaHeight;
    let cropConfig = { unit: '%' };
    if (imageAspect > currentAspect) {
        cropConfig.height = 90;
    } else {
        cropConfig.width = 90;
    }

    return centerCrop(
        makeAspectCrop(
            cropConfig,
            currentAspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

const ImageCropperModal = ({ 
    isOpen,
    imageSrc, 
    onClose, 
    onCropComplete, 
    aspect: passedAspect = 1, 
    circularCrop = false,
    title = "Кадрування зображення" 
}) => {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [zoom, setZoom] = useState(1);
    const [currentAspect, setCurrentAspect] = useState(passedAspect);
    const [bgMode, setBgMode] = useState('pattern'); // 'pattern', 'white', 'black', 'gray'
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef(null);
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setCurrentAspect(passedAspect);
            setBgMode('pattern');
        } else {
            setCrop(undefined);
            setCompletedCrop(undefined);
        }
    }, [isOpen, passedAspect]);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const initCrop = getInitialCrop(width, height, currentAspect);
        setCrop(initCrop);
        setCompletedCrop(initCrop);
    };

    const imgStyle = useMemo(() => ({
        transform: `scale(${zoom})`,
        transition: 'transform 0.1s ease-out',
        transformOrigin: 'center center'
    }), [zoom]);

    const handleConfirm = async () => {
        if (!completedCrop || !imgRef.current) {
            toast.warning('Виділіть область для обрізки.');
            return;
        }
        setIsProcessing(true);
        try {
            const blob = await getCroppedImg(imgRef.current, completedCrop);
            const file = new File([blob], 'cropped_image.png', { type: 'image/png' });
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
    const isAspectFixed = currentAspect !== undefined;
    const bgStyles = {
        pattern: { backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')" },
        white: { backgroundColor: '#ffffff' },
        black: { backgroundColor: '#111827' },
        gray: { backgroundColor: '#6b7280' },
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/85 backdrop-blur-[5px] z-30000 flex items-center justify-center p-4 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-(--platform-card-bg) rounded-2xl w-full max-w-5xl h-[95vh] sm:h-[90vh] flex flex-col border border-(--platform-border-color) shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-(--platform-border-color) flex justify-between items-center shrink-0 bg-(--platform-card-bg) z-10">
                    <h3 className="m-0 text-(--platform-text-primary) text-lg flex gap-2.5 items-center font-semibold">
                        <Crop size={20} className="text-(--platform-accent)"/>
                        {title}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="bg-transparent border-none w-8 h-8 flex items-center justify-center text-(--platform-text-secondary) cursor-pointer hover:bg-(--platform-hover-bg) hover:text-(--platform-text-primary) rounded-full transition-colors"
                    >
                        <X size={20}/>
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
                    <div 
                        className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 bg-repeat transition-colors duration-300 relative"
                        style={bgStyles[bgMode]}
                    >
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={currentAspect}
                            circularCrop={circularCrop}
                            className="m-auto shadow-2xl"
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imageSrc}
                                onLoad={onImageLoad}
                                style={imgStyle}
                                className="block max-w-full object-contain"
                                crossOrigin="anonymous"
                            />
                        </ReactCrop>
                    </div>
                    <div className="w-full sm:w-80 sm:min-w-80 bg-(--platform-bg) border-t sm:border-t-0 sm:border-l border-(--platform-border-color) p-5 sm:p-6 flex flex-col gap-8 overflow-y-auto shrink-0 z-10">
                        <div className="mb-2">
                            <RangeSlider 
                                label="Масштаб зображення"
                                value={Math.round(zoom * 100)} 
                                min={20}
                                max={400}
                                step={5}
                                unit="%"
                                onChange={(val) => {
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num)) {
                                        setZoom(num / 100); 
                                    }
                                }}
                            />
                        </div>
                        {!circularCrop && (
                            <div className="flex flex-col gap-2">
                                <Switch 
                                    label="Фіксовані пропорції"
                                    checked={isAspectFixed}
                                    onChange={(checked) => setCurrentAspect(checked ? passedAspect : undefined)}
                                />
                                <p className="text-xs text-(--platform-text-secondary) m-0 leading-tight">
                                    Вимкніть, щоб розтягувати область кадрування вільно по ширині чи висоті.
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-semibold text-(--platform-text-primary)">
                                Колір фону
                            </label>
                            <div className="grid grid-cols-4 gap-2 mt-1">
                                <button
                                    onClick={() => setBgMode('pattern')}
                                    className={`aspect-square rounded-lg border-2 transition-all bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-repeat ${bgMode === 'pattern' ? 'border-(--platform-accent) scale-105 shadow-md' : 'border-(--platform-border-color) hover:border-(--platform-text-secondary)'}`}
                                    title="Прозорий (стандартний)"
                                />
                                <button
                                    onClick={() => setBgMode('white')}
                                    className={`aspect-square rounded-lg border-2 transition-all bg-white ${bgMode === 'white' ? 'border-(--platform-accent) scale-105 shadow-md' : 'border-(--platform-border-color) hover:border-(--platform-text-secondary)'}`}
                                    title="Білий"
                                />
                                <button
                                    onClick={() => setBgMode('gray')}
                                    className={`aspect-square rounded-lg border-2 transition-all bg-gray-500 ${bgMode === 'gray' ? 'border-(--platform-accent) scale-105 shadow-md' : 'border-(--platform-border-color) hover:border-gray-400'}`}
                                    title="Сірий"
                                />
                                <button
                                    onClick={() => setBgMode('black')}
                                    className={`aspect-square rounded-lg border-2 transition-all bg-gray-900 ${bgMode === 'black' ? 'border-(--platform-accent) scale-105 shadow-md' : 'border-(--platform-border-color) hover:border-gray-600'}`}
                                    title="Чорний"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-5 py-4 border-t border-(--platform-border-color) flex justify-end gap-3 bg-(--platform-card-bg) shrink-0 z-10">
                    <Button variant="outline" onClick={onClose} disabled={isProcessing} className="w-full sm:w-auto">
                        Скасувати
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleConfirm} 
                        disabled={isProcessing}
                        icon={isProcessing ? null : <Check size={18}/>}
                        className="w-full sm:min-w-32 justify-center"
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