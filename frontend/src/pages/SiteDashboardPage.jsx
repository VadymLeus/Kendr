// frontend/src/pages/SiteDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import apiClient from '../common/services/api';
import { toast } from 'react-toastify';

import BlockEditor from '../modules/site-editor/core/BlockEditor';
import EditorSidebar from '../modules/site-editor/components/EditorSidebar';
import PagesSettingsTab from '../modules/site-dashboard/features/tabs/PagesSettingsTab';
import ShopContentTab from '../modules/site-dashboard/features/tabs/ShopContentTab';
import ThemeSettingsTab from '../modules/site-dashboard/features/tabs/ThemeSettingsTab';
import SubmissionsTab from '../modules/site-dashboard/features/tabs/SubmissionsTab';
import GeneralSettingsTab from '../modules/site-dashboard/features/tabs/GeneralSettingsTab';
import DashboardHeader from '../modules/site-dashboard/components/DashboardHeader';
import useHistory from '../common/hooks/useHistory';

import { 
    generateBlockId, 
    getDefaultBlockData 
} from '../modules/site-editor/core/editorConfig';
import { 
    updateBlockDataByPath, 
    removeBlockByPath, 
    addBlockByPath, 
    moveBlock,
    handleDrop
} from '../modules/site-editor/core/blockUtils';

