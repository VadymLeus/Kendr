// frontend/src/features/sites/tabs/SubmissionsTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../hooks/useConfirm';

const SubmissionsTab = ({ siteId }) => {
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
            if (target) {
                setSelectedSubmission(target);
            }
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
        try {
            const res = await apiClient.patch(`/form/${siteId}/${id}/pin`);
            
            setSubmissions(prev => prev.map(s => 
                s.id === id ? { ...s, is_pinned: res.data.is_pinned } : s
            ));
            
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => ({ ...prev, is_pinned: res.data.is_pinned }));
            }
            
        } catch (error) {
            toast.error('Не вдалося змінити статус закріплення');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Email скопійовано в буфер обміну');
        }).catch(() => {
            toast.error('Не вдалося скопіювати email');
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await apiClient.patch(`/form/${siteId}/${id}/status`, { status: newStatus });
            setSubmissions(prev => prev.map(s => 
                s.id === id ? { ...s, status: newStatus } : s
            ));
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
            }
            toast.success('Статус оновлено');
        } catch (error) {
            toast.error('Помилка оновлення статусу');
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: "Видалити заявку?",
            message: "Цю дію неможливо скасувати. Ви впевнені?",
            type: "danger",
            confirmLabel: "Видалити"
        });

        if (isConfirmed) {
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
        new: { label: 'Нова', color: '#4299e1', bg: '#ebf8ff', icon: '🆕' },
        processing: { label: 'В обробці', color: '#ed8936', bg: '#feebc8', icon: '🔄' },
        done: { label: 'Виконано', color: '#48bb78', bg: '#c6f6d5', icon: '✅' }
    };

    const containerStyle = { 
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: '0 16px'
    };

    const headerStyle = { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '16px'
    };
    
    const titleStyle = { 
        fontSize: '1.5rem', 
        fontWeight: '600', 
        color: 'var(--platform-text-primary)', 
        margin: '0 0 4px 0'
    };
    
    const subtitleStyle = { 
        fontSize: '0.9rem', 
        color: 'var(--platform-text-secondary)', 
        margin: 0
    };
    
    const contentStyle = {
        display: 'flex',
        gap: '20px',
        height: 'calc(100vh - 280px)'
    };
    
    const cardStyle = { 
        background: 'var(--platform-card-bg)', 
        borderRadius: '12px', 
        border: '1px solid var(--platform-border-color)', 
        padding: '20px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
    };
    
    const controlsStyle = {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    };
    
    const inputStyle = {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '0.85rem',
        minWidth: '180px',
        width: '100%',
        boxSizing: 'border-box'
    };
    
    const selectStyle = {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '0.85rem',
        cursor: 'pointer'
    };

    const submissionItemStyle = (isSelected) => ({
        background: isSelected ? 'rgba(var(--platform-accent-rgb), 0.1)' : 'var(--platform-bg)',
        border: `1px solid ${isSelected ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        borderLeft: isSelected ? '4px solid var(--platform-accent)' : `1px solid var(--platform-border-color)`
    });

    const pinButtonStyle = (isPinned) => ({
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        padding: '4px',
        lineHeight: 1,
        transition: 'transform 0.2s',
        opacity: isPinned ? 1 : 0.2,
        filter: isPinned ? 'none' : 'grayscale(100%)',
        transform: isPinned ? 'rotate(-45deg)' : 'rotate(0deg)'
    });

    const deleteButtonStyle = {
        background: 'rgba(229, 62, 62, 0.1)', 
        border: '1px solid rgba(229, 62, 62, 0.2)', 
        cursor: 'pointer', 
        color: '#e53e3e', 
        width: '32px', 
        height: '32px', 
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '1.2rem',
        fontWeight: 'bold',
        transition: 'all 0.2s'
    };

    const StatusButton = ({ status, onClick, isActive }) => (
        <button
            onClick={onClick}
            style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: `1px solid ${isActive ? statusConfig[status].color : 'transparent'}`,
                background: isActive ? statusConfig[status].color : statusConfig[status].bg,
                color: isActive ? 'white' : statusConfig[status].color,
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: isActive ? 1 : 0.7
            }}
        >
            {statusConfig[status].icon}
            {statusConfig[status].label}
        </button>
    );

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--platform-text-secondary)'}}>
                    <div style={{fontSize: '2rem', marginBottom: '16px'}}>⏳</div>
                    <div>Завантаження заявок...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>Заявки з форм</h2>
                    <p style={subtitleStyle}>Керування заявками з форм зворотного зв'язку вашого сайту</p>
                </div>
            </div>

            <div style={contentStyle}>
                <div style={{...cardStyle, flex: '0 0 320px', display: 'flex', flexDirection: 'column', padding: '16px'}}>
                    <div style={{marginBottom: '16px'}}>
                        <h3 style={{...titleStyle, fontSize: '1.1rem'}}>Список заявок</h3>
                        <p style={{...subtitleStyle, fontSize: '0.8rem'}}>
                            <span style={{fontWeight: '600', color: 'var(--platform-accent)'}}>
                                {filteredSubmissions.length}
                            </span> знайдено
                        </p>
                    </div>

                    <div style={{marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <input 
                            type="text" 
                            placeholder="🔍 Пошук..."
                            style={inputStyle}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select 
                            style={selectStyle}
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Всі статуси</option>
                            <option value="new">🔵 Нові</option>
                            <option value="processing">🟠 В обробці</option>
                            <option value="done">🟢 Виконані</option>
                        </select>
                    </div>

                    <div className="custom-scrollbar" style={{flex: 1, overflowY: 'auto', paddingRight: '4px'}}>
                        {filteredSubmissions.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '30px 20px', color: 'var(--platform-text-secondary)'}}>
                                <div style={{fontSize: '2rem', marginBottom: '8px', opacity: 0.5}}>📭</div>
                                <p style={{margin: 0, fontSize: '0.8rem'}}>
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
                                    style={submissionItemStyle(selectedSubmission?.id === submission.id)}
                                    onClick={() => handleSelectSubmission(submission)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '4px'
                                    }}>
                                        <div style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.2',
                                            color: 'var(--platform-text-primary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '150px'
                                        }}>
                                            {submission.form_data.name}
                                        </div>
                                        
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <button
                                                onClick={(e) => handleTogglePin(submission.id, e)}
                                                style={pinButtonStyle(submission.is_pinned)}
                                                title={submission.is_pinned ? "Відкріпити" : "Закріпити зверху"}
                                                onMouseEnter={(e) => {
                                                    if(!submission.is_pinned) e.target.style.opacity = 1;
                                                }}
                                                onMouseLeave={(e) => {
                                                    if(!submission.is_pinned) e.target.style.opacity = 0.2;
                                                }}
                                            >
                                                📌
                                            </button>
                                            <div style={{fontSize: '0.7rem', opacity: 0.6}}>
                                                {new Date(submission.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--platform-text-secondary)',
                                        marginBottom: '8px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {submission.form_data.subject || 'Без теми'}
                                    </div>

                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: statusConfig[submission.status]?.bg,
                                            color: statusConfig[submission.status]?.color,
                                            fontWeight: '600'
                                        }}>
                                            {statusConfig[submission.status]?.label}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                    {selectedSubmission ? (
                        <div className="custom-scrollbar" style={{flex: 1, overflowY: 'auto', paddingRight: '4px'}}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '24px',
                                paddingBottom: '20px',
                                borderBottom: '1px solid var(--platform-border-color)',
                                flexWrap: 'wrap',
                                gap: '16px'
                            }}>
                                <div style={{flex: 1}}>
                                    <h2 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '600',
                                        color: 'var(--platform-text-primary)',
                                        margin: '0 0 12px 0'
                                    }}>
                                        Заявка від {selectedSubmission.form_data.name}
                                        {selectedSubmission.is_pinned && (
                                            <span style={{
                                                marginLeft: '8px',
                                                fontSize: '0.8rem',
                                                background: '#ecc94b',
                                                color: '#744210',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontWeight: '500'
                                            }}>
                                                📌 Закріплено
                                            </span>
                                        )}
                                    </h2>
                                    
                                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                        {Object.keys(statusConfig).map(status => (
                                            <StatusButton
                                                key={status}
                                                status={status}
                                                isActive={selectedSubmission.status === status}
                                                onClick={() => handleStatusChange(selectedSubmission.id, status)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--platform-text-secondary)',
                                        textAlign: 'right'
                                    }}>
                                        <div>Надіслано:</div>
                                        <div style={{fontWeight: '500', color: 'var(--platform-text-primary)'}}>
                                            {new Date(selectedSubmission.created_at).toLocaleString('uk-UA')}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleDelete(selectedSubmission.id)}
                                        style={deleteButtonStyle}
                                        title="Видалити заявку"
                                        onMouseEnter={(e) => {
                                            e.target.style.background = '#e53e3e';
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(229, 62, 62, 0.1)';
                                            e.target.style.color = '#e53e3e';
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '24px',
                                marginBottom: '32px'
                            }}>
                                <div style={{
                                    background: 'var(--platform-bg)',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    border: '1px solid var(--platform-border-color)'
                                }}>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: 'var(--platform-text-primary)',
                                        margin: '0 0 16px 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        👤 Контактна інформація
                                    </h3>
                                    
                                    <div style={{marginBottom: '12px'}}>
                                        <div style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)'}}>Ім'я</div>
                                        <div style={{fontSize: '1rem', fontWeight: '500', color: 'var(--platform-text-primary)'}}>
                                            {selectedSubmission.form_data.name}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)'}}>Email</div>
                                        <div 
                                            style={{
                                                fontSize: '1rem', 
                                                fontWeight: '500', 
                                                color: 'var(--platform-accent)',
                                                cursor: 'pointer',
                                                textDecoration: 'none',
                                                display: 'inline-block',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onClick={() => copyToClipboard(selectedSubmission.form_data.email)}
                                            onMouseEnter={e => e.target.style.backgroundColor = 'rgba(var(--platform-accent-rgb), 0.1)'}
                                            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                                            title="Клікніть щоб скопіювати email"
                                        >
                                            {selectedSubmission.form_data.email}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'var(--platform-bg)',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    border: '1px solid var(--platform-border-color)'
                                }}>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: 'var(--platform-text-primary)',
                                        margin: '0 0 16px 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        📋 Деталі
                                    </h3>
                                    
                                    <div style={{marginBottom: '12px'}}>
                                        <div style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)'}}>Поточний статус</div>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '4px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: statusConfig[selectedSubmission.status]?.color
                                        }}>
                                            {statusConfig[selectedSubmission.status]?.icon}
                                            {statusConfig[selectedSubmission.status]?.label}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)'}}>ID Заявки</div>
                                        <div style={{fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--platform-text-primary)'}}>
                                            #{selectedSubmission.id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: 'var(--platform-text-primary)',
                                    margin: '0 0 16px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    💬 Повідомлення
                                </h3>
                                
                                <div style={{
                                    background: 'var(--platform-bg)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--platform-border-color)',
                                    padding: '24px'
                                }}>
                                    {selectedSubmission.form_data.subject && (
                                        <div style={{
                                            marginBottom: '16px', 
                                            paddingBottom: '16px', 
                                            borderBottom: '1px dashed var(--platform-border-color)'
                                        }}>
                                            <div style={{fontSize: '0.8rem', color: 'var(--platform-text-secondary)', marginBottom: '4px'}}>Тема</div>
                                            <div style={{fontSize: '1.1rem', fontWeight: '600', color: 'var(--platform-text-primary)'}}>
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
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            color: 'var(--platform-text-secondary)'
                        }}>
                            <div style={{fontSize: '4rem', marginBottom: '16px', opacity: 0.5}}>📋</div>
                            <h3 style={{
                                color: 'var(--platform-text-primary)', 
                                margin: '0 0 8px 0',
                                fontSize: '1.5rem'
                            }}>
                                Оберіть заявку
                            </h3>
                            <p style={{
                                margin: 0, 
                                fontSize: '1rem',
                                maxWidth: '400px'
                            }}>
                                Виберіть заявку зі списку ліворуч для перегляду детальної інформації
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmissionsTab;