// frontend/src/modules/admin/pages/AdminTemplatesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../../shared/api/api';
import { Input } from '../../../shared/ui/elements/Input';
import EmptyState from '../../../shared/ui/complex/EmptyState';
import SitePreviewer from '../../../shared/ui/complex/SitePreviewer';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { Layout, Search, Globe, Lock, Loader, FileText, ShoppingBag, Briefcase, Camera, Coffee, Music, Star, Heart, Eye } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('all');
    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/admin/templates?include_drafts=true');
            const readyTemplates = res.data.filter(t => t.is_ready);
            setTemplates(readyTemplates);
            
            if (readyTemplates.length > 0 && !selectedTemplateId) {
                setSelectedTemplateId(readyTemplates[0].id);
            }
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
            toast.success(newAccess === 'public' ? "Шаблон опубліковано!" : "Шаблон приховано (На перевірці)");
        } catch (error) {
            fetchTemplates();
            toast.error("Помилка при зміні статусу");
        } finally { 
            setIsToggling(null); 
        }
    };

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCat = selectedCategory === 'All' || (t.category && t.category.toLowerCase() === selectedCategory.toLowerCase());
            let matchesTab = true;
            if (activeTab === 'staging') matchesTab = t.access_level === 'admin_only';
            if (activeTab === 'public') matchesTab = t.access_level === 'public';
            return matchesSearch && matchesCat && matchesTab;
        });
    }, [templates, searchQuery, selectedCategory, activeTab]);
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
    const containerStyle = {
        position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden', background: 'var(--platform-bg)'
    };
    if (isLoading) return (
        <div style={{...containerStyle, alignItems: 'center', justifyContent: 'center'}}>
            <Loader size={48} style={{ color: 'var(--platform-accent)' }} className="animate-spin" />
        </div>
    );
    return (
        <div style={containerStyle}>
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.template?.access_level === 'public' ? "Сховати на перевірку?" : "Опублікувати?"}
                message={confirmModal.template?.access_level === 'public' 
                    ? `Шаблон "${confirmModal.template?.name}" стане недоступним для користувачів (статус: На перевірці).`
                    : `Шаблон "${confirmModal.template?.name}" стане доступним для всіх користувачів.`
                }
                onConfirm={handleConfirmToggle}
                onCancel={() => setConfirmModal({ isOpen: false, template: null })}
                confirmLabel={confirmModal.template?.access_level === 'public' ? "Сховати" : "Опублікувати"}
                type={confirmModal.template?.access_level === 'public' ? "warning" : "primary"}
            />
            <div style={{
                display: 'flex', flexDirection: 'column', width: '384px', height: '100%',
                background: 'var(--platform-card-bg)', borderRight: '1px solid var(--platform-border-color)',
                boxShadow: '10px 0 15px -3px rgba(0, 0, 0, 0.05)', flexShrink: 0, zIndex: 10
            }}>
                <div style={{ padding: '24px', flexShrink: 0, borderBottom: '1px solid var(--platform-border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', background: 'var(--platform-accent)', borderRadius: '8px', color: 'white' }}>
                            <Layout size={20} />
                        </div>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--platform-text-primary)' }}>Шаблони</h1>
                    </div>
                    <Input 
                        placeholder="Пошук..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        leftIcon={<Search size={16} />} 
                        wrapperStyle={{ marginBottom: '16px' }}
                    />
                    <div className="flex bg-(--platform-bg) p-1 rounded-lg mb-4 border border-(--platform-border-color)">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                activeTab === 'all' 
                                ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' 
                                : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'
                            }`}
                        >
                            Всі
                        </button>
                        <button
                            onClick={() => setActiveTab('staging')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                                activeTab === 'staging' 
                                ? 'bg-(--platform-card-bg) text-(--platform-accent) shadow-sm' 
                                : 'text-(--platform-text-secondary) hover:text-(--platform-accent)'
                            }`}
                        >
                            <Eye size={12} /> На перевірці
                        </button>
                        <button
                            onClick={() => setActiveTab('public')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                                activeTab === 'public' 
                                ? 'bg-(--platform-card-bg) text-(--platform-success) shadow-sm' 
                                : 'text-(--platform-text-secondary) hover:text-(--platform-success)'
                            }`}
                        >
                            <Globe size={12} /> Публічні
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                        {TEMPLATE_CATEGORIES.map(cat => {
                            const isActive = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`category-chip ${isActive ? 'active' : ''}`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--platform-bg)' }}>
                    {filteredTemplates.length === 0 ? (
                        <div style={{ marginTop: '32px' }}>
                            <EmptyState title="Порожньо" description={activeTab === 'staging' ? "Немає шаблонів на перевірці" : "Немає публічних шаблонів"} icon={Layout} />
                        </div>
                    ) : (
                        filteredTemplates.map(tpl => {
                            const TemplateIcon = getTemplateIcon(tpl.icon);
                            const isSelected = selectedTemplateId === tpl.id;
                            const isPublic = tpl.access_level === 'public';
                            const hasImage = tpl.thumbnail_url && !tpl.thumbnail_url.includes('empty');
                            const badgeColor = isPublic ? 'var(--platform-success)' : 'var(--platform-accent)';
                            return (
                                <div 
                                    key={tpl.id} 
                                    style={{
                                        position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px',
                                        border: `2px solid ${isSelected ? 'var(--platform-accent)' : 'transparent'}`,
                                        background: isSelected ? 'var(--platform-card-bg)' : 'var(--platform-card-bg)',
                                        boxShadow: isSelected ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onClick={() => setSelectedTemplateId(tpl.id)}
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '8px', background: 'var(--platform-bg)',
                                        border: '1px solid var(--platform-border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, overflow: 'hidden'
                                    }}>
                                        {hasImage ? (
                                             <img src={tpl.thumbnail_url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                        ) : (
                                            <TemplateIcon size={24} color="var(--platform-text-secondary)" />
                                        )}
                                    </div>
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div style={{fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--platform-text-primary)'}}>{tpl.name}</div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px'}}>
                                            <span style={{
                                                fontSize: '10px', 
                                                padding: '2px 6px', 
                                                borderRadius: '4px', 
                                                fontWeight: 'bold', 
                                                textTransform: 'uppercase', 
                                                border: '1px solid',
                                                color: badgeColor, 
                                                background: `color-mix(in srgb, ${badgeColor}, transparent 90%)`,
                                                borderColor: `color-mix(in srgb, ${badgeColor}, transparent 80%)`
                                            }}>
                                                {isPublic ? 'Public' : 'Staging'}
                                            </span>
                                            {tpl.category && <span style={{fontSize: '10px', color: 'var(--platform-text-secondary)'}}>#{getCategoryLabel(tpl.category)}</span>}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, template: tpl }); }} 
                                        className={`template-action-btn ${isPublic ? 'public' : 'staging'}`}
                                        disabled={isToggling === tpl.id}
                                        title={isPublic ? "Сховати" : "Опублікувати"}
                                    >
                                        {isToggling === tpl.id ? <Loader size={16} className="animate-spin" /> : isPublic ? <Globe size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <div style={{flex: 1, height: '100%', position: 'relative', background: 'var(--platform-bg)'}}>
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
            <style>{`
                .category-chip {
                    white-space: nowrap;
                    padding: 6px 12px;
                    border-radius: 99px;
                    font-size: 12px;
                    font-weight: 500;
                    border: 1px solid var(--platform-border-color);
                    background: transparent;
                    color: var(--platform-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .category-chip:hover {
                    border-color: var(--platform-accent);
                    color: var(--platform-accent);
                    background: color-mix(in srgb, var(--platform-accent), transparent 95%);
                }
                .category-chip.active {
                    border-color: var(--platform-accent);
                    background: var(--platform-accent);
                    color: #ffffff;
                }
                .template-action-btn {
                    padding: 8px;
                    border-radius: 8px;
                    border: 1px solid;
                    transition: all 0.2s;
                    cursor: pointer;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .template-action-btn.staging {
                    color: var(--platform-text-secondary);
                    border-color: var(--platform-border-color);
                }
                .template-action-btn.staging:hover {
                    color: var(--platform-accent);
                    border-color: var(--platform-accent);
                    background-color: color-mix(in srgb, var(--platform-accent), transparent 95%);
                    box-shadow: 0 0 0 1px color-mix(in srgb, var(--platform-accent), transparent 80%);
                }
                .template-action-btn.public {
                    color: var(--platform-success);
                    border-color: var(--platform-success);
                }
                .template-action-btn.public:hover {
                    background-color: color-mix(in srgb, var(--platform-success), transparent 95%);
                    box-shadow: 0 0 0 1px var(--platform-success);
                }
                .template-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default AdminTemplatesPage;