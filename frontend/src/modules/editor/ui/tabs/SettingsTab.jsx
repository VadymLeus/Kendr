// frontend/src/modules/editor/ui/tabs/SettingsTab.jsx
import React, { useState, useEffect } from 'react';
import { findBlockByPath } from '../../core/blockUtils';
import ShowCaseSettings from '../../blocks/ShowCase/ShowCaseSettings';
import FeaturesSettings from '../../blocks/Features/FeaturesSettings';
import CatalogSettings from '../../blocks/Catalog/CatalogSettings';
import TextSettings from '../../blocks/Text/TextSettings';
import HeroSettings from '../../blocks/Hero/HeroSettings';
import ImageSettings from '../../blocks/Image/ImageSettings';
import ButtonSettings from '../../blocks/Button/ButtonSettings';
import FormSettings from '../../blocks/Form/FormSettings';
import LayoutSettings from '../../blocks/Layout/LayoutSettings';
import VideoSettings from '../../blocks/Video/VideoSettings';
import MapSettings from '../../blocks/Map/MapSettings';
import AccordionSettings from '../../blocks/Accordion/AccordionSettings';
import SocialIconsSettings from '../../blocks/SocialIcons/SocialIconsSettings';
import HeaderSettings from '../../blocks/Header/HeaderSettings';
import AdvancedSettingsTab from './AdvancedSettingsTab';
import { Settings, FileText, MousePointerClick, AlertCircle, SlidersHorizontal } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('content');

    const selectedBlock = selectedBlockPath 
        ? findBlockByPath(blocks, selectedBlockPath) 
        : null;

    const isHeaderBlock = selectedBlock?.type === 'header';
    useEffect(() => {
        if (isHeaderBlock && activeTab === 'advanced') {
            setActiveTab('content');
        }
    }, [isHeaderBlock, activeTab]);

    if (!selectedBlock) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100%',
                padding: '20px', 
                textAlign: 'center',
                color: 'var(--platform-text-secondary)',
            }}>
                <div style={{ 
                    width: '72px', height: '72px', borderRadius: '50%', background: 'var(--platform-bg)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                    border: '1px solid var(--platform-border-color)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <MousePointerClick size={32} style={{ color: 'var(--platform-accent)', opacity: 0.9 }} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--platform-text-primary)', marginBottom: '8px' }}>
                    Налаштування блоку
                </h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '240px', lineHeight: '1.5' }}>
                    Оберіть будь-який блок у редакторі або в списку шарів, щоб змінити його вміст та вигляд.
                </p>
            </div>
        );
    }

    const SettingsComponent = SettingsComponentMap[selectedBlock.type];

    const handleLiveUpdate = (newData, addToHistory = true) => {
        onUpdateBlockData(selectedBlockPath, newData, addToHistory);
    };

    const TabButton = ({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
            <button
                onClick={() => setActiveTab(id)}
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 4px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--platform-accent)' : '2px solid transparent',
                    color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
            >
                <Icon size={16} />
                <span>{label}</span>
            </button>
        );
    };

    return (
        <div style={{ 
            minHeight: '100%', 
            background: 'var(--platform-sidebar-bg)',
            paddingBottom: '80px',
            position: 'relative' 
        }}>
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                background: 'var(--platform-sidebar-bg)',
                borderBottom: '1px solid var(--platform-border-color)'
            }}>
                <div style={{ 
                    padding: '12px 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            width: '36px', height: '36px', borderRadius: '8px', 
                            background: 'var(--platform-bg)', 
                            border: '1px solid var(--platform-border-color)',
                            color: 'var(--platform-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Settings size={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                                Редагування
                            </div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '700', textTransform: 'capitalize', color: 'var(--platform-text-primary)' }}>
                                {selectedBlock.name || selectedBlock.type}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    padding: '0 16px'
                }}>
                    <TabButton id="content" label="Контент" icon={FileText} />
                    {!isHeaderBlock && (
                        <TabButton id="advanced" label="Вигляд" icon={SlidersHorizontal} />
                    )}
                </div>
            </div>
            
            <div style={{ padding: '16px', animation: 'fadeIn 0.3s ease' }}>
                <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                
                {activeTab === 'content' && (
                    <div>
                        {SettingsComponent ? (
                            <SettingsComponent
                                data={selectedBlock.data}
                                onChange={handleLiveUpdate}
                                siteData={siteData}
                            />
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--platform-border-color)', borderRadius: '8px' }}>
                                <div style={{ color: 'var(--platform-text-secondary)', marginBottom: '1rem' }}>
                                    <AlertCircle size={32} style={{ opacity: 0.5 }} />
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--platform-text-secondary)' }}>
                                    Налаштування контенту для блоку <b>{selectedBlock.type}</b> в розробці.
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'advanced' && !isHeaderBlock && (
                    <AdvancedSettingsTab 
                        data={selectedBlock.data}
                        onUpdate={handleLiveUpdate}
                    />
                )}
            </div>
        </div>
    );
};

export default SettingsTab;