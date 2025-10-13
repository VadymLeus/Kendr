// frontend/src/features/sites/CatalogPage.jsx
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

    return (
        <div>
            <h2>Каталог сайтів</h2>
            <p>Тут зібрані публічні сайти, створені нашими користувачами.</p>
            
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                <input
                    type="text"
                    placeholder="Пошук за назвою сайту..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
            </div>

            {loading ? (
                <div>Завантаження...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : sites.length === 0 ? (
                <p>Сайти не знайдено.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {sites.map(site => (
                        <div key={site.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                            <img 
                                src={site.templateThumbnail || 'https://placehold.co/400x250/EFEFEF/31343C?text=Preview'} 
                                alt={site.title} 
                                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <h3 style={{ marginTop: '1rem' }}>{site.title}</h3>
                            <p style={{ color: '#666', margin: '0.25rem 0' }}>
                                Автор: <Link to={`/user/${site.author}`}>{site.author}</Link>
                            </p>
                            <p style={{ color: '#666', margin: '0.25rem 0', flexGrow: 1 }}>Шаблон: {site.templateName}</p>
                            <Link to={`/site/${site.site_path}`} style={{ marginTop: '1rem' }}>
                                    <button style={{ width: '100%', padding: '0.75rem', cursor: 'pointer' }}>Відвідати сайт</button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CatalogPage;