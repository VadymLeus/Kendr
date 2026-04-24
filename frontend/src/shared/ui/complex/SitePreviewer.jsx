// frontend/src/shared/ui/complex/SitePreviewer.jsx
import React, { useMemo, useState } from 'react';
import BlockRenderer from '../../../modules/editor/core/BlockRenderer';
import FontLoader from '../../../modules/renderer/components/FontLoader';
import { Lock, Layers, Monitor, Smartphone } from 'lucide-react';

const SitePreviewer = ({ 
    previewData, 
    currentBlocks, 
    isLoading = false,
    emptyTitle = "Оберіть шаблон",
    emptyDescription = "Для попереднього перегляду",
    url = "kendr.site",
    userTitle = "",
    userLogo = ""
}) => {
    const [viewMode, setViewMode] = useState('desktop');
    const blockInput = (e) => { e.preventDefault(); e.stopPropagation(); };
    const simulatedSiteData = useMemo(() => {
        const baseSettings = previewData?.siteData || {};
        const themeSettings = previewData?.theme || {};
        const mergedTitle = userTitle || baseSettings.title || 'My Site';
        const mergedLogo = userLogo || baseSettings.logo_url || null;
        return {
            id: 'preview',
            title: mergedTitle,
            logo_url: mergedLogo,
            site_theme_mode: themeSettings.mode || themeSettings.site_theme_mode || 'light',
            site_theme_accent: themeSettings.accent || themeSettings.site_theme_accent || 'orange',
            theme_settings: themeSettings,
            site_name: mergedTitle 
        };
    }, [previewData, userTitle, userLogo]);

    const injectHeaderData = (block) => {
        if (block.type === 'header' || block.type === 'global-header') {
            return {
                ...block,
                data: {
                    ...(block.data || {}),
                    site_title: userTitle || block.data?.site_title || simulatedSiteData.title,
                    logo_src: userLogo || block.data?.logo_src || simulatedSiteData.logo_url,
                    show_title: block.data?.show_title !== undefined ? block.data.show_title : true
                }
            };
        }
        return block;
    };

    const injectedHeaderBlocks = useMemo(() => {
        if (!previewData?.header || !Array.isArray(previewData.header)) return [];
        return previewData.header.map(injectHeaderData);
    }, [previewData, userTitle, userLogo, simulatedSiteData]);

    const processedCurrentBlocks = useMemo(() => {
        if (!Array.isArray(currentBlocks)) return [];
        return currentBlocks.map(injectHeaderData);
    }, [currentBlocks, userTitle, userLogo, simulatedSiteData]);

    const hasCanvasHeader = useMemo(() => {
        return processedCurrentBlocks.some(block => block.type === 'header' || block.type === 'global-header');
    }, [processedCurrentBlocks]);

    return (
        <div className="flex-1 flex flex-col h-full bg-(--platform-bg) relative overflow-hidden min-h-0 min-w-0 pb-16 md:pb-0">
            <style>{`
                .site-header-logo-text, .logo-text, h1.logo {
                    max-width: 200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: inline-block;
                    vertical-align: middle;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="h-14 bg-(--platform-card-bg) border-b border-(--platform-border-color) flex items-center px-4 gap-4 shrink-0 justify-between shadow-sm relative z-10">
                <div className="hidden sm:flex gap-2 w-24 shrink-0">
                     <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] opacity-80"></div>
                     <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] opacity-80"></div>
                     <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] opacity-80"></div>
                </div>
                <div className="flex-1 max-w-full sm:max-w-xl mx-auto min-w-0">
                     <div className="bg-(--platform-input-bg) h-9 rounded-md border border-(--platform-border-color) flex items-center px-3 text-xs text-(--platform-text-secondary) shadow-sm transition-all">
                         <span className="text-(--platform-text-secondary) mr-2 opacity-50"><Lock size={12} /></span>
                         <span className="text-(--platform-text-primary) truncate">{url}</span>
                     </div>
                </div>
                <div className="flex items-center justify-end gap-1 w-24 shrink-0">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${viewMode === 'desktop' ? 'bg-(--platform-border-color) text-(--platform-text-primary)' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary) hover:bg-(--platform-hover-bg)'}`}
                        title="ПК версія"
                    >
                        <Monitor size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${viewMode === 'mobile' ? 'bg-(--platform-border-color) text-(--platform-text-primary)' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary) hover:bg-(--platform-hover-bg)'}`}
                        title="Мобільна версія"
                    >
                        <Smartphone size={16} />
                    </button>
                </div>
            </div>
            <div className={`flex-1 overflow-hidden relative min-h-0 flex items-center justify-center transition-all duration-300 ${viewMode === 'mobile' ? 'bg-black/5 dark:bg-white/5 p-4 sm:p-8' : 'p-0'}`}>
                 <div className={`shadow-sm overflow-hidden flex flex-col bg-(--site-bg) mx-auto transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${viewMode === 'mobile' ? 'w-full max-w-93.75 h-full border border-(--platform-border-color) rounded-[2.5rem] shadow-2xl ring-8 ring-black/5 dark:ring-white/5' : 'w-full h-full'}`}>
                    <div 
                        className={`flex-1 site-theme-context overflow-y-auto custom-scrollbar ${viewMode === 'mobile' ? 'hide-scrollbar' : ''}`}
                        data-site-mode={simulatedSiteData.site_theme_mode}
                        data-site-accent={simulatedSiteData.site_theme_accent}
                        style={{ backgroundColor: 'var(--site-bg)', color: 'var(--site-text-primary)' }}
                        onClickCapture={blockInput}
                        onChangeCapture={blockInput}
                        onSubmitCapture={blockInput}
                    >
                        {previewData && !isLoading ? (
                            <div className="flex flex-col min-h-full">
                                {previewData.theme && (
                                    <FontLoader 
                                        fontHeading={previewData.theme.font_heading} 
                                        fontBody={previewData.theme.font_body} 
                                    />
                                )}
                                <div 
                                    className="site-wysiwyg-wrapper flex-1 flex flex-col" 
                                    style={{ backgroundColor: 'transparent' }} 
                                    data-site-mode={simulatedSiteData.site_theme_mode} 
                                    data-site-accent={simulatedSiteData.site_theme_accent}
                                >
                                    {injectedHeaderBlocks && injectedHeaderBlocks.length > 0 && !hasCanvasHeader && (
                                        <BlockRenderer blocks={injectedHeaderBlocks} siteData={simulatedSiteData} />
                                    )}
                                    <main className="flex-1 flex flex-col">
                                        {processedCurrentBlocks.length > 0 ? (
                                            <BlockRenderer blocks={processedCurrentBlocks} siteData={simulatedSiteData} />
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-50 sm:min-h-100">
                                                <div 
                                                    className="p-4 sm:p-5 rounded-2xl mb-4 sm:mb-5 flex items-center justify-center" 
                                                    style={{ backgroundColor: 'color-mix(in srgb, var(--site-text-primary) 5%, transparent)' }}
                                                >
                                                    <Layers size={36} className="sm:w-10.5 sm:h-10.5" strokeWidth={1.5} style={{ color: 'var(--site-text-primary)', opacity: 0.6 }}/>
                                                </div>
                                                <p className="text-lg sm:text-xl font-medium" style={{ color: 'var(--site-text-primary)' }}>
                                                    Шаблон порожній
                                                </p>
                                                <p className="text-xs sm:text-sm mt-2 text-center max-w-xs" style={{ color: 'var(--site-text-primary)', opacity: 0.6 }}>
                                                    Цей шаблон не містить жодного збереженого блоку контенту.
                                                </p>
                                            </div>
                                        )}
                                    </main>

                                    {Array.isArray(previewData.footer) && previewData.footer.length > 0 && (
                                        <BlockRenderer blocks={previewData.footer} siteData={simulatedSiteData} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 sm:p-12 min-h-full">
                                <div 
                                    className="p-4 sm:p-5 rounded-2xl mb-4 sm:mb-5 flex items-center justify-center" 
                                    style={{ backgroundColor: 'color-mix(in srgb, var(--site-text-primary) 5%, transparent)' }}
                                >
                                    <Layers size={36} className="sm:w-10.5 sm:h-10.5" strokeWidth={1.5} style={{ color: 'var(--site-text-primary)', opacity: 0.6 }}/>
                                </div>
                                <p className="text-lg sm:text-xl font-medium text-center" style={{ color: 'var(--site-text-primary)' }}>
                                    {emptyTitle}
                                </p>
                                <p className="text-xs sm:text-sm mt-2 text-center max-w-xs" style={{ color: 'var(--site-text-primary)', opacity: 0.6 }}>
                                    {emptyDescription}
                                </p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default SitePreviewer;