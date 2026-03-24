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
import LoadingState from '../../../shared/ui/complex/LoadingState';
import TemplateCard from '../../../shared/ui/complex/TemplateCard';
import TemplateFilters from '../../../shared/ui/complex/TemplateFilters';
import TemplateBadge from '../../../shared/ui/complex/TemplateBadge';
import { AuthContext } from '../../../app/providers/AuthContext';
import { BASE_URL } from '../../../shared/config';
import { validateSiteSlug, validateSiteTitle } from '../../../shared/utils/validationUtils';
import { useTemplateManager } from '../../../shared/hooks/useTemplateManager';
import { getTemplatePreviewData } from '../../../shared/utils/templateUtils';
import { ArrowLeft, Layout, Check, Loader, AlertCircle, Trash, Info, Palette, Sparkles, Globe, Image, ChevronLeft, ChevronRight, Copy, Edit } from 'lucide-react';

const logosModules = import.meta.glob('../../../shared/assets/CreateLogos/*.{png,jpg,jpeg,webp,svg}', { 
    eager: true, 
    as: 'url' 
});
const LOCAL_DEFAULT_LOGOS = Object.values(logosModules);
const CreateSitePage = () => {
    const navigate = useNavigate();
    const { isAdmin, plan, user } = useContext(AuthContext);
    const manager = useTemplateManager({ isAdmin, initialSourceTab: 'system' });
    const [currentSiteCount, setCurrentSiteCount] = useState(0);
    const [limits, setLimits] = useState(null);
    const [isLoadingMeta, setIsLoadingMeta] = useState(true);
    const [panelTab, setPanelTab] = useState('info'); 
    const [viewMode, setViewMode] = useState('desktop'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [formData, setFormData] = useState({ title: '', slug: '' });
    const [titleError, setTitleError] = useState(null);
    const [slugError, setSlugError] = useState(null);
    const [slugStatus, setSlugStatus] = useState('idle');
    const [customLogo, setCustomLogo] = useState(null);
    const [defaultRandomLogo, setDefaultRandomLogo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPreviewSlug, setCurrentPreviewSlug] = useState('home');
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [sitesRes, limitsRes] = await Promise.allSettled([
                    apiClient.get('/sites/catalog', { params: { scope: 'my' } }),
                    apiClient.get('/media/limits')
                ]);
                if (sitesRes.status === 'fulfilled') setCurrentSiteCount(Array.isArray(sitesRes.value.data) ? sitesRes.value.data.length : 0);
                if (limitsRes.status === 'fulfilled') setLimits(limitsRes.value.data);
                if (LOCAL_DEFAULT_LOGOS.length > 0 && !defaultRandomLogo) {
                    setDefaultRandomLogo(LOCAL_DEFAULT_LOGOS[Math.floor(Math.random() * LOCAL_DEFAULT_LOGOS.length)]);
                }
            } catch (err) {
                toast.error('Не вдалося завантажити ліміти');
            } finally {
                setIsLoadingMeta(false);
            }
        };
        fetchMeta();
    }, []);
    const isPlanAdmin = plan && String(plan).trim().toUpperCase() === 'ADMIN';
    const maxSitesDisplay = isPlanAdmin ? '∞' : (limits ? limits.maxSites : '...');
    const isLimitReached = !isPlanAdmin && limits && currentSiteCount >= limits.maxSites;
    useEffect(() => {
        const checkSlug = async () => {
            const currentSlug = formData.slug;
            if (!currentSlug) {
                setSlugStatus('idle'); setSlugError(null); return;
            }
            const validation = validateSiteSlug(currentSlug);
            if (!validation.isValid) {
                setSlugStatus(validation.status); setSlugError(validation.error); return;
            }
            setSlugStatus('checking'); setSlugError(null);
            try {
                const res = await apiClient.get(`/sites/check-slug?slug=${currentSlug}`);
                if (res.data.isAvailable) setSlugStatus('available');
                else { setSlugStatus('taken'); setSlugError(res.data.message || 'Ця адреса вже зайнята'); }
            } catch (err) { 
                setSlugStatus('idle'); setSlugError('Помилка перевірки адреси');
            }
        };
        const timer = setTimeout(checkSlug, 500);
        return () => clearTimeout(timer);
    }, [formData.slug]);
    const previewData = useMemo(() => {
        const data = getTemplatePreviewData(manager.selectedTemplate);
        return data || { pages: [], theme: { mode: 'light', accent: 'blue' }, header: [], footer: [], siteData: {} };
    }, [manager.selectedTemplate]);
    useEffect(() => {
        if (previewData.pages.length > 0) {
            const hasHomePage = previewData.pages.find(p => p.slug === 'home');
            setCurrentPreviewSlug(hasHomePage ? 'home' : (previewData.pages[0]?.slug || 'home'));
        }
    }, [manager.selectedTemplateId, previewData.pages]);
    const currentBlocks = useMemo(() => {
        const page = previewData.pages.find(p => p.slug === currentPreviewSlug);
        return page ? (page.blocks || []) : [];
    }, [previewData.pages, currentPreviewSlug]);
    const effectiveLogo = customLogo || defaultRandomLogo;
    const handleTitleChange = (e) => {
        const { val, error } = validateSiteTitle(e.target.value);
        setTitleError(error); setFormData(prev => ({ ...prev, title: val }));
    };
    const handleSlugChange = (e) => {
        const sanitizedVal = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({ ...prev, slug: sanitizedVal }));
    };
    const handleSubmit = async () => {
        const trimmedTitle = formData.title.trim();
        if (isLimitReached || !trimmedTitle || !formData.slug || !manager.selectedTemplateId || slugStatus !== 'available' || titleError || slugError) return;
        setIsSubmitting(true);
        try {
            const res = await apiClient.post('/sites/create', { 
                templateId: manager.selectedTemplateId, sitePath: formData.slug, 
                title: trimmedTitle, selected_logo_url: effectiveLogo 
            });
            toast.success('Сайт створено успішно!');
            window.location.href = `/dashboard/${res.data.site.site_path}`;
        } catch (err) {
            setIsSubmitting(false); 
        }
    };
    const handleConfirmAction = async () => {
        const { actionType, template } = manager.modals.confirmModal;
        await manager.actions.handleAction(actionType, template);
        manager.modals.setConfirmModal({ isOpen: false, template: null, actionType: null });
    };
    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        if (path.startsWith('/logos/')) return path; 
        if (path.includes('/assets/') || path.includes('/src/') || path.includes('@fs')) return path;
        return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    };
    const containerStyle = { position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden', background: 'var(--platform-bg)' };
    if (isLoadingMeta || manager.isLoading) return <div style={{...containerStyle, alignItems: 'center', justifyContent: 'center'}}><LoadingState title="Завантаження даних..." layout="page" /></div>;
    const isFormReady = !isLimitReached && formData.title.trim().length >= 2 && !titleError && formData.slug && slugStatus === 'available' && !slugError;
    return (
        <div style={containerStyle}>
            <ConfirmModal 
                isOpen={manager.modals.confirmModal.isOpen} 
                title={manager.modals.confirmModal.actionType === 'delete' ? "Видалити шаблон?" : "Скопіювати шаблон?"} 
                message={manager.modals.confirmModal.actionType === 'delete' ? "Ви впевнені? Це незворотньо." : "Створити копію цього шаблону? Вона буде збережена як ваша чернетка."} 
                confirmLabel={manager.modals.confirmModal.actionType === 'delete' ? 'Видалити' : 'Скопіювати'} 
                cancelLabel="Скасувати" 
                onConfirm={handleConfirmAction} 
                onCancel={() => manager.modals.setConfirmModal({ isOpen: false, template: null, actionType: null })} 
                type={manager.modals.confirmModal.actionType === 'delete' ? "danger" : "primary"} 
            />
            <TemplateModal isOpen={manager.modals.isEditModalOpen} initialData={manager.modals.editingTemplate} onClose={() => { manager.modals.setIsEditModalOpen(false); manager.modals.setEditingTemplate(null); }} onSave={manager.actions.handleSaveTemplateChanges} />
            <div style={{
                width: isSidebarOpen ? '50%' : '0px', minWidth: isSidebarOpen ? '50%' : '0px', opacity: isSidebarOpen ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                background: 'var(--platform-card-bg)', borderRight: isSidebarOpen ? '1px solid var(--platform-border-color)' : 'none',
                boxShadow: '10px 0 15px -3px rgba(0, 0, 0, 0.05)', zIndex: 10, flexShrink: 0
            }}>
                <div style={{ width: '100%', minWidth: '400px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="p-6 border-b border-(--platform-border-color) shrink-0">
                        <div className="flex items-center gap-3 mb-6">
                            <Button variant="ghost" onClick={() => navigate('/my-sites')} className="p-2!"><ArrowLeft size={20}/></Button>
                            <h1 className="text-xl font-bold text-(--platform-text-primary) m-0">Новий сайт</h1>
                        </div>
                        <div className="flex p-1 bg-(--platform-bg) rounded-xl border border-(--platform-border-color)">
                            <button className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${panelTab === 'info' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary)'}`} onClick={() => setPanelTab('info')}><Info size={16} /> 1. Інформація</button>
                            <button className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${panelTab === 'design' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary)'}`} onClick={() => setPanelTab('design')}><Palette size={16} /> 2. Дизайн</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-0 bg-(--platform-bg) min-h-0 [scrollbar-gutter:stable]">
                        {panelTab === 'info' ? (
                             <div className="flex flex-col gap-6 pt-6">
                                <div className={`p-4 rounded-xl border flex items-center justify-between ${isLimitReached ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400' : 'bg-(--platform-card-bg) border-(--platform-border-color)'}`}>
                                    <div className="flex items-center gap-2"><Globe size={18} /><span className="font-medium text-sm">Створено сайтів:</span></div>
                                    <span className="font-bold text-lg">{currentSiteCount} / {maxSitesDisplay}</span>
                                </div>
                                {isLimitReached && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start gap-2 -mt-3">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                        <span>Ви досягли ліміту створення сайтів для вашого тарифу (<b>{plan}</b>). Щоб створити новий, видаліть один із існуючих.</span>
                                    </div>
                                )}
                                <div className="p-5 bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) shadow-sm space-y-4">
                                    <div><Input label="Назва сайту" value={formData.title} onChange={handleTitleChange} placeholder="Мій Сайт" autoFocus disabled={isLimitReached} error={titleError} wrapperStyle={{ marginBottom: titleError ? 0 : '0.5rem' }}/></div>
                                    <div><Input label="Веб-адреса" value={formData.slug} onChange={handleSlugChange} placeholder="my-cool-shop" rightIcon={slugStatus === 'checking' ? <Loader size={16} className="animate-spin" /> : slugStatus === 'available' ? <Check size={18} className="text-emerald-500" /> : (slugStatus === 'taken' || slugStatus === 'invalid') ? <AlertCircle size={18} className="text-red-500" /> : <Globe size={16} />} error={slugError} helperText={`kendr.site/${formData.slug || '...'}`} disabled={isLimitReached} wrapperStyle={{ marginBottom: slugError ? 0 : '0.5rem' }}/></div>
                                </div>
                                <div className={`p-5 bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) shadow-sm ${isLimitReached ? 'opacity-60 pointer-events-none' : ''}`}>
                                    <label className="mb-3 font-semibold text-(--platform-text-primary) text-sm flex items-center gap-2"><Sparkles size={18} className="text-(--platform-accent)" /> Логотип</label>
                                    <UniversalMediaInput type="image" value={customLogo} onChange={setCustomLogo} aspect={1} circularCrop={true} triggerStyle={{ width: '100%', border: 'none', background: 'transparent', padding: 0 }}>
                                        {customLogo ? (
                                            <div key="custom-logo" className="relative group w-32 h-32 mx-auto rounded-xl border border-(--platform-border-color) bg-(--platform-bg) flex items-center justify-center overflow-hidden cursor-pointer hover:border-(--platform-accent) transition-colors shadow-sm">
                                                <img src={getFullUrl(customLogo)} alt="Custom Logo" className="w-full h-full object-contain p-2" />
                                                <button onClick={(e) => { e.stopPropagation(); setCustomLogo(null); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md" title="Видалити та повернути стандартний"><Trash size={14} /></button>
                                            </div>
                                        ) : (
                                            <div key="default-logo" className="w-full h-32 border-2 border-dashed border-(--platform-border-color) rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-(--platform-accent) hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group bg-(--platform-bg)">
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
                                <div className="sticky top-0 -mx-6 px-6 pt-4 pb-2 bg-(--platform-bg)/95 z-20 mb-4 backdrop-blur-sm border-b border-transparent transition-all">
                                    <TemplateFilters filters={manager.filters} isAdmin={isAdmin} />
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-4 px-1">
                                    {manager.templates.length > 0 ? manager.templates.map(tpl => (
                                        <TemplateCard 
                                            key={tpl.id}
                                            template={tpl}
                                            isSelected={manager.selectedTemplateId === tpl.id}
                                            onClick={() => manager.setSelectedTemplateId(tpl.id)}
                                            getFullUrl={getFullUrl}
                                            badge={<TemplateBadge template={tpl} user={user} isAdmin={isAdmin} sourceTab={manager.filters.templateSourceTab} />}
                                            actions={(manager.filters.templateSourceTab === 'personal' || isAdmin) && (
                                                <div className="flex gap-2 w-full justify-end mt-2 pt-2 border-t border-(--platform-border-color)">
                                                    {isAdmin && manager.filters.templateSourceTab === 'system' && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'copy' }); }} 
                                                            className="p-1.5 text-(--platform-text-secondary) hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-md transition-colors border border-transparent hover:border-indigo-500/30" 
                                                            title="Скопіювати як чернетку"
                                                        >
                                                            <Copy size={14}/>
                                                        </button>
                                                    )}
                                                    <button onClick={(e) => { e.stopPropagation(); manager.modals.setEditingTemplate(tpl); manager.modals.setIsEditModalOpen(true); }} className="p-1.5 text-(--platform-text-secondary) hover:text-(--platform-accent) hover:bg-(--platform-bg) rounded-md transition-colors border border-transparent hover:border-(--platform-accent)/30" title="Редагувати шаблон"><Edit size={14}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); manager.modals.setConfirmModal({ isOpen: true, template: tpl, actionType: 'delete' }); }} className="p-1.5 text-(--platform-text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors border border-transparent hover:border-red-500/30" title="Видалити шаблон"><Trash size={14}/></button>
                                                </div>
                                            )}
                                        />
                                    )) : <div className="col-span-1 xl:col-span-2 mt-10"><EmptyState title="Не знайдено" description="Спробуйте змінити фільтри" icon={Layout}/></div>}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-(--platform-card-bg) border-t border-(--platform-border-color) shrink-0">
                        {panelTab === 'info' ? 
                            <Button variant="primary" className="w-full py-3 justify-center" onClick={handleSubmit} disabled={!isFormReady || isSubmitting}>
                                {isSubmitting ? <Loader size={18} className="animate-spin" /> : <>Створити сайт <ArrowLeft size={18} className="rotate-180" /></>}
                            </Button> 
                            : <Button variant="outline" className="w-full justify-center" onClick={() => setPanelTab('info')}>Далі: Введіть назву <ArrowLeft size={16} className="rotate-180 ml-2" /></Button>
                        }
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
                <SitePreviewer viewMode={viewMode} setViewMode={setViewMode} previewData={previewData} currentBlocks={currentBlocks} isLoading={isLoadingMeta || manager.isLoading} emptyTitle="Оберіть шаблон" emptyDescription="Оберіть шаблон для попереднього перегляду" url={`kendr.site/${formData.slug || 'your-site'}`} userTitle={formData.title} userLogo={effectiveLogo} />
            </div>
        </div>
    );
};

export default CreateSitePage;