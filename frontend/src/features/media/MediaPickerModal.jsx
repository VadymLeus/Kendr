// frontend/src/features/media/MediaPickerModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg, createImage } from '../../utils/canvasUtils';

const API_URL = 'http://localhost:5000';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            { unit: '%', width: 90 },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

const CropperStep = ({ 
    src, 
    aspect, 
    circularCrop, 
    onConfirm, 
    onCancel,
    fileName 
}) => {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef(null);

    const onImageLoad = (e) => {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        } else {
            setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
        }
    };

    const handleConfirm = async () => {
        if (!completedCrop || !imgRef.current) {
            toast.warning('Будь ласка, обріжте зображення.');
            return;
        }

        setIsProcessing(true);
        try {
            const imageElement = await createImage(src);
            const blob = await getCroppedImg(imageElement, completedCrop);
            
            const file = new File([blob], `cropped-${fileName || 'image.jpg'}`, { type: 'image/jpeg' });
            
            await onConfirm(file);
        } catch (e) {
            console.error('Помилка обрізки:', e);
            toast.error('Помилка при обробці зображення.');
        } finally {
            setIsProcessing(false);
        }
    };

    const cropperContentStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
    };

    const imageContainerStyle = {
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: '#333',
        borderRadius: '4px',
        minHeight: '300px',
        padding: '20px'
    };

    return (
        <div style={cropperContentStyle}>
            <h4 style={{ 
                color: 'var(--platform-text-primary)', 
                marginTop: 0, 
                marginBottom: '1rem', 
                textAlign: 'center', 
                flexShrink: 0 
            }}>
                Кадрування зображення
            </h4>
            
            <div style={imageContainerStyle}>
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    circularCrop={circularCrop}
                    style={{ maxWidth: '100%' }}
                >
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={src}
                        style={{ transform: `scale(1)`, maxWidth: '100%' }}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            </div>

            <div style={{ 
                marginTop: '1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                gap: '1rem', 
                flexShrink: 0 
            }}>
                <button 
                    onClick={onCancel}
                    className="btn btn-secondary"
                    disabled={isProcessing}
                >
                    &larr; Назад
                </button>
                <button 
                    onClick={handleConfirm}
                    className="btn btn-primary"
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Обробка...' : '✂️ Зберегти обрізане'}
                </button>
            </div>
        </div>
    );
};

