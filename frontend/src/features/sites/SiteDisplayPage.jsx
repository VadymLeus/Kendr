// frontend/src/features/sites/SiteDisplayPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockRenderer from '../../components/blocks/BlockRenderer';

const SiteDisplayPage = () => {
    const { site_path } = useParams();
    const [siteData, setSiteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSuspended, setIsSuspended] = useState(false);

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                setLoading(true);
                setIsSuspended(false);
                const response = await apiClient.get(`/sites/${site_path}`, {
                    params: { increment_view: true }
                });
                setSiteData(response.data);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    setError(err.response.data.message);
                    setIsSuspended(true);
                } else {
                    setError('Не вдалося завантажити сайт. Можливо, він не існує.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchSiteData();
    }, [site_path]);

    if (loading) return <div>Завантаження сайту...</div>;
    
    if (isSuspended) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2>Сайт заблоковано</h2>
                <p style={{ color: 'red' }}>{error}</p>
                <p>Якщо ви вважаєте, що це помилка, ви можете оскаржити рішення.</p>
                <Link to="/support/appeal">
                    <button>Оскаржити рішення</button>
                </Link>
            </div>
        );
    }

    if (error) return <div>{error}</div>;
    if (!siteData) return <div>Сайт не знайдено.</div>;

    // Обробка page_content для забезпечення коректного формату
    let blocksToRender = [];
    
    if (Array.isArray(siteData.page_content)) {
        // Якщо page_content вже масив - використовуємо без змін
        blocksToRender = siteData.page_content;
    } else if (typeof siteData.page_content === 'string') {
        // Якщо page_content - рядок, намагаємося парсити JSON
        try {
            blocksToRender = JSON.parse(siteData.page_content);
        } catch (e) {
            console.error("Помилка парсингу page_content:", e);
            blocksToRender = [];
        }
    } else {
        // Якщо page_content не визначено або іншого типу - використовуємо порожній масив
        blocksToRender = [];
    }

    return (
        <div 
            id="site-root" 
            data-site-mode={siteData.site_theme_mode || 'light'} 
            data-site-accent={siteData.site_theme_accent || 'orange'}
        >
            <BlockRenderer blocks={blocksToRender} siteData={siteData} />
        </div>
    );
};

export default SiteDisplayPage;