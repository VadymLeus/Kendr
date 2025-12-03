// frontend/src/modules/shop/pages/FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../common/services/api';

const FavoritesPage = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/favorites')
            .then(response => {
                console.log('Favorites API response:', response.data);

                const data = response.data;
                if (Array.isArray(data)) {
                    setSites(data);
                } else if (data && Array.isArray(data.favorites)) {
                    setSites(data.favorites);
                } else {
                    setSites([]);
                }
            })
            .catch(err => {
                console.error('Помилка при завантаженні обраних сайтів:', err);
                setSites([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const siteCardStyle = {
        border: '1px solid var(--platform-border-color)',
        borderRadius: '12px',
        padding: '1.5rem',
        background: 'var(--platform-card-bg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    };

    const siteCardHoverStyle = {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
    };

    if (loading) {
        return (
            <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: 'var(--platform-text-secondary)' 
            }}>
                Завантаження обраних сайтів...
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={{ 
                color: 'var(--platform-text-primary)', 
                marginBottom: '1.5rem' 
            }}>
                Обрані сайти
            </h2>

            {Array.isArray(sites) && sites.length > 0 ? (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                    {sites.map(site => (
                        <div 
                            key={site.id} 
                            style={siteCardStyle}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, siteCardHoverStyle)}
                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, siteCardStyle)}
                        >
                            <h3 style={{ 
                                margin: '0 0 0.5rem 0',
                                color: 'var(--platform-text-primary)'
                            }}>
                                {site.title}
                            </h3>
                            <p style={{ 
                                color: 'var(--platform-text-secondary)',
                                margin: '0 0 1rem 0',
                                fontSize: '0.9rem'
                            }}>
                                Автор: <Link 
                                    to={`/profile/${site.author}`}
                                    style={{ color: 'var(--platform-accent)' }}
                                >
                                    {site.author}
                                </Link>
                            </p>
                            <Link to={`/site/${site.site_path}`} style={{ marginTop: 'auto' }}>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    Перейти на сайт
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    background: 'var(--platform-card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--platform-border-color)'
                }}>
                    <p style={{ 
                        color: 'var(--platform-text-secondary)',
                        marginBottom: '1.5rem'
                    }}>
                        Ви ще не додали жодного сайту до обраних.
                    </p>
                    <Link to="/catalog">
                        <button className="btn btn-primary">
                            Перейти до каталогу
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;