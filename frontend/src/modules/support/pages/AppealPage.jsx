// frontend/src/modules/support/pages/AppealPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { Button } from '../../../shared/ui/elements/Button';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, Gavel, ArrowRight, CheckCircle } from 'lucide-react';

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
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    };

    const warningBoxStyle = {
        background: 'rgba(221, 107, 32, 0.1)',
        color: 'var(--platform-warning)',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid rgba(221, 107, 32, 0.2)'
    };

    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>
            Завантаження...
        </div>
    );

    return (
        <div style={containerStyle}>
            <Helmet>
                <title>Оскарження блокування | Kendr</title>
            </Helmet>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '0.5rem',
                    fontSize: '2rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Gavel size={32} style={{ color: 'var(--platform-danger)' }} />
                    Оскарження блокування
                </h2>
                <p style={{ color: 'var(--platform-text-secondary)', fontSize: '1.1rem' }}>
                    Тут показані ваші сайти, які були призупинені адміністрацією через порушення правил.
                </p>
            </div>

            {suspendedSites.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '4rem 2rem',
                    background: 'var(--platform-card-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--platform-border-color)'
                }}>
                    <div style={{ marginBottom: '1.5rem', color: 'var(--platform-success)' }}>
                        <CheckCircle size={48} />
                    </div>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>
                        У вас немає призупинених сайтів
                    </h3>
                    <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '2rem' }}>
                        Це чудово! Ви дотримуєтесь правил платформи.
                    </p>
                    <Link to="/my-sites" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" icon={<ArrowRight size={18}/>}>
                            Перейти до моїх сайтів
                        </Button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {suspendedSites.map(site => (
                        <div key={site.id} style={siteCardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--platform-text-primary)', fontSize: '1.25rem' }}>
                                        {site.title}
                                    </h4>
                                    <p style={{ color: 'var(--platform-text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                                        Адреса: <strong>{site.site_path}</strong>
                                    </p>
                                </div>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    style={{ cursor: 'default', opacity: 1 }}
                                >
                                    Suspended
                                </Button>
                            </div>

                            <div style={warningBoxStyle}>
                                <AlertTriangle size={20} />
                                <span>
                                    Заплановане видалення: <strong>{new Date(site.deletion_scheduled_for).toLocaleDateString()}</strong>
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <Link to="/support/new-ticket" state={{ site: site }} style={{ textDecoration: 'none' }}>
                                    <Button variant="primary">
                                        Подати апеляцію
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppealPage;