// frontend/src/modules/support/TicketDetailPage.jsx
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../shared/api/api';
import { AuthContext } from '../../app/providers/AuthContext';
import { Button } from '../../shared/ui/elements/Button';
import LoadingState from '../../shared/ui/complex/LoadingState';
import ConfirmModal from '../../shared/ui/complex/ConfirmModal';
import { useConfirmDialog } from '../../shared/hooks/useConfirmDialog';
import DragDropWrapper from '../../shared/ui/complex/DragDropWrapper';
import { FILE_LIMITS } from '../../shared/config/limits';
import NotFoundPage from '../../pages/NotFoundPage';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { Send, Loader, User, Shield, Lock, ArrowLeft, CheckCircle, Clock, XCircle, Paperclip, X, RotateCcw, ArrowDown } from 'lucide-react';

const API_URL = 'http://localhost:5000'; 
const TicketDetailPage = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [replyBody, setReplyBody] = useState('');
    const [attachments, setAttachments] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [isNotFound, setIsNotFound] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useContext(AuthContext);
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null); 
    const ticketRef = useRef(null); 
    const isAtBottomRef = useRef(true);
    useEffect(() => {
        ticketRef.current = ticket;
    }, [ticket]);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setUnreadCount(0); 
    };
    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        const isBottom = distanceToBottom < 80;
        isAtBottomRef.current = isBottom;
        setShowScrollButton(!isBottom);
        if (isBottom && unreadCount > 0) {
            setUnreadCount(0);
        }
    };
    const fetchTicket = async (isBackground = false) => {
        try {
            const response = await apiClient.get(`/support/${ticketId}`);
            const newData = response.data;
            if (isBackground && ticketRef.current) {
                const prevCount = ticketRef.current.replies?.length || 0;
                const newCount = newData.replies?.length || 0;
                if (newCount > prevCount) {
                    const newMsgs = newCount - prevCount;
                    if (isAtBottomRef.current) {
                        setTimeout(scrollToBottom, 100);
                    } else {
                        setUnreadCount(prev => prev + newMsgs);
                    }
                }
            }
            setTicket(newData);
            if (!isBackground) {
                setTimeout(scrollToBottom, 100);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setIsNotFound(true);
            } else if (!isBackground) {
                setError(err.response?.data?.message || 'Сталася помилка при завантаженні звернення.');
            }
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchTicket();
        const intervalId = setInterval(() => {
            fetchTicket(true);
        }, 30000);
        return () => clearInterval(intervalId);
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
    const isCurrentUserAdmin = user?.role === 'admin';
    const closedByText = ticket?.closed_by === 'admin'
        ? (isCurrentUserAdmin ? 'Ви (Адміністратор) закрили це звернення.' : 'Це звернення було закрите адміністратором.')
        : (isCurrentUserAdmin ? 'Користувач закрив це звернення.' : 'Ви закрили це звернення.');
    const handleStatusChange = (newStatus) => {
        const isClosing = newStatus === 'closed';
        requestConfirm({
            title: isClosing ? 'Закрити звернення?' : 'Відновити звернення?',
            message: isClosing 
                ? 'Ви впевнені, що хочете закрити це звернення? Ви більше не зможете писати в нього.' 
                : 'Ви впевнені, що хочете відновити це звернення та відкрити чат?',
            type: isClosing ? 'warning' : 'info',
            confirmLabel: isClosing ? 'Закрити' : 'Відновити',
            onConfirm: async () => {
                try {
                    await apiClient.put(`/support/${ticketId}/status`, { status: newStatus });
                    toast.success(isClosing ? 'Звернення успішно закрито' : 'Звернення відновлено');
                    close();
                    await fetchTicket();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Помилка при зміні статусу');
                    close();
                }
            }
        });
    };

    const handleFileSelect = (files) => {
        if (attachments.length + files.length > FILE_LIMITS.TICKET_ATTACHMENT.MAX_FILES) {
            toast.error(`Максимальна кількість файлів: ${FILE_LIMITS.TICKET_ATTACHMENT.MAX_FILES}`);
            return;
        }
        const validFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`Файл ${file.name} не є зображенням.`);
                return false;
            }
            if (file.size > FILE_LIMITS.TICKET_ATTACHMENT.MAX_SIZE) {
                const maxSizeMB = FILE_LIMITS.TICKET_ATTACHMENT.MAX_SIZE / (1024 * 1024);
                toast.error(`Файл ${file.name} перевищує ліміт у ${maxSizeMB} МБ.`);
                return false;
            }
            return true;
        });
        const newAttachments = validFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setAttachments(prev => [...prev, ...newAttachments].slice(0, FILE_LIMITS.TICKET_ATTACHMENT.MAX_FILES));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (indexToRemove) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        return () => attachments.forEach(file => URL.revokeObjectURL(file.preview));
    }, [attachments]);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if ((!replyBody.trim() && attachments.length === 0) || isInputDisabled) return;
        setSending(true);
        try {
            const formData = new FormData();
            if (replyBody.trim()) formData.append('body', replyBody);
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
            await apiClient.post(`/support/${ticketId}/reply`, formData);
            setReplyBody('');
            setAttachments([]);
            if (textareaRef.current) {
                textareaRef.current.style.height = '40px';
                textareaRef.current.style.overflowY = 'hidden';
            }
            await fetchTicket(false); 
        } catch (err) {
            if (err.response && err.response.status === 429) {
                fetchTicket(false);
            } else {
                toast.error(err.response?.data?.message || 'Не вдалося надіслати відповідь.');
            }
        } finally {
            setSending(false);
        }
    };

    const getAttachmentUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        return `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
    };

    const styles = {
        pageWrapper: {
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', backgroundColor: 'var(--platform-bg)',
            zIndex: 50, overflow: 'hidden'
        },
        header: {
            padding: '0 24px', height: '64px', backgroundColor: 'var(--platform-card-bg)',
            borderBottom: '1px solid var(--platform-border-color)', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 10
        },
        headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
        chatArea: {
            flex: 1, overflowY: 'auto', padding: '24px', display: 'flex',
            flexDirection: 'column', gap: '16px', backgroundColor: 'var(--platform-bg)', position: 'relative'
        },
        inputArea: {
            padding: '16px 24px', 
            backgroundColor: 'var(--platform-bg)', 
            flexShrink: 0, 
            zIndex: 20,
            position: 'relative' 
        },
        inputForm: {
            position: 'relative', 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '12px',
            background: 'var(--platform-card-bg)', 
            borderRadius: '24px', 
            padding: '8px 12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)' 
        },
        messageRow: (isMe) => ({
            display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
            gap: '12px', marginBottom: '4px'
        }),
        avatar: (isAdmin) => ({
            width: '36px', height: '36px', borderRadius: '50%',
            background: isAdmin ? 'var(--platform-accent)' : 'var(--platform-border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0, overflow: 'hidden', marginTop: '22px'
        }),
        bubble: (isMe, isAdmin) => ({
            maxWidth: '600px', padding: '12px 16px',
            borderRadius: '16px', borderTopLeftRadius: !isMe ? '4px' : '16px', borderTopRightRadius: isMe ? '4px' : '16px',
            background: isMe ? 'var(--platform-accent)' : (isAdmin ? 'rgba(59, 130, 246, 0.1)' : 'var(--platform-card-bg)'),
            color: isMe ? '#fff' : 'var(--platform-text-primary)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative'
        }),
        timestamp: (isMe) => ({
            fontSize: '11px', marginTop: '6px', opacity: 0.7, textAlign: 'right',
            color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--platform-text-secondary)', whiteSpace: 'nowrap'
        }),
        nameLabel: (isMe, isAdmin) => ({
            fontSize: '12px', fontWeight: '600', color: isAdmin ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
            marginBottom: '4px', marginLeft: isMe ? 0 : '4px', marginRight: isMe ? '4px' : 0, textAlign: isMe ? 'right' : 'left'
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
        systemBanner: {
            background: 'var(--platform-card-bg)', padding: '24px',
            borderRadius: '24px', border: '1px solid var(--platform-border-color)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            gap: '12px', width: '90%', maxWidth: '380px', margin: '32px auto 16px', animation: 'fadeIn 0.3s ease'
        },
        previewContainer: { display: 'flex', gap: '8px', paddingBottom: '12px', overflowX: 'auto' },
        previewBox: {
            position: 'relative', width: '60px', height: '60px', borderRadius: '8px',
            border: '1px solid var(--platform-border-color)', overflow: 'hidden', flexShrink: 0
        },
        removeBtn: {
            position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)',
            color: 'white', borderRadius: '50%', padding: '2px', cursor: 'pointer', zIndex: 5
        },
        attachmentGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
        attachmentImage: { maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }
    };
    if (isNotFound) return <NotFoundPage />;
    if (loading) return <LoadingState />;
    if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--platform-danger)' }}>{error}</div>;
    if (!ticket) return null;
    const allMessages = [
        {
            id: 'original', 
            user_id: ticket.user_id, 
            body: ticket.body,
            attachments: ticket.attachments, 
            created_at: ticket.created_at,
            role: 'user', 
            username: ticket.username, 
            avatar_url: ticket.avatar_url 
        },
        ...ticket.replies
    ];
    return (
        <DragDropWrapper 
            onDropFiles={handleFileSelect}
            disabled={isInputDisabled}
            style={styles.pageWrapper}
        >
            <Helmet>
                <title>{`#${ticket.id} - Підтримка | Kendr`}</title>
            </Helmet>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }`}</style>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Button variant="ghost" icon={<ArrowLeft size={20}/>} onClick={() => navigate(isCurrentUserAdmin ? '/admin/tickets' : '/support/my-tickets')} />
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--platform-text-primary)' }}>
                            {ticket.subject}
                        </h1>
                        <div style={{ fontSize: '13px', color: 'var(--platform-text-secondary)' }}>
                            #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {styles.statusBadge(ticket.status)}
                    {ticket.status !== 'closed' && (
                        <Button 
                            variant="ghost" 
                            onClick={() => handleStatusChange('closed')}
                            style={{ color: 'var(--platform-danger)', padding: '6px 12px', fontSize: '13px' }}
                        >
                            <XCircle size={16} style={{ marginRight: '6px' }} />
                            Закрити
                        </Button>
                    )}
                    {ticket.status === 'closed' && isCurrentUserAdmin && (
                        <Button 
                            variant="ghost" 
                            onClick={() => handleStatusChange('open')}
                            style={{ color: 'var(--platform-success)', padding: '6px 12px', fontSize: '13px' }}
                        >
                            <RotateCcw size={16} style={{ marginRight: '6px' }} />
                            Відновити
                        </Button>
                    )}
                </div>
            </div>
            <div 
                style={styles.chatArea} 
                className="custom-scrollbar"
                ref={chatContainerRef}
                onScroll={handleScroll}
            >
                <div style={{ textAlign: 'center', margin: '16px 0', opacity: 0.5, fontSize: '13px' }}>
                    Початок діалогу
                </div>
                {allMessages.map((msg, index) => {
                    const isMe = msg.user_id === user?.id; 
                    const isAdmin = msg.role === 'admin';
                    const avatarSrc = getAttachmentUrl(msg.avatar_url);
                    let msgAttachments = [];
                    try {
                        if (msg.attachments) {
                            let parsed = msg.attachments;
                            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                            if (typeof parsed === 'string') parsed = JSON.parse(parsed); 
                            
                            if (Array.isArray(parsed)) {
                                msgAttachments = parsed;
                            }
                        }
                    } catch (e) {
                        console.error('Помилка парсингу картинок:', e);
                    }
                    return (
                        <div key={msg.id || index} style={styles.messageRow(isMe)}>
                            {!isMe && (
                                <div style={styles.avatar(isAdmin)} title={msg.username}>
                                    {avatarSrc ? <img src={avatarSrc} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : (isAdmin ? <Shield size={18}/> : <User size={18}/>)}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                <span style={styles.nameLabel(isMe, isAdmin)}>
                                    {isMe ? 'Ви' : (isAdmin ? 'Підтримка' : (msg.username || 'Користувач'))}
                                </span>
                                <div style={styles.bubble(isMe, isAdmin)}>
                                    {msg.body && (
                                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '14px' }}>
                                            {msg.body}
                                        </div>
                                    )}
                                    {msgAttachments.length > 0 && (
                                        <div style={styles.attachmentGrid}>
                                            {msgAttachments.map((url, i) => (
                                                <img 
                                                    key={i} 
                                                    src={getAttachmentUrl(url)} 
                                                    alt="attachment" 
                                                    style={styles.attachmentImage} 
                                                    onClick={() => window.open(getAttachmentUrl(url), '_blank')} 
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <div style={styles.timestamp(isMe)}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {ticket.status === 'closed' ? (
                    <div style={styles.systemBanner}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.05)', color: 'var(--platform-text-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px'
                        }}>
                            <Lock size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--platform-text-primary)', marginBottom: '8px' }}>
                                Звернення закрито
                            </div>
                            <div style={{ color: 'var(--platform-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                                {closedByText}<br/>
                                Можливість писати вимкнена.
                            </div>
                        </div>
                    </div>
                ) : (
                    isSpamBlocked && (
                        <div style={styles.systemBanner}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'rgba(245, 158, 11, 0.1)', color: 'var(--platform-accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px'
                            }}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--platform-text-primary)', marginBottom: '8px' }}>
                                    Очікуйте на відповідь
                                </div>
                                <div style={{ color: 'var(--platform-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                                    Ви надіслали декілька повідомлень поспіль.<br/>
                                    Можливість писати тимчасово обмежена.
                                </div>
                            </div>
                        </div>
                    )
                )}
                <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputArea}>
                {showScrollButton && (
                    <div style={{ position: 'absolute', top: '-60px', right: '24px', zIndex: 50 }}>
                        <Button
                            variant="primary"
                            onClick={scrollToBottom}
                            style={{
                                width: '44px', height: '44px', borderRadius: '50%', padding: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative'
                            }}
                        >
                            <ArrowDown size={20} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-4px', right: '-4px',
                                    background: 'var(--platform-danger)', color: 'white',
                                    fontSize: '12px', fontWeight: 'bold', width: '22px', height: '22px',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid var(--platform-bg)', lineHeight: 1
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </div>
                )}
                {attachments.length > 0 && (
                    <div style={styles.previewContainer}>
                        {attachments.map((file, index) => (
                            <div key={index} style={styles.previewBox}>
                                <img src={file.preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={styles.removeBtn} onClick={() => removeAttachment(index)}>
                                    <X size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={handleReplySubmit} style={styles.inputForm}>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/jpeg, image/png, image/webp"
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleFileSelect(e.target.files)}
                        disabled={isInputDisabled}
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isInputDisabled}
                        style={{ 
                            width: '40px', 
                            height: '40px', 
                            padding: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justify: 'center',
                            color: 'var(--platform-text-secondary)',
                            flexShrink: 0 
                        }}
                    >
                        <Paperclip size={20} />
                    </Button>
                    <textarea 
                        ref={textareaRef}
                        value={replyBody} 
                        onChange={e => setReplyBody(e.target.value)} 
                        readOnly={sending || isInputDisabled} 
                        placeholder={isInputDisabled ? "Чат закрито" : "Ваше повідомлення ..."}
                        rows={1}
                        style={{
                            flex: 1, 
                            background: 'transparent', 
                            border: 'none', 
                            outline: 'none',
                            color: 'var(--platform-text-primary)', 
                            height: '40px', 
                            minHeight: '40px', 
                            maxHeight: '120px',
                            resize: 'none', 
                            fontSize: '14px', 
                            lineHeight: '24px', 
                            padding: '8px 0', 
                            boxSizing: 'border-box',
                            overflowY: 'hidden',
                            fontFamily: 'inherit', 
                            cursor: isInputDisabled ? 'not-allowed' : 'text'
                        }}
                        onInput={(e) => {
                            e.target.style.height = '40px'; 
                            e.target.style.height = e.target.scrollHeight + 'px';
                            e.target.style.overflowY = e.target.scrollHeight >= 120 ? 'auto' : 'hidden';
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
                        disabled={sending || (!replyBody.trim() && attachments.length === 0) || isInputDisabled}
                        style={{ 
                            borderRadius: '50%', 
                            width: '40px', 
                            height: '40px', 
                            padding: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justify: 'center', 
                            flexShrink: 0 
                        }}
                    >
                        {sending ? <Loader className="animate-spin" size={18}/> : (isInputDisabled ? <Lock size={18} /> : <Send size={18} style={{ transform: 'translate(-1px, 1px)' }}/>)}
                    </Button>
                </form>
            </div>
            <ConfirmModal isOpen={isOpen} {...config} onCancel={close} />
        </DragDropWrapper>
    );
};

export default TicketDetailPage;