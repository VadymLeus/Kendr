// frontend/src/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const DashboardPage = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllSites = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/sites');
            setSites(response.data);
        } catch (error) {
            alert('Не вдалося завантажити список сайтів. Переконайтеся, що ви авторизовані як адміністратор.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllSites();
    }, []);

    const handleDeleteSite = async (sitePath, siteTitle) => {
        if (window.confirm(`Ви впевнені, що хочете видалити сайт "${siteTitle}"? Ця дія є незворотною.`)) {
            try {
                await apiClient.delete(`/admin/sites/${sitePath}`);
                setSites(prevSites => prevSites.filter(s => s.site_path !== sitePath));
                alert('Сайт успішно видалено.');
            } catch (err) {
                alert(err.response?.data?.message || 'Помилка під час видалення сайту.');
            }
        }
    };

    if (loading) return <p>Завантаження сайтів...</p>;

    return (
        <div>
            <h1>Усі сайти платформи</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid black' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Назва</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Адреса</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Автор</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {sites.map(site => (
                        <tr key={site.id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '8px' }}>{site.title}</td>
                            <td style={{ padding: '8px' }}>
                                <a href={`/site/${site.site_path}`} target="_blank" rel="noopener noreferrer">
                                    {site.site_path}
                                </a>
                            </td>
                            <td style={{ padding: '8px' }}>{site.author}</td>
                            <td style={{ padding: '8px' }}>
                                <button
                                    onClick={() => handleDeleteSite(site.site_path, site.title)}
                                    style={{ backgroundColor: '#dc3545', color: 'white' }}
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