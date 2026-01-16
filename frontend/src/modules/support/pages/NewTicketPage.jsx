// frontend/src/modules/support/pages/NewTicketPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import { Helmet } from 'react-helmet-async';
import { Send, X, Info, FileText, Edit } from 'lucide-react';

const NewTicketPage = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.site) {
            const { site } = location.state;
            setSubject(`Оскарження блокування сайту: ${site.site_path}`);
            setBody(`Я, власник сайту "${site.title}" (${site.site_path}), хочу оскаржити рішення про його блокування. \n\nБудь ласка, опишіть, чому ви вважаєте, що блокування було помилковим:\n\n`);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await apiClient.post('/support', { subject, body });
            toast.success('Ваше звернення успішно створено!');
            setTimeout(() => {
                navigate('/support/my-tickets');
            }, 1000);
        } catch (error) {
            toast.error('Не вдалося створити звернення');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        background: 'var(--platform-input-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '1rem',
        marginBottom: '1.5rem',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        fontFamily: 'inherit'
    };

    const focusStyle = (e) => e.target.style.borderColor = 'var(--platform-accent)';
    const blurStyle = (e) => e.target.style.borderColor = 'var(--platform-border-color)';

    return (
        <div style={containerStyle}>
            <Helmet>
                <title>Нове звернення | Kendr</title>
            </Helmet>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.8rem'
                }}>
                    <FileText size={28} style={{ color: 'var(--platform-accent)' }} />
                    Нове звернення
                </h2>
                <p style={{ color: 'var(--platform-text-secondary)' }}>
                    Опишіть вашу проблему, і ми зв'яжемося з вами найближчим часом.
                </p>
            </div>
            
            <div style={{
                background: 'rgba(66, 153, 225, 0.08)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(66, 153, 225, 0.2)',
                marginBottom: '2rem',
                display: 'flex',
                gap: '12px'
            }}>
                <Info size={24} style={{ color: 'var(--platform-accent)', flexShrink: 0 }} />
                <p style={{ color: 'var(--platform-text-secondary)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                    Будь ласка, надайте якомога більше деталей (скріншоти, посилання, кроки відтворення). Це прискорить вирішення проблеми.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ 
                background: 'var(--platform-card-bg)', 
                padding: '2rem', 
                borderRadius: '16px',
                border: '1px solid var(--platform-border-color)',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                <label style={{ display: 'block', color: 'var(--platform-text-primary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Тема звернення
                </label>
                <input 
                    type="text" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                    placeholder="Наприклад: Помилка при збереженні сторінки" 
                    required 
                    style={inputStyle}
                    disabled={loading}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                />
                
                <label style={{ display: 'block', color: 'var(--platform-text-primary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Детальний опис
                </label>
                <textarea 
                    value={body} 
                    onChange={e => setBody(e.target.value)} 
                    placeholder="Опишіть проблему тут..." 
                    required 
                    style={{ ...inputStyle, minHeight: '200px', resize: 'vertical' }}
                    disabled={loading}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                ></textarea>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <Button 
                        type="button"
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                        icon={<X size={18} />}
                        style={{ flex: 1 }}
                    >
                        Скасувати
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading}
                        icon={loading ? null : <Send size={18} />}
                        style={{ flex: 1 }}
                    >
                        {loading ? 'Надсилання...' : 'Надіслати'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NewTicketPage;