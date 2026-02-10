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

    const isRegister = view === 'register';
    if (view === 'pending_verification') {
        return (
            <div className="min-h-[calc(100vh-140px)] w-full flex items-center justify-center p-5 bg-(--platform-bg)">
                <Helmet><title>{getPageTitle()}</title></Helmet>
                <div className="w-full max-w-105 bg-(--platform-card-bg) p-10 rounded-3xl border border-(--platform-border-color) shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex flex-col items-center">
                    <div className="mb-6 text-(--platform-accent)">
                        <MailOpen size={64} />
                    </div>
                    <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2 text-center">Перевірте пошту</h2>
                    <p className="text-(--platform-text-secondary) text-sm mb-8 text-center">
                        Лист для підтвердження надіслано на <strong>{pendingEmail}</strong>.
                    </p>
                    <Button onClick={handleResendVerification} disabled={isLoading} className="w-full mb-4">
                        {isLoading ? 'Відправка...' : 'Надіслати повторно'}
                    </Button>
                    <button onClick={() => setView('login')} className="bg-none border-none cursor-pointer text-(--platform-accent) font-semibold text-sm hover:underline">
                        Повернутися до входу
                    </button>
                </div>
            </div>
        );
    }
    
    if (view === 'forgot') {
        return (
            <div className="min-h-[calc(100vh-140px)] w-full flex items-center justify-center p-5 bg-(--platform-bg)">
                <Helmet><title>{getPageTitle()}</title></Helmet>
                <div className="w-full max-w-105 bg-(--platform-card-bg) p-10 rounded-3xl border border-(--platform-border-color) shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex flex-col relative">
                    <button 
                        onClick={() => setView('login')} 
                        className="absolute top-6 left-6 bg-transparent border-none cursor-pointer text-(--platform-text-secondary) hover:text-(--platform-text-primary) transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2 text-center mt-4">Відновлення</h2>
                    <p className="text-(--platform-text-secondary) text-sm mb-8 text-center">Введіть email для скидання пароля</p>
                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                        <Input 
                            name="forgotEmail" 
                            type="email" 
                            placeholder="Ваш Email" 
                            value={forgotEmail} 
                            onChange={(e) => setForgotEmail(e.target.value)} 
                            required 
                        />
                        <Button type="submit" disabled={isLoading} className="w-full py-3">
                            {isLoading ? 'Відправка...' : 'Надіслати'}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-[calc(100vh-140px)] w-full flex items-center justify-center p-5 bg-(--platform-bg)">
            <Helmet>
                <title>{getPageTitle()}</title>
            </Helmet>
            <div 
                className={`
                    w-full bg-(--platform-card-bg) p-8 md:p-10 rounded-3xl border border-(--platform-border-color) shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex flex-col relative transition-all duration-300
                    ${isRegister ? 'max-w-225' : 'max-w-105'}
                `}
            >
                <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2 text-center">
                    {isRegister ? 'Реєстрація' : 'Вхід'}
                </h2>
                <p className="text-(--platform-text-secondary) text-sm mb-8 text-center">
                    {isRegister ? 'Створіть свій профіль на Kendr' : 'З поверненням до платформи!'}
                </p>
                <button 
                    onClick={handleGoogleAuth} 
                    className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-gray-200 bg-white text-gray-800 cursor-pointer font-semibold text-base transition-all shadow-sm hover:bg-gray-50 hover:-translate-y-px hover:shadow-md"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" width="20" />
                    <span>Продовжити з Google</span>
                </button>
                <div className="flex items-center gap-4 my-6 text-(--platform-text-secondary) text-xs">
                    <div className="flex-1 h-px bg-(--platform-border-color)"></div>
                    <span>або</span>
                    <div className="flex-1 h-px bg-(--platform-border-color)"></div>
                </div>
                <form onSubmit={isRegister ? handleRegister : handleLogin}>
                    {isRegister ? (
                        <>
                            <div className="flex justify-center mb-8">
                                <div className="relative w-30 h-30 group">
                                    <div className="w-full h-full rounded-full overflow-hidden border border-(--platform-border-color) bg-(--platform-bg) relative">
                                        <ImageUploadTrigger 
                                            onUpload={handleAvatarUpload}
                                            aspect={1}
                                            circularCrop={true}
                                            uploading={isAvatarUploading}
                                            triggerStyle={{ width: '100%', height: '100%', display: 'block' }}
                                        >
                                            <div className="w-full h-full relative">
                                                <Avatar 
                                                    url={avatarData.preview} 
                                                    name={formData.username || 'User'} 
                                                    size={120} 
                                                    fontSize="48px"
                                                    className="w-full h-full"
                                                />
                                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-[2px]">
                                                    {avatarData.preview ? (
                                                         <Upload size={24} />
                                                    ) : (
                                                         <div className="flex flex-col items-center">
                                                            <Camera size={28} className="mb-1"/>
                                                            <span className="text-[11px] font-medium">Фото</span>
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
                                            className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white border-none cursor-pointer z-20 opacity-0 group-hover:opacity-100 translate-x-[15%] -translate-y-[15%] transition-all hover:bg-(--platform-danger)"
                                            title="Видалити фото"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h4 className="m-0 mb-5 text-(--platform-text-primary) text-base font-semibold pb-2 border-b border-(--platform-border-color)">Особисті дані</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                    <h4 className="m-0 mb-5 text-(--platform-text-primary) text-base font-semibold pb-2 border-b border-(--platform-border-color)">Безпека</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
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
                                    <div className="mt-4">
                                         <PasswordStrengthMeter password={formData.password} />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Input name="loginInput" label="Email або Логін" placeholder="Введіть дані" value={formData.loginInput} onChange={handleChange} required />
                            <Input name="password" label="Пароль" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                            <div className="text-right -mt-1 mb-2">
                                <button type="button" onClick={() => setView('forgot')} className="bg-transparent border-none cursor-pointer text-(--platform-accent) text-sm font-medium hover:underline">Забули пароль?</button>
                            </div>
                        </div>
                    )}
                    <div className={isRegister ? 'mt-10' : 'mt-0'}>
                        <Button type="submit" disabled={isLoading} className="w-full py-3.5 text-base rounded-xl">
                            {isLoading ? 'Обробка...' : (isRegister ? 'Створити акаунт' : 'Увійти')}
                        </Button>
                        
                        {isRegister && (
                            <p className="text-xs text-(--platform-text-secondary) mt-5 text-center leading-relaxed">
                                Натискаючи кнопку "Створити акаунт", ви погоджуєтесь з <Link to="/rules?from=register" target="_blank" className="text-(--platform-accent) no-underline font-medium hover:underline">Умовами використання</Link> та <Link to="/rules?from=register" target="_blank" className="text-(--platform-accent) no-underline font-medium hover:underline">Політикою конфіденційності</Link>.
                            </p>
                        )}
                    </div>
                </form>
                <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="bg-transparent border-none cursor-pointer text-(--platform-accent) font-semibold text-sm mt-6 w-full hover:underline">
                    {view === 'login' ? 'Немає акаунту? Реєстрація' : 'Вже є акаунт? Увійти'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;