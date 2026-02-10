// frontend/src/modules/dashboard/pages/CreateSitePage.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../shared/api/api';
import { Input } from '../../../shared/ui/elements/Input';
import { Button } from '../../../shared/ui/elements/Button';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import TemplateModal from '../components/TemplateModal';
import UniversalMediaInput from '../../../shared/ui/complex/UniversalMediaInput';
import EmptyState from '../../../shared/ui/complex/EmptyState';
import SitePreviewer from '../../../shared/ui/complex/SitePreviewer';
import { TEXT_LIMITS } from '../../../shared/config/limits';
import { AuthContext } from '../../../app/providers/AuthContext';
import { ArrowLeft, Layout, Check, Loader, AlertCircle, Grid, User, Search, Edit, Trash, Info, Palette, Sparkles, Globe, Lock, Image, FileText, ShoppingBag, Briefcase, Camera, Coffee, Music, Star, Heart, Shield, EyeOff, Tag } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const ICON_MAP = {
    'Layout': Layout, 'FileText': FileText, 'ShoppingBag': ShoppingBag,
    'Briefcase': Briefcase, 'Camera': Camera, 'Coffee': Coffee,
    'Music': Music, 'Star': Star, 'Heart': Heart, 'Globe': Globe,
};
const TEMPLATE_CATEGORIES = [
    { id: 'All', label: 'Всі' },
    { id: 'General', label: 'Загальне' },
    { id: 'Business', label: 'Бізнес' },
    { id: 'Store', label: 'Магазин' },
    { id: 'Portfolio', label: 'Портфоліо' },
    { id: 'Landing', label: 'Лендінг' },
    { id: 'Blog', label: 'Блог' },
    { id: 'Creative', label: 'Креатив' },
];
const getTemplateIcon = (iconName) => ICON_MAP[iconName] || Layout; 
const getCategoryLabel = (catId) => {
    if (!catId) return null;
    const found = TEMPLATE_CATEGORIES.find(c => c.id.toLowerCase() === catId.toLowerCase());
    return found ? found.label : catId;
};
const CreateSitePage = () => {
    const navigate = useNavigate();
    const { isAdmin } = useContext(AuthContext);
    const [systemTemplates, setSystemTemplates] = useState([]);
    const [personalTemplates, setPersonalTemplates] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [panelTab, setPanelTab] = useState('info'); 
    const [templateSourceTab, setTemplateSourceTab] = useState('system'); 
    const [viewMode, setViewMode] = useState('desktop'); 
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ title: '', slug: '' });
    const [customLogo, setCustomLogo] = useState(null);
    const [defaultRandomLogo, setDefaultRandomLogo] = useState(null);
    const [slugStatus, setSlugStatus] = useState('idle'); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDeleteId, setTemplateToDeleteId] = useState(null);
    const [previewData, setPreviewData] = useState({ 
        pages: [], 
        theme: { mode: 'light', accent: 'blue' },
        header: [], 
        footer: [], 
        siteData: {} 
    });
    
    const [currentPreviewSlug, setCurrentPreviewSlug] = useState('home');
    useEffect(() => {
        const loadData = async () => {
            try {
                const templatesUrl = isAdmin ? '/sites/templates?include_drafts=true' : '/sites/templates';
                const [sysRes, persRes, logosRes] = await Promise.allSettled([
                    apiClient.get(templatesUrl),
                    apiClient.get('/user-templates'),
                    apiClient.get('/sites/default-logos')
                ]);
                if (sysRes.status === 'fulfilled') {
                    setSystemTemplates(sysRes.value.data);
                    if (sysRes.value.data.length > 0) handleSelectTemplate(sysRes.value.data[0], 'system');
                }
                if (persRes.status === 'fulfilled') {
                    setPersonalTemplates(persRes.value.data);
                }
                if (logosRes.status === 'fulfilled' && Array.isArray(logosRes.value.data) && logosRes.value.data.length > 0) {
                    setDefaultRandomLogo(logosRes.value.data[Math.floor(Math.random() * logosRes.value.data.length)]);
                }
            } catch (err) {
                console.error(err);
                toast.error('Не вдалося завантажити дані');
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }, [isAdmin]);
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!formData.slug || formData.slug.length < 3) {
                setSlugStatus('idle');
                return;
            }
            setSlugStatus('checking');
            try {
                const res = await apiClient.get(`/sites/check-slug?slug=${formData.slug}`);
                setSlugStatus(res.data.isAvailable ? 'available' : 'taken');
            } catch (err) { setSlugStatus('idle'); }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.slug]);
    const handleSelectTemplate = (template, type) => {
        if (!template) return;
        setSelectedTemplateId(template.id);
        let content = null;
        try {
            const raw = template.default_block_content || template.full_site_snapshot;
            content = (typeof raw === 'string' ? JSON.parse(raw) : raw);
        } catch (e) { return; }
        if (!content) return;
        let pages = Array.isArray(content.pages) ? content.pages 
            : Array.isArray(content) ? [{ slug: 'home', blocks: content }]
            : Array.isArray(content.blocks) ? [{ slug: 'home', blocks: content.blocks }]
            : [{ slug: 'home', blocks: [] }];
        const themeSettings = content.theme_settings || {};
        const mode = content.site_theme_mode || themeSettings.mode || 'light';
        const accent = content.site_theme_accent || themeSettings.accent || 'orange';
        setPreviewData({ 
            pages, 
            theme: { 
                ...themeSettings,
                mode: mode,
                accent: accent
            }, 
            header: content.header_content || [], 
            footer: content.footer_content || [],
            siteData: { title: template.name, ...content.site_settings } 
        });
        
        const hasHomePage = pages.find(p => p.slug === 'home');
        setCurrentPreviewSlug(hasHomePage ? 'home' : (pages[0]?.slug || 'home'));
    };
    const effectiveLogo = customLogo || defaultRandomLogo || '/uploads/shops/logos/default/default-logo.webp';
    const currentBlocks = useMemo(() => {
        const page = previewData.pages.find(p => p.slug === currentPreviewSlug);
        return page ? (page.blocks || []) : [];
    }, [previewData.pages, currentPreviewSlug]);
    const handleTitleChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, title: val }));
    };
    const handleSubmit = async () => {
        if (!formData.title || !formData.slug || !selectedTemplateId || slugStatus === 'taken') return;
        setIsSubmitting(true);
        try {
            const payload = { templateId: selectedTemplateId, sitePath: formData.slug, title: formData.title, selected_logo_url: effectiveLogo };
            const res = await apiClient.post('/sites/create', payload);
            toast.success('Сайт створено успішно!');
            window.location.href = `/dashboard/${res.data.site.site_path}`;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Помилка створення сайту');
            setIsSubmitting(false);
        }
    };
    const handleClearLogo = (e) => { e.stopPropagation(); setCustomLogo(null); };
    const getFullUrl = (path) => path?.startsWith('http') ? path : `${API_URL}${path}`;
    const handleOpenEditModal = (e, template) => { e.stopPropagation(); setEditingTemplate(template); setIsEditModalOpen(true); };
    const handleSaveTemplateChanges = async (name, description, icon, category) => {
        if (!editingTemplate) return;
        try {
            await apiClient.put(`/user-templates/${editingTemplate.id}`, { templateName: name, description, icon, category });
            setPersonalTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, name, description, icon, category } : t));
            toast.success('Шаблон оновлено'); setIsEditModalOpen(false); setEditingTemplate(null);
        } catch (error) { console.error(error); toast.error('Помилка при збереженні'); }
    };
    const handleConfirmDelete = async () => {
        if (!templateToDeleteId) return;
        try {
            await apiClient.delete(`/user-templates/${templateToDeleteId}`);
            setPersonalTemplates(prev => prev.filter(t => t.id !== templateToDeleteId));
            toast.success('Шаблон видалено');
        } catch (error) { toast.error('Помилка видалення'); } finally { setIsDeleteModalOpen(false); }
    };
    const filteredTemplates = useMemo(() => {
        let source = templateSourceTab === 'system' ? systemTemplates : personalTemplates;
        if (searchQuery) {
            source = source.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (selectedCategory !== 'All') {
            const cat = selectedCategory.toLowerCase();
            source = source.filter(t => {
                if (t.category && t.category.toLowerCase() === cat) return true;
                const inName = t.name.toLowerCase().includes(cat);
                const inDesc = t.description && t.description.toLowerCase().includes(cat);
                return inName || inDesc;
            });
        }
        return source;
    }, [templateSourceTab, systemTemplates, personalTemplates, searchQuery, selectedCategory]);
    
    const renderAdminBadge = (tpl) => {
        if (!isAdmin) return null;
        let badgeConfig = { text: '', Icon: null, colorVar: '' };
        if (templateSourceTab === 'system') {
            if (tpl.access_level === 'public') badgeConfig = { text: 'Public', Icon: Globe, colorVar: '--platform-success' };
            else if (tpl.access_level === 'admin_only') badgeConfig = { text: 'Admin Only', Icon: Shield, colorVar: '--platform-accent' };
            else badgeConfig = { text: 'Draft', Icon: EyeOff, colorVar: '--platform-warning' };
        } else {
            badgeConfig = { text: 'Private', Icon: Lock, colorVar: '--platform-text-secondary' };
        }
        const { text, Icon, colorVar } = badgeConfig;
        return (
            <div 
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors duration-300" 
                style={{
                    color: `var(${colorVar})`,
                    backgroundColor: `color-mix(in srgb, var(${colorVar}), transparent 90%)`,
                    borderColor: `color-mix(in srgb, var(${colorVar}), transparent 80%)`,
                }}
            >
                {Icon && <Icon size={10} style={{ color: `var(${colorVar})` }} />}
                {text}
            </div>
        );
    };
    if (isLoadingData) return <div className="flex h-full items-center justify-center bg-(--platform-bg)"><Loader size={48} className="text-(--platform-accent) animate-spin" /></div>;
    return (
        <div className="flex h-full w-full overflow-hidden bg-(--platform-bg) min-h-0">
            <ConfirmModal 
                isOpen={isDeleteModalOpen} 
                title="Видалити шаблон?" 
                message="Ви впевнені? Це незворотньо." 
                confirmLabel="Видалити" 
                cancelLabel="Скасувати"
                onConfirm={handleConfirmDelete} 
                onCancel={() => setIsDeleteModalOpen(false)} 
                type="danger" 
            />
            <TemplateModal 
                isOpen={isEditModalOpen} 
                initialData={editingTemplate} 
                onClose={() => { setIsEditModalOpen(false); setEditingTemplate(null); }} 
                onSave={handleSaveTemplateChanges} 
            />
            <div className={`
                flex flex-col w-105 min-w-105 h-full max-h-full
                border-r border-(--platform-border-color)
                z-30 shadow-[4px_0_24px_rgba(0,0,0,0.08)] 
                transition-transform duration-300 min-h-0
                bg-(--platform-card-bg)
                ${viewMode === 'mobile' ? 'hidden md:flex' : 'flex'}
            `}>
                <div className="p-6 border-b border-(--platform-border-color) shrink-0">
                    <div className="flex items-center gap-3 mb-6">
                        <Button variant="ghost" onClick={() => navigate('/my-sites')} className="p-2!"><ArrowLeft size={20}/></Button>
                        <h1 className="text-xl font-bold text-(--platform-text-primary) m-0">Новий сайт</h1>
                    </div>
                    <div className="flex p-1 bg-(--platform-bg) rounded-xl border border-(--platform-border-color)">
                        <button 
                            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${panelTab === 'info' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary)'}`} 
                            onClick={() => setPanelTab('info')}
                        >
                            <Info size={16} /> 1. Інформація
                        </button>
                        <button 
                            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${panelTab === 'design' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary)'}`} 
                            onClick={() => setPanelTab('design')}
                        >
                            <Palette size={16} /> 2. Дизайн
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-0 bg-(--platform-bg) min-h-0 [scrollbar-gutter:stable]">
                    {panelTab === 'info' ? (
                         <div className="flex flex-col gap-6 pt-6">
                            <div className="p-5 bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) shadow-sm">
                                <Input label="Назва сайту" value={formData.title} onChange={handleTitleChange} maxLength={TEXT_LIMITS.SITE_NAME} autoFocus />
                                <Input label="Веб-адреса (Slug)" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} rightIcon={slugStatus === 'checking' ? <Loader size={16} className="animate-spin" /> : slugStatus === 'available' ? <Check size={18} className="text-emerald-500" /> : slugStatus === 'taken' ? <AlertCircle size={18} className="text-red-500" /> : <Globe size={16} />} error={slugStatus === 'taken' ? 'Адреса зайнята' : null} helperText={`kendr.site/${formData.slug || '...'}`} />
                            </div>
                            <div className="p-5 bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) shadow-sm">
                                <label className="mb-3 font-semibold text-(--platform-text-primary) text-sm flex items-center gap-2">
                                    <Sparkles size={18} className="text-(--platform-accent)" />
                                    Логотип
                                </label>
                                <UniversalMediaInput type="image" value={customLogo} onChange={setCustomLogo} aspect={1} circularCrop={true} triggerStyle={{ width: '100%', border: 'none', background: 'transparent', padding: 0 }}>
                                    {customLogo ? (
                                        <div className="relative group w-32 h-32 mx-auto rounded-xl border border-(--platform-border-color) bg-(--platform-bg) flex items-center justify-center overflow-hidden cursor-pointer hover:border-(--platform-accent) transition-all shadow-sm">
                                            <img src={getFullUrl(customLogo)} alt="Custom Logo" className="w-full h-full object-contain p-2" />
                                            <button onClick={handleClearLogo} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md" title="Видалити та повернути стандартний"><Trash size={14} /></button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 border-2 border-dashed border-(--platform-border-color) rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-(--platform-accent) hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all group bg-(--platform-bg)">
                                            <div className="w-12 h-12 opacity-50 grayscale group-hover:grayscale-0 transition-all flex items-center justify-center">
                                                 {defaultRandomLogo ? (<img src={getFullUrl(defaultRandomLogo)} className="w-full h-full object-contain" alt="Default" />) : (<Image size={40} className="text-gray-400" />)}
                                            </div>
                                            <span className="text-sm font-medium text-(--platform-text-secondary) group-hover:text-(--platform-accent)">Змінити логотип</span>
                                        </div>
                                    )}
                                </UniversalMediaInput>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="sticky top-0 -mx-6 px-6 pt-2 pb-2 bg-(--platform-bg)/95 z-20 mb-4 backdrop-blur-sm border-b border-transparent transition-all">
                                <div className="flex flex-col gap-3 mb-3">
                                    <div className="flex gap-2">
                                        <Button variant={templateSourceTab === 'system' ? 'primary' : 'outline'} size="sm" className="flex-1 justify-center" onClick={() => setTemplateSourceTab('system')}><Grid size={16} /> Системні</Button>
                                        <Button variant={templateSourceTab === 'personal' ? 'primary' : 'outline'} size="sm" className="flex-1 justify-center" onClick={() => setTemplateSourceTab('personal')}><User size={16} /> Мої шаблони</Button>
                                    </div>
                                    <Input placeholder="Пошук..." leftIcon={<Search size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} wrapperStyle={{ marginBottom: 0 }} />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient-right">
                                    {TEMPLATE_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`
                                                whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                                                ${selectedCategory === cat.id 
                                                    ? 'bg-(--platform-text-primary) text-(--platform-bg) border-(--platform-text-primary)' 
                                                    : 'bg-(--platform-card-bg) text-(--platform-text-secondary) border-(--platform-border-color) hover:border-(--platform-text-secondary)'
                                                }
                                            `}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 pb-4">
                                {filteredTemplates.length > 0 ? filteredTemplates.map(tpl => {
                                    const TemplateIcon = getTemplateIcon(tpl.icon);
                                    const hasValidImage = tpl.thumbnail_url && tpl.thumbnail_url !== 'null' && !tpl.thumbnail_url.includes('empty.png');
                                    const isSelected = selectedTemplateId === tpl.id;
                                    return (
                                        <div 
                                            key={tpl.id} 
                                            className={`relative flex items-center gap-4 p-3 pr-12 rounded-xl border-2 cursor-pointer transition-all group
                                                ${isSelected 
                                                    ? 'border-(--platform-accent) bg-(--platform-card-bg) shadow-md' 
                                                    : 'border-(--platform-border-color) bg-(--platform-card-bg) hover:border-(--platform-border-color)/80'
                                                }`} 
                                            onClick={() => handleSelectTemplate(tpl, templateSourceTab)}
                                        >
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border shrink-0 flex items-center justify-center transition-colors bg-white border-gray-200 text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300">
                                                {hasValidImage ? (
                                                    <img src={tpl.thumbnail_url.startsWith('data:') ? tpl.thumbnail_url : getFullUrl(tpl.thumbnail_url)} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <TemplateIcon size={32} strokeWidth={1.5} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="font-semibold text-(--platform-text-primary) truncate">{tpl.name}</div>
                                                    {renderAdminBadge(tpl)}
                                                </div>
                                                <div className="text-xs text-(--platform-text-secondary) truncate opacity-80">{tpl.description || 'Без опису'}</div>
                                                {(tpl.category) && (
                                                     <div className="flex items-center gap-1 mt-1">
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-(--platform-bg) border border-(--platform-border-color) text-(--platform-text-secondary)">
                                                            <Tag size={10} />
                                                            {getCategoryLabel(tpl.category)}
                                                        </span>
                                                     </div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-(--platform-accent) text-white flex items-center justify-center shadow-sm animate-[popIn_0.2s_ease-out]">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                            {(templateSourceTab === 'personal') && (
                                                <div className="absolute top-2 right-2 flex gap-1 z-10">
                                                    <button onClick={(e) => handleOpenEditModal(e, tpl)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Редагувати"> <Edit size={14} /> </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setTemplateToDeleteId(tpl.id); setIsDeleteModalOpen(true); }} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Видалити"> <Trash size={14} /> </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : <div className="h-60"><EmptyState title="Не знайдено" description="Спробуйте змінити фільтри" icon={Layout}/></div>}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-(--platform-card-bg) border-t border-(--platform-border-color) shrink-0">
                    {panelTab === 'info' ? 
                        <Button variant="primary" className="w-full py-3 justify-center" onClick={handleSubmit} disabled={!formData.title || !formData.slug || slugStatus !== 'available' || isSubmitting}>{isSubmitting ? <Loader size={18} className="animate-spin" /> : <>Створити сайт <ArrowLeft size={18} className="rotate-180" /></>}</Button> 
                        : <Button variant="outline" className="w-full justify-center" onClick={() => setPanelTab('info')}>Далі: Введіть назву <ArrowLeft size={16} className="rotate-180 ml-2" /></Button>
                    }
                </div>
            </div>
            <SitePreviewer 
                viewMode={viewMode}
                setViewMode={setViewMode}
                previewData={previewData}
                currentBlocks={currentBlocks}
                isLoading={isLoadingData}
                emptyTitle="Оберіть шаблон"
                emptyDescription="Оберіть шаблон для попереднього перегляду"
                url={`kendr.site/${formData.slug || 'your-site'}`}
                userTitle={formData.title}
                userLogo={effectiveLogo}
            />
        </div>
    );
};

export default CreateSitePage;