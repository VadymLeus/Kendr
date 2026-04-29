// frontend/src/modules/auth/AdminLoginPage.jsx
import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../app/providers/AuthContext';
import apiClient from '../../shared/api/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../shared/ui/elements';
import OtpInput from '../../shared/ui/complex/OtpInput';
import { Turnstile } from '@marsidev/react-turnstile';
import { ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const AdminLoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [view, setView] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ loginInput: '', password: '' });
    const [targetEmail, setTargetEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const turnstileRef = useRef(null);
    const resetTurnstile = () => {
        setTurnstileToken('');
        turnstileRef.current?.reset();
    };
    
    const handleError = (error, fallback) => {
        const message = error.response?.data?.message || fallback;
        toast.error(message, { toastId: message });
    };
    
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!turnstileToken) return toast.warning('Security clearance required.', { toastId: 'admin-captcha-warn' });
        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/admin/login', {
                ...formData,
                turnstileToken
            });
            if (res.data.require2FA) {
                setTargetEmail(res.data.email);
                setOtpCode('');
                setView('otp');
                toast.info('Код 2FA надіслано адміністратору.', { toastId: 'admin-2fa-sent' });
            }
        } catch (error) {
            resetTurnstile();
            handleError(error, 'Помилка авторизації');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/verify-2fa', { email: targetEmail, code: otpCode });
            login(res.data.user, res.data.token, res.data.require_restore);
            toast.success('Авторизація успішна!', { toastId: 'admin-login-success' });
            navigate('/admin');
        } catch (error) {
            handleError(error, 'Невірний код');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-dvh w-full flex items-center justify-center p-4 sm:p-6 bg-(--platform-bg) transition-colors duration-300">
            <Helmet><title>Admin Gateway | Kendr</title></Helmet>
            <div className="w-full max-w-105 bg-(--platform-card-bg) p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-(--platform-border-color) shadow-[0_10px_40px_rgba(0,0,0,0.08)] relative transition-colors duration-300 mt-12 sm:mt-0">
                <div className="flex flex-col items-center mb-6 sm:mb-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 bg-red-100/50 text-red-600 dark:bg-red-500/10 dark:text-red-500 border border-red-500/20 shadow-sm">
                        {view === 'login' ? <ShieldAlert size={28} className="sm:w-8 sm:h-8" /> : <ShieldCheck size={28} className="sm:w-8 sm:h-8" />}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-(--platform-text-primary) text-center">
                        {view === 'login' ? 'Доступ адміністратора' : 'Перевірка 2FA'}
                    </h1>
                    <p className="text-(--platform-text-secondary) text-xs sm:text-sm mt-2 text-center">
                        {view === 'login' 
                            ? 'Захищена зона системи Kendr' 
                            : 'Введіть токен безпеки для підтвердження'}
                    </p>
                </div>
                {view === 'login' ? (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4 sm:gap-5">
                        <Input 
                            name="loginInput" 
                            label="Ідентифікатор" 
                            placeholder="Логін або Email" 
                            value={formData.loginInput} 
                            onChange={(e) => setFormData({ ...formData, loginInput: e.target.value })} 
                            required 
                            autoComplete="off"
                        />
                        <Input 
                            name="password" 
                            label="Пароль доступу" 
                            type="password" 
                            placeholder="••••••••" 
                            value={formData.password} 
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                            required 
                        />
                        <div className="flex justify-center mt-2 max-w-full overflow-hidden">
                            <Turnstile 
                                siteKey={SITE_KEY} 
                                onSuccess={setTurnstileToken} 
                                ref={turnstileRef}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isLoading || !turnstileToken}
                            className="w-full py-3 sm:py-3.5 mt-2 text-sm sm:text-base rounded-xl font-semibold transition-all"
                        >
                            {isLoading ? 'Автентифікація...' : 'Увійти в панель'}
                        </Button>
                    </form>
                ) : (
                    <div className="flex flex-col items-center relative">
                        <button 
                            onClick={() => { setView('login'); resetTurnstile(); }} 
                            className="absolute -top-12 sm:-top-16 left-0 bg-transparent border-none cursor-pointer text-(--platform-text-secondary) hover:text-(--platform-text-primary) transition-colors p-2 -ml-2 rounded-lg hover:bg-(--platform-hover-bg)"
                            title="Повернутися"
                        >
                            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
                        </button>
                        <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-5 sm:gap-6">
                            <div className="admin-otp-wrapper w-full">
                                <style>{`
                                    .admin-otp-wrapper input {
                                        background-color: var(--platform-input-bg) !important;
                                        color: var(--platform-text-primary) !important;
                                        border-color: var(--platform-border-color) !important;
                                        font-family: var(--font-body, 'Inter', sans-serif);
                                        font-size: 1.1rem;
                                        font-weight: 600;
                                        width: 100% !important;
                                    }
                                    @media (min-width: 640px) {
                                        .admin-otp-wrapper input {
                                            font-size: 1.25rem;
                                        }
                                    }
                                    .admin-otp-wrapper input:focus {
                                        border-color: var(--platform-accent) !important;
                                        box-shadow: 0 0 0 3px color-mix(in srgb, var(--platform-accent), transparent 85%) !important;
                                    }
                                    .admin-otp-wrapper > div {
                                        gap: 0.5rem;
                                        justify-content: space-between;
                                    }
                                `}</style>
                                <OtpInput length={6} value={otpCode} onChange={setOtpCode} disabled={isLoading} />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={isLoading || otpCode.length !== 6}
                                className="w-full py-3 sm:py-3.5 mt-2 text-sm sm:text-base rounded-xl font-semibold transition-all"
                            >
                                {isLoading ? 'Перевірка...' : 'Підтвердити токен'}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLoginPage;