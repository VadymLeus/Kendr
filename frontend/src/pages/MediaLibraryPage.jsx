// frontend/src/pages/MediaLibraryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../hooks/useConfirm';

const API_URL = 'http://localhost:5000';

const MediaLibraryPage = () => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const { confirm } = useConfirm();

    const fetchMedia = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/media');
            setMediaFiles(response.data);
        } catch (err) {
            // Global error handled
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
            // Global error handled
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
                // Global error handled
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

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: 'auto' }}>
            <h1 style={{ marginBottom: '1rem' }}>Медіатека</h1>
            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                Тут зберігаються всі ваші завантажені зображення.
            </p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <label htmlFor="page-file-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                    {uploading ? 'Завантаження...' : '➕ Завантажити нове зображення'}
                </label>
                <input 
                    id="page-file-upload" 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/jpeg,image/png,image/webp" 
                    disabled={uploading} 
                    style={{ display: 'none' }} 
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedFile ? '3fr 1fr' : '1fr', gap: '2rem' }}>
                <div className="card">
                    {loading ? <p>Завантаження...</p> : mediaFiles.length === 0 ? (
                        <p className="text-secondary">Ваша медіатека порожня.</p>
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
                                        position: 'relative'
                                    }}
                                    onClick={() => handleSelectFile(file)}
                                >
                                    <img 
                                        src={`${API_URL}${file.path_thumb}`} 
                                        alt={file.alt_text || file.original_file_name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
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
                            ))}
                        </div>
                    )}
                </div>

                {selectedFile && (
                    <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                        <h4>Деталі файлу</h4>
                        <img 
                            src={`${API_URL}${selectedFile.path_full}`} 
                            alt="Вибране зображення" 
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }} 
                        />
                        <div style={{ marginTop: '1rem' }}>
                            <label>URL (повний):</label>
                            <input 
                                type="text" 
                                readOnly 
                                value={`${API_URL}${selectedFile.path_full}`} 
                                onFocus={(e) => e.target.select()} 
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