const SiteDashboardPage = () => {
    const { site_path } = useParams();
    const { siteData, setSiteData, isSiteLoading } = useOutletContext();
    
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem(`editor_active_tab_${site_path}`) || 'editor';
    });
    
    useEffect(() => {
        if (site_path) {
            localStorage.setItem(`editor_active_tab_${site_path}`, activeTab);
        }
    }, [activeTab, site_path]);

    const [blocks, setBlocks, undo, redo, { canUndo, canRedo }] = useHistory([]);
    
    const [currentPageId, setCurrentPageId] = useState(() => {
        const savedPage = localStorage.getItem(`last_edited_page_${site_path}`);
        if (savedPage === 'header' || savedPage === 'footer') {
            return savedPage;
        }
        return savedPage ? parseInt(savedPage, 10) : null;
    });

    const [isPageLoading, setIsPageLoading] = useState(true);
    const [selectedBlockPath, setSelectedBlockPath] = useState(null);
    const [allPages, setAllPages] = useState([]);
    
    const [collapsedBlocks, setCollapsedBlocks] = useState(() => {
        if (!site_path) return [];
        
        let targetId = null;
        const savedPage = localStorage.getItem(`last_edited_page_${site_path}`);
        
        if (savedPage === 'header' || savedPage === 'footer') {
            targetId = savedPage;
        } else if (savedPage) {
            targetId = parseInt(savedPage, 10);
        }

        if (targetId) {
            const key = `collapsed_blocks_${site_path}_${targetId}`;
            try {
                const savedState = localStorage.getItem(key);
                return savedState ? JSON.parse(savedState) : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    useEffect(() => {
        if (site_path && currentPageId) {
            const key = `collapsed_blocks_${site_path}_${currentPageId}`;
            localStorage.setItem(key, JSON.stringify(collapsedBlocks));
        }
    }, [collapsedBlocks, site_path, currentPageId]);

    const [isSaving, setIsSaving] = useState(false);
    const [isThemeSaving, setIsThemeSaving] = useState(false);
    
    const [componentsSaving, setComponentsSaving] = useState({
        pages: false,
        store: false,
        crm: false,
        settings: false
    });

    const isFooterMode = currentPageId === 'footer';
    const isHeaderMode = currentPageId === 'header';

    const setComponentSaving = useCallback((component, isSaving) => {
        setComponentsSaving(prev => ({
            ...prev,
            [component]: isSaving
        }));
    }, []);

    useEffect(() => {
        const anyComponentSaving = Object.values(componentsSaving).some(saving => saving);
        setIsSaving(anyComponentSaving);
    }, [componentsSaving]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (document.querySelector('.ReactModal__Content')) return; 

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                if (e.shiftKey) {
                    e.preventDefault();
                    redo();
                } else {
                    e.preventDefault();
                    undo();
                }
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const fetchPageContent = async (pageId) => {
        setIsPageLoading(true);
        try {
            let content = [];
            if (pageId === 'footer' || pageId === 'header') {
                const res = await apiClient.get(`/sites/${siteData.site_path}`);
                const contentKey = pageId === 'footer' ? 'footer_content' : 'header_content';
                content = res.data[contentKey] || [];
                if (typeof content === 'string') {
                    try { 
                        content = JSON.parse(content); 
                    } catch (e) {
                        content = [];
                    }
                }
                
                if (pageId === 'header' && (!content || content.length === 0)) {
                    content = [{ 
                        block_id: generateBlockId(), 
                        type: 'header', 
                        data: getDefaultBlockData('header') 
                    }];
                }
            } else {
                const response = await apiClient.get(`/pages/${pageId}`);
                content = response.data.block_content || [];
                if (typeof content === 'string') {
                    try {
                        content = JSON.parse(content);
                    } catch (e) {
                        content = [];
                    }
                }
            }
            setBlocks(content, false);
        } catch (err) {
            console.error('Помилка завантаження сторінки:', err);
            if (err.response && err.response.status === 404) {
               localStorage.removeItem(`last_edited_page_${site_path}`);
               refreshPageList();
            }
            toast.error('Не вдалося завантажити вміст сторінки');
        } finally {
            setIsPageLoading(false);
        }
    };

    const handleEditPage = (pageId) => {
        if (pageId === currentPageId && !isPageLoading && blocks.length > 0) return;
        
        setCurrentPageId(pageId);
        localStorage.setItem(`last_edited_page_${site_path}`, pageId);
        
        try {
            const key = `collapsed_blocks_${site_path}_${pageId}`;
            const savedState = localStorage.getItem(key);
            setCollapsedBlocks(savedState ? JSON.parse(savedState) : []);
        } catch (e) {
            setCollapsedBlocks([]);
        }

        fetchPageContent(pageId);
        setSelectedBlockPath(null);
    };

    useEffect(() => {
        if (siteData) {
            if (!allPages.length) {
                apiClient.get(`/sites/${siteData.id}/pages`)
                   .then(res => {
                        const pages = res.data;
                        setAllPages(pages);
                        
                        if (pages.length > 0) {
                            let targetId = currentPageId;
                            
                            const isSystem = targetId === 'header' || targetId === 'footer';
                            const pageExists = pages.find(p => p.id === targetId);

                            if (!targetId || (!isSystem && !pageExists)) {
                                const home = pages.find(p => p.is_homepage) || pages[0];
                                targetId = home.id;
                            }
                            
                            handleEditPage(targetId);
                        }
                    })
                    .catch(console.error);
            }
        }
    }, [siteData]);

    const handleMoveBlock = (drag, hover) => setBlocks(prev => moveBlock(prev, drag, hover));
    const handleDropBlock = (item, path) => setBlocks(prev => handleDrop(prev, item, path));
    
    const handleAddBlock = (path, type, preset) => {
        const newBlock = { 
            block_id: generateBlockId(), 
            type, 
            data: getDefaultBlockData(type, preset) 
        };
        setBlocks(prev => addBlockByPath(prev, newBlock, path));
    };
    
    const handleDeleteBlock = (path) => {
        setBlocks(prev => removeBlockByPath(prev, path));
        setSelectedBlockPath(null);
    };
    
    const handleUpdateBlockData = (path, data, addToHistory = true) => {
        setBlocks(prev => updateBlockDataByPath(prev, path, data), addToHistory);
    };
    
    const savePageContent = async (currentBlocks) => {
        const blocksToSave = currentBlocks || blocks;
        setIsSaving(true);

        try {
            if (currentPageId === 'header') {
                await apiClient.put(`/sites/${siteData.site_path}/settings`, {
                    header_content: JSON.stringify(blocksToSave)
                });
            } else if (currentPageId === 'footer') {
                await apiClient.put(`/sites/${siteData.site_path}/settings`, {
                    footer_content: JSON.stringify(blocksToSave)
                });
            } else {
                await apiClient.put(`/pages/${currentPageId}/content`, {
                    block_content: blocksToSave
                });
            }

        } catch (error) {
            console.error("Помилка при збереженні:", error);
            toast.error('❌ Не вдалося зберегти зміни. Перевірте підключення до інтернету.');
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const saveThemeSettings = async (updatedData) => {
        setIsThemeSaving(true);
        
        try {
            const updateData = {};
            
            Object.keys(updatedData).forEach(key => {
                if (updatedData[key] !== siteData[key]) {
                    updateData[key] = updatedData[key];
                }
            });
            
            if (Object.keys(updateData).length > 0) {
                await apiClient.put(`/sites/${siteData.site_path}/settings`, updateData);
                
                setSiteData(prev => ({ ...prev, ...updateData }));
            }
        } catch (error) {
            console.error("Помилка при збереженні теми:", error);
            toast.error('❌ Не вдалося зберегти налаштування теми');
        } finally {
            setTimeout(() => setIsThemeSaving(false), 500);
        }
    };

    const handleSiteDataUpdate = (newData) => {
        saveThemeSettings(newData);
    };

    const refreshPageList = () => {
        apiClient.get(`/sites/${siteData.id}/pages`)
            .then(response => {
                setAllPages(response.data);
                if (typeof currentPageId === 'number' && !response.data.find(p => p.id === currentPageId)) {
                     const home = response.data.find(p => p.is_homepage) || response.data[0];
                     if(home) handleEditPage(home.id);
                }
            })
            .catch(console.error);
    };

    const toggleBlockCollapse = (blockId) => {
        setCollapsedBlocks(prev => 
            prev.includes(blockId) 
                ? prev.filter(id => id !== blockId) 
                : [...prev, blockId]
        );
    };

    const handleSavingChange = useCallback((isSaving) => {
        if (activeTab === 'pages') {
            setComponentSaving('pages', isSaving);
        } else if (activeTab === 'store') {
            setComponentSaving('store', isSaving);
        } else if (activeTab === 'crm') {
            setComponentSaving('crm', isSaving);
        } else if (activeTab === 'settings') {
            setComponentSaving('settings', isSaving);
        }
    }, [activeTab, setComponentSaving]);

    if (isSiteLoading || !siteData) {
        return <div className="p-8 text-center" style={{color: 'var(--platform-text-secondary)'}}>
            Завантаження...
        </div>;
    }

    return (
        <div className="editor-layout-container" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            overflow: 'hidden' 
        }}>
            <DashboardHeader
                siteData={siteData}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                undo={undo}
                redo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                isSaving={isSaving || isThemeSaving}
            />

            <div style={{ 
                flex: 1, 
                display: 'flex', 
                overflow: 'hidden', 
                position: 'relative' 
            }}>
                
                {activeTab === 'editor' && (
                    <>
                        <div className="editor-canvas-scroll-area" style={{ 
                            flex: 1, 
                            overflowY: 'auto', 
                            background: 'var(--platform-bg)' 
                        }}>
                            <div style={{ paddingBottom: '100px' }}>
                                {isPageLoading ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: '300px' 
                                    }}>
                                        <div>Завантаження сторінки...</div>
                                    </div>
                                ) : (
                                    <BlockEditor 
                                        blocks={blocks} 
                                        siteData={siteData}
                                        onAddBlock={handleAddBlock}
                                        onMoveBlock={handleMoveBlock}
                                        onDropBlock={handleDropBlock}
                                        onDeleteBlock={handleDeleteBlock}
                                        onSelectBlock={setSelectedBlockPath}
                                        selectedBlockPath={selectedBlockPath}
                                        collapsedBlocks={collapsedBlocks}
                                        onToggleCollapse={toggleBlockCollapse}
                                        isHeaderMode={isHeaderMode}
                                    />
                                )}
                            </div>
                        </div>
                        <EditorSidebar
                            blocks={blocks}
                            siteData={siteData}
                            onMoveBlock={handleMoveBlock}
                            onDeleteBlock={handleDeleteBlock}
                            selectedBlockPath={selectedBlockPath}
                            onSelectBlock={setSelectedBlockPath}
                            onUpdateBlockData={handleUpdateBlockData}
                            onSave={savePageContent}
                            allPages={[
                                { id: 'header', name: '🔝 Глобальний Хедер' },
                                ...allPages, 
                                { id: 'footer', name: '🔻 Глобальний Футер' }
                            ]}
                            currentPageId={currentPageId}
                            onSelectPage={(id) => handleEditPage(id)}
                            isHeaderMode={isHeaderMode}
                        />
                    </>
                )}

                {activeTab !== 'editor' && (
                    <div className="editor-canvas-scroll-area" style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        padding: '2rem', 
                        background: 'var(--platform-bg)' 
                    }}>
                        <div style={{ 
                            maxWidth: (activeTab === 'store' || activeTab === 'crm') ? '100%' : '1000px', 
                            margin: '0 auto'
                        }}>
                            {activeTab === 'pages' && (
                                <PagesSettingsTab 
                                    siteId={siteData.id} 
                                    onEditPage={(id) => { 
                                        handleEditPage(id); 
                                        setActiveTab('editor'); 
                                    }}
                                    onEditFooter={() => { 
                                        handleEditPage('footer'); 
                                        setActiveTab('editor'); 
                                    }}
                                    onEditHeader={() => { 
                                        handleEditPage('header'); 
                                        setActiveTab('editor'); 
                                    }}
                                    onPageUpdate={refreshPageList}
                                    onSavingChange={handleSavingChange}
                                />
                            )}
                            {activeTab === 'store' && (
                                <ShopContentTab 
                                    siteData={siteData} 
                                    onSavingChange={handleSavingChange}
                                />
                            )}
                            {activeTab === 'theme' && (
                                <ThemeSettingsTab 
                                    siteData={siteData} 
                                    onUpdate={handleSiteDataUpdate}
                                    isSaving={isThemeSaving}
                                />
                            )}
                            {activeTab === 'crm' && (
                                <SubmissionsTab 
                                    siteId={siteData.id} 
                                    onSavingChange={handleSavingChange}
                                />
                            )}
                            {activeTab === 'settings' && (
                                <GeneralSettingsTab 
                                    siteData={siteData} 
                                    onUpdate={handleSiteDataUpdate}
                                    onSavingChange={handleSavingChange}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteDashboardPage;