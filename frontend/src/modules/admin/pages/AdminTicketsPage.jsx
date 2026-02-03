// frontend/src/modules/admin/pages/AdminTicketsPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import { toast } from 'react-toastify';
import AdminPageLayout from '../components/AdminPageLayout';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import apiClient from '../../../shared/api/api';
import { MessageSquare, CheckCircle, AlertCircle, FileText, Gavel, XCircle, RotateCcw, Clock, ExternalLink, Inbox } from 'lucide-react';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const CategoryBadge = ({ type }) => {
    const config = {
        general: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Загальне', icon: MessageSquare },
        technical: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', label: 'Технічне', icon: AlertCircle },
        billing: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Оплата', icon: FileText },
        complaint: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Скарга', icon: AlertCircle },
        appeal: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', label: 'Апеляція', icon: Gavel }
    };
    
    const style = config[type] || config.general;
    const Icon = style.icon;
    
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px',
            background: style.bg, color: style.color, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
            border: `1px solid ${style.color}20`
        }}>
            <Icon size={12} /> {style.label}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const isOpen = status === 'open';
    const isAnswered = status === 'answered';
    let bg = 'rgba(148, 163, 184, 0.1)', color = '#64748b', label = 'Закрито', Icon = CheckCircle;
    if (isOpen) { bg = 'rgba(245, 158, 11, 0.1)'; color = '#d97706'; label = 'Відкрито'; Icon = Clock; }
    else if (isAnswered) { bg = 'rgba(16, 185, 129, 0.1)'; color = '#10b981'; label = 'Є відповідь'; Icon = MessageSquare; }
    
    return (
        <span style={{
            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
            background: bg, color: color, display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
            border: `1px solid ${color}20`, textTransform: 'uppercase'
        }}>
            <Icon size={12} /> {label}
        </span>
    );
};

