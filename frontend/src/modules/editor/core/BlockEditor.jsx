// frontend/src/modules/editor/core/BlockEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import EditableBlockWrapper from '../ui/EditableBlockWrapper';
import { DND_TYPE_NEW_BLOCK } from '../ui/DraggableBlockItem';
import { DND_TYPE_EXISTING } from './useBlockDrop';
import { resolveAccentColor, adjustColor, isLightColor } from '../../../shared/utils/themeUtils';
import ContextMenu from '../ui/ContextMenu';
import { findBlockByPath } from './blockUtils';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageOpen, ArrowDownToLine } from 'lucide-react';

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
    }, [ref, isEnabled]);
};

const BlockEditor = ({
    blocks,
    siteData,
    onAddBlock,
    onMoveBlock,
    onDropBlock,
    onDeleteBlock,
    onSelectBlock,
    selectedBlockPath,
    collapsedBlocks,
    onToggleCollapse,
    onBlockSaved,
    isHeaderMode,
    viewMode = 'editor'
}) => {
    const { confirm } = useConfirm();
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, path: null, blockId: null });
    const mobileScrollRef = useRef(null);
    useDragAutoScroll(mobileScrollRef, viewMode === 'mobile');
    const [{ isOverBottom }, bottomDropRef] = useDrop(() => ({
        accept: [DND_TYPE_NEW_BLOCK, DND_TYPE_EXISTING],
        collect: (monitor) => ({ isOverBottom: monitor.isOver({ shallow: true }) }),
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            const dragType = monitor.getItemType();
            if (dragType === DND_TYPE_NEW_BLOCK) {
                onAddBlock([blocks.length], item.blockType, item.presetData);
            } else if (dragType === DND_TYPE_EXISTING) {
                const dragPath = item.path;
                const targetPath = [blocks.length]; 
                const isLastBlock = dragPath.length === 1 && dragPath[0] === blocks.length - 1;
                if (!isLastBlock) onMoveBlock(dragPath, targetPath);
            }
        },
    }), [blocks.length, onAddBlock, onMoveBlock]);
    
    const [{ isOverEmpty }, emptyDropRef] = useDrop(() => ({
        accept: [DND_TYPE_NEW_BLOCK],
        collect: (monitor) => ({ isOverEmpty: monitor.isOver({ shallow: true }) }),
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            onAddBlock([blocks.length], item.blockType, item.presetData); 
        },
    }), [blocks.length, onAddBlock]);
    
    const handleContextMenu = (e, path, blockId) => {
        if (viewMode !== 'editor') return; 
        e.preventDefault(); e.stopPropagation();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, path: path, blockId: blockId });
    };
    
    const handleCloseContextMenu = () => setContextMenu(prev => ({ ...prev, visible: false }));
    const handleContextMenuAction = async (action) => {
        const { path } = contextMenu;
        if (!path) return;
        handleCloseContextMenu();
        switch (action) {
            case 'edit': onSelectBlock(path); break;
            case 'duplicate':
                const blockToClone = findBlockByPath(blocks, path);
                if (blockToClone) {
                    const parentPath = path.slice(0, -1);
                    const currentIndex = path[path.length - 1];
                    const newPath = [...parentPath, currentIndex + 1];
                    onAddBlock(newPath, blockToClone.type, { isSavedBlock: true, content: blockToClone.data });
                }
                break;
            case 'delete':
                const isConfirmed = await confirm({ title: "Видалити блок?", message: "Ви впевнені, що хочете видалити цей блок?", type: "danger", confirmLabel: "Видалити" });
                if (isConfirmed) onDeleteBlock(path);
                break;
            case 'moveUp':
                if (path[path.length - 1] > 0) onMoveBlock(path, [...path.slice(0, -1), path[path.length - 1] - 1]);
                break;
            case 'moveDown':
                onMoveBlock(path, [...path.slice(0, -1), path[path.length - 1] + 1]);
                break;
            default: break;
        }
    };
    const themeSettings = siteData?.theme_settings || {};
    const isSiteDark = siteData?.site_theme_mode === 'dark';
    const siteBg = isSiteDark ? '#1a202c' : '#f7fafc';
    const siteText = isSiteDark ? '#f7fafc' : '#1a202c';
    const siteCardBg = isSiteDark ? '#2d3748' : '#ffffff';
    const siteBorder = isSiteDark ? '#4a5568' : '#e2e8f0';
    const siteAccent = resolveAccentColor(siteData?.site_theme_accent || 'orange');
    const siteIsolationStyles = { '--site-bg': siteBg, '--site-text-primary': siteText, '--site-text-secondary': isSiteDark ? '#a0aec0' : '#718096', '--site-card-bg': siteCardBg, '--site-border-color': siteBorder, '--site-accent': siteAccent, '--site-font-main': themeSettings.font_body || "'Inter', sans-serif" };
    let containerClass = viewMode === 'mobile' ? 'px-8 pb-8 pt-10 flex flex-col' : 'px-8 pb-8 pt-3 flex flex-col flex-1';
    return (
        <div className={containerClass}>
            {blocks.length === 0 && viewMode === 'editor' ? (
                <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-150px)] p-4">
                    <div ref={emptyDropRef} className={`flex flex-col items-center justify-center w-full max-w-4xl p-16 text-center border-4 border-dashed rounded-[2.5rem] transition-all duration-300 cursor-pointer h-full min-h-100 ${isOverEmpty ? 'border-(--platform-accent) bg-black/5 text-(--platform-accent) scale-[1.02] shadow-xl' : 'border-(--platform-border-color) bg-transparent text-(--platform-text-secondary) hover:border-(--platform-accent) hover:text-(--platform-accent)'}`}>
                        <div className={`mb-6 transition-transform duration-300 ${isOverEmpty ? 'scale-110 animate-pulse' : ''}`}><PackageOpen size={80} strokeWidth={1.5} /></div>
                        <h3 className="mb-4 text-3xl font-bold tracking-tight">{isOverEmpty ? 'Відпустіть блок тут!' : 'Початок роботи'}</h3>
                        <p className="m-0 text-lg opacity-80 max-w-md mx-auto leading-relaxed">Перетягніть ваш перший блок з бібліотеки праворуч</p>
                    </div>
                </div>
            ) : (
                <div className="site-theme-preview w-full flex-1 p-0 relative bg-transparent flex flex-col" style={siteIsolationStyles}>
                    <div ref={mobileScrollRef} className={`blocks-container ${viewMode === 'mobile' ? 'mobile-preview-device hide-scrollbar flow-root' : 'w-full flex-none flow-root'}`}>
                        <AnimatePresence initial={false}>
                            {blocks.map((block, index) => (
                                <motion.div key={block.block_id} layout initial={{ opacity: 0, y: -30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}>
                                    <EditableBlockWrapper
                                        index={index}
                                        block={block}
                                        siteData={siteData}
                                        path={[index]}
                                        isLastRootBlock={index === blocks.length - 1}
                                        onMoveBlock={onMoveBlock}
                                        onDropBlock={onDropBlock}
                                        onDeleteBlock={onDeleteBlock}
                                        onAddBlock={onAddBlock}
                                        onSelectBlock={onSelectBlock}
                                        selectedBlockPath={selectedBlockPath}
                                        isCollapsed={collapsedBlocks.includes(block.block_id)}
                                        onToggleCollapse={onToggleCollapse}
                                        onBlockSaved={onBlockSaved}
                                        onContextMenu={handleContextMenu}
                                        viewMode={viewMode}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    {blocks.length > 0 && !isHeaderMode && viewMode === 'editor' && (
                        <div ref={bottomDropRef} className="flex-1 w-full relative z-1 pt-6 pb-[30vh] flex flex-col cursor-pointer">
                            <div className={`
                                w-full h-32 shrink-0 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center
                                ${isOverBottom 
                                    ? 'border-(--platform-accent) bg-(--platform-accent)/10 scale-[1.01] shadow-sm' 
                                    : 'border-(--platform-border-color) hover:border-(--platform-accent)/40 bg-transparent'}
                            `}>
                                <div className={`transition-all duration-300 flex items-center gap-2 font-medium ${isOverBottom ? 'text-(--platform-accent) scale-110 opacity-100' : 'text-(--platform-text-secondary) opacity-60'}`}>
                                    <ArrowDownToLine size={20} />
                                    <span>Додати в кінець сторінки</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <ContextMenu visible={contextMenu.visible} x={contextMenu.x} y={contextMenu.y} onClose={handleCloseContextMenu} onAction={handleContextMenuAction} />
            <style>
                {`
                .site-theme-preview { font-family: var(--site-font-main); }
                .site-theme-preview * { box-sizing: border-box; }
                .mobile-preview-device { max-width: 400px; margin: 0 auto; border: 12px solid #222; border-radius: 36px; overflow-y: auto; overflow-x: hidden; height: 80vh; background-color: var(--site-bg); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); position: relative; }
                .site-theme-preview .site-block { background: var(--site-bg); color: var(--site-text-primary); font-family: var(--site-font-main); }
                .site-theme-preview .site-heading { font-family: var(--site-font-headings); color: var(--site-text-primary); }
                `}
            </style>
        </div>
    );
};

export default BlockEditor;