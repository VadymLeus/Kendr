// frontend/src/pages/sites/SiteDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';

import BlockEditor from '../../features/editor/BlockEditor';
import EditorSidebar from '../../features/editor/EditorSidebar';
import PagesSettingsTab from '../../features/sites/tabs/PagesSettingsTab';
import ShopContentTab from '../../features/sites/tabs/ShopContentTab';
import ThemeSettingsTab from '../../features/sites/tabs/ThemeSettingsTab';
import SubmissionsTab from '../../features/sites/tabs/SubmissionsTab';
import GeneralSettingsTab from '../../features/sites/tabs/GeneralSettingsTab';
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
    const { siteData, setSiteData, isSiteLoading } = useOutletContext();
    
    const [activeTab, setActiveTab] = useState('editor');
    const [blocks, setBlocks] = useState([]);
    const [currentPageId, setCurrentPageId] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [selectedBlockPath, setSelectedBlockPath] = useState(null);
    const [allPages, setAllPages] = useState([]);
    const [collapsedBlocks, setCollapsedBlocks] = useState([]);
    const [savedBlocksUpdateTrigger, setSavedBlocksUpdateTrigger] = useState(0);

    const isFooterMode = currentPageId === 'footer';
    const isHeaderMode = currentPageId === 'header';

    useEffect(() => {
        if (siteData) {
            if (!allPages.length) {
                apiClient.get(`/sites/${siteData.id}/pages`)
                    .then(res => {
                        setAllPages(res.data);
                        if (res.data.length > 0 && !currentPageId) {
                            const home = res.data.find(p => p.is_homepage) || res.data[0];
                            handleEditPage(home.id);
                        }
                    })
                    .catch(console.error);
            }
        }
    }, [siteData]);

    const fetchPageContent = async (pageId) => {
        setIsPageLoading(true);
        setBlocks([]);
        try {
            if (pageId === 'footer' || pageId === 'header') {
                const res = await apiClient.get(`/sites/${siteData.site_path}`);
                const contentKey = pageId === 'footer' ? 'footer_content' : 'header_content';
                let content = res.data[contentKey] || [];
                if (typeof content === 'string') try { content = JSON.parse(content); } catch {}
                if (pageId === 'header' && (!content || content.length === 0)) {
                    content = [{ block_id: generateBlockId(), type: 'header', data: getDefaultBlockData('header') }];
                }
                setBlocks(content);
            } else {
                const response = await apiClient.get(`/pages/${pageId}`);
                let content = response.data.block_content || [];
                if (typeof content === 'string') content = JSON.parse(content);
                setBlocks(content);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsPageLoading(false);
        }
    };

    const handleEditPage = (pageId) => {
        setCurrentPageId(pageId);
        fetchPageContent(pageId);
        setSelectedBlockPath(null);
    };

    const handleMoveBlock = (drag, hover) => setBlocks(prev => moveBlock(prev, drag, hover));
    const handleDropBlock = (item, path) => setBlocks(prev => handleDrop(prev, item, path));
    const handleAddBlock = (path, type, preset) => {
        const newBlock = { block_id: generateBlockId(), type, data: getDefaultBlockData(type, preset) };
        setBlocks(prev => addBlockByPath(prev, newBlock, path));
    };
    const handleDeleteBlock = (path) => setBlocks(prev => removeBlockByPath(prev, path));
    const handleUpdateBlockData = (path, data) => setBlocks(prev => updateBlockDataByPath(prev, path, data));
    
    const savePageContent = async (currentBlocks) => {
        const blocksToSave = currentBlocks || blocks; 

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
            toast.success('✅ Зміни успішно збережено!');
        } catch (error) {
            console.error("Помилка при збереженні:", error);
            toast.error('❌ Не вдалося зберегти зміни. Спробуйте ще раз.');
        }
    };

    const handleSiteDataUpdate = (newData) => {
        setSiteData(prev => ({ ...prev, ...newData }));
    };

    const refreshPageList = () => apiClient.get(`/sites/${siteData.id}/pages`).then(r => setAllPages(r.data));

    if (isSiteLoading || !siteData) return <div className="p-8 text-center">Завантаження...</div>;

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
                        <div className="editor-canvas-scroll-area" style={{ flex: 1, overflowY: 'auto', background: 'var(--platform-bg)' }}>
                            <div style={{ paddingBottom: '100px' }}>
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
                                    onToggleCollapse={(id) => setCollapsedBlocks(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                                    isHeaderMode={isHeaderMode}
                                />
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
                    <div className="editor-canvas-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: 'var(--platform-bg)' }}>
                        <div style={{ 
                            maxWidth: (activeTab === 'store' || activeTab === 'crm') ? '100%' : '1000px', 
                            margin: '0 auto',
                            transition: 'max-width 0.3s ease'
                        }}>
                            
                            {activeTab === 'pages' && (
                                <PagesSettingsTab 
                                    siteId={siteData.id} 
                                    onEditPage={(id) => { handleEditPage(id); setActiveTab('editor'); }}
                                    onEditFooter={() => { handleEditPage('footer'); setActiveTab('editor'); }}
                                    onEditHeader={() => { handleEditPage('header'); setActiveTab('editor'); }}
                                    onPageUpdate={refreshPageList}
                                />
                            )}

                            {activeTab === 'store' && (
                                <ShopContentTab siteData={siteData} />
                            )}

                            {activeTab === 'theme' && (
                                <ThemeSettingsTab siteData={siteData} />
                            )}

                            {activeTab === 'crm' && (
                                <SubmissionsTab siteId={siteData.id} />
                            )}

                            {activeTab === 'settings' && (
                                <GeneralSettingsTab 
                                    siteData={siteData} 
                                    onUpdate={handleSiteDataUpdate}
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