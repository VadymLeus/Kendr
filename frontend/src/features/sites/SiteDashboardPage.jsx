// frontend/src/features/sites/SiteDashboardPage.jsx
import React, { useState, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockEditor from '../../components/editor/BlockEditor';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import ShopContentTab from './tabs/ShopContentTab';

const SiteDashboardPage = () => {
    const { site_path } = useParams();
    const navigate = useNavigate();
    
    const { siteData, isSiteLoading } = useOutletContext();
    
    const [activeTab, setActiveTab] = useState('editor');
    const pageContent = siteData?.page_content || [];
    const pageId = siteData?.page_id || null;
    const [pageBlocks, setPageBlocks] = useState(pageContent);

    React.useEffect(() => {
        setPageBlocks(siteData?.page_content || []);
    }, [siteData?.page_content]);

    const savePageContent = useCallback(async (newBlocks) => {
        if (!pageId) {
            alert("Помилка: ID сторінки не знайдено.");
            return;
        }
        try {
            await apiClient.put(`/sites/page/${pageId}/content`, { 
                page_content: newBlocks 
            });
            setPageBlocks(newBlocks);
            alert('Контент сторінки успішно збережено!');
        } catch (error) {
            console.error('Помилка збереження контенту:', error);
            alert('Помилка збереження контенту.');
        }
    }, [pageId]);

    if (isSiteLoading) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            Завантаження панелі управління...
        </div>
    );
    
    if (!siteData) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            Сайт не знайдено.
        </div>
    );
    
    const hasShopBlocks = Array.isArray(pageBlocks) && pageBlocks.some(
        block => block.type === 'catalog_grid' || block.type === 'categories'
    );

    return (
        <div style={{ 
            maxWidth: '1200px', 
            margin: 'auto',
            padding: '2rem'
        }}>
            <h1 style={{ color: 'var(--site-text-primary)', marginBottom: '1rem' }}>
                Панель управління сайтом: {siteData.title}
            </h1>
            <p style={{ color: 'var(--site-text-secondary)', marginBottom: '2rem' }}>
                Шлях: <code style={{ 
                    background: 'var(--site-card-bg)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    color: 'var(--site-text-primary)'
                }}>{siteData.site_path}</code>
            </p>

            <div style={{ 
                borderBottom: '1px solid var(--site-border-color)', 
                marginBottom: '2rem' 
            }}>
                <button style={tabStyle(activeTab === 'editor')} onClick={() => setActiveTab('editor')}>
                    Редактор Блоків
                </button>
                <button style={tabStyle(activeTab === 'shop')} onClick={() => setActiveTab('shop')}>
                    Товари та Категорії
                </button>
                <button style={tabStyle(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
                    Налаштування
                </button>
            </div>

            <div>
                {activeTab === 'editor' && (
                    <BlockEditor 
                        blocks={pageBlocks}
                        siteData={siteData}
                        onSave={savePageContent}
                    />
                )}
                {activeTab === 'shop' && (
                    hasShopBlocks ? (
                        <ShopContentTab siteData={siteData} /> 
                    ) : (
                        <div style={{
                            padding: '2rem', 
                            background: 'var(--site-card-bg)',
                            color: 'var(--site-text-primary)',
                            borderRadius: '8px',
                            border: '1px solid var(--site-border-color)',
                            textAlign: 'center'
                        }}>
                            Ця вкладка стане доступною, коли ви додасте блок <strong>"Сітка товарів"</strong> або <strong>"Категорії"</strong> у Редакторі Блоків.
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
    color: isActive ? 'var(--site-accent)' : 'var(--site-text-secondary)',
    borderBottom: isActive ? '3px solid var(--site-accent)' : '3px solid transparent',
    marginBottom: '-1px',
    transition: 'all 0.2s ease',
    ':hover': {
        color: 'var(--site-accent)',
        backgroundColor: 'var(--site-card-bg)'
    }
});

export default SiteDashboardPage;