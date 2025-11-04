// frontend/src/features/sites/SiteDashboardPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockEditor from '../../components/editor/BlockEditor';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import ShopContentTab from './tabs/ShopContentTab';
import PagesSettingsTab from './tabs/PagesSettingsTab';

const SiteDashboardPage = () => {
    const { site_path } = useParams();
    const { siteData, isSiteLoading } = useOutletContext();
    
    const [activeTab, setActiveTab] = useState('editor');
    const [blocks, setBlocks] = useState([]);
    const [currentPageId, setCurrentPageId] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [currentPageName, setCurrentPageName] = useState('');

    // Встановлення головної сторінки після завантаження даних сайту
    useEffect(() => {
        if (siteData && siteData.page) {
            setCurrentPageId(siteData.page.id);
            setBlocks(siteData.page.block_content || []);
            setCurrentPageName(siteData.page.name || 'Головна');
            setIsPageLoading(false);
        } else if (!isSiteLoading) {
            setIsPageLoading(false);
            console.error("Дані сайту завантажені, але головна сторінка відсутня.");
        }
    }, [siteData, isSiteLoading]);

    // Завантаження іншої сторінки
    const fetchPageContent = async (pageId) => {
        if (siteData && siteData.page && siteData.page.id === pageId) {
            setBlocks(siteData.page.block_content || []);
            setCurrentPageName(siteData.page.name || 'Головна');
            setIsPageLoading(false);
            return;
        }

        setIsPageLoading(true);
        try {
            const response = await apiClient.get(`/pages/${pageId}`);
            setBlocks(response.data.block_content || []);
            setCurrentPageName(response.data.name || '');
        } catch (err) {
            alert('Помилка під час завантаження сторінки.');
            setBlocks([]);
        } finally {
            setIsPageLoading(false);
        }
    };
    
    // Викликається при редагуванні сторінки у вкладці "Сторінки"
    const handleEditPage = (pageId) => {
        setCurrentPageId(pageId);
        fetchPageContent(pageId);
        setActiveTab('editor');
    };

    // Збереження контенту сторінки
    const savePageContent = useCallback(async (newBlocks) => {
        if (!currentPageId) {
            alert("Помилка: не обрано сторінку.");
            return;
        }
        try {
            await apiClient.put(`/pages/${currentPageId}/content`, { 
                block_content: newBlocks 
            });
            setBlocks(newBlocks);
            alert('Контент сторінки успішно збережено!');
        } catch (error) {
            console.error('Помилка збереження контенту:', error);
            alert('Помилка під час збереження.');
        }
    }, [currentPageId]);

    if (isSiteLoading) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--site-text-secondary)' }}>
            Завантаження панелі керування...
        </div>
    );
    
    if (!siteData) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--site-text-secondary)' }}>
            Сайт не знайдено.
        </div>
    );
    
    const hasShopBlocks = Array.isArray(siteData.page?.block_content) && siteData.page.block_content.some(
        block => block.type === 'catalog_grid' || block.type === 'categories'
    );

    return (
        <div style={{ 
            maxWidth: '1200px', 
            margin: 'auto',
            padding: '2rem' 
        }}>
            <h1 style={{ color: 'var(--site-text-primary)', marginBottom: '1rem' }}>
                Панель керування сайтом: {siteData.title}
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
                marginBottom: '2rem',
                display: 'flex',
                flexWrap: 'wrap'
            }}>
                <button style={tabStyle(activeTab === 'editor')} onClick={() => setActiveTab('editor')}>
                    Редактор сторінок
                </button>
                <button style={tabStyle(activeTab === 'pages')} onClick={() => setActiveTab('pages')}>
                    Сторінки
                </button>
                <button style={tabStyle(activeTab === 'shop')} onClick={() => setActiveTab('shop')}>
                    Товари та категорії
                </button>
                <button style={tabStyle(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
                    Налаштування
                </button>
            </div>

            <div>
                {activeTab === 'editor' && (
                    isPageLoading ? (
                        <p style={{color: 'var(--site-text-secondary)', textAlign: 'center'}}>Завантаження редактора...</p>
                    ) : (
                        <>
                            <h2 style={{color: 'var(--site-text-primary)', marginBottom: '1.5rem'}}>
                                Редагування сторінки: "{currentPageName}"
                            </h2>
                            <BlockEditor 
                                blocks={blocks} 
                                siteData={siteData}
                                onSave={savePageContent}
                            />
                        </>
                    )
                )}
                {activeTab === 'pages' && (
                    <PagesSettingsTab 
                        siteId={siteData.id} 
                        onEditPage={handleEditPage} 
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
                            Ця вкладка з’явиться, коли буде додано блок <strong>"Сітка товарів"</strong> або <strong>"Категорії"</strong> у редакторі (на головній сторінці).
                        </div>
                    )
                )}
                {activeTab === 'settings' && (
                    <GeneralSettingsTab siteData={siteData} />
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
    whiteSpace: 'nowrap'
});

export default SiteDashboardPage;
