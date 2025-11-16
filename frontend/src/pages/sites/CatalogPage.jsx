// frontend/src/pages/sites/CatalogPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import apiClient from '../../services/api';

const CatalogPage = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSites = async (searchQuery) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/sites/catalog', {
                params: { search: searchQuery }
            });
            setSites(response.data);
            setError('');
        } catch (err) {
            setError('Не вдалося завантажити каталог сайтів.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchSites = useCallback(debounce(fetchSites, 500), []);

    useEffect(() => {
        debouncedFetchSites(searchTerm);
        return () => {
            debouncedFetchSites.cancel();
        };
    }, [searchTerm, debouncedFetchSites]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const searchContainerStyle = {
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--platform-card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--platform-border-color)'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        fontSize: '1rem',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        boxSizing: 'border-box'
    };

    const siteCardStyle = {
        border: '1px solid var(--platform-border-color)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--platform-card-bg)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    };

    const siteCardHoverStyle = {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>
                Каталог сайтів
            </h2>
            <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '2rem' }}>
                Тут зібрані публічні сайти, створені нашими користувачами.
            </p>
            
            <div style={searchContainerStyle}>
                <input
                    type="text"
                    placeholder="Пошук за назвою сайту..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={inputStyle}
                />
            </div>

            {loading ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    color: 'var(--platform-text-secondary)'
                }}>
                    Завантаження...
                </div>
            ) : error ? (
                <div style={{ 
                    color: 'var(--platform-danger)', 
                    background: '#fff2f0',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            ) : sites.length === 0 ? (
                <p style={{ 
                    textAlign: 'center', 
                    color: 'var(--platform-text-secondary)',
                    padding: '2rem'
                }}>
                    Сайти не знайдено.
                </p>
            ) : (
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
                            <img 
                                src={site.templateThumbnail || 'https://placehold.co/400x250/EFEFEF/31343C?text=Preview'} 
                                alt={site.title} 
                                style={{ 
                                    width: '100%', 
                                    height: '180px', 
                                    objectFit: 'cover', 
                                    borderRadius: '8px',
                                    border: '1px solid var(--platform-border-color)'
                                }}
                            />
                            <h3 style={{ 
                                marginTop: '1rem', 
                                marginBottom: '0.5rem',
                                color: 'var(--platform-text-primary)'
                            }}>
                                {site.title}
                            </h3>
                            <p style={{ 
                                color: 'var(--platform-text-secondary)', 
                                margin: '0.25rem 0',
                                fontSize: '0.9rem'
                            }}>
                                Автор: <Link 
                                    to={`/profile/${site.author}`}
                                    style={{ color: 'var(--platform-accent)' }}
                                >
                                    {site.author}
                                </Link>
                            </p>
                            <p style={{ 
                                color: 'var(--platform-text-secondary)', 
                                margin: '0.25rem 0', 
                                flexGrow: 1,
                                fontSize: '0.9rem'
                            }}>
                                Шаблон: {site.templateName}
                            </p>
                            <Link to={`/site/${site.site_path}`} style={{ marginTop: '1rem' }}>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    Відвідати сайт
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CatalogPage;