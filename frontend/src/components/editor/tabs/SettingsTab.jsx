// frontend/src/components/editor/tabs/SettingsTab.jsx
import React from 'react';
import { findBlockByPath } from '../blockUtils';
import BannerSettings from '../settings/BannerSettings';
import CategoriesSettings from '../settings/CategoriesSettings';
import FeaturesSettings from '../settings/FeaturesSettings';
import CatalogSettings from '../settings/CatalogSettings';
import TextSettings from '../settings/TextSettings';
import HeroSettings from '../settings/HeroSettings';

const SettingsComponentMap = {
    banner: BannerSettings,
    categories: CategoriesSettings,
    features: FeaturesSettings,
    catalog_grid: CatalogSettings,
    text: TextSettings,
    hero: HeroSettings,
};

const SettingsTab = ({ blocks, selectedBlockPath, onUpdateBlockData, siteData }) => {
    
    const selectedBlock = selectedBlockPath 
        ? findBlockByPath(blocks, selectedBlockPath) 
        : null;

    if (!selectedBlock) {
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                border: '1px dashed var(--site-border-color)',
                borderRadius: '8px',
                color: 'var(--site-text-secondary)',
                marginTop: '2rem'
            }}>
                <span style={{ fontSize: '2rem' }}>⚙️</span>
                <p style={{ fontWeight: '500', color: 'var(--site-text-primary)' }}>
                    Налаштування блоку
                </p>
                <p>
                    Оберіть блок на сторінці (або в шарах), щоб побачити його налаштування.
                </p>
            </div>
        );
    }

    const SettingsComponent = SettingsComponentMap[selectedBlock.type];

    if (!SettingsComponent) {
        return (
             <div style={{ padding: '1rem', color: 'var(--site-text-primary)'}}>
                <h4 style={{marginBottom: '1rem'}}>Налаштування: {selectedBlock.type}</h4>
                <p style={{color: 'var(--site-text-secondary)'}}>
                    Компонент налаштувань для цього типу блоку ({selectedBlock.type}) ще не створено.
                </p>
            </div>
        )
    }

    const handleLiveUpdate = (newData) => {
        onUpdateBlockData(selectedBlockPath, newData);
    };

    return (
        <div>
             <h3 style={{ color: 'var(--site-text-primary)', marginBottom: '1.5rem' }}>
                Налаштування: {selectedBlock.type}
            </h3>
            <SettingsComponent
                data={selectedBlock.data}
                onChange={handleLiveUpdate}
                siteData={siteData}
            />
        </div>
    );
};

export default SettingsTab;