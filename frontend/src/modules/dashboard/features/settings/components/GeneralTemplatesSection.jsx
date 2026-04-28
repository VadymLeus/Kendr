// frontend/src/modules/dashboard/features/settings/components/GeneralTemplatesSection.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../../../../shared/api/api';
import { Button } from '../../../../../shared/ui/elements/Button';
import ConfirmModal from '../../../../../shared/ui/complex/ConfirmModal';
import TemplateModal from '../../../components/TemplateModal';
import EmptyState from '../../../../../shared/ui/complex/EmptyState';
import SitePreviewer from '../../../../../shared/ui/complex/SitePreviewer';
import LoadingState from '../../../../../shared/ui/complex/LoadingState';
import TemplateCard from '../../../../../shared/ui/complex/TemplateCard';
import TemplateFilters from '../../../../../shared/ui/complex/TemplateFilters';
import TemplateBadge from '../../../../../shared/ui/complex/TemplateBadge';
import { AuthContext } from '../../../../../app/providers/AuthContext';
import { BASE_URL } from '../../../../../shared/config';
import { useTemplateManager } from '../../../../../shared/hooks/useTemplateManager';
import { getTemplatePreviewData } from '../../../../../shared/utils/templateUtils';
import { Palette, Plus, Construction, Layout, ChevronLeft, ChevronRight, Copy, ArrowUpCircle, Check, Edit, Trash, Loader } from 'lucide-react';

