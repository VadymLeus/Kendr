// frontend/src/modules/media/pages/MediaLibraryPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import apiClient from '../../../common/services/api';
import MediaGridItem from '../components/MediaGridItem';
import MediaInspector from '../components/MediaInspector';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../common/hooks/useConfirm';
import { 
    IconUpload, 
    IconSearch, 
    IconX, 
    IconClear, 
    IconImage, 
    IconVideo, 
    IconFileText, 
    IconType,
    IconMusic,
    IconStar,
    IconTag,
    IconCheck,
    IconCalendar,
    IconDownload,
    IconTrash
} from '../../../common/components/ui/Icons';

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
    { value: 'date', label: 'За датою', icon: <IconCalendar size={14} /> },
    { value: 'size', label: 'За розміром', icon: <IconFileText size={14} /> },
    { value: 'name', label: 'За назвою', icon: <IconType size={14} /> }
];

const MediaLibraryPage = () => {
    // --- State ---
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- Фільтри та Сортування ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeType, setActiveType] = useState('all'); 
    const [activeFormat, setActiveFormat] = useState(null);

    const [sortKey, setSortKey] = useState('date'); 
    const [sortDirection, setSortDirection] = useState('desc'); 
    const [onlyFavorites, setOnlyFavorites] = useState(false); 
    const [visibleCount, setVisibleCount] = useState(48);
    
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef(null);
    
    // Вибір
    const [selectedFile, setSelectedFile] = useState(null);
    const [checkedFiles, setCheckedFiles] = useState(new Set());
    
    const lastSelectedIndex = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);
    
    const fileInputRef = useRef(null);
    const { confirm } = useConfirm();

    // --- Завантаження даних ---
    useEffect(() => {
        fetchMedia();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    // --- Логіка фільтрації ---
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

    // --- Handlers ---
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

    // --- Масові дії та Вибір ---
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
        { id: 'image', label: 'Фото', icon: IconImage },
        { id: 'video', label: 'Відео', icon: IconVideo },
        { id: 'document', label: 'Док.', icon: IconFileText },
        { id: 'font', label: 'Шрифти', icon: IconType },
        { id: 'audio', label: 'Аудіо', icon: IconMusic },
    ];

    const styles = {
        pageWrapper: {
            margin: '-2rem', 
            width: 'calc(100% + 4rem)',
            height: 'calc(100vh - 64px + 4rem)', 
            maxHeight: 'calc(100vh - 64px + 4rem)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--platform-bg, #ffffff)',
            color: 'var(--platform-text-primary, #111827)',
            overflow: 'hidden', 
            position: 'relative',
        },
        header: {
            padding: '12px 24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid var(--platform-border-color, #e5e7eb)',
            flexShrink: 0,
            backgroundColor: 'var(--platform-bg, #ffffff)',
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
            borderBottom: '1px solid var(--platform-border-color, #e5e7eb)',
            backgroundColor: 'var(--platform-bg, #ffffff)',
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
        },
        bottomFilterRow: {
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto', 
            paddingBottom: '4px', 
            scrollbarWidth: 'none',
            alignItems: 'center'
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
            borderTop: '1px solid var(--platform-border-color, #e5e7eb)',
            backgroundColor: 'var(--platform-bg, #ffffff)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--platform-text-secondary, #6b7280)',
            flexShrink: 0, 
            marginTop: 'auto'
        },
        bulkActionsContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px', 
            padding: '4px 8px', 
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
        },
        bulkBtn: (variant) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: variant === 'delete' ? '#e53e3e' : 'var(--platform-text-primary)',
            padding: '6px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
        }),
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
            borderLeft: '1px solid var(--platform-border-color, #e5e7eb)',
            backgroundColor: 'var(--platform-bg, #ffffff)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 40,
            height: '100%',
            overflowY: 'auto',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.03)'
        },
        searchWrapper: {
            position: 'relative',
            flex: 1, 
            minWidth: '200px', 
        },
        searchInput: {
            width: '100%',
            padding: '10px 36px',
            borderRadius: '8px',
            border: '1px solid var(--platform-border-color)',
            background: 'var(--platform-bg)',
            color: 'var(--platform-text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            height: '38px', 
            boxSizing: 'border-box'
        },
        filterChip: (isActive) => ({
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px',
            fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
            border: isActive 
                ? '1px solid var(--platform-accent, #3b82f6)' 
                : '1px solid var(--platform-border-color, #e5e7eb)',
            backgroundColor: isActive 
                ? 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.1)' 
                : 'transparent',
            color: isActive 
                ? 'var(--platform-accent, #3b82f6)' 
                : 'var(--platform-text-secondary, #6b7280)',
            whiteSpace: 'nowrap',
            flexShrink: 0 
        }),
        subFilterChip: (isActive) => ({
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            border: 'none',
            background: isActive ? 'var(--platform-text-primary)' : 'rgba(0,0,0,0.05)',
            color: isActive ? 'var(--platform-bg)' : 'var(--platform-text-secondary)',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            fontWeight: 600,
            flexShrink: 0 
        }),
        iconButton: (isActive) => ({
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '38px', borderRadius: '8px', cursor: 'pointer',
            border: isActive 
                ? '1px solid var(--platform-accent, #3b82f6)'
                : '1px solid var(--platform-border-color, #e5e7eb)',
            backgroundColor: isActive 
                ? 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.1)'
                : 'var(--platform-card-bg, #fff)',
            color: isActive 
                ? 'var(--platform-accent, #3b82f6)'
                : 'var(--platform-text-secondary, #6b7280)',
            transition: 'all 0.2s',
            flexShrink: 0 
        }),
        sortContainer: {
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'center',
            background: 'var(--platform-bg)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid var(--platform-border-color)',
            flexShrink: 0 
        },
        sortTrigger: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: 'var(--platform-text-primary, #111827)',
            minWidth: '130px',
            gap: '8px',
            userSelect: 'none'
        },
        sortDropdown: {
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            minWidth: '150px',
            backgroundColor: 'var(--platform-card-bg, #ffffff)',
            border: '1px solid var(--platform-border-color, #e5e7eb)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '4px'
        },
        sortOption: (isActive) => ({
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: isActive ? 'var(--platform-accent, #3b82f6)' : 'var(--platform-text-primary, #111827)',
            backgroundColor: isActive ? 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.05)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
        }),
        sortDirectionBtn: {
            padding: '8px 10px', 
            borderRadius: '6px', 
            border: 'none', 
            background: 'var(--platform-card-bg)', 
            color: 'var(--platform-text-primary)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minWidth: '40px',
            transition: 'all 0.2s',
            fontSize: '1.1rem',
            fontWeight: 'bold'
        },
        clearButton: {
            padding: '0',
            borderRadius: '8px',
            border: '1px solid var(--platform-border-color)',
            background: 'var(--platform-card-bg)',
            color: 'var(--platform-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px', 
            height: '38px',
            transition: 'all 0.2s',
            opacity: 1,
            flexShrink: 0 
        },
        loadMoreButton: {
            padding: '10px 24px',
            borderRadius: '30px',
            backgroundColor: 'var(--platform-card-bg)', 
            border: '1px solid var(--platform-border-color)',
            color: 'var(--platform-text-primary)', 
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
        }
    };

    return (
        <div 
            style={styles.pageWrapper} 
            onDragEnter={onDragEnter}
            onDragOver={onDragOver} 
            onDragLeave={onDragLeave} 
            onDrop={onDrop}
        >
            <style>{`
                .bulk-btn:hover {
                    background: rgba(0,0,0,0.05) !important;
                }
                .bulk-btn.delete:hover {
                    background: #fff5f5 !important;
                }
                
                @media (max-width: 1000px) {
                    .bulk-text {
                        display: none;
                    }
                    .bulk-btn {
                        padding: 6px !important;
                    }
                }
            `}</style>

            {isDragging && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 100,
                    backgroundColor: 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.1)',
                    border: '4px dashed var(--platform-accent, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--platform-accent, #3b82f6)', fontSize: '1.5rem', fontWeight: 'bold',
                    pointerEvents: 'none' 
                }}>
                    Перетягніть файли сюди
                </div>
            )}

            <div style={styles.header}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Медіатека</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        className="btn-primary"
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px', borderRadius: '8px',
                            backgroundColor: 'var(--platform-accent, #3b82f6)',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        <IconUpload size={18} /> 
                        <span>Завантажити</span>
                    </button>
                    <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleUpload} />
                </div>
            </div>

            <div style={styles.workspace}>
                
                <div style={styles.mainContent}>
                    
                    <div style={styles.filtersBar}>
                        
                        <div style={styles.topFilterRow}>
                            <div style={styles.searchWrapper}>
                                <button 
                                    onClick={() => {}} 
                                    style={{
                                        position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'transparent', border: 'none', color: 'var(--platform-text-secondary)',
                                        display: 'flex', alignItems: 'center', padding: 0
                                    }}
                                >
                                    <IconSearch size={18} />
                                </button>
                                
                                <input 
                                    type="text"
                                    placeholder="Пошук файлів..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={styles.searchInput}
                                />
                                
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')} 
                                        style={{
                                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'transparent', border: 'none', cursor: 'pointer',
                                            color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', padding: 0
                                        }}
                                    >
                                        <IconX size={16} />
                                    </button>
                                )}
                            </div>

                            <div style={styles.sortContainer}>
                                <div style={{ position: 'relative' }} ref={sortRef}>
                                    <div 
                                        style={styles.sortTrigger}
                                        onClick={() => setIsSortOpen(!isSortOpen)}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {SORT_OPTIONS.find(opt => opt.value === sortKey)?.icon}
                                            {SORT_OPTIONS.find(opt => opt.value === sortKey)?.label || 'Сортування'}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', transform: isSortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                            ▼
                                        </span>
                                    </div>
                                    
                                    {isSortOpen && (
                                        <div style={styles.sortDropdown}>
                                            {SORT_OPTIONS.map(opt => {
                                                const isActive = sortKey === opt.value;
                                                return (
                                                    <div
                                                        key={opt.value}
                                                        style={styles.sortOption(isActive)}
                                                        onClick={() => {
                                                            setSortKey(opt.value);
                                                            setIsSortOpen(false);
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {opt.icon}
                                                            {opt.label}
                                                        </div>
                                                        {isActive && (
                                                            <span style={{ color: 'var(--platform-accent)' }}>
                                                                {IconCheck ? <IconCheck size={14} /> : '✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')} 
                                    style={styles.sortDirectionBtn}
                                    title={sortDirection === 'asc' ? "За зростанням" : "За спаданням"}
                                >
                                    {sortDirection === 'desc' ? '↓' : '↑'}
                                </button>
                            </div>

                            <button 
                                onClick={() => setOnlyFavorites(prev => !prev)} 
                                style={{...styles.iconButton(onlyFavorites), height: '38px'}}
                                title="Тільки обрані"
                                onMouseEnter={(e) => {
                                    if (!onlyFavorites) {
                                        e.currentTarget.style.borderColor = 'var(--platform-accent)';
                                        e.currentTarget.style.color = 'var(--platform-accent)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!onlyFavorites) {
                                        e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                                        e.currentTarget.style.color = 'var(--platform-text-secondary)';
                                    }
                                }}
                            >
                                <IconStar size={20} filled={onlyFavorites} />
                            </button>

                            <button 
                                onClick={handleClearFilters}
                                style={styles.clearButton}
                                title="Очистити всі фільтри"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e53e3e';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.borderColor = '#e53e3e';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--platform-card-bg)';
                                    e.currentTarget.style.color = 'var(--platform-text-secondary)';
                                    e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                                }}
                            >
                                <IconClear size={18} />
                            </button>
                        </div>

                        <div style={styles.bottomFilterRow}>
                            {filterTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => { setActiveType(type.id); setVisibleCount(48); }}
                                    style={styles.filterChip(activeType === type.id)}
                                >
                                    {type.icon && <type.icon size={14} />} {type.label}
                                </button>
                            ))}
                            
                            {activeType !== 'all' && FORMATS_BY_TYPE[activeType]?.length > 0 && (
                                <>
                                    <div style={{ width: '1px', height: '24px', background: 'var(--platform-border-color)', margin: '0 8px', flexShrink: 0 }}></div>
                                    
                                    {FORMATS_BY_TYPE[activeType].map(fmt => (
                                        <button
                                            key={fmt}
                                            onClick={() => setActiveFormat(activeFormat === fmt ? null : fmt)}
                                            style={styles.subFilterChip(activeFormat === fmt)}
                                        >
                                            {fmt}
                                        </button>
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
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Завантаження...</div>
                        ) : filteredFiles.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', padding: '60px 20px', 
                                border: '2px dashed #e5e7eb', borderRadius: '16px', color: '#6b7280', marginTop: '24px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <IconSearch size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p style={{ margin: 0, marginBottom: '16px' }}>Файлів не знайдено</p>
                                <button 
                                    onClick={handleClearFilters}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'var(--platform-accent)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = 0.9}
                                    onMouseLeave={(e) => e.target.style.opacity = 1}
                                >
                                    Очистити фільтри
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
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
                                        <button 
                                            onClick={handleLoadMore}
                                            style={styles.loadMoreButton}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--platform-accent)';
                                                e.currentTarget.style.color = 'var(--platform-accent)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                                                e.currentTarget.style.color = 'var(--platform-text-primary)';
                                            }}
                                        >
                                            Показати ще ({remainingCount})
                                        </button>
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
                            
                            <button 
                                onClick={handleSelectAll}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    border: 'none', background: 'none',
                                    fontSize: '0.8rem', fontWeight: 600,
                                    cursor: 'pointer', color: 'var(--platform-accent)',
                                    padding: '4px 8px', borderRadius: '6px',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <IconCheck size={14} />
                                {checkedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? 'Зняти все' : 'Вибрати все'}
                            </button>
                        </div>

                        {checkedFiles.size > 0 && (
                            <div style={styles.bulkActionsContainer}>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                    Вибрано: {checkedFiles.size}
                                </span>
                                
                                <div style={{ width: '1px', height: '16px', background: 'var(--platform-border-color)' }}></div>
                                
                                <button 
                                    style={styles.bulkBtn('normal')} 
                                    className="bulk-btn"
                                    onClick={handleBulkDownload}
                                    title={checkedFiles.size > 1 ? "Завантажити архівом (послідовно)" : "Завантажити"}
                                >
                                    <IconDownload size={14} />
                                    <span className="bulk-text">
                                        {checkedFiles.size > 1 ? 'Завантажити архівом' : 'Завантажити'}
                                    </span>
                                </button>
                                
                                <div style={{ width: '1px', height: '16px', background: 'var(--platform-border-color)' }}></div>
                                
                                <button 
                                    style={styles.bulkBtn('delete')}
                                    className="bulk-btn delete"
                                    onClick={handleBulkDelete}
                                    title="Видалити вибрані"
                                >
                                    <IconTrash size={14} />
                                    <span className="bulk-text">
                                        Видалити
                                    </span>
                                </button>
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