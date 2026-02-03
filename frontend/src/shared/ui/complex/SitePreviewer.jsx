// frontend/src/shared/ui/complex/SitePreviewer.jsx
import React, { useMemo } from 'react';
import BlockRenderer from '../../../modules/editor/core/BlockRenderer';
import FontLoader from '../../../modules/renderer/components/FontLoader';
import { Monitor, Smartphone, Lock, AlertCircle, Layout } from 'lucide-react';

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
            site_theme_mode: themeSettings.mode || 'light',
            site_theme_accent: themeSettings.accent || 'blue',
            theme_settings: themeSettings,
            site_name: mergedTitle 
        };
    }, [previewData, userTitle, userLogo]);

    const injectedHeaderBlocks = useMemo(() => {
        if (!previewData.header) return [];
        return previewData.header.map(block => {
            if (block.type === 'header') {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        site_title: userTitle || block.data.site_title,
                        logo_src: userLogo || block.data.logo_src,
                        show_title: userTitle ? true : block.data.show_title
                    }
                };
            }
            return block;
        });
    }, [previewData.header, userTitle, userLogo]);

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50 relative overflow-hidden min-h-0 z-10 min-w-0">
            <style>{`
                .site-header-logo-text, .logo-text, h1.logo {
                    max-width: 200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: inline-block;
                    vertical-align: middle;
                }
            `}</style>

            <div className="h-14 bg-(--platform-card-bg) border-b border-(--platform-border-color) flex items-center px-4 gap-4 shrink-0 justify-between z-10 shadow-sm">
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

                <div className="flex items-center gap-3 w-20 justify-end">
                     <div className="flex bg-(--platform-input-bg) rounded-lg p-0.5 border border-(--platform-border-color)">
                         <button 
                            onClick={() => setViewMode('desktop')} 
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-(--platform-accent) text-(--platform-accent-text)' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`}
                            title="Десктоп"
                        >
                            <Monitor size={14} />
                        </button>
                         <button 
                            onClick={() => setViewMode('mobile')} 
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-(--platform-accent) text-(--platform-accent-text)' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`}
                            title="Мобільний"
                        >
                            <Smartphone size={14} />
                        </button>
                     </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative min-h-0 flex items-center justify-center p-4">
                 <div 
                    className={`
                        transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-sm overflow-hidden flex flex-col bg-(--site-bg)
                        ${viewMode === 'mobile' 
                            ? 'w-93.75 h-203 max-h-[90%] rounded-[40px] border-12 border-[#2d2d2d] shadow-2xl' 
                            : 'w-full h-full rounded-none border-none'
                        }
                    `}
                 >
                    <div 
                        className="flex-1 overflow-y-auto custom-scrollbar site-theme-context"
                        data-site-mode={simulatedSiteData.site_theme_mode}
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
                                    {injectedHeaderBlocks && (
                                        <BlockRenderer blocks={injectedHeaderBlocks} siteData={simulatedSiteData} />
                                    )}

                                    <main className="flex-1">
                                        {currentBlocks && currentBlocks.length > 0 ? (
                                            <BlockRenderer blocks={currentBlocks} siteData={simulatedSiteData} />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center p-20 text-gray-300 gap-4 min-h-60">
                                                <AlertCircle size={48} strokeWidth={1} className="opacity-50"/>
                                                <p className="text-lg font-medium text-center">Шаблон порожній</p>
                                            </div>
                                        )}
                                    </main>

                                    {previewData.footer && (
                                        <BlockRenderer blocks={previewData.footer} siteData={simulatedSiteData} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-20 text-gray-300 gap-4 min-h-full">
                                <Layout size={64} strokeWidth={1} />
                                <p className="text-lg font-medium text-center">{emptyTitle}</p>
                                <p className="text-sm text-center opacity-70">{emptyDescription}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SitePreviewer;