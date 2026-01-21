// frontend/src/modules/editor/ui/modals/BlockSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import BannerSettings from './settings/BannerSettings';
import CategoriesSettings from './settings/CategoriesSettings';
import FeaturesSettings from './features/editor/settings/FeaturesSettings';
import CatalogSettings from './features/editor/settings/CatalogSettings';
import TextSettings from './features/editor/settings/TextSettings';
import HeroSettings from './features/editor/settings/HeroSettings';
import AnimationSettings from './common/AnimationSettings';
import { X } from 'lucide-react';

const SettingsComponentMap = {
    banner: BannerSettings,
    categories: CategoriesSettings,
    features: FeaturesSettings,
    catalog_grid: CatalogSettings,
    text: TextSettings,
    hero: HeroSettings
};

const BlockSettingsModal = ({ block, isOpen, onClose, onSave, siteData }) => {
    const [animationConfig, setAnimationConfig] = useState(
        block?.data?.animation || { type: 'none', duration: 0.6, delay: 0 }
    );

    useEffect(() => {
        if (isOpen && block) {
            setAnimationConfig(block.data?.animation || { type: 'none', duration: 0.6, delay: 0 });
        }
    }, [isOpen, block]);

    if (!isOpen) return null;

    const SettingsComponent = SettingsComponentMap[block.type];

    const handleInternalSave = (newBlockData) => {
        const finalData = {
            ...newBlockData,
            animation: animationConfig
        };
        onSave(finalData);
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
        backdropFilter: 'blur(4px)'
    };

    const contentStyle = {
        background: 'var(--site-card-bg)',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
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
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--site-text-secondary)',
        transition: 'all 0.2s ease'
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
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'transparent',
        color: 'var(--site-text-primary)',
        border: '1px solid var(--site-border-color)'
    };
    
    const primaryButtonStyle = {
        ...buttonStyle,
        background: 'var(--site-accent)',
        color: 'var(--site-accent-text)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()} className="custom-scrollbar">
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
                            e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                            e.currentTarget.style.color = 'var(--site-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--site-text-secondary)';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {SettingsComponent ? (
                    <>
                        <SettingsComponent 
                            initialData={block.data} 
                            onSave={handleInternalSave} 
                            onClose={onClose}
                            siteData={siteData}
                        />
                        <AnimationSettings 
                            animationConfig={animationConfig} 
                            onChange={setAnimationConfig} 
                        />
                    </>
                ) : (
                    <>
                        <p style={warningTextStyle}>
                            Редактор для цього блоку поки не реалізовано. Ось його дані:
                        </p>
                        <pre style={preStyle}>
                            {JSON.stringify(block.data, null, 2)}
                        </pre>
                        
                        <AnimationSettings 
                            animationConfig={animationConfig} 
                            onChange={setAnimationConfig} 
                        />

                        <div style={buttonContainerStyle}>
                            <button 
                                onClick={onClose}
                                style={secondaryButtonStyle}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.02)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                Закрити
                            </button>
                            <button
                                onClick={() => handleInternalSave(block.data)}
                                style={primaryButtonStyle}
                                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                            >
                                Зберегти
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BlockSettingsModal;