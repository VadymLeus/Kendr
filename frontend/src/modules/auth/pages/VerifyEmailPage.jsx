// frontend/src/modules/auth/pages/VerifyEmailPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../common/services/api';
import { IconLoading, IconAlertCircle, IconCheckCircle } from '../../../common/components/ui/Icons';

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

    const containerStyle = {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--platform-bg)',
        padding: '20px'
    };

    const cardStyle = {
        width: '100%',
        maxWidth: '450px',
        background: 'var(--platform-card-bg)',
        padding: '3rem 2rem',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
    };

    const titleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--platform-text-primary)',
        margin: 0
    };

    const textStyle = {
        color: 'var(--platform-text-secondary)',
        fontSize: '1rem',
        lineHeight: 1.6,
        margin: 0
    };

    const buttonStyle = {
        padding: '12px 24px',
        background: 'var(--platform-accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '1rem'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {status === 'verifying' && (
                    <>
                        <div style={{ color: 'var(--platform-accent)' }}>
                            <IconLoading size={64} />
                        </div>
                        <h2 style={titleStyle}>Верифікація...</h2>
                        <p style={textStyle}>{message}</p>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <div style={{ color: 'var(--platform-success)' }}>
                            <IconCheckCircle size={80} />
                        </div>
                        <h2 style={titleStyle}>Успішно!</h2>
                        <p style={textStyle}>{message}</p>
                        <p style={{...textStyle, fontSize: '0.9rem', opacity: 0.8}}>Перенаправлення на сторінку входу...</p>
                        <button onClick={() => navigate('/login')} style={buttonStyle}>
                            Увійти зараз
                        </button>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <div style={{ color: 'var(--platform-danger)' }}>
                            <IconAlertCircle size={80} />
                        </div>
                        <h2 style={titleStyle}>Помилка</h2>
                        <p style={textStyle}>{message}</p>
                        <button onClick={() => navigate('/login')} style={buttonStyle}>
                            Повернутися до входу
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;