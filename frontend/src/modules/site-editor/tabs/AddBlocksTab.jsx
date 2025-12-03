// frontend/src/modules/site-editor/tabs/AddBlocksTab.jsx
import React, { useState, useEffect } from 'react';
import DraggableBlockItem from "../components/DraggableBlockItem";
import { BLOCK_LIBRARY } from "../core/editorConfig";
import apiClient from '../../../common/services/api';

const Section = ({ title, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--platform-text-secondary)',
        fontSize: '0.9rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
        cursor: 'pointer',
        padding: '0.25rem 0',
        userSelect: 'none'
    };

    const toggleButtonStyle = {
        background: 'none',
        border: 'none',
        color: 'var(--platform-text-secondary)',
        cursor: 'pointer',
        fontSize: '1.2rem',
        padding: '0.25rem 0.5rem',
        transition: 'transform 0.2s ease',
        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
    };

    return (
        <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--platform-border-color)', paddingBottom: '1rem' }}>
            <h4 
                style={headerStyle} 
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? 'Розгорнути' : 'Згорнути'}
            >
                {title}
                <button 
                    style={toggleButtonStyle}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCollapsed(!isCollapsed);
                    }}
                >
                    ▼
                </button>
            </h4>
            {!isCollapsed && children}
        </div>
    );
};

const savedBlockContainerStyle = {
    display: 'flex',
    alignItems: 'stretch',
    background: 'var(--platform-card-bg)',
    border: '1px solid var(--platform-border-color)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease',
    minHeight: '42px'
};

const dragAreaStyle = {
    flex: 1,
    minWidth: 0,
    borderRight: '1px solid var(--platform-border-color)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '0'
};

const actionsColumnStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '28px',
    flexShrink: 0,
    background: 'var(--platform-bg)'
};

const actionBtnStyle = (color, isTop) => ({
    flex: 1,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: color,
    transition: 'background 0.2s',
    padding: 0,
    margin: 0,
    borderBottom: isTop ? '1px solid var(--platform-border-color)' : 'none'
});

const layoutBlocks = BLOCK_LIBRARY.filter(b => b.type === 'layout');
const basicBlocks = BLOCK_LIBRARY.filter(b => ['hero', 'text', 'image', 'button', 'form', 'features', 'video', 'map', 'accordion', 'social_icons'].includes(b.type));
const ecommerceBlocks = BLOCK_LIBRARY.filter(b => ['catalog', 'showcase'].includes(b.type));

const AddBlocksTab = ({ savedBlocksUpdateTrigger }) => {
    const [savedBlocks, setSavedBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
        e.stopPropagation();
        if(window.confirm(`Видалити блок "${name}" з бібліотеки?`)) {
            try {
                await apiClient.delete(`/saved-blocks/${id}`);
                setSavedBlocks(prev => prev.filter(b => b.id !== id));
            } catch(err) {
                alert('Помилка видалення');
            }
        }
    };

    const handleRenameSaved = async (e, id, currentName) => {
        e.stopPropagation();
        const newName = prompt("Введіть нову назву:", currentName);
        if (newName && newName.trim() !== "" && newName !== currentName) {
            try {
                await apiClient.put(`/saved-blocks/${id}`, { name: newName });
                setSavedBlocks(prev => prev.map(b => b.id === id ? { ...b, name: newName } : b));
            } catch (err) {
                alert('Помилка перейменування');
            }
        }
    };

    return (
        <div>
            <Section title="📂 Ваша бібліотека">
                {isLoading ? (
                    <p style={{fontSize: '0.8rem', color:'var(--platform-text-secondary)', padding:'0.5rem'}}>Завантаження...</p>
                ) : savedBlocks.length === 0 ? (
                    <div style={{
                        padding: '1rem', border: '1px dashed var(--platform-border-color)', 
                        borderRadius: '6px', textAlign: 'center', color: 'var(--platform-text-secondary)', fontSize: '0.8rem'
                    }}>
                        Збережені блоки з'являться тут. Налаштуйте блок та натисніть 💾.
                    </div>
                ) : (
                    savedBlocks.map(block => (
                        <div key={block.id} style={savedBlockContainerStyle}>
                            <div style={dragAreaStyle}>
                                <DraggableBlockItem
                                    name={block.name}
                                    icon="📦"
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
                                        padding: '0.5rem 0.8rem'
                                    }}
                                />
                            </div>
                            
                            <div style={actionsColumnStyle}>
                                <button 
                                    onClick={(e) => handleRenameSaved(e, block.id, block.name)}
                                    title="Перейменувати"
                                    style={actionBtnStyle('#ecc94b', true)}
                                    onMouseEnter={e => e.target.style.background = 'rgba(236, 201, 75, 0.1)'}
                                    onMouseLeave={e => e.target.style.background = 'transparent'}
                                >
                                    ✏️
                                </button>
                                <button 
                                    onClick={(e) => handleDeleteSaved(e, block.id, block.name)}
                                    title="Видалити"
                                    style={actionBtnStyle('#f56565', false)}
                                    onMouseEnter={e => e.target.style.background = 'rgba(245, 101, 101, 0.1)'}
                                    onMouseLeave={e => e.target.style.background = 'transparent'}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </Section>

            <Section title="Макети">
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

            <Section title="Базові блоки">
                {basicBlocks.map(block => (
                    <DraggableBlockItem
                        key={block.type}
                        name={block.name}
                        icon={block.icon}
                        blockType={block.type}
                    />
                ))}
            </Section>

            <Section title="E-commerce">
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