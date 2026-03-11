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

    const hasChanges = file && (
        formData.display_name !== (file.display_name || '') ||
        formData.alt_text !== (file.alt_text || '') ||
        formData.description !== (file.description || '')
    );

    const isFont = file && (file.mime_type.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(file.original_file_name));
    useEffect(() => {
        if (isFont && file) {
            const fontUrl = `${API_URL}${file.path_full}`;
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
        if (hasChanges) {
            saveChanges();
        }
    };

    const handleSaveClick = (e) => {
        e.preventDefault(); 
        saveChanges();
    };

    const copyUrl = () => {
        const url = `${API_URL}${file.path_full}`;
        navigator.clipboard.writeText(url);
        toast.info('URL скопійовано');
    };

    const openInNewWindow = () => {
        window.open(`${API_URL}${file.path_full}`, '_blank');
    };

    const handleForceDownload = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}${file.path_full}`);
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

    const styles = {
        container: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--platform-sidebar-bg)',
            minHeight: '100%', 
            borderLeft: '1px solid var(--platform-border-color)'
        },
        header: {
            padding: '16px',
            borderBottom: '1px solid var(--platform-border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--platform-bg)',
            color: 'var(--platform-text-primary)',
            flexShrink: 0
        },
        previewArea: {
            padding: '20px',
            background: 'var(--platform-bg)',
            backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')",
            backgroundRepeat: 'repeat',
            
            borderBottom: '1px solid var(--platform-border-color)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '220px',
            position: 'relative'
        },
        content: {
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        },
        label: {
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            color: 'var(--platform-text-secondary)',
            marginBottom: '4px',
            display: 'block',
            letterSpacing: '0.5px'
        },
        input: {
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--platform-border-color)',
            background: 'var(--platform-input-bg)',
            color: 'var(--platform-text-primary)',
            fontSize: '0.85rem',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border-color 0.2s'
        },
        metaGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            padding: '10px',
            background: 'var(--platform-bg)',
            borderRadius: '8px',
            border: '1px solid var(--platform-border-color)',
            fontSize: '0.8rem',
            color: 'var(--platform-text-secondary)'
        },
        metaItem: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            overflow: 'hidden'
        },
        metaLabel: {
            fontSize: '0.65rem',
            color: 'var(--platform-text-secondary)',
            opacity: 0.8
        },
        metaValue: {
            color: 'var(--platform-text-primary)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        actionsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--platform-border-color)'
        }
    };

    const renderPreview = () => {
        if (isFont) {
            return (
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <Type size={48} color="var(--platform-accent)" />
                    </div>
                    <div 
                        id={`font-preview-${file.id}`} 
                        style={{
                            fontSize: '1.5rem', 
                            wordBreak: 'break-word', 
                            padding: '10px',
                            color: 'var(--platform-text-primary)'
                        }}
                    >
                        Aa Bb Cc 123
                        <br/>
                        <span style={{ fontSize: '1rem' }}>Привіт світ!</span>
                    </div>
                </div>
            );
        }
        return (
            <div style={{ width: '100%', height: '220px' }}>
                <MediaFilePreview 
                    file={file} 
                    showVideoControls={true} 
                    style={{ borderRadius: '8px' }}
                />
            </div>
        );
    };
    
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Властивості файлу</span>
                <Button 
                    variant="ghost" 
                    onClick={onClose} 
                    title="Закрити"
                    style={{ padding: 0, width: '32px', height: '32px', borderRadius: '50%', minWidth: 'auto' }}
                >
                    <X size={20} />
                </Button>
            </div>
            <div style={styles.previewArea}>
                {renderPreview()}
            </div>
            <div style={styles.content}>
                <div style={styles.metaGrid}>
                    <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>Тип</span>
                        <span style={styles.metaValue} title={file.mime_type}>
                            {getFileExtension(file.original_file_name)}
                        </span>
                    </div>
                    <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>Розмір</span>
                        <span style={styles.metaValue}>{file.file_size_kb} KB</span>
                    </div>
                    <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>Дата</span>
                        <span style={styles.metaValue}>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>Розміри</span>
                        <span style={styles.metaValue}>{file.width ? `${file.width}x${file.height}` : '-'}</span>
                    </div>
                </div>
                <div>
                    <label style={styles.label}>Ім'я файлу</label>
                    <input 
                        type="text" 
                        value={formData.display_name} 
                        onChange={e => setFormData({...formData, display_name: e.target.value})}
                        onBlur={handleBlur}
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = 'var(--platform-accent)'}
                        onBlurCapture={(e) => { e.target.style.borderColor = 'var(--platform-border-color)'; handleBlur(); }}
                    />
                </div>
                {!isFont && (
                    <div>
                        <label style={styles.label}>Alt текст (SEO)</label>
                        <input 
                            type="text" 
                            value={formData.alt_text} 
                            onChange={e => setFormData({...formData, alt_text: e.target.value})}
                            onBlur={handleBlur}
                            style={styles.input}
                            placeholder="Опис для пошуковиків"
                            onFocus={(e) => e.target.style.borderColor = 'var(--platform-accent)'}
                            onBlurCapture={(e) => { e.target.style.borderColor = 'var(--platform-border-color)'; handleBlur(); }}
                        />
                    </div>
                )}
                <div>
                    <label style={styles.label}>Нотатки</label>
                    <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        onBlur={handleBlur}
                        style={{...styles.input, resize: 'vertical', minHeight: '60px', fontFamily: 'inherit'}}
                        placeholder="Для внутрішнього користування..."
                        onFocus={(e) => e.target.style.borderColor = 'var(--platform-accent)'}
                        onBlurCapture={(e) => { e.target.style.borderColor = 'var(--platform-border-color)'; handleBlur(); }}
                    />
                </div>
                <Button 
                    variant="primary" 
                    onClick={handleSaveClick}
                    disabled={!hasChanges}
                    style={{ width: '100%', marginTop: '4px' }}
                >
                    <Save size={16} /> Зберегти зміни
                </Button>
                <div style={styles.actionsGrid}>
                    <Button 
                        variant="outline"
                        onClick={copyUrl} 
                        title="Копіювати посилання"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        <Copy size={16} /> Копіювати
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={openInNewWindow} 
                        title="Відкрити в новій вкладці"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        <ExternalLink size={16} /> Відкрити
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={handleForceDownload} 
                        title="Завантажити файл на комп'ютер"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        <Download size={16} /> Завантажити
                    </Button>
                    <Button 
                        variant="danger"
                        onClick={() => onDelete(file)} 
                        title="Видалити"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        <Trash2 size={16} /> Видалити
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MediaInspector;