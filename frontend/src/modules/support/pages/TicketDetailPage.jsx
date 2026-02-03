// frontend/src/modules/support/pages/TicketDetailPage.jsx
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { AuthContext } from '../../../app/providers/AuthContext';
import { Button } from '../../../shared/ui/elements/Button';
import { Helmet } from 'react-helmet-async';
import { Send, Loader, User, Shield, Lock, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const TicketDetailPage = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
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

    const isSpamBlocked = useMemo(() => {
        if (!ticket || !user) return false;
        if (user.role === 'admin') return false; 
        
        const replies = ticket.replies || [];
        if (replies.length < 2) return false;

        const lastTwo = replies.slice(-2);
        return lastTwo.every(r => r.user_id === user.id);
    }, [ticket, user]);

    const isInputDisabled = useMemo(() => {
        if (!ticket) return true;
        return ticket.status === 'closed' || isSpamBlocked;
    }, [ticket, isSpamBlocked]);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyBody.trim() || isInputDisabled) return;
        
        setSending(true);
        try {
            await apiClient.post(`/support/${ticketId}/reply`, { body: replyBody });
            setReplyBody('');
            await fetchTicket();
        } catch (err) {
            if (err.response && err.response.status === 429) {
                fetchTicket();
            } else {
                alert(err.response?.data?.message || 'Не вдалося надіслати відповідь.');
            }
        } finally {
            setSending(false);
        }
    };

    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        return `${API_URL}${url}`;
    };

    const formatMessageDate = (dateString) => {
        const date = new Date(dateString);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${d}.${m}.${y} - ${time}`;
    };

    const styles = {
        pageWrapper: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--platform-bg)',
            zIndex: 50,
            overflow: 'hidden'
        },
        header: {
            padding: '0 24px',
            height: '64px',
            backgroundColor: 'var(--platform-card-bg)',
            borderBottom: '1px solid var(--platform-border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 10
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        chatArea: {
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--platform-bg)',
            position: 'relative'
        },
        inputArea: {
            padding: '16px 24px',
            backgroundColor: 'var(--platform-card-bg)', 
            borderTop: '1px solid var(--platform-border-color)',
            flexShrink: 0,
            zIndex: 20
        },
        inputForm: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--platform-bg)', 
            borderRadius: '16px',
            padding: '8px 12px'
        },
        messageRow: (isMe) => ({
            display: 'flex',
            justifyContent: isMe ? 'flex-end' : 'flex-start',
            gap: '12px',
            marginBottom: '4px'
        }),
        avatar: (isAdmin) => ({
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isAdmin ? 'var(--platform-accent)' : 'var(--platform-border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            overflow: 'hidden',
            marginTop: '22px'
        }),
        bubble: (isMe, isAdmin) => ({
            maxWidth: '600px',
            padding: '12px 16px',
            borderRadius: '16px',
            borderTopLeftRadius: !isMe ? '4px' : '16px',
            borderTopRightRadius: isMe ? '4px' : '16px',
            background: isMe 
                ? 'var(--platform-accent)' 
                : (isAdmin ? 'rgba(59, 130, 246, 0.1)' : 'var(--platform-card-bg)'),
            color: isMe 
                ? '#fff' 
                : 'var(--platform-text-primary)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            position: 'relative'
        }),
        timestamp: (isMe) => ({
            fontSize: '11px',
            marginTop: '6px',
            opacity: 0.7,
            textAlign: 'right',
            color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--platform-text-secondary)',
            whiteSpace: 'nowrap'
        }),
        nameLabel: (isMe, isAdmin) => ({
            fontSize: '12px',
            fontWeight: '600',
            color: isAdmin ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
            marginBottom: '4px',
            marginLeft: isMe ? 0 : '4px',
            marginRight: isMe ? '4px' : 0,
            textAlign: isMe ? 'right' : 'left'
        }),
        statusBadge: (status) => {
            let color = 'var(--platform-text-secondary)';
            let bg = 'rgba(0,0,0,0.05)';
            let icon = <Clock size={14} />;
            let text = 'Закрито';

            if (status === 'open') {
                color = 'var(--platform-warning)';
                bg = 'rgba(245, 158, 11, 0.1)';
                text = 'Очікує відповіді';
            } else if (status === 'answered') {
                color = 'var(--platform-success)';
                bg = 'rgba(16, 185, 129, 0.1)';
                icon = <CheckCircle size={14} />;
                text = 'Є відповідь';
            } else {
                icon = <XCircle size={14} />;
            }

            return (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '20px',
                    fontSize: '13px', fontWeight: '500',
                    color: color, background: bg
                }}>
                    {icon}
                    {text}
                </div>
            );
        },
        centeredOverlay: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            background: 'var(--platform-card-bg)',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
            maxWidth: '90%',
            width: '380px',
            animation: 'fadeIn 0.3s ease'
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--platform-bg)' }}>
            <Loader size={32} className="animate-spin" style={{ color: 'var(--platform-accent)' }} />
        </div>
    );
    
    if (error) return (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--platform-danger)' }}>{error}</div>
    );
    
    if (!ticket) return null;
    const allMessages = [
        {
            id: 'original',
            user_id: ticket.user_id,
            body: ticket.body,
            created_at: ticket.created_at,
            role: 'user',
            username: 'Ви'
        },
        ...ticket.replies
    ];

    return (
        <div style={styles.pageWrapper}>
            <Helmet>
                <title>{`#${ticket.id} - Підтримка | Kendr`}</title>
            </Helmet>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }`}</style>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Button variant="ghost" icon={<ArrowLeft size={20}/>} onClick={() => navigate('/support')} />
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--platform-text-primary)' }}>
                            {ticket.subject}
                        </h1>
                        <div style={{ fontSize: '13px', color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                {styles.statusBadge(ticket.status)}
            </div>

            <div style={styles.chatArea} className="custom-scrollbar">
                <div style={{ textAlign: 'center', margin: '16px 0', opacity: 0.5, fontSize: '13px' }}>
                    Початок діалогу
                </div>

                {allMessages.map((msg, index) => {
                    const isMe = msg.user_id === user?.id; 
                    const isAdmin = msg.role === 'admin';
                    const avatarSrc = getAvatarUrl(msg.avatar_url);
                    return (
                        <div key={msg.id || index} style={styles.messageRow(isMe)}>
                            {!isMe && (
                                <div style={styles.avatar(isAdmin)} title={msg.username}>
                                    {avatarSrc ? <img src={avatarSrc} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : (isAdmin ? <Shield size={18}/> : <User size={18}/>)}
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                <span style={styles.nameLabel(isMe, isAdmin)}>
                                    {isAdmin ? 'Підтримка' : 'Ви'}
                                </span>
                                
                                <div style={styles.bubble(isMe, isAdmin)}>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '14px' }}>
                                        {msg.body}
                                    </div>
                                    <div style={styles.timestamp(isMe)}>
                                        {formatMessageDate(msg.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />

                {isSpamBlocked && (
                    <div style={styles.centeredOverlay}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: 'rgba(245, 158, 11, 0.1)', color: 'var(--platform-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px'
                        }}>
                            <Clock size={28} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--platform-text-primary)', marginBottom: '8px' }}>
                                Очікуйте на відповідь
                            </div>
                            <div style={{ color: 'var(--platform-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                                Ви надіслали декілька повідомлень поспіль.<br/>
                                Можливість писати тимчасово обмежена.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={styles.inputArea}>
                <form 
                    onSubmit={handleReplySubmit} 
                    style={styles.inputForm}
                >
                    <textarea 
                        value={replyBody} 
                        onChange={e => setReplyBody(e.target.value)} 
                        required 
                        readOnly={sending || isInputDisabled} 
                        placeholder="Напишіть повідомлення..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--platform-text-primary)',
                            minHeight: '24px',
                            maxHeight: '120px',
                            resize: 'none',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            padding: '4px 0',
                            fontFamily: 'inherit',
                            cursor: isInputDisabled ? 'not-allowed' : 'text'
                        }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReplySubmit(e);
                            }
                        }}
                    />
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={sending || !replyBody.trim() || isInputDisabled}
                        style={{ 
                            borderRadius: '50%', 
                            width: '40px', 
                            height: '40px', 
                            padding: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0,
                            cursor: isInputDisabled ? 'not-allowed' : 'pointer',
                            opacity: isInputDisabled ? 1 : undefined 
                        }}
                    >
                        {sending ? <Loader className="animate-spin" size={18}/> : (isInputDisabled ? <Lock size={18} /> : <Send size={18}/>)}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default TicketDetailPage;