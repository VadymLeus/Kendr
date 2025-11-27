// frontend/src/features/editor/tabs/SettingsTab.jsx
import React from 'react';
import { findBlockByPath } from '../blockUtils';
import CategoriesSettings from '../settings/CategoriesSettings';
import FeaturesSettings from '../settings/FeaturesSettings';
import CatalogSettings from '../settings/CatalogSettings';
import TextSettings from '../settings/TextSettings';
import HeroSettings from '../settings/HeroSettings';
import ImageSettings from '../settings/ImageSettings';
import ButtonSettings from '../settings/ButtonSettings';
import FormSettings from '../settings/FormSettings';
import LayoutSettings from '../settings/LayoutSettings';
import VideoSettings from '../settings/VideoSettings';
import MapSettings from '../settings/MapSettings';
import AccordionSettings from '../settings/AccordionSettings';
import SocialIconsSettings from '../settings/SocialIconsSettings';
import HeaderSettings from '../settings/HeaderSettings';
import SpacingControl from '../settings/components/SpacingControl';

const SettingsComponentMap = {
    categories: CategoriesSettings,
    features: FeaturesSettings,
    catalog_grid: CatalogSettings,
    text: TextSettings,
    hero: HeroSettings,
    image: ImageSettings,
    button: ButtonSettings,
    form: FormSettings,
    layout: LayoutSettings,
    video: VideoSettings,
    map: MapSettings,
    accordion: AccordionSettings,
    social_icons: SocialIconsSettings,
    header: HeaderSettings,
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
                border: '1px dashed var(--platform-border-color)',
                borderRadius: '8px',
                color: 'var(--platform-text-secondary)',
                marginTop: '2rem'
            }}>
                <span style={{ fontSize: '2rem' }}>⚙️</span>
                <p style={{ fontWeight: '500', color: 'var(--platform-text-primary)' }}>
                    Налаштування блоку
                </p>
                <p>
                    Оберіть блок на сторінці, щоб побачити його налаштування.
                </p>
            </div>
        );
    }

    const SettingsComponent = SettingsComponentMap[selectedBlock.type];

    if (!SettingsComponent) {
        return (
             <div style={{ padding: '1rem', color: 'var(--platform-text-primary)'}}>
                <h4 style={{marginBottom: '1rem'}}>Налаштування: {selectedBlock.type}</h4>
                <p style={{color: 'var(--platform-text-secondary)'}}>
                    Компонент налаштувань для цього типу блоку ({selectedBlock.type}) ще не створено.
                </p>
            </div>
        )
    }

    const handleLiveUpdate = (newData, addToHistory = true) => {
        onUpdateBlockData(selectedBlockPath, newData, addToHistory);
    };

    const handleStyleUpdate = (newStyles, addToHistory = true) => {
        const newData = { 
            ...selectedBlock.data, 
            styles: { 
                ...selectedBlock.data.styles, 
                ...newStyles 
            }
        };
        onUpdateBlockData(selectedBlockPath, newData, addToHistory);
    };

    const handleAnchorChange = (e) => {
        const rawValue = e.target.value;
        const sanitized = rawValue.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
        
        const newData = {
            ...selectedBlock.data,
            anchorId: sanitized
        };
        onUpdateBlockData(selectedBlockPath, newData, true);
    };

    return (
        <div>
             <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '1.5rem' }}>
                Налаштування: {selectedBlock.type}
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                    fontSize: '0.9rem', 
                    textTransform: 'uppercase', 
                    color: 'var(--platform-text-secondary)', 
                    marginBottom: '10px' 
                }}>
                    Вигляд блоку
                </h4>
                
                <div style={{ 
                    background: 'var(--platform-card-bg)', 
                    border: '1px solid var(--platform-border-color)',
                    borderRadius: '4px',
                    padding: '12px',
                    marginBottom: '8px'
                }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '6px', 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: 'var(--platform-text-secondary)'
                    }}>
                        ID блоку (Якір):
                    </label>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span style={{color: 'var(--platform-text-secondary)', fontWeight: 'bold'}}>#</span>
                        <input 
                            type="text" 
                            value={selectedBlock.data.anchorId || ''} 
                            onChange={handleAnchorChange}
                            placeholder="наприклад: contacts"
                            style={{
                                width: '100%',
                                padding: '6px 8px',
                                border: '1px solid var(--platform-border-color)',
                                borderRadius: '4px',
                                background: 'var(--platform-bg)',
                                color: 'var(--platform-text-primary)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <small style={{display: 'block', marginTop: '4px', color: 'var(--platform-text-secondary)', fontSize: '0.75rem'}}>
                        Використовуйте цей ID для посилань у меню (наприклад: #contacts).
                    </small>
                </div>

                <SpacingControl 
                    styles={selectedBlock.data.styles || {}} 
                    onChange={handleStyleUpdate} 
                />
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--platform-border-color)', margin: '20px 0' }} />

            <h4 style={{ 
                fontSize: '0.9rem', 
                textTransform: 'uppercase', 
                color: 'var(--platform-text-secondary)', 
                marginBottom: '10px' 
            }}>
                Контент та параметри
            </h4>

            <SettingsComponent
                data={selectedBlock.data}
                onChange={handleLiveUpdate}
                siteData={siteData}
            />
        </div>
    );
};

export default SettingsTab;