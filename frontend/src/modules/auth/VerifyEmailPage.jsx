// frontend/src/modules/auth/VerifyEmailPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../../shared/api/api';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); 
    const [message, setMessage] = useState('Перевірка вашого посилання...');
    const token = searchParams.get('token');
    const effectRan = useRef(false);
    useEffect(() => {
        if (effectRan.current === true || !token) return;
        const verify = async () => {
            effectRan.current = true;
            try {
                await apiClient.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage('Email успішно підтверджено!');
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                console.error(error);
                setStatus('error');
                if (error.response?.data?.message === 'Недійсний або застарілий токен') {
                     setMessage(error.response.data.message);
                } else {
                     setMessage('Помилка верифікації.');
                }
            }
        };
        verify();
    }, [token, navigate]);
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-(--platform-bg) p-5">
            <div className="w-full max-w-112.5 bg-(--platform-card-bg) p-12 px-8 rounded-2xl border border-(--platform-border-color) shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-center flex flex-col items-center gap-6">
                {status === 'verifying' && (
                    <>
                        <div className="text-(--platform-accent) animate-spin">
                            <Loader size={64} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2">Верифікація...</h2>
                            <p className="text-(--platform-text-secondary)]">{message}</p>
                        </div>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-(--platform-success)">
                            <CheckCircle size={80} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2">Успішно!</h2>
                            <p className="text-(--platform-text-secondary) mb-1">{message}</p>
                            <p className="text-sm text-(--platform-text-secondary) opacity-80">Перенаправлення на сторінку входу...</p>
                        </div>
                        <button 
                            onClick={() => navigate('/login')} 
                            className="px-6 py-3 bg-(--platform-accent) text-white border-none rounded-lg text-base font-semibold cursor-pointer mt-4 hover:brightness-95 transition-all"
                        >
                            Увійти зараз
                        </button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="text-(--platform-danger)">
                            <AlertCircle size={80} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2">Помилка</h2>
                            <p className="text-(--platform-text-secondary)">{message}</p>
                        </div>
                        <button 
                            onClick={() => navigate('/login')} 
                            className="px-6 py-3 bg-(--platform-accent) text-white border-none rounded-lg text-base font-semibold cursor-pointer mt-4 hover:brightness-95 transition-all"
                        >
                            Повернутися до входу
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;