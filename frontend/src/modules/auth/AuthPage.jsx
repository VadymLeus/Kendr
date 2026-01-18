// frontend/src/modules/auth/AuthPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../app/providers/AuthContext';
import apiClient from '../../shared/api/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../shared/ui/elements';
import Avatar from '../../shared/ui/elements/Avatar';
import ImageUploadTrigger from '../../shared/ui/complex/ImageUploadTrigger';
import PasswordStrengthMeter from '../../shared/ui/complex/PasswordStrengthMeter';
import { analyzePassword } from '../../shared/utils/validationUtils';
import { ArrowLeft, MailOpen, Trash, Camera, Upload } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const AuthPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const view = searchParams.get('view') || 'login';
    const setView = (newView) => {
        setSearchParams({ view: newView });
    };

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [formData, setFormData] = useState({
        loginInput: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [forgotEmail, setForgotEmail] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');
    
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

    const handleAvatarUpload = (file) => {
        setIsAvatarUploading(true);
        const previewUrl = URL.createObjectURL(file);
        setAvatarData({ 
            file: file, 
            url: null, 
            preview: previewUrl 
        });
        setIsAvatarUploading(false);
    };

    const handleRemoveAvatar = (e) => {
        if(e) e.stopPropagation();
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
        const passwordChecks = analyzePassword(formData.password);
        
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
        maxWidth: isRegister ? '900px' : '420px',
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

    const mobileRegisterStyle = `
        @media (max-width: 768px) {
            .register-input-row {
                grid-template-columns: 1fr !important;
                gap: 1.5rem !important;
            }
            .auth-card {
                padding: 1.5rem !important;
            }
        }

        .avatar-wrapper {
            position: relative;
            width: 120px;
            height: 120px;
        }

        .avatar-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            border: 1px solid var(--platform-border-color);
            background: var(--platform-bg);
            transition: all 0.2s ease;
            position: relative;
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
            transform: translate(15%, -15%);
        }

        .avatar-wrapper:hover .trash-btn {
            opacity: 1;
        }

        .trash-btn:hover {
            background: var(--platform-danger) !important;
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

    const sectionHeaderStyle = {
        margin: '0 0 1.25rem 0',
        color: 'var(--platform-text-primary)',
        fontSize: '1rem',
        fontWeight: '600',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--platform-border-color)'
    };

    if (view === 'pending_verification') {
        return (
            <div style={pageContainerStyle}>
                <Helmet><title>{getPageTitle()}</title></Helmet>
                <div style={{...cardStyle, maxWidth: '420px'}} className="auth-card">
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--platform-accent)' }}>
                        <MailOpen size={64} />
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
                <Helmet><title>{getPageTitle()}</title></Helmet>
                <div style={{...cardStyle, maxWidth: '420px'}} className="auth-card">
                    <button onClick={() => setView('login')} style={{ position: 'absolute', top: '30px', left: '30px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--platform-text-secondary)' }}>
                        <ArrowLeft size={24} />
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
            <div style={cardStyle} className="auth-card">
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
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
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
                                                    url={avatarData.preview} 
                                                    name={formData.username || 'User'} 
                                                    size={120} 
                                                    fontSize="48px"
                                                    style={{ width: '100%', height: '100%' }}
                                                />
                                                
                                                <div className="avatar-overlay">
                                                    {avatarData.preview ? (
                                                         <Upload size={24} />
                                                    ) : (
                                                         <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                                            <Camera size={28} style={{marginBottom: '4px'}}/>
                                                            <span style={{fontSize: '11px', fontWeight: '500'}}>Фото</span>
                                                         </div>
                                                    )}
                                                </div>
                                            </div>
                                        </ImageUploadTrigger>
                                    </div>

                                    {avatarData.preview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            className="trash-btn"
                                            title="Видалити фото"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <h4 style={sectionHeaderStyle}>Особисті дані</h4>
                                    <div className="register-input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <Input 
                                            name="username" 
                                            label="Ім'я користувача" 
                                            placeholder="Логін" 
                                            value={formData.username} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <Input 
                                            name="email" 
                                            label="Email адреса" 
                                            type="email" 
                                            placeholder="example@mail.com" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h4 style={sectionHeaderStyle}>Безпека</h4>
                                    <div className="register-input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                                        <Input 
                                            name="password" 
                                            label="Пароль" 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={formData.password} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <Input 
                                            name="confirmPassword" 
                                            label="Підтвердження" 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={formData.confirmPassword} 
                                            onChange={handleChange} 
                                            required 
                                            error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Паролі не співпадають" : ""} 
                                        />
                                    </div>
                                    <PasswordStrengthMeter password={formData.password} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Input name="loginInput" label="Email або Логін" placeholder="Введіть дані" value={formData.loginInput} onChange={handleChange} required />
                            <Input name="password" label="Пароль" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                            <div style={{textAlign: 'right', marginTop: '-10px', marginBottom: '20px'}}>
                                <button type="button" onClick={() => setView('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--platform-accent)', fontSize: '0.85rem', fontWeight: '500' }}>Забули пароль?</button>
                            </div>
                        </>
                    )}

                    <div style={{ marginTop: isRegister ? '2.5rem' : '0' }}>
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
                .google-btn:hover { background-color: #f7f7f7 !important; transform: translateY(-1px); boxShadow: 0 4px 12px rgba(0,0,0,0.15) !important; }
            `}</style>
        </div>
    );
};

export default AuthPage;