const UploadTab = ({ onUploadSuccess, allowedTypes = 'image' }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const getAcceptedTypes = () => {
        if (allowedTypes === 'image') return 'image/*';
        if (allowedTypes === 'video') return 'video/*';
        return 'image/*,video/*';
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            
            const maxSize = 15 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('Файл занадто великий (макс 50MB). Спробуйте зменшити розмір або обрати інший.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const formData = new FormData();
            formData.append('mediaFile', file);
            setUploading(true);
            setError('');
            
            try {
                const response = await apiClient.post('/media/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                toast.success('Оригінал завантажено. Тепер обріжте зображення.');
                onUploadSuccess(response.data.path_full, file.name, file.type);

            } catch (err) {
                const msg = err.response?.data?.message || 'Помилка завантаження.';
                setError(msg);
                toast.error(msg);
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };
    
    return (
        <div style={tabContentStyle} className="custom-scrollbar">
            <input
                type="file"
                accept={getAcceptedTypes()}
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />
            
            <div 
                style={uploadBoxStyle} 
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                {uploading ? 'Завантаження...' : `Натисніть, щоб вибрати файл (макс 15MB) - ${allowedTypes === 'image' ? 'зображення' : allowedTypes === 'video' ? 'відео' : 'зображення/відео'}`}
            </div>
            
            {error && <p style={{ color: 'var(--platform-danger)', marginTop: '1rem' }}>{error}</p>}
        </div>
    );
};

const LibraryTab = ({ onSelectImage, allowedTypes = 'all' }) => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/media');
                setMediaFiles(response.data);
            } catch (err) {
                setError('Не вдалося завантажити медіафайли.');
            } finally {
                setLoading(false);
            }
        };
        fetchMedia();
    }, []);

    const displayedFiles = mediaFiles.filter(file => {
        if (allowedTypes === 'image') return file.mime_type.startsWith('image/');
        if (allowedTypes === 'video') return file.mime_type.startsWith('video/');
        return true; 
    });

    const handleSelect = (file) => {
        onSelectImage(file.path_full, file.original_file_name, file.mime_type);
    }

    return (
        <div style={tabContentStyle} className="custom-scrollbar">
            {loading ? <p style={{ color: 'var(--platform-text-secondary)' }}>Завантаження...</p> : 
             error ? <div style={{ color: 'var(--platform-danger)' }}>{error}</div> : 
             displayedFiles.length === 0 ? <p style={{ color: 'var(--platform-text-secondary)' }}>Ваша медіатека порожня.</p> : (
                <div style={mediaGridStyle}>
                    {displayedFiles.map(file => {
                        const isVideo = file.mime_type.startsWith('video/');
                        return (
                            <div 
                                key={file.id} 
                                style={mediaGridItemStyle}
                                onClick={() => handleSelect(file)}
                            >
                                {isVideo ? (
                                    <>
                                        <img 
                                            src={`${API_URL}${file.path_thumb}`} 
                                            alt={file.alt_text || file.original_file_name} 
                                            style={imageStyle}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/100x100/AAAAAA/FFFFFF?text=Відео";
                                            }}
                                        />
                                        <div style={videoOverlayStyle}>
                                            <span style={videoIconStyle}>▶️</span>
                                        </div>
                                    </>
                                ) : (
                                    <img 
                                        src={`${API_URL}${file.path_thumb}`} 
                                        alt={file.alt_text || file.original_file_name} 
                                        style={imageStyle}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/100x100/AAAAAA/FFFFFF?text=Помилка";
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
             )}
        </div>
    );
};

const DefaultLogosTab = ({ onSelectImage }) => {
    const [logos, setLogos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/sites/default-logos')
            .then(res => setLogos(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);
    
    const handleSelect = (logoUrl) => {
        const finalPath = logoUrl.startsWith('http') ? logoUrl : `${API_URL}${logoUrl}`;
        onSelectImage(finalPath, 'default', 'image/jpeg');
    }

    return (
        <div style={tabContentStyle} className="custom-scrollbar">
            {loading ? (
                <p style={{ color: 'var(--platform-text-secondary)' }}>Завантаження...</p>
            ) : logos.length === 0 ? (
                <p style={{ color: 'var(--platform-text-secondary)' }}>Немає стандартних зображень.</p>
            ) : (
                <div style={mediaGridStyle}>
                    {logos.map((logoUrl, index) => (
                        <div 
                            key={index} 
                            style={{
                                ...mediaGridItemStyle,
                                background: '#eee'
                            }}
                            onClick={() => handleSelect(logoUrl)}
                        >
                            <img 
                                src={`${API_URL}${logoUrl}`} 
                                alt="Standard" 
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px', boxSizing: 'border-box' }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MediaPickerModal = ({ 
    isOpen, 
    onClose, 
    onSelectImage, 
    aspect, 
    circularCrop,
    allowedTypes = 'image',
    defaultTab = 'library'
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [step, setStep] = useState('tabs');
    const [imageToCropSrc, setImageToCropSrc] = useState(null);
    const [imageFileName, setImageFileName] = useState(null);

    if (!isOpen) return null;

    const handleClose = () => {
        setStep('tabs');
        setImageToCropSrc(null);
        setImageFileName(null);
        onClose();
    };

    const handleImageSelection = (pathFull, fileName = 'media-file', mimeType = 'image/jpeg') => {
        const isVideo = mimeType && mimeType.startsWith('video/');
        const requestingVideo = allowedTypes === 'video';

        if (isVideo || requestingVideo || !aspect) {
            onSelectImage(pathFull);
            handleClose();
            return;
        }

        setImageToCropSrc(`${API_URL}${pathFull}`);
        setImageFileName(fileName);
        setStep('crop');
    };

    const handleCroppedFileConfirmed = async (croppedFile) => {
        const formData = new FormData();
        formData.append('mediaFile', croppedFile);

        try {
            const response = await apiClient.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data && response.data.path_full) {
                onSelectImage(response.data.path_full);
                toast.success('Зображення успішно обрізано та збережено!');
                handleClose();
            } else {
                throw new Error("Сервер не повернув шлях до файлу");
            }
        } catch (error) {
            console.error("Помилка збереження кропу:", error);
            toast.error(error.response?.data?.message || "Не вдалося зберегти обрізане зображення.");
        }
    };
    
    const modalContainerStyle = {
        background: 'var(--platform-card-bg)', 
        padding: '1.5rem', 
        borderRadius: '12px', 
        width: '95%',
        maxWidth: '900px', 
        height: '90vh',
        maxHeight: '800px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)', 
        border: '1px solid var(--platform-border-color)', 
        display: 'flex', 
        flexDirection: 'column' 
    };

    if (step === 'crop' && imageToCropSrc) {
        return (
            <div style={modalOverlayStyle} onClick={handleClose}>
                <div style={modalContainerStyle} onClick={e => e.stopPropagation()}>
                    <CropperStep 
                        src={imageToCropSrc} 
                        aspect={aspect} 
                        circularCrop={circularCrop} 
                        onConfirm={handleCroppedFileConfirmed}
                        onCancel={() => setStep('tabs')}
                        fileName={imageFileName}
                    />
                </div>
            </div>
        );
    }
    
    return (
        <>
            <ScrollbarStyles />
            <div style={modalOverlayStyle} onClick={handleClose}>
                <div style={modalContainerStyle} onClick={e => e.stopPropagation()}>
                    <div style={modalHeaderStyle}>
                        <h4 style={{ color: 'var(--platform-text-primary)', margin: 0 }}>Вибір медіа</h4>
                        <button onClick={handleClose} style={closeButtonStyle}>&times;</button>
                    </div>
                    
                    <div style={modalTabsStyle} className="custom-scrollbar">
                        <button 
                            style={tabButtonStyle(activeTab === 'library')}
                            onClick={() => setActiveTab('library')}
                        >
                            Медіатека
                        </button>
                        <button 
                            style={tabButtonStyle(activeTab === 'default')}
                            onClick={() => setActiveTab('default')}
                        >
                            Стандартні
                        </button>
                        <button 
                            style={tabButtonStyle(activeTab === 'upload')}
                            onClick={() => setActiveTab('upload')}
                        >
                            Завантажити
                        </button>
                    </div>

                    <div style={{ 
                        padding: '1rem 0', 
                        flex: 1, 
                        overflow: 'hidden', 
                        display: 'flex', 
                        flexDirection: 'column' 
                    }}>
                        {activeTab === 'library' && (
                            <LibraryTab 
                                onSelectImage={(file) => handleImageSelection(file.path_full, file.original_file_name, file.mime_type)} 
                                allowedTypes={allowedTypes}
                            />
                        )}
                        {activeTab === 'default' && (
                            <DefaultLogosTab onSelectImage={handleImageSelection} />
                        )}
                        {activeTab === 'upload' && (
                            <UploadTab 
                                onUploadSuccess={handleImageSelection} 
                                allowedTypes={allowedTypes}
                            /> 
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const ScrollbarStyles = () => (
    <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: var(--platform-border-color);
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: var(--platform-text-secondary);
        }
    `}</style>
);

const modalOverlayStyle = { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0,0,0,0.7)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 1200 
};

const modalHeaderStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingBottom: '1rem', 
    borderBottom: '1px solid var(--platform-border-color)',
    flexShrink: 0
};

const closeButtonStyle = { 
    background: 'none', 
    border: 'none', 
    fontSize: '1.5rem', 
    cursor: 'pointer', 
    color: 'var(--platform-text-secondary)'
};

const modalTabsStyle = { 
    display: 'flex', 
    gap: '0.5rem', 
    margin: '1rem 0',
    overflowX: 'auto',
    flexShrink: 0
};

const tabButtonStyle = (isActive) => ({
    flex: 1,
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--platform-border-color)',
    background: isActive ? 'var(--platform-accent)' : 'var(--platform-card-bg)',
    color: isActive ? 'var(--platform-accent-text)' : 'var(--platform-text-secondary)',
    cursor: 'pointer',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
});

const tabContentStyle = { 
    paddingRight: '5px',
    height: '100%',
    overflowY: 'auto'
};

const uploadBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '250px',
    border: '2px dashed var(--platform-border-color)',
    borderRadius: '8px',
    background: 'var(--platform-bg)',
    color: 'var(--platform-text-secondary)',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
};

const mediaGridStyle = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
    gap: '10px', 
    width: '100%' 
};

const mediaGridItemStyle = {
    width: '100%',
    aspectRatio: '1 / 1', 
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid var(--platform-border-color)',
    cursor: 'pointer',
    transition: 'transform 0.2s, border-color 0.2s',
    position: 'relative'
};

const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
};

const videoOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const videoIconStyle = {
    fontSize: '24px',
    color: 'white',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
};

export default MediaPickerModal;