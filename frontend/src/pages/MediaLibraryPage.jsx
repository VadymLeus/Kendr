// frontend/src/pages/MediaLibraryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000';

const MediaLibraryPage = () => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchMedia = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/media');
            setMediaFiles(response.data);
        } catch (err) {
            toast.error('Не вдалося завантажити медіафайли.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Розмір файлу не повинен перевищувати 10MB');
                return;
            }
            handleUpload(file);
        }
    };

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('mediaFile', file);
        setUploading(true);
        
        const uploadToast = toast.loading(`Завантаження ${file.name}...`);
        
        try {
            const response = await apiClient.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMediaFiles(prev => [response.data, ...prev]);
            toast.update(uploadToast, { 
                render: `✅ ${file.name} успішно завантажено!`, 
                type: "success", 
                isLoading: false, 
                autoClose: 3000 
            });
        } catch (err) {
            toast.update(uploadToast, { 
                render: `❌ Помилка завантаження ${file.name}`, 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (mediaId, fileName, event) => {
        event.stopPropagation();
        if (!window.confirm(`Ви впевнені, що хочете видалити "${fileName}"?`)) return;
        
        try {
            await apiClient.delete(`/media/${mediaId}`);
            setMediaFiles(prev => prev.filter(file => file.id !== mediaId));
            if (selectedFile?.id === mediaId) {
                setSelectedFile(null);
            }
            toast.success(`🗑️ ${fileName} видалено`);
        } catch (err) {
            // Помилка обробляється глобально в apiClient
            console.error('Помилка видалення:', err);
        }
    };

    const handleSelectFile = (file) => {
        setSelectedFile(file);
    };

    const handleCopyToClipboard = (text, type = 'URL') => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${type} скопійовано в буфер обміну!`);
        }, (err) => {
            toast.error('Не вдалося скопіювати в буфер обміну');
        });
    };

    const getFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: 'auto' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--platform-text-primary)' }}>📁 Медіатека</h1>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                Тут зберігаються всі ваші завантажені зображення. Максимальний розмір файлу: 10MB
            </p>

            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <label htmlFor="page-file-upload" className="btn btn-primary" style={{ 
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.7 : 1
                }}>
                    {uploading ? '⏳ Завантаження...' : '📤 Завантажити нове зображення'}
                </label>
                <input 
                    id="page-file-upload"
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/jpeg,image/png,image/webp,image/gif" 
                    disabled={uploading} 
                    style={{ display: 'none' }}
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--platform-text-secondary)' }}>
                    Підтримуються: JPG, PNG, WebP, GIF
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedFile ? '3fr 1fr' : '1fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--platform-text-primary)' }}>
                            📸 Ваші зображення ({mediaFiles.length})
                        </h3>
                        {mediaFiles.length > 0 && (
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setSelectedFile(null)}
                                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                            >
                                ✖ Скасувати вибір
                            </button>
                        )}
                    </div>
                    
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                            <p style={{ color: 'var(--platform-text-secondary)' }}>Завантаження медіафайлів...</p>
                        </div>
                    ) : mediaFiles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
                            <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '1rem' }}>
                                Ваша медіатека порожня
                            </p>
                            <p style={{ color: 'var(--platform-text-secondary)', fontSize: '0.9rem' }}>
                                Завантажте перше зображення, щоб почати роботу
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                            {mediaFiles.map(file => (
                                <div 
                                    key={file.id} 
                                    style={{
                                        aspectRatio: '1 / 1',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: selectedFile?.id === file.id ? '3px solid var(--platform-accent)' : '3px solid var(--platform-border-color)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => handleSelectFile(file)}
                                >
                                    <img 
                                        src={`${API_URL}${file.path_thumb}`} 
                                        alt={file.alt_text || file.original_file_name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button 
                                        onClick={(e) => handleDelete(file.id, file.original_file_name, e)} 
                                        style={{
                                            position: 'absolute', top: '5px', right: '5px',
                                            background: 'rgba(229, 62, 62, 0.9)', color: 'white',
                                            border: 'none', borderRadius: '50%',
                                            width: '24px', height: '24px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '16px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(229, 62, 62, 1)'}
                                        onMouseLeave={(e) => e.target.style.background = 'rgba(229, 62, 62, 0.9)'}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedFile && (
                    <div className="card" style={{ position: 'sticky', top: '2rem', padding: '1.5rem', height: 'fit-content' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--platform-text-primary)' }}>📋 Деталі файлу</h4>
                        <img 
                            src={`${API_URL}${selectedFile.path_full}`} 
                            alt="Вибране зображення" 
                            style={{ 
                                width: '100%', 
                                borderRadius: '8px', 
                                border: '1px solid var(--platform-border-color)',
                                marginBottom: '1rem'
                            }} 
                        />
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Назва:</strong>
                            <span style={{ color: 'var(--platform-text-secondary)' }}>
                                {selectedFile.original_file_name}
                            </span>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Розмір:</strong>
                            <span style={{ color: 'var(--platform-text-secondary)' }}>
                                {getFileSize(selectedFile.file_size)}
                            </span>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>URL (повний):</strong>
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
                                    fontSize: '0.8rem'
                                }}
                            />
                            <button 
                                className="btn btn-secondary" 
                                style={{width: '100%', marginTop: '0.5rem'}} 
                                onClick={() => handleCopyToClipboard(`${API_URL}${selectedFile.path_full}`, 'URL зображення')}
                            >
                                📋 Скопіювати URL
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibraryPage;