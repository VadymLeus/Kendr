// frontend/src/modules/auth/pages/AuthPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../../app/providers/AuthContext';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../../common/components/ui';
import AvatarModal from '../../profile/components/AvatarModal';
import { IconArrowLeft, IconCheck, IconMailOpen, IconTrash, IconPlus } from '../../../common/components/ui/Icons';
import { validatePassword } from '../../../common/utils/validationUtils';

const API_URL = 'http://localhost:5000';

const PasswordStrengthMeter = ({ password }) => {
    const checks = validatePassword(password);
    let score = 0;
    if (password.length > 0) {
        if (checks.length) score++;
        if (checks.number) score++;
        if (checks.capital) score++;
    }

    const getStrengthColor = () => {
        if (score === 0) return 'var(--platform-border-color)';
        if (score === 1) return '#e53e3e';
        if (score === 2) return '#ecc94b';
        return '#48bb78';
    };

    const getStrengthLabel = () => {
        if (score === 0) return 'Пароль';
        if (score === 1) return 'Слабкий';
        if (score === 2) return 'Середній';
        return 'Надійний';
    };

    const barStyle = (index) => ({
        height: '4px',
        flex: 1,
        borderRadius: '2px',
        backgroundColor: index < score ? getStrengthColor() : 'var(--platform-border-color)',
        transition: 'background-color 0.3s ease'
    });

    return (
        <div style={{ marginTop: '4px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                <div style={barStyle(0)} />
                <div style={barStyle(1)} />
                <div style={barStyle(2)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--platform-text-secondary)' }}>
                <span>{getStrengthLabel()}</span>
                {score === 3 && <span style={{ color: '#48bb78', display: 'flex', alignItems: 'center', gap: '4px' }}><IconCheck size={12}/> Чудовий</span>}
            </div>
        </div>
    );
};

const AuthPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const view = searchParams.get('view') || 'login';
    const setView = (newView) => {
        setSearchParams({ view: newView });
    };

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        loginInput: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [forgotEmail, setForgotEmail] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');
    
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarData, setAvatarData] = useState({
        file: null,
        url: null,
        preview: null
    });

    const getPageTitle = () => {
        switch(view) {
            case 'register': return 'Реєстрація акаунту | Kendr';
            case 'forgot': return 'Відновлення пароля | Kendr';
            case 'pending_verification': return 'Підтвердження пошти | Kendr';
            default: return 'Вхід до системи | Kendr';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGoogleAuth = () => {
        window.location.href = `${API_URL}/api/auth/google`;
    };

    const handleAvatarSelect = (data) => {
        if (data.type === 'file') {
            setAvatarData({ file: data.file, url: null, preview: data.previewUrl });
        } else if (data.type === 'default') {
            setAvatarData({ file: null, url: data.url, preview: data.previewUrl });
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarData({ file: null, url: null, preview: null });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/login', {
                loginInput: formData.loginInput,
                password: formData.password
            });
            login(res.data.user, res.data.token);
            toast.success(`З поверненням, ${res.data.user.username}!`);
            res.data.user.role === 'admin' ? navigate('/admin') : navigate('/');
        } catch (error) {
            if (error.response && error.response.status === 403 && error.response.data.isNotVerified) {
                setPendingEmail(error.response.data.email);
                setView('pending_verification');
            } else {
                toast.error(error.response?.data?.message || 'Помилка входу');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const passwordChecks = validatePassword(formData.password);
        if (!passwordChecks.isValid) {
            toast.warning("Пароль недостатньо надійний.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Паролі не співпадають.");
            return;
        }
        setIsLoading(true);
        try {
            const regData = new FormData();
            regData.append('username', formData.username);
            regData.append('email', formData.email);
            regData.append('password', formData.password);
            if (avatarData.file) {
                regData.append('avatar', avatarData.file);
            } else if (avatarData.url) {
                regData.append('avatar_url', avatarData.url);
            }
            await apiClient.post('/auth/register', regData);
            setPendingEmail(formData.email);
            setView('pending_verification');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка реєстрації');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail) return;
        setIsLoading(true);
        try {
            await apiClient.post('/auth/forgot-password', { email: forgotEmail });
            toast.success('Інструкції надіслано на вашу пошту!');
            setView('login');
        } catch (error) { } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setIsLoading(true);
        try {
            await apiClient.post('/auth/resend-verification', { email: pendingEmail });
            toast.success('Лист надіслано повторно!');
        } catch (error) { } finally {
            setIsLoading(false);
        }
    };

    const pageContainerStyle = {
        minHeight: 'calc(100vh - 140px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--platform-bg)',
        padding: '40px 20px',
        boxSizing: 'border-box'
    };

    const isRegister = view === 'register';

    const cardStyle = {
        width: '100%',
        maxWidth: isRegister ? '850px' : '420px',
        background: 'var(--platform-card-bg)',
        padding: '2.5rem',
        borderRadius: '24px',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'max-width 0.3s ease'
    };

    const registerGridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginTop: '1rem'
    };

    const mobileRegisterStyle = `
        @media (max-width: 768px) {
            .register-grid {
                grid-template-columns: 1fr !important;
                gap: 1rem !important;
            }
        }
    `;

    const titleStyle = { fontSize: '1.75rem', fontWeight: '700', color: 'var(--platform-text-primary)', marginBottom: '0.5rem', textAlign: 'center' };
    const subTitleStyle = { color: 'var(--platform-text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', textAlign: 'center' };
    
    const dividerStyle = { display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', color: 'var(--platform-text-secondary)', fontSize: '0.8rem' };
    const lineStyle = { flex: 1, height: '1px', background: 'var(--platform-border-color)' };
    
    const toggleLinkStyle = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--platform-accent)', fontWeight: '600', fontSize: '0.95rem', marginTop: '1.5rem', width: '100%' };
    
    const googleBtnStyle = { 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '12px', 
        padding: '12px', 
        borderRadius: '12px', 
        border: 'none', 
        background: '#ffffff',
        color: '#1a202c',
        cursor: 'pointer', 
        fontWeight: '600', 
        transition: 'all 0.2s', 
        fontSize: '1rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
    };

    const avatarPlaceholderStyle = {
        width: '80px', height: '80px', 
        borderRadius: '50%', 
        background: 'var(--platform-bg)', 
        border: '1px solid var(--platform-border-color)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        margin: '0 auto 1.5rem auto'
    };

    const avatarPreviewContainer = {
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '15px', 
        padding: '10px', 
        background: 'var(--platform-bg)', 
        borderRadius: '12px', 
        border: '1px solid var(--platform-border-color)',
        marginBottom: '1.5rem'
    };

    if (view === 'pending_verification') {
        return (
            <div style={pageContainerStyle}>
                <Helmet>
                    <title>{getPageTitle()}</title>
                </Helmet>
                <div style={{...cardStyle, maxWidth: '420px'}}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--platform-accent)' }}>
                        <IconMailOpen size={64} />
                    </div>
                    <h2 style={titleStyle}>Перевірте пошту</h2>
                    <p style={subTitleStyle}>Лист для підтвердження надіслано на <strong>{pendingEmail}</strong>.</p>
                    <Button onClick={handleResendVerification} disabled={isLoading} style={{ width: '100%', marginBottom: '1rem' }}>
                        {isLoading ? 'Відправка...' : 'Надіслати повторно'}
                    </Button>
                    <button onClick={() => setView('login')} style={toggleLinkStyle}>Повернутися до входу</button>
                </div>
            </div>
        );
    }

    if (view === 'forgot') {
        return (
            <div style={pageContainerStyle}>
                <Helmet>
                    <title>{getPageTitle()}</title>
                </Helmet>
                <div style={{...cardStyle, maxWidth: '420px'}}>
                    <button onClick={() => setView('login')} style={{ position: 'absolute', top: '30px', left: '30px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--platform-text-secondary)' }}>
                        <IconArrowLeft size={24} />
                    </button>
                    <h2 style={titleStyle}>Відновлення</h2>
                    <p style={subTitleStyle}>Введіть email для скидання пароля</p>
                    <form onSubmit={handleForgotPassword}>
                        <Input name="forgotEmail" type="email" placeholder="Ваш Email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required style={{marginBottom: '20px'}} />
                        <Button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px' }}>{isLoading ? 'Відправка...' : 'Надіслати'}</Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={pageContainerStyle}>
            <Helmet>
                <title>{getPageTitle()}</title>
            </Helmet>
            <style>{mobileRegisterStyle}</style>
            
            {isAvatarModalOpen && (
                <AvatarModal onClose={() => setIsAvatarModalOpen(false)} onAvatarUpdate={handleAvatarSelect} mode="select" />
            )}

            <div style={cardStyle}>
                <h2 style={titleStyle}>{isRegister ? 'Реєстрація' : 'Вхід'}</h2>
                <p style={subTitleStyle}>{isRegister ? 'Створіть свій профіль на Kendr' : 'З поверненням до платформи!'}</p>

                <button onClick={handleGoogleAuth} style={googleBtnStyle} className="google-btn">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" width="20" />
                    <span>Продовжити з Google</span>
                </button>

                <div style={dividerStyle}>
                    <div style={lineStyle}></div>
                    <span>або</span>
                    <div style={lineStyle}></div>
                </div>

                <form onSubmit={isRegister ? handleRegister : handleLogin}>
                    
                    {isRegister ? (
                        <div style={registerGridStyle} className="register-grid">
                            <div>
                                <h4 style={{margin: '0 0 1rem 0', color: 'var(--platform-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase'}}>Особисті дані</h4>
                                
                                {avatarData.preview ? (
                                    <div style={avatarPreviewContainer}>
                                        <img src={avatarData.preview} alt="Avatar" style={{width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--platform-border-color)'}} />
                                        <img src={avatarData.preview} alt="Avatar" style={{width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--platform-border-color)', opacity: 0.8}} />
                                        <img src={avatarData.preview} alt="Avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--platform-border-color)', opacity: 0.6}} />
                                        
                                        <button 
                                            type="button" 
                                            onClick={handleRemoveAvatar} 
                                            className="btn btn-danger" 
                                            style={{
                                                padding: '8px', 
                                                borderRadius: '8px',
                                            }}
                                            title="Видалити"
                                        >
                                            <IconTrash size={16}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => setIsAvatarModalOpen(true)} 
                                        style={avatarPlaceholderStyle} 
                                        className="avatar-placeholder"
                                        title="Завантажити фото"
                                    >
                                        <IconPlus size={24} color="var(--platform-text-secondary)" />
                                    </div>
                                )}

                                <Input name="username" label="Ім'я користувача" placeholder="Логін" value={formData.username} onChange={handleChange} required />
                                <Input name="email" label="Email адреса" type="email" placeholder="example@mail.com" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div>
                                <h4 style={{margin: '0 0 1rem 0', color: 'var(--platform-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase'}}>Безпека</h4>
                                
                                <Input name="password" label="Пароль" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                <PasswordStrengthMeter password={formData.password} />
                                <Input name="confirmPassword" label="Підтвердження" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Паролі не співпадають" : ""} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Input name="loginInput" label="Email або Логін" placeholder="Введіть дані" value={formData.loginInput} onChange={handleChange} required />
                            <Input name="password" label="Пароль" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                            <div style={{textAlign: 'right', marginTop: '-10px', marginBottom: '20px'}}>
                                <button type="button" onClick={() => setView('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--platform-accent)', fontSize: '0.85rem', fontWeight: '500' }}>Забули пароль?</button>
                            </div>
                        </>
                    )}

                    <div style={{ marginTop: isRegister ? '2rem' : '0' }}>
                        <Button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '12px' }}>
                            {isLoading ? 'Обробка...' : (isRegister ? 'Створити акаунт' : 'Увійти')}
                        </Button>
                        
                        {isRegister && (
                            <p style={{
                                fontSize: '0.75rem', 
                                color: 'var(--platform-text-secondary)', 
                                marginTop: '1.25rem', 
                                textAlign: 'center',
                                lineHeight: '1.4'
                            }}>
                                Натискаючи кнопку "Створити акаунт", ви погоджуєтесь з <Link to="/rules?from=register" target="_blank" style={{color: 'var(--platform-accent)', textDecoration: 'none', fontWeight: '500'}}>Умовами використання</Link> та <Link to="/rules?from=register" target="_blank" style={{color: 'var(--platform-accent)', textDecoration: 'none', fontWeight: '500'}}>Політикою конфіденційності</Link>.
                            </p>
                        )}
                    </div>
                </form>

                <button onClick={() => setView(view === 'login' ? 'register' : 'login')} style={toggleLinkStyle}>
                    {view === 'login' ? 'Немає акаунту? Реєстрація' : 'Вже є акаунт? Увійти'}
                </button>
            </div>

            <style>{`
                .google-btn:hover { background-color: #f7f7f7 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; }
                .avatar-placeholder:hover { border-color: var(--platform-accent) !important; color: var(--platform-accent) !important; transform: scale(1.05); }
                .avatar-placeholder:hover svg { color: var(--platform-accent) !important; }
            `}</style>
        </div>
    );
};

export default AuthPage;