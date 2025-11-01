// frontend/src/components/editor/BlockSettingsModal.jsx
import React from 'react';
import BannerSettings from './settings/BannerSettings';
import CategoriesSettings from './settings/CategoriesSettings';
import FeaturesSettings from './settings/FeaturesSettings';
import CatalogSettings from './settings/CatalogSettings';
import TextSettings from './settings/TextSettings';
import HeroSettings from './settings/HeroSettings';

const SettingsComponentMap = {
    banner: BannerSettings,
    categories: CategoriesSettings,
    features: FeaturesSettings,
    catalog_grid: CatalogSettings,
    text: TextSettings,
    hero: HeroSettings
};

const BlockSettingsModal = ({ block, isOpen, onClose, onSave, onRemove }) => {
    if (!isOpen) return null;

    const SettingsComponent = SettingsComponentMap[block.type];

    const handleInternalSave = (newBlockData) => {
        onSave(newBlockData);
        onClose();
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    };

    const contentStyle = {
        background: 'var(--platform-bg)',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
        position: 'relative',
    };
    const modalHeaderStyle = {
        borderBottom: '1px solid var(--platform-border-color)',
        paddingBottom: '15px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };
    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <div style={modalHeaderStyle}>
                    <h4 style={{ margin: 0 }}>Налаштування блоку: {block.type}</h4>
                    <button 
                        onClick={onClose} 
                        className="btn btn-sm btn-secondary" 
                        style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' }}
                    >
                        &times;
                    </button>
                </div>
                
                {SettingsComponent ? (
                    <SettingsComponent 
                        initialData={block.data} 
                        onSave={handleInternalSave} 
                        onClose={onClose}
                    />
                ) : (
                    <>
                        <p className="text-warning">
                            Редактор для цього блоку поки не реалізовано. Ось його дані:
                        </p>
                        <pre style={{ 
                            background: 'var(--platform-card-bg)', 
                            padding: '10px', 
                            borderRadius: '4px', 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-all' 
                        }}>
                            {JSON.stringify(block.data, null, 2)}
                        </pre>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button onClick={onClose} className="btn btn-secondary">Закрити</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BlockSettingsModal;