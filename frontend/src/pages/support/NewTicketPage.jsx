// frontend/src/pages/support/NewTicketPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/api';

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
            alert('Ваше звернення успішно створено!');
            navigate('/support/my-tickets');
        } catch (error) {
            alert('Не вдалося створити звернення.');
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
        boxSizing: 'border-box'
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
            <h2 style={{ color: 'var(--platform-text-primary)', marginBottom: '1.5rem' }}>
                Нове звернення до підтримки
            </h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                    placeholder="Тема звернення" 
                    required 
                    style={inputStyle} 
                />
                <textarea 
                    value={body} 
                    onChange={e => setBody(e.target.value)} 
                    placeholder="Опишіть вашу проблему детально..." 
                    required 
                    style={textareaStyle}
                ></textarea>
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%' }}
                >
                    {loading ? 'Надсилання...' : 'Надіслати'}
                </button>
            </form>
        </div>
    );
};

export default NewTicketPage;