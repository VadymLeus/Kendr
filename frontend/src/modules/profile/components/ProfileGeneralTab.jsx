// frontend/src/modules/profile/components/ProfileGeneralTab.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../app/providers/AuthContext';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../../shared/ui/elements';
import Avatar from '../../../shared/ui/elements/Avatar';
import ImageUploadTrigger from '../../../shared/ui/complex/ImageUploadTrigger';
import { TEXT_LIMITS } from '../../../shared/config/limits';
import { User, Mail, Phone, Trash2, Camera, AlertCircle, Check, Upload } from 'lucide-react';

const ProfileGeneralTab = () => {
    const { user, updateUser, logout } = useContext(AuthContext);
    const confirm = useConfirm();
    const [formData, setFormData] = useState({
        username: '',
        phone_number: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                phone_number: user.phone_number || ''
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || formData.username.trim().length < 3) {
            toast.warn('Нікнейм повинен містити мінімум 3 символи');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.put('/users/profile', formData);
            updateUser(response.data.user);
            toast.success('Профіль оновлено!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Помилка оновлення');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarUpload = async (file) => {
        setIsAvatarUploading(true);
        try {
            const data = new FormData();
            data.append('avatar', file);
            const response = await apiClient.post('/users/profile/avatar', data);
            updateUser(response.data.user);
            toast.success('Фото профілю оновлено!');
        } catch (err) {
            toast.error('Помилка завантаження фото');
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const handleDeleteAvatar = async (e) => {
        if (e) e.stopPropagation();
        try {
            const response = await apiClient.delete('/users/profile/avatar');
            updateUser(response.data.user);
            toast.success('Фото видалено');
        } catch (err) {
            toast.error('Не вдалося видалити фото');
        }
    };

    const handleDeleteAccount = () => {
        confirm({
            title: 'Видалити акаунт?',
            message: 'Ця дія незворотна. Всі ваші сайти будуть видалені. Напишіть "DELETE" для підтвердження.',
            requireInput: true,
            confirmText: 'Видалити назавжди',
            danger: true,
            onConfirm: async (inputValue) => {
                if (inputValue !== 'DELETE') return toast.error('Невірне підтвердження.');
                try {
                    await apiClient.delete('/users/me', { data: { confirmation: 'DELETE' } });
                    toast.success('Акаунт видалено.');
                    logout();
                } catch (err) {
                    console.error(err);
                }
            }
        });
    };

    if (!user) return null;
    const containerStyle = {
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
    };

    const gridLayout = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        alignItems: 'start'
    };

    const cardStyle = {
        background: 'var(--platform-card-bg)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '16px',
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    };
    
    const sectionTitleStyle = {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--platform-text-primary)',
        margin: '0 0 4px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const sectionDescStyle = {
        fontSize: '0.9rem',
        color: 'var(--platform-text-secondary)',
        marginBottom: '1.5rem',
        lineHeight: '1.5',
        margin: 0 
    };

    return (
        <div style={containerStyle}>
            <style>{`
                .avatar-wrapper {
                    position: relative;
                    width: 160px;
                    height: 160px;
                    margin: 0 auto;
                }

                .avatar-circle {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    overflow: hidden; 
                    position: relative;
                    border: 1px solid var(--platform-border-color);
                }
                
                .avatar-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    backdrop-filter: blur(2px);
                    cursor: pointer;
                }

                .avatar-wrapper:hover .avatar-overlay {
                    opacity: 1;
                }

                .trash-btn {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 20;
                    transition: background 0.2s, opacity 0.2s;
                    opacity: 0;
                    transform: translate(10%, -10%);
                }

                .avatar-wrapper:hover .trash-btn {
                    opacity: 1;
                }

                .trash-btn:hover {
                    background: var(--platform-danger) !important;
                }
            `}</style>

            <div style={gridLayout}>
                <div style={cardStyle}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={sectionTitleStyle}>
                            <Camera size={22} style={{ color: 'var(--platform-accent)' }} />
                            Фото профілю
                        </h3>
                        <p style={{ ...sectionDescStyle, marginTop: '4px' }}>
                            Натисніть на фото, щоб змінити.
                        </p>
                    </div>

                    <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '20px',
                        padding: '10px 0'
                    }}>
                        <div className="avatar-wrapper">
                            <div className="avatar-circle">
                                <ImageUploadTrigger 
                                    onUpload={handleAvatarUpload}
                                    aspect={1}
                                    circularCrop={true}
                                    uploading={isAvatarUploading}
                                    triggerStyle={{ width: '100%', height: '100%', display: 'block' }}
                                >
                                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                        <Avatar 
                                            url={user.avatar_url} 
                                            name={user.username} 
                                            size={160}
                                            fontSize="64px"
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                        
                                        <div className="avatar-overlay">
                                            <Upload size={32} style={{ marginBottom: '4px' }} />
                                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Змінити</span>
                                        </div>
                                    </div>
                                </ImageUploadTrigger>
                            </div>

                            {user.avatar_url && (
                                <button
                                    type="button"
                                    onClick={handleDeleteAvatar}
                                    className="trash-btn"
                                    title="Видалити фото"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--platform-text-primary)' }}>
                                {user.username}
                            </div>
                            <div style={{ fontSize: '1rem', color: 'var(--platform-text-secondary)' }}>
                                {user.email}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={sectionTitleStyle}>
                            <User size={22} style={{ color: 'var(--platform-accent)' }} />
                            Особисті дані
                        </h3>
                        <p style={{ ...sectionDescStyle, marginTop: '4px' }}>
                            Керуйте своїм публічним іменем та контактами.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input 
                            name="username" 
                            label="Нікнейм" 
                            value={formData.username} 
                            onChange={handleChange} 
                            icon={<User size={18} />}
                            maxLength={TEXT_LIMITS.USERNAME}
                            showCounter={true}
                            helperText="Мінімум 3 символи"
                        />

                        <Input 
                            name="email" 
                            label="Email" 
                            value={user.email} 
                            disabled 
                            icon={<Mail size={18} />}
                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        />

                        <Input 
                            name="phone_number" 
                            label="Телефон" 
                            value={formData.phone_number} 
                            onChange={handleChange}
                            icon={<Phone size={18} />}
                            placeholder="+380..."
                            maxLength={20}
                        />

                        <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                                type="submit" 
                                disabled={isLoading} 
                                icon={isLoading ? null : <Check size={18} />}
                            >
                                {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                            </Button>
                        </div>
                    </form>
                </div>

                <div style={{ 
                    ...cardStyle, 
                    borderColor: '#fed7d7', 
                    background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                    gridColumn: '1 / -1',
                    padding: '32px'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        flexWrap: 'wrap', 
                        gap: '16px' 
                    }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ 
                                ...sectionTitleStyle, 
                                color: '#c53030', 
                                marginBottom: '4px' 
                            }}>
                                <AlertCircle size={22} />
                                Небезпечна зона
                            </h3>
                            <p style={{ 
                                margin: 0, 
                                color: '#c53030', 
                                fontSize: '0.9rem', 
                                opacity: 0.8 
                            }}>
                                Видалення акаунту призведе до <strong>незворотної</strong> втрати всіх ваших сайтів та даних.
                            </p>
                        </div>
                        <Button 
                            variant="danger" 
                            onClick={handleDeleteAccount} 
                            icon={<Trash2 size={16} />}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                        >
                            Видалити акаунт
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileGeneralTab;