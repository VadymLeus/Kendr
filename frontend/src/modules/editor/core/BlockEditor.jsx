// frontend/src/modules/editor/core/BlockEditor.jsx
import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import EditableBlockWrapper from '../ui/EditableBlockWrapper';
import { DND_TYPE_NEW_BLOCK } from '../ui/DraggableBlockItem';
import { DND_TYPE_EXISTING } from './useBlockDrop';
import { resolveAccentColor, adjustColor, isLightColor } from '../../../shared/utils/themeUtils';
import ContextMenu from '../ui/ContextMenu';
import { findBlockByPath } from './blockUtils';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { PackageOpen } from 'lucide-react';

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
    isHeaderMode
}) => {
    
    const { confirm } = useConfirm();
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        path: null,
        blockId: null
    });

    const [{ isOverBottom }, bottomDropRef] = useDrop(() => ({
        accept: [DND_TYPE_NEW_BLOCK, DND_TYPE_EXISTING],
        collect: (monitor) => ({
            isOverBottom: monitor.isOver(),
        }),
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            const dragType = monitor.getItemType();
            if (dragType === DND_TYPE_NEW_BLOCK) {
                onAddBlock([blocks.length], item.blockType, item.presetData);
            } 

            else if (dragType === DND_TYPE_EXISTING) {
                const dragPath = item.path;
                const targetPath = [blocks.length]; 
                const isLastBlock = dragPath.length === 1 && dragPath[0] === blocks.length - 1;
                if (!isLastBlock) {
                    onMoveBlock(dragPath, targetPath);
                }
            }
        },
    }), [blocks.length, onAddBlock, onMoveBlock]);

    const emptyDropRef = useDrop(() => ({
        accept: [DND_TYPE_NEW_BLOCK],
        drop: (item, monitor) => {
            if (monitor.didDrop()) return;
            onAddBlock([blocks.length], item.blockType, item.presetData); 
        },
    }), [blocks.length, onAddBlock])[1];

    const handleContextMenu = (e, path, blockId) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            path: path,
            blockId: blockId
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const handleContextMenuAction = async (action) => {
        const { path } = contextMenu;
        if (!path) return;
        handleCloseContextMenu();
        switch (action) {
            case 'edit':
                onSelectBlock(path);
                break;
            case 'duplicate':
                const blockToClone = findBlockByPath(blocks, path);
                if (blockToClone) {
                    const parentPath = path.slice(0, -1);
                    const currentIndex = path[path.length - 1];
                    const newPath = [...parentPath, currentIndex + 1];
                    
                    onAddBlock(newPath, blockToClone.type, { 
                        isSavedBlock: true,
                        content: blockToClone.data 
                    });
                }
                break;
            case 'delete':
                const isConfirmed = await confirm({
                    title: "Видалити блок?",
                    message: "Ви впевнені, що хочете видалити цей блок? Цю дію не можна буде скасувати.",
                    type: "danger",
                    confirmLabel: "Видалити"
                });

                if (isConfirmed) {
                    onDeleteBlock(path);
                }
                break;
            case 'moveUp':
                {
                    const parentPath = path.slice(0, -1);
                    const index = path[path.length - 1];
                    if (index > 0) {
                        const newPath = [...parentPath, index - 1];
                        onMoveBlock(path, newPath);
                    }
                }
                break;
            case 'moveDown':
                {
                    const parentPath = path.slice(0, -1);
                    const index = path[path.length - 1];
                    const newPath = [...parentPath, index + 1];
                    onMoveBlock(path, newPath);
                }
                break;
            default:
                break;
        }
    };

    const themeSettings = siteData?.theme_settings || {};
    const isSiteDark = siteData?.site_theme_mode === 'dark';
    const siteBg = isSiteDark ? '#1a202c' : '#f7fafc';
    const siteText = isSiteDark ? '#f7fafc' : '#1a202c';
    const siteCardBg = isSiteDark ? '#2d3748' : '#ffffff';
    const siteBorder = isSiteDark ? '#4a5568' : '#e2e8f0';
    const siteAccent = resolveAccentColor(siteData?.site_theme_accent || 'orange');
    const siteAccentHover = adjustColor(siteAccent, -10);
    const siteAccentLight = adjustColor(siteAccent, 90);
    const siteAccentText = isLightColor(siteAccent) ? '#000000' : '#ffffff';
    const siteIsolationStyles = {
        '--site-bg': siteBg,
        '--site-text-primary': siteText,
        '--site-text-secondary': isSiteDark ? '#a0aec0' : '#718096',
        '--site-card-bg': siteCardBg,
        '--site-border-color': siteBorder,
        '--site-accent': siteAccent,
        '--site-accent-hover': siteAccentHover,
        '--site-accent-light': siteAccentLight,
        '--site-accent-text': siteAccentText,
        '--site-font-main': themeSettings.font_body || "'Inter', sans-serif",
        '--site-font-headings': themeSettings.font_heading || "'Inter', sans-serif",
        '--site-btn-radius': themeSettings.button_radius || '8px',
    };

    return (
        <div className="px-8 pb-8">
            {blocks.length === 0 && (
                <div
                    ref={emptyDropRef}
                    className="
                        p-12 text-center border-2 border-dashed border-(--platform-border-color) rounded-xl 
                        text-(--platform-text-secondary) my-5 bg-(--platform-bg) transition-all duration-300 
                        cursor-pointer relative overflow-hidden
                        hover:border-(--platform-accent) hover:text-(--platform-accent) hover:bg-[rgba(var(--platform-accent-rgb),0.05)]
                    "
                >
                    <div className="mb-4 text-(--platform-accent) flex justify-center">
                        <PackageOpen size={48} />
                    </div>
                    <h3 className="text-inherit mb-2 text-[1.2rem]">
                        Початок роботи
                    </h3>
                    <p className="m-0 text-[0.95rem] opacity-80">
                        Перетягніть блок з бібліотеки або натисніть "+" у панелі додавання блоків
                    </p>
                </div>
            )}

            <div 
                className="site-theme-preview w-full min-h-full p-0 relative bg-transparent" 
                style={siteIsolationStyles}
                data-site-mode={siteData?.site_theme_mode || 'light'}
                data-site-accent={siteData?.site_theme_accent || 'orange'}
            >
                <div className="blocks-container">
                    {blocks.map((block, index) => (
                        <React.Fragment key={block.block_id}>
                            <EditableBlockWrapper
                                index={index}
                                block={block}
                                siteData={siteData}
                                path={[index]}
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
                            />
                        </React.Fragment>
                    ))}
                </div>

                {blocks.length > 0 && !isHeaderMode && (
                    <div 
                        ref={bottomDropRef}
                        className="h-37.5 -mt-3 w-full bg-transparent relative z-1"
                    >
                        {isOverBottom && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-(--platform-accent) rounded-sm shadow-md z-50" />
                        )}
                    </div>
                )}
            </div>

            <ContextMenu 
                visible={contextMenu.visible}
                x={contextMenu.x}
                y={contextMenu.y}
                onClose={handleCloseContextMenu}
                onAction={handleContextMenuAction}
            />

            <style>
                {`
                .site-theme-preview {
                    font-family: var(--site-font-main);
                }
                
                .site-theme-preview * {
                    box-sizing: border-box;
                }
                
                .site-theme-preview .site-block {
                    background: var(--site-bg);
                    color: var(--site-text-primary);
                    font-family: var(--site-font-main);
                }
                
                .site-theme-preview .site-heading {
                    font-family: var(--site-font-headings);
                    color: var(--site-text-primary);
                }
                
                .site-theme-preview .site-button {
                    background: var(--site-accent);
                    color: var(--site-accent-text);
                    border-radius: var(--site-btn-radius);
                    border: none;
                    padding: 0.5rem 1rem;
                    font-family: var(--site-font-main);
                    transition: background-color 0.2s ease;
                }
                
                .site-theme-preview .site-button:hover {
                    background: var(--site-accent-hover);
                }
                
                .site-theme-preview .site-card {
                    background: var(--site-card-bg);
                    border: 1px solid var(--site-border-color);
                    border-radius: var(--site-btn-radius);
                }
                `}
            </style>
        </div>
    );
};

export default BlockEditor;