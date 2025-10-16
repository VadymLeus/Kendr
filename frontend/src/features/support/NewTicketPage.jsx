// frontend/src/features/support/NewTicketPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const NewTicketPage = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/support', { subject, body });
            alert('Ваше звернення успішно створено!');
            navigate('/support/my-tickets');
        } catch (error) {
            alert('Не вдалося створити звернення.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '700px', margin: 'auto' }}>
            <h2>Нове звернення до підтримки</h2>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Тема звернення" required style={{ width: '100%', padding: '10px', marginBottom: '1rem' }} />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Опишіть вашу проблему детально..." required rows="10" style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}></textarea>
            <button type="submit">Надіслати</button>
        </form>
    );
};

export default NewTicketPage;