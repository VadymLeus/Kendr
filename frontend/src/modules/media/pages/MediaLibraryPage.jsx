// frontend/src/modules/media/pages/MediaLibraryPage.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import apiClient from '../../../shared/api/api';
import MediaGridItem from '../components/MediaGridItem';
import MediaInspector from '../components/MediaInspector';
import SiteFilters from '../../../shared/ui/complex/SiteFilters';
import EmptyState from '../../../shared/ui/complex/EmptyState';
import LoadingState from '../../../shared/ui/complex/LoadingState';
import DragDropWrapper from '../../../shared/ui/complex/DragDropWrapper';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { Button } from '../../../shared/ui/elements';
import { BASE_URL } from '../../../shared/config';
import { FILE_LIMITS } from '../../../shared/config/limits';
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
    const lastSelectedIndex = useRef(null);
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
    const handleUpload = async (eOrFiles) => {
        const fileList = eOrFiles.target ? eOrFiles.target.files : eOrFiles;
        if (!fileList || fileList.length === 0) return;
        const toastId = toast.loading("Завантаження...");
        let successCount = 0;
        let failedFiles = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.size > FILE_LIMITS.MEDIA_LIBRARY.MAX_SIZE) {
                failedFiles.push({ 
                    name: file.name, 
                    reason: `Розмір перевищує ${FILE_LIMITS.MEDIA_LIBRARY.MAX_SIZE / (1024 * 1024)}MB` 
                });
                continue;
            }
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

    const getDownloadUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `${BASE_URL}${path}`;
    };

    const handleBulkDownload = async () => {
        const filesToDownload = files.filter(f => checkedFiles.has(f.id));
        if (filesToDownload.length === 0) return;
        if (filesToDownload.length === 1) {
            const file = filesToDownload[0];
            try {
                const response = await fetch(getDownloadUrl(file.path_full));
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
                const response = await fetch(getDownloadUrl(file.path_full));
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

    const handleBulkDelete = async () => {
        const filesToDelete = files.filter(f => checkedFiles.has(f.id));
        if (filesToDelete.length === 0) return;
        if (await confirm({ title: "Видалити вибрані файли?", message: `Ви впевнені, що хочете видалити ${filesToDelete.length} файлів? Ця дія незворотна.`, type: "danger", confirmLabel: "Видалити" })) {
            const toastId = toast.loading(`Видалення ${filesToDelete.length} файлів...`);
            try {
                const deletePromises = filesToDelete.map(file => apiClient.delete(`/media/${file.id}`));
                await Promise.all(deletePromises);
                setFiles(prev => prev.filter(f => !checkedFiles.has(f.id)));
                setCheckedFiles(new Set());
                setSelectedFile(null);
                toast.update(toastId, { render: "Файли успішно видалено", type: "success", isLoading: false, autoClose: 3000 });
                fetchLimits();
            } catch (error) {
                console.error("Bulk delete failed:", error);
                toast.update(toastId, { render: "Помилка при видаленні файлів", type: "error", isLoading: false, autoClose: 3000 });
            }
        }
    };

    const formatButtons = (activeType && FORMATS_BY_TYPE[activeType]?.length > 0) ? (
        <div className="flex gap-2 items-center shrink-0">
            <button 
                className={`h-8 px-3 rounded-full text-xs font-medium uppercase transition-colors whitespace-nowrap border shrink-0 ${!activeFormat ? 'border-(--platform-accent) text-(--platform-accent) bg-[color-mix(in_srgb,var(--platform-accent),transparent_90%)]' : 'border-(--platform-border-color) text-(--platform-text-secondary) bg-transparent hover:bg-(--platform-hover-bg)'}`} 
                onClick={() => setActiveFormat(null)}
            >
                Всі формати
            </button>
            {FORMATS_BY_TYPE[activeType].map(fmt => (
                <button 
                    key={fmt} 
                    className={`h-8 px-3 rounded-full text-xs font-medium uppercase transition-colors whitespace-nowrap border shrink-0 ${activeFormat === fmt ? 'border-(--platform-accent) text-(--platform-accent) bg-[color-mix(in_srgb,var(--platform-accent),transparent_90%)]' : 'border-(--platform-border-color) text-(--platform-text-secondary) bg-transparent hover:bg-(--platform-hover-bg)'}`} 
                    onClick={() => setActiveFormat(activeFormat === fmt ? null : fmt)}
                >
                    {fmt}
                </button>
            ))}
        </div>
    ) : null;

    const isLimitReached = limits && !limits.isUnlimited && limits.currentFiles >= limits.maxFiles;
    return (
        <DragDropWrapper 
            onDropFiles={handleUpload}
            isError={isLimitReached}
            errorText="Ліміт файлів вичерпано!"
            className="flex flex-col flex-1 min-h-0 bg-(--platform-bg) relative"
        >
            <div className="shrink-0 bg-(--platform-bg) z-10 flex flex-col">
                <div className="h-auto sm:h-16 px-4 sm:px-6 py-4 sm:py-0 border-b border-(--platform-border-color) flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <div className="w-full sm:w-1/3 flex justify-center sm:justify-start shrink-0">
                        {limits && (
                            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border shadow-sm transition-colors ${(!limits.isUnlimited && limits.percentageUsed >= 90) ? 'text-(--platform-danger) border-[color-mix(in_srgb,var(--platform-danger),transparent_70%)] bg-[color-mix(in_srgb,var(--platform-danger),transparent_90%)]' : 'text-(--platform-text-secondary) bg-(--platform-card-bg) border-(--platform-border-color)'}`}>
                                <HardDrive size={16} className="shrink-0" />
                                <span>Сховище: {limits.isUnlimited ? `${limits.currentFiles} / ∞` : `${limits.currentFiles} / ${limits.maxFiles}`}</span>
                            </div>
                        )}
                    </div>
                    <div className="w-full sm:w-1/3 flex justify-center shrink-0">
                        <h1 className="text-xl font-bold m-0 text-(--platform-text-primary)">
                            Медіатека
                        </h1>
                    </div>
                    <div className="w-full sm:w-1/3 flex justify-center sm:justify-end shrink-0">
                        <Button 
                            variant="primary" 
                            type="button" 
                            onClick={() => fileInputRef.current.click()}
                            disabled={isLimitReached}
                            className="w-full sm:w-auto h-10 shadow-sm"
                        >
                            <Upload size={18} className="shrink-0 mr-1.5" /> 
                            <span>{isLimitReached ? 'Ліміт вичерпано' : 'Завантажити'}</span>
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
            <div className="flex flex-1 min-h-0 overflow-hidden relative">
                <div 
                    className={`flex-1 p-4 sm:p-6 overflow-y-auto min-w-0 ${!loading && filteredFiles.length === 0 ? 'flex flex-col items-center justify-center' : ''}`}
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
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 sm:gap-4 pb-6">
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
                                <div className="text-center mt-6 pb-6">
                                    <Button variant="outline" onClick={() => setVisibleCount(p => p + 48)} className="rounded-full px-6">
                                        Показати ще ({remainingCount})
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {selectedFile && (
                    <div className="fixed inset-0 z-100 sm:relative sm:inset-auto w-full sm:w-90 border-l border-(--platform-border-color) bg-(--platform-sidebar-bg) overflow-y-auto shrink-0 hide-scrollbar transition-transform duration-300">
                        <MediaInspector 
                            file={selectedFile} 
                            onUpdate={handleUpdateFile}
                            onDelete={handleDelete}
                            onClose={() => setSelectedFile(null)}
                        />
                    </div>
                )}
            </div>
            <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-0 min-h-12 border-t border-(--platform-border-color) bg-(--platform-bg) flex flex-col sm:flex-row justify-between items-stretch sm:items-center text-xs sm:text-sm text-(--platform-text-secondary) z-10 gap-3 sm:gap-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="whitespace-nowrap font-medium">Виділено: {checkedFiles.size} з {files.length}</span>
                    <div className="hidden sm:block w-px h-4 bg-(--platform-border-color)" />
                    <Button variant="ghost" onClick={handleSelectAll} className="h-8 px-2.5">
                        <Check size={14} className="mr-1.5" /> Вибрати все
                    </Button>
                    {checkedFiles.size > 0 && (
                        <Button 
                            variant="ghost" 
                            onClick={handleDeselectAll} 
                            className="h-8 px-2.5 text-(--platform-text-secondary)"
                            title="Скинути виділення"
                        >
                            <XIcon size={14} className="mr-1.5" /> Скинути ({checkedFiles.size})
                        </Button>
                    )}
                </div>
                {checkedFiles.size > 0 ? (
                    <div className="flex flex-wrap items-center gap-2 justify-end border-t sm:border-none border-(--platform-border-color) pt-2 sm:pt-0">
                        <Button variant="ghost" onClick={handleBulkDownload} className="h-8 px-3 text-(--platform-text-primary)">
                            <Download size={14} className="mr-1.5" /> Завантажити
                        </Button>
                        <Button 
                            variant="ghost"
                            onClick={handleBulkDelete} 
                            className="h-8 px-3 text-(--platform-danger) hover:bg-red-50"
                        >
                            <Trash2 size={14} className="mr-1.5" /> Видалити
                        </Button>
                    </div>
                ) : (
                    <div className="max-w-50 sm:max-w-75 truncate text-right hidden sm:block font-medium">
                        {selectedFile ? (selectedFile.original_file_name || selectedFile.display_name) : 'Файл не обрано'}
                    </div>
                )}
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </DragDropWrapper>
    );
};

export default MediaLibraryPage;