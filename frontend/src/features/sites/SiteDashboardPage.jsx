// frontend/src/features/sites/SiteDashboardPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockEditor from '../../components/editor/BlockEditor';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import ShopContentTab from './tabs/ShopContentTab';
import PagesSettingsTab from './tabs/PagesSettingsTab';
import EditorSidebar from '../../components/editor/EditorSidebar';
import ThemeSettingsTab from './tabs/ThemeSettingsTab';
import { 
    generateBlockId, 
    getDefaultBlockData 
} from '../../components/editor/editorConfig';
import { 
    updateBlockDataByPath, 
    removeBlockByPath, 
    addBlockByPath, 
    moveBlock,
    handleDrop
} from '../../components/editor/blockUtils';

const tabStyle = (isActive) => ({
    padding: '1rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
    borderBottom: isActive ? '3px solid var(--platform-accent)' : '3px solid transparent',
    marginBottom: '-1px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    borderRadius: '4px 4px 0 0'
});

const containerStyles = {
    main: { 
        margin: 'auto',
        minHeight: '100vh',
        background: 'var(--platform-bg)'
    },
    header: { 
        maxWidth: '1200px', 
        margin: 'auto',
        padding: '2rem 2rem 0 2rem' 
    },
    content: { 
        maxWidth: '1200px', 
        margin: 'auto', 
        padding: '0 2rem 2rem 2rem' 
    },
    tabsContainer: {
        borderBottom: '1px solid var(--platform-border-color)', 
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem'
    },
    code: {
        background: 'var(--platform-card-bg)', 
        padding: '0.25rem 0.5rem', 
        borderRadius: '4px',
        color: 'var(--platform-text-primary)',
        fontSize: '0.9rem',
        fontFamily: 'monospace'
    }
};

const SiteDashboardPage = () => {
    const { site_path } = useParams();
    const { siteData, isSiteLoading } = useOutletContext();
    
    const [activeTab, setActiveTab] = useState('editor');
    const [blocks, setBlocks] = useState([]);
    const [currentPageId, setCurrentPageId] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [currentPageName, setCurrentPageName] = useState('');
    const [selectedBlockPath, setSelectedBlockPath] = useState(null);

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
    
    const handleEditPage = (pageId) => {
        setCurrentPageId(pageId);
        fetchPageContent(pageId);
        setActiveTab('editor');
        setSelectedBlockPath(null);
    };

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

    const handleMoveBlock = useCallback((dragPath, hoverPath) => {
        setBlocks(prevBlocks => moveBlock(prevBlocks, dragPath, hoverPath));
    }, []);

    const handleDropBlock = useCallback((dragItem, dropZonePath) => {
        setBlocks(prevBlocks => handleDrop(prevBlocks, dragItem, dropZonePath));
    }, []);

    const handleAddBlock = useCallback((path, type, presetData = {}) => {
        const newBlock = {
            block_id: generateBlockId(),
            type,
            data: getDefaultBlockData(type, presetData),
        };
        setBlocks(prevBlocks => addBlockByPath(prevBlocks, newBlock, path));
    }, []);

    const handleDeleteBlock = useCallback((path) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей блок?')) return;
        setBlocks(prevBlocks => removeBlockByPath(prevBlocks, path));
        setSelectedBlockPath(null);
    }, []);

    const handleSelectBlock = useCallback((path) => {
        setSelectedBlockPath(path);
    }, []);

    const handleUpdateBlockData = useCallback((path, updatedData) => {
        if (!path) return;
        setBlocks(prevBlocks => updateBlockDataByPath(prevBlocks, path, updatedData));
    }, []);

    if (isSiteLoading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--platform-text-secondary)',
            background: 'var(--platform-bg)',
            minHeight: '100vh'
        }}>
            Завантаження панелі керування...
        </div>
    );
    
    if (!siteData) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--platform-text-secondary)',
            background: 'var(--platform-bg)',
            minHeight: '100vh'
        }}>
            Сайт не знайдено.
        </div>
    );

    return (
        <div style={containerStyles.main}>
            <div style={containerStyles.header}>
                <h1 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1rem',
                    fontSize: '1.8rem'
                }}>
                    Панель керування сайтом: {siteData.title}
                </h1>
                <p style={{ 
                    color: 'var(--platform-text-secondary)', 
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    Шлях: <code style={containerStyles.code}>{siteData.site_path}</code>
                </p>

                <div style={containerStyles.tabsContainer}>
                    <button 
                        style={tabStyle(activeTab === 'editor')} 
                        onClick={() => setActiveTab('editor')}
                    >
                        📝 Редактор сторінок
                    </button>
                    <button 
                        style={tabStyle(activeTab === 'pages')} 
                        onClick={() => setActiveTab('pages')}
                    >
                        📄 Сторінки
                    </button>
                    <button 
                        style={tabStyle(activeTab === 'shop')} 
                        onClick={() => setActiveTab('shop')}
                    >
                        🛒 Товари та категорії
                    </button>
                    <button 
                        style={tabStyle(activeTab === 'theme')} 
                        onClick={() => setActiveTab('theme')}
                    >
                        🎨 Тема та Шапка
                    </button>
                    <button 
                        style={tabStyle(activeTab === 'settings')} 
                        onClick={() => setActiveTab('settings')}
                    >
                        ⚙️ Налаштування
                    </button>
                </div>
            </div>

            <div>
                {activeTab === 'editor' && (
                    <div style={{ display: 'flex', minHeight: '600px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {isPageLoading ? (
                                <p style={{
                                    color: 'var(--platform-text-secondary)', 
                                    textAlign: 'center',
                                    padding: '2rem'
                                }}>
                                    Завантаження редактора...
                                </p>
                            ) : (
                                <>
                                    <h2 style={{
                                        color: 'var(--platform-text-primary)', 
                                        marginBottom: '1.5rem',
                                        padding: '0 2rem 1rem 2rem',
                                        borderBottom: '1px solid var(--platform-border-color)'
                                    }}>
                                        Редагування сторінки: "{currentPageName}"
                                    </h2>
                                    <BlockEditor 
                                        blocks={blocks} 
                                        siteData={siteData}
                                        onAddBlock={handleAddBlock}
                                        onMoveBlock={handleMoveBlock}
                                        onDropBlock={handleDropBlock}
                                        onDeleteBlock={handleDeleteBlock}
                                        onSelectBlock={handleSelectBlock}
                                        selectedBlockPath={selectedBlockPath}
                                    />
                                </>
                            )}
                        </div>
                        <EditorSidebar
                            blocks={blocks}
                            siteData={siteData}
                            onMoveBlock={handleMoveBlock}
                            onDeleteBlock={handleDeleteBlock}
                            selectedBlockPath={selectedBlockPath}
                            onSelectBlock={handleSelectBlock}
                            onUpdateBlockData={handleUpdateBlockData}
                            onSave={savePageContent}
                        />
                    </div>
                )}
                
                <div style={containerStyles.content}>
                    {activeTab === 'pages' && (
                        <PagesSettingsTab 
                            siteId={siteData.id} 
                            onEditPage={handleEditPage} 
                        />
                    )}
                    {activeTab === 'shop' && (
                        <ShopContentTab siteData={siteData} />
                    )}
                    {activeTab === 'theme' && (
                        <ThemeSettingsTab siteData={siteData} />
                    )}
                    {activeTab === 'settings' && (
                        <GeneralSettingsTab siteData={siteData} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiteDashboardPage;