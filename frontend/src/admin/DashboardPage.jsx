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

    if (loading) return <p>Завантаження сайтів...</p>;

    return (
        <div>
            <h1>Всі сайти платформи</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #4a5568' }}>
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
                                <a href={`/site/${site.site_path}`} target="_blank" rel="noopener noreferrer">{site.title}</a>
                            </td>
                            <td style={tdStyle}>{site.author}</td>
                            <td style={tdStyle}>
                                <span style={statusBadgeStyle(site.status)}>
                                    {site.status === 'published' && 'Опубліковано'}
                                    {site.status === 'draft' && 'Чернетка'}
                                    {site.status === 'suspended' && 'Призупинено'}
                                </span>
                                {site.status === 'suspended' && (
                                    <small style={{ display: 'block', color: '#dd6b20' }}>
                                        {formatTimeRemaining(site.deletion_scheduled_for)}
                                    </small>
                                )}
                            </td>
                            <td style={{ ...tdStyle, display: 'flex', gap: '10px' }}>
                                {site.status === 'suspended' ? (
                                    <button onClick={() => handleUpdateStatus(site.site_path, 'published')} style={actionButtonStyle('green')}>Відновити</button>
                                ) : (
                                    <button onClick={() => handleUpdateStatus(site.site_path, 'suspended')} style={actionButtonStyle('orange')}>Призупинити</button>
                                )}
                                <button onClick={() => handleUpdateStatus(site.site_path, 'draft')} style={actionButtonStyle('gray')}>У чернетки</button>
                                <button onClick={() => handleDeleteSite(site.site_path, site.title)} style={actionButtonStyle('red')}>Видалити</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const thStyle = { padding: '12px 8px', textAlign: 'left' };
const tdStyle = { padding: '12px 8px', borderTop: '1px solid #e2e8f0' };
const statusBadgeStyle = (status) => {
    const baseStyle = {
        padding: '4px 10px',
        borderRadius: '12px',
        fontWeight: 'bold',
        color: 'white',
        fontSize: '0.8rem'
    };
    if (status === 'published') return { ...baseStyle, background: '#38a169' };
    if (status === 'draft') return { ...baseStyle, background: '#718096' };
    if (status === 'suspended') return { ...baseStyle, background: '#dd6b20' };
    return baseStyle;
};
const actionButtonStyle = (color) => {
    const colors = {
        red: '#c53030',
        orange: '#dd6b20',
        gray: '#718096',
        green: '#38a169'
    };
    return {
        background: colors[color] || '#4a5568',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '6px 12px',
        cursor: 'pointer'
    };
};

export default DashboardPage;