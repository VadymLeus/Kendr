// frontend/src/modules/support/pages/NewTicketPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';

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
        
        const submitToast = toast.loading('⏳ Надсилання звернення...');
        
        try {
            await apiClient.post('/support', { subject, body });
            toast.update(submitToast, { 
                render: '✅ Ваше звернення успішно створено!', 
                type: "success", 
                isLoading: false, 
                autoClose: 3000 
            });
            setTimeout(() => {
                navigate('/support/my-tickets');
            }, 1500);
        } catch (error) {
            toast.update(submitToast, { 
                render: '❌ Не вдалося створити звернення', 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
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
        padding: '0.75rem',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '1rem',
        marginBottom: '1rem',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease'
    };

    const textareaStyle = {
        ...inputStyle,
        minHeight: '200px',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: '1.5'
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ 
                color: 'var(--platform-text-primary)', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                📩 Нове звернення до підтримки
            </h2>
            
            <div style={{
                background: 'var(--platform-bg)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--platform-border-color)',
                marginBottom: '1.5rem'
            }}>
                <p style={{ 
                    color: 'var(--platform-text-secondary)',
                    margin: 0,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                }}>
                    💡 <span>Будь ласка, опишіть вашу проблему максимально детально. Чим більше інформації ви надасте, тим швидше ми зможемо вам допомогти.</span>
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                        display: 'block',
                        color: 'var(--platform-text-primary)',
                        marginBottom: '0.5rem',
                        fontWeight: '500'
                    }}>
                        Тема звернення:
                    </label>
                    <input 
                        type="text" 
                        value={subject} 
                        onChange={e => setSubject(e.target.value)} 
                        placeholder="Наприклад: Проблема з редагуванням сайту" 
                        required 
                        style={inputStyle}
                        disabled={loading}
                        onFocus={(e) => e.target.style.borderColor = 'var(--platform-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--platform-border-color)'}
                    />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        color: 'var(--platform-text-primary)',
                        marginBottom: '0.5rem',
                        fontWeight: '500'
                    }}>
                        Детальний опис проблеми:
                    </label>
                    <textarea 
                        value={body} 
                        onChange={e => setBody(e.target.value)} 
                        placeholder="Опишіть вашу проблему детально. Вкажіть кроки для відтворення проблеми, додайте посилання та будь-яку іншу корисну інформацію..." 
                        required 
                        style={textareaStyle}
                        disabled={loading}
                        onFocus={(e) => e.target.style.borderColor = 'var(--platform-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--platform-border-color)'}
                    ></textarea>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary"
                        disabled={loading}
                        style={{ 
                            flex: 1,
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        ❌ Скасувати
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ 
                            flex: 1,
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? '⏳ Надсилання...' : '📤 Надіслати звернення'}
                    </button>
                </div>
            </form>

            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'rgba(56, 161, 105, 0.05)',
                border: '1px solid rgba(56, 161, 105, 0.2)',
                borderRadius: '8px'
            }}>
                <h4 style={{ 
                    color: 'var(--platform-success)', 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    ℹ️ Що робити далі?
                </h4>
                <ul style={{ 
                    color: 'var(--platform-text-secondary)',
                    margin: 0,
                    paddingLeft: '1.5rem',
                    fontSize: '0.9rem'
                }}>
                    <li>Після надсилання звернення ви отримаєте відповідь на вашу електронну пошту</li>
                    <li>Статус звернення можна відстежувати у розділі "Мої звернення"</li>
                    <li>Середній час відповіді: 1-2 робочих дні</li>
                </ul>
            </div>
        </div>
    );
};

export default NewTicketPage;