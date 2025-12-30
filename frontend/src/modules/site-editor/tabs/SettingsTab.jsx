// frontend/src/modules/site-editor/core/SettingsTab.jsx
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
    IconGripVertical
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
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--platform-text-secondary)',
                opacity: 0.8
            }}>
                <div style={{ 
                    width: '64px', height: '64px', borderRadius: '50%', background: 'var(--platform-bg)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                    border: '1px dashed var(--platform-border-color)'
                }}>
                    <IconCursorClick size={32} />
                </div>
                <h4 style={{ fontWeight: '600', color: 'var(--platform-text-primary)', marginBottom: '8px' }}>
                    Блок не обрано
                </h4>
                <p style={{ fontSize: '0.9rem', maxWidth: '240px' }}>
                    Натисніть на будь-який блок у редакторі або в шарах, щоб налаштувати його.
                </p>
            </div>
        );
    }

    const SettingsComponent = SettingsComponentMap[selectedBlock.type];

    if (!SettingsComponent) {
        return (
             <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--platform-accent)', marginBottom: '1rem' }}>
                    <IconSettings size={32} />
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>{selectedBlock.type}</h4>
                <div style={{ padding: '12px', background: '#fff5f5', color: '#e53e3e', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'start', textAlign: 'left' }}>
                    <IconAlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Компонент налаштувань для цього типу блоку ще розробляється.</span>
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
        <div className="custom-scrollbar" style={{ paddingBottom: '40px' }}>
            <div style={{ 
                paddingBottom: '16px', 
                marginBottom: '16px', 
                borderBottom: '1px solid var(--platform-border-color)',
                display: 'flex', alignItems: 'center', gap: '10px'
            }}>
                <div style={{ 
                    width: '32px', height: '32px', borderRadius: '6px', 
                    background: 'var(--platform-accent-transparent)', color: 'var(--platform-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <IconSettings size={18} />
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--platform-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Налаштування</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', textTransform: 'capitalize' }}>{selectedBlock.type}</div>
                </div>
            </div>
            
            <SettingsGroup 
                title="Основні налаштування" 
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
                title="Вигляд та Анімація" 
                icon={<IconPalette size={18} />}
                defaultOpen={false}
                storageKey={`style_${blockKey}`}
            >
                
                <div style={{ marginBottom: '20px' }}>
                    <Input 
                        label="ID блоку (Якір)"
                        value={selectedBlock.data.anchorId || ''}
                        onChange={handleAnchorChange}
                        placeholder="наприклад: contacts"
                        leftIcon={<span style={{ fontWeight: 'bold', fontSize: '14px' }}>#</span>}
                    />
                    <div style={{ marginTop: '-4px', fontSize: '0.75rem', color: 'var(--platform-text-secondary)', lineHeight: '1.4' }}>
                        Використовується для навігації в меню (Scroll to).
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