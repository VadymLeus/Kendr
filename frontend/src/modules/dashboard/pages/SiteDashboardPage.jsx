// frontend/src/modules/dashboard/pages/SiteDashboardPage.jsx
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../app/providers/AuthContext';
import BlockEditor from '../../editor/core/BlockEditor';
import EditorSidebar from '../../editor/ui/EditorSidebar';
import GeneralSettingsTab from '../features/settings/GeneralSettingsTab';
import PagesSettingsTab from '../features/settings/PagesSettingsTab';
import StyleSettingsTab from '../features/settings/StyleSettingsTab';
import ShopContentTab from '../features/shop/ShopContentTab';
import OrdersTab from '../features/shop/OrdersTab';
import SubmissionsTab from '../features/content/SubmissionsTab';
import DashboardHeader from '../components/DashboardHeader';
import LoadingState from '../../../shared/ui/complex/LoadingState';
import useHistory from '../../../shared/hooks/useHistory';
import { generateBlockId, getDefaultBlockData } from '../../editor/core/editorConfig';
import { updateBlockDataByPath, removeBlockByPath, addBlockByPath, moveBlock, handleDrop } from '../../editor/core/blockUtils';
import { Lock } from 'lucide-react';

const useDragAutoScroll = (ref, isEnabled) => {
    useEffect(() => {
        const container = ref.current;
        if (!container || !isEnabled) return;
        let animationFrameId;
        let currentSpeed = 0;
        const animateScroll = () => {
            if (currentSpeed !== 0) {
                container.scrollTop += currentSpeed;
            }
            animationFrameId = requestAnimationFrame(animateScroll);
        };
        animationFrameId = requestAnimationFrame(animateScroll);
        const onDragOver = (e) => {
            const { clientY, clientX } = e;
            const rect = container.getBoundingClientRect();
            if (clientX < rect.left || clientX > rect.right) {
                currentSpeed = 0;
                return;
            }
            const topDist = clientY - rect.top;
            const bottomDist = rect.bottom - clientY;
            const threshold = 150; 
            const maxSpeed = 20;
            if (topDist >= 0 && topDist < threshold) {
                currentSpeed = -maxSpeed * (1 - topDist / threshold);
            } else if (bottomDist >= 0 && bottomDist < threshold) {
                currentSpeed = maxSpeed * (1 - bottomDist / threshold);
            } else {
                currentSpeed = 0;
            }
        };

        const stopScrolling = () => { currentSpeed = 0; };
        document.addEventListener('dragover', onDragOver, true);
        document.addEventListener('dragend', stopScrolling, true);
        document.addEventListener('drop', stopScrolling, true);
        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('dragover', onDragOver, true);
            document.removeEventListener('dragend', stopScrolling, true);
            document.removeEventListener('drop', stopScrolling, true);
        };
    }, [isEnabled]);
};

