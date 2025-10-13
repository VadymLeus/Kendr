// frontend/src/features/sites/SiteDisplayPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import TemplateLoader from '../../templates/TemplateLoader';

const SiteDisplayPage = () => {
    const { site_path } = useParams();
    const [siteData, setSiteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/sites/${site_path}`);
                setSiteData(response.data);
            } catch (err) {
                setError('Не вдалося завантажити сайт. Можливо, він не існує.');
            } finally {
                setLoading(false);
            }
        };
        fetchSiteData();
    }, [site_path]);

    if (loading) return <div>Завантаження сайту...</div>;
    if (error) return <div>{error}</div>;
    if (!siteData) return <div>Сайт не знайдено.</div>;

    // Вся логіка шапки тепер знаходиться в SiteHeader.jsx,
    // який відображається через Layout.jsx
    return (
        <TemplateLoader 
            componentName={siteData.component_name}
            content={siteData.content} 
            products={siteData.products} 
            siteOwnerId={siteData.user_id} 
        />
    );
};

export default SiteDisplayPage;