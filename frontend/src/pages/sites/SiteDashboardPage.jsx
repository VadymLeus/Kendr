// frontend/src/pages/sites/SiteDashboardPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import apiClient from '../../services/api';
import BlockEditor from '../../features/editor/BlockEditor';
import GeneralSettingsTab from '../../features/sites/tabs/GeneralSettingsTab';
import ShopContentTab from '../../features/sites/tabs/ShopContentTab';
import PagesSettingsTab from '../../features/sites/tabs/PagesSettingsTab';
import EditorSidebar from '../../features/editor/EditorSidebar';
import ThemeSettingsTab from '../../features/sites/tabs/ThemeSettingsTab';
import SubmissionsTab from '../../features/sites/tabs/SubmissionsTab';
import DashboardHeader from '../../components/layout/DashboardHeader'; 
import { 
    generateBlockId, 
    getDefaultBlockData 
} from '../../features/editor/editorConfig';
import { 
    updateBlockDataByPath, 
    removeBlockByPath, 
    addBlockByPath, 
    moveBlock,
    handleDrop
} from '../../features/editor/blockUtils';

const SiteDashboardPage = () => {
    const { site_path } = useParams();
    const { siteData, isSiteLoading } = useOutletContext();
    
    const [activeTab, setActiveTab] = useState('editor');
    const [blocks, setBlocks] = useState([]);
    const [currentPageId, setCurrentPageId] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [currentPageName, setCurrentPageName] = useState('');
    const [selectedBlockPath, setSelectedBlockPath] = useState(null);
    const [allPages, setAllPages] = useState([]);
    const [collapsedBlocks, setCollapsedBlocks] = useState([]);

    useEffect(() => {
        if (siteData && siteData.page) {
            setCurrentPageId(siteData.page.id);
            setBlocks(siteData.page.block_content || []);
            setCurrentPageName(siteData.page.name || 'Головна');
            setIsPageLoading(false);

            apiClient.get(`/sites/${siteData.id}/pages`)
                .then(res => setAllPages(res.data))
                .catch(err => console.error("Не вдалося завантажити список сторінок", err));

        } else if (!isSiteLoading) {
            setIsPageLoading(false);
            console.error("Дані сайту завантажені, але головна сторінка відсутня.");
        }
    }, [siteData, isSiteLoading]);

    const toggleCollapse = (blockId) => {
        setCollapsedBlocks(prev => 
            prev.includes(blockId)
                ? prev.filter(id => id !== blockId) 
                : [...prev, blockId]
        );
    };
    
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
        if (currentPageId === pageId) return;
        setCurrentPageId(pageId);
        fetchPageContent(pageId);
        setSelectedBlockPath(null);
    };

    const refreshPageList = () => {
        if (siteData) {
             apiClient.get(`/sites/${siteData.id}/pages`)
                .then(res => setAllPages(res.data))
                .catch(err => console.error("Не вдалося оновити список сторінок", err));
        }
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
        <div>
            <DashboardHeader
                siteData={siteData}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div>
                {activeTab === 'editor' && (
                    <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
                        <div style={{ flex: 1, minWidth: 0, background: 'var(--platform-bg)' }}>
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
                                    <BlockEditor 
                                        blocks={blocks} 
                                        siteData={siteData}
                                        onAddBlock={handleAddBlock}
                                        onMoveBlock={handleMoveBlock}
                                        onDropBlock={handleDropBlock}
                                        onDeleteBlock={handleDeleteBlock}
                                        onSelectBlock={handleSelectBlock}
                                        selectedBlockPath={selectedBlockPath}
                                        collapsedBlocks={collapsedBlocks}
                                        onToggleCollapse={toggleCollapse}
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
                            allPages={allPages}
                            currentPageId={currentPageId}
                            onSelectPage={handleEditPage}
                        />
                    </div>
                )}
                
                <div style={{ 
                    padding: activeTab !== 'editor' ? '2rem' : '0',
                    maxWidth: activeTab !== 'editor' ? '1200px' : 'none',
                    margin: activeTab !== 'editor' ? 'auto' : '0'
                }}>
                    {activeTab === 'pages' && (
                        <PagesSettingsTab 
                            siteId={siteData.id} 
                            onEditPage={handleEditPage}
                            onPageUpdate={refreshPageList}
                        />
                    )}
                    {activeTab === 'shop' && (
                        <ShopContentTab siteData={siteData} />
                    )}
                    {activeTab === 'theme' && (
                        <ThemeSettingsTab siteData={siteData} />
                    )}
                    {activeTab === 'submissions' && (
                        <SubmissionsTab siteId={siteData.id} />
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