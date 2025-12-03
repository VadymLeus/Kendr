// frontend/src/modules/media/pages/MediaLibraryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../common/hooks/useConfirm';

const API_URL = 'http://localhost:5000';

const MediaLibraryPage = () => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const { confirm } = useConfirm();

    const fetchMedia = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/media');
            setMediaFiles(response.data);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMedia(); }, [fetchMedia]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('mediaFile', file);
        setUploading(true);
        try {
            const response = await apiClient.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMediaFiles(prev => [response.data, ...prev]);
            toast.success('Файл успішно завантажено!');
        } catch (err) {
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (mediaId, event) => {
        event.stopPropagation();
        
        const isConfirmed = await confirm({
            title: "Видалення файлу",
            message: "Ви впевнені, що хочете видалити цей файл? Якщо він використовується на сайті, зображення перестане відображатися.",
            type: "danger",
            confirmLabel: "Видалити"
        });

        if (isConfirmed) {
            try {
                await apiClient.delete(`/media/${mediaId}`);
                setMediaFiles(prev => prev.filter(file => file.id !== mediaId));
                if (selectedFile?.id === mediaId) {
                    setSelectedFile(null);
                }
                toast.success('Файл видалено');
            } catch (err) {
            }
        }
    };

    const handleSelectFile = (file) => { 
        setSelectedFile(file); 
    };

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.info("URL скопійовано до буферу обміну!");
        }, (err) => {
            toast.error("Не вдалося скопіювати URL.");
        });
    };

    const filteredFiles = mediaFiles.filter(file => {
        if (filterType === 'all') return true;
        if (filterType === 'image') return file.mime_type.startsWith('image/');
        if (filterType === 'video') return file.mime_type.startsWith('video/');
        if (filterType === 'font') return file.mime_type.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(file.original_file_name);
        return true;
    });

    const tabStyle = (isActive) => ({
        padding: '8px 16px',
        border: 'none',
        borderBottom: isActive ? '2px solid var(--platform-accent)' : '2px solid transparent',
        background: 'transparent',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        cursor: 'pointer',
        fontWeight: '500'
    });

    const fontIconStyle = {
        fontSize: '2rem',
        color: 'var(--platform-text-primary)',
        background: 'var(--platform-bg)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        border: '1px solid var(--platform-border-color)'
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: 'auto' }}>
            <h1 style={{ marginBottom: '1rem' }}>Медіатека</h1>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                Тут зберігаються всі ваші завантажені зображення, відео та шрифти.
            </p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <label htmlFor="page-file-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                    {uploading ? 'Завантаження...' : '➕ Завантажити файл'}
                </label>
                <input 
                    id="page-file-upload" 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/*,video/mp4,video/webm,.ttf,.otf,.woff,.woff2" 
                    disabled={uploading} 
                    style={{ display: 'none' }} 
                />
            </div>

            <div style={{ display: 'flex', marginBottom: '1rem', borderBottom: '1px solid var(--platform-border-color)' }}>
                <button style={tabStyle(filterType === 'all')} onClick={() => setFilterType('all')}>Всі</button>
                <button style={tabStyle(filterType === 'image')} onClick={() => setFilterType('image')}>Зображення</button>
                <button style={tabStyle(filterType === 'video')} onClick={() => setFilterType('video')}>Відео</button>
                <button style={tabStyle(filterType === 'font')} onClick={() => setFilterType('font')}>🅰️ Шрифти</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedFile ? '3fr 1fr' : '1fr', gap: '2rem' }}>
                <div className="card">
                    {loading ? <p>Завантаження...</p> : filteredFiles.length === 0 ? (
                        <p className="text-secondary">
                            {filterType === 'all' 
                                ? 'Ваша медіатека порожня.' 
                                : `Немає ${filterType === 'image' ? 'зображень' : filterType === 'video' ? 'відео' : 'шрифтів'} у медіатеці.`}
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                            {filteredFiles.map(file => {
                                const isVideo = file.mime_type.startsWith('video/');
                                const isFont = file.mime_type.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(file.original_file_name);
                                
                                return (
                                    <div 
                                        key={file.id} 
                                        style={{
                                            aspectRatio: '1 / 1',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: selectedFile?.id === file.id ? '3px solid var(--platform-accent)' : '3px solid var(--platform-border-color)',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            background: isVideo ? '#000' : 'transparent'
                                        }}
                                        onClick={() => handleSelectFile(file)}
                                    >
                                        {isVideo ? (
                                            <div style={{
                                                width: '100%', 
                                                height: '100%', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                flexDirection: 'column',
                                                background: '#1a1a1a'
                                            }}>
                                                <span style={{fontSize: '2rem'}}>🎥</span>
                                                <span style={{fontSize: '0.7rem', color: 'white', marginTop: '5px'}}>VIDEO</span>
                                            </div>
                                        ) : isFont ? (
                                            <div style={fontIconStyle}>
                                                <span>Aa</span>
                                                <span style={{fontSize: '0.6rem', marginTop: '5px', color: 'var(--platform-text-secondary)'}}>
                                                    {file.original_file_name.split('.').pop().toUpperCase()}
                                                </span>
                                            </div>
                                        ) : (
                                            <img 
                                                src={`${API_URL}${file.path_thumb || file.path_full}`} 
                                                alt={file.original_file_name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        )}
                                        
                                        <button 
                                            onClick={(e) => handleDelete(file.id, e)} 
                                            style={{
                                                position: 'absolute', 
                                                top: '5px', 
                                                right: '5px',
                                                background: 'rgba(0,0,0,0.6)', 
                                                color: 'white',
                                                border: 'none', 
                                                borderRadius: '50%',
                                                width: '24px', 
                                                height: '24px', 
                                                cursor: 'pointer',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center'
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {selectedFile && (
                    <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                        <h4>Деталі файлу</h4>
                        {selectedFile.mime_type.startsWith('video/') ? (
                            <video 
                                src={`${API_URL}${selectedFile.path_full}`} 
                                controls 
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }} 
                            />
                        ) : (selectedFile.mime_type.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(selectedFile.original_file_name)) ? (
                            <div style={{...fontIconStyle, height: '150px', fontSize: '3rem', borderRadius: '8px'}}>
                                Aa
                            </div>
                        ) : (
                            <img 
                                src={`${API_URL}${selectedFile.path_full}`} 
                                alt="Preview" 
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }} 
                            />
                        )}
                        <div style={{ marginTop: '1rem' }}>
                            <label>Назва файлу:</label>
                            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--platform-text-secondary)' }}>
                                {selectedFile.original_file_name}
                            </p>
                            
                            <label>Тип:</label>
                            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--platform-text-secondary)' }}>
                                {selectedFile.mime_type.startsWith('video/') ? 'Відео' : 
                                 selectedFile.mime_type.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(selectedFile.original_file_name) ? 'Шрифт' : 'Зображення'}
                            </p>
                            
                            <label>Розмір:</label>
                            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--platform-text-secondary)' }}>
                                {selectedFile.file_size_kb} KB
                            </p>

                            <label>URL (повний):</label>
                            <input 
                                type="text" 
                                readOnly 
                                value={`${API_URL}${selectedFile.path_full}`} 
                                onFocus={(e) => e.target.select()} 
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid var(--platform-border-color)',
                                    borderRadius: '4px',
                                    background: 'var(--platform-bg)',
                                    color: 'var(--platform-text-primary)',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button 
                                className="btn btn-secondary" 
                                style={{width: '100%', marginTop: '0.5rem'}} 
                                onClick={() => handleCopyToClipboard(`${API_URL}${selectedFile.path_full}`)}
                            >
                                Скопіювати URL
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibraryPage;