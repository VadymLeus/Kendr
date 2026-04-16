// frontend/src/shared/ui/complex/SitePreviewer.jsx
import React, { useMemo } from 'react';
import BlockRenderer from '../../../modules/editor/core/BlockRenderer';
import FontLoader from '../../../modules/renderer/components/FontLoader';
import { Monitor, Smartphone, Lock, Layout as LayoutIcon, Layers } from 'lucide-react';

const SitePreviewer = ({ 
    viewMode, 
    setViewMode, 
    previewData, 
    currentBlocks, 
    isLoading = false,
    emptyTitle = "Оберіть шаблон",
    emptyDescription = "Для попереднього перегляду",
    url = "kendr.site",
    userTitle = "",
    userLogo = ""
}) => {
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
        <div className="flex-1 flex flex-col h-full bg-(--platform-bg) relative overflow-hidden min-h-0 min-w-0">
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
                .view-mode-toggle { 
                    display: flex; 
                    background: var(--platform-bg); 
                    padding: 2px; 
                    border-radius: 8px; 
                    gap: 2px; 
                    border: 1px solid var(--platform-border-color); 
                    height: 36px; 
                }
                .mode-btn { 
                    width: 32px; 
                    height: 100%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 6px; 
                    border: none; 
                    background: transparent; 
                    color: var(--platform-text-secondary); 
                    cursor: pointer; 
                    transition: all 0.2s ease; 
                }
                .mode-btn:hover { 
                    color: var(--platform-text-primary); 
                    background: var(--platform-hover-bg); 
                }
                .mode-btn.active { 
                    background: var(--platform-card-bg); 
                    color: var(--platform-accent); 
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); 
                }
            `}</style>
            <div className="h-14 bg-(--platform-card-bg) border-b border-(--platform-border-color) flex items-center px-4 gap-4 shrink-0 justify-between shadow-sm relative">
                <div className="flex gap-2 w-20">
                     <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] opacity-80"></div>
                     <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] opacity-80"></div>
                     <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] opacity-80"></div>
                </div>
                <div className="flex-1 max-w-xl mx-auto min-w-0">
                     <div className="bg-(--platform-input-bg) h-9 rounded-md border border-(--platform-border-color) flex items-center px-3 text-xs text-(--platform-text-secondary) shadow-sm">
                         <span className="text-(--platform-text-secondary) mr-2 opacity-50"><Lock size={12} /></span>
                         <span className="text-(--platform-text-primary) truncate">{url}</span>
                     </div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                     <div className="view-mode-toggle">
                         <button
                             className={`mode-btn ${viewMode === 'desktop' ? 'active' : ''}`}
                             onClick={() => setViewMode('desktop')}
                             title="ПК версія"
                         >
                             <Monitor size={16} />
                         </button>
                         <button
                             className={`mode-btn ${viewMode === 'mobile' ? 'active' : ''}`}
                             onClick={() => setViewMode('mobile')}
                             title="Мобільна версія"
                         >
                             <Smartphone size={16} />
                         </button>
                     </div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative min-h-0 flex items-center justify-center p-4">
                 <div 
                    className={`
                        transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-sm overflow-hidden flex flex-col bg-(--site-bg)
                        ${viewMode === 'mobile' 
                            ? 'w-93.75 h-187.5 max-h-[90%] rounded-[40px] border-12 border-[#2d2d2d] shadow-2xl' 
                            : 'w-full h-full rounded-none border-none'
                        }
                    `}
                 >
                    <div 
                        className={`flex-1 site-theme-context ${viewMode === 'mobile' ? 'overflow-y-auto overflow-x-hidden hide-scrollbar' : 'overflow-y-auto custom-scrollbar'}`}
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
                                            <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-100">
                                                <div 
                                                    className="p-5 rounded-2xl mb-5 flex items-center justify-center" 
                                                    style={{ backgroundColor: 'color-mix(in srgb, var(--site-text-primary) 5%, transparent)' }}
                                                >
                                                    <Layers size={42} strokeWidth={1.5} style={{ color: 'var(--site-text-primary)', opacity: 0.6 }}/>
                                                </div>
                                                <p className="text-xl font-medium" style={{ color: 'var(--site-text-primary)' }}>
                                                    Шаблон порожній
                                                </p>
                                                <p className="text-sm mt-2 text-center max-w-xs" style={{ color: 'var(--site-text-primary)', opacity: 0.6 }}>
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
                            <div className="h-full flex flex-col items-center justify-center p-12 min-h-full">
                                <div 
                                    className="p-5 rounded-2xl mb-5 flex items-center justify-center" 
                                    style={{ backgroundColor: 'color-mix(in srgb, var(--site-text-primary) 5%, transparent)' }}
                                >
                                    <Layers size={42} strokeWidth={1.5} style={{ color: 'var(--site-text-primary)', opacity: 0.6 }}/>
                                </div>
                                <p className="text-xl font-medium text-center" style={{ color: 'var(--site-text-primary)' }}>
                                    {emptyTitle}
                                </p>
                                <p className="text-sm mt-2 text-center max-w-xs" style={{ color: 'var(--site-text-primary)', opacity: 0.6 }}>
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