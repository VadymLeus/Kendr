// frontend/src/modules/editor/ui/tabs/AddBlocksTab.jsx
import React, { useState, useEffect } from 'react';
import DraggableBlockItem from '../DraggableBlockItem';
import { BLOCK_LIBRARY } from '../../core/editorConfig';
import apiClient from '../../../../shared/api/api';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import { Input } from '../../../../shared/ui/elements/Input';
import { ChevronDown, ChevronRight, Trash2, Edit, Check, X, Package, PanelTop, Box, ShoppingBag, GripVertical } from 'lucide-react';

const Section = ({ title, children, defaultOpen = false, icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`border-b border-(--platform-border-color) ${isOpen ? 'mb-4' : 'mb-0'}`}>
            <div 
                className={`
                    flex items-center justify-between py-3 cursor-pointer select-none
                    ${isOpen ? 'text-(--platform-text-primary)' : 'text-(--platform-text-secondary)'}
                    transition-colors duration-200
                `}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2.5 font-semibold text-sm">
                    {icon && <span className="text-(--platform-accent)">{icon}</span>}
                    {title}
                </div>
                <div className="text-(--platform-text-secondary)">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
            </div>
            
            {isOpen && (
                <div className="animate-in slide-in-from-top-1 duration-200 pb-4">
                    {children}
                </div>
            )}
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

    const actionBtnClasses = "w-7 h-7 flex items-center justify-center border-none bg-transparent cursor-pointer text-(--platform-text-secondary) rounded hover:bg-(--platform-hover-bg) transition-all duration-200";

    if (isEditing) {
        return (
            <div className="p-1.5 bg-(--platform-card-bg) border border-(--platform-accent) rounded-lg mb-2 flex items-center gap-2">
                <div className="flex-1">
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
                <button 
                    onClick={handleSaveEdit} 
                    disabled={isSaving} 
                    className={`${actionBtnClasses} bg-(--platform-accent) text-white hover:bg-(--platform-accent-hover)`}
                >
                    <Check size={16} />
                </button>
                <button 
                    onClick={handleCancelEdit} 
                    disabled={isSaving} 
                    className={`${actionBtnClasses} border border-(--platform-border-color) hover:bg-(--platform-hover-bg)`}
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div 
            className="relative bg-(--platform-card-bg) border border-(--platform-border-color) rounded-lg mb-2 overflow-hidden flex items-center justify-between pr-2 transition-all duration-200 h-11.5 hover:border-(--platform-accent) hover:shadow-sm"
        >
            <div className="flex-1 h-full min-w-0">
                <DraggableBlockItem
                    name={block.name}
                    icon={<Package size={16} />}
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
                         <div className="flex items-center gap-2.5 w-full overflow-hidden">
                            <span className="text-(--platform-text-secondary) cursor-grab"><GripVertical size={14} /></span>
                            <span className="text-(--platform-accent)"><Package size={16} /></span>
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium">{block.name}</span>
                        </div>
                    }
                />
            </div>
            
            <div className="flex items-center gap-0.5 ml-2 z-10">
                <button 
                    onClick={handleStartEdit}
                    title="Перейменувати"
                    className={`${actionBtnClasses} hover:text-(--platform-accent)`}
                >
                    <Edit size={14} />
                </button>
                <button 
                    onClick={handleDeleteClick}
                    title="Видалити"
                    className={`${actionBtnClasses} hover:text-(--platform-danger) hover:bg-red-50`}
                >
                    <Trash2 size={14} />
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
            <Section title="Ваша бібліотека" defaultOpen={false} icon={<Package size={18} />}>
                {isLoading ? (
                    <div className="flex justify-center p-4 text-(--platform-text-secondary)">
                        <span className="animate-spin">⌛</span>
                    </div>
                ) : savedBlocks.length === 0 ? (
                    <div className="p-6 border border-dashed border-(--platform-border-color) rounded-lg text-center text-(--platform-text-secondary) text-sm bg-(--platform-bg)">
                        Тут будуть ваші збережені варіанти блоків.
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

            <Section title="Макети" icon={<PanelTop size={18} />}>
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

            <Section title="Базові блоки" icon={<Box size={18} />}>
                {basicBlocks.map(block => (
                    <DraggableBlockItem
                        key={block.type}
                        name={block.name}
                        icon={block.icon}
                        blockType={block.type}
                    />
                ))}
            </Section>

            <Section title="E-commerce" icon={<ShoppingBag size={18} />}>
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