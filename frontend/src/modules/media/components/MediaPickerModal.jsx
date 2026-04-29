// frontend/src/modules/media/components/MediaPickerModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import MediaFilePreview from '../../../shared/ui/complex/MediaFilePreview';
import { getMediaUrl } from '../../../shared/utils/mediaUtils';
import ImageCropperModal from '../../../shared/ui/complex/ImageCropperModal';
import DragDropWrapper from '../../../shared/ui/complex/DragDropWrapper';
import LoadingState from '../../../shared/ui/complex/LoadingState'; // <-- Додано імпорт
import { Button } from '../../../shared/ui/elements/Button';
import { Search, X, Upload, Check, Image, Calendar, FileText, Clock, HardDrive } from 'lucide-react';

const MediaPickerModal = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    multiple = false, 
    title = "Вибір медіа",
    allowedTypes = ['image'],
    aspect = null
}) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limits, setLimits] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFile, setActiveFile] = useState(null);
    const [videoDuration, setVideoDuration] = useState(null);
    const fileInputRef = useRef(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isUploadingCrop, setIsUploadingCrop] = useState(false);
    useEffect(() => {
        if (isOpen) {
            fetchMedia();
            setSelectedIds(new Set());
            setActiveFile(null);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        setVideoDuration(null);
    }, [activeFile]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const [mediaRes, limitsRes] = await Promise.all([
                apiClient.get('/media'),
                apiClient.get('/media/limits')
            ]);
            const data = Array.isArray(mediaRes.data) ? mediaRes.data : [];
            const filtered = data.filter(f => {
                if (allowedTypes.includes('all')) return true;
                return allowedTypes.some(type => {
                    if (f.file_type === type) return true;
                    if (f.mime_type === type) return true;
                    if (type.startsWith('.')) {
                        return f.original_file_name.toLowerCase().endsWith(type.toLowerCase());
                    }
                    return false;
                });
            });
            setFiles(filtered);
            setLimits(limitsRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Помилка завантаження медіатеки');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (eOrFiles) => {
        const fileList = eOrFiles.target ? eOrFiles.target.files : eOrFiles;
        if (!fileList || fileList.length === 0) return;
        const toastId = toast.loading("Завантаження...");
        let successCount = 0;
        let failedFiles = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const formData = new FormData();
            formData.append('mediaFile', file);
            try {
                const res = await apiClient.post('/media/upload', formData);
                if (res.data && res.data.error) {
                    failedFiles.push({ name: file.name, reason: res.data.message });
                    if (res.data.code === 'MAX_FILES_REACHED') break;
                    continue; 
                }
                if (res && res.data && res.data.id) {
                    successCount++;
                }
            } catch (err) {
                console.error("Помилка завантаження:", err);
                failedFiles.push({ 
                    name: file.name, 
                    reason: err.response?.data?.message || "Непередбачена помилка сервера" 
                });
            }
        }
        
        toast.dismiss(toastId);
        if (successCount > 0) {
            toast.success(`Успішно завантажено: ${successCount} файлів`);
            await fetchMedia(); 
        }
        
        if (failedFiles.length > 0) {
            const limit = 3; 
            const errorList = failedFiles.slice(0, limit)
                .map(f => `• ${f.name} (${f.reason})`)
                .join('\n');
            const moreCount = failedFiles.length - limit;
            const finalMessage = moreCount > 0 
                ? `Не завантажено ${failedFiles.length} файлів:\n${errorList}\n...та ще ${moreCount}`
                : `Не завантажено:\n${errorList}`;
            toast.error(
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    {finalMessage}
                </div>, 
                { autoClose: 7000 } 
            );
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileClick = (file) => {
        const isCurrentlySelected = selectedIds.has(file.id);
        const isCurrentlyActive = activeFile?.id === file.id;
        const newSelectedIds = new Set(selectedIds);
        if (multiple) {
            if (isCurrentlySelected) newSelectedIds.delete(file.id);
            else newSelectedIds.add(file.id);
        } else {
            if (isCurrentlySelected) {
                newSelectedIds.clear(); 
            } else {
                newSelectedIds.clear();
                newSelectedIds.add(file.id); 
            }
        }
        
        setSelectedIds(newSelectedIds);
        if (!multiple) {
            setActiveFile(newSelectedIds.has(file.id) ? file : null);
        } else {
            if (!isCurrentlySelected) {
                setActiveFile(file);
            } else {
                if (isCurrentlyActive) {
                    if (newSelectedIds.size === 0) {
                        setActiveFile(null);
                    } else {
                        const idsArray = Array.from(newSelectedIds);
                        const lastId = idsArray[idsArray.length - 1];
                        const lastFile = files.find(f => f.id === lastId);
                        setActiveFile(lastFile || null);
                    }
                }
            }
        }
    };

    const handleSubmit = () => {
        const selectedFiles = files.filter(f => selectedIds.has(f.id));
        if (selectedFiles.length === 0) {
            onClose();
            return;
        }
        if (aspect && !multiple && selectedFiles.length === 1) {
            const file = selectedFiles[0];
            if (file.file_type === 'image' || file.mime_type?.startsWith('image/')) {
                const fullUrl = getMediaUrl(file);
                setImageToCrop(fullUrl);
                setCropModalOpen(true);
                return;
            }
        }
        onSelect(multiple ? selectedFiles : selectedFiles[0]);
        onClose();
    };

    const handleCropFinished = async (croppedFileBlob) => {
        setIsUploadingCrop(true);
        try {
            const formData = new FormData();
            const originalName = activeFile?.original_file_name || 'image.jpg';
            const nameParts = originalName.split('.');
            const ext = nameParts.length > 1 ? nameParts.pop() : 'jpg';
            const newName = `${nameParts.join('.')}_crop.${ext}`;
            formData.append('mediaFile', croppedFileBlob, newName);
            const res = await apiClient.post('/media/upload', formData);
            if (res.data && res.data.error) {
                toast.error(res.data.message);
                return;
            }
            
            const uploadedFile = res.data;
            setFiles(prev => [uploadedFile, ...prev]);
            onSelect(uploadedFile);
            setCropModalOpen(false);
            onClose(); 
            toast.success('Зображення обрізано та збережено');
        } catch (error) {
            console.error('Upload crop error:', error);
            toast.error(error.response?.data?.message || 'Не вдалося зберегти обрізане зображення');
        } finally {
            setIsUploadingCrop(false);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;
    const filteredFiles = files.filter(f => 
        (f.original_file_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isLimitReached = limits && !limits.isUnlimited && limits.currentFiles >= limits.maxFiles;
    const isCropMode = aspect && !multiple && selectedIds.size === 1 && activeFile?.file_type === 'image';
    return ReactDOM.createPortal(
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-3000 p-4 sm:p-6">
                <DragDropWrapper 
                    onDropFiles={handleUpload}
                    isError={isLimitReached}
                    errorText="Ліміт файлів вичерпано!"
                    className="relative bg-(--platform-bg) w-full max-w-5xl h-[90vh] sm:h-[85vh] rounded-2xl flex flex-col shadow-2xl border border-(--platform-border-color) overflow-hidden animate-in zoom-in-95 duration-200"
                >
                    <div className="p-4 sm:px-6 sm:py-4 bg-(--platform-card-bg) border-b border-(--platform-border-color) flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3 font-semibold text-(--platform-text-primary)">
                            <Image size={24} className="text-(--platform-accent) hidden sm:block" />
                            <h3 className="m-0 text-lg sm:text-xl">{title}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {limits && (
                                <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all
                                    ${(!limits.isUnlimited && limits.percentageUsed >= 90) 
                                        ? 'text-(--platform-danger) border-[color-mix(in_srgb,var(--platform-danger),transparent_70%)] bg-[color-mix(in_srgb,var(--platform-danger),transparent_90%)]' 
                                        : 'text-(--platform-text-secondary) bg-(--platform-hover-bg) border-(--platform-border-color)'
                                    }
                                `}>
                                    <HardDrive size={14} className="shrink-0" />
                                    <span>Сховище: {limits.isUnlimited ? `${limits.currentFiles} / ∞` : `${limits.currentFiles} / ${limits.maxFiles}`}</span>
                                </div>
                            )}
                            <button 
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border-none text-(--platform-text-secondary) transition-colors cursor-pointer"
                                onClick={onClose}
                                title="Закрити"
                            >
                                <X size={20}/>
                            </button>
                        </div>
                    </div>
                    <div className="p-3 sm:px-6 sm:py-3 flex flex-col sm:flex-row gap-3 bg-(--platform-bg) border-b border-(--platform-border-color) shrink-0 items-stretch sm:items-center">
                        <div className="relative flex-1">
                            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-(--platform-text-secondary) pointer-events-none">
                                <Search size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Пошук у медіатеці..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                className="w-full h-10 pl-10 pr-3 rounded-lg border border-(--platform-border-color) bg-(--platform-input-bg) text-(--platform-text-primary) text-sm focus:outline-none focus:border-(--platform-accent) transition-colors"
                            />
                        </div>
                        <Button 
                            variant="primary"
                            icon={<Upload size={16} className="mr-1.5 shrink-0" />}
                            className="h-10 whitespace-nowrap justify-center w-full sm:w-auto"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLimitReached}
                            title={isLimitReached ? "Ліміт файлів вичерпано" : ""}
                        >
                            {isLimitReached ? 'Ліміт вичерпано' : 'Завантажити'}
                        </Button>
                        <input 
                            type="file" 
                            multiple 
                            ref={fileInputRef} 
                            className="hidden"
                            onChange={handleUpload} 
                            accept={limits ? limits.allowedExtensions.join(',') : undefined} 
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 overflow-hidden relative">
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 hide-scrollbar relative">
                            {loading ? (
                                <div className="flex items-center justify-center h-full min-h-50 text-(--platform-text-secondary) italic">
                                    <LoadingState />
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="flex items-center justify-center h-full min-h-50 text-center text-(--platform-text-secondary) italic px-4">
                                    {files.length === 0 
                                        ? `Немає файлів типу: ${allowedTypes.join(', ')}` 
                                        : 'Нічого не знайдено за запитом'}
                                </div>
                            ) : (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 sm:gap-4 pb-20 sm:pb-0">
                                    {filteredFiles.map(file => {
                                        const isSelected = selectedIds.has(file.id);
                                        const isActive = activeFile?.id === file.id;
                                        return (
                                            <div 
                                                key={file.id} 
                                                className={`
                                                    relative aspect-square rounded-xl bg-(--platform-card-bg) overflow-hidden cursor-pointer transition-all duration-200
                                                    ${isSelected ? 'border-2 border-(--platform-accent) scale-95 shadow-md' : 'border border-transparent shadow-sm'}
                                                    ${isActive && !isSelected ? 'ring-2 ring-(--platform-accent)/50 shadow-lg' : ''}
                                                `}
                                                style={{ backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')", backgroundRepeat: 'repeat' }}
                                                onClick={() => handleFileClick(file)}
                                            >
                                                <MediaFilePreview file={file} className="w-full h-full object-cover" />
                                                {isSelected && (
                                                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 rounded-full bg-(--platform-accent) text-white flex items-center justify-center z-10 shadow-sm animate-in zoom-in">
                                                        <Check size={14} className="shrink-0" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/85 to-transparent p-2 pt-6 text-white text-[11px] sm:text-xs whitespace-nowrap overflow-hidden text-ellipsis pointer-events-none">
                                                    {file.original_file_name}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {activeFile && (
                            <div className="absolute bottom-0 left-0 right-0 sm:relative sm:w-[320px] shrink-0 sm:border-l border-t sm:border-t-0 border-(--platform-border-color) bg-(--platform-sidebar-bg) p-4 sm:p-6 flex flex-row sm:flex-col gap-4 overflow-y-auto hide-scrollbar z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] sm:shadow-none max-h-[40vh] sm:max-h-none">
                                <div className="w-24 h-24 sm:w-full sm:h-auto sm:aspect-16/10 rounded-lg overflow-hidden border border-(--platform-border-color) flex items-center justify-center shrink-0 relative bg-(--platform-bg)" style={{ backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')" }}>
                                    <MediaFilePreview 
                                        file={activeFile} 
                                        showVideoControls={true} 
                                        onVideoMetadata={(e) => setVideoDuration(e.target.duration)} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 overflow-hidden flex-1">
                                    <p className="font-semibold m-0 break-all text-(--platform-text-primary) text-sm sm:text-base leading-tight">
                                        {activeFile.original_file_name}
                                    </p>
                                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-(--platform-text-secondary) mt-1">
                                        <span className="flex items-center gap-2 truncate">
                                            <FileText size={14} className="opacity-70 shrink-0" /> {activeFile.file_size_kb} KB
                                        </span>
                                        <span className="flex items-center gap-2 truncate">
                                            <Calendar size={14} className="opacity-70 shrink-0" /> {new Date(activeFile.created_at).toLocaleDateString()}
                                        </span>
                                        {activeFile.file_type === 'video' && videoDuration && (
                                            <span className="flex items-center gap-2 text-(--platform-accent) truncate">
                                                <Clock size={14} className="shrink-0" /> Тривалість: {formatDuration(videoDuration)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 sm:px-6 sm:py-4 border-t border-(--platform-border-color) bg-(--platform-card-bg) flex flex-row justify-between items-center shrink-0 z-30">
                        <div className="text-sm font-medium text-(--platform-text-primary) whitespace-nowrap">
                            Вибрано: <span className="text-(--platform-accent) font-bold">{selectedIds.size}</span>
                            <span className="hidden sm:inline"> {multiple ? 'файлів' : 'файл'}</span>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <Button variant="outline" onClick={onClose} className="h-10 px-3 sm:px-4">
                                Скасувати
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleSubmit} 
                                disabled={selectedIds.size === 0}
                                className="h-10 px-4 sm:px-6 min-w-25 justify-center"
                            >
                                {isCropMode ? 'Далі' : 'Підтвердити'}
                            </Button>
                        </div>
                    </div>
                </DragDropWrapper>
            </div>
            <ImageCropperModal
                isOpen={cropModalOpen}
                imageSrc={imageToCrop}
                aspect={aspect}
                onClose={() => setCropModalOpen(false)}
                onCropComplete={handleCropFinished}
            />
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>,
        document.body
    );
};

export default MediaPickerModal;