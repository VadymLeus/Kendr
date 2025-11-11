// frontend/src/features/sites/SiteDashboardPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockEditor from '../../components/editor/BlockEditor';
import BlockSettingsModal from '../../components/editor/BlockSettingsModal';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import ShopContentTab from './tabs/ShopContentTab';
import PagesSettingsTab from './tabs/PagesSettingsTab';
import EditorSidebar from '../../components/editor/EditorSidebar';
import { 
    BLOCK_LIBRARY, 
    generateBlockId, 
    getDefaultBlockData 
} from '../../components/editor/editorConfig'; // 👈 НОВИЙ ІМПОРТ
import { 
    updateBlockDataByPath, 
    removeBlockByPath, 
    addBlockByPath, 
    moveBlock,
    handleDrop,
    findBlockByPath
} from '../../components/editor/blockUtils';

const SiteDashboardPage = () => {
    const { site_path } = useParams();
    const { siteData, isSiteLoading } = useOutletContext();
    
    const [activeTab, setActiveTab] = useState('editor');
    const [blocks, setBlocks] = useState([]);
    const [currentPageId, setCurrentPageId] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [currentPageName, setCurrentPageName] = useState('');
    
    // Стан для модального вікна налаштувань
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [currentBlockPath, setCurrentBlockPath] = useState(null);

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

    // Callback для переміщення блоків
    const handleMoveBlock = useCallback((dragPath, hoverPath) => {
        setBlocks(prevBlocks => moveBlock(prevBlocks, dragPath, hoverPath));
    }, []);

    // Callback для drop
    const handleDropBlock = useCallback((dragItem, dropZonePath) => {
        setBlocks(prevBlocks => handleDrop(prevBlocks, dragItem, dropZonePath));
    }, []);

    // Callback для додавання блоків
    const handleAddBlock = useCallback((path, type, presetData = {}) => {
        const newBlock = {
            block_id: generateBlockId(),
            type,
            data: getDefaultBlockData(type, presetData),
        };
        setBlocks(prevBlocks => addBlockByPath(prevBlocks, newBlock, path));
    }, []);

    // Callback для видалення блоків
    const handleDeleteBlock = useCallback((path) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей блок?')) return;
        setBlocks(prevBlocks => removeBlockByPath(prevBlocks, path));
    }, []);

    // Callback для редагування блоків
    const handleEditBlock = useCallback((path) => {
        setCurrentBlockPath(path);
        setIsSettingsOpen(true);
    }, []);

    // Callback для збереження налаштувань блоку
    const handleSaveBlockSettings = useCallback((updatedData) => {
        if (!currentBlockPath) return;
        setBlocks(prevBlocks => updateBlockDataByPath(prevBlocks, currentBlockPath, updatedData));
        setCurrentBlockPath(null);
        setIsSettingsOpen(false);
    }, [currentBlockPath]);

    // Знаходимо поточний блок для модального вікна
    const currentBlockToEdit = currentBlockPath ? findBlockByPath(blocks, currentBlockPath) : null;

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

    return (
        <div style={{ margin: 'auto' }}>
            <div style={{ 
                maxWidth: '1200px', 
                margin: 'auto',
                padding: '2rem 2rem 0 2rem' 
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
            </div>

            <div>
                {activeTab === 'editor' && (
                    <div style={{ display: 'flex' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {isPageLoading ? (
                                <p style={{color: 'var(--site-text-secondary)', textAlign: 'center'}}>Завантаження редактора...</p>
                            ) : (
                                <>
                                    <h2 style={{
                                        color: 'var(--site-text-primary)', 
                                        marginBottom: '1.5rem',
                                        paddingLeft: '2rem'
                                    }}>
                                        Редагування сторінки: "{currentPageName}"
                                    </h2>
                                    <BlockEditor 
                                        blocks={blocks} 
                                        siteData={siteData}
                                        onSave={savePageContent}
                                        onAddBlock={handleAddBlock}
                                        onMoveBlock={handleMoveBlock}
                                        onDropBlock={handleDropBlock}
                                        onDeleteBlock={handleDeleteBlock}
                                        onEditBlock={handleEditBlock}
                                    />
                                </>
                            )}
                        </div>
                        <EditorSidebar
                            blocks={blocks}
                            siteData={siteData}
                            onMoveBlock={handleMoveBlock}
                            onEditBlock={handleEditBlock}
                            onDeleteBlock={handleDeleteBlock}
                        />
                    </div>
                )}
                
                <div style={{ maxWidth: '1200px', margin: 'auto', padding: '0 2rem 2rem 2rem' }}>
                    {activeTab === 'pages' && (
                        <PagesSettingsTab 
                            siteId={siteData.id} 
                            onEditPage={handleEditPage} 
                        />
                    )}
                    {activeTab === 'shop' && (
                        <ShopContentTab siteData={siteData} />
                    )}
                    {activeTab === 'settings' && (
                        <GeneralSettingsTab siteData={siteData} />
                    )}
                </div>
            </div>

            {/* Модальне вікно налаштувань тепер живе тут, на рівні дашборду */}
            {isSettingsOpen && currentBlockToEdit && (
                <BlockSettingsModal
                    isOpen={isSettingsOpen}
                    block={currentBlockToEdit}
                    siteData={siteData}
                    onSave={handleSaveBlockSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}
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