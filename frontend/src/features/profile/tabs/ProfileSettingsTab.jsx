// frontend/src/features/profile/tabs/ProfileSettingsTab.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api';
import AvatarModal from '../AvatarModal';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000';

const ProfileSettingsTab = () => {
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', newPassword: '', currentPassword: '' });
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
        setIsLoading(true);
        
        try {
            if (!formData.currentPassword) {
                toast.warning('Для внесення змін необхідно ввести поточний пароль.');
                return;
            }

            const profileUpdateData = {
                username: formData.username,
                newPassword: formData.newPassword || undefined,
                currentPassword: formData.currentPassword
            };

            const response = await apiClient.put('/users/profile/update', profileUpdateData);
            updateUser(response.data.user);
            toast.success('✅ Профіль успішно оновлено!');
            setFormData(prev => ({...prev, newPassword: '', currentPassword: ''}));
        } catch (err) {
            console.error('Помилка оновлення профілю:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAvatarUpdate = async (update) => {
        setIsLoading(true);
        try {
            if (update.type === 'file_upload') {
                updateUser(update.user);
                toast.success('✅ Аватар успішно оновлено!');
            } 
            else if (update.type === 'default_url') {
                const response = await apiClient.put('/users/profile/avatar-url', { avatar_url: update.url });
                updateUser(response.data.user);
                toast.success('✅ Аватар успішно оновлено!');
            }
        } catch (err) {
            console.error('Помилка оновлення аватара:', err);
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
        color: 'var(--platform-text-primary)',
        transition: 'border-color 0.2s ease'
    };

    return (
        <div>
            {isModalOpen && <AvatarModal onClose={() => setIsModalOpen(false)} onAvatarUpdate={handleAvatarUpdate} />}
            
            <div style={gridContainerStyle}>
                <div style={tileStyle}>
                    <h3 style={{ 
                        color: 'var(--platform-text-primary)', 
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🖼️ Аватар
                    </h3>
                    <p style={{
                        color: 'var(--platform-text-secondary)', 
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        Натисніть на зображення, щоб змінити його.
                    </p>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <img 
                            src={`${API_URL}${user.avatar_url}`} 
                            alt="avatar" 
                            style={{ 
                                width: '120px', 
                                height: '120px', 
                                borderRadius: '50%', 
                                cursor: 'pointer',
                                border: '3px solid var(--platform-accent)',
                                transition: 'all 0.2s ease',
                                objectFit: 'cover'
                            }} 
                            onClick={() => setIsModalOpen(true)}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                        <div style={{ marginTop: '1rem' }}>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setIsModalOpen(true)}
                                style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                            >
                                ✏️ Змінити аватар
                            </button>
                        </div>
                    </div>
                </div>

                <div style={tileStyle}>
                    <h3 style={{ 
                        color: 'var(--platform-text-primary)', 
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        👤 Загальні відомості
                    </h3>
                    <p style={{
                        color: 'var(--platform-text-secondary)', 
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        Змініть ім'я користувача.
                    </p>
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ 
                                display: 'block', 
                                color: 'var(--platform-text-primary)',
                                marginBottom: '0.5rem',
                                fontWeight: '500'
                            }}>
                                Ім'я користувача
                            </label>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username} 
                                onChange={handleChange} 
                                style={inputStyle}
                                placeholder="Введіть нове ім'я"
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ 
                                width: '100%',
                                opacity: isLoading ? 0.6 : 1
                            }} 
                            disabled={isLoading}
                        >
                            {isLoading ? '⏳ Збереження...' : '💾 Оновити ім\'я'}
                        </button>
                    </form>
                </div>

                <div style={tileStyle}>
                    <h3 style={{ 
                        color: 'var(--platform-text-primary)', 
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🔐 Змінити пароль
                    </h3>
                    <p style={{
                        color: 'var(--platform-text-secondary)', 
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        Зробіть пароль більш надійним.
                    </p>
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ 
                                display: 'block', 
                                color: 'var(--platform-text-primary)',
                                marginBottom: '0.5rem',
                                fontWeight: '500'
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
                                disabled={isLoading}
                            />
                        </div>
                         <div style={{ marginBottom: '1rem' }}>
                            <label style={{ 
                                display: 'block', 
                                color: 'var(--platform-text-primary)',
                                marginBottom: '0.5rem',
                                fontWeight: '500'
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
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ 
                                width: '100%',
                                opacity: isLoading ? 0.6 : 1
                            }} 
                            disabled={isLoading}
                        >
                            {isLoading ? '⏳ Збереження...' : '🔑 Змінити пароль'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsTab;