// frontend/src/modules/support/MyTicketsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../shared/api/api';
import { Button } from '../../shared/ui/elements/Button';
import CustomSelect from '../../shared/ui/elements/CustomSelect';
import { Input } from '../../shared/ui/elements/Input';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge } from '../admin/components/AdminTableComponents';
import ConfirmModal from '../../shared/ui/complex/ConfirmModal';
import { useConfirmDialog } from '../../shared/hooks/useConfirmDialog';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { Plus, MessageSquare, CheckCircle, Gavel, Clock, Inbox, HelpCircle, Wrench, CreditCard, Handshake, Search, ExternalLink, XCircle } from 'lucide-react';

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Всі', icon: Inbox }, 
    { value: 'general', label: 'Загальні', icon: HelpCircle },
    { value: 'technical', label: 'Технічні', icon: Wrench }, 
    { value: 'billing', label: 'Оплата', icon: CreditCard },
    { value: 'complaint', label: 'Скарга', icon: MessageSquare }, 
    { value: 'partnership', label: 'Співпраця', icon: Handshake }, 
    { value: 'appeal', label: 'Апеляція', icon: Gavel }
];

const COLORS = { 
    general: 'var(--platform-accent)', 
    technical: '#8b5cf6', 
    billing: 'var(--platform-success)', 
    complaint: 'var(--platform-danger)', 
    partnership: '#ec4899', 
    appeal: 'var(--platform-warning)' 
};

