// frontend/src/modules/dashboard/features/tabs/SubmissionsTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../../shared/api/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import { Input } from '../../../../shared/ui/elements/Input';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect'; 
import { Search, Trash, Check, Star, User, Mail, MessageCircle, Clock, MessageSquare } from 'lucide-react';

const statusConfig = {
    new: { label: 'Нова', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' },
    processing: { label: 'В обробці', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
    done: { label: 'Виконано', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' }
};

const filterOptions = [
    { value: 'all', label: 'Всі' },
    { value: 'new', label: 'Нові', icon: () => <span style={{color:'#3B82F6'}}>●</span> },
    { value: 'processing', label: 'В роботі', icon: () => <span style={{color:'#F59E0B'}}>●</span> },
    { value: 'done', label: 'Готові', icon: () => <span style={{color:'#10B981'}}>●</span> }
];

const DangerButton = ({ onClick, children }) => {
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: '6px 12px',
                border: '1px solid #EF4444',
                background: hover ? '#EF4444' : 'transparent',
                color: hover ? '#fff' : '#EF4444',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s ease'
            }}
        >
            {children}
        </button>
    );
};

const StatusButton = ({ statusKey, currentStatus, onClick }) => {
    const [hover, setHover] = useState(false);
    const config = statusConfig[statusKey];
    const isActive = currentStatus === statusKey;

    return (
        <button
            onClick={() => onClick(statusKey)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${isActive ? config.color : 'var(--platform-border-color)'}`,
                background: isActive ? config.color : (hover ? config.bg : 'transparent'),
                color: isActive ? '#fff' : (hover ? config.color : 'var(--platform-text-secondary)'),
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                transform: hover ? 'translateY(-1px)' : 'none'
            }}
        >
            {config.label}
        </button>
    );
};

const SubmissionsTab = ({ siteId, onSavingChange }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const { confirm } = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();

    const fetchSubmissions = async () => {
        try {
            const res = await apiClient.get(`/form/${siteId}`);
            const processed = res.data.map(sub => ({
                ...sub,
                status: sub.form_data?.status || (sub.is_read ? 'processing' : 'new')
            }));
            setSubmissions(processed);
        } catch (err) {
            toast.error('Помилка завантаження');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubmissions(); }, [siteId]);

    useEffect(() => {
        const idFromUrl = searchParams.get('submissionId');
        if (idFromUrl && submissions.length > 0 && (!selectedSubmission || selectedSubmission.id.toString() !== idFromUrl)) {
            const target = submissions.find(s => s.id.toString() === idFromUrl);
            if (target) setSelectedSubmission(target);
        }
    }, [submissions, searchParams]);

    const handleSelectSubmission = (submission) => {
        setSelectedSubmission(submission);
        setSearchParams(prev => { prev.set('submissionId', submission.id); return prev; });
    };

    const handleTogglePin = async (id, e) => {
        e.stopPropagation();
        if (onSavingChange) onSavingChange(true);
        try {
            const res = await apiClient.patch(`/form/${siteId}/${id}/pin`);
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_pinned: res.data.is_pinned } : s));
            if (selectedSubmission?.id === id) setSelectedSubmission(prev => ({ ...prev, is_pinned: res.data.is_pinned }));
        } catch (error) { toast.error('Помилка'); } 
        finally { setTimeout(() => onSavingChange && onSavingChange(false), 500); }
    };

    const handleStatusChange = async (id, newStatus) => {
        if (onSavingChange) onSavingChange(true);
        try {
            await apiClient.patch(`/form/${siteId}/${id}/status`, { status: newStatus });
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            if (selectedSubmission?.id === id) setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
            toast.success('Статус оновлено');
        } catch (error) { toast.error('Помилка'); } 
        finally { setTimeout(() => onSavingChange && onSavingChange(false), 500); }
    };

    const handleDelete = async (id) => {
        if (!await confirm({ title: "Видалити?", message: "Це незворотно.", type: "danger", confirmLabel: "Видалити" })) return;
        if (onSavingChange) onSavingChange(true);
        try {
            await apiClient.delete(`/form/${siteId}/${id}`);
            setSubmissions(prev => prev.filter(s => s.id !== id));
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(null);
                setSearchParams(prev => { prev.delete('submissionId'); return prev; });
            }
            toast.success('Видалено');
        } catch (error) { toast.error('Помилка'); } 
        finally { setTimeout(() => onSavingChange && onSavingChange(false), 500); }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => toast.success('Скопійовано')).catch(() => toast.error('Помилка'));
    };

    const filteredSubmissions = useMemo(() => {
        const filtered = submissions.filter(sub => {
            const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
            const sLower = searchTerm.toLowerCase();
            const d = sub.form_data || {};
            const matchesSearch = (d.name || '').toLowerCase().includes(sLower) || 
                                  (d.email || '').toLowerCase().includes(sLower) ||
                                  (d.subject || '').toLowerCase().includes(sLower);
            return matchesStatus && matchesSearch;
        });
        return filtered.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });
    }, [submissions, filterStatus, searchTerm]);

    const styles = {
        wrapper: {
            width: '100%', 
            padding: '0 24px', 
            boxSizing: 'border-box',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        },
        pageHeader: {
            marginBottom: '1.5rem',
            flexShrink: 0
        },
        pageTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '0 0 4px 0',
            color: 'var(--platform-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        pageDescription: {
            color: 'var(--platform-text-secondary)',
            margin: 0,
            fontSize: '0.9rem',
            paddingLeft: '38px'
        },
        container: {
            background: 'var(--platform-card-bg)',
            borderRadius: '12px',
            border: '1px solid var(--platform-border-color)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            height: 'calc(100vh - 120px)',
            display: 'flex',
            overflow: 'hidden'
        },
        sidebar: {
            width: '340px',
            minWidth: '300px',
            borderRight: '1px solid var(--platform-border-color)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--platform-card-bg)', 
        },
        sidebarHeader: {
            height: '70px',
            padding: '0 16px',
            borderBottom: '1px solid #2d3748', 
            background: '#1a202c',
            display: 'flex',
            alignItems: 'center', 
            gap: '12px',
            color: '#fff',
            flexShrink: 0
        },
        listContainer: {
            flex: 1,
            overflowY: 'auto',
            padding: '10px',
            background: 'var(--platform-card-bg)', 
        },
        mainContent: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'hidden', 
            background: '#1a202c',
        },
        contentHeader: {
            padding: '0 24px', 
            borderBottom: '1px solid #2d3748', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: '#1a202c',
            height: '70px',
            boxSizing: 'border-box', 
            flexShrink: 0,
            color: '#fff'
        },
        itemCard: (isSelected) => ({
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '8px',
            cursor: 'pointer',
            border: isSelected ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
            background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--platform-bg)', 
            transition: 'all 0.15s ease',
            position: 'relative',
            boxShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.03)'
        }),
        statusBadge: (status) => ({
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '4px',
            background: statusConfig[status]?.bg,
            color: statusConfig[status]?.color,
            border: `1px solid ${statusConfig[status]?.border}`,
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
        }),
        sectionTitle: {
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            color: 'var(--platform-text-secondary)',
            fontWeight: '700',
            marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '6px'
        }
    };

    if (loading) return <div style={{textAlign: 'center', padding: '40px', color: 'var(--platform-text-secondary)'}}>Завантаження...</div>;

    return (
        <div style={styles.wrapper}>
            <div style={styles.pageHeader}>
                <h2 style={styles.pageTitle}>
                    <MessageCircle size={28} />
                    Обробка звернень
                </h2>
                <p style={styles.pageDescription}>
                    Перегляд та управління повідомленнями з контактних форм
                </p>
            </div>

            <div style={styles.container}>
                <div style={styles.sidebar}>
                    <div style={styles.sidebarHeader}>
                        <Input 
                            placeholder="Пошук..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Search size={14} style={{color: '#a0aec0'}}/>}
                            style={{
                                margin: 0, 
                                height: '36px', 
                                fontSize: '0.9rem', 
                                background: '#2d3748', 
                                color: '#fff', 
                                border: '1px solid #4a5568',
                                '::placeholder': { color: '#a0aec0' }
                            }}
                            wrapperStyle={{margin: 0, flex: 1}}
                        />
                        
                        <div style={{width: '120px'}}>
                             <CustomSelect 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                options={filterOptions}
                                placeholder="Всі"
                                style={{ 
                                    height: '36px', 
                                    background: '#2d3748', 
                                    color: '#fff', 
                                    border: '1px solid #4a5568' 
                                }}
                            />
                        </div>
                    </div>

                    <div style={styles.listContainer} className="custom-scrollbar">
                        {filteredSubmissions.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '30px 10px', color: 'var(--platform-text-secondary)', fontSize: '0.9rem'}}>Порожньо</div>
                        ) : (
                            filteredSubmissions.map(sub => (
                                <div 
                                    key={sub.id} 
                                    style={styles.itemCard(selectedSubmission?.id === sub.id)}
                                    onClick={() => handleSelectSubmission(sub)}
                                    className="hover-card"
                                >
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px'}}>
                                        <div style={{fontWeight: '600', fontSize: '0.9rem', color: 'var(--platform-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px'}}>
                                            {sub.form_data.name || 'Без імені'}
                                        </div>
                                        
                                        <button 
                                            onClick={(e) => handleTogglePin(sub.id, e)}
                                            className="star-btn"
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '2px',
                                                display: 'flex',
                                                color: sub.is_pinned ? 'var(--platform-accent)' : 'var(--platform-text-tertiary)',
                                                transition: 'color 0.2s',
                                            }}
                                            title={sub.is_pinned ? "Відкріпити" : "Закріпити"}
                                        >
                                            <Star size={14} fill={sub.is_pinned ? "currentColor" : "none"} />
                                        </button>
                                    </div>

                                    <div style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                        {sub.form_data.subject || 'Без теми'}
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <span style={styles.statusBadge(sub.status)}>
                                            {statusConfig[sub.status]?.label}
                                        </span>
                                        <span style={{fontSize: '0.7rem', color: 'var(--platform-text-tertiary)'}}>
                                            {new Date(sub.created_at).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={styles.mainContent}>
                    {selectedSubmission ? (
                        <>
                            <div style={styles.contentHeader}>
                                <div>
                                    <h2 style={{margin: '0 0 4px 0', fontSize: '1.25rem', color: '#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth: '500px'}}>
                                        {selectedSubmission.form_data.subject || 'Без теми'}
                                    </h2>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: '#a0aec0', fontSize: '0.8rem'}}>
                                        <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                            <Clock size={12}/> {new Date(selectedSubmission.created_at).toLocaleString('uk-UA')}
                                        </span>
                                        <span>#{selectedSubmission.id}</span>
                                    </div>
                                </div>
                                
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <button 
                                        onClick={(e) => handleTogglePin(selectedSubmission.id, e)}
                                        title={selectedSubmission.is_pinned ? "Відкріпити" : "Закріпити"}
                                        style={{
                                            background: selectedSubmission.is_pinned ? '#2d3748' : 'transparent', 
                                            border: `1px solid ${selectedSubmission.is_pinned ? 'var(--platform-accent)' : '#4a5568'}`,
                                            borderRadius: '6px', cursor: 'pointer', padding: '6px 10px',
                                            color: selectedSubmission.is_pinned ? 'var(--platform-accent)' : '#a0aec0',
                                            display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                                        }}
                                    >
                                        <Star size={16} fill={selectedSubmission.is_pinned ? "currentColor" : "none"} />
                                    </button>
                                    <DangerButton onClick={() => handleDelete(selectedSubmission.id)}>
                                        <Trash size={16} /> Видалити
                                    </DangerButton>
                                </div>
                            </div>

                            <div className="custom-scrollbar" style={{padding: '24px', overflowY: 'auto', flex: 1}}>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px'}}>
                                    <div style={{background: 'var(--platform-card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--platform-border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                                        <div style={styles.sectionTitle}><User size={14}/> Від кого</div>
                                        <div style={{fontWeight: '600', fontSize: '1rem', marginBottom: '4px', color: 'var(--platform-text-primary)'}}>{selectedSubmission.form_data.name}</div>
                                        <div 
                                            onClick={() => copyToClipboard(selectedSubmission.form_data.email)}
                                            style={{color: 'var(--platform-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem'}}
                                            title="Копіювати"
                                        >
                                            <Mail size={14}/> {selectedSubmission.form_data.email}
                                        </div>
                                    </div>

                                    <div style={{background: 'var(--platform-card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--platform-border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                                        <div style={styles.sectionTitle}><Check size={14}/> Статус</div>
                                        <div style={{display: 'flex', gap: '6px'}}>
                                            {Object.keys(statusConfig).map(key => (
                                                <StatusButton 
                                                    key={key} 
                                                    statusKey={key} 
                                                    currentStatus={selectedSubmission.status} 
                                                    onClick={(k) => handleStatusChange(selectedSubmission.id, k)} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{background: 'var(--platform-card-bg)', padding: '24px', borderRadius: '8px', border: '1px solid var(--platform-border-color)', minHeight: '200px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                                    <div style={styles.sectionTitle}><MessageSquare size={14}/> Повідомлення</div>
                                    <div style={{
                                        whiteSpace: 'pre-wrap', 
                                        lineHeight: '1.6', 
                                        color: 'var(--platform-text-primary)',
                                        fontSize: '1rem'
                                    }}>
                                        {selectedSubmission.form_data.message || <span style={{color: 'var(--platform-text-secondary)', fontStyle: 'italic'}}>Текст повідомлення відсутній</span>}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a0aec0'}}>
                            <div style={{fontSize: '4rem', marginBottom: '16px', opacity: 0.1}}>📩</div>
                            <div style={{fontSize: '1.1rem'}}>Оберіть заявку зі списку</div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .hover-card:hover {
                    border-color: var(--platform-accent) !important;
                    background: var(--platform-hover-bg) !important;
                    filter: brightness(0.97);
                }
                .hover-card:hover .star-btn {
                    color: var(--platform-accent);
                    opacity: 0.7;
                }
                .hover-card:hover .star-btn[title="Відкріпити"] {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default SubmissionsTab;