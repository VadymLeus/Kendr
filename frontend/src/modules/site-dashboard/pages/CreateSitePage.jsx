import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../common/services/api';
import { Input } from '../../../common/components/ui/Input';
import { Button } from '../../../common/components/ui/Button';
import ConfirmModal from '../../../common/components/ui/ConfirmModal';
import {
    IconArrowLeft, IconLayout, IconCheck, IconLoader,
    IconAlertCircle, IconGlobe, IconGrid, IconUser,
    IconImage, IconTrash, IconSearch, IconEdit, IconX
} from '../../../common/components/ui/Icons';
import ImageInput from '../../media/components/ImageInput';
import BlockRenderer from '../../site-editor/core/BlockRenderer';
import FontLoader from '../../site-render/components/FontLoader';

const API_URL = 'http://localhost:5000';

const CreateSitePage = () => {
    const navigate = useNavigate();

    const [systemTemplates, setSystemTemplates] = useState([]);
    const [personalTemplates, setPersonalTemplates] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [activeTab, setActiveTab] = useState('system');
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({ title: '', slug: '' });

    const [customLogo, setCustomLogo] = useState(null);
    const [defaultRandomLogo, setDefaultRandomLogo] = useState(null);

    const [slugStatus, setSlugStatus] = useState('idle');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({ name: '', description: '' });
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDeleteId, setTemplateToDeleteId] = useState(null);

    const [previewData, setPreviewData] = useState({
        pages: [],
        theme: {},
        header: [],
        footer: []
    });

    const [currentPreviewSlug, setCurrentPreviewSlug] = useState('home');
    useEffect(() => {
        const loadData = async () => {
            try {
                const [sysRes, persRes, logosRes] = await Promise.allSettled([
                    apiClient.get('/sites/templates'),
                    apiClient.get('/user-templates'),
                    apiClient.get('/sites/default-logos')
                ]);

                if (sysRes.status === 'fulfilled') {
                    setSystemTemplates(sysRes.value.data);
                    if (sysRes.value.data.length > 0) {
                        handleSelectTemplate(sysRes.value.data[0], 'system');
                    }
                }

                if (persRes.status === 'fulfilled') {
                    setPersonalTemplates(persRes.value.data);
                }

                if (logosRes.status === 'fulfilled' && Array.isArray(logosRes.value.data) && logosRes.value.data.length > 0) {
                    const logos = logosRes.value.data;
                    const random = logos[Math.floor(Math.random() * logos.length)];
                    setDefaultRandomLogo(random);
                }

            } catch (err) {
                console.error(err);
                toast.error('Не вдалося завантажити дані');
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }, []);

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
            } catch (err) {
                console.warn("Slug check failed", err);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.slug]);

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
            console.error(error);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleOpenDeleteModal = (e, templateId) => {
        e.stopPropagation();
        setTemplateToDeleteId(templateId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!templateToDeleteId) return;

        try {
            await apiClient.delete(`/user-templates/${templateToDeleteId}`);
            setPersonalTemplates(prev => prev.filter(t => t.id !== templateToDeleteId));
            
            if (selectedTemplateId === templateToDeleteId) {
                setSelectedTemplateId(null);
                if(systemTemplates.length > 0) handleSelectTemplate(systemTemplates[0], 'system');
            }
            toast.success('Шаблон видалено');
        } catch (error) {
            toast.error('Не вдалося видалити шаблон');
        } finally {
            setIsDeleteModalOpen(false);
            setTemplateToDeleteId(null);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setTemplateToDeleteId(null);
    };

    const handleSelectTemplate = (template, type) => {
        if (!template) return;
        setSelectedTemplateId(template.id);
        
        let content = null;
        try {
            if (type === 'system') {
                content = typeof template.default_block_content === 'string'
                    ? JSON.parse(template.default_block_content)
                    : template.default_block_content;
            } else {
                const rawSnapshot = template.full_site_snapshot;
                content = typeof rawSnapshot === 'string'
                    ? JSON.parse(rawSnapshot)
                    : rawSnapshot;
            }
        } catch (e) {
            console.error("JSON Parse error:", e);
            return;
        }

        if (!content) return;

        let pages = [];
        let theme = content.theme_settings || {};
        let header = content.header_content || [];
        let footer = content.footer_content || [];

        if (content.pages && Array.isArray(content.pages)) {
            pages = content.pages;
        } else if (Array.isArray(content)) {
            pages = [{ slug: 'home', blocks: content }];
        } else if (content.blocks && Array.isArray(content.blocks)) {
            pages = [{ slug: 'home', blocks: content.blocks }];
        } else {
            pages = [{ slug: 'home', blocks: [] }];
        }

        setPreviewData({ pages, theme, header, footer });

        const hasHomePage = pages.find(p => p.slug === 'home');
        if (hasHomePage) {
            setCurrentPreviewSlug('home');
        } else if (pages.length > 0) {
            setCurrentPreviewSlug(pages[0].slug);
        } else {
            setCurrentPreviewSlug('home');
        }
    };

    const handleLogoChange = (e) => {
        const val = e.target.value;
        setCustomLogo(val || null);
    };

    const handleClearLogo = (e) => {
        e.stopPropagation();
        setCustomLogo(null);
        toast.info('Логотип скинуто до стандартного');
    };

    const effectiveLogo = customLogo || defaultRandomLogo || '/uploads/shops/logos/default/default-logo.webp';

    const handlePreviewInteraction = (e) => {
        e.preventDefault(); e.stopPropagation();
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;

        let targetSlug = 'home';
        const cleanPath = href.replace(window.location.origin, '');
        const segments = cleanPath.split('/').filter(s => s && s.trim() !== '');
        const currentSiteSlug = formData.slug || 'preview-slug';

        if (segments.length === 0) targetSlug = 'home';
        else {
            const lastSegment = segments[segments.length - 1];
            if (lastSegment === currentSiteSlug || lastSegment === 'home' || lastSegment === 'index') targetSlug = 'home';
            else targetSlug = lastSegment;
        }
        const pageExists = previewData.pages.find(p => p.slug === targetSlug);
        if (pageExists) setCurrentPreviewSlug(targetSlug);
    };

    const blockInput = (e) => { e.preventDefault(); e.stopPropagation(); };

    const currentBlocks = useMemo(() => {
        const page = previewData.pages.find(p => p.slug === currentPreviewSlug);
        return page ? (page.blocks || []) : [];
    }, [previewData.pages, currentPreviewSlug]);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setFormData(prev => {
            const autoSlug = prev.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const currentSlug = prev.slug;
            const newSlug = (!currentSlug || currentSlug === autoSlug)
                ? val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                : currentSlug;
            return { ...prev, title: val, slug: newSlug };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.slug || !selectedTemplateId) return;
        if (slugStatus === 'taken') return;

        setIsSubmitting(true);
        try {
            const payload = {
                templateId: selectedTemplateId,
                sitePath: formData.slug,
                title: formData.title,
                isPersonal: activeTab === 'personal',
                selected_logo_url: effectiveLogo
            };
            const res = await apiClient.post('/sites/create', payload);
            toast.success('Сайт створено успішно!');
            window.location.href = `/dashboard/${res.data.site.site_path}`;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Помилка створення сайту');
            setIsSubmitting(false);
        }
    };

    const simulatedSiteData = useMemo(() => {
        let headerContent = [...(previewData.header || [])];
        
        const updateHeaderBlock = (block) => ({
            ...block,
            data: {
                ...block.data,
                site_title: formData.title || 'My Site',
                logo_src: effectiveLogo,
                show_title: true
            }
        });

        if (headerContent.length > 0) {
            headerContent = headerContent.map(b => b.type === 'header' ? updateHeaderBlock(b) : b);
        } else {
            headerContent = [{ type: 'header', data: { site_title: formData.title || 'My Site', logo_src: effectiveLogo } }];
        }

        const theme = previewData.theme || {};

        return {
            id: 'preview',
            title: formData.title || 'New Site',
            site_path: formData.slug || 'preview-slug',
            status: 'draft',
            theme_settings: theme,
            site_theme_mode: theme.mode || 'light',
            site_theme_accent: theme.accent || 'blue',
            header_content: headerContent,
            footer_content: previewData.footer || [],
        };
    }, [formData.title, formData.slug, previewData, effectiveLogo]);

    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    const filteredTemplates = useMemo(() => {
        const source = activeTab === 'system' ? systemTemplates : personalTemplates;
        if (!searchQuery) return source;
        return source.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [activeTab, systemTemplates, personalTemplates, searchQuery]);

    const pageStyles = `
        .create-site-container { display: flex; height: 100vh; overflow: hidden; background: var(--platform-bg); font-family: var(--font-family, sans-serif); color: var(--platform-text-primary); }
        
        .left-panel { 
            display: flex; flex-direction: column; background: var(--platform-card-bg); 
            width: 100%; z-index: 20; 
            transition: transform 0.3s ease; position: absolute; height: 100%; 
            border-right: 1px solid var(--platform-border-color);
        }

        @media (min-width: 768px) { 
            .left-panel { 
                width: 420px; 
                position: relative; 
                border-radius: 12px;
                margin: 20px;
                height: calc(100vh - 40px);
                border: 1px solid var(--platform-border-color);
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            } 
        }
        
        .mobile-hidden { transform: translateX(-100%); }
        .desktop-visible { transform: translateX(0); }
        .right-panel { flex: 1; background: var(--platform-bg); position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; transition: transform 0.3s; }
        
        .browser-mockup { width: 100%; height: 100%; max-width: 1200px; background: var(--platform-card-bg); border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--platform-border-color); }
        .browser-header { height: 44px; background: var(--platform-bg); border-bottom: 1px solid var(--platform-border-color); display: flex; align-items: center; padding: 0 16px; gap: 12px; }
        .browser-dots { display: flex; gap: 6px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot-red { background: #ff5f57; border: 1px solid #e0443e; }
        .dot-yellow { background: #febc2e; border: 1px solid #dba522; }
        .dot-green { background: #28c840; border: 1px solid #1aab29; }
        .url-bar { flex: 1; background: var(--platform-card-bg); height: 28px; border: 1px solid var(--platform-border-color); border-radius: 6px; display: flex; align-items: center; padding: 0 10px; font-size: 12px; color: var(--platform-text-secondary); margin: 0 10px; font-family: monospace; }
        .template-list-wrapper {
            border: 1px solid var(--platform-border-color);
            border-radius: 12px;
            background: var(--platform-bg); 
            max-height: 400px; 
            min-height: 100px;
            overflow: hidden; 
            display: flex;
            flex-direction: column;
        }

        .template-list-scroll {
            padding: 12px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1;
        }

        .template-card { border: 1px solid var(--platform-border-color); border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.2s; position: relative; background: var(--platform-card-bg); padding: 16px; display: flex; flex-direction: column; gap: 6px; min-height: 80px; flex-shrink: 0; }
        .template-card:hover { transform: translateY(-2px); border-color: var(--platform-text-secondary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .template-card.selected { border-color: var(--platform-accent); background: var(--platform-card-bg); box-shadow: 0 0 0 1px var(--platform-accent); }
        
        .tpl-title { font-size: 14px; font-weight: 600; color: var(--platform-text-primary); margin-right: 24px; }
        .tpl-desc { font-size: 12px; color: var(--platform-text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .check-icon { position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; background: var(--platform-accent); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 2; }
        
        .template-actions {
            position: absolute;
            bottom: 10px;
            right: 10px;
            display: flex;
            gap: 6px;
            opacity: 0;
            transition: opacity 0.2s;
            background: var(--platform-card-bg);
            border-radius: 6px;
            padding: 2px;
        }
        .template-card:hover .template-actions { opacity: 1; }
        .template-action-btn {
            width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--platform-border-color);
            background: var(--platform-bg);
            color: var(--platform-text-secondary);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .template-action-btn:hover { background: var(--platform-accent); color: #fff; border-color: var(--platform-accent); }
        .template-action-btn.delete:hover { background: #ef4444; border-color: #ef4444; }

        .tab-switcher { display: flex; padding: 4px; background: var(--platform-bg); border-radius: 8px; border: 1px solid var(--platform-border-color); margin-bottom: 12px; }
        .tab-btn { flex: 1; padding: 8px; font-size: 14px; font-weight: 500; border-radius: 6px; border: none; background: transparent; cursor: pointer; color: var(--platform-text-secondary); transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .tab-btn:hover { color: var(--platform-text-primary); }
        .tab-btn.active { background: var(--platform-accent); color: #ffffff; box-shadow: 0 2px 6px rgba(var(--platform-accent-rgb, 0,0,0), 0.2); }
        
        .logo-wrapper { width: 100%; }
        .logo-preview-card { width: 120px; height: 120px; border-radius: 12px; border: 1px solid var(--platform-border-color); background: var(--platform-card-bg); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; margin: 0 auto; }
        .logo-preview-card:hover { border-color: var(--platform-accent); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .logo-preview-card img { width: 100%; height: 100%; object-fit: contain; padding: 10px; }
        .delete-logo-btn { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: all 0.2s; }
        .logo-preview-card:hover .delete-logo-btn { opacity: 1; }
        .delete-logo-btn:hover { transform: scale(1.1); background: #dc2626; }
        .add-logo-card { width: 100%; height: 100px; border: 1px dashed var(--platform-border-color); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: var(--platform-bg); cursor: pointer; color: var(--platform-text-secondary); transition: all 0.2s; }
        .add-logo-card:hover { border-color: var(--platform-accent); color: var(--platform-accent); background: rgba(0,0,0,0.02); }
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); z-index: 100;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(4px);
        }
        .modal-content {
            background: var(--platform-card-bg);
            padding: 24px; border-radius: 12px;
            width: 100%; max-width: 400px;
            border: 1px solid var(--platform-border-color);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: popIn 0.2s ease;
        }

        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .site-theme-context[data-site-mode="dark"] {
            --site-bg: #1a202c; 
            --site-card-bg: #2d3748;
            --site-text-primary: #f7fafc;
            --site-text-secondary: #a0aec0;
            --site-border-color: #4a5568;
            background-color: var(--site-bg) !important;
            color: var(--site-text-primary) !important;
        }

        .site-theme-context[data-site-mode="light"] {
            --site-bg: #ffffff; 
            --site-card-bg: #ffffff;
            --site-text-primary: #1a202c;
            --site-text-secondary: #52525b;
            --site-border-color: #e2e8f0;
            background-color: var(--site-bg) !important;
            color: var(--site-text-primary) !important;
        }

        .site-theme-context[data-site-accent="orange"] { --site-accent: #f97316; --site-accent-hover: #ea580c; --site-accent-text: #ffffff; }
        .site-theme-context[data-site-accent="blue"]   { --site-accent: #3b82f6; --site-accent-hover: #2563eb; --site-accent-text: #ffffff; }
        .site-theme-context[data-site-accent="green"]  { --site-accent: #22c55e; --site-accent-hover: #16a34a; --site-accent-text: #ffffff; }
        .site-theme-context[data-site-accent="red"]    { --site-accent: #ef4444; --site-accent-hover: #dc2626; --site-accent-text: #ffffff; }
        .site-theme-context[data-site-accent="yellow"] { --site-accent: #eab308; --site-accent-hover: #ca8a04; --site-accent-text: #18181b; }
        .site-theme-context[data-site-accent="purple"] { --site-accent: #a855f7; --site-accent-hover: #9333ea; --site-accent-text: #ffffff; }
        .site-theme-context[data-site-accent="gray"]   { --site-accent: #71717a; --site-accent-hover: #52525b; --site-accent-text: #ffffff; }
        .site-theme-context[data-site-accent="lime"]   { --site-accent: #84cc16; --site-accent-hover: #65a30d; --site-accent-text: #18181b; }
    `;

    if (isLoadingData) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--platform-bg)' }}>
                <IconLoader size={48} style={{ color: 'var(--platform-accent)', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '16px', color: 'var(--platform-text-secondary)' }}>Завантаження студії...</p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="create-site-container">
            <style>{pageStyles}</style>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Видалити шаблон?"
                message="Ви впевнені, що хочете видалити цей шаблон? Цю дію не можна скасувати."
                confirmLabel="Видалити"
                cancelLabel="Скасувати"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                type="danger"
            />

            {isEditModalOpen && (
                <div className="modal-overlay" onClick={handleCloseEditModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Редагувати шаблон</h3>
                            <button onClick={handleCloseEditModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--platform-text-secondary)' }}>
                                <IconX size={20} />
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input 
                                label="Назва шаблону"
                                value={editFormData.name}
                                onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                placeholder="Мій крутий шаблон"
                            />
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: 'var(--platform-text-secondary)' }}>
                                    Опис
                                </label>
                                <textarea 
                                    value={editFormData.description}
                                    onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                                    placeholder="Короткий опис шаблону..."
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '8px',
                                        border: '1px solid var(--platform-border-color)',
                                        background: 'var(--platform-bg)', color: 'var(--platform-text-primary)',
                                        minHeight: '80px', resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <Button variant="secondary" onClick={handleCloseEditModal} style={{ flex: 1 }}>Скасувати</Button>
                                <Button onClick={handleSaveTemplateChanges} disabled={isSavingTemplate || !editFormData.name} style={{ flex: 1 }}>
                                    {isSavingTemplate ? 'Збереження...' : 'Зберегти'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`left-panel ${showMobilePreview ? 'mobile-hidden' : 'desktop-visible'}`}>

                <div style={{ padding: '20px', borderBottom: '1px solid var(--platform-border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--platform-text-primary)' }}>Новий сайт</h1>
                </div>

                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--platform-accent)', color: 'white', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--platform-text-primary)' }}>Основна інформація</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input
                                label="Назва сайту"
                                placeholder="Моя кав'ярня"
                                value={formData.title}
                                onChange={handleTitleChange}
                                leftIcon={<IconLayout size={18} />}
                            />
                            <div style={{ position: 'relative' }}>
                                <Input
                                    label="Веб-адреса (Slug)"
                                    placeholder="my-shop"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                                    leftIcon={<IconGlobe size={18} />}
                                    rightIcon={
                                        slugStatus === 'checking' ? <IconLoader size={16} style={{ animation: 'spin 1s linear infinite' }} /> :
                                            slugStatus === 'available' ? <IconCheck size={18} style={{ color: '#10B981' }} /> :
                                                slugStatus === 'taken' ? <IconAlertCircle size={18} style={{ color: '#EF4444' }} /> : null
                                    }
                                    error={slugStatus === 'taken' ? 'Адреса зайнята' : null}
                                />
                                <div style={{ fontSize: '12px', color: 'var(--platform-text-secondary)', marginTop: '4px', marginLeft: '4px', display: 'flex', gap: '4px' }}>
                                    <span>kendr.site/</span>
                                    <span style={{ fontWeight: '500', color: 'var(--platform-text-primary)' }}>{formData.slug || '...'}</span>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: 'var(--platform-text-secondary)' }}>
                                    Логотип
                                </label>

                                <div className="logo-wrapper">
                                    <ImageInput
                                        value={customLogo}
                                        onChange={handleLogoChange}
                                        aspect={1}
                                        circularCrop={true}
                                    >
                                        {customLogo ? (
                                            <div className="logo-preview-card">
                                                <img src={getFullUrl(customLogo)} alt="Custom Logo" />
                                                <button
                                                    className="delete-logo-btn"
                                                    onClick={handleClearLogo}
                                                    title="Видалити та повернути стандартний"
                                                >
                                                    <IconTrash size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="add-logo-card">
                                                <div style={{ position: 'relative', width: '48px', height: '48px', opacity: 0.6 }}>
                                                    {defaultRandomLogo ? (
                                                        <img
                                                            src={getFullUrl(defaultRandomLogo)}
                                                            alt="Random"
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                        />
                                                    ) : <IconImage size={48} />}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span style={{ fontWeight: '500' }}>Змінити логотип</span>
                                                </div>
                                            </div>
                                        )}
                                    </ImageInput>
                                </div>
                            </div>

                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--platform-border-color)', margin: '0 0 32px 0' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--platform-accent)', color: 'white', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--platform-text-primary)' }}>Оберіть дизайн</h3>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <Input
                                placeholder="Пошук шаблону..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<IconSearch size={16} />}
                                wrapperStyle={{ margin: 0 }}
                            />
                        </div>

                        <div className="tab-switcher">
                            <button onClick={() => setActiveTab('system')} className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}>
                                <IconGrid size={16} /> Галерея
                            </button>
                            <button onClick={() => setActiveTab('personal')} className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}>
                                <IconUser size={16} /> Мої макети
                            </button>
                        </div>

                        <div className="template-list-wrapper">
                             <div className="template-list-scroll custom-scrollbar">
                                {filteredTemplates.length > 0 ? (
                                    filteredTemplates.map(tpl => (
                                        <div
                                            key={tpl.id}
                                            onClick={() => handleSelectTemplate(tpl, activeTab)}
                                            className={`template-card ${selectedTemplateId === tpl.id ? 'selected' : ''}`}
                                        >
                                            <div className="tpl-title">{tpl.name}</div>
                                            <div className="tpl-desc">{tpl.description || 'Без опису'}</div>

                                            {selectedTemplateId === tpl.id && (
                                                <div className="check-icon"><IconCheck size={12} /></div>
                                            )}

                                            {activeTab === 'personal' && (
                                                <div className="template-actions" onClick={e => e.stopPropagation()}>
                                                    <button 
                                                        className="template-action-btn" 
                                                        onClick={(e) => handleOpenEditModal(e, tpl)}
                                                        title="Редагувати"
                                                    >
                                                        <IconEdit size={14} />
                                                    </button>
                                                    <button 
                                                        className="template-action-btn delete" 
                                                        onClick={(e) => handleOpenDeleteModal(e, tpl.id)}
                                                        title="Видалити"
                                                    >
                                                        <IconTrash size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--platform-text-secondary)', fontSize: '14px' }}>
                                        Нічого не знайдено
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid var(--platform-border-color)', background: 'var(--platform-card-bg)' }}>
                    <Button
                        variant="primary"
                        style={{ width: '100%', height: '48px', fontSize: '16px' }}
                        onClick={handleSubmit}
                        disabled={!formData.title || !formData.slug || slugStatus !== 'available' || isSubmitting}
                    >
                        {isSubmitting ? 'Створення...' : 'Створити сайт'}
                    </Button>
                    <button
                        onClick={() => setShowMobilePreview(true)}
                        style={{ display: 'none', width: '100%', marginTop: '12px', background: 'none', border: 'none', color: 'var(--platform-accent)', fontWeight: '500', cursor: 'pointer' }}
                        className="mobile-only-btn"
                    >
                        <style>{`@media (max-width: 768px) { .mobile-only-btn { display: block !important; } }`}</style>
                        Подивитись превью
                    </button>
                </div>
            </div>

            <div className={`right-panel ${showMobilePreview ? 'active' : ''}`} style={{ transform: showMobilePreview ? 'translateX(0)' : '' }}>
                <button
                    onClick={() => setShowMobilePreview(false)}
                    style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 50, background: 'var(--platform-card-bg)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'none', alignItems: 'center', justifyContent: 'center' }}
                    className="mobile-back-btn"
                >
                    <style>{`@media (max-width: 768px) { .mobile-back-btn { display: flex !important; } }`}</style>
                    <IconArrowLeft size={20} color="var(--platform-text-primary)" />
                </button>

                <div className="browser-mockup">
                    <div className="browser-header">
                        <div className="browser-dots">
                            <div className="dot dot-red"></div>
                            <div className="dot dot-yellow"></div>
                            <div className="dot dot-green"></div>
                        </div>
                        <div className="url-bar">
                            https://kendr.site/<span style={{ color: 'var(--platform-text-primary)' }}>{formData.slug}</span>
                            {currentPreviewSlug !== 'home' && <span style={{ color: 'var(--platform-text-secondary)' }}>/{currentPreviewSlug}</span>}
                        </div>
                    </div>

                    <div
                        className="custom-scrollbar"
                        style={{ flex: 1, overflowY: 'auto', position: 'relative', isolation: 'isolate' }}
                        onClickCapture={handlePreviewInteraction}
                        onChangeCapture={blockInput}
                        onSubmitCapture={blockInput}
                    >
                        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                            {previewData.theme && <FontLoader fontHeading={previewData.theme.font_heading} fontBody={previewData.theme.font_body} />}

                            <div 
                                className="site-wysiwyg-wrapper site-theme-context" 
                                style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', flex: 1 }}
                                data-site-mode={simulatedSiteData.site_theme_mode}
                                data-site-accent={simulatedSiteData.site_theme_accent}
                            >
                                <BlockRenderer blocks={simulatedSiteData.header_content} siteData={simulatedSiteData} />
                                <main style={{ flex: 1 }}>
                                    {currentBlocks.length > 0 ? (
                                        <BlockRenderer blocks={currentBlocks} siteData={simulatedSiteData} />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#9ca3af', gap: '16px' }}>
                                            {previewData.pages.length > 0
                                                ? <p>Ця сторінка порожня ({currentPreviewSlug})</p>
                                                : <div style={{ textAlign: 'center' }}><IconLayout size={48} style={{ opacity: 0.2 }} /><p>Оберіть шаблон зліва</p></div>
                                            }
                                        </div>
                                    )}
                                </main>
                                {previewData.footer && <BlockRenderer blocks={previewData.footer} siteData={simulatedSiteData} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSitePage;