// frontend/src/modules/profile/tabs/ProfileGeneralTab.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../../shared/ui/elements';
import Avatar from '../../../shared/ui/elements/Avatar';
import ImageUploadTrigger from '../../../shared/ui/complex/ImageUploadTrigger';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { TEXT_LIMITS } from '../../../shared/config/limits';
import { useCooldown } from '../../../shared/hooks/useCooldown';
import { User, Mail, Phone, Trash2, Camera, LogOut, Check, Upload, BarChart2, Zap, LayoutTemplate, HardDrive, Timer, Eye, ShieldAlert } from 'lucide-react';

const ProfileGeneralTab = () => {
    const { user, updateUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        phone_number: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [updateCooldown, startUpdateCooldown] = useCooldown('kendr_profile_update_cooldown');
    const [statsData, setStatsData] = useState({
        siteCount: 0,
        mediaCount: 0,
        totalViews: 0,
        warningCount: 0,
        limits: null
    });
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                phone_number: user.phone_number || ''
            });
            const fetchStats = async () => {
                try {
                    const [sitesRes, limitsRes, profileRes] = await Promise.all([
                        apiClient.get('/sites/catalog', { params: { scope: 'my' } }),
                        apiClient.get('/media/limits'),
                        apiClient.get(`/users/${user.slug || user.username}`)
                    ]);
                    const sites = Array.isArray(sitesRes.data) ? sitesRes.data : [];
                    const calculatedViews = sites.reduce((sum, site) => sum + (site.view_count || 0), 0);
                    setStatsData({
                        siteCount: sites.length,
                        mediaCount: limitsRes.data.currentFiles || 0,
                        limits: limitsRes.data,
                        totalViews: profileRes.data?.totalViews !== undefined ? profileRes.data.totalViews : calculatedViews,
                        warningCount: profileRes.data?.warning_count || 0
                    });
                } catch (error) {
                    console.error("Failed to fetch stats", error);
                }
            };
            fetchStats();
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (updateCooldown > 0) {
            toast.warning(`Зачекайте ${updateCooldown}с перед наступним оновленням.`);
            return;
        }
        if (!formData.username || formData.username.trim().length < 3) {
            toast.warn('Нікнейм повинен містити мінімум 3 символи');
            return;
        }
        const phoneRegex = /^[0-9+\-\(\)\s]*$/;
        if (formData.phone_number && !phoneRegex.test(formData.phone_number)) {
            toast.error('Некоректний формат телефону. Використовуйте лише цифри та символи + ( ) -');
            return;
        }
        setIsLoading(true);
        try {
            const response = await apiClient.put('/users/profile', formData);
            updateUser(response.data.user);
            toast.success('Профіль оновлено!');
            startUpdateCooldown(30);
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

    const handleLogout = () => {
        setIsLogoutModalOpen(false);
        logout();
        navigate('/auth');
        toast.info("Ви вийшли з системи");
    };

    if (!user) return null;
    const isStaff = user?.role === 'admin' || user?.role === 'moderator';
    const containerStyle = { maxWidth: '900px', margin: '0 auto', width: '100%' };
    const gridLayout = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' };
    const cardStyle = { background: 'var(--platform-card-bg)', border: '1px solid var(--platform-border-color)', borderRadius: '16px', padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
    const sectionTitleStyle = { fontSize: '1.25rem', fontWeight: '600', color: 'var(--platform-text-primary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' };
    const sectionDescStyle = { fontSize: '0.9rem', color: 'var(--platform-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5', margin: 0 };
    const isPlanAdmin = isStaff || (user.plan && String(user.plan).trim().toUpperCase() === 'ADMIN');
    const isPremium = isPlanAdmin || user.plan === 'PLUS';
    const maxSitesDisplay = isPlanAdmin ? '∞' : (statsData.limits ? statsData.limits.maxSites : '...');
    const maxMediaDisplay = isPlanAdmin ? '∞' : (statsData.limits ? statsData.limits.maxFiles : '...');
    const isSiteLimitReached = !isPlanAdmin && statsData.limits && statsData.siteCount >= statsData.limits.maxSites;
    const isMediaLimitReached = !isPlanAdmin && statsData.limits && statsData.mediaCount >= statsData.limits.maxFiles;
    return (
        <div style={containerStyle}>
            <style>{`
                .avatar-wrapper { position: relative; width: 160px; height: 160px; margin: 0 auto; }
                .avatar-circle { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; position: relative; border: 1px solid var(--platform-border-color); }
                .avatar-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; opacity: 0; transition: opacity 0.2s ease; backdrop-filter: blur(2px); cursor: pointer; }
                .avatar-wrapper:hover .avatar-overlay { opacity: 1; }
                .trash-btn { position: absolute; top: 0; right: 0; background: rgba(0, 0, 0, 0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; transition: background 0.2s, opacity 0.2s; opacity: 0; transform: translate(10%, -10%); }
                .avatar-wrapper:hover .trash-btn { opacity: 1; }
                .trash-btn:hover { background: var(--platform-danger) !important; }
                .stat-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--platform-bg); border-radius: 12px; border: 1px solid var(--platform-border-color); margin-bottom: 12px; }
                .stat-label { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; color: var(--platform-text-primary); font-weight: 500; }
                .stat-value { font-weight: 600; font-size: 0.95rem; }
                .tariff-badge { background: ${isPremium ? 'var(--platform-accent)' : 'var(--platform-border-color)'}; color: ${isPremium ? '#fff' : 'var(--platform-text-primary)'}; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.5px; }
            `}</style>
            <div style={gridLayout}>
                <div style={cardStyle}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={sectionTitleStyle}>
                            <Camera size={22} style={{ color: 'var(--platform-accent)' }} />
                            Фото профілю
                        </h3>
                        <p style={{ ...sectionDescStyle, marginTop: '4px' }}>
                            Формати: JPG, PNG, WEBP. Макс: 2 МБ.
                        </p>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '10px 0' }}>
                        <div className="avatar-wrapper">
                            <div className="avatar-circle">
                                <ImageUploadTrigger 
                                    onUpload={handleAvatarUpload}
                                    aspect={1}
                                    circularCrop={true}
                                    uploading={isAvatarUploading}
                                    triggerStyle={{ width: '100%', height: '100%', display: 'block' }}
                                    maxSizeMB={2}
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
                            {!isStaff && (
                                <div style={{ fontSize: '1rem', color: 'var(--platform-text-secondary)' }}>
                                    {user.email}
                                </div>
                            )}
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
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                        <Input 
                            name="username" 
                            label="Нікнейм" 
                            value={formData.username} 
                            onChange={handleChange} 
                            leftIcon={<User size={18} />} 
                            maxLength={TEXT_LIMITS.USERNAME}
                            showCounter={true}
                            helperText="Мінімум 3 символи"
                        />
                        {!isStaff && (
                            <Input 
                                name="email" 
                                label="Email" 
                                value={user.email} 
                                disabled 
                                leftIcon={<Mail size={18} />}
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                        )}
                        <Input 
                            name="phone_number" 
                            label="Телефон" 
                            value={formData.phone_number} 
                            onChange={handleChange}
                            leftIcon={<Phone size={18} />}
                            placeholder="+380..."
                            maxLength={20}
                        />
                        <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'center' }}>
                            <Button 
                                type="submit" 
                                disabled={isLoading || updateCooldown > 0} 
                                icon={isLoading ? null : (updateCooldown > 0 ? <Timer size={18} /> : <Check size={18} />)}
                            >
                                {isLoading ? 'Збереження...' : (updateCooldown > 0 ? `Зачекайте ${updateCooldown}с` : 'Зберегти зміни')}
                            </Button>
                        </div>
                    </form>
                </div>
                <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={sectionTitleStyle}>
                            <BarChart2 size={22} style={{ color: 'var(--platform-accent)' }} />
                            Статистика та Ліміти
                        </h3>
                        <p style={{ ...sectionDescStyle, marginTop: '4px' }}>
                            Поточний стан вашого акаунту та використання ресурсів.
                        </p>
                    </div>
                    <div className="stat-row">
                        <div className="stat-label">
                            <Zap size={18} style={{ color: isPremium ? 'var(--platform-accent)' : 'var(--platform-text-secondary)' }} />
                            Поточний тариф
                        </div>
                        <div className="stat-value">
                            <span className="tariff-badge">{user.plan || 'FREE'}</span>
                        </div>
                    </div>
                    <div className="stat-row">
                        <div className="stat-label">
                            <LayoutTemplate size={18} style={{ color: 'var(--platform-text-secondary)' }} />
                            Створено сайтів
                        </div>
                        <div className="stat-value" style={{ color: isSiteLimitReached ? 'var(--platform-danger)' : 'inherit' }}>
                            {statsData.siteCount} / {maxSitesDisplay}
                        </div>
                    </div>
                    <div className="stat-row">
                        <div className="stat-label">
                            <HardDrive size={18} style={{ color: 'var(--platform-text-secondary)' }} />
                            Завантажено файлів
                        </div>
                        <div className="stat-value" style={{ color: isMediaLimitReached ? 'var(--platform-danger)' : 'inherit' }}>
                            {statsData.mediaCount} / {maxMediaDisplay}
                        </div>
                    </div>
                    <div className="stat-row">
                        <div className="stat-label">
                            <Eye size={18} style={{ color: 'var(--platform-text-secondary)' }} />
                            Всього переглядів на активних сайтах 
                        </div>
                        <div className="stat-value">
                            {statsData.totalViews}
                        </div>
                    </div>
                    <div className="stat-row" style={{ marginBottom: 0 }}>
                        <div className="stat-label">
                            <ShieldAlert size={18} style={{ color: statsData.warningCount > 0 ? 'var(--platform-danger)' : 'var(--platform-text-secondary)' }} />
                            Активні страйки
                        </div>
                        <div className="stat-value" style={{ color: statsData.warningCount > 0 ? 'var(--platform-danger)' : 'inherit' }}>
                            {statsData.warningCount} / 3
                        </div>
                    </div>
                </div>
                <div style={{ 
                    ...cardStyle, 
                    borderColor: 'var(--platform-border-color)', 
                    background: 'var(--platform-card-bg)',
                    gridColumn: '1 / -1',
                    padding: '32px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ ...sectionTitleStyle, marginBottom: '4px' }}>
                                <LogOut size={22} style={{ color: 'var(--platform-text-secondary)' }} />
                                Вихід з акаунту
                            </h3>
                            <p style={{ margin: 0, color: 'var(--platform-text-secondary)', fontSize: '0.9rem', opacity: 0.8 }}>
                                Це завершить вашу поточну сесію в цьому браузері.
                            </p>
                        </div>
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsLogoutModalOpen(true)} 
                            icon={<LogOut size={16} />}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                        >
                            Вийти з системи
                        </Button>
                    </div>
                </div>
            </div>
            <ConfirmModal 
                isOpen={isLogoutModalOpen}
                title="Вихід"
                message="Ви впевнені, що хочете вийти з акаунту?"
                confirmLabel="Вийти"
                cancelLabel="Скасувати"
                onConfirm={handleLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                type="danger"
            />
        </div>
    );
};

export default ProfileGeneralTab;