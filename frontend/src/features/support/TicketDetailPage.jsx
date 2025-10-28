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
            const response = await apiClient.get(`/support/${ticketId}`);
            setTicket(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Сталася невідома помилка при завантаженні звернення.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchTicket();
    }, [ticketId]);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyBody.trim()) return;
        try {
            await apiClient.post(`/support/${ticketId}/reply`, { body: replyBody });
            setReplyBody('');
            fetchTicket();
        } catch (err) {
            alert(err.response?.data?.message || 'Не вдалося надіслати відповідь.');
        }
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const messageStyle = (isAdmin) => ({
        padding: '1.5rem',
        borderRadius: '12px',
        background: isAdmin ? 'var(--platform-bg)' : 'var(--platform-card-bg)',
        border: `1px solid ${isAdmin ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    });

    const adminBadgeStyle = {
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold'
    };

    const replyFormStyle = {
        marginTop: '3rem',
        borderTop: '1px solid var(--platform-border-color)',
        paddingTop: '1.5rem'
    };

    const textareaStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '1rem',
        minHeight: '150px',
        resize: 'vertical',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
    };

    if (loading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--platform-text-secondary)' 
        }}>
            Завантаження звернення...
        </div>
    );
    
    if (error) return (
        <div style={{ 
            color: 'var(--platform-danger)', 
            background: '#fff2f0',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            margin: '2rem'
        }}>
            {error}
        </div>
    );
    
    if (!ticket) return (
        <p style={{ 
            textAlign: 'center', 
            color: 'var(--platform-text-secondary)',
            padding: '2rem'
        }}>
            Звернення не знайдено.
        </p>
    );

    return (
        <div style={containerStyle}>
            <h1 style={{ 
                color: 'var(--platform-text-primary)', 
                wordBreak: 'break-word',
                marginBottom: '1rem'
            }}>
                {ticket.subject}
            </h1>
            <p style={{ 
                color: 'var(--platform-text-secondary)',
                marginBottom: '2rem'
            }}>
                Статус: <span style={{ fontWeight: 'bold' }}>{ticket.status}</span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={messageStyle(false)}>
                    <p style={{ 
                        margin: '0 0 1rem 0',
                        color: 'var(--platform-text-primary)',
                        lineHeight: '1.6'
                    }}>
                        {ticket.body}
                    </p>
                    <small style={{ 
                        color: 'var(--platform-text-secondary)', 
                        alignSelf: 'flex-end',
                        fontSize: '0.9rem'
                    }}>
                        {new Date(ticket.created_at).toLocaleString()}
                    </small>
                </div>
                
                {ticket.replies.map(reply => (
                    <div key={reply.id} style={messageStyle(reply.role === 'admin')}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            marginBottom: '0.75rem' 
                        }}>
                            <img 
                                src={`${API_URL}${reply.avatar_url}`} 
                                alt={reply.username} 
                                style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%',
                                    border: '2px solid var(--platform-border-color)'
                                }} 
                            />
                            <strong style={{ color: 'var(--platform-text-primary)' }}>
                                {reply.username}
                            </strong>
                            {reply.role === 'admin' && <span style={adminBadgeStyle}>Підтримка</span>}
                        </div>
                        <p style={{ 
                            margin: '0 0 1rem 0',
                            color: 'var(--platform-text-primary)',
                            lineHeight: '1.6'
                        }}>
                            {reply.body}
                        </p>
                        <small style={{ 
                            color: 'var(--platform-text-secondary)', 
                            alignSelf: 'flex-end',
                            fontSize: '0.9rem'
                        }}>
                            {new Date(reply.created_at).toLocaleString()}
                        </small>
                    </div>
                ))}
            </div>

            {ticket.status !== 'closed' && (
                <form onSubmit={handleReplySubmit} style={replyFormStyle}>
                    <h3 style={{ 
                        color: 'var(--platform-text-primary)',
                        marginBottom: '1rem'
                    }}>
                        Ваша відповідь
                    </h3>
                    <textarea 
                        value={replyBody} 
                        onChange={e => setReplyBody(e.target.value)} 
                        required 
                        style={textareaStyle}
                        placeholder="Введіть вашу відповідь..."
                    ></textarea>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ marginTop: '1rem' }}
                    >
                        Надіслати
                    </button>
                </form>
            )}
        </div>
    );
};

export default TicketDetailPage;