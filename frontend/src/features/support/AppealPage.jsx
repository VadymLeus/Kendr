// frontend/src/features/support/AppealPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

const AppealPage = () => {
    const [suspendedSites, setSuspendedSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/sites/my-suspended')
            .then(response => setSuspendedSites(response.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Завантаження...</div>;

    return (
        <div>
            <h2>Оскарження блокування</h2>
            <p>Тут показані ваші сайти, які були призупинені адміністрацією.</p>
            {suspendedSites.length === 0 ? (
                <p>У вас немає призупинених сайтів.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {suspendedSites.map(site => (
                        <div key={site.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                            <h4>{site.title}</h4>
                            <p>Адреса: {site.site_path}</p>
                            <p style={{ color: '#dd6b20' }}>
                                Заплановане видалення: {new Date(site.deletion_scheduled_for).toLocaleString()}
                            </p>
                            <Link to="/support/new-ticket" state={{ site: site }}>
                                <button>Оскаржити</button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppealPage;