// frontend/src/components/media/MediaPickerModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';

const API_URL = 'http://localhost:5000';

const UploadTab = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

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
        setError('');
        try {
            const response = await apiClient.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUploadSuccess(response.data.path_full);
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка завантаження.');
        } finally {
            setUploading(false);
        }
    };
    
    return (
        <div style={tabContentStyle}>
            <label htmlFor="modal-file-upload" style={uploadBoxStyle}>
                {uploading ? 'Завантаження...' : 'Натисніть або перетягніть файл'}
            </label>
            <input
                id="modal-file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                style={{ display: 'none' }}
            />
            {error && <p style={{ color: 'var(--site-danger)', marginTop: '1rem' }}>{error}</p>}
        </div>
    );
};

const LibraryTab = ({ onSelectImage }) => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/media');
                setMediaFiles(response.data);
            } catch (err) {
                setError('Не вдалося завантажити медіафайли.');
            } finally {
                setLoading(false);
            }
        };
        fetchMedia();
    }, []);

    return (
        <div style={tabContentStyle}>
            {loading ? <p style={{ color: 'var(--site-text-secondary)' }}>Завантаження...</p> : 
             error ? <div style={{ color: 'var(--site-danger)' }}>{error}</div> : 
             mediaFiles.length === 0 ? <p style={{ color: 'var(--site-text-secondary)' }}>Ваша медіатека порожня.</p> : (
                <div style={mediaGridStyle}>
                    {mediaFiles.map(file => (
                        <div 
                            key={file.id} 
                            style={mediaGridItemStyle}
                            onClick={() => onSelectImage(file.path_full)}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = 'var(--site-accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = 'var(--site-border-color)';
                            }}
                        >
                            <img 
                                src={`${API_URL}${file.path_thumb}`} 
                                alt={file.alt_text || file.original_file_name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/100x100/AAAAAA/FFFFFF?text=Помилка";
                                }}
                            />
                        </div>
                    ))}
                </div>
             )}
        </div>
    );
};

const MediaPickerModal = ({ isOpen, onClose, onSelectImage }) => {
    const [activeTab, setActiveTab] = useState('library');

    if (!isOpen) return null;

    const handleSelectAndClose = (path) => {
        onSelectImage(`${API_URL}${path}`);
        onClose();
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <div style={modalHeaderStyle}>
                    <h4 style={{ color: 'var(--site-text-primary)', margin: 0 }}>Вибір зображення</h4>
                    <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                </div>
                
                <div style={modalTabsStyle}>
                    <button 
                        style={tabButtonStyle(activeTab === 'library')}
                        onClick={() => setActiveTab('library')}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'library') {
                                e.target.style.background = 'var(--site-accent)';
                                e.target.style.color = 'var(--site-accent-text)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== 'library') {
                                e.target.style.background = 'var(--site-card-bg)';
                                e.target.style.color = 'var(--site-text-secondary)';
                            }
                        }}
                    >
                        Завантажити з медіатеки
                    </button>
                    <button 
                        style={tabButtonStyle(activeTab === 'upload')}
                        onClick={() => setActiveTab('upload')}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'upload') {
                                e.target.style.background = 'var(--site-accent)';
                                e.target.style.color = 'var(--site-accent-text)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== 'upload') {
                                e.target.style.background = 'var(--site-card-bg)';
                                e.target.style.color = 'var(--site-text-secondary)';
                            }
                        }}
                    >
                        Завантажити файл
                    </button>
                </div>

                <div style={{ padding: '1rem 0', minHeight: '300px' }}>
                    {activeTab === 'library' && (
                        <LibraryTab onSelectImage={handleSelectAndClose} />
                    )}
                    {activeTab === 'upload' && (
                        <UploadTab onUploadSuccess={handleSelectAndClose} />
                    )}
                </div>
            </div>
        </div>
    );
};

const modalOverlayStyle = { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0,0,0,0.7)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 1200 
};

const modalContentStyle = { 
    background: 'var(--site-card-bg)', 
    padding: '1.5rem', 
    borderRadius: '12px', 
    width: '90%', 
    maxWidth: '700px', 
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)', 
    border: '1px solid var(--site-border-color)' 
};

const modalHeaderStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingBottom: '1rem', 
    borderBottom: '1px solid var(--site-border-color)' 
};

const closeButtonStyle = { 
    background: 'none', 
    border: 'none', 
    fontSize: '1.5rem', 
    cursor: 'pointer', 
    color: 'var(--site-text-secondary)',
    transition: 'color 0.2s ease'
};

const modalTabsStyle = { 
    display: 'flex', 
    gap: '0.5rem', 
    margin: '1rem 0' 
};

const tabButtonStyle = (isActive) => ({
    flex: 1,
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--site-border-color)',
    background: isActive ? 'var(--site-accent)' : 'var(--site-card-bg)',
    color: isActive ? 'var(--site-accent-text)' : 'var(--site-text-secondary)',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease'
});

const tabContentStyle = { 
    padding: '1rem 0', 
    minHeight: '300px' 
};

const uploadBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '250px',
    border: '2px dashed var(--site-border-color)',
    borderRadius: '8px',
    background: 'var(--site-bg)',
    color: 'var(--site-text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
};

const mediaGridStyle = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
    gap: '1rem', 
    maxHeight: '400px', 
    overflowY: 'auto' 
};

const mediaGridItemStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid var(--site-border-color)',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease'
};

export default MediaPickerModal;