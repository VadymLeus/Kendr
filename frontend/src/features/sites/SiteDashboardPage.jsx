// frontend/src/features/sites/SiteDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockEditor from '../../components/editor/BlockEditor';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import ShopContentTab from './tabs/ShopContentTab';

const SiteDashboardPage = () => {
    const { site_path } = useParams();
    const navigate = useNavigate();
    const [siteData, setSiteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('editor');
    const [error, setError] = useState('');

    const [pageContent, setPageContent] = useState([]);
    const [pageId, setPageId] = useState(null);

    const fetchSiteData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/sites/${site_path}`);
            setSiteData(response.data);

            if (response.data.page_content) {
                setPageContent(response.data.page_content);
            } else {
                setPageContent([]);
            }
            setPageId(response.data.page_id);

        } catch (err) {
            setError(err.response?.data?.message || 'Помилка завантаження даних сайту.');
        } finally {
            setLoading(false);
        }
    }, [site_path]);

    useEffect(() => {
        fetchSiteData();
    }, [fetchSiteData]);

    const savePageContent = useCallback(async (newBlocks) => {
        if (!pageId) {
             alert("Помилка: ID сторінки не знайдено.");
             return;
        }
        try {
            await apiClient.put(`/sites/page/${pageId}/content`, { 
                page_content: newBlocks 
            });
            setPageContent(newBlocks);
            alert('Контент сторінки успішно збережено!');
        } catch (error) {
            console.error('Помилка збереження контенту:', error);
            alert('Помилка збереження контенту.');
        }
    }, [pageId]);

    if (loading) return <div>Завантаження панелі управління...</div>;
    if (error) return <div className="bg-danger-light text-danger p-3">{error}</div>;
    if (!siteData) return <div className="text-danger p-3">Сайт не знайдено.</div>;
    
    const hasShopBlocks = Array.isArray(pageContent) && pageContent.some(
        block => block.type === 'catalog_grid' || block.type === 'categories'
    );

    return (
        <div style={{ maxWidth: '1200px', margin: 'auto' }}>
            <h1>Панель управління сайтом: {siteData.title}</h1>
            <p className="text-secondary">Шлях: <code>{siteData.site_path}</code></p>

            <div style={{ borderBottom: '1px solid var(--platform-border-color)', marginBottom: '2rem' }}>
                <button style={tabStyle(activeTab === 'editor')} onClick={() => setActiveTab('editor')}>Редактор Блоків</button>
                <button style={tabStyle(activeTab === 'shop')} onClick={() => setActiveTab('shop')}>Товари та Категорії</button>
                <button style={tabStyle(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>Налаштування</button>
            </div>

            <div>
                {activeTab === 'editor' && (
                    <BlockEditor 
                        blocks={pageContent} 
                        siteData={siteData}
                        onSave={savePageContent}
                    />
                )}
                {activeTab === 'shop' && (
                    hasShopBlocks ? (
                        <ShopContentTab siteData={siteData} /> 
                    ) : (
                        <div className="card text-warning" style={{padding: '2rem'}}>
                            Ця вкладка стане доступною, коли ви додасте блок **"Сітка товарів"** або **"Категорії"** у Редакторі Блоків.
                        </div>
                    )
                )}
                {activeTab === 'settings' && (
                    <GeneralSettingsTab 
                        siteData={siteData} 
                    />
                )}
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
    color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
    borderBottom: isActive ? '3px solid var(--platform-accent)' : '3px solid transparent',
});

export default SiteDashboardPage;