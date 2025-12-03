// frontend/src/modules/profile/components/AvatarModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../common/services/api';

const API_URL = 'http://localhost:5000';

const AvatarModal = ({ onClose, onAvatarUpdate }) => {
    const [defaultAvatars, setDefaultAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [customAvatarFile, setCustomAvatarFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchDefaultAvatars = async () => {
            const response = await apiClient.get('/users/default-avatars');
            setDefaultAvatars(response.data);
        };
        fetchDefaultAvatars();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomAvatarFile(file);
            setSelectedAvatar('');
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSelectDefault = (avatarUrl) => {
        setSelectedAvatar(avatarUrl);
        setCustomAvatarFile(null);
        setPreview(`${API_URL}${avatarUrl}`);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            if (customAvatarFile) {
                const formData = new FormData();
                formData.append('avatar', customAvatarFile);
                const response = await apiClient.post('/users/profile/avatar', formData);
                onAvatarUpdate({ type: 'file_upload', user: response.data.user });
            } else if (selectedAvatar) {
                onAvatarUpdate({ type: 'default_url', url: selectedAvatar });
            } else {
                return;
            }
        } catch (error) {
            console.error("Помилка під час оновлення аватара", error);
            alert('Не вдалося оновити аватар.');
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    const modalOverlayStyle = { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1200 
    };

    const modalContentStyle = { 
        background: 'var(--platform-card-bg)', 
        padding: '2rem', 
        borderRadius: '12px', 
        width: '90%', 
        maxWidth: '500px', 
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        border: '1px solid var(--platform-border-color)'
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <h3 style={{ 
                    textAlign: 'center', 
                    marginTop: 0, 
                    color: 'var(--platform-text-primary)',
                    marginBottom: '1.5rem'
                }}>
                    Змінити аватар
                </h3>
                
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {preview && (
                        <img 
                            src={preview} 
                            alt="Попередній перегляд" 
                            style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '3px solid var(--platform-accent)'
                            }} 
                        />
                    )}
                </div>

                <h4 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>
                    Стандартні аватари
                </h4>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    flexWrap: 'wrap', 
                    marginBottom: '1.5rem' 
                }}>
                    {defaultAvatars.map(url => (
                        <img 
                            key={url} 
                            src={`${API_URL}${url}`} 
                            alt="стандартний аватар" 
                            onClick={() => handleSelectDefault(url)}
                            style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%', 
                                cursor: 'pointer', 
                                border: selectedAvatar === url ? '3px solid var(--platform-accent)' : '3px solid transparent',
                                transition: 'border 0.2s ease'
                            }} 
                        />
                    ))}
                </div>

                <label 
                    htmlFor="avatar-upload" 
                    style={{ 
                        cursor: 'pointer', 
                        color: 'var(--platform-accent)', 
                        textDecoration: 'underline',
                        display: 'block',
                        textAlign: 'center',
                        marginBottom: '1.5rem'
                    }}
                >
                    ... або завантажте свій
                </label>
                <input 
                    type="file" 
                    id="avatar-upload" 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                />

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '1rem', 
                    marginTop: '2rem', 
                    borderTop: '1px solid var(--platform-border-color)', 
                    paddingTop: '1.5rem' 
                }}>
                    <button 
                        onClick={onClose} 
                        className="btn btn-secondary"
                    >
                        Скасувати
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isLoading || (!customAvatarFile && !selectedAvatar)} 
                        className="btn btn-primary"
                    >
                        {isLoading ? 'Збереження...' : 'Зберегти'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarModal;