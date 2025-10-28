// frontend/src/features/sites/SiteDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import ShopContentTab from './tabs/ShopContentTab';

const SiteDashboardPage = () => {
    const { site_path } = useParams();
    const [siteData, setSiteData] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                const response = await apiClient.get(`/sites/${site_path}`);
                setSiteData(response.data);
            } catch (err) {
                setError('Не вдалося завантажити дані сайту.');
            } finally {
                setLoading(false);
            }
        };
        fetchSiteData();
    }, [site_path]);

    const containerStyle = {
        maxWidth: '1000px',
        margin: 'auto',
        padding: '2rem 1rem'
    };

    const tabsContainerStyle = {
        borderBottom: '1px solid var(--platform-border-color)',
        marginBottom: '2rem',
        display: 'flex'
    };

    const tabStyle = (isActive) => ({
        padding: '1rem 1.5rem',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: isActive ? 'bold' : 'normal',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        borderBottom: isActive ? '3px solid var(--platform-accent)' : '3px solid transparent',
        marginBottom: '-1px',
        transition: 'all 0.2s ease'
    });

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>Завантаження панелі управління...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--platform-danger)' }}>{error}</div>;

    const isShopTemplate = siteData.template_id === 2;

    return (
        <div style={containerStyle}>
            <h1 style={{ 
                color: 'var(--platform-text-primary)', 
                marginBottom: '0.5rem' 
            }}>
                Панель управління сайтом
            </h1>
            <p style={{ 
                color: 'var(--platform-text-secondary)', 
                marginTop: 0,
                marginBottom: '2rem'
            }}>
                "{siteData.title}"
            </p>

            <div style={tabsContainerStyle}>
                <button 
                    style={tabStyle(activeTab === 'general')} 
                    onClick={() => setActiveTab('general')}
                >
                    Загальні
                </button>
                {isShopTemplate && (
                    <button 
                        style={tabStyle(activeTab === 'content')} 
                        onClick={() => setActiveTab('content')}
                    >
                        Контент
                    </button>
                )}
            </div>

            <div>
                {activeTab === 'general' && <GeneralSettingsTab siteData={siteData} />}
                {activeTab === 'content' && isShopTemplate && <ShopContentTab siteData={siteData} />}
            </div>
        </div>
    );
};

export default SiteDashboardPage;