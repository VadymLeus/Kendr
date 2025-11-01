// frontend/src/features/sites/SiteDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockEditor from '../../components/editor/BlockEditor';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import SiteProductsTab from './tabs/SiteProductsTab';

const SiteDashboardPage = () => {
    const { site_path: sitePath } = useParams();
    const navigate = useNavigate();
    const [siteData, setSiteData] = useState(null);
    const [pageContent, setPageContent] = useState([]);
    const [pageId, setPageId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('editor');

    const fetchSiteData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/sites/${sitePath}`);
            const data = response.data;
            
            setSiteData(data);
            if (data.page_content) {
                if (Array.isArray(data.page_content)) {
                    setPageContent(data.page_content);
                } else {
                    // Це спрацює, якщо з DB прийде щось дивне (не null, але і не масив)
                    console.warn("page_content отримано, але це не масив:", data.page_content);
                    setPageContent([]);
                }
            } else {
                setPageContent([]);
            }
            
            setPageId(data.page_id);
            
        } catch (error) {
            console.error("Помилка завантаження даних сайту:", error);
            if (error.response?.status === 404) {
                navigate('/404');
            }
        } finally {
            setLoading(false);
        }
    }, [sitePath, navigate]);

    useEffect(() => {
        fetchSiteData();
    }, [fetchSiteData]);

    const handleContentSave = async (newContent) => {
        if (!pageId) {
            alert("Помилка: ID сторінки не знайдено.");
            return;
        }
        
        try {
            await apiClient.put(`/sites/page/${pageId}/content`, { 
                page_content: newContent
            });
            setPageContent(newContent);
            alert('Зміни контенту успішно збережено!');
        } catch (error) {
            console.error("Помилка збереження контенту:", error);
            alert('Помилка збереження контенту.');
        }
    };
    
    const handleSettingsUpdate = (newSettings) => {
        setSiteData(prev => ({ ...prev, ...newSettings }));
    };

    if (loading) return <div className="p-4">Завантаження панелі управління...</div>;
    if (!siteData) return <div className="p-4 text-danger">Помилка: дані сайту не завантажені.</div>;

    const hasShopBlocks = Array.isArray(pageContent) && pageContent.some(
        block => block.type === 'catalog_grid' || block.type === 'categories'
    );

    const tabs = [
        { id: 'editor', label: 'Контент (Блоки)', available: true },
        { id: 'shop', label: 'Товари та Категорії', available: hasShopBlocks },
        { id: 'settings', label: 'Загальні Налаштування', available: true },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'editor':
                return (
                    <BlockEditor
                        blocks={pageContent}
                        siteData={siteData}
                        onSave={handleContentSave}
                    />
                );
            case 'shop':
                if (!hasShopBlocks) {
                    return <div className="p-4 text-warning">Ця вкладка стане доступною, коли ви додате блок "Сітка товарів" або "Категорії" у редакторі контенту.</div>;
                }
                return <SiteProductsTab siteData={siteData} />;
            case 'settings':
                return <GeneralSettingsTab siteData={siteData} onUpdate={handleSettingsUpdate} />;
            default:
                return null;
        }
    };

    return (
        <div className="site-dashboard-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
            <h1 className="mb-4">Управління сайтом: {siteData.title}</h1>
            <p className="text-secondary">Шлях: <code>{siteData.site_path}</code> | ID: <code>{siteData.id}</code></p>
            
            <div className="tabs-container mb-4">
                <div className="nav nav-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--platform-border-color)' }}>
                    {tabs.filter(tab => tab.available).map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                cursor: 'pointer',
                                borderTopLeftRadius: '8px', 
                                borderTopRightRadius: '8px',
                                padding: '10px 15px',
                                border: 'none',
                                background: activeTab === tab.id ? 'var(--platform-card-bg)' : 'transparent',
                                borderBottom: activeTab === tab.id ? '3px solid var(--platform-accent)' : '3px solid transparent',
                                color: activeTab === tab.id ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                fontWeight: activeTab === tab.id ? 'bold' : 'normal'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default SiteDashboardPage;