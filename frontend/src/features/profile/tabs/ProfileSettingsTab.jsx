// frontend/src/features/profile/tabs/ProfileSettingsTab.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../providers/AuthContext';
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

    const gridContainerStyle = { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '1.5rem' 
    };

    const tileStyle = { 
        background: 'var(--platform-card-bg)', 
        padding: '1.5rem 2rem', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
        border: '1px solid var(--platform-border-color)' 
    };

    const inputStyle = { 
        width: '100%', 
        padding: '12px', 
        marginTop: '8px', 
        borderRadius: '8px', 
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)'
    };

    return (
        <div>
            {isModalOpen && <AvatarModal onClose={() => setIsModalOpen(false)} onAvatarUpdate={handleAvatarUpdate} />}
            
            {error && (
                <p style={{ 
                    color: 'var(--platform-danger)', 
                    background: '#fff2f0', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    marginBottom: '1rem'
                }}>
                    {error}
                </p>
            )}
            {success && (
                <p style={{ 
                    color: 'var(--platform-success)', 
                    background: '#f6ffed', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    marginBottom: '1rem'
                }}>
                    {success}
                </p>
            )}

            <div style={gridContainerStyle}>
                <div style={tileStyle}>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>Аватар</h3>
                    <p style={{color: 'var(--platform-text-secondary)', marginBottom: '1rem'}}>Натисніть на зображення, щоб змінити його.</p>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <img 
                            src={`${API_URL}${user.avatar_url}`} 
                            alt="avatar" 
                            style={{ 
                                width: '120px', 
                                height: '120px', 
                                borderRadius: '50%', 
                                cursor: 'pointer',
                                border: '3px solid var(--platform-accent)'
                            }} 
                            onClick={() => setIsModalOpen(true)} 
                        />
                    </div>
                </div>

                <div style={tileStyle}>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>Загальні відомості</h3>
                    <p style={{color: 'var(--platform-text-secondary)', marginBottom: '1rem'}}>Змініть ім'я користувача.</p>
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ 
                                display: 'block', 
                                color: 'var(--platform-text-primary)',
                                marginBottom: '0.5rem'
                            }}>
                                Ім'я користувача
                            </label>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username} 
                                onChange={handleChange} 
                                style={inputStyle} 
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%' }} 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Збереження...' : 'Оновити ім\'я'}
                        </button>
                    </form>
                </div>

                <div style={tileStyle}>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>Змінити пароль</h3>
                    <p style={{color: 'var(--platform-text-secondary)', marginBottom: '1rem'}}>Зробіть пароль більш надійним.</p>
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ 
                                display: 'block', 
                                color: 'var(--platform-text-primary)',
                                marginBottom: '0.5rem'
                            }}>
                                Новий пароль
                            </label>
                            <input 
                                type="password" 
                                name="newPassword" 
                                value={formData.newPassword} 
                                onChange={handleChange} 
                                style={inputStyle} 
                                placeholder="Залиште пустим, якщо не міняєте" 
                            />
                        </div>
                         <div style={{ marginBottom: '1rem' }}>
                            <label style={{ 
                                display: 'block', 
                                color: 'var(--platform-text-primary)',
                                marginBottom: '0.5rem'
                            }}>
                                Поточний пароль
                            </label>
                            <input 
                                type="password" 
                                name="currentPassword" 
                                value={formData.currentPassword} 
                                onChange={handleChange} 
                                style={inputStyle} 
                                required 
                                placeholder="Обов'язково для змін"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%' }} 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Збереження...' : 'Змінити пароль'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsTab;