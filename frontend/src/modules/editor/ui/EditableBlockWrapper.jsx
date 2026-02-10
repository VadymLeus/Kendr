// frontend/src/modules/editor/ui/EditableBlockWrapper.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import BlockRenderer from '../core/BlockRenderer';
import apiClient from '../../../shared/api/api';
import SaveBlockModal from './modals/SaveBlockModal';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { useBlockDrop, DND_TYPE_EXISTING } from '../core/useBlockDrop';
import { Settings, Trash2, Save, GripVertical, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const EditableBlockWrapper = ({ 
    block, 
    siteData, 
    path, 
    onMoveBlock, 
    onDropBlock, 
    onDeleteBlock, 
    onAddBlock,
    onSelectBlock,
    selectedBlockPath,
    isCollapsed,
    onToggleCollapse,
    onBlockSaved,
    onContextMenu
}) => {
    const ref = useRef(null);
    const [isCompact, setIsCompact] = useState(window.innerWidth < 1024);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { confirm } = useConfirm();
    
    useEffect(() => {
        const handleResize = () => setIsCompact(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [{ isDragging }, drag] = useDrag({
        type: DND_TYPE_EXISTING,
        item: () => {
            return { path, type: DND_TYPE_EXISTING, id: block.block_id };
        },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const { drop, dropPosition, handlerId } = useBlockDrop({
        ref,
        path,
        onMoveBlock,
        onAddBlock
    });

    drag(drop(ref));
    const showDropIndicator = dropPosition && !isDragging;
    const blockType = { name: block.type, icon: <Settings size={14} /> };
    const blockDomId = `block-${block.block_id}`;
    const isSelected = selectedBlockPath && Array.isArray(selectedBlockPath) && Array.isArray(path) && selectedBlockPath.join(',') === path.join(',');
    const isHeaderBlock = block.type === 'header';
    const anchorId = block.data && block.data.anchorId;
    const handleSelect = (e) => {
        e.stopPropagation();
        onSelectBlock(path);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        const isConfirmed = await confirm({
            title: "Видалення блоку",
            message: "Ви впевнені, що хочете видалити цей блок? Цю дію не можна буде скасувати.",
            type: "danger",
            confirmLabel: "Видалити"
        });

        if (isConfirmed) {
            onDeleteBlock(path);
            toast.info("Блок видалено");
        }
    };

    const handleSaveBlock = async (name, mode, targetOverrideId = null) => {
        try {
            const targetId = targetOverrideId || block._library_origin_id;
            if (mode === 'overwrite' && targetId) {
                 await apiClient.put(`/saved-blocks/${targetId}`, { content: block.data });
                toast.success(`Блок успішно оновлено в бібліотеці!`);
            } else {
                await apiClient.post('/saved-blocks', {
                    name: name,
                    type: block.type,
                    content: block.data
                });
                toast.success('Блок успішно збережено в бібліотеку!');
            }
            if (onBlockSaved) onBlockSaved();
        } catch (error) {
            console.error(error);
            toast.error('Помилка при збереженні');
        }
    };

    const originBlockInfo = block._library_origin_id ? { id: block._library_origin_id, name: block._library_name } : null;
    const themeSettings = siteData?.theme_settings || {};
    const baseBtnClass = `
        bg-transparent border border-(--platform-border-color) text-(--platform-text-secondary)
        ${isCompact ? 'p-1.5' : 'py-1.5 px-2.5'} rounded-md cursor-pointer flex items-center justify-center
        transition-all duration-200 text-xs font-medium gap-1.5
        hover:-translate-y-px hover:shadow-sm
    `;

    const getBtnHoverClass = (type) => {
        if (type === 'danger') return 'hover:bg-(--platform-danger) hover:text-white hover:border-(--platform-danger)';
        if (type === 'primary') return 'hover:bg-(--platform-accent) hover:text-(--platform-accent-text) hover:border-(--platform-accent)';
        return 'hover:bg-(--platform-hover-bg) hover:text-(--platform-text-primary) hover:border-(--platform-accent)';
    };

    const gapSize = '3px';
    let borderClass = 'hidden';
    if (isSelected) {
        borderClass = 'block border-3 border-solid border-(--platform-accent)';
    } else if (isHovered) {
        borderClass = 'block border-3 border-dashed border-(--platform-accent)';
    }

    return (
        <div
            id={blockDomId}
            ref={ref}
            onClick={handleSelect}
            onContextMenu={(e) => onContextMenu && onContextMenu(e, path, block.block_id)}
            className={`
                relative my-6 transition-all duration-200 outline-none group
                ${isDragging ? 'opacity-0' : 'opacity-100'}
                ${isSelected ? 'z-10' : (isHovered ? 'z-5' : 'z-1')}
            `}
            data-handler-id={handlerId}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {showDropIndicator && dropPosition === 'top' && (
                <div className="absolute left-0 right-0 h-1 bg-(--platform-accent) z-100 rounded-sm pointer-events-none shadow-md -top-3.5" />
            )}
            
            <div 
                className={`absolute rounded-xl pointer-events-none z-2 transition-all duration-200 ${borderClass}`}
                style={{ top: `-${gapSize}`, left: `-${gapSize}`, right: `-${gapSize}`, bottom: `-${gapSize}` }} 
            />
            
            <div className={`
                relative rounded-lg overflow-hidden z-3
                ${block.type === 'layout' ? 'bg-transparent' : 'bg-(--site-bg)'}
                ${isDragging ? 'shadow-none' : 'shadow-sm border border-(--platform-border-color)'}
            `}>
                <div className="flex justify-between items-center px-3 py-2 bg-(--platform-card-bg) border-b border-(--platform-border-color) gap-2.5 cursor-grab">
                    <span 
                        className="text-sm font-medium text-(--platform-text-primary) flex items-center gap-2 flex-1 overflow-hidden whitespace-nowrap text-ellipsis"
                        title={blockType?.name}
                    >
                        <span className="flex items-center text-(--platform-text-secondary)">
                            <GripVertical size={16} />
                        </span>
                        <span className="flex items-center text-(--platform-accent)">
                            {block.icon || <HelpCircle size={16} />} 
                        </span>
                        <span>{blockType?.name}</span>
                        {anchorId && (
                            <span className="text-xs bg-blue-500/10 text-(--platform-accent) px-1.5 py-0.5 rounded border border-(--platform-accent)">
                                #{anchorId}
                            </span>
                        )}
                    </span>
                    
                    <div className="flex gap-1 cursor-default" onClick={e => e.stopPropagation()}>
                        {!isHeaderBlock && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsSaveModalOpen(true); }}
                                className={`${baseBtnClass} ${getBtnHoverClass('default')}`}
                                title="Зберегти"
                            >
                                <Save size={16} />
                            </button>
                        )}

                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleCollapse(block.block_id); }}
                            className={`${baseBtnClass} ${getBtnHoverClass('default')}`}
                            title={isCollapsed ? 'Розгорнути' : 'Згорнути'}
                        >
                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </button>

                        <button 
                            onClick={handleSelect}
                            className={`${baseBtnClass} ${getBtnHoverClass('primary')}`}
                            title="Налаштування"
                        >
                            {isCompact ? <Settings size={16} /> : <><Settings size={16} /> Налаштування</>}
                        </button>

                        {!isHeaderBlock && (
                            <button 
                                onClick={handleDelete}
                                title="Видалити"
                                className={`${baseBtnClass} ${getBtnHoverClass('danger')}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {isCollapsed ? (
                    <div className="p-6 text-center bg-(--platform-bg) text-(--platform-text-secondary)">
                        <small>Вміст блоку згорнуто</small>
                    </div>
                ) : (
                    <div
                        className="site-theme-context"
                        data-site-mode={siteData?.site_theme_mode || 'light'}
                        data-site-accent={siteData?.site_theme_accent || 'orange'}
                        style={{
                            background: block.type === 'layout' ? 'transparent' : 'var(--site-bg)', 
                            color: 'var(--platform-text-primary)',
                            '--font-heading': themeSettings.font_heading || "'Inter', sans-serif",
                            '--font-body': themeSettings.font_body || "'Inter', sans-serif",
                            '--btn-radius': themeSettings.button_radius || '8px',
                        }}
                    >
                        <BlockRenderer 
                            blocks={[block]} 
                            siteData={siteData} 
                            isEditorPreview={true} 
                            path={path}
                            onMoveBlock={onMoveBlock}
                            onDropBlock={onDropBlock}
                            onDeleteBlock={onDeleteBlock}
                            onAddBlock={onAddBlock}
                            onSelectBlock={onSelectBlock}
                            selectedBlockPath={selectedBlockPath}
                        />
                    </div>
                )}
            </div>

            {!isHeaderBlock && (
                <SaveBlockModal 
                    isOpen={isSaveModalOpen} 
                    onClose={() => setIsSaveModalOpen(false)} 
                    onSave={handleSaveBlock} 
                    originBlockInfo={originBlockInfo}
                />
            )}
            
            {showDropIndicator && dropPosition === 'bottom' && (
                <div className="absolute left-0 right-0 h-1 bg-(--platform-accent) z-100 rounded-sm pointer-events-none shadow-md -bottom-3.5" />
            )}
        </div>
    );
};

export default EditableBlockWrapper;