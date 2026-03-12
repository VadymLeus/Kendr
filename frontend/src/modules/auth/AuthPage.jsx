// frontend/src/modules/auth/AuthPage.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../app/providers/AuthContext';
import apiClient from '../../shared/api/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../shared/ui/elements';
import Avatar from '../../shared/ui/elements/Avatar';
import ImageUploadTrigger from '../../shared/ui/complex/ImageUploadTrigger';
import PasswordStrengthMeter from '../../shared/ui/complex/PasswordStrengthMeter';
import OtpInput from '../../shared/ui/complex/OtpInput';
import { analyzePassword } from '../../shared/utils/validationUtils';
import { GOOGLE_AUTH_URL } from '../../shared/config';
import { useCooldown } from '../../shared/hooks/useCooldown';
import { Turnstile } from '@marsidev/react-turnstile';
import { ArrowLeft, MailOpen, Trash, Camera, Upload, KeyRound } from 'lucide-react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const AuthPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialView = searchParams.get('view') || 'login';
    const [view, setViewInternal] = useState(initialView);
    const [turnstileToken, setTurnstileToken] = useState('');
    const turnstileRef = useRef(null);
    const resetTurnstile = () => {
        setTurnstileToken('');
        turnstileRef.current?.reset();
    };
    const setView = (newView) => {
        setSearchParams({ view: newView });
        setViewInternal(newView);
        resetTurnstile();
    };
    const googleError = searchParams.get('error');
    if (googleError) {
        if (googleError === 'google_auth_failed') {
            toast.error('Не вдалося увійти через Google', { toastId: 'google-err' });
        } else if (googleError === 'auth_failed') {
            toast.error('Помилка авторизації. Будь ласка, перевірте свої дані або спробуйте інший спосіб.', { toastId: 'auth-failed-err' });
        }
        searchParams.delete('error');
        setSearchParams(searchParams);
    }
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [resendCooldown, startResendCooldown] = useCooldown('kendr_resend_cooldown');
    const [targetEmail, setTargetEmail] = useState('');
    const [otpPurpose, setOtpPurpose] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isResetCodeVerified, setIsResetCodeVerified] = useState(false);
    useEffect(() => {
        if ((view === 'otp' || view === 'reset_pass') && !targetEmail) {
            setView('login');
        }
    }, [view, targetEmail]);
    const [formData, setFormData] = useState({
        loginInput: '', email: '', username: '', password: '', confirmPassword: '', newPassword: ''
    });
    const [forgotEmail, setForgotEmail] = useState('');
    const [avatarData, setAvatarData] = useState({ file: null, url: null, preview: null });
    const getPageTitle = () => {
        if (view === 'otp') return 'Перевірка пошти | Kendr';
        if (view === 'reset_pass') return 'Створення пароля | Kendr';
        if (view === 'forgot') return 'Відновлення пароля | Kendr';
        if (view === 'register') return 'Реєстрація акаунту | Kendr';
        return 'Вхід до системи | Kendr';
    };
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleGoogleAuth = () => { window.location.href = GOOGLE_AUTH_URL; };
    const handleAvatarUpload = (file) => {
        setIsAvatarUploading(true);
        setAvatarData({ file: file, url: null, preview: URL.createObjectURL(file) });
        setIsAvatarUploading(false);
    };
    const handleRemoveAvatar = (e) => {
        if(e) e.stopPropagation();
        setAvatarData({ file: null, url: null, preview: null });
    };
    const handleError = (error, fallback) => {
        const message = error.response?.data?.message || fallback;
        toast.error(message, { toastId: message });
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!turnstileToken) return toast.warning('Будь ласка, пройдіть перевірку безпеки.', { toastId: 'captcha-warn' });
        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/login', { 
                loginInput: formData.loginInput, 
                password: formData.password,
                turnstileToken
            });
            login(res.data.user, res.data.token, res.data.require_restore);
            if (res.data.require_restore) {
                toast.warning(res.data.message || 'Акаунт знаходиться в процесі видалення.', { toastId: 'restore-warn' });
            } else {
                toast.success(`З поверненням, ${res.data.user.username}!`, { toastId: 'login-success' });
                navigate('/');
            }
        } catch (error) {
            resetTurnstile();
            if (error.response?.status === 403 && error.response?.data?.isNotVerified) {
                setTargetEmail(error.response.data.email);
                setOtpPurpose('VERIFY_EMAIL');
                setOtpCode('');
                setView('otp');
            } else {
                handleError(error, 'Помилка входу');
            }
        } finally { setIsLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!turnstileToken) return toast.warning('Будь ласка, пройдіть перевірку безпеки.', { toastId: 'captcha-warn' });
        const validation = analyzePassword(formData.password);
        if (validation.isSimple) return toast.warning("Пароль містить надто просту послідовність (123456 або qwerty).", { toastId: 'pass-simple' });
        if (!validation.isValid) return toast.warning("Пароль має містити мінімум 8 символів, велику, малу літеру та цифру.", { toastId: 'pass-invalid' });
        if (formData.password !== formData.confirmPassword) return toast.error("Паролі не співпадають.", { toastId: 'pass-mismatch' });
        setIsLoading(true);
        try {
            const regData = new FormData();
            regData.append('username', formData.username);
            regData.append('email', formData.email);
            regData.append('password', formData.password);
            regData.append('turnstileToken', turnstileToken);
            if (avatarData.file) regData.append('avatar', avatarData.file);
            else if (avatarData.url) regData.append('avatar_url', avatarData.url);
            
            await apiClient.post('/auth/register', regData);
            setTargetEmail(formData.email);
            setOtpPurpose('VERIFY_EMAIL');
            setOtpCode('');
            setView('otp');
        } catch (error) { 
            resetTurnstile();
            handleError(error, 'Помилка реєстрації'); 
        } finally { setIsLoading(false); }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail) return;
        if (!turnstileToken) return toast.warning('Будь ласка, пройдіть перевірку безпеки.', { toastId: 'captcha-warn' });
        setIsLoading(true);
        try {
            await apiClient.post('/auth/forgot-password', { email: forgotEmail, turnstileToken });
            setTargetEmail(forgotEmail);
            setOtpPurpose('RESET_PASSWORD');
            setOtpCode('');
            setIsResetCodeVerified(false);
            setView('reset_pass');
            toast.success('Код надіслано на вашу пошту!', { toastId: 'forgot-sent' });
        } catch (error) { 
            resetTurnstile();
            handleError(error, 'Помилка'); 
        } finally { setIsLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (otpPurpose === 'VERIFY_EMAIL') {
                await apiClient.post('/auth/verify-email', { email: targetEmail, code: otpCode });
                toast.success('Email успішно підтверджено! Тепер увійдіть.', { toastId: 'verify-success' });
                setView('login');
            }
        } catch (error) { handleError(error, 'Невірний код'); } 
        finally { setIsLoading(false); }
    };

    const handleVerifyResetCodeOnly = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiClient.post('/auth/verify-reset-code', { email: targetEmail, code: otpCode });
            setIsResetCodeVerified(true);
        } catch (error) { 
            handleError(error, 'Невірний код підтвердження'); 
        } finally { 
            setIsLoading(false); 
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const validation = analyzePassword(formData.newPassword);
        if (!validation.isValid) return toast.warning("Пароль має містити мінімум 8 символів, велику літеру та цифру.", { toastId: 'reset-weak' });
        if (formData.newPassword !== formData.confirmPassword) return toast.error("Паролі не співпадають", { toastId: 'reset-mismatch' });
        setIsLoading(true);
        try {
            await apiClient.post('/auth/reset-password', { 
                email: targetEmail, 
                code: otpCode, 
                newPassword: formData.newPassword 
            });
            toast.success('Пароль успішно змінено! Увійдіть.', { toastId: 'reset-success' });
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            setView('login');
        } catch (error) { handleError(error, 'Невірний код або пароль'); } 
        finally { setIsLoading(false); }
    };
    const handleResendOtp = async (e) => {
        if (e) e.preventDefault();
        if (resendCooldown > 0) return toast.warning(`Зачекайте ${resendCooldown}с.`, { toastId: 'cooldown-warn' });
        setIsLoading(true);
        try {
            await apiClient.post('/auth/resend-otp', { email: targetEmail, purpose: otpPurpose });
            toast.success('Код надіслано повторно!', { toastId: 'resend-success' });
            startResendCooldown(30);
        } catch (error) { handleError(error, 'Помилка відправки'); } 
        finally { setIsLoading(false); }
    };
    if (view === 'otp') {
        return (
            <div className="min-h-[calc(100vh-140px)] w-full flex items-center justify-center p-5 bg-(--platform-bg)">
                <Helmet><title>{getPageTitle()}</title></Helmet>
                <div className="w-full max-w-105 bg-(--platform-card-bg) p-10 rounded-3xl border border-(--platform-border-color) shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex flex-col relative">
                    <button onClick={() => setView('login')} className="absolute top-6 left-6 bg-transparent border-none cursor-pointer text-(--platform-text-secondary) hover:text-(--platform-text-primary) transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100/20 text-(--platform-accent) mt-2">
                        <MailOpen size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2 text-center">
                        Перевірте пошту
                    </h2>
                    <p className="text-(--platform-text-secondary) text-sm mb-6 text-center">
                        Ми відправили 6-значний код на <strong>{targetEmail}</strong>. Введіть його нижче.
                    </p>
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-2">
                        <OtpInput length={6} value={otpCode} onChange={setOtpCode} disabled={isLoading} />
                        <Button type="submit" disabled={isLoading || otpCode.length !== 6} className="w-full py-3.5 mt-4">
                            {isLoading ? 'Перевірка...' : 'Підтвердити'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={handleResendOtp} disabled={resendCooldown > 0 || isLoading} className="bg-transparent border-none p-0 cursor-pointer text-(--platform-text-secondary) hover:text-(--platform-accent) text-sm font-medium transition-colors disabled:opacity-50">
                            {resendCooldown > 0 ? `Надіслати повторно через ${resendCooldown}с` : 'Надіслати код повторно'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    if (view === 'reset_pass') {
        return (
            <div className="min-h-[calc(100vh-140px)] w-full flex items-center justify-center p-5 bg-(--platform-bg)">
                <Helmet><title>{getPageTitle()}</title></Helmet>
                <div className="w-full max-w-105 bg-(--platform-card-bg) p-10 rounded-3xl border border-(--platform-border-color) shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex flex-col relative">
                    <button onClick={() => setView('login')} className="absolute top-6 left-6 bg-transparent border-none cursor-pointer text-(--platform-text-secondary) hover:text-(--platform-text-primary) transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-yellow-100/30 text-yellow-600 mt-2">
                        <KeyRound size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2 text-center">
                        {isResetCodeVerified ? 'Новий пароль' : 'Відновлення пароля'}
                    </h2>
                    <p className="text-(--platform-text-secondary) text-sm mb-6 text-center">
                        {isResetCodeVerified 
                            ? 'Створіть новий надійний пароль для вашого акаунту.' 
                            : <>Код відправлено на <strong>{targetEmail}</strong>. Введіть його нижче.</>}
                    </p>
                    {!isResetCodeVerified ? (
                        <form onSubmit={handleVerifyResetCodeOnly} className="flex flex-col gap-5">
                            <OtpInput length={6} value={otpCode} onChange={setOtpCode} disabled={isLoading} />
                            <Button type="submit" disabled={isLoading || otpCode.length !== 6} className="w-full py-3.5">
                                {isLoading ? 'Перевірка...' : 'Продовжити'}
                            </Button>
                            <div className="mt-2 text-center">
                                <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0 || isLoading} className="bg-transparent border-none p-0 cursor-pointer text-(--platform-text-secondary) hover:text-(--platform-accent) text-sm font-medium transition-colors disabled:opacity-50">
                                    {resendCooldown > 0 ? `Надіслати код через ${resendCooldown}с` : 'Надіслати код повторно'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                            <Input 
                                name="newPassword" 
                                label="Новий пароль" 
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.newPassword} 
                                onChange={handleChange} 
                                required 
                            />
                            <Input 
                                name="confirmPassword" 
                                label="Підтвердження пароля" 
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                required 
                                error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? "Паролі не співпадають" : ""}
                            />
                            <div className="-mt-2.5 mb-2">
                                 <PasswordStrengthMeter password={formData.newPassword} />
                            </div>
                            <Button type="submit" disabled={isLoading || !formData.newPassword || !formData.confirmPassword} className="w-full py-3.5">
                                {isLoading ? 'Збереження...' : 'Змінити пароль'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        );
    }
    if (view === 'forgot') {
        return (
            <div className="min-h-[calc(100vh-140px)] w-full flex items-center justify-center p-5 bg-(--platform-bg)">
                <Helmet><title>{getPageTitle()}</title></Helmet>
                <div className="w-full max-w-105 bg-(--platform-card-bg) p-10 rounded-3xl border border-(--platform-border-color) shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex flex-col relative">
                    <button onClick={() => setView('login')} className="absolute top-6 left-6 bg-transparent border-none cursor-pointer text-(--platform-text-secondary) hover:text-(--platform-text-primary) transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2 text-center mt-4">Відновлення</h2>
                    <p className="text-(--platform-text-secondary) text-sm mb-8 text-center">Введіть email для отримання коду</p>
                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                        <Input 
                            name="forgotEmail" 
                            type="email" 
                            placeholder="Ваш Email" 
                            value={forgotEmail} 
                            onChange={(e) => setForgotEmail(e.target.value)} 
                            required 
                        />
                        <div className="flex justify-center mt-2">
                            <Turnstile siteKey={SITE_KEY} onSuccess={setTurnstileToken} ref={turnstileRef} />
                        </div>
                        <Button type="submit" disabled={isLoading || !turnstileToken} className="w-full py-3">
                            {isLoading ? 'Відправка...' : 'Отримати код'}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }
    const isRegister = view === 'register';
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
                                        <Input name="username" label="Ім'я користувача" placeholder="Логін" value={formData.username} onChange={handleChange} required />
                                        <Input name="email" label="Email адреса" type="email" placeholder="example@mail.com" value={formData.email} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="m-0 mb-5 text-(--platform-text-primary) text-base font-semibold pb-2 border-b border-(--platform-border-color)">Безпека</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                                        <Input name="password" label="Пароль" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                        <Input name="confirmPassword" label="Підтвердження" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Паролі не співпадають" : ""} />
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
                                <button type="button" onClick={() => setView('forgot')} className="bg-transparent border-none p-0 m-0 cursor-pointer text-(--platform-text-primary) hover:text-(--platform-accent)! text-sm font-medium transition-colors duration-200 no-underline">Забули пароль?</button>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-center mt-6">
                        <Turnstile siteKey={SITE_KEY} onSuccess={setTurnstileToken} ref={turnstileRef} />
                    </div>
                    <div className={isRegister ? 'mt-6' : 'mt-4'}>
                        <Button type="submit" disabled={isLoading || !turnstileToken} className="w-full py-3.5 text-base rounded-xl">
                            {isLoading ? 'Обробка...' : (isRegister ? 'Створити акаунт' : 'Увійти')}
                        </Button>
                        {isRegister && (
                            <p className="text-xs text-(--platform-text-secondary) mt-5 text-center leading-relaxed">
                                Натискаючи кнопку "Створити акаунт", ви погоджуєтесь з <Link to="/rules" target="_blank" className="text-(--platform-text-primary) hover:text-(--platform-accent)! font-semibold transition-colors duration-200 no-underline cursor-pointer">Умовами використання</Link> та <Link to="/rules" target="_blank" className="text-(--platform-text-primary) hover:text-(--platform-accent)! font-semibold transition-colors duration-200 no-underline cursor-pointer">Політикою конфіденційності</Link>.
                            </p>
                        )}
                    </div>
                </form>
                <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setView(view === 'login' ? 'register' : 'login')} 
                    className="mt-6 w-full py-3 rounded-xl"
                >
                    {view === 'login' ? 'Немає акаунту? Реєстрація' : 'Вже є акаунт? Увійти'}
                </Button>
            </div>
        </div>
    );
};

export default AuthPage;