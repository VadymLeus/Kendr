// frontend/src/modules/media/components/MediaInspector.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/elements/Button';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import MediaFilePreview from '../../../shared/ui/complex/MediaFilePreview';
import { API_URL, getFileExtension } from '../../../shared/utils/mediaUtils';
import { Download, Trash2, Copy, ExternalLink, X, Type, Save } from 'lucide-react';

const MediaInspector = ({ file, onUpdate, onDelete, onClose }) => {
    const [formData, setFormData] = useState({
        display_name: '',
        alt_text: '',
        description: ''
    });

    const getValidUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `${API_URL}${path}`;
    };

    const hasChanges = file && (
        formData.display_name !== (file.display_name || '') ||
        formData.alt_text !== (file.alt_text || '') ||
        formData.description !== (file.description || '')
    );

    const isFont = file && (file.mime_type.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(file.original_file_name));
    useEffect(() => {
        if (isFont && file) {
            const fontUrl = getValidUrl(file.path_full);
            const fontName = `PreviewFont-${file.id}`;
            const fontFace = new FontFace(fontName, `url(${fontUrl})`);
            fontFace.load().then((loadedFace) => {
                document.fonts.add(loadedFace);
                const previewEl = document.getElementById(`font-preview-${file.id}`);
                if (previewEl) {
                    previewEl.style.fontFamily = fontName;
                }
            }).catch(err => {
                console.error("Не вдалося завантажити шрифт для перегляду:", err);
            });
        }
    }, [file, isFont]);

    useEffect(() => {
        if (file) {
            setFormData({
                display_name: file.display_name || '',
                alt_text: file.alt_text || '',
                description: file.description || ''
            });
        }
    }, [file]);

    if (!file) return null;
    const saveChanges = async () => {
        if (!hasChanges) return;
        try {
            const res = await apiClient.put(`/media/${file.id}`, formData);
            onUpdate(res.data);
            toast.success('Зміни збережено');
        } catch (error) {
            console.error(error);
            toast.error('Помилка збереження');
        }
    };

    const handleBlur = () => {
        if (hasChanges) saveChanges();
    };

    const handleSaveClick = (e) => {
        e.preventDefault(); 
        saveChanges();
    };

    const copyUrl = () => {
        const url = getValidUrl(file.path_full);
        navigator.clipboard.writeText(url);
        toast.info('URL скопійовано');
    };

    const openInNewWindow = () => {
        window.open(getValidUrl(file.path_full), '_blank');
    };

    const handleForceDownload = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(getValidUrl(file.path_full));
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.original_file_name || 'download';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            toast.success('Завантаження почалось');
        } catch (err) {
            console.error(err);
            toast.error('Помилка завантаження файлу');
        }
    };

    const renderPreview = () => {
        if (isFont) {
            return (
                <div className="text-center w-full">
                    <div className="flex justify-center mb-3">
                        <Type size={48} className="text-(--platform-accent) shrink-0" />
                    </div>
                    <div 
                        id={`font-preview-${file.id}`} 
                        className="text-xl sm:text-2xl wrap-break-word p-3 text-(--platform-text-primary)"
                    >
                        Aa Bb Cc 123
                        <br/>
                        <span className="text-sm sm:text-base">Привіт світ!</span>
                    </div>
                </div>
            );
        }
        return (
            <div className="w-full h-full sm:h-55">
                <MediaFilePreview 
                    file={file} 
                    showVideoControls={true} 
                    className="rounded-lg object-contain w-full h-full"
                />
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full h-full min-h-screen sm:min-h-full bg-(--platform-sidebar-bg) sm:border-l sm:border-(--platform-border-color)">
            <div className="p-4 border-b border-(--platform-border-color) flex justify-between items-center bg-(--platform-bg) text-(--platform-text-primary) shrink-0 sticky top-0 z-20">
                <span className="font-bold text-base">Властивості файлу</span>
                <Button 
                    variant="ghost" 
                    onClick={onClose} 
                    title="Закрити"
                    className="p-0 w-8 h-8 rounded-full min-w-auto shrink-0 flex items-center justify-center hover:bg-black/5"
                >
                    <X size={20} className="shrink-0" />
                </Button>
            </div>
            <div 
                className="p-4 sm:p-5 bg-(--platform-bg) border-b border-(--platform-border-color) flex justify-center items-center min-h-55 relative"
                style={{ backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')", backgroundRepeat: 'repeat' }}
            >
                {renderPreview()}
            </div>
            <div className="p-4 sm:p-5 flex flex-col gap-3.5 flex-1">
                <div className="grid grid-cols-2 gap-2.5 p-3 bg-(--platform-bg) rounded-lg border border-(--platform-border-color) text-xs sm:text-[0.8rem] text-(--platform-text-secondary)">
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[10px] sm:text-[11px] opacity-80 uppercase tracking-wider">Тип</span>
                        <span className="text-(--platform-text-primary) font-medium truncate" title={file.mime_type}>
                            {getFileExtension(file.original_file_name)}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[10px] sm:text-[11px] opacity-80 uppercase tracking-wider">Розмір</span>
                        <span className="text-(--platform-text-primary) font-medium truncate">{file.file_size_kb} KB</span>
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[10px] sm:text-[11px] opacity-80 uppercase tracking-wider">Дата</span>
                        <span className="text-(--platform-text-primary) font-medium truncate">{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[10px] sm:text-[11px] opacity-80 uppercase tracking-wider">Розміри</span>
                        <span className="text-(--platform-text-primary) font-medium truncate">{file.width ? `${file.width}x${file.height}` : '-'}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-(--platform-text-secondary)">Ім'я файлу</label>
                    <input 
                        type="text" 
                        value={formData.display_name} 
                        onChange={e => setFormData({...formData, display_name: e.target.value})}
                        onBlur={handleBlur}
                        className="w-full p-2.5 rounded-lg border border-(--platform-border-color) bg-(--platform-input-bg) text-(--platform-text-primary) text-sm focus:outline-none focus:border-(--platform-accent) transition-colors"
                    />
                </div>
                {!isFont && (
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-(--platform-text-secondary)">Alt текст (SEO)</label>
                        <input 
                            type="text" 
                            value={formData.alt_text} 
                            onChange={e => setFormData({...formData, alt_text: e.target.value})}
                            onBlur={handleBlur}
                            placeholder="Опис для пошуковиків"
                            className="w-full p-2.5 rounded-lg border border-(--platform-border-color) bg-(--platform-input-bg) text-(--platform-text-primary) text-sm focus:outline-none focus:border-(--platform-accent) transition-colors"
                        />
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-(--platform-text-secondary)">Нотатки</label>
                    <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        onBlur={handleBlur}
                        placeholder="Для внутрішнього користування..."
                        className="w-full p-2.5 rounded-lg border border-(--platform-border-color) bg-(--platform-input-bg) text-(--platform-text-primary) text-sm focus:outline-none focus:border-(--platform-accent) transition-colors resize-y min-h-15 sm:min-h-20"
                    />
                </div>
                <Button 
                    variant="primary" 
                    onClick={handleSaveClick}
                    disabled={!hasChanges}
                    className="w-full mt-2 min-h-11 sm:min-h-10 shadow-sm"
                >
                    <Save size={16} className="mr-2 shrink-0" /> Зберегти зміни
                </Button>
                <div className="grid grid-cols-2 gap-2.5 mt-3 pt-5 border-t border-(--platform-border-color) pb-6">
                    <Button 
                        variant="outline"
                        onClick={copyUrl} 
                        title="Копіювати посилання"
                        className="w-full justify-center text-[13px] sm:text-sm min-h-10"
                    >
                        <Copy size={16} className="mr-1.5 shrink-0" /> Копіювати
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={openInNewWindow} 
                        title="Відкрити в новій вкладці"
                        className="w-full justify-center text-[13px] sm:text-sm min-h-10"
                    >
                        <ExternalLink size={16} className="mr-1.5 shrink-0" /> Відкрити
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={handleForceDownload} 
                        title="Завантажити файл на комп'ютер"
                        className="w-full justify-center text-[13px] sm:text-sm min-h-10"
                    >
                        <Download size={16} className="mr-1.5 shrink-0" /> Завантажити
                    </Button>
                    <Button 
                        variant="danger"
                        onClick={() => onDelete(file)} 
                        title="Видалити"
                        className="w-full justify-center text-[13px] sm:text-sm min-h-10"
                    >
                        <Trash2 size={16} className="mr-1.5 shrink-0" /> Видалити
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MediaInspector;