const AdminTicketsPage = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('active');
    const [viewMode, setViewMode] = useState('list');
    const { 
        filteredData: tickets, loading, searchQuery, setSearchQuery, refresh 
    } = useDataList(`/support/admin/tickets?status=${statusFilter}`, ['subject', 'username', 'user_email', 'id']);

    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const handleAction = async (actionFn, successMessage) => {
        try {
            await actionFn();
            toast.success(successMessage);
            close();
            refresh();
        } catch (err) {
            console.error(err);
            toast.error('Помилка виконання дії');
        }
    };

    const actions = {
        closeTicket: (id) => requestConfirm({
            title: 'Закрити звернення?',
            message: `Ви впевнені, що хочете закрити тікет #${id}? Він буде переміщений до архіву.`,
            type: 'warning',
            confirmLabel: 'Закрити',
            onConfirm: () => handleAction(
                () => apiClient.put(`/support/admin/${id}/status`, { status: 'closed' }),
                `Тікет #${id} закрито`
            )
        }),
        restoreTicket: (id) => requestConfirm({
            title: 'Відновити звернення?',
            message: `Ви впевнені, що хочете відновити тікет #${id}? Він повернеться до списку активних.`,
            type: 'info',
            confirmLabel: 'Відновити',
            onConfirm: () => handleAction(
                () => apiClient.put(`/support/admin/${id}/status`, { status: 'open' }),
                `Тікет #${id} відновлено`
            )
        })
    };

    const handleGoToChat = (e, ticketId) => {
        e.stopPropagation();
        navigate(`/support/ticket/${ticketId}`);
    };

    const styles = useMemo(() => ({
        card: { background: 'var(--platform-card-bg)', borderRadius: '16px', border: '1px solid var(--platform-border-color)', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%' },
        wrapper: { flex: 1, overflowY: 'auto', width: '100%' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '15px', tableLayout: 'fixed' },
        th: { textAlign: 'left', padding: '16px 20px', background: 'var(--platform-bg)', color: 'var(--platform-text-secondary)', fontWeight: '600', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--platform-border-color)', whiteSpace: 'nowrap' },
        td: { padding: '16px 20px', borderBottom: '1px solid var(--platform-border-color)', color: 'var(--platform-text-primary)', verticalAlign: 'middle' },
        link: { color: 'var(--platform-text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '15px', transition: 'color 0.2s', cursor: 'pointer', display: 'block', marginBottom: '4px' },
        filterGroup: { display: 'flex', gap: '4px', background: 'var(--platform-card-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--platform-border-color)', height: 'fit-content' },
        emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--platform-text-secondary)', gap: '16px', padding: '40px' }
    }), []);

    return (
        <AdminPageLayout 
            title="Центр підтримки" 
            icon={MessageSquare} 
            count={tickets.length}
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            onRefresh={refresh} 
            loading={loading}
            searchPlaceholder="Пошук (тема, користувач, ID)..."
        >
            <div style={{ marginBottom: '0px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--platform-text-secondary)' }}>Фільтр:</span>
                <div style={styles.filterGroup}>
                    <Button
                        variant="ghost"
                        onClick={() => setStatusFilter('active')}
                        style={{
                            padding: '6px 16px', height: '32px', fontSize: '13px',
                            background: statusFilter === 'active' ? 'var(--platform-bg)' : 'transparent',
                            color: statusFilter === 'active' ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)',
                            boxShadow: statusFilter === 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            border: statusFilter === 'active' ? '1px solid var(--platform-border-color)' : '1px solid transparent'
                        }}
                    >
                        <Clock size={14} style={{marginRight: '6px'}}/> Активні
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setStatusFilter('closed')}
                        style={{
                            padding: '6px 16px', height: '32px', fontSize: '13px',
                            background: statusFilter === 'closed' ? 'var(--platform-bg)' : 'transparent',
                            color: statusFilter === 'closed' ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)',
                            boxShadow: statusFilter === 'closed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            border: statusFilter === 'closed' ? '1px solid var(--platform-border-color)' : '1px solid transparent'
                        }}
                    >
                        <CheckCircle size={14} style={{marginRight: '6px'}}/> Архів
                    </Button>
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.wrapper} className="custom-scrollbar">
                    <table style={styles.table}>
                        <colgroup>
                            <col style={{width: '70px'}} />
                            <col style={{width: '35%'}} />
                            <col style={{width: '130px'}} />
                            <col style={{width: '20%'}} />
                            <col style={{width: '140px'}} />
                            <col style={{width: '150px'}} />
                            <col style={{width: '100px'}} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Тема / Опис</th>
                                <th style={styles.th}>Категорія</th>
                                <th style={styles.th}>Користувач</th>
                                <th style={styles.th}>Статус</th>
                                <th style={{...styles.th, textAlign: 'right'}}>Оновлено</th>
                                <th style={{...styles.th, textAlign: 'right'}}>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => <tr key={i}><td colSpan="7" style={{padding:'24px', textAlign:'center', opacity:0.5}}>Завантаження...</td></tr>)
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div style={styles.emptyState}>
                                            <Inbox size={48} strokeWidth={1.5} opacity={0.5} />
                                            <span>У цій категорії звернень немає</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : tickets.map(ticket => {
                                const isClosed = ticket.status === 'closed';
                                return (
                                    <tr 
                                        key={ticket.id} 
                                        onClick={(e) => handleGoToChat(e, ticket.id)}
                                        style={{
                                            cursor: 'pointer',
                                            background: !isClosed ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                                            borderBottom: '1px solid var(--platform-border-color)',
                                            transition: 'background 0.2s'
                                        }}
                                        className="hover:bg-(--platform-bg)"
                                    >
                                        <td style={{...styles.td, opacity: 0.6, fontSize: '13px'}}>#{ticket.id}</td>
                                        
                                        <td style={styles.td}>
                                            <div style={{fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: 'var(--platform-text-primary)'}}>
                                                {ticket.subject}
                                            </div>
                                            <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '400px'}}>
                                                {ticket.body}
                                            </div>
                                        </td>

                                        <td style={styles.td}>
                                            <CategoryBadge type={ticket.type || 'general'} />
                                        </td>

                                        <td style={styles.td}>
                                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                                <Avatar url={ticket.user_avatar_url} name={ticket.username} size={32} />
                                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                                    <div style={{fontWeight: '500', fontSize: '14px'}}>{ticket.username}</div>
                                                    <div style={{fontSize: '12px', opacity: 0.6}}>{ticket.user_email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={styles.td}>
                                            <StatusBadge status={ticket.status} />
                                        </td>

                                        <td style={{...styles.td, textAlign: 'right', fontSize: '13px', fontFamily: 'monospace', color: 'var(--platform-text-secondary)'}}>
                                            {formatDate(ticket.updated_at)}
                                        </td>

                                        <td style={{...styles.td, textAlign: 'right'}}>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                                                <Button 
                                                    variant="ghost"
                                                    title="Відкрити чат"
                                                    onClick={(e) => handleGoToChat(e, ticket.id)}
                                                    className="text-blue-500 hover:bg-blue-50"
                                                    style={{ color: '#3b82f6', padding: '6px' }}
                                                    icon={<ExternalLink size={18} />}
                                                />
                                                
                                                <Button 
                                                    variant="ghost"
                                                    title={isClosed ? "Відновити звернення" : "Закрити звернення"}
                                                    onClick={() => isClosed ? actions.restoreTicket(ticket.id) : actions.closeTicket(ticket.id)}
                                                    className={isClosed ? "text-green-500 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}
                                                    style={{ color: isClosed ? 'var(--platform-success)' : 'var(--platform-danger)', padding: '6px' }}
                                                    icon={isClosed ? <RotateCcw size={18} /> : <XCircle size={18} />}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isOpen}
                title={config.title}
                message={config.message}
                confirmLabel={config.confirmLabel}
                cancelLabel={config.cancelLabel}
                onConfirm={config.onConfirm}
                onCancel={close}
                type={config.type}
            />
        </AdminPageLayout>
    );
};

export default AdminTicketsPage;