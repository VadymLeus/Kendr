// frontend/src/shared/hooks/useTemplateManager.js
import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/api';
import { AuthContext } from '../../app/providers/AuthContext';
export const useTemplateManager = ({ isAdmin = false, initialSourceTab = 'system' } = {}) => {
    const { user } = useContext(AuthContext);
    const [systemTemplates, setSystemTemplates] = useState([]);
    const [personalTemplates, setPersonalTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [templateSourceTab, setTemplateSourceTab] = useState(initialSourceTab);
    const [activeSystemTab, setActiveSystemTab] = useState('all');
    const [ownershipFilter, setOwnershipFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, template: null, actionType: null });
    const [isToggling, setIsToggling] = useState(null);
    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            if (isAdmin) {
                const res = await apiClient.get('/admin/templates?include_drafts=true');
                setSystemTemplates(res.data);
                if (res.data.length > 0 && !selectedTemplateId) {
                    setSelectedTemplateId(res.data[0].id);
                }
            } else {
                const [personalRes, systemRes] = await Promise.all([
                    apiClient.get('/user-templates'),
                    apiClient.get('/sites/templates')
                ]);
                setPersonalTemplates(personalRes.data);
                setSystemTemplates(systemRes.data);
                const allTpls = [...personalRes.data, ...systemRes.data];
                if (allTpls.length > 0 && !selectedTemplateId) {
                    setSelectedTemplateId(personalRes.data.length > 0 ? personalRes.data[0].id : systemRes.data[0].id);
                }
            }
        } catch (error) {
            toast.error("Помилка завантаження шаблонів");
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, selectedTemplateId]);
    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const filteredTemplates = useMemo(() => {
        let source = templateSourceTab === 'system' ? systemTemplates : personalTemplates;
        if (searchQuery) {
            source = source.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (selectedCategory !== 'All') {
            const cat = selectedCategory.toLowerCase();
            source = source.filter(t => 
                (t.category && t.category.toLowerCase() === cat) || 
                t.name.toLowerCase().includes(cat) || 
                (t.description && t.description.toLowerCase().includes(cat))
            );
        }
        if (templateSourceTab === 'system' && isAdmin) {
            source = source.filter(t => {
                let matchesTab = true;
                if (activeSystemTab === 'drafts') matchesTab = !t.is_ready;
                if (activeSystemTab === 'staging') matchesTab = t.is_ready && t.access_level === 'admin_only';
                if (activeSystemTab === 'public') matchesTab = t.is_ready && t.access_level === 'public';
                
                let matchesOwnership = true;
                const isMine = t.user_id === user?.id || t.author_id === user?.id;
                if (ownershipFilter === 'mine') matchesOwnership = isMine;
                if (ownershipFilter === 'others') matchesOwnership = !isMine;
                
                return matchesTab && matchesOwnership;
            });
        }
        
        return source;
    }, [templateSourceTab, systemTemplates, personalTemplates, searchQuery, selectedCategory, activeSystemTab, ownershipFilter, isAdmin, user]);
    const selectedTemplate = useMemo(() => {
        const all = [...systemTemplates, ...personalTemplates];
        return all.find(t => t.id === selectedTemplateId);
    }, [systemTemplates, personalTemplates, selectedTemplateId]);
    const handleAction = async (actionType, template, extraData = {}) => {
        try {
            switch (actionType) {
                case 'delete':
                    if (isAdmin && templateSourceTab === 'system') await apiClient.delete(`/admin/templates/${template.id}`);
                    else await apiClient.delete(`/user-templates/${template.id}`);
                    toast.success("Шаблон видалено");
                    break;
                case 'copy':
                    await apiClient.post(`/admin/templates/${template.id}/copy`);
                    toast.success("Шаблон скопійовано у чернетки!");
                    break;
                case 'markReady':
                    await apiClient.put(`/admin/templates/${template.id}`, { is_ready: 1, access_level: 'admin_only' });
                    toast.success("Шаблон відправлено на перевірку!");
                    break;
                case 'revertDraft':
                    await apiClient.put(`/admin/templates/${template.id}`, { is_ready: 0, access_level: 'private' });
                    toast.success("Шаблон повернуто в чернетки!");
                    break;
                case 'togglePublish':
                    setIsToggling(template.id);
                    const newAccess = template.access_level === 'public' ? 'admin_only' : 'public';
                    await apiClient.put(`/admin/templates/${template.id}`, { access_level: newAccess });
                    toast.success(newAccess === 'public' ? "Шаблон опубліковано!" : "Шаблон приховано");
                    setIsToggling(null);
                    break;
                case 'apply':
                    if (!extraData.siteId) throw new Error("ID сайту не знайдено");
                    const toastId = toast.loading("Застосування шаблону...");
                    await apiClient.put(`/sites/${extraData.siteId}/reset-template`, { templateId: template.id });
                    toast.update(toastId, { render: `Шаблон застосовано!`, type: "success", isLoading: false, autoClose: 2000 });
                    setTimeout(() => window.location.reload(), 2000);
                    return;
            }
            await fetchTemplates();
        } catch (error) {
            setIsToggling(null);
            toast.error(error.response?.data?.message || "Помилка при виконанні дії");
        }
    };

    const handleSaveTemplateChanges = async (name, description, thumbnailUrl, category) => {
        if (!editingTemplate) return;
        try {
            const updateData = { templateName: name, name, description, thumbnail_url: thumbnailUrl, category };
            if (isAdmin && templateSourceTab === 'system') {
                await apiClient.put(`/admin/templates/${editingTemplate.id}`, updateData);
            } else {
                await apiClient.put(`/user-templates/${editingTemplate.id}`, updateData);
            }
            toast.success('Шаблон оновлено');
            setIsEditModalOpen(false);
            setEditingTemplate(null);
            fetchTemplates();
        } catch (error) {
            toast.error('Помилка збереження');
        }
    };
    return {
        templates: filteredTemplates,
        isLoading,
        selectedTemplate,
        selectedTemplateId,
        setSelectedTemplateId,
        filters: {
            templateSourceTab, setTemplateSourceTab,
            activeSystemTab, setActiveSystemTab,
            ownershipFilter, setOwnershipFilter,
            selectedCategory, setSelectedCategory,
            searchQuery, setSearchQuery
        },
        modals: {
            editingTemplate, setEditingTemplate,
            isEditModalOpen, setIsEditModalOpen,
            confirmModal, setConfirmModal
        },
        actions: {
            handleAction,
            handleSaveTemplateChanges,
            isToggling
        },
        fetchTemplates
    };
};