const MyTicketsPage = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const fetchTickets = async () => {
        try {
            const response = await apiClient.get('/support/my-tickets');
            setTickets(response.data);
        } catch (err) {
            setError('Не вдалося завантажити ваші звернення.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSort = (key) => {
        setSortConfig(c => ({ 
            key, 
            direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' 
        }));
    };

    const handleCloseTicket = async (id) => {
        try {
            await apiClient.put(`/support/${id}/status`, { status: 'closed' });
            toast.success('Звернення успішно закрито.');
            close();
            fetchTickets();
        } catch (err) {
            toast.error('Помилка при закритті звернення.');
            close();
        }
    };

    const confirmClose = (id) => {
        requestConfirm({
            title: 'Закрити звернення?',
            message: `Ви впевнені, що хочете закрити тікет #${id}? Ви більше не зможете писати в нього.`,
            type: 'warning',
            confirmLabel: 'Закрити',
            onConfirm: () => handleCloseTicket(id)
        });
    };

    const processedTickets = useMemo(() => {
        let res = [...tickets];
        if (statusFilter === 'active') {
            res = res.filter(t => t.status !== 'closed');
        } else if (statusFilter === 'closed') {
            res = res.filter(t => t.status === 'closed');
        }
        if (categoryFilter !== 'all') {
            res = res.filter(t => t.type === categoryFilter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(t => 
                String(t.id).includes(q) || 
                (t.subject && t.subject.toLowerCase().includes(q))
            );
        }
        return res.sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [tickets, statusFilter, categoryFilter, searchQuery, sortConfig]);

    if (error) return (
        <div className="m-4 sm:m-8 p-4 text-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-600">
            {error}
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full h-full flex flex-col">
            <Helmet>
                <title>Мої звернення | Kendr</title>
            </Helmet>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-(--platform-text-primary) m-0">
                        Мої звернення
                    </h1>
                    <p className="text-(--platform-text-secondary) text-sm sm:text-base md:text-lg m-0">
                        Історія вашої комунікації з підтримкою
                    </p>
                </div>
                <Button 
                    variant="primary" 
                    icon={<Plus size={18}/>} 
                    onClick={() => navigate('/support/new-ticket')}
                    className="w-full sm:w-auto min-h-11 sm:min-h-10"
                >
                    Нове звернення
                </Button>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="flex bg-(--platform-card-bg) p-1 rounded-xl border border-(--platform-border-color) w-full sm:w-auto shrink-0">
                        {['active', 'closed'].map(s => (
                            <Button 
                                key={s} 
                                variant="ghost" 
                                onClick={() => setStatusFilter(s)} 
                                className={`flex-1 sm:flex-none min-h-10 sm:min-h-8 px-4 text-sm rounded-lg transition-colors border-none ${
                                    statusFilter === s 
                                        ? 'bg-(--platform-bg) text-(--platform-text-primary) shadow-sm' 
                                        : 'bg-transparent text-(--platform-text-secondary) hover:text-(--platform-text-primary)'
                                }`}
                            >
                                {s === 'active' ? 'Активні' : 'Архів'}
                            </Button>
                        ))}
                    </div>
                    <div className="w-full sm:w-55 shrink-0">
                        <CustomSelect 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)} 
                            options={CATEGORY_OPTIONS} 
                            variant="minimal" 
                            className="h-11 sm:h-10 bg-(--platform-card-bg)" 
                        />
                    </div>
                </div>
                <div className="w-full lg:w-75 shrink-0">
                    <Input 
                        placeholder="Пошук за темою або ID..." 
                        leftIcon={<Search size={16}/>} 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        wrapperStyle={{ margin: 0 }} 
                        className="h-11 sm:h-10"
                    />
                </div>
            </div>
            <AdminTable>
                <colgroup>
                    <col style={{width: '80px'}} />
                    <col style={{width: '40%'}} />
                    <col style={{width: '150px'}} />
                    <col style={{width: '160px'}} />
                    <col style={{width: '160px'}} />
                    <col style={{width: '90px'}} />
                </colgroup>
                <thead>
                    <tr>
                        <AdminTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Тема" sortKey="subject" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Категорія" sortKey="type" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Статус" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Оновлено" sortKey="updated_at" currentSort={sortConfig} onSort={handleSort} align="right" />
                        <AdminTh label="Дії" align="right" />
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <LoadingRow cols={6} />
                    ) : !processedTickets.length ? (
                        <EmptyRow cols={6} />
                    ) : (
                        processedTickets.map(t => {
                            const catOpt = CATEGORY_OPTIONS.find(o => o.value === t.type) || CATEGORY_OPTIONS[1];
                            const sProps = t.status === 'open' 
                                ? { bg: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', c: 'var(--platform-warning)', i: Clock, l: 'Відкрито'} 
                                : t.status === 'answered'
                                    ? { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', c: 'var(--platform-success)', i: MessageSquare, l: 'Відповідь'}
                                    : { bg: 'var(--platform-hover-bg)', c: 'var(--platform-text-secondary)', i: CheckCircle, l: 'Закрито'};
                            const categoryColor = COLORS[t.type] || 'var(--platform-accent)';
                            return (
                                <AdminRow 
                                    key={t.id} 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/support/ticket/${t.id}`) }} 
                                    className={`cursor-pointer transition-colors ${t.status !== 'closed' ? 'bg-[color-mix(in_srgb,var(--platform-accent),transparent_98%)]' : 'bg-transparent'}`}
                                >
                                    <AdminCell className="opacity-60 text-xs sm:text-[13px]">#{t.id}</AdminCell>
                                    <AdminCell>
                                        <div className="font-semibold text-sm sm:text-[15px] text-(--platform-text-primary)">{t.subject}</div>
                                        {t.body && (
                                            <div className="text-xs sm:text-[13px] text-(--platform-text-secondary) opacity-70 max-w-37.5 sm:max-w-75 md:max-w-100 truncate">
                                                {t.body}
                                            </div>
                                        )}
                                    </AdminCell>
                                    <AdminCell>
                                        <GenericBadge color={categoryColor} bg={`color-mix(in srgb, ${categoryColor}, transparent 90%)`} icon={catOpt.icon}>
                                            {catOpt.label}
                                        </GenericBadge>
                                    </AdminCell>
                                    <AdminCell>
                                        <GenericBadge color={sProps.c} bg={sProps.bg} icon={sProps.i}>
                                            {sProps.l}
                                        </GenericBadge>
                                    </AdminCell>
                                    <AdminCell align="right" className="font-mono opacity-70 text-xs sm:text-[13px]">
                                        {new Date(t.updated_at).toLocaleString('uk-UA')}
                                    </AdminCell>
                                    <AdminCell align="right">
                                        <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                                            <Button 
                                                variant="ghost" 
                                                className="text-(--platform-accent) p-1.5 sm:p-2 min-h-9 sm:min-h-8" 
                                                icon={<ExternalLink size={18} />} 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/support/ticket/${t.id}`) }} 
                                            />
                                            {t.status !== 'closed' && (
                                                <Button 
                                                    variant="ghost" 
                                                    title="Закрити звернення" 
                                                    onClick={() => confirmClose(t.id)} 
                                                    className="text-(--platform-danger) hover:bg-red-50 p-1.5 sm:p-2 min-h-9 sm:min-h-8" 
                                                    icon={<XCircle size={18} />} 
                                                />
                                            )}
                                        </div>
                                    </AdminCell>
                                </AdminRow>
                            );
                        })
                    )}
                </tbody>
            </AdminTable>
            <ConfirmModal isOpen={isOpen} {...config} onCancel={close} />
        </div>
    );
};

export default MyTicketsPage;