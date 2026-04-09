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
    if (isInitialLoad) return <div className="h-150 flex items-center justify-center bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color)"><LoadingState title="Завантаження шаблонів..." /></div>;
    return (
        <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) mb-6 shadow-sm overflow-hidden flex flex-col relative" style={{ height: 'calc(100vh - 120px)', minHeight: '700px' }}>
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
            <div className="flex flex-1 overflow-hidden">
                <div style={{
                    width: isSidebarOpen ? '38%' : '0px', minWidth: isSidebarOpen ? '350px' : '0px', opacity: isSidebarOpen ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)', display: 'flex', flexDirection: 'column',
                    borderRight: isSidebarOpen ? '1px solid var(--platform-border-color)' : 'none', flexShrink: 0
                }}>
                    <div className="p-5 border-b border-(--platform-border-color) shrink-0 bg-(--platform-bg)/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-(--platform-text-primary) m-0 flex items-center gap-2">
                                <Palette size={20} className="text-(--platform-accent)" /> Бібліотека шаблонів
                            </h3>
                            <Button variant="primary" size="sm" onClick={() => setIsSaveTemplateModalOpen(true)}>
                                <Plus size={16} /> {isStaff ? "Новий шаблон" : "Зберегти свій"}
                            </Button>
                        </div>
                        <TemplateFilters filters={manager.filters} isAdmin={isStaff} compact={true} />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-(--platform-bg) relative">
                        {manager.isLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--platform-bg)/50 backdrop-blur-[2px]">
                                <Loader size={32} className="animate-spin text-(--platform-accent)" />
                            </div>
                        )}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {displayTemplates.length > 0 ? displayTemplates.map(tpl => {
                                if (tpl.id === 'blank') {
                                    const isSelected = manager.selectedTemplateId === 'blank';
                                    return (
                                        <div 
                                            key="blank"
                                            onClick={() => manager.setSelectedTemplateId('blank')}
                                            className={`relative flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-all duration-200 h-full min-h-75 bg-(--platform-bg) hover:border-(--platform-accent) group ${isSelected ? 'border-2 border-(--platform-accent) ring-4 ring-(--platform-accent)/10' : 'border-2 border-dashed border-(--platform-border-color)'}`}
                                        >
                                            <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center mb-5 transition-all duration-300 ${isSelected ? 'bg-(--platform-accent) text-white scale-110' : 'bg-(--platform-card-bg) text-(--platform-text-secondary) group-hover:text-(--platform-accent) group-hover:scale-110'}`}>
                                                <Layout size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-(--platform-text-primary) mb-3">Пустий сайт</h3>
                                            <p className="text-sm text-(--platform-text-secondary) text-center max-w-[85%]">
                                                Почніть з чистого аркуша і створіть свій ідеальний сайт.
                                            </p>
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 w-7 h-7 bg-(--platform-accent) text-white rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                                                    <Check size={16} />
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
                                            <div className="flex gap-2 w-full justify-end mt-2 pt-2 border-t border-(--platform-border-color)">
                                                {isStaff && manager.filters.templateSourceTab === 'system' && (
                                                    <>
                                                        {!tpl.is_ready ? (
                                                            <button onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'markReady' }); }} className="p-1.5 text-(--platform-text-secondary) hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-md transition-colors border border-transparent" title="Відправити на перевірку"><ArrowUpCircle size={14} /></button>
                                                        ) : tpl.access_level !== 'public' && (
                                                            <button onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'revertDraft' }); }} className="p-1.5 text-(--platform-text-secondary) hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-md transition-colors border border-transparent" title="Повернути в чернетки"><Construction size={14} /></button>
                                                        )}
                                                        <button onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'copy' }); }} className="p-1.5 text-(--platform-text-secondary) hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-md transition-colors border border-transparent" title="Скопіювати як чернетку"><Copy size={14} /></button>
                                                    </>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); manager.modals.setEditingTemplate(tpl); manager.modals.setIsEditModalOpen(true); }} className="p-1.5 text-(--platform-text-secondary) hover:text-(--platform-accent) hover:bg-(--platform-bg) rounded-md transition-colors border border-transparent"><Edit size={14}/></button>
                                                <button onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'delete' }); }} className="p-1.5 text-(--platform-text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors border border-transparent"><Trash size={14}/></button>
                                            </div>
                                        )}
                                    />
                                );
                            }) : <div className="col-span-1 xl:col-span-2 mt-10"><EmptyState title="Не знайдено" description="Спробуйте змінити фільтри" icon={Layout}/></div>}
                        </div>
                    </div>
                    <div className="p-5 border-t border-(--platform-border-color) shrink-0 bg-(--platform-bg)/50">
                        <Button 
                            variant="primary" 
                            className="w-full py-3 justify-center text-base" 
                            disabled={!manager.selectedTemplateId}
                            onClick={() => {
                                const templateObj = manager.selectedTemplateId === 'blank' ? { id: 'blank', name: 'Пустий сайт' } : manager.selectedTemplate;
                                manager.modals.setConfirmModal({ isOpen: true, template: templateObj, actionType: 'apply' });
                            }}
                        >
                            <Check size={20} className="mr-2" /> Застосувати обраний шаблон
                        </Button>
                    </div>
                </div>
                <div style={{ width: '0px', position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} title={isSidebarOpen ? "Згорнути панель" : "Розгорнути панель"} className="group flex items-center justify-center w-7 h-28 bg-(--platform-card-bg) border border-(--platform-border-color) shadow-md cursor-pointer transition-all duration-200 focus:outline-none z-20" style={{ position: 'absolute', left: '0px', transform: 'translateY(-50%)', top: '50%', borderRadius: '0 12px 12px 0', borderLeft: isSidebarOpen ? 'none' : '1px solid var(--platform-border-color)', marginLeft: isSidebarOpen ? '-1px' : '0' }}>
                        <div className="transition-transform duration-200 group-hover:scale-110 text-(--platform-text-secondary) group-hover:text-(--platform-accent)">
                            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </div>
                    </button>
                </div>
                <div className="flex-1 relative bg-(--platform-bg)">
                    <SitePreviewer 
                        viewMode={viewMode} 
                        setViewMode={setViewMode} 
                        previewData={previewData} 
                        currentBlocks={previewData?.pages[0]?.blocks || []} 
                        isLoading={manager.isLoading}
                        emptyTitle="Оберіть шаблон" 
                        emptyDescription="Виберіть шаблон зі списку ліворуч, щоб побачити як виглядатиме ваш сайт" 
                        url={manager.selectedTemplateId ? (manager.selectedTemplateId === 'blank' ? 'kendr.site/blank' : `kendr.site/templates/${manager.selectedTemplateId}`) : ''} 
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralTemplatesSection;