// frontend/src/features/media/MediaPickerModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

const API_URL = 'http://localhost:5000';

const ScrollbarStyles = () => (
    <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: var(--platform-border-color);
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: var(--platform-text-secondary);
        }
    `}</style>
);

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
        <div style={tabContentStyle} className="custom-scrollbar">
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
            {error && <p style={{ color: 'var(--platform-danger)', marginTop: '1rem' }}>{error}</p>}
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
        <div style={tabContentStyle} className="custom-scrollbar">
            {loading ? <p style={{ color: 'var(--platform-text-secondary)' }}>Завантаження...</p> : 
             error ? <div style={{ color: 'var(--platform-danger)' }}>{error}</div> : 
             mediaFiles.length === 0 ? <p style={{ color: 'var(--platform-text-secondary)' }}>Ваша медіатека порожня.</p> : (
                <div style={mediaGridStyle}>
                    {mediaFiles.map(file => (
                        <div 
                            key={file.id} 
                            style={mediaGridItemStyle}
                            onClick={() => onSelectImage(file.path_full)}
                        >
                            <img 
                                src={`${API_URL}${file.path_thumb}`} 
                                alt={file.alt_text || file.original_file_name} 
                                style={imageStyle}
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

const DefaultLogosTab = ({ onSelectImage }) => {
    const [logos, setLogos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/sites/default-logos')
            .then(res => setLogos(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={tabContentStyle} className="custom-scrollbar">
            {loading ? (
                <p style={{ color: 'var(--platform-text-secondary)' }}>Завантаження...</p>
            ) : logos.length === 0 ? (
                <p style={{ color: 'var(--platform-text-secondary)' }}>Немає стандартних зображень.</p>
            ) : (
                <div style={mediaGridStyle}>
                    {logos.map((logoUrl, index) => (
                        <div 
                            key={index} 
                            style={{
                                ...mediaGridItemStyle,
                                background: '#eee'
                            }}
                            onClick={() => onSelectImage(logoUrl)}
                        >
                            <img 
                                src={`${API_URL}${logoUrl}`} 
                                alt="Standard" 
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px', boxSizing: 'border-box' }}
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
        const finalPath = path.startsWith('http') ? path : `${API_URL}${path}`;
        onSelectImage(finalPath);
        onClose();
    };

    return (
        <>
            <ScrollbarStyles />
            <div style={modalOverlayStyle} onClick={onClose}>
                <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                    <div style={modalHeaderStyle}>
                        <h4 style={{ color: 'var(--platform-text-primary)', margin: 0 }}>Вибір зображення</h4>
                        <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                    </div>
                    
                    <div style={modalTabsStyle} className="custom-scrollbar">
                        <button 
                            style={tabButtonStyle(activeTab === 'library')}
                            onClick={() => setActiveTab('library')}
                        >
                            Медіатека
                        </button>
                        <button 
                            style={tabButtonStyle(activeTab === 'default')}
                            onClick={() => setActiveTab('default')}
                        >
                            Стандартні
                        </button>
                        <button 
                            style={tabButtonStyle(activeTab === 'upload')}
                            onClick={() => setActiveTab('upload')}
                        >
                            Завантажити
                        </button>
                    </div>

                    <div style={{ padding: '1rem 0', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {activeTab === 'library' && (
                            <LibraryTab onSelectImage={handleSelectAndClose} />
                        )}
                        {activeTab === 'default' && (
                            <DefaultLogosTab onSelectImage={handleSelectAndClose} />
                        )}
                        {activeTab === 'upload' && (
                            <UploadTab onUploadSuccess={handleSelectAndClose} />
                        )}
                    </div>
                </div>
            </div>
        </>
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
    background: 'var(--platform-card-bg)', 
    padding: '1.5rem', 
    borderRadius: '12px', 
    width: '90%', 
    maxWidth: '800px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)', 
    border: '1px solid var(--platform-border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '80vh',
    maxHeight: '700px' 
};

const modalHeaderStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingBottom: '1rem', 
    borderBottom: '1px solid var(--platform-border-color)',
    flexShrink: 0
};

const closeButtonStyle = { 
    background: 'none', 
    border: 'none', 
    fontSize: '1.5rem', 
    cursor: 'pointer', 
    color: 'var(--platform-text-secondary)'
};

const modalTabsStyle = { 
    display: 'flex', 
    gap: '0.5rem', 
    margin: '1rem 0',
    overflowX: 'auto',
    flexShrink: 0
};

const tabButtonStyle = (isActive) => ({
    flex: 1,
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--platform-border-color)',
    background: isActive ? 'var(--platform-accent)' : 'var(--platform-card-bg)',
    color: isActive ? 'var(--platform-accent-text)' : 'var(--platform-text-secondary)',
    cursor: 'pointer',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
});

const tabContentStyle = { 
    paddingRight: '5px',
    height: '100%',
    overflowY: 'auto'
};

const uploadBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '250px',
    border: '2px dashed var(--platform-border-color)',
    borderRadius: '8px',
    background: 'var(--platform-bg)',
    color: 'var(--platform-text-secondary)',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
};

const mediaGridStyle = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(6, 1fr)', 
    gap: '10px', 
    width: '100%'
};

const mediaGridItemStyle = {
    width: '100%',
    aspectRatio: '1 / 1', 
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid var(--platform-border-color)',
    cursor: 'pointer',
    transition: 'transform 0.2s, border-color 0.2s',
    position: 'relative'
};

const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
};

export default MediaPickerModal;