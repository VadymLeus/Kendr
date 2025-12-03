// frontend/src/modules/support/pages/AppealPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../common/services/api';

const AppealPage = () => {
    const [suspendedSites, setSuspendedSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/sites/my-suspended')
            .then(response => setSuspendedSites(response.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const siteCardStyle = {
        border: '1px solid var(--platform-border-color)',
        padding: '1.5rem',
        borderRadius: '12px',
        background: 'var(--platform-card-bg)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '1rem'
    };

    const warningTextStyle = {
        color: 'var(--platform-warning)',
        fontWeight: 'bold',
        margin: '0.5rem 0'
    };

    if (loading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--platform-text-secondary)' 
        }}>
            Завантаження...
        </div>
    );

    return (
        <div style={containerStyle}>
            <h2 style={{ 
                color: 'var(--platform-text-primary)', 
                marginBottom: '0.5rem' 
            }}>
                Оскарження блокування
            </h2>
            <p style={{ 
                color: 'var(--platform-text-secondary)',
                marginBottom: '2rem'
            }}>
                Тут показані ваші сайти, які були призупинені адміністрацією.
            </p>
            {suspendedSites.length === 0 ? (
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
                        У вас немає призупинених сайтів.
                    </p>
                    <Link to="/my-sites">
                        <button className="btn btn-primary">
                            Перейти до моїх сайтів
                        </button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {suspendedSites.map(site => (
                        <div key={site.id} style={siteCardStyle}>
                            <h4 style={{ 
                                margin: '0 0 0.5rem 0',
                                color: 'var(--platform-text-primary)'
                            }}>
                                {site.title}
                            </h4>
                            <p style={{ 
                                color: 'var(--platform-text-secondary)',
                                margin: '0.25rem 0'
                            }}>
                                Адреса: {site.site_path}
                            </p>
                            <p style={warningTextStyle}>
                                Заплановане видалення: {new Date(site.deletion_scheduled_for).toLocaleString()}
                            </p>
                            <Link to="/support/new-ticket" state={{ site: site }}>
                                <button className="btn btn-primary">
                                    Оскаржити
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppealPage;