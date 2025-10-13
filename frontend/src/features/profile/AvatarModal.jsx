// frontend/src/features/profile/AvatarModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

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

    const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 };
    const modalContentStyle = { background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' };
    const primaryButtonStyle = { padding: '10px 20px', background: '#242060', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
    const secondaryButtonStyle = { padding: '10px 20px', background: '#e2e8f0', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <h3 style={{ textAlign: 'center', marginTop: 0 }}>Змінити аватар</h3>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    {preview && <img src={preview} alt="Попередній перегляд" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />}
                </div>
                <h4>Стандартні аватари</h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {defaultAvatars.map(url => (
                        <img key={url} src={`${API_URL}${url}`} alt="стандартний аватар" onClick={() => handleSelectDefault(url)}
                            style={{ width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', border: selectedAvatar === url ? '3px solid #4299e1' : '3px solid transparent' }} />
                    ))}
                </div>
                <label htmlFor="avatar-upload" style={{ cursor: 'pointer', color: '#4299e1', textDecoration: 'underline' }}>... або завантажте свій</label>
                <input type="file" id="avatar-upload" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <button onClick={onClose} style={secondaryButtonStyle}>Скасувати</button>
                    <button onClick={handleSave} disabled={isLoading || (!customAvatarFile && !selectedAvatar)} style={{...primaryButtonStyle, opacity: isLoading || (!customAvatarFile && !selectedAvatar) ? 0.6 : 1 }}>{isLoading ? 'Збереження...' : 'Зберегти'}</button>
                </div>
            </div>
        </div>
    );
};

export default AvatarModal;