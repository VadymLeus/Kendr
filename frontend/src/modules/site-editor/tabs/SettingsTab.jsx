// frontend/src/modules/site-editor/tabs/LayersTab.jsx
import React from 'react';
import { findBlockByPath } from '../core/blockUtils';
import SettingsGroup from '../components/common/SettingsGroup';
import { Input } from '../../../common/components/ui/Input';
import { 
    IconSettings, 
    IconPalette, 
    IconFileText, 
    IconCursorClick, 
    IconAlertCircle,
    IconHash
} from '../../../common/components/ui/Icons';

import ShowCaseSettings from '../blocks/ShowCase/ShowCaseSettings';
import FeaturesSettings from '../blocks/Features/FeaturesSettings';
import CatalogSettings from '../blocks/Catalog/CatalogSettings';
import TextSettings from '../blocks/Text/TextSettings';
import HeroSettings from '../blocks/Hero/HeroSettings';
import ImageSettings from '../blocks/Image/ImageSettings';
import ButtonSettings from '../blocks/Button/ButtonSettings';
import FormSettings from '../blocks/Form/FormSettings';
import LayoutSettings from '../blocks/Layout/LayoutSettings';
import VideoSettings from '../blocks/Video/VideoSettings';
import MapSettings from '../blocks/Map/MapSettings';
import AccordionSettings from '../blocks/Accordion/AccordionSettings';
import SocialIconsSettings from '../blocks/SocialIcons/SocialIconsSettings';
import HeaderSettings from '../blocks/Header/HeaderSettings';
import SpacingControl from '../components/common/SpacingControl';
import AnimationSettings from '../components/common/AnimationSettings';

const SettingsComponentMap = {
    showcase: ShowCaseSettings,
    features: FeaturesSettings,
    catalog: CatalogSettings,
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--platform-text-secondary)',
            }}>
                <div style={{ 
                    width: '80px', height: '80px', borderRadius: '50%', background: 'var(--platform-bg)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                    border: '1px solid var(--platform-border-color)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                    <IconCursorClick size={36} style={{ color: 'var(--platform-accent)', opacity: 0.8 }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--platform-text-primary)', marginBottom: '8px' }}>
                    Блок не обрано
                </h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '260px', lineHeight: '1.5' }}>
                    Натисніть на будь-який блок у редакторі праворуч, щоб відкрити його налаштування.
                </p>
            </div>
        );
    }

    const SettingsComponent = SettingsComponentMap[selectedBlock.type];

    if (!SettingsComponent) {
        return (
             <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--platform-text-secondary)', marginBottom: '1rem' }}>
                    <IconSettings size={48} style={{ opacity: 0.2 }} />
                </div>
                <h4 style={{ marginBottom: '1rem' }}>{selectedBlock.type}</h4>
                <div style={{ 
                    padding: '16px', 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444', 
                    borderRadius: '8px', 
                    fontSize: '0.9rem', 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'start', 
                    textAlign: 'left' 
                }}>
                    <IconAlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Налаштування для цього типу блоку ще в розробці.</span>
                </div>
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

    const handleAnimationUpdate = (newAnimationConfig) => {
        const newData = {
            ...selectedBlock.data,
            animation: newAnimationConfig
        };
        onUpdateBlockData(selectedBlockPath, newData, true);
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

    const blockKey = selectedBlock.block_id || selectedBlock.type;

    return (
        <div className="custom-scrollbar" style={{ paddingBottom: '60px' }}>
            <div style={{ 
                padding: '20px 0 16px', 
                marginBottom: '20px', 
                borderBottom: '1px solid var(--platform-border-color)',
                display: 'flex', alignItems: 'center', gap: '12px'
            }}>
                <div style={{ 
                    width: '36px', height: '36px', borderRadius: '8px', 
                    background: 'var(--platform-accent-transparent)', color: 'var(--platform-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <IconSettings size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--platform-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Редагування</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', textTransform: 'capitalize', color: 'var(--platform-text-primary)' }}>{selectedBlock.type}</div>
                </div>
            </div>
            
            <SettingsGroup 
                title="Вміст та Дані" 
                icon={<IconFileText size={18} />}
                defaultOpen={true}
                storageKey={`main_${blockKey}`}
            >
                <SettingsComponent
                    data={selectedBlock.data}
                    onChange={handleLiveUpdate}
                    siteData={siteData}
                />
            </SettingsGroup>

            <SettingsGroup 
                title="Зовнішній вигляд" 
                icon={<IconPalette size={18} />}
                defaultOpen={false}
                storageKey={`style_${blockKey}`}
            >
                <div style={{ marginBottom: '24px' }}>
                    <Input 
                        label="Якір блоку (ID)"
                        value={selectedBlock.data.anchorId || ''}
                        onChange={handleAnchorChange}
                        placeholder="наприклад: about-us"
                        leftIcon={<IconHash size={14} />}
                    />
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--platform-text-secondary)', lineHeight: '1.4' }}>
                        Вкажіть унікальний ID, щоб створити посилання на цей блок у меню (наприклад, #about-us).
                    </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                    <SpacingControl 
                        styles={selectedBlock.data.styles || {}} 
                        onChange={handleStyleUpdate} 
                    />
                </div>
                <div>
                    <AnimationSettings 
                        animationConfig={selectedBlock.data.animation} 
                        onChange={handleAnimationUpdate} 
                    />
                </div>
            </SettingsGroup>
        </div>
    );
};

export default SettingsTab;