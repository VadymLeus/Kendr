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

const BlockSettingsModal = ({ block, isOpen, onClose, onSave, siteData }) => {
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
        background: 'var(--site-card-bg)',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
        position: 'relative',
        border: '1px solid var(--site-border-color)'
    };

    const modalHeaderStyle = {
        borderBottom: '1px solid var(--site-border-color)',
        paddingBottom: '15px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const closeButtonStyle = {
        background: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '0 10px',
        color: 'var(--site-text-secondary)',
        transition: 'color 0.2s ease'
    };

    const warningTextStyle = {
        color: 'var(--site-warning)',
        marginBottom: '1rem'
    };

    const preStyle = {
        background: 'var(--site-bg)',
        padding: '15px',
        borderRadius: '8px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        border: '1px solid var(--site-border-color)',
        color: 'var(--site-text-primary)',
        fontSize: '0.9rem'
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px'
    };

    const buttonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'var(--site-card-bg)',
        color: 'var(--site-text-primary)',
        border: '1px solid var(--site-border-color)'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <div style={modalHeaderStyle}>
                    <h4 style={{ 
                        margin: 0,
                        color: 'var(--site-text-primary)',
                        fontSize: '1.25rem',
                        fontWeight: '600'
                    }}>
                        Налаштування блоку: {block.type}
                    </h4>
                    <button 
                        onClick={onClose} 
                        style={closeButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.color = 'var(--site-accent)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = 'var(--site-text-secondary)';
                        }}
                    >
                        &times;
                    </button>
                </div>
                
                {SettingsComponent ? (
                    <SettingsComponent 
                        initialData={block.data} 
                        onSave={handleInternalSave} 
                        onClose={onClose}
                        siteData={siteData}
                    />
                ) : (
                    <>
                        <p style={warningTextStyle}>
                            Редактор для цього блоку поки не реалізовано. Ось його дані:
                        </p>
                        <pre style={preStyle}>
                            {JSON.stringify(block.data, null, 2)}
                        </pre>
                        <div style={buttonContainerStyle}>
                            <button 
                                onClick={onClose}
                                style={secondaryButtonStyle}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = 'var(--site-accent)';
                                    e.target.style.color = 'var(--site-accent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = 'var(--site-border-color)';
                                    e.target.style.color = 'var(--site-text-primary)';
                                }}
                            >
                                Закрити
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BlockSettingsModal;