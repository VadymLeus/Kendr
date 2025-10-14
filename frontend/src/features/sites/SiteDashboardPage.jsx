// frontend/src/features/sites/SiteDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

// Виносимо компоненти вкладок для чистоти коду
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

    if (loading) return <div>Завантаження панелі управління...</div>;
    if (error) return <div>{error}</div>;

    // Перевіряємо, чи це шаблон магазину, щоб відобразити відповідні вкладки
    const isShopTemplate = siteData.template_id === 2; 

    return (
        <div style={{ maxWidth: '1000px', margin: 'auto' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Панель управління сайтом</h1>
            <p style={{ color: '#555', marginTop: 0 }}>"{siteData.title}"</p>

            {/* Навігація по вкладках */}
            <div style={{ borderBottom: '1px solid #ccc', marginBottom: '2rem' }}>
                <button style={tabStyle(activeTab === 'general')} onClick={() => setActiveTab('general')}>Загальні</button>
                {isShopTemplate && (
                    <button style={tabStyle(activeTab === 'content')} onClick={() => setActiveTab('content')}>Контент</button>
                )}
            </div>

            {/* Вміст вкладок */}
            <div>
                {activeTab === 'general' && <GeneralSettingsTab siteData={siteData} />}
                {activeTab === 'content' && isShopTemplate && <ShopContentTab siteData={siteData} />}
            </div>
        </div>
    );
};

const tabStyle = (isActive) => ({
    padding: '1rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#242060' : '#555',
    borderBottom: isActive ? '3px solid #242060' : '3px solid transparent',
});

export default SiteDashboardPage;