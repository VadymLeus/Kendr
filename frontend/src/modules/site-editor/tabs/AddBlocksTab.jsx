// frontend/src/modules/site-editor/tabs/AddBlocksTab.jsx
import React, { useState, useEffect } from 'react';
import DraggableBlockItem from "../components/DraggableBlockItem";
import { BLOCK_LIBRARY } from "../core/editorConfig";
import apiClient from '../../../common/services/api';
import { useConfirm } from '../../../common/hooks/useConfirm';
import { Input } from '../../../common/components/ui/Input';

import { 
    IconChevronDown, 
    IconChevronRight, 
    IconTrash, 
    IconEdit, 
    IconCheck, 
    IconX, 
    IconPackage, 
    IconLayoutHeader, 
    IconBox, 
    IconShop,
    IconGripVertical
} from '../../../common/components/ui/Icons';

const Section = ({ title, children, defaultOpen = false, icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        cursor: 'pointer',
        userSelect: 'none',
        color: isOpen ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)',
        borderBottom: isOpen ? 'none' : '1px solid var(--platform-border-color)',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={{ marginBottom: isOpen ? '16px' : '0' }}>
            <div style={headerStyle} onClick={() => setIsOpen(!isOpen)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontSize: '0.9rem' }}>
                    {icon && <span style={{ color: 'var(--platform-accent)' }}>{icon}</span>}
                    {title}
                </div>
                <div style={{ color: 'var(--platform-text-secondary)' }}>
                    {isOpen ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                </div>
            </div>
            
            {isOpen && (
                <div style={{ 
                    animation: 'slideDown 0.2s ease-out',
                    paddingLeft: '0',
                    borderBottom: '1px solid var(--platform-border-color)',
                    paddingBottom: '16px'
                }}>
                    {children}
                </div>
            )}
            <style>{`
                @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

const SavedBlockItem = ({ block, onDelete, onRename }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(block.name);
    const [isSaving, setIsSaving] = useState(false);

    const handleStartEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setNewName(block.name);
        setIsEditing(true);
    };

    const handleCancelEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(false);
        setNewName(block.name);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!newName.trim() || newName === block.name) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        await onRename(block.id, newName);
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(e, block.id, block.name);
    };

    const actionBtnStyle = {
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--platform-text-secondary)',
        borderRadius: '4px',
        transition: 'all 0.2s'
    };

    if (isEditing) {
        return (
            <div style={{ 
                padding: '6px', 
                background: 'var(--platform-card-bg)', 
                border: '1px solid var(--platform-accent)',
                borderRadius: '8px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <div style={{ flex: 1 }}>
                    <Input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                        placeholder="Назва блоку"
                        disabled={isSaving}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(e);
                            if (e.key === 'Escape') handleCancelEdit(e);
                        }}
                        style={{ height: '32px', fontSize: '0.85rem' }}
                        wrapperStyle={{ marginBottom: 0 }}
                    />
                </div>
                <button onClick={handleSaveEdit} disabled={isSaving} style={{ ...actionBtnStyle, background: 'var(--platform-accent)', color: '#fff' }}>
                    <IconCheck size={16} />
                </button>
                <button onClick={handleCancelEdit} disabled={isSaving} style={{ ...actionBtnStyle, border: '1px solid var(--platform-border-color)' }}>
                    <IconX size={16} />
                </button>
            </div>
        );
    }

    return (
        <div style={{ 
            position: 'relative',
            background: 'var(--platform-card-bg)', 
            border: '1px solid var(--platform-border-color)',
            borderRadius: '8px',
            marginBottom: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: '8px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            height: '46px'
        }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--platform-accent)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--platform-border-color)';
            e.currentTarget.style.boxShadow = 'none';
        }}
        >
            <div style={{ flex: 1, height: '100%', minWidth: 0 }}>
                <DraggableBlockItem
                    name={block.name}
                    icon={<IconPackage size={16} />}
                    blockType={block.type}
                    presetData={{ 
                        isSavedBlock: true, 
                        content: block.content,
                        originId: block.id,
                        originName: block.name
                    }}
                    customStyle={{
                        border: 'none', 
                        boxShadow: 'none', 
                        background: 'transparent', 
                        margin: 0, 
                        borderRadius: 0, 
                        height: '100%', 
                        width: '100%', 
                        padding: '0 0 0 12px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                    customContent={
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', overflow: 'hidden' }}>
                            <span style={{ color: 'var(--platform-text-secondary)', cursor: 'grab' }}><IconGripVertical size={14} /></span>
                            <span style={{ color: 'var(--platform-accent)' }}><IconPackage size={16} /></span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem', fontWeight: '500' }}>{block.name}</span>
                        </div>
                    }
                />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '8px', zIndex: 10 }}>
                <button 
                    onClick={handleStartEdit}
                    title="Перейменувати"
                    style={actionBtnStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--platform-accent)'; e.currentTarget.style.background = 'var(--platform-hover-bg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--platform-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <IconEdit size={14} />
                </button>
                <button 
                    onClick={handleDeleteClick}
                    title="Видалити"
                    style={actionBtnStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = '#e53e3e'; e.currentTarget.style.background = '#fff5f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--platform-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <IconTrash size={14} />
                </button>
            </div>
        </div>
    );
};

const AddBlocksTab = ({ savedBlocksUpdateTrigger }) => {
    const [savedBlocks, setSavedBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { confirm } = useConfirm();
    const layoutBlocks = BLOCK_LIBRARY.filter(b => b.type === 'layout');
    const basicBlocks = BLOCK_LIBRARY.filter(b => ['hero', 'text', 'image', 'button', 'form', 'features', 'video', 'map', 'accordion', 'social_icons'].includes(b.type));
    const ecommerceBlocks = BLOCK_LIBRARY.filter(b => ['catalog', 'showcase'].includes(b.type));

    useEffect(() => {
        const fetchSavedBlocks = async () => {
            setIsLoading(true);
            try {
                const res = await apiClient.get('/saved-blocks');
                setSavedBlocks(res.data);
            } catch (err) {
                console.error("Не вдалося завантажити збережені блоки", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSavedBlocks();
    }, [savedBlocksUpdateTrigger]);

    const handleDeleteSaved = async (e, id, name) => {
        const isConfirmed = await confirm({
            title: 'Видалити блок?',
            message: `Ви впевнені, що хочете видалити блок "${name}" з бібліотеки?`,
            type: 'danger',
            confirmLabel: 'Видалити'
        });

        if (isConfirmed) {
            try {
                await apiClient.delete(`/saved-blocks/${id}`);
                setSavedBlocks(prev => prev.filter(b => b.id !== id));
            } catch(err) {
                console.error(err);
            }
        }
    };

    const handleRenameSaved = async (id, newName) => {
        try {
            await apiClient.put(`/saved-blocks/${id}`, { name: newName });
            setSavedBlocks(prev => prev.map(b => b.id === id ? { ...b, name: newName } : b));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <Section title="Ваша бібліотека" defaultOpen={true} icon={<IconPackage size={18} />}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', color: 'var(--platform-text-secondary)' }}>
                        <span className="animate-spin">⌛</span>
                    </div>
                ) : savedBlocks.length === 0 ? (
                    <div style={{
                        padding: '1.5rem 1rem', border: '1px dashed var(--platform-border-color)', 
                        borderRadius: '8px', textAlign: 'center', color: 'var(--platform-text-secondary)', fontSize: '0.85rem', background: 'var(--platform-bg)'
                    }}>
                        Тут будуть ваші збережені блоки.
                    </div>
                ) : (
                    savedBlocks.map(block => (
                        <SavedBlockItem 
                            key={block.id} 
                            block={block} 
                            onDelete={handleDeleteSaved}
                            onRename={handleRenameSaved}
                        />
                    ))
                )}
            </Section>

            <Section title="Макети" icon={<IconLayoutHeader size={18} />}>
                {layoutBlocks.map(block => (
                    block.presets.map(preset => (
                        <DraggableBlockItem
                            key={preset.preset}
                            name={preset.name}
                            icon={block.icon}
                            blockType="layout"
                            presetData={{ preset: preset.preset, columns: preset.columns }}
                        />
                    ))
                ))}
            </Section>

            <Section title="Базові блоки" icon={<IconBox size={18} />}>
                {basicBlocks.map(block => (
                    <DraggableBlockItem
                        key={block.type}
                        name={block.name}
                        icon={block.icon}
                        blockType={block.type}
                    />
                ))}
            </Section>

            <Section title="E-commerce" icon={<IconShop size={18} />}>
                {ecommerceBlocks.map(block => (
                    <DraggableBlockItem
                        key={block.type}
                        name={block.name}
                        icon={block.icon}
                        blockType={block.type}
                    />
                ))}
            </Section>
        </div>
    );
};

export default AddBlocksTab;