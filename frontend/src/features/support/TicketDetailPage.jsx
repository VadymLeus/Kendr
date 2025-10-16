// frontend/src/features/support/TicketDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { AuthContext } from '../auth/AuthContext';

const API_URL = 'http://localhost:5000';

const TicketDetailPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [replyBody, setReplyBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/support/ticket/${ticketId}`);
            setTicket(response.data);
        } catch (err) {
            setError('Не вдалося завантажити звернення або у вас немає доступу.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyBody.trim()) return;
        try {
            await apiClient.post(`/support/${ticketId}/reply`, { body: replyBody });
            setReplyBody('');
            fetchTicket(); // Оновлюємо дані, щоб побачити нову відповідь
        } catch (err) {
            alert('Не вдалося надіслати відповідь.');
        }
    };
    
    if (loading) return <div>Завантаження звернення...</div>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ maxWidth: '800px', margin: 'auto' }}>
            <h1 style={{ wordBreak: 'break-word' }}>{ticket.subject}</h1>
            <p>Статус: <span style={{ fontWeight: 'bold' }}>{ticket.status}</span></p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                {/* Перше повідомлення */}
                <div style={messageStyle(false)}>
                    <p style={{ margin: 0 }}>{ticket.body}</p>
                    <small style={{ color: '#718096', alignSelf: 'flex-end' }}>
                        {new Date(ticket.created_at).toLocaleString()}
                    </small>
                </div>

                {/* Відповіді */}
                {ticket.replies.map(reply => (
                    <div key={reply.id} style={messageStyle(reply.role === 'admin')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <img src={`${API_URL}${reply.avatar_url}`} alt={reply.username} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                            <strong>{reply.username}</strong>
                            {reply.role === 'admin' && <span style={adminBadgeStyle}>Підтримка</span>}
                        </div>
                        <p style={{ margin: 0 }}>{reply.body}</p>
                        <small style={{ color: '#a0aec0', alignSelf: 'flex-end', marginTop: '0.5rem' }}>
                            {new Date(reply.created_at).toLocaleString()}
                        </small>
                    </div>
                ))}
            </div>

            {/* Форма для відповіді */}
            {ticket.status !== 'closed' && (
                <form onSubmit={handleReplySubmit} style={{ marginTop: '3rem' }}>
                    <hr />
                    <h3>Ваша відповідь</h3>
                    <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} rows="7" required style={{ width: '100%', padding: '10px' }}></textarea>
                    <button type="submit" style={{ marginTop: '1rem' }}>Надіслати</button>
                </form>
            )}
        </div>
    );
};

// Стили
const messageStyle = (isAdmin) => ({
    padding: '1rem',
    borderRadius: '12px',
    background: isAdmin ? '#e2e8f0' : '#f0f4ff',
    border: `1px solid ${isAdmin ? '#cbd5e0' : '#d3dfff'}`,
    display: 'flex',
    flexDirection: 'column'
});

const adminBadgeStyle = {
    background: '#e53e3e',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem'
};

export default TicketDetailPage;