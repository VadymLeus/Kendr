// frontend/src/features/favorites/FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

const FavoritesPage = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/favorites')
            .then(response => setSites(response.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Завантаження обраних сайтів...</div>;

    return (
        <div>
            <h2>Обрані сайти</h2>
            {sites.length === 0 ? (
                <p>Ви ще не додали жодного сайту до обраних.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {sites.map(site => (
                        <div key={site.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
                            <h3>{site.title}</h3>
                            <p>Автор: <Link to={`/user/${site.author}`}>{site.author}</Link></p>
                            <Link to={`/site/${site.site_path}`}>
                                <button style={{ width: '100%' }}>Перейти на сайт</button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;