// frontend/src/shared/ui/complex/UniversalMediaInput.jsx
import React, { useState } from 'react';
import MediaPickerModal from '../../../modules/media/components/MediaPickerModal'; 
import ImageCropperModal from './ImageCropperModal'; 
import apiClient from '../../api/api';
import { toast } from 'react-toastify';
import { Upload, X, Image as ImageIcon, Video, FileText, Music, Type, Play, FileSpreadsheet, File } from 'lucide-react';

const API_URL = 'http://localhost:5000'; 
const UniversalMediaInput = ({ 
    value, 
    onChange, 
    type = 'image',
    placeholder = "Вибрати файл...",
    aspect = null,
    circularCrop = false, 
    triggerStyle = null,
    className = '',
    children
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const safeValue = typeof value === 'string' ? value : '';
    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('blob:')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${API_URL}${cleanPath}`;
    };

    const getFileName = (path) => {
        if (!path) return '';
        return path.split('/').pop();
    };

    const getFileExtension = (path) => {
        if (!path) return '';
        return path.split('.').pop().toLowerCase();
    };

    const triggerChange = (newValue) => {
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleSelectFromPicker = (file) => {
        if (!file) return;
        const fullPath = getFullUrl(file.path_full);
        const relativePath = file.path_full;

        setIsPickerOpen(false);

        if (type === 'image' && aspect !== null) {
            setCropImageSrc(fullPath);
            setIsCropperOpen(true);
        } else {
            triggerChange(relativePath);
        }
    };

    const handleCropComplete = async (croppedFile) => {
        const formData = new FormData();
        formData.append('mediaFile', croppedFile); 
        try {
            const res = await apiClient.post('/media/upload?isSystem=true', formData);
            let newPath = res.data.path_full || res.data.filePath;

            if (newPath) {
                triggerChange(newPath);
                toast.success('Зображення оновлено');
            } else {
                toast.error('Помилка отримання шляху файлу');
            }
        } catch (error) {
            console.error("Upload cropped error:", error);
            toast.error('Помилка завантаження');
        } finally {
            setIsCropperOpen(false);
            setCropImageSrc(null);
        }
    };

    const handleClear = (e) => {
        e && e.stopPropagation();
        triggerChange('');
    };

    const renderPreview = () => {
        const url = getFullUrl(safeValue);
        const ext = getFileExtension(safeValue);
        const name = getFileName(safeValue);
        if (type === 'image' || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
            return (
                <img 
                    src={url} 
                    alt="Preview" 
                    className="w-full h-full object-cover block"
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://placehold.co/400x300?text=Error"; 
                    }}
                />
            );
        }

        if (type === 'video' || ['mp4', 'webm', 'mov'].includes(ext)) {
            return (
                <div className="w-full h-full relative bg-black flex items-center justify-center">
                    <video src={url} className="w-full h-full object-contain" muted />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
                            <Play size={20} className="text-white fill-white" />
                        </div>
                    </div>
                </div>
            );
        }

        let Icon = FileText;
        if (['pdf'].includes(ext)) Icon = FileText;
        if (['xls', 'xlsx', 'csv'].includes(ext)) Icon = FileSpreadsheet;
        if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) Icon = Type;
        if (['mp3', 'wav'].includes(ext)) Icon = Music;
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-(--platform-bg) text-(--platform-text-primary)">
                
                <Icon size={32} className="text-(--platform-accent) mb-2" />
                <span className="text-xs text-center font-medium break-all line-clamp-2 px-2">
                    {name}
                </span>
                <span className="text-[10px] text-(--platform-text-secondary) uppercase mt-1 px-1.5 py-0.5 bg-(--platform-border-color) rounded">
                    {ext}
                </span>
            </div>
        );
    };

    const containerBaseStyle = {
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
        minHeight: type === 'file' ? '100px' : '100%', 
    };

    const overlayStyle = {
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropBlur: '2px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: '600', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s',
        zIndex: 10
    };

    if (children) {
        return (
            <>
                <div onClick={() => setIsPickerOpen(true)} style={triggerStyle} className={className}>
                    {children}
                </div>
                <MediaPickerModal 
                    isOpen={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    onSelect={handleSelectFromPicker}
                    allowedTypes={[type]}
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
        <div className={`universal-media-input ${className}`} style={{ width: '100%', height: '100%' }}>
            <div 
                style={{ ...containerBaseStyle, ...triggerStyle }}
                onClick={() => setIsPickerOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {safeValue ? (
                    <>
                        {renderPreview()}
                        
                        <div style={overlayStyle}>
                            <span className="px-3 py-1.5 bg-black/50 rounded-lg text-sm border border-white/20">Змінити</span>
                        </div>

                        <button 
                            type="button" 
                            onClick={handleClear}
                            title="Очистити"
                            style={{
                                position: 'absolute', top: '6px', right: '6px',
                                background: 'rgba(0, 0, 0, 0.6)', color: 'white', border: 'none', borderRadius: '50%',
                                width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', zIndex: 20, transition: 'background 0.2s', padding: 0,
                                opacity: isHovered ? 1 : 0 
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--platform-danger)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
                        >
                            <X size={14} />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-sm font-medium p-4 text-center">
                        {type === 'image' && <ImageIcon size={24} className="opacity-50" />}
                        {type === 'video' && <Video size={24} className="opacity-50" />}
                        {type === 'file' && <FileText size={24} className="opacity-50" />}
                        {type === 'font' && <Type size={24} className="opacity-50" />}
                        <span className="opacity-70">{placeholder}</span>
                    </div>
                )}
            </div>

            <MediaPickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleSelectFromPicker}
                allowedTypes={
                    type === 'file' 
                    ? ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.ppt', '.pptx', '.csv'] 
                    : [type]
                }
                title={`Вибір ${type === 'image' ? 'зображення' : type === 'video' ? 'відео' : type === 'font' ? 'шрифту' : 'файлу'}`}
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

export default UniversalMediaInput;