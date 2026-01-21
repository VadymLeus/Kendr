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
    const opacity = isDragging ? 0 : 1;
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
    const baseBtnStyle = {
        background: 'transparent',
        border: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-secondary)',
        padding: isCompact ? '6px' : '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        fontSize: '12px',
        fontWeight: '500',
        gap: '6px'
    };

    const handleBtnHover = (e, type) => {
        const style = e.currentTarget.style;
        if (type === 'danger') {
            style.background = 'var(--platform-danger)';
            style.color = '#fff';
            style.borderColor = 'var(--platform-danger)';
        } else if (type === 'primary') {
            style.background = 'var(--platform-accent)';
            style.color = 'var(--platform-accent-text)';
            style.borderColor = 'var(--platform-accent)';
        } else {
            style.background = 'var(--platform-hover-bg)';
            style.color = 'var(--platform-text-primary)';
            style.borderColor = 'var(--platform-accent)';
        }
        style.transform = 'translateY(-1px)';
    };

    const handleBtnOut = (e) => {
        const style = e.currentTarget.style;
        style.background = 'transparent';
        style.borderColor = 'var(--platform-border-color)';
        style.color = 'var(--platform-text-secondary)';
        style.transform = 'translateY(0)';
    };

    const wrapperStyle = {
        opacity,
        position: 'relative',
        margin: '24px 0',
        zIndex: isSelected ? 10 : (isHovered ? 5 : 1),
        transition: 'all 0.2s ease',
        outline: 'none',
    };

    const gapSize = '3px'; 
    let selectionBorder = '1px dashed var(--platform-accent)';
    if (isSelected) {
        selectionBorder = '3px solid var(--platform-accent)';
    } else if (isHovered) {
        selectionBorder = '3px dashed var(--platform-accent)';
    }

    const selectionBorderStyle = {
        position: 'absolute',
        top: `-${gapSize}`,
        left: `-${gapSize}`,
        right: `-${gapSize}`,
        bottom: `-${gapSize}`,
        border: selectionBorder,
        borderRadius: '12px',
        pointerEvents: 'none', 
        zIndex: 2,
        display: (isSelected || isHovered) ? 'block' : 'none',
        transition: 'all 0.2s ease',
    };

    const contentBoxStyle = {
        position: 'relative',
        background: block.type === 'layout' ? 'transparent' : 'var(--site-bg)',
        borderRadius: '8px',
        boxShadow: isDragging ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid var(--platform-border-color)',
        overflow: 'hidden', 
        zIndex: 3,
    };

    const dropIndicatorStyle = {
        position: 'absolute',
        left: 0, 
        right: 0,
        height: '4px',
        backgroundColor: 'var(--platform-accent)',
        zIndex: 100,
        borderRadius: '2px',
        pointerEvents: 'none',
        boxShadow: '0 0 6px rgba(0,0,0,0.3)',
    };
    
    const TOP_OFFSET = '-14px';
    const BOTTOM_OFFSET = '-14px';
    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: 'var(--platform-card-bg)',
        borderBottom: '1px solid var(--platform-border-color)',
        gap: '10px',
        cursor: 'grab'
    };

    return (
        <div
            id={blockDomId}
            ref={ref}
            onClick={handleSelect}
            onContextMenu={(e) => onContextMenu && onContextMenu(e, path, block.block_id)}
            style={wrapperStyle}
            className="editable-block-wrapper"
            data-handler-id={handlerId}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {showDropIndicator && dropPosition === 'top' && (
                <div style={{ ...dropIndicatorStyle, top: TOP_OFFSET }} />
            )}
            <div style={selectionBorderStyle} />
            <div style={contentBoxStyle}>
                <div style={headerStyle} className="editable-block-header">
                    <span style={{
                        fontSize: '14px', fontWeight: '500', color: 'var(--platform-text-primary)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
                    }} title={blockType?.name}>
                        <span style={{display: 'flex', alignItems: 'center', color: 'var(--platform-text-secondary)'}}>
                            <GripVertical size={16} />
                        </span>
                        <span style={{display: 'flex', alignItems: 'center', color: 'var(--platform-accent)'}}>
                            {block.icon || <HelpCircle size={16} />} 
                        </span>
                        <span>{blockType?.name}</span>
                        {anchorId && (
                            <span style={{ fontSize: '0.75rem', background: 'rgba(var(--platform-accent-rgb), 0.1)', color: 'var(--platform-accent)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--platform-accent)' }}>
                                #{anchorId}
                            </span>
                        )}
                    </span>
                    
                    <div style={{display: 'flex', gap: '4px', cursor: 'default'}} onClick={e => e.stopPropagation()}>
                        {!isHeaderBlock && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsSaveModalOpen(true); }}
                                style={baseBtnStyle}
                                title="Зберегти"
                                onMouseEnter={(e) => handleBtnHover(e, 'default')}
                                onMouseLeave={handleBtnOut}
                            >
                                <Save size={16} />
                            </button>
                        )}

                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleCollapse(block.block_id); }}
                            style={baseBtnStyle}
                            title={isCollapsed ? 'Розгорнути' : 'Згорнути'}
                            onMouseEnter={(e) => handleBtnHover(e, 'default')}
                            onMouseLeave={handleBtnOut}
                        >
                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </button>

                        <button 
                            onClick={handleSelect}
                            style={baseBtnStyle}
                            title="Налаштування"
                            onMouseEnter={(e) => handleBtnHover(e, 'primary')}
                            onMouseLeave={handleBtnOut}
                        >
                            {isCompact ? <Settings size={16} /> : <><Settings size={16} /> Налаштування</>}
                        </button>

                        {!isHeaderBlock && (
                            <button 
                                onClick={handleDelete}
                                title="Видалити"
                                style={baseBtnStyle}
                                onMouseEnter={(e) => handleBtnHover(e, 'danger')}
                                onMouseLeave={handleBtnOut}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {isCollapsed ? (
                    <div style={{ 
                        padding: '1.5rem', 
                        textAlign: 'center', 
                        background: 'var(--platform-bg)', 
                        color: 'var(--platform-text-secondary)'
                    }}>
                        <small>Вміст блоку згорнуто</small>
                    </div>
                ) : (
                    <div
                        className="site-theme-context"
                        data-site-mode={siteData?.site_theme_mode || 'light'}
                        data-site-accent={siteData?.site_theme_accent || 'orange'}
                        style={{
                            background: 'var(--site-bg)', 
                            color: 'var(--platform-text-primary)',
                            ...(block.type === 'layout' && { background: 'transparent' }),
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
                <div style={{ ...dropIndicatorStyle, bottom: BOTTOM_OFFSET }} />
            )}
        </div>
    );
};

export default EditableBlockWrapper;