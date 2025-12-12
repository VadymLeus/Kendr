// frontend/src/modules/profile/components/AvatarModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../common/services/api';
import ImageUploader from '../../../common/components/ui/ImageUploader';
import { IconUser } from '../../../common/components/ui/Icons';

const API_URL = 'http://localhost:5000';

const AvatarModal = ({ onClose, onAvatarUpdate, mode = 'update' }) => {
    const [defaultAvatars, setDefaultAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [customAvatarFile, setCustomAvatarFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');

    useEffect(() => {
        const fetchDefaultAvatars = async () => {
             try {
                const response = await apiClient.get('/users/default-avatars');
                setDefaultAvatars(response.data);
             } catch (e) {
                 console.error("Failed to load avatars", e);
             }
        };
        fetchDefaultAvatars();
    }, []);

    const handleSelectDefault = (avatarUrl) => {
        setSelectedAvatar(avatarUrl);
        setCustomAvatarFile(null);
        setPreview(`${API_URL}${avatarUrl}`);
    };

    const handleCroppedUpload = (file) => {
        setCustomAvatarFile(file);
        setSelectedAvatar('');
        setPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        setIsLoading(true);
        
        try {
            if (mode === 'select') {
                if (customAvatarFile) {
                    onAvatarUpdate({ type: 'file', file: customAvatarFile, previewUrl: preview });
                } else if (selectedAvatar) {
                    onAvatarUpdate({ type: 'default', url: selectedAvatar, previewUrl: preview });
                }
                onClose();
                return;
            }

            if (customAvatarFile) {
                const formData = new FormData();
                formData.append('avatar', customAvatarFile);
                const response = await apiClient.post('/users/profile/avatar', formData);
                onAvatarUpdate({ type: 'file_upload', user: response.data.user });
            } else if (selectedAvatar) {
                const response = await apiClient.put('/users/profile/avatar-url', { avatar_url: selectedAvatar });
                onAvatarUpdate({ type: 'default_url', user: response.data.user });
            }
            onClose();
        } catch (error) {
            console.error("Помилка під час оновлення аватара", error);
            alert('Не вдалося оновити аватар.');
        } finally {
            setIsLoading(false);
        }
    };

    const modalOverlayStyle = { 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200,
        backdropFilter: 'blur(4px)'
    };

    const modalContentStyle = { 
        background: 'var(--platform-card-bg)', padding: '2rem', borderRadius: '16px', 
        width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: '1px solid var(--platform-border-color)'
    };
    
    const tabButtonStyle = (isActive) => ({
        flex: 1, 
        padding: '10px', 
        cursor: 'pointer', 
        textAlign: 'center',
        background: 'transparent', 
        
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: isActive ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
        
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.2s ease'
    });

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <h3 style={{ textAlign: 'center', marginTop: 0, color: 'var(--platform-text-primary)', marginBottom: '1.5rem' }}>
                    {mode === 'select' ? 'Обрати аватар' : 'Змінити аватар'}
                </h3>

                <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
                    <button style={tabButtonStyle(activeTab === 'upload')} onClick={() => setActiveTab('upload')}>
                        Завантажити
                    </button>
                    <button style={tabButtonStyle(activeTab === 'library')} onClick={() => setActiveTab('library')}>
                        Стандартні
                    </button>
                </div>
                
                <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    
                    {preview && (
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <img 
                                src={preview} 
                                alt="Попередній перегляд" 
                                style={{ 
                                    width: '100px', height: '100px', borderRadius: '50%', 
                                    objectFit: 'cover', border: '3px solid var(--platform-accent)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }} 
                            />
                            <p style={{fontSize:'0.8rem', color:'var(--platform-text-secondary)', margin:'5px 0 0 0'}}>Обрано</p>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <ImageUploader onUpload={handleCroppedUpload} aspect={1} circularCrop={true}>
                                <div style={{
                                    padding: '20px', border: '2px dashed var(--platform-border-color)',
                                    borderRadius: '12px', cursor: 'pointer', background: 'var(--platform-bg)',
                                    color: 'var(--platform-text-secondary)', transition: 'all 0.2s'
                                }}>
                                    <div style={{fontSize: '2rem', marginBottom: '10px'}}>☁️</div>
                                    <div>Натисніть, щоб завантажити фото</div>
                                </div>
                            </ImageUploader>
                        </div>
                    )}

                    {activeTab === 'library' && (
                        <div style={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '12px', 
                            width: '100%', 
                            maxHeight: '250px', 
                            overflowY: 'auto',
                            padding: '4px'
                        }} className="custom-scrollbar">
                            {defaultAvatars.map(url => (
                                <img 
                                    key={url} 
                                    src={`${API_URL}${url}`} 
                                    alt="avatar" 
                                    onClick={() => handleSelectDefault(url)}
                                    style={{ 
                                        width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', 
                                        border: selectedAvatar === url ? '3px solid var(--platform-accent)' : '2px solid transparent',
                                        transition: 'all 0.2s', objectFit: 'cover', 
                                        background: 'var(--platform-bg)',
                                        flexShrink: 0
                                    }} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ 
                    display: 'flex', justifyContent: 'flex-end', gap: '1rem', 
                    marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--platform-border-color)' 
                }}>
                    <button onClick={onClose} className="btn btn-secondary">Скасувати</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isLoading || (!customAvatarFile && !selectedAvatar)} 
                        className="btn btn-primary"
                    >
                        {isLoading ? 'Збереження...' : (mode === 'select' ? 'Обрати' : 'Зберегти')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarModal;