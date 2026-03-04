// frontend/src/modules/media/pages/MediaLibraryPage.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import apiClient from '../../../shared/api/api';
import MediaGridItem from '../components/MediaGridItem';
import MediaInspector from '../components/MediaInspector';
import SiteFilters from '../../../shared/ui/complex/SiteFilters';
import EmptyState from '../../../shared/ui/complex/EmptyState';
import LoadingState from '../../../shared/ui/complex/LoadingState';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { Button } from '../../../shared/ui/elements';
import { BASE_URL } from '../../../shared/config';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Upload, Search, Download, Trash2, Check, X as XIcon, HardDrive } from 'lucide-react';

const FILE_TYPES = [
    { id: 'image', name: 'Фото' },
    { id: 'video', name: 'Відео' },
    { id: 'font', name: 'Шрифти' }
];

const FORMATS_BY_TYPE = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp'],
    video: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    font: ['ttf', 'otf', 'woff', 'woff2'],
    all: []
};

const SORT_OPTIONS = [
    { value: 'created_at:desc', label: 'Дата' },
    { value: 'created_at:asc', label: 'Дата' },
    { value: 'file_size_kb:desc', label: 'Розмір' },
    { value: 'file_size_kb:asc', label: 'Розмір' },
    { value: 'original_file_name:asc', label: 'Назва' },
    { value: 'original_file_name:desc', label: 'Назва' }
];

