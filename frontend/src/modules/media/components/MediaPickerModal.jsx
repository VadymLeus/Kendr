// frontend/src/modules/media/components/MediaPickerModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';
import { 
    IconSearch, IconX, IconUpload, IconCheck, IconImage, 
    IconCalendar, IconFileText, IconVideo, IconType, IconMusic
} from '../../../common/components/ui/Icons';

const API_URL = 'http://localhost:5000';

const MediaPickerModal = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    multiple = false, 
    title = "Вибір медіа",
    allowedTypes = ['image'] 
}) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFile, setActiveFile] = useState(null);
    const fileInputRef = useRef(null);

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

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/media');
            const data = Array.isArray(res.data) ? res.data : [];
            
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
        } catch (error) {
            console.error(error);
            toast.error('Помилка завантаження медіатеки');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const uploadPromises = Array.from(fileList).map(async (file) => {
            const formData = new FormData();
            formData.append('mediaFile', file);
            try {
                const res = await apiClient.post('/media/upload', formData);
                return res.data;
            } catch (err) {
                toast.error(`Помилка: ${file.name}`);
                return null;
            }
        });

        const newFiles = await Promise.all(uploadPromises);
        const validFiles = newFiles.filter(f => f !== null);
        
        if (validFiles.length > 0) {
            await fetchMedia(); 
            toast.success(`Завантажено ${validFiles.length} файлів`);
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
        onSelect(multiple ? selectedFiles : selectedFiles[0]);
        onClose();
    };

    const getFileIcon = (type, mime) => {
        const iconClasses = "text-(--platform-text-secondary) opacity-60";
        if (type === 'video') return <IconVideo size={40} className={iconClasses} />;
        if (type === 'font' || (mime && mime.includes('font'))) return <IconType size={40} className={iconClasses} />;
        if (type === 'audio') return <IconMusic size={40} className={iconClasses} />;
        return <IconFileText size={40} className={iconClasses} />;
    };

    if (!isOpen) return null;

    const filteredFiles = files.filter(f => 
        (f.original_file_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-2000 p-5">
            <div className="bg-(--platform-bg) w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col shadow-2xl border border-(--platform-border-color) overflow-hidden animate-[popIn_0.2s_ease-out]">
                <div className="p-4 px-6 bg-(--platform-card-bg) border-b border-(--platform-border-color) flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 font-semibold text-(--platform-text-primary)">
                        <IconImage size={20} />
                        <h3 className="text-lg m-0">{title}</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-(--platform-card-bg) border border-(--platform-border-color) text-(--platform-text-secondary) hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 cursor-pointer" 
                        title="Закрити"
                    >
                        <IconX size={20}/>
                    </button>
                </div>

                <div className="p-3 px-6 flex gap-4 bg-(--platform-bg) border-b border-(--platform-border-color) shrink-0">
                    <div className="relative flex-1">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-(--platform-text-secondary) pointer-events-none">
                            <IconSearch size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Пошук у медіатеці..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10! pr-3 rounded-lg border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-primary) text-sm focus:outline-none focus:border-(--platform-accent) transition-colors"
                        />
                    </div>
                    <button 
                        className="flex items-center gap-2 px-5 h-10 bg-(--platform-accent) text-white rounded-lg font-medium hover:bg-(--platform-accent-hover) transition-colors whitespace-nowrap cursor-pointer border-none" 
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <IconUpload size={16} /> Завантажити
                    </button>
                    <input 
                        type="file" multiple ref={fileInputRef} 
                        style={{display: 'none'}} onChange={handleUpload} 
                    />
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {loading ? (
                            <div className="p-12 text-center text-(--platform-text-secondary) italic">Завантаження...</div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="p-12 text-center text-(--platform-text-secondary) italic">
                                {files.length === 0 
                                    ? `Немає файлів типу: ${allowedTypes.join(', ')}` 
                                    : 'Нічого не знайдено за запитом'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5">
                                {filteredFiles.map(file => {
                                    const isSelected = selectedIds.has(file.id);
                                    const isActive = activeFile?.id === file.id;
                                    
                                    return (
                                        <div 
                                            key={file.id} 
                                            className={`
                                                aspect-square rounded-xl bg-(--platform-card-bg) border-2 overflow-hidden relative cursor-pointer shadow-sm transition-all duration-200
                                                hover:-translate-y-1 hover:shadow-md
                                                ${isSelected ? 'border-(--platform-accent)' : 'border-transparent'}
                                                ${isActive ? 'ring-2 ring-(--platform-accent) shadow-lg' : ''}
                                            `}
                                            onClick={() => handleFileClick(file)}
                                        >
                                            {file.file_type === 'image' ? (
                                                <img src={`${API_URL}${file.path_full}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-(--platform-bg)">
                                                    {getFileIcon(file.file_type, file.mime_type)}
                                                </div>
                                            )}
                                            
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-(--platform-accent) text-white flex items-center justify-center z-10 shadow-sm">
                                                    <IconCheck size={14} />
                                                </div>
                                            )}
                                            
                                            <div className="absolute bottom-0 left-0 right-0 p-1.5 px-2.5 bg-black/70 text-white text-xs truncate">
                                                {file.original_file_name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {activeFile && (
                        <div className="w-80 shrink-0 border-l border-(--platform-border-color) bg-(--platform-card-bg) p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar animate-[slideIn_0.2s_ease-out]">
                            <div className="w-full aspect-16/10 rounded-xl overflow-hidden border border-(--platform-border-color) bg-(--platform-bg) flex items-center justify-center shrink-0">
                                {activeFile.file_type === 'image' ? (
                                    <img src={`${API_URL}${activeFile.path_full}`} alt="" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-(--platform-text-secondary)">
                                        {getFileIcon(activeFile.file_type, activeFile.mime_type)}
                                        <span className="text-sm font-medium uppercase">{activeFile.file_type}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <p className="font-semibold m-0 break-all text-(--platform-text-primary)">
                                    {activeFile.original_file_name}
                                </p>
                                <div className="flex flex-col gap-1.5 text-sm text-(--platform-text-secondary)">
                                    <span className="flex items-center gap-2">
                                        <IconFileText size={14} className="opacity-70"/> {activeFile.file_size_kb} KB
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <IconCalendar size={14} className="opacity-70"/> {new Date(activeFile.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 px-6 border-t border-(--platform-border-color) bg-(--platform-card-bg) flex justify-between items-center shrink-0">
                    <div className="text-(--platform-text-primary) text-sm">
                        Вибрано: <b className="text-(--platform-accent)">{selectedIds.size}</b> {multiple ? 'файлів' : 'файл'}
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-5 py-2.5 bg-transparent border border-(--platform-border-color) text-(--platform-text-primary) rounded-lg font-medium transition-colors cursor-pointer hover:border-(--platform-accent) hover:text-(--platform-accent)"
                        >
                            Скасувати
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            className="px-6 py-2.5 bg-(--platform-accent) text-white border-none rounded-lg font-semibold hover:bg-(--platform-accent-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            disabled={selectedIds.size === 0}
                        >
                            Підтвердити
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `}</style>
        </div>,
        document.body
    );
};

export default MediaPickerModal;