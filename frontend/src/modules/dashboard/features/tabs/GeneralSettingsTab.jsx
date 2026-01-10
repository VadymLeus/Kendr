// frontend/src/modules/dashboard/features/tabs/GeneralSettingsTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../../shared/api/api';
import { useAutoSave } from '../../../../shared/hooks/useAutoSave';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import ImageInput from '../../../media/components/ImageInput';
import SiteCoverDisplay from '../../../../shared/ui/complex/SiteCoverDisplay';
import SaveTemplateModal from '../../components/SaveTemplateModal';
import { Input, Button, Select, Switch } from '../../../../shared/ui/elements';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import {
    IconSettings, IconImage, IconShield, IconGlobe, IconPalette, IconAlertCircle, IconTrash,
    IconGrid, IconList, IconType, IconX, IconCheck, IconTag, IconUpload, IconPlus,
    IconChevronDown, IconShoppingCart, IconBriefcase, IconEdit, IconLayout
} from '../../../../shared/ui/elements/Icons';

const API_URL = 'http://localhost:5000';

const GeneralSettingsTab = ({ siteData, onUpdate, onSavingChange }) => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [slug, setSlug] = useState(siteData.site_path);
    const [slugError, setSlugError] = useState('');
    const [isSavingSlug, setIsSavingSlug] = useState(false);
    const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
    const [personalTemplates, setPersonalTemplates] = useState([]);
    const [systemTemplates, setSystemTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [expandedSections, setExpandedSections] = useState(() => {
        try { return JSON.parse(localStorage.getItem('kendr_template_sections')) || { personal: true, system: true }; }
        catch (e) { return { personal: true, system: true }; }
    });

    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({ name: '', description: '' });
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isCoverHovered, setIsCoverHovered] = useState(false);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const { data, handleChange, isSaving, setData } = useAutoSave(
        `/sites/${siteData.site_path}/settings`,
        {
            title: siteData.title,
            status: siteData.status,
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
        if (src.startsWith('data:')) return src;
        if (src.startsWith('http')) return src;
        const cleanSrc = src.startsWith('/') ? src : `/${src}`;
        return `${API_URL}${cleanSrc}`;
    };

    useEffect(() => {
        if (siteData) {
            setData(prev => ({
                ...prev,
                cover_image: siteData.cover_image || '',
                cover_layout: siteData.cover_layout || 'centered',
                cover_logo_radius: parseInt(siteData.cover_logo_radius || 0),
                cover_logo_size: parseInt(siteData.cover_logo_size || 80),
                cover_title_size: parseInt(siteData.cover_title_size || 24),
                title: siteData.title,
                status: siteData.status,
                favicon_url: siteData.favicon_url || '',
                logo_url: siteData.logo_url || '',
                site_title_seo: siteData.site_title_seo || siteData.title,
                show_title: siteData.show_title !== undefined ? siteData.show_title : true,
                theme_settings: siteData.theme_settings || {}
            }));
            setSlug(siteData.site_path);
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
        if (onSavingChange) onSavingChange(isSaving || isSavingSlug);
    }, [isSaving, isSavingSlug, onSavingChange]);

    const fetchAllTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const [personalRes, systemRes] = await Promise.all([
                apiClient.get('/user-templates'),
                apiClient.get('/sites/templates')
            ]);
            setPersonalTemplates(personalRes.data);
            setSystemTemplates(systemRes.data);
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
        setEditFormData({
            name: template.name,
            description: template.description || ''
        });
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTemplate(null);
    };

    const handleSaveTemplateChanges = async () => {
        if (!editingTemplate) return;
        setIsSavingTemplate(true);
        try {
            await apiClient.put(`/user-templates/${editingTemplate.id}`, {
                templateName: editFormData.name,
                description: editFormData.description
            });

            setPersonalTemplates(prev => prev.map(t =>
                t.id === editingTemplate.id ? { ...t, name: editFormData.name, description: editFormData.description } : t
            ));

            toast.success('Шаблон оновлено');
            handleCloseEditModal();
        } catch (error) {
            toast.error('Помилка при збереженні змін');
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleSaveTemplate = async (name, description, overwriteId) => {
        try {
            const payload = { siteId: siteData.id, templateName: name, description };

            if (overwriteId) {
                await apiClient.put(`/user-templates/${overwriteId}`, payload);
                toast.success(`Шаблон "${name}" оновлено!`);
            } else {
                await apiClient.post('/user-templates', payload);
                toast.success(`Шаблон "${name}" створено!`);
            }
            setIsSaveTemplateModalOpen(false);
            fetchAllTemplates();
        } catch (error) {
            toast.error('Помилка збереження шаблону');
        }
    };

    const handleDeleteTemplate = async (id, name) => {
        const isConfirmed = await confirm({
            title: "Видалити шаблон?",
            message: `Ви впевнені, що хочете видалити шаблон "${name}"?`,
            type: "danger",
            confirmLabel: "Видалити"
        });

        if (isConfirmed) {
            try {
                await apiClient.delete(`/user-templates/${id}`);
                toast.success("Шаблон видалено");
                fetchAllTemplates();
            } catch (error) {
                toast.error("Не вдалося видалити шаблон");
            }
        }
    };

    const handleApplyTemplate = async (templateId, isPersonal, templateName) => {
        const isConfirmed = await confirm({
            title: "Змінити дизайн?",
            message: `УВАГА: Ви збираєтесь застосувати шаблон "${templateName}". Це повністю замінить поточний дизайн сайту. Продовжити?`,
            type: "warning",
            confirmLabel: "Так, застосувати"
        });

        if (isConfirmed) {
            const toastId = toast.loading("Застосування шаблону...");
            try {
                await apiClient.put(`/sites/${siteData.id}/reset-template`, {
                    templateId,
                    isPersonal
                });

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

    const handleCookieChange = (field, value) => {
        const currentCookie = data.theme_settings?.cookie_banner || { enabled: false, text: "Ми використовуємо файли cookie...", acceptText: "Прийняти", showReject: true, position: "bottom" };
        const updatedCookieSettings = { ...currentCookie, [field]: value };
        const updatedThemeSettings = { ...data.theme_settings, cookie_banner: updatedCookieSettings };
        handleChange('theme_settings', updatedThemeSettings);
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        handleChange('title', newTitle);
        if (onUpdate) onUpdate({ title: newTitle });
    };

    const handleSlugChange = (e) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSlug(val);
        setSlugError('');
    };

    const saveSlug = async () => {
        if (slug === siteData.site_path) return;
        if (slug.length < 3) { setSlugError('Мінімум 3 символи'); return; }
        setIsSavingSlug(true);
        try {
            await apiClient.put(`/sites/${siteData.site_path}/rename`, { newPath: slug });
            toast.success('Адресу сайту успішно змінено! Перезавантаження...');
            setTimeout(() => { navigate(`/dashboard/${slug}`); window.location.reload(); }, 1500);
        } catch (error) {
            setSlugError(error.response?.data?.message || 'Помилка зміни адреси');
            setIsSavingSlug(false);
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

    const getSystemTemplateIcon = (name) => {
        const n = name.toLowerCase();
        const iconProps = { size: 24, className: "text-(--platform-text-primary)" };
        if (n.includes('shop') || n.includes('store')) return <IconShoppingCart {...iconProps} />;
        if (n.includes('business') || n.includes('pro')) return <IconBriefcase {...iconProps} />;
        if (n.includes('portfolio') || n.includes('art')) return <IconImage {...iconProps} />;
        if (n.includes('canvas') || n.includes('clean') || n.includes('blank')) return <IconLayout {...iconProps} />;
        return <IconGrid {...iconProps} />;
    };

    const cookieSettings = data.theme_settings?.cookie_banner || { enabled: false, text: "", acceptText: "", showReject: true };

    const generatorLayouts = [
        { id: 'centered', label: 'Стандарт', icon: <IconGrid size={20} /> },
        { id: 'centered_reverse', label: 'Реверс', icon: <IconGrid size={20} className="rotate-180" /> },
        { id: 'classic', label: 'Класика', icon: <IconList size={20} /> },
        { id: 'reverse', label: 'Справа', icon: <IconList size={20} className="-scale-x-100" /> },
        { id: 'minimal', label: 'Текст', icon: <IconType size={20} /> },
        { id: 'logo_only', label: 'Лого', icon: <IconImage size={20} /> }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold mb-1 text-(--platform-text-primary) flex items-center gap-2.5">
                        <IconSettings size={28} /> Глобальні налаштування
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
                            <IconImage size={22} className="text-(--platform-accent)" /> Логотип та Назва
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            Налаштування брендингу та адреси сайту
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">
                        Логотип сайту
                    </label>
                    <div className="flex justify-center">
                        <div className="w-45">
                            <ImageInput
                                value={data.logo_url}
                                onChange={(e) => {
                                    const newVal = e.target ? e.target.value : e;
                                    handleChange('logo_url', newVal);
                                    if(onUpdate) onUpdate({ logo_url: newVal });
                                }}
                                aspect={1}
                                triggerStyle={{ display: 'block', padding: 0, border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}
                            >
                                <div 
                                    className="w-full h-30 border border-(--platform-border-color) rounded-xl overflow-hidden bg-(--platform-bg) relative flex items-center justify-center group"
                                    onMouseEnter={() => setIsLogoHovered(true)} 
                                    onMouseLeave={() => setIsLogoHovered(false)}
                                >
                                    {data.logo_url ? (
                                        <img 
                                            src={getImageUrl(data.logo_url)} 
                                            alt="Logo" 
                                            className="max-w-[90%] max-h-[90%] object-contain"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <IconImage size={32} className="text-(--platform-text-secondary) opacity-50" />
                                    )}
                                    <div 
                                        className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[2px] z-10 ${isLogoHovered ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        <IconUpload size={24} />
                                    </div>
                                    {data.logo_url && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleChange('logo_url', ''); if(onUpdate) onUpdate({ logo_url: '' }); }}
                                            className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer z-20 transition-colors hover:bg-(--platform-danger) border-none"
                                            title="Видалити лого"
                                        >
                                            <IconTrash size={14} />
                                        </button>
                                    )}
                                </div>
                            </ImageInput>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <Input
                        label="Назва сайту (текст)"
                        value={data.title}
                        onChange={handleTitleChange}
                        placeholder="Мій інтернет-магазин"
                        leftIcon={<IconType size={16}/>}
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">Веб-адреса</label>
                    <div className="flex gap-2 items-center">
                        <div className="py-3 px-4 bg-(--platform-bg) rounded-lg border border-(--platform-border-color) text-(--platform-text-secondary) text-sm whitespace-nowrap">
                            /site/
                        </div>
                        <input 
                            type="text" 
                            className="w-full py-3 px-4 rounded-lg border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-primary) text-sm box-border transition-all duration-200 font-medium focus:outline-none focus:border-(--platform-accent) focus:ring-2 focus:ring-(--platform-accent)/10"
                            value={slug} 
                            onChange={handleSlugChange} 
                        />
                        <Button onClick={saveSlug} disabled={isSavingSlug}>{isSavingSlug ? '...' : 'Зберегти'}</Button>
                    </div>
                    {slugError && <div className="text-[#e53e3e] text-xs mt-1.5 flex items-center gap-1"><IconAlertCircle size={14} /> {slugError}</div>}
                </div>
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                 <div className="mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <IconGlobe size={22} className="text-(--platform-accent)" /> SEO та Теги
                        </h3>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2.5">
                        <label className="font-medium text-(--platform-text-primary) text-sm m-0 flex items-center gap-1.5">
                            <IconTag size={16} /> Категорії / Теги 
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
                            <IconX size={16} />
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
                                    {isActive && <IconCheck size={14} />} {tag.name}
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
                            <IconImage size={22} className="text-(--platform-accent)" /> Розумна Обкладинка
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            Ця картка відображається в каталозі сайтів.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div>
                        <label className="block mb-2.5 font-semibold text-(--platform-text-primary) text-sm">Попередній перегляд:</label>
                        <ImageInput value={data.cover_image} onChange={(e) => handleChange('cover_image', e.target.value)} aspect={1.6} triggerStyle={{ display: 'block', padding: 0, border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}>
                            <div 
                                className="w-full aspect-[1.6/1] border border-(--platform-border-color) rounded-xl overflow-hidden shadow-sm relative transition-all duration-200 group"
                                onMouseEnter={() => setIsCoverHovered(true)} 
                                onMouseLeave={() => setIsCoverHovered(false)}
                            >
                                <SiteCoverDisplay site={{
                                    ...siteData,
                                    title: data.title,
                                    logo_url: data.logo_url,
                                    cover_image: data.cover_image,
                                    cover_layout: data.cover_layout,
                                    cover_logo_radius: data.cover_logo_radius,
                                    cover_logo_size: data.cover_logo_size,
                                    cover_title_size: data.cover_title_size
                                }} />
                                
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[2px] z-10 ${isCoverHovered ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="flex items-center gap-2 font-medium"><IconUpload size={20} /> Змінити обкладинку</div>
                                </div>

                                {data.cover_image && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleChange('cover_image', ''); }}
                                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer z-20 transition-colors hover:bg-(--platform-danger) border-none"
                                        title="Видалити зображення"
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                )}
                            </div>
                        </ImageInput>
                    </div>

                    <div className="h-px bg-(--platform-border-color)" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div>
                            <label className="block mb-3 font-semibold text-(--platform-text-primary) text-sm">Стиль генератора:</label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {generatorLayouts.map(layout => (
                                    <button 
                                        key={layout.id} 
                                        onClick={() => handleChange('cover_layout', layout.id)} 
                                        className={`
                                            flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-all duration-200 cursor-pointer text-xs
                                            ${data.cover_layout === layout.id 
                                                ? 'bg-(--platform-accent) text-white border-(--platform-accent) shadow-sm' 
                                                : 'bg-(--platform-bg) text-(--platform-text-primary) border-(--platform-border-color) hover:border-(--platform-accent) hover:bg-(--platform-accent)/5 hover:text-(--platform-accent)'
                                            }
                                        `}
                                    >
                                        <span className="mb-1.5">{layout.icon}</span>
                                        {layout.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-(--platform-bg) p-5 rounded-xl border border-(--platform-border-color)">
                            <label className="block mb-4 font-semibold text-(--platform-text-primary) text-sm">Налаштування елементів:</label>

                            <div className="mb-5">
                                <div className="flex items-center gap-2 mb-2 text-(--platform-text-secondary) text-xs">
                                    <IconImage size={14} /> Логотип
                                </div>
                                <div className="mb-3">
                                    <RangeSlider label="Розмір" value={data.cover_logo_size !== undefined ? data.cover_logo_size : 80} onChange={(val) => handleChange('cover_logo_size', parseInt(val))} min={30} max={150} unit="px" step={5} />
                                </div>
                                <div>
                                    <RangeSlider label="Скруглення" value={data.cover_logo_radius !== undefined ? data.cover_logo_radius : 0} onChange={(val) => handleChange('cover_logo_radius', parseInt(val))} min={0} max={100} unit="px" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2 text-(--platform-text-secondary) text-xs">
                                    <IconType size={14} /> Текст заголовка
                                </div>
                                <div>
                                    <RangeSlider label="Розмір шрифту" value={data.cover_title_size !== undefined ? data.cover_title_size : 24} onChange={(val) => handleChange('cover_title_size', parseInt(val))} min={12} max={60} unit="px" step={2} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <IconShield size={22} className="text-(--platform-accent)" /> Конфіденційність
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">Налаштування Cookie-банера</p>
                    </div>
                </div>
                <div className="mb-6"><Switch checked={cookieSettings.enabled} onChange={(e) => handleCookieChange('enabled', e.target.checked)} label="Ввімкнути Cookie-банер" /></div>
                {cookieSettings.enabled && (
                    <div className="animate-[fadeIn_0.3s_ease-in-out]">
                        <div className="mb-6">
                            <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">Текст повідомлення</label>
                            <textarea 
                                value={cookieSettings.text} 
                                onChange={(e) => handleCookieChange('text', e.target.value)} 
                                className="w-full p-3 rounded-lg border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-primary) text-sm box-border transition-all duration-200 min-h-20 resize-y focus:outline-none focus:border-(--platform-accent) focus:ring-2 focus:ring-(--platform-accent)/10"
                                placeholder="Ми використовуємо cookies..." 
                            />
                        </div>
                        <div className="mb-6"><Switch checked={cookieSettings.showReject !== false} onChange={(e) => handleCookieChange('showReject', e.target.checked)} label='Показати кнопку "Відхилити"' /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input label="Текст кнопки прийняття" value={cookieSettings.acceptText} onChange={(e) => handleCookieChange('acceptText', e.target.value)} placeholder="Прийняти" />
                            {(cookieSettings.showReject !== false) && (<Input label="Текст кнопки відхилення" value={cookieSettings.rejectText} onChange={(e) => handleCookieChange('rejectText', e.target.value)} placeholder="Відхилити" />)}
                        </div>
                        <div className="mb-6 mt-6">
                            <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">Розташування банера</label>
                            <Select value={cookieSettings.position || 'bottom'} onChange={(e) => handleCookieChange('position', e.target.value)} options={[{ value: 'bottom', label: 'Внизу екрану' }, { value: 'top', label: 'Вгорі екрану' }]} />
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="mb-6 flex justify-between items-center gap-3">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <IconPalette size={22} className="text-(--platform-accent)" /> Керування шаблонами
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            Зберігайте поточний дизайн або змінюйте вигляд сайту
                        </p>
                    </div>
                    <div className="flex gap-2.5">
                        <Button variant="secondary" onClick={() => setIsSaveTemplateModalOpen(true)}><IconPlus size={18} /> Зберегти поточний</Button>
                    </div>
                </div>

                {loadingTemplates ? (
                    <div className="text-center p-8 text-(--platform-text-secondary)">Завантаження шаблонів...</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="border border-(--platform-border-color) rounded-xl overflow-hidden">
                            <div 
                                className="flex items-center justify-between cursor-pointer py-4 px-5 select-none transition-all duration-200 bg-(--platform-bg) hover:bg-black/5" 
                                onClick={() => toggleSection('personal')}
                            >
                                <div className="font-semibold text-(--platform-text-primary)">Ваші шаблони ({personalTemplates.length})</div>
                                <IconChevronDown size={20} className={`text-(--platform-text-secondary) transition-transform duration-300 ${expandedSections.personal ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.personal && (
                                <div className="px-5 pb-5 bg-(--platform-bg) border-t border-(--platform-border-color)">
                                    {personalTemplates.length > 0 ? (
                                        <div className="mt-4 flex flex-col gap-3">
                                            {personalTemplates.map(template => (
                                                <div key={template.id} className="bg-(--platform-bg) border border-(--platform-border-color) rounded-xl p-5 flex justify-between items-center flex-wrap gap-4 transition-all duration-200 hover:shadow-sm hover:border-(--platform-accent)/30">
                                                    <div>
                                                        <div className="font-semibold text-(--platform-text-primary) text-lg mb-1">{template.name}</div>
                                                        <div className="text-sm text-(--platform-text-secondary)">{template.description || 'Опис відсутній'} • {new Date(template.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleApplyTemplate(template.id, true, template.name)} 
                                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 bg-transparent border border-(--platform-warning) text-(--platform-warning) hover:bg-(--platform-warning) hover:text-white"
                                                        >
                                                            <IconGrid size={16} /> Застосувати
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleOpenEditModal(e, template)} 
                                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 bg-transparent border border-(--platform-accent) text-(--platform-accent) hover:bg-(--platform-accent) hover:text-white"
                                                        >
                                                            <IconEdit size={16} /> Редагувати
                                                        </button>
                                                        <Button variant="square-danger" onClick={() => handleDeleteTemplate(template.id, template.name)} title="Видалити шаблон"><IconTrash size={18} /></Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 text-(--platform-text-secondary) opacity-80">
                                            Список порожній. Збережіть поточний дизайн як шаблон.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="border border-(--platform-border-color) rounded-xl overflow-hidden">
                            <div 
                                className="flex items-center justify-between cursor-pointer py-4 px-5 select-none transition-all duration-200 bg-(--platform-bg) hover:bg-black/5" 
                                onClick={() => toggleSection('system')}
                            >
                                <div className="font-semibold text-(--platform-text-primary)">Системні шаблони ({systemTemplates.length})</div>
                                <IconChevronDown size={20} className={`text-(--platform-text-secondary) transition-transform duration-300 ${expandedSections.system ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.system && (
                                <div className="px-5 pb-5 bg-(--platform-bg) border-t border-(--platform-border-color)">
                                    {systemTemplates.length > 0 ? (
                                        <div className="mt-4 flex flex-col gap-3">
                                            {systemTemplates.map(template => (
                                                <div key={template.id} className="bg-(--platform-bg) border border-(--platform-border-color) rounded-xl p-4 flex justify-between items-center flex-wrap gap-4 transition-all duration-200 hover:shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-(--platform-bg) overflow-hidden flex items-center justify-center border border-(--platform-border-color) shadow-sm">
                                                            {getSystemTemplateIcon(template.name)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-(--platform-text-primary) text-lg mb-1">{template.name}</div>
                                                            <div className="text-sm text-(--platform-text-secondary)">{template.description || 'Базовий шаблон системи'}</div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleApplyTemplate(template.id, false, template.name)} 
                                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 bg-transparent border border-(--platform-warning) text-(--platform-warning) hover:bg-(--platform-warning) hover:text-white"
                                                    >
                                                        <IconGrid size={16} /> Застосувати
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 text-(--platform-text-secondary)">Немає доступних системних шаблонів.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="rounded-2xl border border-[#fed7d7] p-8 mb-6 shadow-sm bg-linear-to-br from-[#fff5f5] to-[#fed7d7]">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#c53030] m-0 mb-1 flex items-center gap-2.5">
                            <IconAlertCircle size={22} /> Небезпечна зона
                        </h3>
                        <p className="text-sm text-[#c53030] m-0 opacity-80">Видалення сайту є незворотним.</p>
                    </div>
                    <Button variant="danger" onClick={handleDeleteSite} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconTrash size={16} /> Видалити сайт</Button>
                </div>
            </div>

            <SaveTemplateModal
                isOpen={isSaveTemplateModalOpen}
                onClose={() => setIsSaveTemplateModalOpen(false)}
                onSave={handleSaveTemplate}
            />
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center backdrop-blur-xs" onClick={handleCloseEditModal}>

                    <div className="bg-(--platform-card-bg) p-6 rounded-xl w-full max-w-100 border border-(--platform-border-color) shadow-2xl animate-[popIn_0.2s_ease]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="m-0 text-lg font-semibold text-(--platform-text-primary)">Редагувати шаблон</h3>
                            <button onClick={handleCloseEditModal} className="bg-transparent border-none cursor-pointer text-(--platform-text-secondary) hover:text-(--platform-text-primary)">
                                <IconX size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Input
                                label="Назва шаблону"
                                value={editFormData.name}
                                onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                placeholder="Мій крутий шаблон"
                            />

                            <div>
                                <label className="block mb-2 text-sm font-medium text-(--platform-text-secondary)">
                                    Опис
                                </label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                                    placeholder="Короткий опис шаблону..."
                                    className="w-full p-2.5 rounded-lg border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-primary) min-h-20 resize-y focus:outline-none focus:border-(--platform-accent)"
                                />
                            </div>

                            <div className="flex gap-2.5 mt-2">
                                <Button variant="secondary" onClick={handleCloseEditModal} style={{ flex: 1 }}>Скасувати</Button>
                                <Button onClick={handleSaveTemplateChanges} disabled={isSavingTemplate || !editFormData.name} style={{ flex: 1 }}>
                                    {isSavingTemplate ? 'Збереження...' : 'Зберегти'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                 @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                 @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default GeneralSettingsTab;