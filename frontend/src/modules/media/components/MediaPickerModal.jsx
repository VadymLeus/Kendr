// frontend/src/modules/media/components/MediaPickerModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import MediaFilePreview from '../../../shared/ui/complex/MediaFilePreview';
import { getMediaUrl } from '../../../shared/utils/mediaUtils';
import ImageCropperModal from '../../../shared/ui/complex/ImageCropperModal';
import DragDropWrapper from '../../../shared/ui/complex/DragDropWrapper';
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
                    if (res.data.code === 'MAX_FILES_REACHED') {
                        break;
                    }
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
    const overlayStyle = {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
    };

    const modalStyle = {
        position: 'relative',
        backgroundColor: 'var(--platform-bg)', width: '100%', maxWidth: '1024px', height: '85vh',
        borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        border: '1px solid var(--platform-border-color)', overflow: 'hidden', animation: 'popIn 0.2s ease-out'
    };

    const headerStyle = {
        padding: '16px 24px', backgroundColor: 'var(--platform-card-bg)', borderBottom: '1px solid var(--platform-border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
    };

    const searchBarStyle = {
        padding: '12px 24px', display: 'flex', gap: '16px', backgroundColor: 'var(--platform-bg)', 
        borderBottom: '1px solid var(--platform-border-color)', flexShrink: 0, alignItems: 'center'
    };

    const searchInputStyle = {
        width: '100%', height: '40px', paddingLeft: '40px', paddingRight: '12px', borderRadius: '8px',
        border: '1px solid var(--platform-border-color)', backgroundColor: 'var(--platform-input-bg)',
        color: 'var(--platform-text-primary)', fontSize: '0.9rem', outline: 'none'
    };

    const footerStyle = {
        padding: '16px 24px', borderTop: '1px solid var(--platform-border-color)', backgroundColor: 'var(--platform-card-bg)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
    };

    const limitBadgeStyle = {
        display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px',
        backgroundColor: 'var(--platform-hover-bg)', borderRadius: '16px', fontSize: '0.8rem',
        color: 'var(--platform-text-secondary)', border: '1px solid var(--platform-border-color)',
        transition: 'all 0.3s'
    };

    const limitWarningStyle = {
        color: 'var(--platform-danger)', borderColor: 'color-mix(in srgb, var(--platform-danger), transparent 70%)',
        backgroundColor: 'color-mix(in srgb, var(--platform-danger), transparent 90%)' 
    };

    return ReactDOM.createPortal(
        <>
            <div style={overlayStyle}>
                <DragDropWrapper 
                    onDropFiles={handleUpload}
                    isError={isLimitReached}
                    errorText="Ліміт файлів вичерпано!"
                    style={modalStyle}
                >
                    <div style={headerStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'var(--platform-text-primary)' }}>
                            <Image size={20} color="var(--platform-accent)" />
                            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{title}</h3>
                        </div>
                        {limits && (
                            <div style={{ ...limitBadgeStyle, ...((!limits.isUnlimited && limits.percentageUsed >= 90) ? limitWarningStyle : {}) }}>
                                <HardDrive size={14} />
                                <span>Сховище: {limits.isUnlimited ? `${limits.currentFiles} / ∞` : `${limits.currentFiles} / ${limits.maxFiles}`}</span>
                            </div>
                        )}
                        <Button 
                            variant="outline" 
                            className="btn-icon-square"
                            style={{ width: '36px', height: '36px' }}
                            onClick={onClose}
                            title="Закрити"
                        >
                            <X size={20}/>
                        </Button>
                    </div>
                    <div style={searchBarStyle}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--platform-text-secondary)', pointerEvents: 'none' }}>
                                <Search size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Пошук у медіатеці..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                style={searchInputStyle} 
                                onFocus={e => e.target.style.borderColor = 'var(--platform-accent)'} 
                                onBlur={e => e.target.style.borderColor = 'var(--platform-border-color)'} 
                            />
                        </div>
                        <Button 
                            variant="primary"
                            icon={<Upload size={16} />}
                            style={{ height: '40px', whiteSpace: 'nowrap' }}
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
                            style={{display: 'none'}} 
                            onChange={handleUpload} 
                            accept={limits ? limits.allowedExtensions.join(',') : undefined} 
                        />
                    </div>
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="custom-scrollbar">
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--platform-text-secondary)', fontStyle: 'italic' }}>
                                    Завантаження...
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', textAlign: 'center', color: 'var(--platform-text-secondary)', fontStyle: 'italic', padding: '24px' }}>
                                    {files.length === 0 
                                        ? `Немає файлів типу: ${allowedTypes.join(', ')}` 
                                        : 'Нічого не знайдено за запитом'}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
                                    {filteredFiles.map(file => {
                                        const isSelected = selectedIds.has(file.id);
                                        const isActive = activeFile?.id === file.id;
                                        return (
                                            <div 
                                                key={file.id} 
                                                style={{
                                                    aspectRatio: '1/1', borderRadius: '12px', backgroundColor: 'var(--platform-card-bg)',
                                                    border: isSelected ? '2px solid var(--platform-accent)' : '2px solid transparent',
                                                    overflow: 'hidden', position: 'relative', cursor: 'pointer',
                                                    boxShadow: isActive ? '0 0 0 2px var(--platform-accent), 0 10px 15px -3px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.2s',
                                                    backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')",
                                                    backgroundRepeat: 'repeat'
                                                }}
                                                onClick={() => handleFileClick(file)}
                                            >
                                                <MediaFilePreview file={file} />
                                                {isSelected && (
                                                    <div style={{ 
                                                        position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px',
                                                        borderRadius: '50%', backgroundColor: 'var(--platform-accent)', color: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                                                    }}>
                                                        <Check size={14} />
                                                    </div>
                                                )}
                                                <div style={{ 
                                                    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 10px',
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                                    paddingTop: '24px', color: 'white', fontSize: '0.75rem', whiteSpace: 'nowrap',
                                                    overflow: 'hidden', textOverflow: 'ellipsis'
                                                }}>
                                                    {file.original_file_name}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {activeFile && (
                            <div style={{ 
                                width: '320px', flexShrink: 0, borderLeft: '1px solid var(--platform-border-color)',
                                backgroundColor: 'var(--platform-card-bg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
                                overflowY: 'auto' 
                            }} className="custom-scrollbar">
                                <div style={{ 
                                    width: '100%', aspectRatio: '16/10', borderRadius: '12px', overflow: 'hidden',
                                    border: '1px solid var(--platform-border-color)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0, position: 'relative', 
                                    backgroundColor: 'var(--platform-bg)',
                                    backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')",
                                    backgroundRepeat: 'repeat'
                                }}>
                                    <MediaFilePreview 
                                        file={activeFile} 
                                        showVideoControls={true} 
                                        onVideoMetadata={(e) => setVideoDuration(e.target.duration)} 
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <p style={{ fontWeight: 600, margin: 0, wordBreak: 'break-all', color: 'var(--platform-text-primary)' }}>
                                        {activeFile.original_file_name}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--platform-text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={14} style={{ opacity: 0.7 }}/> {activeFile.file_size_kb} KB
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} style={{ opacity: 0.7 }}/> {new Date(activeFile.created_at).toLocaleDateString()}
                                        </span>
                                        {activeFile.file_type === 'video' && videoDuration && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--platform-accent)' }}>
                                                <Clock size={14} /> Тривалість: {formatDuration(videoDuration)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div style={footerStyle}>
                        <div style={{ color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>
                            Вибрано: <b style={{ color: 'var(--platform-accent)' }}>{selectedIds.size}</b> {multiple ? 'файлів' : 'файл'}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button variant="outline" onClick={onClose}>
                                Скасувати
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleSubmit} 
                                disabled={selectedIds.size === 0}
                            >
                                {isCropMode ? 'Далі' : 'Підтвердити'}
                            </Button>
                        </div>
                    </div>
                </DragDropWrapper>
                <style>{`
                    @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                `}</style>
            </div>
            <ImageCropperModal
                isOpen={cropModalOpen}
                imageSrc={imageToCrop}
                aspect={aspect}
                onClose={() => setCropModalOpen(false)}
                onCropComplete={handleCropFinished}
            />
        </>,
        document.body
    );
};

export default MediaPickerModal;