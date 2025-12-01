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
        new: { label: 'Нова', color: '#4299e1', bg: '#ebf8ff', icon: '🆕', textColor: '#2c5282' },
        processing: { label: 'В обробці', color: '#ed8936', bg: '#feebc8', icon: '🔄', textColor: '#9c4221' },
        done: { label: 'Виконано', color: '#48bb78', bg: '#c6f6d5', icon: '✅', textColor: '#276749' }
    };

    const primaryButton = {
        background: 'var(--platform-accent)', 
        color: 'var(--platform-accent-text)',
        padding: '8px 16px', 
        borderRadius: '8px', 
        border: 'none',
        fontWeight: '600', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const primaryButtonHover = {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const dangerButton = {
        background: 'rgba(229, 62, 62, 0.1)', 
        border: '1px solid rgba(229, 62, 62, 0.2)', 
        cursor: 'pointer', 
        color: '#e53e3e', 
        width: '36px', 
        height: '36px', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const dangerButtonHover = {
        background: '#e53e3e',
        color: 'white',
        transform: 'scale(1.05)',
        boxShadow: '0 2px 5px rgba(229, 62, 62, 0.3)'
    };

    const secondaryButton = {
        background: 'transparent', 
        border: '1px solid var(--platform-border-color)', 
        color: 'var(--platform-text-primary)', 
        cursor: 'pointer',
        padding: '8px 16px',
        borderRadius: '8px',
        transition: 'all 0.2s ease'
    };

    const secondaryButtonHover = {
        background: 'var(--platform-hover-bg)',
        borderColor: 'var(--platform-accent)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    };

    const handleMouseOver = (element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    };

    const handleMouseOut = (element, originalStyle) => {
        Object.assign(element.style, originalStyle);
    };

    const containerStyle = { 
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: '24px 16px'
    };

    const headerStyle = { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '20px'
    };
    
    const titleStyle = { 
        fontSize: '1.75rem', 
        fontWeight: '700', 
        color: 'var(--platform-text-primary)', 
        margin: '0 0 8px 0'
    };
    
    const subtitleStyle = { 
        fontSize: '1rem', 
        color: 'var(--platform-text-secondary)', 
        margin: 0
    };
    
    const contentStyle = {
        display: 'flex',
        gap: '24px',
        height: 'calc(100vh - 280px)'
    };
    
    const cardStyle = { 
        background: 'var(--platform-card-bg)', 
        borderRadius: '16px', 
        border: '1px solid var(--platform-border-color)', 
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    };
    
    const controlsStyle = {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    };
    
    const inputStyle = {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '0.9rem',
        minWidth: '200px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
    };

    const inputHoverStyle = {
        borderColor: 'var(--platform-accent)',
        boxShadow: '0 0 0 1px var(--platform-accent)'
    };
    
    const selectStyle = {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const submissionItemBaseStyle = {
        borderRadius: '12px',
        padding: '16px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '12px'
    };

    const submissionItemStyle = (isSelected) => ({
        ...submissionItemBaseStyle,
        background: isSelected ? 'rgba(var(--platform-accent-rgb), 0.1)' : 'var(--platform-bg)',
        border: `2px solid ${isSelected ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
        borderLeft: isSelected ? '6px solid var(--platform-accent)' : `2px solid var(--platform-border-color)`,
        transform: isSelected ? 'translateX(4px)' : 'none'
    });

    const submissionItemHoverStyle = {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        borderColor: 'var(--platform-accent)'
    };

    const pinButtonStyle = (isPinned, isHovering = false) => ({
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        padding: '6px',
        lineHeight: 1,
        transition: 'all 0.2s ease',
        opacity: isPinned ? 1 : (isHovering ? 0.6 : 0.2),
        filter: isPinned ? 'none' : 'grayscale(100%)',
        transform: isPinned ? 'rotate(-45deg)' : 'rotate(0deg)'
    });

    const StatusButton = ({ status, onClick, isActive }) => {
        const config = statusConfig[status];
        const actualStyle = isActive ? {
            background: config.color,
            color: 'white',
            borderColor: config.color,
            transform: 'scale(1.05)'
        } : {
            background: config.bg,
            color: config.textColor,
            borderColor: 'transparent'
        };

        return (
            <button
                onClick={onClick}
                style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: `2px solid ${actualStyle.borderColor}`,
                    background: actualStyle.background,
                    color: actualStyle.color,
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = isActive ? 'scale(1.05)' : 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
            >
                {config.icon}
                {config.label}
            </button>
        );
    };

    if (loading) {
        return (
            <div style={{...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh'}}>
                <div style={{textAlign: 'center', color: 'var(--platform-text-secondary)'}}>
                    <div style={{fontSize: '2rem', marginBottom: '16px'}}>⏳</div>
                    <div style={{fontSize: '1rem'}}>Завантаження заявок...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>📋 Заявки з форм</h2>
                    <p style={subtitleStyle}>Керуйте заявками з форм зворотного зв'язку вашого сайту</p>
                </div>
            </div>

            <div style={contentStyle}>
                <div style={{...cardStyle, flex: '0 0 360px', display: 'flex', flexDirection: 'column', padding: '20px', height: '100%'}}>
                    <div style={{marginBottom: '20px'}}>
                        <h3 style={{...titleStyle, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            📝 Список заявок
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                color: 'var(--platform-accent)',
                                background: 'rgba(var(--platform-accent-rgb), 0.1)',
                                padding: '2px 8px',
                                borderRadius: '12px'
                            }}>
                                {filteredSubmissions.length}
                            </span>
                        </h3>
                        <p style={{...subtitleStyle, fontSize: '0.85rem'}}>
                            Знайдено {filteredSubmissions.length} заявок
                        </p>
                    </div>

                    <div style={{marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        <input 
                            type="text" 
                            placeholder="🔍 Пошук за ім'ям, email або темі..."
                            style={inputStyle}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                        />
                        <select 
                            style={selectStyle}
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, selectStyle)}
                        >
                            <option value="all">Всі статуси</option>
                            <option value="new">🔵 Нові</option>
                            <option value="processing">🟠 В обробці</option>
                            <option value="done">🟢 Виконані</option>
                        </select>
                    </div>

                    <div className="custom-scrollbar" style={{flex: 1, overflowY: 'auto', paddingRight: '8px'}}>
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
                                    style={submissionItemStyle(selectedSubmission?.id === submission.id)}
                                    onClick={() => handleSelectSubmission(submission)}
                                    onMouseEnter={(e) => {
                                        if (!selectedSubmission || selectedSubmission?.id !== submission.id) {
                                            handleMouseOver(e.currentTarget, {...submissionItemStyle(false), ...submissionItemHoverStyle});
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!selectedSubmission || selectedSubmission?.id !== submission.id) {
                                            handleMouseOut(e.currentTarget, submissionItemStyle(false));
                                        }
                                    }}
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
                                                style={pinButtonStyle(submission.is_pinned)}
                                                title={submission.is_pinned ? "Відкріпити" : "Закріпити зверху"}
                                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                onMouseLeave={(e) => e.currentTarget.style.opacity = submission.is_pinned ? 1 : 0.2}
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
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            background: statusConfig[submission.status]?.bg,
                                            color: statusConfig[submission.status]?.textColor,
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            border: `1px solid ${statusConfig[submission.status]?.color}`
                                        }}>
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

                <div style={{...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px'}}>
                    {selectedSubmission ? (
                        <>
                            <div className="custom-scrollbar" style={{flex: 1, overflowY: 'auto', paddingRight: '8px'}}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '32px',
                                    paddingBottom: '24px',
                                    borderBottom: '2px solid var(--platform-border-color)',
                                    flexWrap: 'wrap',
                                    gap: '20px'
                                }}>
                                    <div style={{flex: 1}}>
                                        <h2 style={{
                                            fontSize: '1.6rem',
                                            fontWeight: '700',
                                            color: 'var(--platform-text-primary)',
                                            margin: '0 0 16px 0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            Заявка від {selectedSubmission.form_data.name}
                                            {selectedSubmission.is_pinned && (
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    background: 'linear-gradient(135deg, #ecc94b, #d69e2e)',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    boxShadow: '0 2px 4px rgba(236, 201, 75, 0.3)'
                                                }}>
                                                    📌 Закріплено
                                                </span>
                                            )}
                                        </h2>
                                        
                                        <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
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
                                        alignItems: 'flex-end',
                                        gap: '16px'
                                    }}>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--platform-text-secondary)',
                                            textAlign: 'right'
                                        }}>
                                            <div style={{fontWeight: '500', color: 'var(--platform-text-primary)'}}>
                                                {new Date(selectedSubmission.created_at).toLocaleDateString('uk-UA', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div style={{color: 'var(--platform-text-secondary)'}}>
                                                {new Date(selectedSubmission.created_at).toLocaleTimeString('uk-UA')}
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleDelete(selectedSubmission.id)}
                                            style={dangerButton}
                                            title="Видалити заявку"
                                            onMouseOver={(e) => handleMouseOver(e.target, dangerButtonHover)}
                                            onMouseOut={(e) => handleMouseOut(e.target, dangerButton)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '24px',
                                    marginBottom: '32px'
                                }}>
                                    <div style={{
                                        background: 'var(--platform-bg)',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        border: '1px solid var(--platform-border-color)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: 'var(--platform-text-primary)',
                                            margin: '0 0 20px 0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span style={{
                                                background: 'var(--platform-accent)',
                                                color: 'white',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                👤
                                            </span>
                                            Контактна інформація
                                        </h3>
                                        
                                        <div style={{marginBottom: '16px'}}>
                                            <div style={{
                                                fontSize: '0.8rem', 
                                                color: 'var(--platform-text-secondary)',
                                                marginBottom: '4px',
                                                fontWeight: '500'
                                            }}>
                                                Ім'я
                                            </div>
                                            <div style={{
                                                fontSize: '1.1rem', 
                                                fontWeight: '600', 
                                                color: 'var(--platform-text-primary)',
                                                padding: '8px 12px',
                                                background: 'rgba(0,0,0,0.02)',
                                                borderRadius: '8px',
                                                border: '1px solid var(--platform-border-color)'
                                            }}>
                                                {selectedSubmission.form_data.name}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div style={{
                                                fontSize: '0.8rem', 
                                                color: 'var(--platform-text-secondary)',
                                                marginBottom: '4px',
                                                fontWeight: '500'
                                            }}>
                                                Email
                                            </div>
                                            <div 
                                                style={{
                                                    fontSize: '1.1rem', 
                                                    fontWeight: '600', 
                                                    color: 'var(--platform-accent)',
                                                    cursor: 'pointer',
                                                    textDecoration: 'none',
                                                    display: 'inline-block',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s ease',
                                                    background: 'rgba(0,0,0,0.02)',
                                                    border: '1px solid var(--platform-border-color)',
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                                onClick={() => copyToClipboard(selectedSubmission.form_data.email)}
                                                onMouseEnter={e => {
                                                    e.target.style.backgroundColor = 'rgba(var(--platform-accent-rgb), 0.1)';
                                                    e.target.style.borderColor = 'var(--platform-accent)';
                                                    e.target.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.target.style.backgroundColor = 'rgba(0,0,0,0.02)';
                                                    e.target.style.borderColor = 'var(--platform-border-color)';
                                                    e.target.style.transform = 'translateY(0)';
                                                }}
                                                title="Клікніть щоб скопіювати email"
                                            >
                                                {selectedSubmission.form_data.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'var(--platform-bg)',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        border: '1px solid var(--platform-border-color)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: 'var(--platform-text-primary)',
                                            margin: '0 0 20px 0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span style={{
                                                background: '#ecc94b',
                                                color: 'white',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                📋
                                            </span>
                                            Деталі заявки
                                        </h3>
                                        
                                        <div style={{marginBottom: '16px'}}>
                                            <div style={{
                                                fontSize: '0.8rem', 
                                                color: 'var(--platform-text-secondary)',
                                                marginBottom: '4px',
                                                fontWeight: '500'
                                            }}>
                                                Поточний статус
                                            </div>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                background: statusConfig[selectedSubmission.status]?.bg,
                                                color: statusConfig[selectedSubmission.status]?.color,
                                                fontWeight: '700',
                                                fontSize: '0.9rem',
                                                border: `2px solid ${statusConfig[selectedSubmission.status]?.color}`
                                            }}>
                                                {statusConfig[selectedSubmission.status]?.icon}
                                                {statusConfig[selectedSubmission.status]?.label}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div style={{
                                                fontSize: '0.8rem', 
                                                color: 'var(--platform-text-secondary)',
                                                marginBottom: '4px',
                                                fontWeight: '500'
                                            }}>
                                                ID Заявки
                                            </div>
                                            <div style={{
                                                fontSize: '1rem', 
                                                fontFamily: 'monospace', 
                                                color: 'var(--platform-text-primary)',
                                                padding: '8px 12px',
                                                background: 'rgba(0,0,0,0.02)',
                                                borderRadius: '8px',
                                                border: '1px solid var(--platform-border-color)'
                                            }}>
                                                #{selectedSubmission.id}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{
                                        fontSize: '1.2rem',
                                        fontWeight: '600',
                                        color: 'var(--platform-text-primary)',
                                        margin: '0 0 20px 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <span style={{
                                            background: '#48bb78',
                                            color: 'white',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            💬
                                        </span>
                                        Повідомлення
                                    </h3>
                                    
                                    <div style={{
                                        background: 'var(--platform-bg)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--platform-border-color)',
                                        padding: '28px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}>
                                        {selectedSubmission.form_data.subject && (
                                            <div style={{
                                                marginBottom: '24px', 
                                                paddingBottom: '20px', 
                                                borderBottom: '2px solid var(--platform-border-color)'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.85rem', 
                                                    color: 'var(--platform-text-secondary)', 
                                                    marginBottom: '8px',
                                                    fontWeight: '500'
                                                }}>
                                                    Тема повідомлення
                                                </div>
                                                <div style={{
                                                    fontSize: '1.3rem', 
                                                    fontWeight: '700', 
                                                    color: 'var(--platform-text-primary)',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {selectedSubmission.form_data.subject}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div style={{
                                            fontSize: '1.1rem',
                                            lineHeight: '1.7',
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
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            color: 'var(--platform-text-secondary)',
                            padding: '60px 20px'
                        }}>
                            <div style={{
                                fontSize: '5rem', 
                                marginBottom: '24px', 
                                opacity: 0.5,
                                animation: 'pulse 2s infinite'
                            }}>
                                📋
                            </div>
                            <h3 style={{
                                color: 'var(--platform-text-primary)', 
                                margin: '0 0 16px 0',
                                fontSize: '1.8rem',
                                fontWeight: '700'
                            }}>
                                Оберіть заявку для перегляду
                            </h3>
                            <p style={{
                                margin: 0, 
                                fontSize: '1.1rem',
                                maxWidth: '500px',
                                lineHeight: '1.6'
                            }}>
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