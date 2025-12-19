// frontend/src/modules/media/components/MediaInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';
import styles from './MediaPickerModal.module.css';
import { 
    IconSearch, IconX, IconUpload, IconCheck, IconImage, 
    IconTrash, IconCalendar, IconFileText, IconVideo, IconType, IconMusic
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
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/media');
            const data = Array.isArray(res.data) ? res.data : [];
            
            const filtered = data.filter(f => {
                if (allowedTypes.includes('all')) return true;
                return allowedTypes.includes(f.file_type);
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
            const filteredNew = validFiles.filter(f => allowedTypes.includes('all') || allowedTypes.includes(f.file_type));
            
            if (filteredNew.length > 0) {
                setFiles(prev => [...filteredNew, ...prev]);
                if (!multiple) {
                    setSelectedIds(new Set([filteredNew[0].id]));
                    setActiveFile(filteredNew[0]);
                } else {
                    setSelectedIds(prev => {
                        const next = new Set(prev);
                        filteredNew.forEach(f => next.add(f.id));
                        return next;
                    });
                }
            }
            toast.success(`Завантажено ${validFiles.length} файлів`);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileClick = (file) => {
        setActiveFile(file);
        
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (multiple) {
                if (next.has(file.id)) next.delete(file.id);
                else next.add(file.id);
            } else {
                next.clear();
                next.add(file.id);
            }
            return next;
        });
    };

    const handleSubmit = () => {
        const selectedFiles = files.filter(f => selectedIds.has(f.id));
        onSelect(multiple ? selectedFiles : selectedFiles[0]);
        onClose();
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'video': return <IconVideo size={40} />;
            case 'font': return <IconType size={40} />;
            case 'audio': return <IconMusic size={40} />;
            default: return <IconFileText size={40} />;
        }
    };

    if (!isOpen) return null;

    const filteredFiles = files.filter(f => 
        (f.original_file_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <IconImage size={20} />
                        <h3>{title}</h3>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn} title="Закрити">
                        <IconX size={20}/>
                    </button>
                </div>

                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <div className={styles.searchIconWrapper}>
                            <IconSearch size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Пошук у медіатеці..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <button className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
                        <IconUpload size={16} /> Завантажити
                    </button>
                    <input 
                        type="file" multiple ref={fileInputRef} 
                        style={{display: 'none'}} onChange={handleUpload} 
                    />
                </div>

                <div className={styles.body}>
                    <div className={`${styles.gridContainer} custom-scrollbar`}>
                        {loading ? (
                            <div className={styles.emptyState}>Завантаження...</div>
                        ) : filteredFiles.length === 0 ? (
                            <div className={styles.emptyState}>Нічого не знайдено</div>
                        ) : (
                            <div className={styles.grid}>
                                {filteredFiles.map(file => {
                                    const isSelected = selectedIds.has(file.id);
                                    const isActive = activeFile?.id === file.id;
                                    return (
                                        <div 
                                            key={file.id} 
                                            className={`${styles.item} ${isSelected ? styles.itemSelected : ''} ${isActive ? styles.itemActive : ''}`}
                                            onClick={() => handleFileClick(file)}
                                        >
                                            {file.file_type === 'image' ? (
                                                <img src={`${API_URL}${file.path_full}`} alt="" />
                                            ) : (
                                                <div className={styles.filePlaceholder}>
                                                    {getFileIcon(file.file_type)}
                                                </div>
                                            )}
                                            {isSelected && <div className={styles.check}><IconCheck size={14} /></div>}
                                            <div className={styles.itemName}>{file.original_file_name}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {activeFile && (
                        <div className={`${styles.sidebar} custom-scrollbar`}>
                            <div className={styles.previewBox}>
                                {activeFile.file_type === 'image' ? (
                                    <img src={`${API_URL}${activeFile.path_full}`} alt="" />
                                ) : (
                                    <div className={styles.sidebarPlaceholder}>
                                        {getFileIcon(activeFile.file_type)}
                                        <span>{activeFile.file_type.toUpperCase()}</span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.details}>
                                <p className={styles.fileName}>{activeFile.original_file_name}</p>
                                <div className={styles.meta}>
                                    <span><IconFileText size={12}/> {activeFile.file_size_kb} KB</span>
                                    <span><IconCalendar size={12}/> {new Date(activeFile.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <div className={styles.selectionInfo}>
                        Вибрано: <b>{selectedIds.size}</b> {multiple ? 'файлів' : 'файл'}
                    </div>
                    <div className={styles.actions}>
                        <button onClick={onClose} className={styles.btnCancel}>Скасувати</button>
                        <button 
                            onClick={handleSubmit} 
                            className={styles.btnConfirm}
                            disabled={selectedIds.size === 0}
                        >
                            Підтвердити
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaPickerModal;