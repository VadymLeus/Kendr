// frontend/src/features/profile/tabs/ProfileSettingsTab.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api';
import AvatarModal from '../AvatarModal';

const API_URL = 'http://localhost:5000';

const ProfileSettingsTab = () => {
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', newPassword: '', currentPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setFormData(prev => ({ ...prev, username: user.username, newPassword: '', currentPassword: '' }));
        }
    }, [user, navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        
        try {
            if (!formData.currentPassword) {
                throw new Error('Для внесення змін необхідно ввести поточний пароль.');
            }

            const profileUpdateData = {
                username: formData.username,
                newPassword: formData.newPassword || undefined,
                currentPassword: formData.currentPassword
            };

            const response = await apiClient.put('/users/profile/update', profileUpdateData);
            updateUser(response.data.user);
            setSuccess('Профіль успішно оновлено!');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Сталася невідома помилка.');
        } finally {
            setIsLoading(false);
            setFormData(prev => ({...prev, newPassword: '', currentPassword: ''}));
        }
    };
    
    const handleAvatarUpdate = async (update) => {
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            if (update.type === 'file_upload') {
                updateUser(update.user);
                setSuccess('Аватар успішно оновлено!');
            } 
            else if (update.type === 'default_url') {
                const response = await apiClient.put('/users/profile/avatar-url', { avatar_url: update.url });
                updateUser(response.data.user);
                setSuccess('Аватар успішно оновлено!');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Не вдалося оновити аватар.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div>
            {isModalOpen && <AvatarModal onClose={() => setIsModalOpen(false)} onAvatarUpdate={handleAvatarUpdate} />}
            
            {error && <p style={{ color: 'red', background: '#ffebee', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: 'green', background: '#e8f5e9', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>{success}</p>}

            <div style={gridContainerStyle}>
                <div style={tileStyle}>
                    <h3>Аватар</h3>
                    <p style={{color: '#555'}}>Натисніть на зображення, щоб змінити його.</p>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <img src={`${API_URL}${user.avatar_url}`} alt="avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', cursor: 'pointer' }} onClick={() => setIsModalOpen(true)} />
                    </div>
                </div>

                <div style={tileStyle}>
                    <h3>Загальні відомості</h3>
                    <p style={{color: '#555'}}>Змініть ім'я користувача.</p>
                    <form onSubmit={handleUpdateProfile}>
                        <div>
                            <label>Ім'я користувача</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} style={inputStyle} />
                        </div>
                        <button type="submit" style={primaryButtonStyle} disabled={isLoading}>{isLoading ? 'Збереження...' : 'Оновити ім\'я'}</button>
                    </form>
                </div>

                <div style={tileStyle}>
                    <h3>Змінити пароль</h3>
                    <p style={{color: '#555'}}>Зробіть пароль більш надійним.</p>
                    <form onSubmit={handleUpdateProfile}>
                        <div>
                            <label>Новий пароль</label>
                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} style={inputStyle} placeholder="Залиште пустим, якщо не міняєте" />
                        </div>
                         <div style={{marginTop: '1rem'}}>
                            <label>Поточний пароль</label>
                            <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} style={inputStyle} required placeholder="Обов'язково для змін"/>
                        </div>
                        <button type="submit" style={primaryButtonStyle} disabled={isLoading}>{isLoading ? 'Збереження...' : 'Змінити пароль'}</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Стили
const gridContainerStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' };
const tileStyle = { background: 'white', padding: '1.5rem 2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' };
const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' };
const primaryButtonStyle = { padding: '12px', background: '#242060', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '1rem', width: '100%' };

export default ProfileSettingsTab;