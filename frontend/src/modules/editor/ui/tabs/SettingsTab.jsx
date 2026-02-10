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
            <div className="flex flex-col items-center justify-center min-h-full p-5 text-center text-(--platform-text-secondary)">
                <div className="w-18 h-18 rounded-full bg-(--platform-bg) flex items-center justify-center mb-5 border border-(--platform-border-color) shadow-sm">
                    <MousePointerClick size={32} className="text-(--platform-accent) opacity-90" />
                </div>
                <h3 className="text-[1.05rem] font-semibold text-(--platform-text-primary) mb-2">
                    Налаштування блоку
                </h3>
                <p className="text-[0.85rem] max-w-60 leading-relaxed">
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
                className={`
                    flex-1 flex items-center justify-center gap-2 py-2.5 bg-transparent border-none border-b-2 text-[0.9rem] cursor-pointer transition-all duration-200
                    ${isActive 
                        ? 'border-(--platform-accent) text-(--platform-accent) font-semibold' 
                        : 'border-transparent text-(--platform-text-secondary) font-medium hover:text-(--platform-text-primary)'}
                `}
            >
                <Icon size={16} />
                <span>{label}</span>
            </button>
        );
    };

    return (
        <div className="min-h-full bg-(--platform-sidebar-bg) pb-20 relative">
            <div className="sticky top-0 z-20 bg-(--platform-sidebar-bg) border-b border-(--platform-border-color)">
                <div className="p-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-(--platform-bg) border border-(--platform-border-color) text-(--platform-accent) flex items-center justify-center">
                            <Settings size={18} />
                        </div>
                        <div>
                            <div className="text-[0.7rem] text-(--platform-text-secondary) uppercase font-bold tracking-wider">
                                Редагування
                            </div>
                            <div className="text-[1.05rem] font-bold capitalize text-(--platform-text-primary)">
                                {selectedBlock.name || selectedBlock.type}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex px-4">
                    <TabButton id="content" label="Контент" icon={FileText} />
                    {!isHeaderBlock && (
                        <TabButton id="advanced" label="Вигляд" icon={SlidersHorizontal} />
                    )}
                </div>
            </div>
            
            <div className="p-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
                {activeTab === 'content' && (
                    <div>
                        {SettingsComponent ? (
                            <SettingsComponent
                                data={selectedBlock.data}
                                onChange={handleLiveUpdate}
                                siteData={siteData}
                            />
                        ) : (
                            <div className="p-8 text-center border border-dashed border-(--platform-border-color) rounded-lg">
                                <div className="text-(--platform-text-secondary) mb-4 flex justify-center">
                                    <AlertCircle size={32} className="opacity-50" />
                                </div>
                                <div className="text-[0.9rem] text-(--platform-text-secondary)">
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