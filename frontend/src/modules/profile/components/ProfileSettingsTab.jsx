// frontend/src/modules/profile/components/ProfileSettingsTab.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../app/providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../common/services/api';
import AvatarModal from './AvatarModal';
import { toast } from 'react-toastify';
import ImageUploader from '../../../common/components/ui/ImageUploader';
import { validatePassword } from '../../../common/utils/validationUtils';
import Avatar from '../../../common/components/ui/Avatar';

const ProfileSettingsTab = () => {
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', newPassword: '', currentPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setFormData(prev => ({ ...prev, username: user.username, newPassword: '', currentPassword: '' }));
        }
    }, [user, navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const passwordValidation = validatePassword(formData.newPassword);
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const hasPassword = user?.has_password;
            if (hasPassword && formData.newPassword && !formData.currentPassword) {
                toast.warning('Для зміни пароля введіть поточний пароль.');
                setIsLoading(false);
                return;
            }

            if (formData.newPassword && !passwordValidation.isValid) {
                toast.warning('Новий пароль занадто слабкий (мін. 8 символів, 1 цифра, 1 велика літера).');
                setIsLoading(false);
                return;
            }

            const profileUpdateData = {
                username: formData.username,
                newPassword: formData.newPassword || undefined,
                currentPassword: formData.currentPassword || undefined
            };

            const response = await apiClient.put('/users/profile/update', profileUpdateData);
            updateUser(response.data.user);
            toast.success('Профіль успішно оновлено!');
        } catch (err) {
        } finally {
            setIsLoading(false);
            setFormData(prev => ({...prev, newPassword: '', currentPassword: ''}));
        }
    };
    
    const handleCroppedAvatarUpload = async (file) => {
        setIsAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            
            const response = await apiClient.post('/users/profile/avatar', formData);
            updateUser(response.data.user);
            toast.success('Аватар успішно оновлено!');
        } catch (err) {
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const handleAvatarUpdateFromModal = async (update) => {
        setIsLoading(true);
        try {
             if (update.type === 'default_url') {
                const response = await apiClient.put('/users/profile/avatar-url', { avatar_url: update.url });
                updateUser(response.data.user);
                toast.success('Аватар успішно оновлено!');
            }
        } catch (err) {
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;
    const hasPassword = user?.has_password;
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
    
    const labelStyle = { 
        display: 'block', 
        color: 'var(--platform-text-primary)', 
        marginBottom: '0.5rem' 
    };

    return (
        <div>
            {isModalOpen && <AvatarModal onClose={() => setIsModalOpen(false)} onAvatarUpdate={handleAvatarUpdateFromModal} />}
            
            <div style={gridContainerStyle}>
                <div style={tileStyle}>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>Аватар</h3>
                    <p style={{color: 'var(--platform-text-secondary)', marginBottom: '1rem'}}>Натисніть на зображення, щоб завантажити нове, або кнопку нижче для вибору стандартного.</p>
                    
                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: '1rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '1rem' 
                    }}>
                        <ImageUploader 
                            onUpload={handleCroppedAvatarUpload}
                            aspect={1} 
                            circularCrop={true}
                            uploading={isAvatarUploading}
                        >
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <Avatar 
                                    url={user.avatar_url} 
                                    name={user.username} 
                                    size={120} 
                                    style={{
                                        cursor: 'pointer',
                                        border: '3px solid var(--platform-accent)',
                                        opacity: isAvatarUploading ? 0.5 : 1
                                    }}
                                />
                                {isAvatarUploading && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '50%', 
                                        left: '50%', 
                                        transform: 'translate(-50%, -50%)', 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        textShadow: '0 0 4px black' 
                                    }}>
                                        ...
                                    </div>
                                )}
                                <div style={{ 
                                    position: 'absolute', 
                                    bottom: 0, 
                                    right: 0, 
                                    background: 'var(--platform-accent)', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: '32px', 
                                    height: '32px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    border: '2px solid var(--platform-card-bg)'
                                }}>
                                    📷
                                </div>
                            </div>
                        </ImageUploader>

                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.85rem' }}
                        >
                            Вибрати зі стандартних
                        </button>
                    </div>
                </div>

                <div style={tileStyle}>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>Загальні відомості</h3>
                    <p style={{color: 'var(--platform-text-secondary)', marginBottom: '1rem'}}>Змініть ім'я користувача.</p>
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>
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
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>
                        {hasPassword ? 'Змінити пароль' : 'Створити пароль'}
                    </h3>
                    <p style={{color: 'var(--platform-text-secondary)', marginBottom: '1rem'}}>
                        {hasPassword 
                            ? 'Зробіть пароль більш надійним.' 
                            : 'Додайте пароль, щоб входити не тільки через Google.'}
                    </p>
                    
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Новий пароль</label>
                            <input 
                                type="password" 
                                name="newPassword" 
                                value={formData.newPassword} 
                                onChange={handleChange} 
                                style={inputStyle} 
                                placeholder={hasPassword ? "Залиште пустим, якщо не міняєте" : "Придумайте пароль"} 
                            />
                            {formData.newPassword && (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.75rem', color: passwordValidation.length ? 'var(--platform-success)' : 'var(--platform-text-secondary)' }}>
                                        {passwordValidation.length ? '✓' : '○'} 8+ символів
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: passwordValidation.number ? 'var(--platform-success)' : 'var(--platform-text-secondary)' }}>
                                        {passwordValidation.number ? '✓' : '○'} Цифра
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: passwordValidation.capital ? 'var(--platform-success)' : 'var(--platform-text-secondary)' }}>
                                        {passwordValidation.capital ? '✓' : '○'} Велика літера
                                    </span>
                                </div>
                            )}
                        </div>

                        {hasPassword && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Поточний пароль</label>
                                <input 
                                    type="password" 
                                    name="currentPassword" 
                                    value={formData.currentPassword} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    required={!!formData.newPassword}
                                    placeholder="Для підтвердження"
                                />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Збереження...' : (hasPassword ? 'Змінити пароль' : 'Встановити пароль')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsTab;