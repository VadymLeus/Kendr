// frontend/src/modules/site-dashboard/features/tabs/SubmissionsTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../../common/services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../../common/hooks/useConfirm';
import styles from './SubmissionsTab.module.css';

const SubmissionsTab = ({ siteId, onSavingChange }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const { confirm } = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => { 
        fetchSubmissions(); 
    }, [siteId]);

    const fetchSubmissions = async () => {
        try {
            const res = await apiClient.get(`/form/${siteId}`);
            const processed = res.data.map(sub => {
                const status = sub.form_data?.status || (sub.is_read ? 'processing' : 'new');
                return { ...sub, status };
            });
            setSubmissions(processed);
        } catch (err) {
            console.error(err);
            toast.error('Помилка завантаження заявок');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const idFromUrl = searchParams.get('submissionId');
        if (idFromUrl && submissions.length > 0 && !selectedSubmission) {
            const target = submissions.find(s => s.id.toString() === idFromUrl);
            if (target) setSelectedSubmission(target);
        }
    }, [submissions, searchParams]);

    const handleSelectSubmission = (submission) => {
        setSelectedSubmission(submission);
        setSearchParams(prev => {
            prev.set('submissionId', submission.id);
            return prev;
        });
    };

    const handleTogglePin = async (id, e) => {
        e.stopPropagation();
        if (onSavingChange) onSavingChange(true);
        
        try {
            const res = await apiClient.patch(`/form/${siteId}/${id}/pin`);
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_pinned: res.data.is_pinned } : s));
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => ({ ...prev, is_pinned: res.data.is_pinned }));
            }
        } catch (error) { 
            toast.error('Не вдалося змінити статус закріплення'); 
        } finally {
            setTimeout(() => { if (onSavingChange) onSavingChange(false); }, 500);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => toast.success('Email скопійовано')).catch(() => toast.error('Помилка'));
    };

    const handleStatusChange = async (id, newStatus) => {
        if (onSavingChange) onSavingChange(true);

        try {
            await apiClient.patch(`/form/${siteId}/${id}/status`, { status: newStatus });
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
            }
            toast.success('Статус оновлено');
        } catch (error) { 
            toast.error('Помилка оновлення статусу'); 
        } finally {
            setTimeout(() => { if (onSavingChange) onSavingChange(false); }, 500);
        }
    };

    const handleDelete = async (id) => {
        if (await confirm({ 
            title: "Видалити заявку?", 
            message: "Неможливо скасувати. Ви впевнені?", 
            type: "danger", 
            confirmLabel: "Видалити" 
        })) {
            if (onSavingChange) onSavingChange(true);
            
            try {
                await apiClient.delete(`/form/${siteId}/${id}`);
                setSubmissions(prev => prev.filter(s => s.id !== id));
                if (selectedSubmission?.id === id) {
                    setSelectedSubmission(null);
                    setSearchParams(prev => { 
                        prev.delete('submissionId'); 
                        return prev; 
                    });
                }
                toast.success('Заявку видалено');
            } catch (error) { 
                toast.error('Помилка видалення'); 
            } finally {
                setTimeout(() => { if (onSavingChange) onSavingChange(false); }, 500);
            }
        }
    };

    const filteredSubmissions = useMemo(() => {
        const filtered = submissions.filter(sub => {
            const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
            const searchLower = searchTerm.toLowerCase();
            const formData = sub.form_data || {};
            const matchesSearch = (formData.name || '').toLowerCase().includes(searchLower) || 
                                  (formData.email || '').toLowerCase().includes(searchLower) ||
                                  (formData.subject || '').toLowerCase().includes(searchLower) ||
                                  (formData.message || '').toLowerCase().includes(searchLower);
            return matchesStatus && matchesSearch;
        });
        return filtered.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });
    }, [submissions, filterStatus, searchTerm]);

    const statusConfig = {
        new: { 
            label: 'Нова', 
            color: '#4299e1', 
            bg: 'rgba(66, 153, 225, 0.2)',
            icon: '🆕', 
            textColor: '#63b3ed',
            borderColor: '#4299e1'
        },
        processing: { 
            label: 'В обробці', 
            color: '#ed8936', 
            bg: 'rgba(237, 137, 54, 0.2)', 
            icon: '🔄', 
            textColor: '#fbd38d',
            borderColor: '#ed8936'
        },
        done: { 
            label: 'Виконано', 
            color: '#48bb78', 
            bg: 'rgba(72, 187, 120, 0.2)', 
            icon: '✅', 
            textColor: '#68d391',
            borderColor: '#48bb78'
        }
    };

    const getStatusClassName = (status) => {
        switch(status) {
            case 'new': return styles.statusNew;
            case 'processing': return styles.statusProcessing;
            case 'done': return styles.statusDone;
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingContent}>
                    <div style={{fontSize: '2rem', marginBottom: '16px'}}>⏳</div>
                    <div style={{fontSize: '1rem'}}>Завантаження заявок...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>📋 Заявки з форм</h2>
                    <p className={styles.subtitle}>Керуйте заявками з форм зворотного зв'язку вашого сайту</p>
                </div>
            </div>

            <div className={styles.content}>
                <div className={`${styles.card} ${styles.listContainer}`}>
                    <div style={{marginBottom: '20px'}}>
                        <h3 className={styles.listTitle}>
                            📝 Список заявок
                            <span className={styles.countBadge}>
                                {filteredSubmissions.length}
                            </span>
                        </h3>
                        <p className={styles.subtitle} style={{fontSize: '0.85rem'}}>
                            Знайдено {filteredSubmissions.length} заявок
                        </p>
                    </div>

                    <div style={{marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        <input 
                            type="text" 
                            placeholder="🔍 Пошук за ім'ям, email або темі..."
                            className={styles.input}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select 
                            className={styles.select}
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Всі статуси</option>
                            <option value="new">🔵 Нові</option>
                            <option value="processing">🟠 В обробці</option>
                            <option value="done">🟢 Виконані</option>
                        </select>
                    </div>

                    <div className={`custom-scrollbar ${styles.scrollable}`}>
                        {filteredSubmissions.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '40px 20px', color: 'var(--platform-text-secondary)'}}>
                                <div style={{fontSize: '3rem', marginBottom: '12px', opacity: 0.5}}>📭</div>
                                <p style={{margin: 0, fontSize: '0.9rem', fontWeight: '500'}}>
                                    {searchTerm || filterStatus !== 'all' 
                                        ? 'Нічого не знайдено' 
                                        : 'Список заявок порожній'
                                    }
                                </p>
                            </div>
                        ) : (
                            filteredSubmissions.map((submission) => (
                                <div 
                                    key={submission.id}
                                    className={`${styles.submissionItem} ${
                                        selectedSubmission?.id === submission.id ? styles.selected : ''
                                    }`}
                                    onClick={() => handleSelectSubmission(submission)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.2',
                                            color: 'var(--platform-text-primary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '180px'
                                        }}>
                                            {submission.form_data.name}
                                        </div>
                                        
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <button
                                                onClick={(e) => handleTogglePin(submission.id, e)}
                                                className={`${styles.pinButton} ${
                                                    submission.is_pinned ? styles.pinned : ''
                                                }`}
                                                title={submission.is_pinned ? "Відкріпити" : "Закріпити зверху"}
                                            >
                                                📌
                                            </button>
                                            <div style={{
                                                fontSize: '0.75rem', 
                                                color: 'var(--platform-text-secondary)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {new Date(submission.created_at).toLocaleDateString('uk-UA', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--platform-text-secondary)',
                                        marginBottom: '12px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontStyle: submission.form_data.subject ? 'normal' : 'italic'
                                    }}>
                                        {submission.form_data.subject || 'Без теми'}
                                    </div>

                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <span 
                                            className={`${styles.statusBadge} ${getStatusClassName(submission.status)}`}
                                            style={{
                                                backgroundColor: statusConfig[submission.status]?.bg,
                                                color: statusConfig[submission.status]?.textColor,
                                                border: `1px solid ${statusConfig[submission.status]?.borderColor}`,
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            {statusConfig[submission.status]?.icon}
                                            {statusConfig[submission.status]?.label}
                                        </span>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: 'var(--platform-text-tertiary)'
                                        }}>
                                            {new Date(submission.created_at).toLocaleTimeString('uk-UA', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={`${styles.card} ${styles.detailsContainer}`}>
                    {selectedSubmission ? (
                        <>
                            <div className={`custom-scrollbar ${styles.scrollable}`}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '24px',
                                    paddingBottom: '20px',
                                    borderBottom: '1px solid var(--platform-border-color)'
                                }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--platform-text-primary)', margin: 0 }}>
                                            Заявка від {selectedSubmission.form_data.name}
                                        </h2>
                                        <div style={{ color: 'var(--platform-text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                                            {new Date(selectedSubmission.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(selectedSubmission.id)}
                                        className={styles.dangerButton}
                                        title="Видалити заявку"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                    
                                    <div className={styles.contactCard}>
                                        <h3 style={{fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <span className={styles.infoIcon}>👤</span>
                                            Контактна інформація
                                        </h3>
                                        
                                        <div style={{marginBottom: '12px'}}>
                                            <div style={{fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', color: 'var(--platform-text-secondary)'}}>
                                                Ім'я
                                            </div>
                                            <div style={{
                                                fontSize: '1rem', 
                                                fontWeight: '500', 
                                                color: 'var(--platform-text-primary)',
                                                padding: '6px 10px',
                                                background: 'var(--platform-bg)',
                                                borderRadius: '4px',
                                                border: '1px solid var(--platform-border-color)'
                                            }}>
                                                {selectedSubmission.form_data.name}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div style={{fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', color: 'var(--platform-text-secondary)'}}>
                                                Email
                                            </div>
                                            <div 
                                                className={styles.emailLink}
                                                onClick={() => copyToClipboard(selectedSubmission.form_data.email)}
                                                title="Клікніть щоб скопіювати email"
                                            >
                                                {selectedSubmission.form_data.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.detailsCard}>
                                        <h3 style={{fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <span className={styles.iconWrapper}>📋</span>
                                            Деталі та Статус
                                        </h3>
                                        
                                        <div style={{marginBottom: '16px'}}>
                                            <div style={{fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', color: 'var(--platform-text-secondary)'}}>
                                                ID Заявки
                                            </div>
                                            <div style={{
                                                fontFamily: 'monospace', 
                                                color: 'var(--platform-text-primary)',
                                                padding: '6px 10px',
                                                background: 'var(--platform-bg)',
                                                borderRadius: '4px',
                                                border: '1px solid var(--platform-border-color)'
                                            }}>
                                                #{selectedSubmission.id}
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{fontSize: '0.8rem', marginBottom: '8px', fontWeight: '500', color: 'var(--platform-text-secondary)'}}>
                                                Змінити статус:
                                            </div>
                                            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                                {Object.keys(statusConfig).map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(selectedSubmission.id, status)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px',
                                                            borderRadius: '6px',
                                                            border: `1px solid ${statusConfig[status].color}`,
                                                            background: selectedSubmission.status === status ? statusConfig[status].color : 'transparent',
                                                            color: selectedSubmission.status === status ? '#fff' : statusConfig[status].textColor,
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            fontSize: '0.85rem',
                                                            transition: 'all 0.2s',
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        {statusConfig[status]?.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <span className={styles.iconWrapper} style={{background: '#48bb78'}}>💬</span>
                                        Повідомлення
                                    </h3>
                                    
                                    <div className={styles.messageCard}>
                                        {selectedSubmission.form_data.subject && (
                                            <div style={{
                                                marginBottom: '20px', 
                                                paddingBottom: '16px', 
                                                borderBottom: '1px solid var(--platform-border-color)'
                                            }}>
                                                <div style={{fontSize: '0.8rem', marginBottom: '6px', fontWeight: '500', color: 'var(--platform-text-secondary)'}}>
                                                    Тема повідомлення
                                                </div>
                                                <div style={{
                                                    fontSize: '1.2rem', 
                                                    fontWeight: '600', 
                                                    color: 'var(--platform-text-primary)',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {selectedSubmission.form_data.subject}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div style={{
                                            fontSize: '1rem',
                                            lineHeight: '1.6',
                                            color: 'var(--platform-text-primary)',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {selectedSubmission.form_data.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <div style={{
                                fontSize: '4rem', 
                                marginBottom: '20px', 
                                opacity: 0.5
                            }}>
                                📋
                            </div>
                            <h3 style={{marginBottom: '12px', fontSize: '1.5rem', color: 'var(--platform-text-primary)'}}>
                                Оберіть заявку для перегляду
                            </h3>
                            <p style={{fontSize: '1rem', maxWidth: '500px', lineHeight: '1.5', color: 'var(--platform-text-secondary)'}}>
                                Виберіть заявку зі списку ліворуч, щоб переглянути детальну інформацію та керувати нею
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmissionsTab;