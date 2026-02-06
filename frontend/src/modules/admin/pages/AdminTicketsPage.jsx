// frontend/src/modules/admin/pages/AdminTicketsPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Input } from '../../../shared/ui/elements/Input';
import AdminPageLayout from '../components/AdminPageLayout';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge } from '../components/AdminTableComponents';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import apiClient from '../../../shared/api/api';
import { MessageSquare, CheckCircle, Gavel, XCircle, RotateCcw, Clock, ExternalLink, Inbox, User, HelpCircle, Wrench, CreditCard, Handshake, Search } from 'lucide-react';


const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Всі категорії', icon: Inbox },
    { value: 'general', label: 'Загальні питання', icon: HelpCircle },
    { value: 'technical', label: 'Технічна проблема', icon: Wrench },
    { value: 'billing', label: 'Оплата та тариф', icon: CreditCard },
    { value: 'complaint', label: 'Скарга на контент', icon: MessageSquare },
    { value: 'partnership', label: 'Співпраця', icon: Handshake },
    { value: 'appeal', label: 'Апеляція', icon: Gavel }
];

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const CategoryBadge = ({ type }) => {
    const option = CATEGORY_OPTIONS.find(opt => opt.value === type) || CATEGORY_OPTIONS[1];
    const Icon = option.icon;
    const colors = {
        general: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
        technical: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
        billing: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
        complaint: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
        partnership: { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' },
        appeal: { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }
    };
    
    const style = colors[type] || colors.general;
    return (
        <GenericBadge color={style.color} bg={style.bg} icon={Icon}>
            {option.label === 'Всі категорії' ? type : option.label}
        </GenericBadge>
    );
};

const StatusBadge = ({ status }) => {
    const isOpen = status === 'open';
    const isAnswered = status === 'answered';
    let props = { bg: 'rgba(148, 163, 184, 0.1)', color: '#64748b', icon: CheckCircle, label: 'Закрито' };
    if (isOpen) { 
        props = { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', icon: Clock, label: 'Відкрито' };
    } else if (isAnswered) { 
        props = { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: MessageSquare, label: 'Є відповідь' };
    }
    
    return (
        <GenericBadge color={props.color} bg={props.bg} icon={props.icon}>
            {props.label}
        </GenericBadge>
    );
};

const AdminTicketsPage = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('active');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });
    const { filteredData: rawTickets, loading, searchQuery, setSearchQuery, refresh } = useDataList(`/support/admin/tickets?status=${statusFilter}`, ['subject', 'username', 'user_email', 'id']);
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const processedTickets = useMemo(() => {
        let result = [...rawTickets];
        if (categoryFilter !== 'all') {
            result = result.filter(item => item.type === categoryFilter);
        }
        result.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [rawTickets, categoryFilter, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(curr => ({ key, direction: curr.key === key && curr.direction === 'desc' ? 'asc' : 'desc' }));
    };

    const filterByUser = (username, e) => {
        e.stopPropagation();
        setSearchQuery(username);
        toast.info(`Фільтр по користувачу: ${username}`);
    };

    const handleGoToChat = (e, ticketId) => {
        e.stopPropagation();
        navigate(`/support/ticket/${ticketId}`);
    };

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
            message: `Тікет #${id} буде переміщено до архіву.`,
            type: 'warning',
            confirmLabel: 'Закрити',
            onConfirm: () => handleAction(() => apiClient.put(`/support/admin/${id}/status`, { status: 'closed' }), `Тікет #${id} закрито`)
        }),
        restoreTicket: (id) => requestConfirm({
            title: 'Відновити звернення?',
            message: `Тікет #${id} повернеться до списку активних.`,
            type: 'info',
            confirmLabel: 'Відновити',
            onConfirm: () => handleAction(() => apiClient.put(`/support/admin/${id}/status`, { status: 'open' }), `Тікет #${id} відновлено`)
        })
    };

    return (
        <AdminPageLayout 
            title="Центр підтримки" icon={MessageSquare} count={processedTickets.length}
            onRefresh={refresh} loading={loading}
        >
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar>
                    <div style={{ display: 'flex', background: 'var(--platform-card-bg)', padding: '2px', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }}>
                        {['active', 'closed'].map(status => (
                            <Button
                                key={status}
                                variant="ghost"
                                onClick={() => setStatusFilter(status)}
                                style={{
                                    padding: '4px 12px', height: '30px', fontSize: '13px', borderRadius: '6px',
                                    background: statusFilter === status ? 'var(--platform-bg)' : 'transparent',
                                    color: statusFilter === status ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)',
                                    boxShadow: statusFilter === status ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {status === 'active' ? 'Активні' : 'Архів'}
                            </Button>
                        ))}
                    </div>

                    <div style={{ width: '220px' }}>
                        <CustomSelect 
                            value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                            options={CATEGORY_OPTIONS} variant="minimal" style={{ height: '36px', background: 'var(--platform-card-bg)' }}
                        />
                    </div>
                </FilterBar>
                <div style={{ width: '300px' }}>
                    <Input 
                        placeholder="Пошук (тема, користувач, ID)..."
                        leftIcon={<Search size={16}/>}
                        value={searchQuery || ''} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        wrapperStyle={{margin: 0}}
                    />
                </div>
            </div>

            <AdminTable>
                <colgroup>
                    <col style={{width: '80px'}} />
                    <col style={{width: '30%'}} />
                    <col style={{width: '140px'}} />
                    <col style={{width: '25%'}} />
                    <col style={{width: '140px'}} />
                    <col style={{width: '160px'}} />
                    <col style={{width: '100px'}} />
                </colgroup>
                <thead>
                    <tr>
                        <AdminTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Тема / Опис" sortKey="subject" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Категорія" sortKey="type" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Користувач" sortKey="username" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Статус" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Оновлено" sortKey="updated_at" currentSort={sortConfig} onSort={handleSort} align="right" />
                        <AdminTh label="Дії" align="right" />
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <LoadingRow cols={7} />
                    ) : processedTickets.length === 0 ? (
                        <EmptyRow cols={7} message="У цій категорії звернень немає" />
                    ) : processedTickets.map(ticket => {
                        const isClosed = ticket.status === 'closed';
                        return (
                            <AdminRow 
                                key={ticket.id} 
                                onClick={(e) => handleGoToChat(e, ticket.id)}
                                style={{ background: !isClosed ? 'rgba(59, 130, 246, 0.02)' : 'transparent' }}
                            >
                                <AdminCell style={{opacity: 0.6, fontSize: '13px'}}>#{ticket.id}</AdminCell>
                                
                                <AdminCell>
                                    <div style={{fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: 'var(--platform-text-primary)'}}>
                                        {ticket.subject}
                                    </div>
                                    <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '350px'}}>
                                        {ticket.body}
                                    </div>
                                </AdminCell>

                                <AdminCell>
                                    <CategoryBadge type={ticket.type || 'general'} />
                                </AdminCell>

                                <AdminCell>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        <Avatar url={ticket.user_avatar_url} name={ticket.username} size={32} />
                                        <div style={{display: 'flex', flexDirection: 'column', minWidth: 0}}>
                                            <div style={{fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                {ticket.username}
                                            </div>
                                            <div style={{fontSize: '12px', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                {ticket.user_email}
                                            </div>
                                        </div>
                                        <div 
                                            title="Фільтрувати по цьому користувачу"
                                            onClick={(e) => filterByUser(ticket.username, e)}
                                            style={{
                                                padding: '6px', borderRadius: '6px', cursor: 'pointer', 
                                                color: 'var(--platform-text-secondary)', marginLeft: 'auto',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            className="hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-(--platform-accent)"
                                        >
                                            <User size={14} />
                                        </div>
                                    </div>
                                </AdminCell>

                                <AdminCell>
                                    <StatusBadge status={ticket.status} />
                                </AdminCell>

                                <AdminCell align="right" style={{fontSize: '13px', fontFamily: 'monospace', color: 'var(--platform-text-secondary)'}}>
                                    {formatDate(ticket.updated_at)}
                                </AdminCell>

                                <AdminCell align="right">
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                                        <Button 
                                            variant="ghost" title="Відкрити чат"
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
                                </AdminCell>
                            </AdminRow>
                        );
                    })}
                </tbody>
            </AdminTable>

            <ConfirmModal isOpen={isOpen} {...config} onCancel={close} />
        </AdminPageLayout>
    );
};

export default AdminTicketsPage;