// frontend/src/modules/admin/pages/AdminTemplatesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../../shared/api/api';
import { Input } from '../../../shared/ui/elements/Input';
import EmptyState from '../../../shared/ui/complex/EmptyState';
import SitePreviewer from '../../../shared/ui/complex/SitePreviewer';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { Layout, Search, Globe, Lock, Loader, Shield, FileText, ShoppingBag, Briefcase, Camera, Coffee, Music, Star, Heart, Tag } from 'lucide-react';

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

const AdminTemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('desktop'); 
    const [isToggling, setIsToggling] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, template: null });

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/admin/templates?include_drafts=true');
            setTemplates(res.data);
            if (res.data.length > 0 && !selectedTemplateId) setSelectedTemplateId(res.data[0].id);
        } catch (error) {
            toast.error("Не вдалося завантажити шаблони");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const handleConfirmToggle = async () => {
        const template = confirmModal.template;
        if (!template) return;
        setConfirmModal({ ...confirmModal, isOpen: false });
        if (isToggling) return;
        setIsToggling(template.id);
        const newAccess = template.access_level === 'public' ? 'admin_only' : 'public';
        
        try {
            setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, access_level: newAccess } : t));
            await apiClient.put(`/admin/templates/${template.id}`, { access_level: newAccess });
            toast.success(newAccess === 'public' ? "Опубліковано" : "Приховано");
        } catch (error) {
            fetchTemplates();
        } finally { 
            setIsToggling(null); 
        }
    };

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCat = selectedCategory === 'All' || (t.category && t.category.toLowerCase() === selectedCategory.toLowerCase());
            return matchesSearch && matchesCat;
        });
    }, [templates, searchQuery, selectedCategory]);
    
    const selectedTemplate = useMemo(() => templates.find(t => t.id === selectedTemplateId), [templates, selectedTemplateId]);
    const previewData = useMemo(() => {
        if (!selectedTemplate) return null;
        try {
            const content = typeof selectedTemplate.default_block_content === 'string'
                ? JSON.parse(selectedTemplate.default_block_content)
                : selectedTemplate.default_block_content;
            const themeSettings = content.theme_settings || {};
            const mode = content.site_theme_mode || themeSettings.mode || 'light';
            const accent = content.site_theme_accent || themeSettings.accent || 'orange';

            return {
                siteData: { title: selectedTemplate.name },
                theme: {
                    ...themeSettings,
                    mode: mode,
                    accent: accent
                },
                header: content.header_content || [],
                footer: content.footer_content || [],
                pages: Array.isArray(content.pages) ? content.pages : [{ slug: 'home', blocks: content.blocks || [] }]
            };
        } catch (e) { return null; }
    }, [selectedTemplate]);

    const containerClass = "absolute inset-0 flex overflow-hidden bg-(--platform-bg)";
    if (isLoading) return (
        <div className={`${containerClass} items-center justify-center`}>
            <Loader size={48} className="text-(--platform-accent) animate-spin" />
        </div>
    );

    return (
        <div className={containerClass}>
            
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.template?.access_level === 'public' ? "Сховати?" : "Опублікувати?"}
                message={confirmModal.template?.access_level === 'public' 
                    ? `Ви впевнені, що хочете сховати шаблон "${confirmModal.template?.name}"?`
                    : `Ви впевнені, що хочете опублікувати шаблон "${confirmModal.template?.name}"?`
                }
                onConfirm={handleConfirmToggle}
                onCancel={() => setConfirmModal({ isOpen: false, template: null })}
                confirmLabel={confirmModal.template?.access_level === 'public' ? "Сховати" : "Опублікувати"}
                type={confirmModal.template?.access_level === 'public' ? "warning" : "primary"}
            />
            <div className="flex flex-col w-96 lg:w-105 h-full bg-(--platform-card-bg) border-r border-(--platform-border-color) shadow-xl shrink-0 z-10">
                <div className="p-6 space-y-4 shrink-0 border-b border-(--platform-border-color)">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-(--platform-accent) rounded-lg text-white">
                            <Layout size={20} />
                        </div>
                        <h1 className="text-xl font-bold text-(--platform-text-primary)">Шаблони</h1>
                    </div>
                    
                    <Input 
                        placeholder="Пошук..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        leftIcon={<Search size={16} />} 
                        wrapperStyle={{ marginBottom: '16px' }}
                    />

                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {TEMPLATE_CATEGORIES.map(cat => {
                            const isActive = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                                        ${isActive 
                                            ? 'bg-(--platform-text-primary) text-(--platform-bg) border-(--platform-text-primary)' 
                                            : 'bg-(--platform-bg) text-(--platform-text-secondary) border-(--platform-border-color) hover:border-(--platform-text-secondary)'}`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-(--platform-bg)">
                    {filteredTemplates.length === 0 ? (
                        <div className="mt-8">
                            <EmptyState title="Порожньо" icon={Layout} />
                        </div>
                    ) : (
                        filteredTemplates.map(tpl => {
                            const TemplateIcon = getTemplateIcon(tpl.icon);
                            const isSelected = selectedTemplateId === tpl.id;
                            const isPublic = tpl.access_level === 'public';
                            const hasImage = tpl.thumbnail_url && !tpl.thumbnail_url.includes('empty');

                            return (
                                <div 
                                    key={tpl.id} 
                                    className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                                        ${isSelected 
                                            ? 'border-(--platform-accent) bg-(--platform-card-bg) shadow-md' 
                                            : 'border-transparent bg-(--platform-card-bg) hover:border-(--platform-border-color)'}`}
                                    onClick={() => setSelectedTemplateId(tpl.id)}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-(--platform-bg) border border-(--platform-border-color) flex items-center justify-center shrink-0 overflow-hidden">
                                        {hasImage ? (
                                             <img src={tpl.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <TemplateIcon size={24} className="text-(--platform-text-secondary)" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate text-sm text-(--platform-text-primary)">{tpl.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase 
                                                ${isPublic 
                                                    ? 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                                                    : 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                                }`}>
                                                {isPublic ? 'Public' : 'Admin'}
                                            </span>
                                            {tpl.category && <span className="text-[10px] text-(--platform-text-secondary)">#{getCategoryLabel(tpl.category)}</span>}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, template: tpl }); }} 
                                        className={`p-2 rounded-lg border transition-colors 
                                            ${isPublic 
                                                ? 'text-green-600 bg-green-50 border-green-100 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                                                : 'text-gray-400 bg-gray-50 border-gray-100 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-300'
                                            }`}
                                        disabled={isToggling === tpl.id}
                                    >
                                        {isToggling === tpl.id ? <Loader size={16} className="animate-spin" /> : isPublic ? <Globe size={16} /> : <Lock size={16} />}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            <div className="flex-1 h-full relative bg-(--platform-bg)">
                <SitePreviewer 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    previewData={previewData}
                    currentBlocks={previewData?.pages[0]?.blocks || []}
                    isLoading={false}
                    emptyTitle="Оберіть шаблон"
                    emptyDescription="Виберіть шаблон зі списку ліворуч для попереднього перегляду"
                    url={selectedTemplate ? `kendr.site/templates/${selectedTemplate.id}` : ''}
                />
            </div>
        </div>
    );
};

export default AdminTemplatesPage;