const SiteDashboardPage = () => {
    const { site_path } = useParams();
    const navigate = useNavigate();
    const { siteData, setSiteData, isSiteLoading } = useOutletContext();
    const { isAdmin } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem(`editor_active_tab_${site_path}`) || 'editor';
    });
    const [viewMode, setViewMode] = useState('editor');
    const [isReadOnly, setIsReadOnly] = useState(false);
    const pcScrollRef = useRef(null);
    useDragAutoScroll(pcScrollRef, activeTab === 'editor');
    useEffect(() => {
        const handleLockStatus = (e) => {
            const serverLocked = e.detail;
            if (serverLocked && !isAdmin) {
                setIsReadOnly(true);
            } else {
                setIsReadOnly(false);
            }
        };
        window.addEventListener('editor_locked_status', handleLockStatus);
        return () => window.removeEventListener('editor_locked_status', handleLockStatus);
    }, [isAdmin]);

    useEffect(() => {
        if (siteData && siteData.status === 'suspended') {
            toast.error('Доступ до редагування заблоковано. Сайт заблоковано.');
            navigate('/dashboard');
        }
    }, [siteData, navigate]);

    useEffect(() => {
        if (site_path) {
            localStorage.setItem(`editor_active_tab_${site_path}`, activeTab);
        }
    }, [activeTab, site_path]);
    const [blocks, setBlocks, undo, redo, { canUndo, canRedo }] = useHistory([]);
    const [currentPageId, setCurrentPageId] = useState(() => {
        const savedPage = localStorage.getItem(`last_edited_page_${site_path}`);
        return savedPage ? parseInt(savedPage, 10) : null;
    });
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [selectedBlockPath, setSelectedBlockPath] = useState(null);
    const [allPages, setAllPages] = useState([]);
    const [collapsedBlocks, setCollapsedBlocks] = useState(() => {
        if (!site_path) return [];
        let targetId = null;
        const savedPage = localStorage.getItem(`last_edited_page_${site_path}`);
        if (savedPage) targetId = parseInt(savedPage, 10);
        if (targetId) {
            const key = `collapsed_blocks_${site_path}_${targetId}`;
            try {
                const savedState = localStorage.getItem(key);
                return savedState ? JSON.parse(savedState) : [];
            } catch (e) { return []; }
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
        pages: false, store: false, crm: false, settings: false, orders: false
    });
    const [savedBlocksUpdateTrigger, setSavedBlocksUpdateTrigger] = useState(0);
    const setComponentSaving = useCallback((component, isSaving) => {
        setComponentsSaving(prev => ({ ...prev, [component]: isSaving }));
    }, []);
    
    const handleBlockSaved = useCallback(() => {
        setSavedBlocksUpdateTrigger(prev => prev + 1);
    }, []);
    
    useEffect(() => {
        const anyComponentSaving = Object.values(componentsSaving).some(saving => saving);
        setIsSaving(anyComponentSaving);
    }, [componentsSaving]);
    
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (document.querySelector('.ReactModal__Content')) return;
            if (isReadOnly) return;
            
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                if (e.shiftKey) { e.preventDefault(); redo(); }
                else { e.preventDefault(); undo(); }
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault(); redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, isReadOnly]);

    const fetchPageContent = async (pageId) => {
        setIsPageLoading(true);
        try {
            const response = await apiClient.get(`/pages/${pageId}`);
            let content = response.data.block_content || [];
            if (typeof content === 'string') {
                try { content = JSON.parse(content); } catch (e) { content = []; }
            }
            content = content.map(block => {
                if (block.type === 'global-header' || block.type === 'header') {
                    let globalData = typeof siteData.header_content === 'string' ? JSON.parse(siteData.header_content || '{}') : (siteData.header_content || {});
                    if (Object.keys(globalData).length === 0) globalData = getDefaultBlockData('global-header');
                    return { ...block, type: 'global-header', data: globalData };
                }
                if (block.type === 'global-footer' || block.type === 'footer') {
                    let globalData = typeof siteData.footer_content === 'string' ? JSON.parse(siteData.footer_content || '{}') : (siteData.footer_content || {});
                    if (Object.keys(globalData).length === 0) globalData = getDefaultBlockData('global-footer');
                    return { ...block, type: 'global-footer', data: globalData };
                }
                return block;
            });
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
        } catch (e) { setCollapsedBlocks([]); }
        fetchPageContent(pageId);
        setSelectedBlockPath(null);
    };
    
    useEffect(() => {
        if (siteData && !allPages.length) {
            apiClient.get(`/sites/${siteData.id}/pages`)
                .then(res => {
                    const pages = res.data;
                    setAllPages(pages);
                    if (pages.length > 0) {
                        let targetId = currentPageId;
                        const pageExists = pages.find(p => p.id === targetId);
                        if (!targetId || !pageExists) {
                            const home = pages.find(p => p.is_homepage) || pages[0];
                            targetId = home.id;
                        }
                        handleEditPage(targetId);
                    }
                })
                .catch(console.error);
        }
    }, [siteData]);

    const handleMoveBlock = (drag, hover) => !isReadOnly && setBlocks(prev => moveBlock(prev, drag, hover));
    const handleDropBlock = (item, path) => !isReadOnly && setBlocks(prev => handleDrop(prev, item, path));
    const handleAddBlock = (path, type, preset) => {
        if (isReadOnly) return;
        if (type.startsWith('global-')) {
            const exists = blocks.some(b => b.type === type);
            if (exists) {
                toast.warning(`Цей глобальний блок вже додано на сторінку.`);
                return;
            }
        }
        let blockData = getDefaultBlockData(type, preset);
        if (type === 'global-header') {
            const globalData = typeof siteData?.header_content === 'string' 
                ? JSON.parse(siteData.header_content || '{}') 
                : (siteData?.header_content || {});
            if (Object.keys(globalData).length > 0) blockData = globalData;
        } else if (type === 'global-footer') {
            const globalData = typeof siteData?.footer_content === 'string' 
                ? JSON.parse(siteData.footer_content || '{}') 
                : (siteData?.footer_content || {});
            if (Object.keys(globalData).length > 0) blockData = globalData;
        }

        const newBlock = { block_id: generateBlockId(), type, data: blockData };
        setBlocks(prev => addBlockByPath(prev, newBlock, path));
    };

    const handleDeleteBlock = (path) => {
        if (isReadOnly) return;
        setBlocks(prev => removeBlockByPath(prev, path));
        setSelectedBlockPath(null);
    };
    
    const handleUpdateBlockData = (path, data, addToHistory = true) => {
        if (isReadOnly) return;
        setBlocks(prev => updateBlockDataByPath(prev, path, data), addToHistory);
    };

    const handleSaveError = (error) => {
        console.error("Помилка при збереженні:", error);
        if (error.response && (error.response.status === 503 || error.response.data?.editor_locked)) {
            setIsReadOnly(true);
        } else {
            toast.error('Не вдалося зберегти зміни.');
        }
    };

    const savePageContent = async (currentBlocks) => {
        if (isReadOnly) return; 
        const blocksToProcess = currentBlocks || blocks;
        setIsSaving(true);
        try {
            let updatedHeaderData = null;
            let updatedFooterData = null;
            const blocksToSave = blocksToProcess.map(block => {
                if (block.type === 'global-header' || block.type === 'header') {
                    updatedHeaderData = block.data;
                    return { ...block, data: {} };
                }
                if (block.type === 'global-footer' || block.type === 'footer') {
                    updatedFooterData = block.data;
                    return { ...block, data: {} };
                }
                return block;
            });
            const requests = [
                apiClient.put(`/pages/${currentPageId}/content`, { block_content: blocksToSave })
            ];
            const siteUpdates = {};
            if (updatedHeaderData) siteUpdates.header_content = updatedHeaderData;
            if (updatedFooterData) siteUpdates.footer_content = updatedFooterData;
            if (Object.keys(siteUpdates).length > 0) {
                requests.push(apiClient.put(`/sites/${siteData.site_path}/settings`, siteUpdates));
            }
            await Promise.all(requests);
            if (Object.keys(siteUpdates).length > 0) {
                setSiteData(prev => ({ ...prev, ...siteUpdates }));
            }
        } catch (error) {
            handleSaveError(error);
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const saveThemeSettings = async (updatedData) => {
        if (isReadOnly) return;
        setIsThemeSaving(true);
        try {
            const updateData = {};
            Object.keys(updatedData).forEach(key => {
                if (updatedData[key] !== siteData[key]) updateData[key] = updatedData[key];
            });
            if (Object.keys(updateData).length > 0) {
                await apiClient.put(`/sites/${siteData.site_path}/settings`, updateData);
                setSiteData(prev => ({ ...prev, ...updateData }));
            }
        } catch (error) {
            handleSaveError(error);
        } finally {
            setTimeout(() => setIsThemeSaving(false), 500);
        }
    };

    const handleSiteDataUpdate = (newData) => {
        setSiteData(prev => ({ ...prev, ...newData }));
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
        setCollapsedBlocks(prev => prev.includes(blockId) ? prev.filter(id => id !== blockId) : [...prev, blockId]);
    };
    const handleSavingChange = useCallback((isSaving) => {
        const tabMap = { pages: 'pages', store: 'store', crm: 'crm', settings: 'settings', orders: 'orders' };
        if (tabMap[activeTab]) setComponentSaving(tabMap[activeTab], isSaving);
    }, [activeTab, setComponentSaving]);
    if (isSiteLoading || !siteData) {
        return <LoadingState title="Завантаження редактора..." />;
    }
    const isFullHeightTab = ['store', 'crm', 'orders'].includes(activeTab);
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {isReadOnly && (
                <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-sm z-50 animate-in slide-in-from-top-2 duration-300">
                    <Lock size={16} />
                    <span>Редактор тимчасово заблоковано для оновлення платформи. Ви в режимі перегляду.</span>
                </div>
            )}
            <DashboardHeader
                siteData={siteData}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                undo={undo} redo={redo}
                canUndo={canUndo && !isReadOnly} 
                canRedo={canRedo && !isReadOnly}
                isSaving={isSaving || isThemeSaving}
                isReadOnly={isReadOnly}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
            <div className="flex-1 flex overflow-hidden relative">
                {activeTab === 'editor' && (
                    <>
                        <div 
                            ref={pcScrollRef} 
                            className={`flex-1 overflow-y-auto ${viewMode !== 'editor' ? 'bg-[#111827]' : 'bg-(--platform-bg)'} transition-colors duration-300`}
                        >
                            <div>
                                {isPageLoading ? (
                                    <LoadingState layout="component" title="Завантаження сторінки..." className="h-75" />
                                ) : (
                                    <div className={isReadOnly ? 'pointer-events-none opacity-80' : ''}>
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
                                            onBlockSaved={handleBlockSaved}
                                            viewMode={viewMode}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {viewMode === 'editor' && (
                            <div className={isReadOnly ? 'pointer-events-none opacity-50 grayscale' : ''}>
                                <EditorSidebar
                                    blocks={blocks}
                                    siteData={siteData}
                                    onMoveBlock={handleMoveBlock}
                                    onDeleteBlock={handleDeleteBlock}
                                    selectedBlockPath={selectedBlockPath}
                                    onSelectBlock={setSelectedBlockPath}
                                    onUpdateBlockData={handleUpdateBlockData}
                                    onAddBlock={handleAddBlock}
                                    onSave={savePageContent}
                                    allPages={allPages}
                                    currentPageId={currentPageId}
                                    onSelectPage={(id) => handleEditPage(id)}
                                    savedBlocksUpdateTrigger={savedBlocksUpdateTrigger}
                                />
                            </div>
                        )}
                    </>
                )}
                {activeTab !== 'editor' && (
                    <div 
                        className={`flex-1 bg-(--platform-bg) ${
                            isFullHeightTab
                                ? 'overflow-hidden pl-6 pt-6 pr-6 pb-6' 
                                : 'overflow-y-auto p-8'
                        }`}
                    >
                        <div 
                            className={`mx-auto ${
                                isFullHeightTab ? 'w-full h-full' : (activeTab === 'settings' ? 'w-full' : 'max-w-250')
                            } ${isReadOnly ? 'pointer-events-none opacity-70' : ''}`}
                        >
                            {activeTab === 'pages' && (
                                <PagesSettingsTab 
                                    siteId={siteData.id} 
                                    onEditPage={(id) => { handleEditPage(id); setActiveTab('editor'); }}
                                    onPageUpdate={refreshPageList}
                                    onSavingChange={handleSavingChange}
                                />
                            )}
                            {activeTab === 'store' && <ShopContentTab siteData={siteData} onSavingChange={handleSavingChange} />}
                            {activeTab === 'orders' && <OrdersTab siteData={siteData} />}
                            {activeTab === 'theme' && <StyleSettingsTab siteData={siteData} onUpdate={handleSiteDataUpdate} isSaving={isThemeSaving} />}
                            {activeTab === 'crm' && <SubmissionsTab siteId={siteData.id} onSavingChange={handleSavingChange} />}
                            {activeTab === 'settings' && <GeneralSettingsTab siteData={siteData} onUpdate={handleSiteDataUpdate} onSavingChange={handleSavingChange} />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteDashboardPage;