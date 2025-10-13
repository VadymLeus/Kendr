// frontend/src/features/sites/MySitesPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import apiClient from '../../services/api';

const MySitesPage = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchMySites = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/sites/catalog', {
                    params: { scope: 'my' },
                });
                setSites(response.data);
            } catch (err) {
                setError('Не вдалося завантажити ваші сайти.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMySites();
    }, [user, navigate]);

    // Функція для видалення сайту
    const handleDeleteSite = async (sitePath, siteTitle) => {
        const confirmation = window.confirm(`Ви впевнені, що хочете видалити сайт "${siteTitle}"? Ця дія є незворотною і видалить усі пов'язані з ним товари та категорії.`);
        
        if (confirmation) {
            try {
                await apiClient.delete(`/sites/${sitePath}`);
                // Оновлюємо стан, щоб сайт зник зі списку
                setSites(sites.filter(site => site.site_path !== sitePath));
                alert('Сайт успішно видалено!');
            } catch (err) {
                alert(err.response?.data?.message || 'Не вдалося видалити сайт.');
            }
        }
    };

    if (loading) return <div>Завантаження ваших сайтів...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Мої сайти</h2>
            {sites.length === 0 ? (
                <div>
                    <p>Ви ще не створили жодного сайту.</p>
                    <Link to="/create-site">
                        <button>Створити свій перший сайт</button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sites.map(site => {
                        const editLink = site.templateName === 'Магазин' 
                            ? `/edit-shop/${site.site_path}` 
                            : `/edit-site/${site.site_path}`;

                        return (
                            <div key={site.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                                <div>
                                    <h4>{site.title}</h4>
                                    <p style={{ color: '#666', margin: 0 }}>
                                        Адреса: <Link to={`/site/${site.site_path}`}>{`/site/${site.site_path}`}</Link>
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link to={editLink}>
                                        <button>Редагувати</button>
                                    </Link>
                                    <Link to={`/site/${site.site_path}`}>
                                        <button>Перегляд</button>
                                    </Link>
                                    <button 
                                        onClick={() => handleDeleteSite(site.site_path, site.title)}
                                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MySitesPage;