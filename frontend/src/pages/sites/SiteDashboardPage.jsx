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
    handleDrop,
    cloneBlockWithNewIds
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
    const [savedBlocksUpdateTrigger, setSavedBlocksUpdateTrigger] = useState(0);

    const isFooterMode = currentPageId === 'footer';
    const isHeaderMode = currentPageId === 'header';

    useEffect(() => {
        if (siteData) {
            if (siteData.page) {
                setCurrentPageId(siteData.page.id);
                setBlocks(siteData.page.block_content || []);
                setCurrentPageName(siteData.page.name || 'Головна');
                setIsPageLoading(false);
            } else {
                apiClient.get(`/sites/${siteData.id}/pages`)
                    .then(res => {
                        setAllPages(res.data);
                        const homePage = res.data.find(p => p.is_homepage);
                        if (homePage) {
                            setCurrentPageId(homePage.id);
                            return apiClient.get(`/pages/${homePage.id}`);
                        }
                    })
                    .then(res => {
                        if (res && res.data) {
                            setBlocks(res.data.block_content || []);
                            setCurrentPageName(res.data.name);
                            setIsPageLoading(false);
                        }
                    })
                    .catch(err => console.error("Помилка ініціалізації сторінки", err));
            }

            if (!allPages.length) {
                apiClient.get(`/sites/${siteData.id}/pages`)
                    .then(res => setAllPages(res.data))
                    .catch(err => console.error(err));
            }
        }
    }, [siteData, isSiteLoading]);

    const fetchPageContent = async (pageId) => {
        setIsPageLoading(true);
        setBlocks([]);
        
        try {
            if (pageId === 'footer') {
                const res = await apiClient.get(`/sites/${siteData.site_path}`);
                let footerBlocks = res.data.footer_content || [];
                if (typeof footerBlocks === 'string') {
                    try { footerBlocks = JSON.parse(footerBlocks); } catch (e) {}
                }
                setBlocks(footerBlocks);
                setCurrentPageName('Глобальний Футер');
            } else if (pageId === 'header') {
                const res = await apiClient.get(`/sites/${siteData.site_path}`);
                let headerBlocks = res.data.header_content || [];
                
                if (typeof headerBlocks === 'string') {
                    try { headerBlocks = JSON.parse(headerBlocks); } catch (e) {}
                }

                if (!headerBlocks || headerBlocks.length === 0) {
                    const defaultHeader = {
                        block_id: generateBlockId(),
                        type: 'header',
                        data: getDefaultBlockData('header')
                    };
                    headerBlocks = [defaultHeader];
                }
                
                setBlocks(headerBlocks);
                setCurrentPageName('Глобальний Хедер');
                
                setSelectedBlockPath([0]);
            } else {
                const response = await apiClient.get(`/pages/${pageId}`);
                let content = response.data.block_content || [];
                if (typeof content === 'string') content = JSON.parse(content);
                
                setBlocks(content);
                setCurrentPageName(response.data.name || '');
            }
        } catch (err) {
            console.error(err);
            alert('Помилка під час завантаження контенту.');
        } finally {
            setIsPageLoading(false);
        }
    };

    const handleEditFooter = () => {
        setCurrentPageId('footer');
        fetchPageContent('footer');
        setActiveTab('editor');
        setSelectedBlockPath(null);
    };

    const handleEditHeader = () => {
        setCurrentPageId('header');
        fetchPageContent('header');
        setActiveTab('editor');
    };

    const toggleCollapse = (blockId) => {
        setCollapsedBlocks(prev => 
            prev.includes(blockId)
                ? prev.filter(id => id !== blockId) 
                : [...prev, blockId]
        );
    };

    const handleBlockSaved = useCallback(() => {
        setSavedBlocksUpdateTrigger(prev => prev + 1);
    }, []);
    
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
        if (!currentPageId) return;

        try {
            if (currentPageId === 'footer') {
                await apiClient.put(`/sites/${siteData.site_path}/settings`, {
                    title: siteData.title,
                    status: siteData.status,
                    site_theme_mode: siteData.site_theme_mode,
                    site_theme_accent: siteData.site_theme_accent,
                    theme_settings: siteData.theme_settings,
                    header_settings: siteData.header_settings,
                    footer_content: newBlocks
                });
                alert('Футер успішно оновлено!');
            } else if (currentPageId === 'header') {
                 await apiClient.put(`/sites/${siteData.site_path}/settings`, {
                    title: siteData.title,
                    status: siteData.status,
                    site_theme_mode: siteData.site_theme_mode,
                    site_theme_accent: siteData.site_theme_accent,
                    theme_settings: siteData.theme_settings,
                    footer_content: siteData.footer_content,
                    header_content: newBlocks
                });
                alert('Хедер успішно оновлено!');
            } else {
                await apiClient.put(`/pages/${currentPageId}/content`, { 
                    block_content: newBlocks 
                });
                alert('Контент сторінки збережено!');
            }
            setBlocks(newBlocks);
        } catch (error) {
            console.error('Помилка збереження:', error);
            alert('Помилка під час збереження.');
        }
    }, [currentPageId, siteData]);
    
    const handleMoveBlock = useCallback((dragPath, hoverPath) => {
        setBlocks(prevBlocks => moveBlock(prevBlocks, dragPath, hoverPath));
    }, []);
    
    const handleDropBlock = useCallback((dragItem, dropZonePath) => {
        setBlocks(prevBlocks => handleDrop(prevBlocks, dragItem, dropZonePath));
    }, []);
    
    const handleAddBlock = useCallback((path, type, presetData = {}) => {
        let blockData;
        let libraryMeta = {};

        if (presetData && presetData.isSavedBlock && presetData.content) {
            blockData = cloneBlockWithNewIds(presetData.content);
            libraryMeta = {
                _library_origin_id: presetData.originId,
                _library_name: presetData.originName
            };
        } else {
            blockData = getDefaultBlockData(type, presetData);
        }

        const newBlock = {
            block_id: generateBlockId(),
            type,
            data: blockData,
            ...libraryMeta
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
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            Сайт не знайдено.
        </div>
    );
    
    return (
        <div className="editor-layout-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <DashboardHeader
                siteData={siteData}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                {activeTab === 'editor' && (
                    <>
                        <div 
                            className="editor-canvas-scroll-area"
                            style={{ 
                                flex: 1, 
                                minWidth: 0, 
                                background: 'var(--platform-bg)', 
                                overflowY: 'auto', 
                                overflowX: 'auto',
                                height: '100%',
                                position: 'relative'
                            }}
                        >
                            {(isFooterMode || isHeaderMode) && (
                                <div style={{
                                    background: '#2d3748', 
                                    color: 'white', 
                                    padding: '0.5rem', 
                                    textAlign: 'center', 
                                    fontSize: '0.9rem',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 100
                                }}>
                                    🛠 Режим редагування: <strong>{isHeaderMode ? 'Глобальний Хедер' : 'Глобальний Футер'}</strong>
                                </div>
                            )}
                            
                            {isPageLoading ? (
                                <p style={{
                                    color: 'var(--platform-text-secondary)', 
                                    textAlign: 'center',
                                    padding: '2rem'
                                }}>
                                    Завантаження редактора...
                                </p>
                            ) : (
                                <div style={{ paddingBottom: '100px' }}>
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
                                        onBlockSaved={handleBlockSaved}
                                        isHeaderMode={isHeaderMode}
                                    />
                                </div>
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
                            allPages={[
                                { id: 'header', name: '🔝 Глобальний Хедер', is_homepage: false },
                                ...allPages, 
                                { id: 'footer', name: '🔻 Глобальний Футер', is_homepage: false }
                            ]}
                            currentPageId={currentPageId}
                            onSelectPage={(id) => {
                                if (id === 'footer') handleEditFooter();
                                else if (id === 'header') handleEditHeader();
                                else handleEditPage(id);
                            }}
                            savedBlocksUpdateTrigger={savedBlocksUpdateTrigger}
                            isHeaderMode={isHeaderMode}
                        />
                    </>
                )}
                
                {activeTab !== 'editor' && (
                    <div 
                        className="editor-canvas-scroll-area"
                        style={{ 
                            flex: 1, 
                            overflowY: 'auto', 
                            padding: '2rem',
                            background: 'var(--platform-bg)'
                        }}
                    >
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            {activeTab === 'pages' && (
                                <PagesSettingsTab 
                                    siteId={siteData.id} 
                                    onEditPage={handleEditPage}
                                    onEditFooter={handleEditFooter}
                                    onEditHeader={handleEditHeader}
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
                )}
            </div>
        </div>
    );
};

export default SiteDashboardPage;