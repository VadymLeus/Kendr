// frontend/src/modules/admin/pages/AdminTemplatesPage.jsx
import React, { useState, useMemo, useContext } from 'react';
import EmptyState from '../../../shared/ui/complex/EmptyState';
import SitePreviewer from '../../../shared/ui/complex/SitePreviewer';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import LoadingState from '../../../shared/ui/complex/LoadingState';
import TemplateCard from '../../../shared/ui/complex/TemplateCard';
import TemplateFilters from '../../../shared/ui/complex/TemplateFilters';
import TemplateBadge from '../../../shared/ui/complex/TemplateBadge';
import TemplateModal from '../../dashboard/components/TemplateModal';
import { AuthContext } from '../../../app/providers/AuthContext';
import { useTemplateManager } from '../../../shared/hooks/useTemplateManager';
import { getTemplatePreviewData } from '../../../shared/utils/templateUtils';
import { Layout, Lock, Loader, Globe, ChevronLeft, ChevronRight, Construction, ArrowUpCircle, Trash, Edit, Copy } from 'lucide-react';

const AdminTemplatesPage = () => {
    const { user } = useContext(AuthContext);
    const [viewMode, setViewMode] = useState('desktop'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const manager = useTemplateManager({ isAdmin: true, initialSourceTab: 'system' });
    const handleConfirmAction = async () => {
        const { template, actionType } = manager.modals.confirmModal;
        await manager.actions.handleAction(actionType, template);
        manager.modals.setConfirmModal({ isOpen: false, template: null, actionType: null });
    };
    
    const previewData = useMemo(() => getTemplatePreviewData(manager.selectedTemplate), [manager.selectedTemplate]);
    let modalTitle = "", modalMessage = "", confirmLabel = "", modalType = "primary";
    if (manager.modals.confirmModal.actionType === 'togglePublish') {
        const isPub = manager.modals.confirmModal.template?.access_level === 'public';
        modalTitle = isPub ? "Сховати на перевірку?" : "Опублікувати?";
        modalMessage = isPub ? `Шаблон стане недоступним для користувачів.` : `Шаблон стане доступним для всіх користувачів.`;
        confirmLabel = isPub ? "Сховати" : "Опублікувати";
        modalType = isPub ? "warning" : "primary";
    } else if (manager.modals.confirmModal.actionType === 'markReady') {
        modalTitle = "На перевірку?";
        modalMessage = "Шаблон стане доступним для інших адмінів (статус: На перевірці).";
        confirmLabel = "Відправити";
        modalType = "primary";
    } else if (manager.modals.confirmModal.actionType === 'revertDraft') {
        modalTitle = "Повернути в чернетки?";
        modalMessage = "Шаблон буде знято з перевірки та повернуто в чернетки.";
        confirmLabel = "Повернути";
        modalType = "warning";
    } else if (manager.modals.confirmModal.actionType === 'delete') {
        modalTitle = "Видалити шаблон?";
        modalMessage = `Ви впевнені, що хочете видалити шаблон "${manager.modals.confirmModal.template?.name}"? Це незворотньо.`;
        confirmLabel = "Видалити";
        modalType = "danger";
    } else if (manager.modals.confirmModal.actionType === 'copy') {
        modalTitle = "Скопіювати шаблон?";
        modalMessage = `Створити копію шаблону "${manager.modals.confirmModal.template?.name}"? Вона буде збережена як ваша особиста чернетка.`;
        confirmLabel = "Скопіювати";
        modalType = "primary";
    }

    if (manager.isLoading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-(--platform-bg) z-50">
                <LoadingState title="Завантаження шаблонів..." layout="page" />
            </div>
        );
    }

    return (
        <div className="relative flex w-full h-full overflow-hidden bg-(--platform-bg)">
            <TemplateModal 
                isOpen={manager.modals.isEditModalOpen} 
                initialData={manager.modals.editingTemplate} 
                onClose={() => { manager.modals.setIsEditModalOpen(false); manager.modals.setEditingTemplate(null); }} 
                onSave={manager.actions.handleSaveTemplateChanges} 
            />

            <ConfirmModal 
                isOpen={manager.modals.confirmModal.isOpen} 
                title={modalTitle} 
                message={modalMessage} 
                onConfirm={handleConfirmAction} 
                onCancel={() => manager.modals.setConfirmModal({ isOpen: false, template: null, actionType: null })} 
                confirmLabel={confirmLabel} 
                type={modalType} 
            />
            
            <div 
                className={`
                    flex flex-col h-full bg-(--platform-card-bg) z-40 shrink-0 overflow-hidden
                    transition-all duration-300 ease-in-out absolute md:relative
                    ${isSidebarOpen 
                        ? 'w-[calc(100%-28px)] md:w-105 lg:w-125 xl:w-150 opacity-100 border-r border-(--platform-border-color) shadow-2xl md:shadow-[10px_0_15px_-3px_rgba(0,0,0,0.05)]' 
                        : 'w-0 opacity-0 border-none pointer-events-none'}
                `}
            >
                <div className="w-[calc(100vw-28px)] md:w-105 lg:w-125 xl:w-150 h-full flex flex-col shrink-0">
                    <div className="p-4 md:p-6 border-b border-(--platform-border-color) shrink-0 bg-(--platform-card-bg)">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-(--platform-accent) rounded-lg text-white">
                                <Layout size={20} />
                            </div>
                            <h1 className="text-xl font-bold text-(--platform-text-primary) m-0">Шаблони</h1>
                        </div>
                        <TemplateFilters filters={manager.filters} isAdmin={true} hideSourceTabs={true} />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-(--platform-bg) min-h-0 [scrollbar-gutter:stable]">
                        {manager.templates.length === 0 ? (
                            <div className="mt-8">
                                <EmptyState title="Порожньо" description="Шаблонів не знайдено" icon={Layout} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
                                {manager.templates.map(tpl => {
                                    const isPublic = tpl.access_level === 'public';
                                    const isDraft = !tpl.is_ready;
                                    return (
                                        <TemplateCard 
                                            key={tpl.id}
                                            template={tpl}
                                            isSelected={manager.selectedTemplateId === tpl.id}
                                            onClick={() => manager.setSelectedTemplateId(tpl.id)}
                                            badge={<TemplateBadge template={tpl} user={user} isAdmin={true} sourceTab="system" />}
                                            actions={
                                                <div className="flex flex-wrap gap-2 w-full justify-end mt-2 pt-2 border-t border-(--platform-border-color)">
                                                    {isDraft ? (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'markReady' }); }} 
                                                            className="p-1.5 text-(--platform-text-secondary) hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-md transition-colors border border-transparent hover:border-orange-500/30"
                                                            title="Відправити на перевірку"
                                                        >
                                                            <ArrowUpCircle size={14} />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'togglePublish' }); }} 
                                                                disabled={manager.actions.isToggling === tpl.id}
                                                                className={`p-1.5 rounded-md transition-colors border border-transparent ${
                                                                    isPublic 
                                                                    ? 'text-(--platform-text-secondary) hover:text-(--platform-success) hover:bg-(--platform-success)/10 hover:border-(--platform-success)/30' 
                                                                    : 'text-(--platform-text-secondary) hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-500/30'
                                                                }`}
                                                                title={isPublic ? "Приховати шаблон" : "Опублікувати шаблон"}
                                                            >
                                                                {manager.actions.isToggling === tpl.id ? <Loader size={14} className="animate-spin" /> : (
                                                                    isPublic ? <Lock size={14} /> : <Globe size={14} />
                                                                )}
                                                            </button>
                                                            {!isPublic && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'revertDraft' }); }} 
                                                                    className="p-1.5 text-(--platform-text-secondary) hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-md transition-colors border border-transparent hover:border-orange-500/30"
                                                                    title="Повернути в чернетки"
                                                                >
                                                                    <Construction size={14} />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'copy' }); }} 
                                                        className="p-1.5 text-(--platform-text-secondary) hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-md transition-colors border border-transparent hover:border-indigo-500/30"
                                                        title="Скопіювати як чернетку"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); manager.modals.setEditingTemplate(tpl); manager.modals.setIsEditModalOpen(true); }} 
                                                        className="p-1.5 text-(--platform-text-secondary) hover:text-(--platform-accent) hover:bg-(--platform-bg) rounded-md transition-colors border border-transparent hover:border-(--platform-accent)/30" 
                                                        title="Редагувати шаблон"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'delete' }); }} 
                                                        className="p-1.5 text-(--platform-text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors border border-transparent hover:border-red-500/30" 
                                                        title="Видалити шаблон"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                            }
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div 
                className={`flex absolute z-50 top-1/2 -translate-y-1/2 items-center justify-center transition-all duration-300 ease-in-out ${
                    isSidebarOpen 
                        ? 'left-[calc(100%-28px)] md:left-105 lg:left-125 xl:left-150 md:-ml-px' 
                        : 'left-0'
                }`}
            >
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    title={isSidebarOpen ? "Згорнути панель" : "Розгорнути панель"} 
                    className={`group flex items-center justify-center w-7 h-28 bg-(--platform-card-bg) border border-(--platform-border-color) shadow-md cursor-pointer transition-all duration-200 focus:outline-none rounded-r-xl ${isSidebarOpen ? 'border-l-0' : ''} hover:border-(--platform-accent)`}
                >
                    <div className="transition-transform duration-200 group-hover:scale-110 text-(--platform-text-secondary) group-hover:text-(--platform-accent)">
                        {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </div>
                </button>
            </div>
            <div className="flex-1 min-w-0 h-full relative bg-(--platform-bg) z-10">
                <SitePreviewer 
                    viewMode={viewMode} 
                    setViewMode={setViewMode} 
                    previewData={previewData} 
                    currentBlocks={previewData?.pages?.[0]?.blocks || []} 
                    isLoading={false} 
                    emptyTitle="Оберіть шаблон" 
                    emptyDescription="Виберіть шаблон зі списку ліворуч для попереднього перегляду" 
                    url={manager.selectedTemplate ? `kendr.site/templates/${manager.selectedTemplate.id}` : ''} 
                />
            </div>
        </div>
    );
};

export default AdminTemplatesPage;