// frontend/src/modules/support/pages/TicketDetailPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { AuthContext } from '../../../app/providers/AuthContext';
import { Button } from '../../../shared/ui/elements/Button';
import { Send, Loader, User, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const API_URL = 'http://localhost:5000';

const TicketDetailPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [replyBody, setReplyBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchTicket = async () => {
        try {
            const response = await apiClient.get(`/support/${ticketId}`);
            setTicket(response.data);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            setError(err.response?.data?.message || 'Сталася помилка при завантаженні звернення.');
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
        
        setSending(true);
        try {
            await apiClient.post(`/support/${ticketId}/reply`, { body: replyBody });
            setReplyBody('');
            await fetchTicket();
        } catch (err) {
            alert(err.response?.data?.message || 'Не вдалося надіслати відповідь.');
        } finally {
            setSending(false);
        }
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)'
    };

    const messageStyle = (isAdmin, isMe) => ({
        padding: '1.25rem',
        borderRadius: '16px',
        background: isAdmin 
            ? 'rgba(66, 153, 225, 0.1)' 
            : 'var(--platform-card-bg)',
        border: isAdmin 
            ? '1px solid rgba(66, 153, 225, 0.3)' 
            : '1px solid var(--platform-border-color)',
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        marginBottom: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        borderBottomRightRadius: isMe ? '4px' : '16px',
        borderBottomLeftRadius: isAdmin ? '4px' : '16px'
    });

    const getStatusBadge = (status) => {
        const style = {
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase'
        };
        if (status === 'open') return <span style={{ ...style, background: 'rgba(221, 107, 32, 0.1)', color: 'var(--platform-warning)' }}>Відкрито</span>;
        if (status === 'answered') return <span style={{ ...style, background: 'rgba(56, 161, 105, 0.1)', color: 'var(--platform-success)' }}>Є відповідь</span>;
        return <span style={{ ...style, background: 'var(--platform-bg)', color: 'var(--platform-text-secondary)', border: '1px solid var(--platform-border-color)' }}>Закрито</span>;
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader size={32} className="animate-spin" style={{ color: 'var(--platform-accent)', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
    
    if (error) return (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--platform-danger)' }}>{error}</div>
    );
    
    if (!ticket) return null;

    return (
        <div style={containerStyle}>
            <Helmet>
                <title>{`#${ticket.id} - ${ticket.subject} | Kendr`}</title>
            </Helmet>

            <div style={{ 
                borderBottom: '1px solid var(--platform-border-color)', 
                paddingBottom: '1.5rem', 
                marginBottom: '1.5rem' 
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                    <h1 style={{ 
                        color: 'var(--platform-text-primary)', 
                        fontSize: '1.5rem', 
                        margin: '0 0 0.5rem 0',
                        lineHeight: '1.4'
                    }}>
                        {ticket.subject}
                    </h1>
                    <div style={{ flexShrink: 0 }}>
                        {getStatusBadge(ticket.status)}
                    </div>
                </div>
                <p style={{ color: 'var(--platform-text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                    Тікет #{ticket.id} • Створено {new Date(ticket.created_at).toLocaleDateString()}
                </p>
            </div>

            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '0 0.5rem',
                display: 'flex',
                flexDirection: 'column'
            }} className="custom-scrollbar">
                
                <div style={messageStyle(false, true)}>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--platform-text-primary)', whiteSpace: 'pre-wrap' }}>
                        {ticket.body}
                    </p>
                    <small style={{ color: 'var(--platform-text-secondary)', display: 'block', textAlign: 'right', fontSize: '0.8rem' }}>
                        {new Date(ticket.created_at).toLocaleString()}
                    </small>
                </div>
                
                {ticket.replies.map(reply => {
                    const isAdmin = reply.role === 'admin';
                    return (
                        <div key={reply.id} style={messageStyle(isAdmin, !isAdmin)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                                <div style={{
                                    width: '28px', height: '28px',
                                    borderRadius: '50%',
                                    background: isAdmin ? 'var(--platform-accent)' : 'var(--platform-border-color)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff',
                                    overflow: 'hidden'
                                }}>
                                   {reply.avatar_url ? (
                                        <img src={`${API_URL}${reply.avatar_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                   ) : (
                                        isAdmin ? <Shield size={14} /> : <User size={14} />
                                   )}
                                </div>
                                <strong style={{ color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>
                                    {reply.username}
                                </strong>
                                {isAdmin && (
                                    <span style={{ 
                                        background: 'var(--platform-accent)', 
                                        color: '#fff', 
                                        padding: '2px 8px', 
                                        borderRadius: '10px', 
                                        fontSize: '0.7rem', 
                                        fontWeight: 'bold' 
                                    }}>
                                        Підтримка
                                    </span>
                                )}
                            </div>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--platform-text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {reply.body}
                            </p>
                            <small style={{ color: 'var(--platform-text-secondary)', display: 'block', textAlign: 'right', fontSize: '0.8rem' }}>
                                {new Date(reply.created_at).toLocaleString()}
                            </small>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {ticket.status !== 'closed' && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--platform-border-color)', paddingTop: '1.5rem' }}>
                    <form onSubmit={handleReplySubmit}>
                        <textarea 
                            value={replyBody} 
                            onChange={e => setReplyBody(e.target.value)} 
                            required 
                            placeholder="Напишіть відповідь..."
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--platform-border-color)',
                                background: 'var(--platform-input-bg)',
                                color: 'var(--platform-text-primary)',
                                minHeight: '100px',
                                resize: 'vertical',
                                marginBottom: '1rem',
                                fontFamily: 'inherit',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--platform-accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--platform-border-color)'}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={sending}
                                icon={sending ? <Loader className="animate-spin" size={18} style={{ animation: 'spin 1s linear infinite' }}/> : <Send size={18}/>}
                            >
                                {sending ? 'Надсилання...' : 'Відповісти'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default TicketDetailPage;