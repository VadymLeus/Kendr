// frontend/src/modules/dashboard/features/settings/GeneralSettingsTab.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../../shared/api/api';
import { useAutoSave } from '../../../../shared/hooks/useAutoSave';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import { AuthContext } from '../../../../app/providers/AuthContext';
import SiteCoverDisplay from '../../../../shared/ui/complex/SiteCoverDisplay';
import TemplateModal from '../../components/TemplateModal';
import { Button, Select, Switch } from '../../../../shared/ui/elements';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { InputWithCounter } from '../../../../shared/ui/complex/InputWithCounter';
import { TEXT_LIMITS } from '../../../../shared/config/limits';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput';
import { exportSiteToZip } from '../../../../shared/utils/siteExporter';
import { BASE_URL } from '../../../../shared/config';
import { Settings, Image, Globe, Palette, AlertCircle, Trash, Grid, List, Type, X, Check, Tag, Upload, Plus, ChevronDown, ShoppingCart, Briefcase, Edit, Layout, FileText, Download, Loader, FileDown, Lock, Construction, ArrowUpCircle, Eye, Camera, Coffee, Music, Star, Heart, ShoppingBag } from 'lucide-react';

const GeneralSettingsTab = ({ siteData, onUpdate, onSavingChange }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { confirm } = useConfirm();
    const isAdmin = user?.role === 'admin';
    const [identityData, setIdentityData] = useState({ title: '', slug: '' });
    const [isSavingIdentity, setIsSavingIdentity] = useState(false);
    const [slugError, setSlugError] = useState('');
    const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
    const [personalTemplates, setPersonalTemplates] = useState([]); 
    const [systemTemplates, setSystemTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [expandedSections, setExpandedSections] = useState(() => {
        const defaults = { 
            personal: true, 
            drafts: true, 
            staging: true, 
            published: true, 
            system_public: true 
        };
        try { 
            return { ...defaults, ...JSON.parse(localStorage.getItem('kendr_template_sections')) }; 
        } catch (e) { 
            return defaults; 
        }
    });
    
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isCoverHovered, setIsCoverHovered] = useState(false);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const { data, handleChange, isSaving, setData } = useAutoSave(
        `/sites/${siteData.site_path}/settings`,
        {
            status: siteData.status || 'private',
            favicon_url: siteData.favicon_url || '',
            logo_url: siteData.logo_url || '',
            site_title_seo: siteData.site_title_seo || siteData.title,
            theme_settings: siteData.theme_settings || {},
            cover_image: siteData.cover_image || '',
            cover_layout: siteData.cover_layout || 'centered',
            cover_logo_radius: parseInt(siteData.cover_logo_radius || 0),
            cover_logo_size: parseInt(siteData.cover_logo_size || 80),
            cover_title_size: parseInt(siteData.cover_title_size || 24),
            show_title: siteData.show_title !== undefined ? siteData.show_title : true,
            tags: []
        }
    );

    const getImageUrl = (src) => {
        if (!src) return '';
        if (src instanceof File) return URL.createObjectURL(src);
        if (typeof src === 'string') {
            if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http')) return src;
            const cleanSrc = src.startsWith('/') ? src : `/${src}`;
            return `${BASE_URL}${cleanSrc}`;
        }
        return '';
    };

    useEffect(() => {
        if (siteData) {
            setIdentityData({
                title: siteData.title || '',
                slug: siteData.site_path || ''
            });
            setData(prev => ({
                ...prev,
                cover_image: siteData.cover_image || '',
                cover_layout: siteData.cover_layout || 'centered',
                cover_logo_radius: parseInt(siteData.cover_logo_radius || 0),
                cover_logo_size: parseInt(siteData.cover_logo_size || 80),
                cover_title_size: parseInt(siteData.cover_title_size || 24),
                status: siteData.status,
                favicon_url: siteData.favicon_url || '',
                logo_url: siteData.logo_url || '',
                site_title_seo: siteData.site_title_seo || siteData.title,
                show_title: siteData.show_title !== undefined ? siteData.show_title : true,
                theme_settings: siteData.theme_settings || {}
            }));
            
            if (siteData.tags) {
                setSelectedTags(siteData.tags.map(t => t.id));
            }
        }
    }, [siteData, setData]);
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await apiClient.get('/tags');
                setAvailableTags(res.data);
                if (siteData.tags && selectedTags.length === 0) setSelectedTags(siteData.tags.map(t => t.id));
            } catch (err) {
                console.error("Failed to load tags", err);
            }
        };
        fetchTags();
        fetchAllTemplates();
    }, []);

    useEffect(() => {
        if (onSavingChange) onSavingChange(isSaving || isSavingIdentity);
    }, [isSaving, isSavingIdentity, onSavingChange]);
    const handleIdentityChange = (field, value) => {
        if (field === 'slug') {
            const val = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
            setIdentityData(prev => ({ ...prev, slug: val }));
            setSlugError('');
        } else {
            setIdentityData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSaveIdentity = async () => {
        const { title, slug } = identityData;
        const originalSlug = siteData.site_path;
        if (slug.length < 3) { setSlugError('Мінімум 3 символи'); return; }
        setIsSavingIdentity(true);
        try {
            const promises = [];
            let needRedirect = false;
            if (slug !== originalSlug) {
                promises.push(apiClient.put(`/sites/${originalSlug}/rename`, { newPath: slug }));
                needRedirect = true;
            }
            if (title !== siteData.title) {
                promises.push(apiClient.put(`/sites/${originalSlug}/settings`, { title }));
            }
            if (promises.length === 0) {
                setIsSavingIdentity(false);
                return;
            }
            await Promise.all(promises);
            toast.success('Зміни успішно збережено!');
            if (onUpdate) onUpdate({ title, site_path: slug });
            if (needRedirect) {
                setTimeout(() => { 
                    navigate(`/dashboard/${slug}`); 
                    window.location.reload(); 
                }, 1000);
            }
        } catch (error) {
            console.error(error);
            setSlugError(error.response?.data?.message || 'Помилка збереження');
            toast.error('Не вдалося зберегти зміни');
        } finally {
            setIsSavingIdentity(false);
        }
    };

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
            const updateData = {
                templateName: name,
                name: name,
                description: description,
                icon: icon,
                category: category || 'General' 
            };
            if (isAdmin) {
                 await apiClient.put(`/admin/templates/${editingTemplate.id}`, updateData);
                 setSystemTemplates(prev => 
                    prev.map(t => t.id === editingTemplate.id ? { ...t, name, description, icon, category } : t)
                 );
            } else {
                await apiClient.put(`/user-templates/${editingTemplate.id}`, updateData);
                setPersonalTemplates(prev => prev.map(t =>
                    t.id === editingTemplate.id ? { ...t, name, description, icon, category } : t
                ));
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
        if (!siteData?.id) {
            toast.error("Помилка: Не знайдено ID сайту");
            return;
        }
        if (!name) {
            toast.error("Вкажіть назву шаблону");
            return;
        }
        try {
            const payload = { 
                siteId: siteData.id, 
                templateName: name, 
                description,
                icon: icon || 'Layout',
                category: category || 'General'
            };
            console.log("Sending payload:", payload);
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
            console.error("Template Save Error:", error);
            const msg = error.response?.data?.message || 'Помилка збереження шаблону';
            toast.error(msg);
        }
    };

    const handleDeleteTemplate = async (id, name, isSystem) => {
        if (await confirm({ title: "Видалити шаблон?", message: `Ви впевнені, що хочете видалити шаблон "${name}"?`, type: "danger", confirmLabel: "Видалити" })) {
            try {
                if (isSystem && isAdmin) {
                    await apiClient.delete(`/admin/templates/${id}`);
                } else {
                    await apiClient.delete(`/user-templates/${id}`);
                }
                toast.success("Шаблон видалено");
                fetchAllTemplates();
            } catch (error) {
                toast.error("Не вдалося видалити шаблон");
            }
        }
    };

    const handleMarkAsReady = async (template) => {
        if (await confirm({ 
            title: "Позначити як готовий?", 
            message: `Шаблон "${template.name}" стане доступним для інших адмінів (Admin Only), але ще не для публіки.`, 
            confirmLabel: "Готово" 
        })) {
            try {
                await apiClient.put(`/admin/templates/${template.id}`, { 
                    is_ready: 1, 
                    access_level: 'admin_only' 
                });
                setSystemTemplates(prev => 
                    prev.map(t => 
                    t.id === template.id ? { ...t, is_ready: 1, access_level: 'admin_only' } : t
                ));
                toast.success(`Шаблон "${template.name}" готовий до перевірки!`);
            } catch (error) {
                const msg = error.response?.data?.message || "Помилка при зміні статусу";
                toast.error(msg);
            }
        }
    };

    const handleRevertToDraft = async (template) => {
        if (await confirm({ 
            title: "Повернути в роботу?", 
            message: `Шаблон "${template.name}" повернеться в чернетки (Private).`, 
            confirmLabel: "У чернетки" 
        })) {
            try {
                await apiClient.put(`/admin/templates/${template.id}`, { 
                    is_ready: 0,
                    access_level: 'private' 
                });
                setSystemTemplates(prev => prev.map(t => 
                    t.id === template.id ? { ...t, is_ready: 0, access_level: 'private' } : t
                ));
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

    const handleTagToggle = (tagId) => {
        let newTags;
        if (selectedTags.includes(tagId)) newTags = selectedTags.filter(id => id !== tagId);
        else {
            if (selectedTags.length >= 5) { toast.warning("Максимум 5 тегів"); return; }
            newTags = [...selectedTags, tagId];
        }
        setSelectedTags(newTags);
        handleChange('tags', newTags);
    };

    const handleExportSite = async () => {
        setIsExporting(true);
        try {
            toast.info("Підготовка архіву сайту...", { autoClose: 2000 });
            await exportSiteToZip(siteData);
            toast.success("Сайт успішно експортовано!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Сталася помилка при експорті");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteSite = async () => {
        if (await confirm({ title: "Видалити сайт?", message: `Ви впевнені? Це дію неможливо скасувати.`, type: "danger", confirmLabel: "Так, видалити сайт" })) {
            try {
                await apiClient.delete(`/sites/${siteData.site_path}`);
                toast.success('Сайт успішно видалено');
                navigate('/my-sites');
            } catch (err) {
                toast.error('Не вдалося видалити сайт');
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

    const statusOptions = [
        { value: 'published', label: 'Опубліковано (Доступний всім)', icon: Globe, iconProps: { className: 'text-green-500' } },
        { value: 'draft', label: 'Чернетка (Тех. роботи)', icon: FileText, iconProps: { className: 'text-orange-500' } },
        { value: 'private', label: 'Приватний (Прихований)', icon: Lock, iconProps: { className: 'text-gray-500' } }
    ];
    const hasIdentityChanges = identityData.title !== siteData.title || identityData.slug !== siteData.site_path;
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
        <div className="max-w-4xl mx-auto px-4 pb-20 relative">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold mb-1 text-(--platform-text-primary) flex items-center gap-2.5">
                        <Settings size={28} /> Глобальні налаштування
                    </h2>
                    <p className="text-(--platform-text-secondary) text-sm m-0 pl-10">
                        Керування основними параметрами вашого сайту
                    </p>
                </div>
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Image size={22} className="text-(--platform-accent)" /> Логотип та Назва
                        </h3>
                         <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            Налаштуйте брендинг та адресу сайту
                        </p>
                    </div>
                </div>
                 <div className="mb-6">
                    <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">
                        Логотип сайту
                    </label>
                    <div className="flex justify-center">
                        <div className="w-48">
                            <UniversalMediaInput
                                type="image"
                                value={data.logo_url}
                                onChange={(val) => {
                                    const newVal = val && val.target ? val.target.value : val;
                                    handleChange('logo_url', newVal);
                                    if(onUpdate) onUpdate({ logo_url: newVal });
                                }}
                                aspect={1}
                                triggerStyle={{ display: 'block', padding: 0, border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}
                            >
                                <div 
                                    className="w-full h-32 border border-(--platform-border-color) rounded-xl overflow-hidden relative flex items-center justify-center group bg-(--platform-bg) bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-repeat"
                                    onMouseEnter={() => setIsLogoHovered(true)} 
                                    onMouseLeave={() => setIsLogoHovered(false)}
                                >
                                    {data.logo_url ? (
                                        <img 
                                            src={getImageUrl(data.logo_url)} 
                                            alt="Logo" 
                                            className="max-w-[90%] max-h-[90%] object-contain block z-10"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <Image size={32} className="text-(--platform-text-secondary) opacity-50 z-10" />
                                    )}
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[2px] z-20 ${isLogoHovered ? 'opacity-100' : 'opacity-0'}`}>
                                        <Upload size={24} />
                                    </div>
                                    {data.logo_url && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleChange('logo_url', ''); if(onUpdate) onUpdate({ logo_url: '' }); }}
                                            className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer z-30 transition-colors hover:bg-(--platform-danger) border-none"
                                            title="Видалити лого"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    )}
                                </div>
                            </UniversalMediaInput>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <InputWithCounter
                        label="Назва сайту (текст)"
                        value={identityData.title}
                        onChange={(e) => handleIdentityChange('title', e.target.value)}
                        placeholder="Мій інтернет-магазин"
                        leftIcon={<Type size={16}/>}
                        limitKey="SITE_NAME"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">Веб-адреса</label>
                    <div className="flex gap-2 items-start">
                        <div className="py-3 px-4 bg-(--platform-bg) rounded-lg border border-(--platform-border-color) text-(--platform-text-secondary) text-sm whitespace-nowrap h-11.5">
                            /site/
                        </div>
                        <div className="flex-1">
                            <input 
                                type="text" 
                                className="w-full py-3 px-4 rounded-lg border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-primary) text-sm box-border transition-all duration-200 font-medium focus:outline-none focus:border-(--platform-accent) focus:ring-2 focus:ring-(--platform-accent)/10 h-11.5"
                                value={identityData.slug} 
                                onChange={(e) => handleIdentityChange('slug', e.target.value)} 
                                maxLength={TEXT_LIMITS.SITE_SLUG}
                            />
                            <div className="flex justify-between items-start mt-1.5">
                                <div className="text-(--platform-text-secondary) text-xs">
                                    Максимум {TEXT_LIMITS.SITE_SLUG} символів
                                </div>
                                {slugError && <div className="text-[#e53e3e] text-xs flex items-center gap-1"><AlertCircle size={14} /> {slugError}</div>}
                            </div>
                        </div>
                        <Button 
                            onClick={handleSaveIdentity} 
                            disabled={isSavingIdentity || !hasIdentityChanges}
                            style={{ height: '46px' }}
                        >
                            {isSavingIdentity ? '...' : 'Зберегти'}
                        </Button>
                    </div>
                </div>
            </div>

            {!isAdmin && (
                <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Globe size={22} className="text-(--platform-accent)" /> Статус сайту
                        </h3>
                         <div className="max-w-md mx-auto mt-4">
                            <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">
                                Поточний статус
                            </label>
                            <CustomSelect 
                                name="status"
                                value={data.status} 
                                onChange={(e) => handleChange('status', e.target.value)}
                                options={statusOptions}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                 <div className="mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Tag size={22} className="text-(--platform-accent)" /> SEO та Теги
                        </h3>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2.5">
                        <label className="font-medium text-(--platform-text-primary) text-sm m-0 flex items-center gap-1.5">
                            <Tag size={16} /> Категорії / Теги 
                            <span className={`text-xs px-1.5 py-0.5 rounded border border-(--platform-border-color) bg-(--platform-bg) ${selectedTags.length >= 5 ? 'text-(--platform-warning)' : 'text-(--platform-text-secondary)'}`}>
                                {selectedTags.length}/5
                            </span>
                        </label>
                        <button 
                            type="button" 
                            className="w-7 h-7 rounded-md border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-secondary) flex items-center justify-center cursor-pointer transition-colors hover:bg-(--platform-danger) hover:border-(--platform-danger) hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => { setSelectedTags([]); handleChange('tags', []); }} 
                            title="Очистити всі теги" 
                            disabled={selectedTags.length === 0}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-(--platform-bg) rounded-xl border border-(--platform-border-color)">
                        {availableTags.map(tag => {
                            const isActive = selectedTags.includes(tag.id);
                            return ( 
                                <button 
                                    key={tag.id} 
                                    onClick={() => handleTagToggle(tag.id)} 
                                    type="button" 
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium cursor-pointer transition-all duration-200 h-8
                                        ${isActive 
                                            ? 'border-(--platform-accent) bg-(--platform-accent) text-white' 
                                            : 'border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-secondary) hover:border-(--platform-accent) hover:text-(--platform-text-primary)'
                                        }
                                    `}
                                >
                                    {isActive && <Check size={14} />} {tag.name}
                                </button> 
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Image size={22} className="text-(--platform-accent)" /> Розумна Обкладинка
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            Налаштуйте вигляд картки так, як вона виглядатиме в каталозі.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-8">
                    <div className="flex justify-center bg-(--platform-bg) border border-(--platform-border-color) rounded-xl p-8 bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-repeat">
                         <div className="relative group">
                            <div style={{ width: '320px', height: '200px', transform: 'scale(1.2)', transformOrigin: 'center', transition: 'transform 0.3s' }} className="shadow-2xl rounded-lg overflow-hidden border border-(--platform-border-color)">
                                <UniversalMediaInput 
                                    type="image"
                                    value={data.cover_image} 
                                    aspect={1.6} 
                                    onChange={(val) => {
                                        const newVal = val && val.target ? val.target.value : val;
                                        handleChange('cover_image', newVal);
                                    }}
                                    triggerStyle={{ display: 'block', padding: 0, border: 'none', background: 'transparent', width: '100%', height: '100%', cursor: 'pointer' }}
                                >
                                    <div 
                                        className="w-full h-full relative"
                                        onMouseEnter={() => setIsCoverHovered(true)} 
                                        onMouseLeave={() => setIsCoverHovered(false)}
                                    >
                                        <SiteCoverDisplay site={{
                                            ...siteData,
                                            title: identityData.title,
                                            logo_url: data.logo_url,
                                            cover_image: data.cover_image,
                                            cover_layout: data.cover_layout,
                                            cover_logo_radius: data.cover_logo_radius,
                                            cover_logo_size: data.cover_logo_size,
                                            cover_title_size: data.cover_title_size
                                        }} style={{ width: '100%', height: '100%' }} />
                                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[2px] z-10 ${isCoverHovered ? 'opacity-100' : 'opacity-0'}`}>
                                            <div className="flex items-center gap-2 font-medium text-sm"><Upload size={16} /> Змінити фон</div>
                                        </div>
                                        {data.cover_image && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleChange('cover_image', ''); }}
                                                className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer z-20 transition-colors hover:bg-(--platform-danger) border-none"
                                                title="Видалити зображення"
                                            >
                                                <Trash size={12} />
                                            </button>
                                        )}
                                    </div>
                                </UniversalMediaInput>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                    <div className="text-center p-8 text-(--platform-text-secondary)">Завантаження шаблонів...</div>
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
            </div>
            
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="flex justify-between items-center flex-wrap gap-4">
                     <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Download size={22} className="text-(--platform-accent)" /> Експорт сайту
                        </h3>
                         <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed max-w-2xl">
                            Завантажте вихідний код вашого сайту (HTML/CSS) одним архівом. 
                        </p>
                    </div>
                    <Button 
                        onClick={handleExportSite} 
                        disabled={isExporting}
                        style={{ height: '46px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {isExporting ? <Loader size={18} className="animate-spin" /> : <FileDown size={18} />}
                        {isExporting ? `Генерація...` : 'Завантажити .ZIP'}
                    </Button>
                </div>
            </div>
            <div 
                className="rounded-2xl border border-(--platform-danger) p-8 mb-6 shadow-sm"
                style={{ background: 'color-mix(in srgb, var(--platform-danger), transparent 95%)' }}
            >
                 <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-(--platform-danger) m-0 mb-1 flex items-center gap-2.5">
                            <AlertCircle size={22} /> Небезпечна зона
                        </h3>
                        <p className="text-sm text-(--platform-danger) m-0 opacity-80">
                            Видалення сайту є <strong>незворотним</strong>. Всі дані будуть втрачені.
                        </p>
                    </div>
                    <Button 
                        variant="danger" 
                        onClick={handleDeleteSite} 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                    >
                        <Trash size={18} /> Видалити сайт
                    </Button>
                </div>
            </div>
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
            <style>{`
                 @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                 @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default GeneralSettingsTab;