const GeneralTemplatesSection = ({ siteData, isAdmin }) => {
    const { user } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState('desktop');
    const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const isStaff = user?.role === 'admin' || user?.role === 'moderator' || isAdmin;
    const manager = useTemplateManager({ isAdmin: isStaff, initialSourceTab: isStaff ? 'system' : 'personal' });
    useEffect(() => {
        if (!manager.isLoading) {
            setIsInitialLoad(false);
        }
    }, [manager.isLoading]);

    const handleSaveTemplate = async (name, description, thumbnailUrl, category, overwriteId) => {
        if (!siteData?.id) return toast.error("Помилка: Не знайдено ID сайту");
        if (!name) return toast.error("Вкажіть назву шаблону");
        try {
            const payload = { 
                siteId: siteData.id, templateName: name, description,
                thumbnail_url: thumbnailUrl, category: category || 'General', icon: 'Layout' 
            };
            if (isStaff) {
                await apiClient.post('/admin/templates', payload);
                toast.success(`Системний шаблон "${name}" збережено як чернетку!`);
            } else {
                if (overwriteId) {
                    await apiClient.put(`/user-templates/${overwriteId}`, payload);
                    toast.success(`Шаблон "${name}" оновлено!`);
                } else {
                    await apiClient.post('/user-templates', payload);
                    toast.success(`Шаблон "${name}" створено!`);
                }
            }
            setIsSaveTemplateModalOpen(false);
            manager.fetchTemplates();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка збереження шаблону');
        }
    };

    const handleConfirmAction = async () => {
        const { template, actionType } = manager.modals.confirmModal;
        await manager.actions.handleAction(actionType, template, { siteId: siteData.id });
        manager.modals.setConfirmModal({ isOpen: false, template: null, actionType: null });
    };

    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    };

    const displayTemplates = useMemo(() => {
        if (manager.filters.templateSourceTab === 'system') {
            return [{ id: 'blank', isBlank: true, name: 'Пустий сайт' }, ...manager.templates];
        }
        return manager.templates;
    }, [manager.templates, manager.filters.templateSourceTab]);

    const previewData = useMemo(() => {
        if (manager.selectedTemplateId === 'blank') {
            return { 
                pages: [{ slug: 'home', name: 'Головна', blocks: [] }], 
                theme: { mode: 'light', accent: 'blue' }, 
                header: [], 
                footer: [], 
                siteData: {} 
            };
        }
        return getTemplatePreviewData(manager.selectedTemplate);
    }, [manager.selectedTemplate, manager.selectedTemplateId]);

    let modalConfig = { title: "", message: "", confirmLabel: "", type: "primary" };
    if (manager.modals.confirmModal.actionType === 'apply') {
        const tplName = manager.modals.confirmModal.template?.id === 'blank' ? 'Пустий сайт' : manager.modals.confirmModal.template?.name;
        modalConfig = { title: "Застосувати шаблон?", message: `УВАГА: Це повністю замінить поточний дизайн вашого сайту на "${tplName}". Всі поточні дані будуть видалені!`, confirmLabel: "Застосувати", type: "warning" };
    } else if (manager.modals.confirmModal.actionType === 'delete') {
        modalConfig = { title: "Видалити шаблон?", message: `Ви впевнені, що хочете видалити шаблон "${manager.modals.confirmModal.template?.name}"?`, confirmLabel: "Видалити", type: "danger" };
    } else if (manager.modals.confirmModal.actionType === 'copy') {
        modalConfig = { title: "Скопіювати шаблон?", message: "Створити копію цього шаблону? Вона буде збережена як чернетка.", confirmLabel: "Скопіювати", type: "primary" };
    } else if (manager.modals.confirmModal.actionType === 'markReady') {
        modalConfig = { title: "Відправити на перевірку?", message: "Шаблон стане доступним для інших адмінів.", confirmLabel: "Відправити", type: "primary" };
    } else if (manager.modals.confirmModal.actionType === 'revertDraft') {
        modalConfig = { title: "Повернути в чернетки?", message: "Шаблон буде знято з перевірки.", confirmLabel: "Повернути", type: "warning" };
    }
    if (isInitialLoad) return (
        <div className="h-150 flex items-center justify-center rounded-2xl border mb-6 shadow-sm" style={{ backgroundColor: 'var(--platform-card-bg)', borderColor: 'var(--platform-border-color)' }}>
            <LoadingState title="Завантаження шаблонів..." />
        </div>
    );

    return (
        <>
            <style>{`
                .templates-full-bleed {
                    width: 100vw;
                    margin-left: calc(50% - 50vw);
                    margin-right: calc(50% - 50vw);
                    border-radius: 0;
                    border-left: none;
                    border-right: none;
                }
                @media (min-width: 768px) {
                    .templates-full-bleed {
                        width: 100%;
                        margin-left: 0;
                        margin-right: 0;
                        border-radius: 16px;
                        border-left: 1px solid var(--platform-border-color);
                        border-right: 1px solid var(--platform-border-color);
                    }
                }
            `}</style>
            
            <div 
                className="templates-full-bleed border-y md:border mb-6 shadow-sm flex relative overflow-hidden bg-(--platform-bg) border-(--platform-border-color)" 
                style={{ height: 'calc(100vh - 120px)', minHeight: '700px' }}
            >
                <TemplateModal isOpen={isSaveTemplateModalOpen} onClose={() => setIsSaveTemplateModalOpen(false)} onSave={handleSaveTemplate} />
                <TemplateModal isOpen={manager.modals.isEditModalOpen} initialData={manager.modals.editingTemplate} onClose={() => { manager.modals.setIsEditModalOpen(false); manager.modals.setEditingTemplate(null); }} onSave={manager.actions.handleSaveTemplateChanges} />
                <ConfirmModal 
                    isOpen={manager.modals.confirmModal.isOpen} 
                    title={modalConfig.title} 
                    message={modalConfig.message} 
                    onConfirm={handleConfirmAction} 
                    onCancel={() => manager.modals.setConfirmModal({ isOpen: false, template: null, actionType: null })} 
                    confirmLabel={modalConfig.confirmLabel} 
                    type={modalConfig.type} 
                />
                <div 
                    className={`
                        flex flex-col h-full bg-(--platform-card-bg) z-20 shrink-0 overflow-hidden
                        transition-all duration-300 ease-in-out absolute md:relative
                        ${isSidebarOpen 
                            ? 'w-[calc(100%-28px)] md:w-90 lg:w-115 xl:w-140 opacity-100 border-r border-(--platform-border-color) shadow-[10px_0_15px_-3px_rgba(0,0,0,0.05)]' 
                            : 'w-0 opacity-0 md:opacity-100 border-none pointer-events-none md:pointer-events-auto'}
                    `}
                >
                    <div className="w-full h-full flex flex-col shrink-0">
                        <div className="p-4 md:p-5 border-b border-(--platform-border-color) shrink-0 bg-(--platform-card-bg)">
                            <div className="flex justify-between items-center m-0">
                                <h3 className="text-base md:text-lg xl:text-xl font-bold m-0 flex items-center gap-2 text-(--platform-text-primary)">
                                    <Palette size={20} className="text-(--platform-accent) shrink-0" /> 
                                    <span className="hidden lg:inline">Бібліотека шаблонів</span>
                                    <span className="lg:hidden">Шаблони</span>
                                </h3>
                                <Button variant="primary" size="sm" onClick={() => setIsSaveTemplateModalOpen(true)}>
                                    {isStaff && <Plus size={16} />} 
                                    <span className="hidden xl:inline">{isStaff ? "Новий шаблон" : "Зберегти свій"}</span>
                                    <span className="xl:hidden">{isStaff ? "Новий" : "Зберегти"}</span>
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 md:px-5 pb-6 pt-0 bg-(--platform-bg) min-h-0 [scrollbar-gutter:stable] relative">
                            <div className="sticky top-0 -mx-3 md:-mx-5 px-3 md:px-5 pt-4 pb-2 bg-(--platform-bg)/95 z-20 mb-4 backdrop-blur-sm border-b border-transparent transition-all">
                                <TemplateFilters filters={manager.filters} isAdmin={isStaff} />
                            </div>
                            {manager.isLoading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--platform-bg)/50 backdrop-blur-sm rounded-xl">
                                    <Loader size={32} className="animate-spin text-(--platform-accent)" />
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 pb-4 px-1 relative">
                                {displayTemplates.length > 0 ? displayTemplates.map(tpl => {
                                    if (tpl.id === 'blank') {
                                        const isSelected = manager.selectedTemplateId === 'blank';
                                        return (
                                            <div 
                                                key="blank"
                                                onClick={() => manager.setSelectedTemplateId('blank')}
                                                className={`relative flex flex-col items-center justify-center p-4 xl:p-6 rounded-2xl cursor-pointer transition-all duration-200 h-full min-h-52 bg-(--platform-bg) hover:border-(--platform-accent) group ${isSelected ? 'border-2 border-(--platform-accent) ring-4 ring-(--platform-accent)/10' : 'border-2 border-dashed border-(--platform-border-color)'}`}
                                            >
                                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full shadow-sm flex items-center justify-center mb-3 md:mb-5 transition-all duration-300 ${isSelected ? 'bg-(--platform-accent) text-white scale-110' : 'bg-(--platform-card-bg) text-(--platform-text-secondary) group-hover:text-(--platform-accent) group-hover:scale-110'}`}>
                                                    <Layout size={24} className="md:w-8 md:h-8" />
                                                </div>
                                                <h3 className="text-base md:text-lg xl:text-xl font-bold text-(--platform-text-primary) mb-2 text-center">Пустий сайт</h3>
                                                <p className="text-xs text-(--platform-text-secondary) text-center max-w-[90%]">
                                                    Почніть з чистого аркуша.
                                                </p>
                                                {isSelected && (
                                                    <div className="absolute top-3 right-3 w-6 h-6 bg-(--platform-accent) text-white rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                                                        <Check size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return (
                                        <TemplateCard 
                                            key={tpl.id}
                                            template={tpl}
                                            isSelected={manager.selectedTemplateId === tpl.id}
                                            onClick={() => manager.setSelectedTemplateId(tpl.id)}
                                            getFullUrl={getFullUrl}
                                            badge={<TemplateBadge template={tpl} user={user} isAdmin={isStaff} sourceTab={manager.filters.templateSourceTab} />}
                                            actions={(manager.filters.templateSourceTab === 'personal' || isStaff) && (
                                                <>
                                                    {isStaff && manager.filters.templateSourceTab === 'system' && (
                                                        <>
                                                            {!tpl.is_ready ? (
                                                                <button onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'markReady' }); }} className="p-1.5 text-(--platform-text-secondary) hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-md transition-colors border border-transparent hover:border-orange-500/30" title="Відправити на перевірку"><ArrowUpCircle size={14} /></button>
                                                            ) : tpl.access_level !== 'public' && (
                                                                <button onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'revertDraft' }); }} className="p-1.5 text-(--platform-text-secondary) hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-md transition-colors border border-transparent hover:border-orange-500/30" title="Повернути в чернетки"><Construction size={14} /></button>
                                                            )}
                                                            <button onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'copy' }); }} className="p-1.5 text-(--platform-text-secondary) hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-md transition-colors border border-transparent hover:border-indigo-500/30" title="Скопіювати як чернетку"><Copy size={14} /></button>
                                                        </>
                                                    )}
                                                    <button onClick={(e) => { e.stopPropagation(); manager.modals.setEditingTemplate(tpl); manager.modals.setIsEditModalOpen(true); }} className="p-1.5 text-(--platform-text-secondary) hover:text-(--platform-accent) hover:bg-(--platform-bg) rounded-md transition-colors border border-transparent hover:border-(--platform-accent)/30" title="Редагувати шаблон"><Edit size={14}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'delete' }); }} className="p-1.5 text-(--platform-text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors border border-transparent hover:border-red-500/30" title="Видалити шаблон"><Trash size={14}/></button>
                                                </>
                                            )}
                                        />
                                    );
                                }) : <div className="col-span-1 sm:col-span-2 mt-10"><EmptyState title="Не знайдено" description="Спробуйте змінити фільтри" icon={Layout}/></div>}
                            </div>
                        </div>
                        <div className="p-4 md:p-5 bg-(--platform-card-bg) border-t border-(--platform-border-color) shrink-0">
                            <Button 
                                variant="primary" 
                                className="w-full py-3 justify-center text-sm md:text-base h-11.5" 
                                disabled={!manager.selectedTemplateId}
                                onClick={() => {
                                    const templateObj = manager.selectedTemplateId === 'blank' ? { id: 'blank', name: 'Пустий сайт' } : manager.selectedTemplate;
                                    manager.modals.setConfirmModal({ isOpen: true, template: templateObj, actionType: 'apply' });
                                }}
                            >
                                <Check size={18} className="mr-2" /> Застосувати обраний шаблон
                            </Button>
                        </div>
                    </div>
                </div>
                <div 
                    className={`
                        flex absolute z-30 top-1/2 -translate-y-1/2 items-center justify-center transition-all duration-300 ease-in-out
                        ${isSidebarOpen ? 'left-[calc(100%-28px)] md:left-90 lg:left-115 xl:left-140 md:-ml-px' : 'left-0'}
                    `}
                >
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        title={isSidebarOpen ? "Згорнути панель" : "Розгорнути панель"} 
                        className={`group flex items-center justify-center w-7 h-28 bg-(--platform-card-bg) border border-(--platform-border-color) shadow-md cursor-pointer transition-all duration-200 focus:outline-none rounded-r-xl ${isSidebarOpen ? 'border-l-0' : ''}`}
                    >
                        <div className="transition-transform duration-200 group-hover:scale-110 text-(--platform-text-secondary) group-hover:text-(--platform-accent)">
                            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </div>
                    </button>
                </div>
                <div className="flex-1 min-w-0 h-full relative bg-(--platform-bg)">
                    <SitePreviewer 
                        viewMode={viewMode} 
                        setViewMode={setViewMode} 
                        previewData={previewData} 
                        currentBlocks={previewData?.pages[0]?.blocks || []} 
                        isLoading={manager.isLoading}
                        emptyTitle="Оберіть шаблон" 
                        emptyDescription="Виберіть шаблон зі списку, щоб побачити як виглядатиме ваш сайт" 
                        url={manager.selectedTemplateId ? (manager.selectedTemplateId === 'blank' ? 'kendr.site/blank' : `kendr.site/templates/${manager.selectedTemplateId}`) : ''}
                        userTitle={siteData?.title || ""}
                        userLogo={siteData?.logo_url ? getFullUrl(siteData.logo_url) : ""}
                    />
                </div>
            </div>
        </>
    );
};

export default GeneralTemplatesSection;