const MediaLibraryPage = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limits, setLimits] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeType, setActiveType] = useState(null);
    const [activeFormat, setActiveFormat] = useState(null);
    const [sortOption, setSortOption] = useState('created_at:desc');
    const [onlyFavorites, setOnlyFavorites] = useState(false);
    const [visibleCount, setVisibleCount] = useState(48);
    const [selectedFile, setSelectedFile] = useState(null);
    const [checkedFiles, setCheckedFiles] = useState(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const lastSelectedIndex = useRef(null);
    const dragCounter = useRef(0);
    const fileInputRef = useRef(null);
    const { confirm } = useConfirm();
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mediaRes, limitsRes] = await Promise.all([
                apiClient.get('/media'),
                apiClient.get('/media/limits')
            ]);
            setFiles(Array.isArray(mediaRes.data) ? mediaRes.data : []);
            setLimits(limitsRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Помилка завантаження медіатеки');
        } finally {
            setLoading(false);
        }
    };

    const fetchLimits = async () => {
        try {
            const res = await apiClient.get('/media/limits');
            setLimits(res.data);
        } catch (error) {
            console.error("Помилка оновлення лімітів", error);
        }
    };

    useEffect(() => {
        setActiveFormat(null);
    }, [activeType]);

    const filteredFiles = useMemo(() => {
        if (!files) return [];
        let result = [...files];
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            result = result.filter(f => 
                (f.display_name || f.original_file_name || '').toLowerCase().includes(lowerQuery)
            );
        }
        if (onlyFavorites) {
            result = result.filter(f => f.is_favorite);
        }
        if (activeType) {
            result = result.filter(f => {
                if (f.file_type === activeType) return true;
                const ext = (f.original_file_name || '').split('.').pop().toLowerCase();
                return FORMATS_BY_TYPE[activeType]?.includes(ext);
            });
        }
        if (activeFormat) {
            result = result.filter(f => {
                const ext = (f.original_file_name || '').split('.').pop().toLowerCase();
                if (activeFormat === 'jpg' && ext === 'jpeg') return true;
                return ext === activeFormat;
            });
        }
        const [key, dir] = sortOption.split(':');
        result.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];
            if (key === 'original_file_name' || key === 'display_name') {
                valA = (valA || '').toLowerCase();
                valB = (valB || '').toLowerCase();
                return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (key === 'created_at') {
                valA = new Date(valA || 0).getTime();
                valB = new Date(valB || 0).getTime();
            } else {
                valA = Number(valA || 0);
                valB = Number(valB || 0);
            }
            if (valA < valB) return dir === 'asc' ? -1 : 1;
            if (valA > valB) return dir === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [files, searchTerm, activeType, activeFormat, sortOption, onlyFavorites]);
    const visibleFiles = filteredFiles.slice(0, visibleCount);
    const remainingCount = filteredFiles.length - visibleFiles.length;
    const handleUpload = async (e) => {
        const fileList = e.target.files;
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
                    setFiles(prev => [res.data, ...prev]);
                    successCount++;
                }
            } catch (err) {
                console.error("Справжня помилка завантаження:", err);
                failedFiles.push({ 
                    name: file.name, 
                    reason: err.response?.data?.message || "Непередбачена помилка сервера" 
                });
            }
        }

        toast.dismiss(toastId);
        if (successCount > 0) {
            toast.success(`Успішно завантажено: ${successCount} файлів`);
            fetchLimits(); 
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

    const handleUpdateFile = useCallback((updatedFile) => {
        setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
        setSelectedFile(prev => prev?.id === updatedFile.id ? updatedFile : prev);
    }, []);

    const handleToggleFavorite = useCallback(async (file) => {
        const newStatus = !file.is_favorite;
        handleUpdateFile({ ...file, is_favorite: newStatus });
        try {
            await apiClient.put(`/media/${file.id}`, { is_favorite: newStatus });
        } catch (error) {
            handleUpdateFile({ ...file, is_favorite: !newStatus });
        }
    }, [handleUpdateFile]);

    const handleDelete = async (file) => {
        if (await confirm({ title: "Видалити файл?", message: "Ця дія незворотна.", type: "danger", confirmLabel: "Видалити" })) {
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
                fetchLimits();
            } catch (error) {
            }
        }
    };

    const handleCheckFile = useCallback((file, index, e) => {
        if (e?.shiftKey && lastSelectedIndex.current !== null) {
            const start = Math.min(lastSelectedIndex.current, index);
            const end = Math.max(lastSelectedIndex.current, index);
            const filesRange = visibleFiles.slice(start, end + 1);
            setCheckedFiles(prev => {
                const next = new Set(prev);
                filesRange.forEach(f => next.add(f.id));
                return next;
            });
        } else {
            setCheckedFiles(prev => {
                const next = new Set(prev);
                next.has(file.id) ? next.delete(file.id) : next.add(file.id);
                return next;
            });
        }
        lastSelectedIndex.current = index;
    }, [visibleFiles]);

    const handleCardClick = useCallback((file, index, e) => {
        if (e?.ctrlKey || e?.metaKey) {
            handleCheckFile(file, index, e);
        } else {
            setSelectedFile(prev => (prev && prev.id === file.id ? null : file));
            lastSelectedIndex.current = index;
        }
    }, [handleCheckFile]);

    const handleGridBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            setSelectedFile(null);
        }
    };

    const handleSelectAll = () => {
        setCheckedFiles(new Set(filteredFiles.map(f => f.id)));
    };

    const handleDeselectAll = () => {
        setCheckedFiles(new Set());
    };

    const handleBulkDelete = async () => {
        if (checkedFiles.size === 0) return;
        if (await confirm({ title: `Видалити ${checkedFiles.size} файлів?`, type: "danger", confirmLabel: "Видалити все" })) {
            const toastId = toast.loading("Видалення...");
            try {
                await Promise.all(Array.from(checkedFiles).map(id => apiClient.delete(`/media/${id}`)));
                setFiles(prev => prev.filter(f => !checkedFiles.has(f.id)));
                setCheckedFiles(new Set());
                setSelectedFile(null);
                toast.success('Файли видалено');
                fetchLimits();
            } catch (err) { 
            } finally {
                toast.dismiss(toastId);
            }
        }
    };

    const handleBulkDownload = async () => {
        const filesToDownload = files.filter(f => checkedFiles.has(f.id));
        if (filesToDownload.length === 0) return;
        if (filesToDownload.length === 1) {
            const file = filesToDownload[0];
            try {
                const response = await fetch(`${BASE_URL}${file.path_full}`);
                if (!response.ok) throw new Error('Network error');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = file.original_file_name || `download-${Date.now()}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error("Download failed:", error);
                toast.error("Помилка при завантаженні файлу");
            }
            setCheckedFiles(new Set());
            return;
        }
        const toastId = toast.loading(`Збираємо архів з ${filesToDownload.length} файлів...`);
        try {
            const zip = new JSZip();
            const fetchPromises = filesToDownload.map(async (file) => {
                const response = await fetch(`${BASE_URL}${file.path_full}`);
                if (!response.ok) throw new Error(`Failed to fetch ${file.original_file_name}`);
                const blob = await response.blob();
                const fileName = file.original_file_name || `file_${file.id}`;
                zip.file(fileName, blob);
            });
            await Promise.all(fetchPromises);
            const zipContent = await zip.generateAsync({ type: 'blob' });
            saveAs(zipContent, `media_export_${Date.now()}.zip`);
            toast.update(toastId, { render: "Архів успішно завантажено!", type: "success", isLoading: false, autoClose: 3000 });
            setCheckedFiles(new Set());
        } catch (error) {
            console.error("ZIP Generation failed:", error);
            toast.update(toastId, { render: "Помилка при створенні архіву", type: "error", isLoading: false, autoClose: 3000 });
        }
    };
    
    const onDragEvent = (e, active) => {
        e.preventDefault(); e.stopPropagation();
        if (active !== undefined) {
             if (active) dragCounter.current += 1;
             else dragCounter.current -= 1;
             if (dragCounter.current > 0) setIsDragging(true);
             else setIsDragging(false);
        }
    };
    
    const onDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        const files = e.dataTransfer.files;
        if (files && files.length > 0) handleUpload({ target: { files } });
    };

    const styles = {
        pageWrapper: {
            flex: 1,
            minHeight: 0,
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: 'var(--platform-bg)', 
            position: 'relative',
        },
        headerBlock: {
            flexShrink: 0,
            backgroundColor: 'var(--platform-bg)',
            borderBottom: '1px solid var(--platform-border-color)',
            zIndex: 10,
        },
        headerContent: {
            padding: '12px 24px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '60px', 
            borderBottom: '1px solid var(--platform-border-color)',
            color: 'var(--platform-text-primary)',
            position: 'relative'
        },
        mainContent: {
            display: 'flex',
            flex: 1, 
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
        },
        gridArea: { 
            flex: 1, 
            padding: '24px', 
            overflowY: 'auto',
            minWidth: 0, 
        },
        grid: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '16px', 
            paddingBottom: '24px' 
        },
        inspectorPanel: {
            width: '360px',
            borderLeft: '1px solid var(--platform-border-color)',
            overflowY: 'auto',
            flexShrink: 0,
            backgroundColor: 'var(--platform-bg)',
            zIndex: 5
        },
        stickyFooter: {
            flexShrink: 0,
            padding: '0 24px', 
            height: '48px', 
            borderTop: '1px solid var(--platform-border-color)',
            backgroundColor: 'var(--platform-bg)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '0.8rem', 
            color: 'var(--platform-text-secondary)', 
            zIndex: 10
        },
        formatChip: (isActive) => ({
            padding: '0 12px', borderRadius: '20px', fontSize: '0.75rem', textTransform: 'uppercase', cursor: 'pointer',
            border: `1px solid ${isActive ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
            color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
            background: isActive ? 'color-mix(in srgb, var(--platform-accent), transparent 90%)' : 'transparent',
            transition: 'all 0.2s',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 500
        }),
        limitBadge: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            backgroundColor: 'var(--platform-hover-bg)',
            borderRadius: '16px',
            fontSize: '0.8rem',
            color: 'var(--platform-text-secondary)',
            border: '1px solid var(--platform-border-color)',
            transition: 'all 0.3s'
        },
        limitWarning: {
            color: 'var(--platform-danger)',
            borderColor: 'color-mix(in srgb, var(--platform-danger), transparent 70%)',
            backgroundColor: 'color-mix(in srgb, var(--platform-danger), transparent 90%)' 
        }
    };
    
    const formatButtons = (activeType && FORMATS_BY_TYPE[activeType]?.length > 0) ? (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button style={styles.formatChip(!activeFormat)} onClick={() => setActiveFormat(null)}>Всі формати</button>
            {FORMATS_BY_TYPE[activeType].map(fmt => (
                <button key={fmt} style={styles.formatChip(activeFormat === fmt)} onClick={() => setActiveFormat(activeFormat === fmt ? null : fmt)}>
                    {fmt}
                </button>
            ))}
        </div>
    ) : null;
    
    const isLimitReached = limits && !limits.isUnlimited && limits.currentFiles >= limits.maxFiles;
    return (
        <div style={styles.pageWrapper} 
            onDragEnter={(e) => onDragEvent(e, true)} onDragLeave={(e) => onDragEvent(e, false)} 
            onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
        >
            {isDragging && !isLimitReached && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 200, 
                    backgroundColor: 'color-mix(in srgb, var(--platform-accent), transparent 90%)', 
                    border: '4px dashed var(--platform-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--platform-accent)', fontSize: '1.5rem', fontWeight: 'bold', pointerEvents: 'none',
                    margin: '2rem' 
                }}>
                    Перетягніть файли сюди
                </div>
            )}
            
            {isDragging && isLimitReached && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 200, 
                    backgroundColor: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', 
                    border: '4px dashed var(--platform-danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--platform-danger)', fontSize: '1.5rem', fontWeight: 'bold', pointerEvents: 'none',
                    margin: '2rem' 
                }}>
                    Ліміт файлів вичерпано!
                </div>
            )}

            <div style={styles.headerBlock}>
                <div style={styles.headerContent}>
                    {limits && (
                        <div style={{ position: 'absolute', left: '24px', display: 'flex', alignItems: 'center' }}>
                            <div style={{ ...styles.limitBadge, ...((!limits.isUnlimited && limits.percentageUsed >= 90) ? styles.limitWarning : {}) }}>
                                <HardDrive size={14} />
                                <span>Сховище: {limits.isUnlimited ? `${limits.currentFiles} / ∞` : `${limits.currentFiles} / ${limits.maxFiles}`}</span>
                            </div>
                        </div>
                    )}
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>Медіатека</h1>
                    <div style={{ position: 'absolute', right: '24px', display: 'flex', gap: '10px' }}>
                        <Button 
                            variant="primary" 
                            type="button" 
                            onClick={() => fileInputRef.current.click()}
                            disabled={isLimitReached}
                        >
                            <Upload size={18} /> 
                            <span>{isLimitReached ? 'Ліміт вичерпано' : 'Завантажити'}</span>
                        </Button>
                        <input 
                            type="file" 
                            multiple 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleUpload}
                            accept={limits ? limits.allowedExtensions.join(',') : undefined} 
                        />
                    </div>
                </div>
                <SiteFilters 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    sortOptions={SORT_OPTIONS}
                    tags={FILE_TYPES}
                    selectedTag={activeType}
                    onTagSelect={setActiveType}
                    showStarFilter={true}
                    isStarActive={onlyFavorites}
                    onStarClick={() => setOnlyFavorites(!onlyFavorites)}
                    afterTags={formatButtons}
                />
            </div>
            <div style={styles.mainContent}>
                <div 
                    style={{
                        ...styles.gridArea,
                        ...(!loading && filteredFiles.length === 0 ? { 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                        } : {})
                    }} 
                    onClick={handleGridBackgroundClick}
                >
                    {loading ? (
                        <LoadingState />
                    ) : filteredFiles.length === 0 ? (
                        <EmptyState 
                            title="Файлів не знайдено"
                            description="Спробуйте змінити фільтри або завантажити нові файли"
                            icon={Search}
                            action={
                                (searchTerm || activeType || onlyFavorites) && (
                                    <Button variant="ghost" onClick={() => { setSearchTerm(''); setActiveType(null); setOnlyFavorites(false); }}>
                                        Очистити фільтри
                                    </Button>
                                )
                            }
                        />
                    ) : (
                        <>
                            <div style={styles.grid}>
                                {visibleFiles.map((file, index) => (
                                    <MediaGridItem 
                                        key={file.id} 
                                        file={file} 
                                        selected={selectedFile?.id === file.id}
                                        onSelect={(f, e) => handleCardClick(f, index, e)}
                                        onToggleFavorite={() => handleToggleFavorite(file)}
                                        isChecked={checkedFiles.has(file.id)}
                                        onCheck={(f, e) => handleCheckFile(f, index, e)}
                                    />
                                ))}
                            </div>
                            {remainingCount > 0 && (
                                <div style={{ textAlign: 'center', marginTop: '30px', paddingBottom: '20px' }}>
                                    <Button variant="outline" onClick={() => setVisibleCount(p => p + 48)} style={{ borderRadius: '30px' }}>
                                        Показати ще ({remainingCount})
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {selectedFile && (
                    <div style={styles.inspectorPanel} className="hide-scrollbar">
                        <style>{`
                            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                            .hide-scrollbar::-webkit-scrollbar { display: none; }
                        `}</style>
                        <MediaInspector 
                            file={selectedFile} 
                            onUpdate={handleUpdateFile}
                            onDelete={handleDelete}
                            onClose={() => setSelectedFile(null)}
                        />
                    </div>
                )}
            </div>
            <div style={styles.stickyFooter}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>Виділено: {checkedFiles.size} з {files.length}</span>
                    <div style={{ width: '1px', height: '16px', background: 'var(--platform-border-color)' }} />
                    <Button variant="ghost" onClick={handleSelectAll} style={{ fontSize: '0.8rem', padding: '4px' }}>
                        <Check size={14} /> Вибрати все
                    </Button>
                    {checkedFiles.size > 0 && (
                        <Button 
                            variant="ghost" 
                            onClick={handleDeselectAll} 
                            style={{ fontSize: '0.8rem', padding: '4px', color: 'var(--platform-text-secondary)' }}
                            title="Скинути виділення"
                        >
                            <XIcon size={14} /> Скинути ({checkedFiles.size})
                        </Button>
                    )}
                </div>
                {checkedFiles.size > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button variant="ghost" onClick={handleBulkDownload} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                            <Download size={14} /> Завантажити
                        </Button>
                        <Button 
                            variant="ghost"
                            onClick={handleBulkDelete} 
                            style={{ fontSize: '0.8rem', padding: '4px 8px', color: 'var(--platform-danger)' }}
                        >
                            <Trash2 size={14} /> Видалити
                        </Button>
                    </div>
                ) : (
                    <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedFile ? (selectedFile.original_file_name || selectedFile.display_name) : 'Файл не обрано'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibraryPage;