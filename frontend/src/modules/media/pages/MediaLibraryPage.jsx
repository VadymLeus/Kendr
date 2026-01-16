// frontend/src/modules/media/pages/MediaLibraryPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import apiClient from '../../../shared/api/api';
import MediaGridItem from '../components/MediaGridItem';
import MediaInspector from '../components/MediaInspector';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { Button, Input, Select } from '../../../shared/ui/elements'; 
import { Upload, Search, X, Image, Video, FileText, Type, Music, Star, Check, Calendar, Download, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const FORMATS_BY_TYPE = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp'],
    video: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac'],
    document: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'],
    font: ['ttf', 'otf', 'woff', 'woff2'],
    all: []
};

const SORT_OPTIONS = [
    { value: 'date', label: 'За датою', icon: Calendar },
    { value: 'size', label: 'За розміром', icon: FileText },
    { value: 'name', label: 'За назвою', icon: Type }
];

const MediaLibraryPage = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeType, setActiveType] = useState('all'); 
    const [activeFormat, setActiveFormat] = useState(null);
    const [sortKey, setSortKey] = useState('date'); 
    const [sortDirection, setSortDirection] = useState('desc'); 
    const [onlyFavorites, setOnlyFavorites] = useState(false); 
    const [visibleCount, setVisibleCount] = useState(48);
    const [selectedFile, setSelectedFile] = useState(null);
    const [checkedFiles, setCheckedFiles] = useState(new Set());
    const lastSelectedIndex = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);
    const fileInputRef = useRef(null);
    const { confirm } = useConfirm();

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/media');
            const data = Array.isArray(res.data) ? res.data : [];
            setFiles(data);
        } catch (error) {
            console.error(error);
            toast.error('Помилка завантаження медіатеки');
            setFiles([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setActiveFormat(null);
    }, [activeType]);

    const filteredFiles = useMemo(() => {
        if (!files) return [];
        let result = [...files];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(f => {
                const name = f.display_name || f.original_file_name || '';
                return name.toLowerCase().includes(lowerQuery);
            });
        }

        if (onlyFavorites) {
            result = result.filter(f => f.is_favorite);
        }

        if (activeType !== 'all') {
            result = result.filter(f => {
                if (f.file_type === activeType) return true;
                const name = f.original_file_name || '';
                const ext = name.split('.').pop().toLowerCase();
                return FORMATS_BY_TYPE[activeType]?.includes(ext);
            });
        }

        if (activeFormat) {
            result = result.filter(f => {
                const name = f.original_file_name || '';
                const ext = name.split('.').pop().toLowerCase();
                if (activeFormat === 'jpg' && ext === 'jpeg') return true;
                return ext === activeFormat;
            });
        }

        result.sort((a, b) => {
            let valA, valB;
            switch (sortKey) {
                case 'size': valA = a.file_size_kb || 0; valB = b.file_size_kb || 0; break;
                case 'name': 
                    valA = (a.display_name || a.original_file_name || '').toLowerCase();
                    valB = (b.display_name || b.original_file_name || '').toLowerCase();
                    return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                case 'date':
                default:
                    valA = new Date(a.created_at || a.uploaded_at || 0).getTime();
                    valB = new Date(b.created_at || b.uploaded_at || 0).getTime();
                    break;
            }
            return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });

        return result;
    }, [files, searchQuery, activeType, activeFormat, sortDirection, sortKey, onlyFavorites]);

    const visibleFiles = filteredFiles.slice(0, visibleCount);
    const remainingCount = filteredFiles.length - visibleFiles.length;
    const handleLoadMore = () => setVisibleCount(prev => prev + 48);
    const handleClearFilters = () => {
        setSearchQuery('');
        setActiveType('all');
        setActiveFormat(null);
        setSortDirection('desc');
        setSortKey('date');
        setOnlyFavorites(false);
        setVisibleCount(48);
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
            setFiles(prev => [...validFiles, ...prev]);
            toast.success(`Завантажено ${validFiles.length} файлів`);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpdateFile = (updatedFile) => {
        setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
        if (selectedFile?.id === updatedFile.id) setSelectedFile(updatedFile);
    };

    const handleToggleFavorite = async (file, e) => {
        if (e) e.stopPropagation();
        try {
            const newStatus = !file.is_favorite;
            const updatedFile = { ...file, is_favorite: newStatus };
            handleUpdateFile(updatedFile);
            await apiClient.put(`/media/${file.id}`, { is_favorite: newStatus });
        } catch (error) {
            handleUpdateFile({ ...file, is_favorite: !file.is_favorite }); 
            toast.error("Не вдалося оновити статус");
        }
    };

    const handleDelete = async (file) => {
        const isConfirmed = await confirm({
            title: "Видалити файл?",
            message: "Ця дія незворотна.",
            type: "danger",
            confirmLabel: "Видалити"
        });

        if (isConfirmed) {
            try {
                await apiClient.delete(`/media/${file.id}`);
                setFiles(prev => prev.filter(f => f.id !== file.id));
                setSelectedFile(null);
                setCheckedFiles(prev => {
                    const next = new Set(prev);
                    next.delete(file.id);
                    return next;
                });
                toast.success('Файл видалено');
            } catch (error) {
                toast.error('Помилка видалення');
            }
        }
    };

    const handleSelectAll = () => {
        if (checkedFiles.size === filteredFiles.length && filteredFiles.length > 0) {
            setCheckedFiles(new Set());
        } else {
            const allIds = filteredFiles.map(f => f.id);
            setCheckedFiles(new Set(allIds));
        }
    };

    const handleCardClick = (file, index, e) => {
        if (e?.shiftKey || e?.ctrlKey || e?.metaKey) { 
            e.preventDefault(); 
            setCheckedFiles(prev => {
                const next = new Set(prev);
                if (next.has(file.id)) next.delete(file.id);
                else next.add(file.id);
                return next;
            });
            lastSelectedIndex.current = index;
        } 
        else {
            setSelectedFile(file);
            lastSelectedIndex.current = index;
        }
    };

    const handleCheckFile = (file, index, e) => {
        if (e?.shiftKey) {
            e.preventDefault();
        }
        setCheckedFiles(prev => {
            const next = new Set(prev);
            if (next.has(file.id)) {
                next.delete(file.id);
            } else {
                next.add(file.id);
            }
            return next;
        });
        lastSelectedIndex.current = index;
    };

    const handleBulkDelete = async () => {
        if (checkedFiles.size === 0) return;

        const isConfirmed = await confirm({
            title: `Видалити ${checkedFiles.size} файлів?`,
            message: "Ця дія незворотна.",
            type: "danger",
            confirmLabel: "Видалити все"
        });

        if (isConfirmed) {
            try {
                const deletePromises = Array.from(checkedFiles).map(id => apiClient.delete(`/media/${id}`));
                await Promise.all(deletePromises);

                setFiles(prev => prev.filter(f => !checkedFiles.has(f.id)));
                setCheckedFiles(new Set());
                setSelectedFile(null);
                toast.success('Файли видалено');
            } catch (error) {
                console.error(error);
                toast.error('Помилка під час видалення');
            }
        }
    };

    const handleBulkDownload = async () => {
        if (checkedFiles.size === 0) return;
        const filesToDownload = files.filter(f => checkedFiles.has(f.id));
        if (filesToDownload.length === 0) return;

        if (filesToDownload.length === 1) {
            const file = filesToDownload[0];
            downloadSingleFile(file);
        } else {
            toast.info(`Завантаження ${filesToDownload.length} файлів...`);
            for (let i = 0; i < filesToDownload.length; i++) {
                setTimeout(() => {
                    downloadSingleFile(filesToDownload[i]);
                }, i * 500); 
            }
        }
        setCheckedFiles(new Set());
    };

    const downloadSingleFile = async (file) => {
        try {
            const response = await fetch(`${API_URL}${file.path_full}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = file.original_file_name || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download error", err);
        }
    };

    const onDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleUpload({ target: { files } });
        }
    };

    const filterTypes = [
        { id: 'all', label: 'Всі', icon: null },
        { id: 'image', label: 'Фото', icon: Image },
        { id: 'video', label: 'Відео', icon: Video },
        { id: 'document', label: 'Док.', icon: FileText },
        { id: 'font', label: 'Шрифти', icon: Type },
        { id: 'audio', label: 'Аудіо', icon: Music },
    ];

    const styles = {
        pageWrapper: {
            margin: '-2rem', 
            width: 'calc(100% + 4rem)',
            height: 'calc(100vh - 64px + 4rem)', 
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--platform-bg)',
            color: 'var(--platform-text-primary)',
            overflow: 'hidden', 
            position: 'relative',
        },
        header: {
            padding: '12px 24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid var(--platform-border-color)',
            flexShrink: 0,
            backgroundColor: 'var(--platform-bg)',
            height: '60px', 
        },
        workspace: {
            display: 'flex',
            flex: 1,
            overflow: 'hidden', 
            position: 'relative'
        },
        mainContent: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0, 
            height: '100%', 
        },
        filtersBar: {
            padding: '12px 24px',
            borderBottom: '1px solid var(--platform-border-color)',
            backgroundColor: 'var(--platform-bg)',
            flexShrink: 0, 
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        topFilterRow: {
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            width: '100%',
            flexWrap: 'wrap',
        },
        bottomFilterRow: {
            display: 'flex', 
            gap: '8px', 
            alignItems: 'center',
            flexWrap: 'wrap',
            paddingTop: '4px'
        },
        filesGridArea: {
            flex: 1,
            overflowY: 'auto', 
            padding: '24px', 
            position: 'relative',
        },
        statusBar: {
            padding: '0 24px',
            height: '40px', 
            borderTop: '1px solid var(--platform-border-color)',
            backgroundColor: 'var(--platform-bg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--platform-text-secondary)',
            flexShrink: 0, 
            marginTop: 'auto'
        },
        bulkActionsContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px', 
            padding: '4px 8px', 
            background: 'transparent',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '6px',
            transition: 'all 0.2s'
        },
        fileNameTruncated: {
            maxWidth: '300px', 
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'right',
            fontWeight: 500
        },
        sidebar: {
            width: '360px',
            borderLeft: '1px solid var(--platform-border-color)',
            backgroundColor: 'var(--platform-bg)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 40,
            height: '100%',
            overflowY: 'auto',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.03)'
        },
    };

    return (
        <div 
            style={styles.pageWrapper} 
            onDragEnter={onDragEnter}
            onDragOver={onDragOver} 
            onDragLeave={onDragLeave} 
            onDrop={onDrop}
        >
            {isDragging && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 100,
                    backgroundColor: 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.1)',
                    border: '4px dashed var(--platform-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--platform-accent)', fontSize: '1.5rem', fontWeight: 'bold',
                    pointerEvents: 'none' 
                }}>
                    Перетягніть файли сюди
                </div>
            )}

            <div style={styles.header}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Медіатека</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button 
                        variant="primary"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <Upload size={18} /> 
                        <span>Завантажити</span>
                    </Button>
                    <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleUpload} />
                </div>
            </div>

            <div style={styles.workspace}>
                
                <div style={styles.mainContent}>
                    
                    <div style={styles.filtersBar}>
                        
                        <div style={styles.topFilterRow}>
                            <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                                <Input 
                                    placeholder="Пошук файлів..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    leftIcon={<Search size={18} />}
                                    rightIcon={searchQuery ? <X size={16} onClick={() => setSearchQuery('')} style={{cursor: 'pointer'}} /> : null}
                                    wrapperStyle={{ marginBottom: 0 }}
                                    style={{ height: '38px' }}
                                />
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                flexWrap: 'wrap', 
                                marginLeft: 'auto',
                                flexShrink: 0
                            }}>
                                <div style={{ width: '180px' }}>
                                    <Select 
                                        value={sortKey}
                                        onChange={(e) => setSortKey(e.target.value)}
                                        options={SORT_OPTIONS}
                                        placeholder="Сортування"
                                        style={{ height: '38px', padding: '6px 10px' }}
                                    />
                                </div>
                                
                                <Button 
                                    variant="outline"
                                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')} 
                                    title={sortDirection === 'asc' ? "За зростанням" : "За спаданням"}
                                    style={{ height: '38px', width: '38px', padding: 0, background: 'var(--platform-card-bg)' }}
                                >
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{sortDirection === 'desc' ? '↓' : '↑'}</span>
                                </Button>

                                <Button
                                    variant="square-accent"
                                    active={onlyFavorites}
                                    onClick={() => setOnlyFavorites(prev => !prev)}
                                    title="Тільки обрані"
                                    style={{ height: '38px', width: '38px' }}
                                >
                                    <Star size={20} fill={onlyFavorites ? "currentColor" : "none"} />
                                </Button>

                                <Button 
                                    variant="square-danger"
                                    onClick={handleClearFilters}
                                    title="Очистити всі фільтри"
                                    style={{ height: '38px', width: '38px' }}
                                >
                                    <X size={18} />
                                </Button>
                            </div>
                        </div>

                        <div style={styles.bottomFilterRow}>
                            {filterTypes.map(type => (
                                <Button
                                    key={type.id}
                                    variant="outline"
                                    onClick={() => { setActiveType(type.id); setVisibleCount(48); }}
                                    style={{
                                        borderRadius: '20px',
                                        padding: '6px 14px',
                                        fontSize: '0.85rem',
                                        height: '32px',
                                        border: activeType === type.id ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
                                        color: activeType === type.id ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                        background: activeType === type.id ? 'color-mix(in srgb, var(--platform-accent), transparent 90%)' : 'transparent'
                                    }}
                                >
                                    {type.icon && <type.icon size={14} />} {type.label}
                                </Button>
                            ))}
                            
                            {activeType !== 'all' && FORMATS_BY_TYPE[activeType]?.length > 0 && (
                                <>
                                    <div style={{ width: '1px', height: '24px', background: 'var(--platform-border-color)', margin: '0 8px', flexShrink: 0 }}></div>
                                    
                                    {FORMATS_BY_TYPE[activeType].map(fmt => (
                                        <Button
                                            key={fmt}
                                            variant="outline"
                                            onClick={() => setActiveFormat(activeFormat === fmt ? null : fmt)}
                                            style={{
                                                borderRadius: '6px', 
                                                padding: '4px 10px',
                                                fontSize: '0.8rem',
                                                height: '32px',
                                                textTransform: 'uppercase',
                                                border: activeFormat === fmt ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
                                                color: activeFormat === fmt ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                                background: activeFormat === fmt ? 'color-mix(in srgb, var(--platform-accent), transparent 90%)' : 'transparent'
                                            }}
                                        >
                                            {fmt}
                                        </Button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    <div 
                        style={styles.filesGridArea}
                        className="custom-scrollbar" 
                    >
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--platform-text-secondary)' }}>Завантаження...</div>
                        ) : filteredFiles.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', padding: '60px 20px', 
                                border: '2px dashed var(--platform-border-color)', borderRadius: '16px', color: 'var(--platform-text-secondary)', marginTop: '24px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p style={{ margin: 0, marginBottom: '16px' }}>Файлів не знайдено</p>
                                <Button 
                                    variant="primary"
                                    onClick={handleClearFilters}
                                >
                                    Очистити фільтри
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
                                    gap: '16px'
                                }}>
                                    {visibleFiles.map((file, index) => (
                                        <MediaGridItem 
                                            key={file.id} 
                                            file={file} 
                                            selected={selectedFile?.id === file.id}
                                            onSelect={(f, e) => handleCardClick(f, index, e)}
                                            onToggleFavorite={(e) => handleToggleFavorite(file, e)}
                                            isChecked={checkedFiles.has(file.id)}
                                            onCheck={(f, e) => handleCheckFile(f, index, e)}
                                        />
                                    ))}
                                </div>
                                {remainingCount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '20px' }}>
                                        <Button 
                                            variant="outline"
                                            onClick={handleLoadMore}
                                            style={{ borderRadius: '30px' }}
                                        >
                                            Показати ще ({remainingCount})
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    <div style={styles.statusBar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 500 }}>
                                Всього: {files.length} {filteredFiles.length !== files.length && `(Знайдено: ${filteredFiles.length})`}
                            </span>
                            
                            <Button 
                                variant="ghost"
                                onClick={handleSelectAll}
                                style={{
                                    fontSize: '0.8rem', fontWeight: 600,
                                    color: 'var(--platform-accent)',
                                    padding: '4px 8px', borderRadius: '6px'
                                }}
                            >
                                <Check size={14} />
                                {checkedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? 'Зняти все' : 'Вибрати все'}
                            </Button>
                        </div>

                        {checkedFiles.size > 0 && (
                            <div style={styles.bulkActionsContainer}>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                    Вибрано: {checkedFiles.size}
                                </span>
                                
                                <div style={{ width: '1px', height: '16px', background: 'var(--platform-border-color)' }}></div>
                                
                                <Button 
                                    variant="ghost"
                                    onClick={handleBulkDownload}
                                    title={checkedFiles.size > 1 ? "Завантажити архівом (послідовно)" : "Завантажити"}
                                    style={{
                                        fontSize: '0.8rem', fontWeight: 500, color: 'var(--platform-text-primary)',
                                        padding: '6px 8px', borderRadius: '4px'
                                    }}
                                >
                                    <Download size={14} />
                                    <span className="bulk-text">
                                        {checkedFiles.size > 1 ? 'Завантажити архівом' : 'Завантажити'}
                                    </span>
                                </Button>
                                
                                <div style={{ width: '1px', height: '16px', background: 'var(--platform-border-color)' }}></div>
                                
                                <Button 
                                    variant="ghost"
                                    onClick={handleBulkDelete}
                                    title="Видалити вибрані"
                                    style={{
                                        fontSize: '0.8rem', fontWeight: 500, color: '#e53e3e',
                                        padding: '6px 8px', borderRadius: '4px'
                                    }}
                                >
                                    <Trash2 size={14} />
                                    <span className="bulk-text">
                                        Видалити
                                    </span>
                                </Button>
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Обраний файл:</span>
                            <span 
                                style={styles.fileNameTruncated} 
                                title={selectedFile ? (selectedFile.original_file_name || selectedFile.display_name) : ''}
                            >
                                {selectedFile 
                                    ? (selectedFile.original_file_name || selectedFile.display_name) 
                                    : 'відсутній'
                                }
                            </span>
                        </div>
                    </div>

                </div>

                {selectedFile && (
                    <div 
                        style={styles.sidebar}
                        className="custom-scrollbar"
                    >
                        <MediaInspector 
                            file={selectedFile} 
                            onUpdate={handleUpdateFile}
                            onDelete={handleDelete}
                            onClose={() => setSelectedFile(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibraryPage;