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

    return (
        <div 
            className="fixed inset-0 z-2000 flex justify-center items-center bg-black/60 backdrop-blur-xs" 
            onClick={onClose}
        >
            <div 
                className="bg-(--site-card-bg) border border-(--site-border-color) rounded-xl w-[90%] max-w-175 max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 pb-4 border-b border-(--site-border-color) mb-5">
                    <h4 className="m-0 text-(--site-text-primary) text-xl font-semibold">
                        Налаштування блоку: {block.type}
                    </h4>
                    <button 
                        onClick={onClose} 
                        className="bg-transparent border-none cursor-pointer p-1 rounded flex items-center justify-center text-(--site-text-secondary) transition-all duration-200 hover:bg-black/5 hover:text-(--site-text-primary)"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="px-6 pb-6">
                    {SettingsComponent ? (
                        <>
                            <SettingsComponent 
                                initialData={block.data} 
                                onSave={handleInternalSave} 
                                onClose={onClose}
                                siteData={siteData}
                            />
                            <div className="mt-6 pt-6 border-t border-(--site-border-color)">
                                 <AnimationSettings 
                                    animationConfig={animationConfig} 
                                    onChange={setAnimationConfig} 
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <p className="text-(--site-warning) mb-4">
                                Редактор для цього блоку поки не реалізовано. Ось його дані:
                            </p>
                            <pre className="bg-(--site-bg) p-4 rounded-lg border border-(--site-border-color) text-(--site-text-primary) text-sm whitespace-pre-wrap break-all">
                                {JSON.stringify(block.data, null, 2)}
                            </pre>
                            
                            <div className="mt-4 pt-4 border-t border-(--site-border-color)">
                                <AnimationSettings 
                                    animationConfig={animationConfig} 
                                    onChange={setAnimationConfig} 
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-transparent text-(--site-text-primary) border border-(--site-border-color) rounded-md cursor-pointer font-medium text-sm transition-all hover:bg-black/5"
                                >
                                    Закрити
                                </button>
                                <button
                                    onClick={() => handleInternalSave(block.data)}
                                    className="px-5 py-2.5 bg-(--site-accent) text-(--site-accent-text) border-none rounded-md cursor-pointer font-medium text-sm transition-all shadow-sm hover:opacity-90"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlockSettingsModal;