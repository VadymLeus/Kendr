// frontend/src/modules/dashboard/features/settings/components/GeneralTemplatesSection.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../../../../shared/api/api';
import { useConfirm } from '../../../../../shared/hooks/useConfirm';
import { Button } from '../../../../../shared/ui/elements';
import LoadingState from '../../../../../shared/ui/complex/LoadingState';
import TemplateModal from '../../../components/TemplateModal';
import { Palette, Plus, Construction, Eye, Globe, FileText, ChevronDown, ArrowUpCircle, Grid, Edit, Trash, Layout, ShoppingBag, Briefcase, Camera, Coffee, Music, Star, Heart } from 'lucide-react';

const GeneralTemplatesSection = ({ siteData, isAdmin }) => {
    const { confirm } = useConfirm();
    const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
    const [personalTemplates, setPersonalTemplates] = useState([]); 
    const [systemTemplates, setSystemTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [expandedSections, setExpandedSections] = useState(() => {
        const defaults = { personal: true, drafts: true, staging: true, published: true, system_public: true };
        try { 
            return { ...defaults, ...JSON.parse(localStorage.getItem('kendr_template_sections')) }; 
        } catch (e) { 
            return defaults; 
        }
    });

    useEffect(() => {
        fetchAllTemplates();
    }, []);

    const fetchAllTemplates = async () => {
        setLoadingTemplates(true);
        try {
            if (isAdmin) {
                const systemRes = await apiClient.get('/admin/templates');
                setSystemTemplates(systemRes.data);
            } else {
                const [personalRes, systemRes] = await Promise.all([
                    apiClient.get('/user-templates'),
                    apiClient.get('/sites/templates')
                ]);
                setPersonalTemplates(personalRes.data);
                setSystemTemplates(systemRes.data);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const toggleSection = (sectionKey) => {
        const newState = { ...expandedSections, [sectionKey]: !expandedSections[sectionKey] };
        setExpandedSections(newState);
        localStorage.setItem('kendr_template_sections', JSON.stringify(newState));
    };

    const handleOpenEditModal = (e, template) => {
        e.stopPropagation();
        setEditingTemplate(template);
        setIsEditModalOpen(true);
    };

    const handleSaveTemplateChanges = async (name, description, icon, category) => {
        if (!editingTemplate) return;
        setIsSavingTemplate(true);
        try {
            const updateData = { templateName: name, name: name, description: description, icon: icon, category: category || 'General' };
            if (isAdmin) {
                 await apiClient.put(`/admin/templates/${editingTemplate.id}`, updateData);
                 setSystemTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, name, description, icon, category } : t));
            } else {
                await apiClient.put(`/user-templates/${editingTemplate.id}`, updateData);
                setPersonalTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, name, description, icon, category } : t));
            }
            toast.success('Шаблон оновлено');
            setIsEditModalOpen(false);
            setEditingTemplate(null);
        } catch (error) {
            toast.error('Помилка при збереженні змін');
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleSaveTemplate = async (name, description, icon, category, overwriteId) => {
        if (!siteData?.id) return toast.error("Помилка: Не знайдено ID сайту");
        if (!name) return toast.error("Вкажіть назву шаблону");
        try {
            const payload = { 
                siteId: siteData.id, templateName: name, description,
                icon: icon || 'Layout', category: category || 'General'
            };
            if (isAdmin) {
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
            fetchAllTemplates();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка збереження шаблону');
        }
    };

    const handleDeleteTemplate = async (id, name, isSystem) => {
        if (await confirm({ title: "Видалити шаблон?", message: `Ви впевнені, що хочете видалити шаблон "${name}"?`, type: "danger", confirmLabel: "Видалити" })) {
            try {
                if (isSystem && isAdmin) await apiClient.delete(`/admin/templates/${id}`);
                else await apiClient.delete(`/user-templates/${id}`);
                toast.success("Шаблон видалено");
                fetchAllTemplates();
            } catch (error) {
                toast.error("Не вдалося видалити шаблон");
            }
        }
    };

    const handleMarkAsReady = async (template) => {
        if (await confirm({ title: "Позначити як готовий?", message: `Шаблон "${template.name}" стане доступним для інших адмінів, але ще не для публіки.`, confirmLabel: "Готово" })) {
            try {
                await apiClient.put(`/admin/templates/${template.id}`, { is_ready: 1, access_level: 'admin_only' });
                setSystemTemplates(prev => prev.map(t => t.id === template.id ? { ...t, is_ready: 1, access_level: 'admin_only' } : t));
                toast.success(`Шаблон "${template.name}" готовий до перевірки!`);
            } catch (error) {
                toast.error(error.response?.data?.message || "Помилка при зміні статусу");
            }
        }
    };

    const handleRevertToDraft = async (template) => {
        if (await confirm({ title: "Повернути в роботу?", message: `Шаблон "${template.name}" повернеться в чернетки.`, confirmLabel: "У чернетки" })) {
            try {
                await apiClient.put(`/admin/templates/${template.id}`, { is_ready: 0, access_level: 'private' });
                setSystemTemplates(prev => prev.map(t => t.id === template.id ? { ...t, is_ready: 0, access_level: 'private' } : t));
                toast.success(`Шаблон "${template.name}" повернуто в роботу!`);
            } catch (error) {
                toast.error("Помилка при зміні статусу");
            }
        }
    };

    const handleApplyTemplate = async (templateId, isPersonal, templateName) => {
        const warningMessage = isAdmin 
            ? `Ви застосуєте шаблон "${templateName}" до цього сайту.`
            : `УВАГА: Ви збираєтесь застосувати шаблон "${templateName}". Це повністю замінить дизайн вашого сайту.`;
        if (await confirm({ title: "Застосувати шаблон?", message: warningMessage, type: "warning", confirmLabel: "Застосувати" })) {
            const toastId = toast.loading("Застосування шаблону...");
            try {
                await apiClient.put(`/sites/${siteData.id}/reset-template`, { templateId });
                toast.update(toastId, { render: `Шаблон "${templateName}" застосовано! Перезавантаження...`, type: "success", isLoading: false, autoClose: 2000 });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                toast.update(toastId, { render: error.response?.data?.message || "Помилка застосування", type: "error", isLoading: false, autoClose: 3000 });
            }
        }
    };

    const adminDraftTemplates = systemTemplates.filter(t => !t.is_ready);
    const adminStagingTemplates = systemTemplates.filter(t => t.is_ready && t.access_level === 'admin_only');
    const adminPublishedTemplates = systemTemplates.filter(t => t.is_ready && t.access_level === 'public');
    const getTemplateIcon = (template) => {
        const iconProps = { size: 24, className: "text-(--platform-text-primary)" };
        if (template.icon) {
            switch (template.icon) {
                case 'Layout': return <Layout {...iconProps} />;
                case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
                case 'Briefcase': return <Briefcase {...iconProps} />;
                case 'FileText': return <FileText {...iconProps} />;
                case 'Camera': return <Camera {...iconProps} />;
                case 'Coffee': return <Coffee {...iconProps} />;
                case 'Music': return <Music {...iconProps} />;
                case 'Star': return <Star {...iconProps} />;
                case 'Heart': return <Heart {...iconProps} />;
                case 'Globe': return <Globe {...iconProps} />;
                case 'Grid': return <Grid {...iconProps} />;
                default: break; 
            }
        }
        return <Grid {...iconProps} />;
    };

    const renderTemplateList = (templates, emptyMsg, type) => (
        <>
            <div 
                className="flex items-center justify-between cursor-pointer py-4 px-5 select-none transition-all duration-200 bg-(--platform-bg) hover:bg-black/5" 
                onClick={() => toggleSection(type)}
            >
                <div className="font-semibold text-(--platform-text-primary) flex items-center gap-2">
                    {type === 'drafts' && <Construction size={18} className="text-orange-500"/>}
                    {type === 'staging' && <Eye size={18} className="text-blue-500"/>}
                    {type === 'published' && <Globe size={18} className="text-green-500"/>}
                    {type === 'personal' && <FileText size={18} className="text-(--platform-accent)"/>}
                    {type === 'system_public' && <Globe size={18} className="text-blue-500"/>}
                    {type === 'drafts' && "Чернетки (Drafts)"}
                    {type === 'staging' && "На перевірці (Staging)"}
                    {type === 'published' && "Опубліковані (Public)"}
                    {type === 'personal' && "Ваші шаблони"} 
                    {type === 'system_public' && "Публічні шаблони"}
                    {' '}<span className="text-sm font-normal text-(--platform-text-secondary) opacity-70">({templates.length})</span>
                </div>
                <ChevronDown size={20} className={`text-(--platform-text-secondary) transition-transform duration-300 ${expandedSections[type] ? 'rotate-180' : ''}`} />
            </div>
            {expandedSections[type] && (
                <div className="px-5 pb-5 bg-(--platform-bg) border-t border-(--platform-border-color)">
                    {templates.length > 0 ? (
                        <div className="mt-4 flex flex-col gap-3">
                            {templates.map(template => (
                                <div key={template.id} className="bg-(--platform-bg) border border-(--platform-border-color) rounded-xl p-4 flex justify-between items-center gap-4 transition-all duration-200 hover:shadow-sm">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-lg bg-(--platform-bg) overflow-hidden flex items-center justify-center border border-(--platform-border-color) shadow-sm shrink-0">
                                            {getTemplateIcon(template)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-(--platform-text-primary) text-lg truncate pr-2" title={template.name}>
                                                {template.name}
                                            </div>
                                            <div className="text-sm text-(--platform-text-secondary) wrap-break-word line-clamp-2">
                                                {template.description || 'Без опису'}
                                                {template.category && template.category !== 'General' && (
                                                    <span className="ml-2 text-xs bg-(--platform-accent) text-white px-2 py-0.5 rounded-full">{template.category}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {isAdmin && type === 'drafts' && (
                                            <Button variant="outline" style={{ borderColor: '#10b981', color: '#10b981' }} onClick={() => handleMarkAsReady(template)} title="Позначити як готовий"><ArrowUpCircle size={18} /></Button>
                                        )}
                                        {isAdmin && type === 'staging' && (
                                            <Button variant="outline" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => handleRevertToDraft(template)} title="Повернути в роботу"><Construction size={18} /></Button>
                                        )}
                                        <Button variant="outline" style={{ borderColor: 'var(--platform-accent)', color: 'var(--platform-accent)' }} onClick={() => handleApplyTemplate(template.id, type === 'personal', template.name)} title="Застосувати"><Grid size={18} /></Button>
                                        {(isAdmin || type === 'personal') && (
                                            <>
                                                <Button variant="outline" onClick={(e) => handleOpenEditModal(e, template)} title="Редагувати"><Edit size={18} /></Button>
                                                <Button variant="outline-danger" onClick={() => handleDeleteTemplate(template.id, template.name, type !== 'personal')} title="Видалити"><Trash size={18} /></Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 text-(--platform-text-secondary) opacity-80">{emptyMsg}</div>
                    )}
                </div>
            )}
        </>
    );

    return (
        <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
            <div className="mb-6 flex justify-between items-center gap-3">
                <div>
                    <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                        <Palette size={22} className="text-(--platform-accent)" /> Керування шаблонами
                    </h3>
                </div>
                <div className="flex gap-2.5">
                    <Button variant="primary" onClick={() => setIsSaveTemplateModalOpen(true)}>
                        <Plus size={18} /> 
                        {isAdmin ? "Створити шаблон" : "Зберегти поточний"}
                    </Button>
                </div>
            </div>
            {loadingTemplates ? (
                <div className="py-8">
                    <LoadingState title="Завантаження шаблонів..." />
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {isAdmin ? (
                        <>
                            {renderTemplateList(adminDraftTemplates, 'Немає чернеток', 'drafts')}
                            {renderTemplateList(adminStagingTemplates, 'Немає шаблонів на перевірці', 'staging')}
                            {renderTemplateList(adminPublishedTemplates, 'Немає публічних шаблонів', 'published')}
                        </>
                    ) : (
                        <>
                            {renderTemplateList(personalTemplates, 'У вас немає збережених особистих шаблонів', 'personal')}
                            {renderTemplateList(systemTemplates, 'Немає доступних системних шаблонів', 'system_public')}
                        </>
                    )}
                </div>
            )}
            <TemplateModal
                isOpen={isSaveTemplateModalOpen}
                onClose={() => setIsSaveTemplateModalOpen(false)}
                onSave={handleSaveTemplate}
            />
            <TemplateModal 
                isOpen={isEditModalOpen}
                initialData={editingTemplate}
                onClose={() => { setIsEditModalOpen(false); setEditingTemplate(null); }}
                onSave={handleSaveTemplateChanges}
            />
        </div>
    );
};

export default GeneralTemplatesSection;