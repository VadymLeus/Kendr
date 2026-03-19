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

    const containerStyle = { position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden', background: 'var(--platform-bg)' };
    if (manager.isLoading) return <div style={{...containerStyle, alignItems: 'center', justifyContent: 'center'}}><LoadingState title="Завантаження шаблонів..." layout="page" /></div>;
    return (
        <div style={containerStyle}>
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
            
            <div style={{
                width: isSidebarOpen ? '50%' : '0px', minWidth: isSidebarOpen ? '50%' : '0px', opacity: isSidebarOpen ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                background: 'var(--platform-card-bg)', borderRight: isSidebarOpen ? '1px solid var(--platform-border-color)' : 'none',
                boxShadow: '10px 0 15px -3px rgba(0, 0, 0, 0.05)', zIndex: 10, flexShrink: 0
            }}>
                <div style={{ width: '100%', minWidth: '400px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: '24px', flexShrink: 0, borderBottom: '1px solid var(--platform-border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '8px', background: 'var(--platform-accent)', borderRadius: '8px', color: 'white' }}><Layout size={20} /></div>
                            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--platform-text-primary)' }}>Шаблони</h1>
                        </div>
                        <TemplateFilters filters={manager.filters} isAdmin={true} hideSourceTabs={true} />
                    </div>
                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--platform-bg)' }}>
                        {manager.templates.length === 0 ? (
                            <div style={{ marginTop: '32px' }}><EmptyState title="Порожньо" description="Шаблонів не знайдено" icon={Layout} /></div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
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
                                                <div className="flex gap-2 w-full justify-end mt-2 pt-2 border-t border-(--platform-border-color)">
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
            <div style={{ width: '0px', position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} title={isSidebarOpen ? "Згорнути панель" : "Розгорнути панель"} className="group flex items-center justify-center w-7 h-28 bg-(--platform-card-bg) border border-(--platform-border-color) shadow-md cursor-pointer transition-all duration-200 focus:outline-none z-20" style={{ position: 'absolute', left: '0px', transform: 'translateY(-50%)', top: '50%', borderRadius: '0 12px 12px 0', borderLeft: isSidebarOpen ? 'none' : '1px solid var(--platform-border-color)', marginLeft: isSidebarOpen ? '-1px' : '0' }}>
                    <div className="transition-transform duration-200 group-hover:scale-110 text-(--platform-text-secondary) group-hover:text-(--platform-accent)">
                        {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </div>
                </button>
            </div>
            <div style={{ flex: 1, minWidth: 0, height: '100%', position: 'relative', background: 'var(--platform-bg)' }}>
                <SitePreviewer viewMode={viewMode} setViewMode={setViewMode} previewData={previewData} currentBlocks={previewData?.pages?.[0]?.blocks || []} isLoading={false} emptyTitle="Оберіть шаблон" emptyDescription="Виберіть шаблон зі списку ліворуч для попереднього перегляду" url={manager.selectedTemplate ? `kendr.site/templates/${manager.selectedTemplate.id}` : ''} />
            </div>
        </div>
    );
};

export default AdminTemplatesPage;