// frontend/src/modules/site-dashboard/pages/MySitesPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../common/hooks/useConfirm';

const MySitesPage = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { confirm } = useConfirm();

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
                toast.error('Не вдалося завантажити ваші сайти.');
            } finally {
                setLoading(false);
            }
        };

        fetchMySites();
    }, [user, navigate]);

    const handleDeleteSite = async (sitePath, siteTitle) => {
        const isConfirmed = await confirm({
            title: "Видалення сайту",
            message: `Ви впевнені, що хочете видалити сайт "${siteTitle}"? Ця дія є незворотною і видалить усі пов'язані товари та категорії.`,
            confirmLabel: "Так, видалити",
            cancelLabel: "Ні, залишити",
            type: "danger"
        });
        
        if (isConfirmed) {
            try {
                await apiClient.delete(`/sites/${sitePath}`);
                setSites(sites.filter(site => site.site_path !== sitePath));
                toast.success('Сайт успішно видалено!');
            } catch (err) {
                console.error(err);
            }
        }
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const siteCardStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        borderRadius: '12px',
        background: 'var(--platform-card-bg)',
        border: '1px solid var(--platform-border-color)',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    };

    const suspendedSiteCardStyle = {
        ...siteCardStyle,
        border: '2px solid var(--platform-warning)',
        background: '#fffaf0'
    };

    if (loading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--platform-text-secondary)' 
        }}>
            Завантаження ваших сайтів...
        </div>
    );

    return (
        <div style={containerStyle}>
            <h2 style={{ color: 'var(--platform-text-primary)', marginBottom: '1.5rem' }}>
                Мої сайти
            </h2>
            {sites.length === 0 ? (
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
                        Ви ще не створили жодного сайту.
                    </p>
                    <Link to="/create-site">
                        <button className="btn btn-primary">
                            Створити свій перший сайт
                        </button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sites.map(site => {
                        const isSuspended = site.status === 'suspended';
                        
                        return (
                            <div 
                                key={site.id} 
                                style={isSuspended ? suspendedSiteCardStyle : siteCardStyle}
                            >
                                <div>
                                    <h4 style={{ 
                                        margin: '0 0 0.5rem 0',
                                        color: 'var(--platform-text-primary)'
                                    }}>
                                        {site.title}
                                    </h4>
                                    <p style={{ 
                                        color: 'var(--platform-text-secondary)', 
                                        margin: 0,
                                        fontSize: '0.9rem'
                                    }}>
                                        Адреса: <a 
                                            href={`/site/${site.site_path}`} 
                                            style={{ color: 'var(--platform-accent)' }}
                                        >
                                            {`/site/${site.site_path}`}
                                        </a>
                                    </p>
                                    {isSuspended && (
                                        <p style={{ 
                                            color: 'var(--platform-warning)', 
                                            fontWeight: 'bold', 
                                            margin: '5px 0 0 0',
                                            fontSize: '0.9rem'
                                        }}>
                                            Сайт призупинено
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {isSuspended ? (
                                        <Link to="/support/appeal">
                                            <button className="btn" style={{ 
                                                backgroundColor: 'var(--platform-warning)',
                                                color: 'white'
                                            }}>
                                                Оскаржити
                                            </button>
                                        </Link>
                                    ) : (
                                        <Link to={`/dashboard/${site.site_path}`}>
                                            <button className="btn btn-primary">
                                                Редагувати
                                            </button>
                                        </Link>
                                    )}
                                    <button 
                                        onClick={() => handleDeleteSite(site.site_path, site.title)}
                                        className="btn btn-danger"
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