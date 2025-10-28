// frontend/src/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

const formatTimeRemaining = (isoDate) => {
    if (!isoDate) return '';
    const timeLeft = new Date(isoDate).getTime() - new Date().getTime();
    if (timeLeft <= 0) return '(видалення незабаром)';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `(видалення через ${days} д.)`;
    return `(видалення через ${hours} год.)`;
};

const DashboardPage = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllSites = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/sites');
            setSites(response.data);
        } catch (error) {
            alert('Не вдалося завантажити список сайтів.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllSites();
    }, []);

    const handleDeleteSite = async (sitePath, siteTitle) => {
        if (window.confirm(`Ви впевнені, що хочете остаточно видалити сайт "${siteTitle}"? Ця дія незворотна.`)) {
            try {
                await apiClient.delete(`/admin/sites/${sitePath}`);
                setSites(prevSites => prevSites.filter(s => s.site_path !== sitePath));
                alert('Сайт успішно видалено.');
            } catch (err) {
                alert(err.response?.data?.message || 'Помилка при видаленні сайту.');
            }
        }
    };

    const handleUpdateStatus = async (sitePath, newStatus) => {
        const actionText = {
            suspended: 'призупинити',
            published: 'відновити',
            draft: 'перевести в чернетки'
        };
        
        if (window.confirm(`Ви впевнені, що хочете ${actionText[newStatus]} цей сайт?`)) {
            try {
                await apiClient.put(`/admin/sites/${sitePath}/status`, { status: newStatus });
                setSites(prevSites => prevSites.map(s => 
                    s.site_path === sitePath ? { ...s, status: newStatus } : s
                ));
                alert('Статус сайту оновлено.');
            } catch (err) {
                alert(err.response?.data?.message || 'Помилка при оновленні статусу.');
            }
        }
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        background: 'var(--platform-card-bg)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };

    const thStyle = { 
        padding: '1rem', 
        textAlign: 'left',
        background: 'var(--platform-sidebar-bg)',
        color: 'var(--platform-accent-text)',
        fontWeight: '600',
        borderBottom: '1px solid var(--platform-border-color)'
    };

    const tdStyle = { 
        padding: '1rem', 
        borderBottom: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-primary)'
    };

    const statusBadgeStyle = (status) => {
        const baseStyle = {
            padding: '6px 12px',
            borderRadius: '12px',
            fontWeight: 'bold',
            color: 'white',
            fontSize: '0.8rem',
            display: 'inline-block'
        };
        if (status === 'published') return { ...baseStyle, background: 'var(--platform-success)' };
        if (status === 'draft') return { ...baseStyle, background: 'var(--platform-text-secondary)' };
        if (status === 'suspended') return { ...baseStyle, background: 'var(--platform-warning)' };
        return baseStyle;
    };

    if (loading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--platform-text-secondary)' 
        }}>
            Завантаження сайтів...
        </div>
    );

    return (
        <div style={containerStyle}>
            <h1 style={{ 
                color: 'var(--platform-text-primary)', 
                marginBottom: '1.5rem' 
            }}>
                Всі сайти платформи
            </h1>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Назва сайту</th>
                        <th style={thStyle}>Автор</th>
                        <th style={thStyle}>Статус</th>
                        <th style={thStyle}>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {sites.map(site => (
                        <tr key={site.id}>
                            <td style={tdStyle}>
                                <a 
                                    href={`/site/${site.site_path}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                        color: 'var(--platform-accent)',
                                        textDecoration: 'none',
                                        fontWeight: '500'
                                    }}
                                >
                                    {site.title}
                                </a>
                            </td>
                            <td style={tdStyle}>{site.author}</td>
                            <td style={tdStyle}>
                                <span style={statusBadgeStyle(site.status)}>
                                    {site.status === 'published' && 'Опубліковано'}
                                    {site.status === 'draft' && 'Чернетка'}
                                    {site.status === 'suspended' && 'Призупинено'}
                                </span>
                                {site.status === 'suspended' && (
                                    <small style={{ 
                                        display: 'block', 
                                        color: 'var(--platform-warning)',
                                        marginTop: '0.25rem',
                                        fontSize: '0.8rem'
                                    }}>
                                        {formatTimeRemaining(site.deletion_scheduled_for)}
                                    </small>
                                )}
                            </td>
                            <td style={{ 
                                ...tdStyle, 
                                display: 'flex', 
                                gap: '0.5rem',
                                flexWrap: 'wrap'
                            }}>
                                {site.status === 'suspended' ? (
                                    <button 
                                        onClick={() => handleUpdateStatus(site.site_path, 'published')} 
                                        className="btn"
                                        style={{ 
                                            background: 'var(--platform-success)',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        Відновити
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleUpdateStatus(site.site_path, 'suspended')} 
                                        className="btn"
                                        style={{ 
                                            background: 'var(--platform-warning)',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        Призупинити
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleUpdateStatus(site.site_path, 'draft')} 
                                    className="btn btn-secondary"
                                    style={{ 
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    У чернетки
                                </button>
                                <button 
                                    onClick={() => handleDeleteSite(site.site_path, site.title)} 
                                    className="btn btn-danger"
                                    style={{ 
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Видалити
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DashboardPage;