// frontend/src/modules/site-dashboard/tabs/GeneralSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import { useAutoSave } from '../../../../common/hooks/useAutoSave';
import ImageInput from '../../../media/components/ImageInput'; 
import SiteCoverDisplay from '../../../../common/components/ui/SiteCoverDisplay';
import apiClient from '../../../../common/services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../../../common/hooks/useConfirm';
import SaveTemplateModal from '../../components/SaveTemplateModal';
import { Input, Button, Select, Switch } from '../../../../common/components/ui';
import { 
    IconSettings, 
    IconFileText, 
    IconImage, 
    IconShield, 
    IconGlobe, 
    IconPalette, 
    IconAlertCircle, 
    IconTrash, 
    IconGrid, 
    IconList, 
    IconType, 
    IconX, 
    IconCheck, 
    IconTag,
    IconLock,
    IconUpload,
    IconPlus,
    IconLayout,
    IconChevronDown,
    IconShoppingCart,
    IconBriefcase
} from '../../../../common/components/ui/Icons';

const GeneralSettingsTab = ({ siteData, onUpdate, onSavingChange }) => {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [slugError, setSlugError] = useState('');
    const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
    const [personalTemplates, setPersonalTemplates] = useState([]);
    const [systemTemplates, setSystemTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [expandedSections, setExpandedSections] = useState(() => {
        try {
            const saved = localStorage.getItem('kendr_template_sections');
            return saved ? JSON.parse(saved) : { personal: true, system: true };
        } catch (e) {
            return { personal: true, system: true };
        }
    });

    const [isCoverHovered, setIsCoverHovered] = useState(false);
    const [isFaviconHovered, setIsFaviconHovered] = useState(false);
    
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    const { data, handleChange, isSaving, setData } = useAutoSave(
        `/sites/${siteData.site_path}/settings`,
        {
            title: siteData.title,
            status: siteData.status,
            favicon_url: siteData.favicon_url || '', 
            site_title_seo: siteData.site_title_seo || siteData.title,
            theme_settings: siteData.theme_settings || {},
            cover_image: siteData.cover_image || '',
            cover_layout: siteData.cover_layout || 'centered',
            tags: []
        }
    );

    const [slug, setSlug] = useState(siteData.site_path);
    const [isSavingSlug, setIsSavingSlug] = useState(false);

    useEffect(() => {
        if (siteData) {
            setData(prev => ({
                ...prev,
                cover_image: siteData.cover_image || '',
                cover_layout: siteData.cover_layout || 'centered',
                title: siteData.title,
                status: siteData.status,
                favicon_url: siteData.favicon_url || '',
                site_title_seo: siteData.site_title_seo || siteData.title,
                theme_settings: siteData.theme_settings || {}
            }));
            setSlug(siteData.site_path);
            if (siteData.tags) {
                const tagIds = siteData.tags.map(t => t.id);
                setSelectedTags(tagIds);
            }
        }
    }, [siteData, setData]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await apiClient.get('/tags');
                setAvailableTags(res.data);
                if (siteData.tags && selectedTags.length === 0) {
                    const tagIds = siteData.tags.map(t => t.id);
                    setSelectedTags(tagIds);
                }
            } catch (err) {
                console.error("Failed to load tags", err);
            }
        };
        fetchTags();
        fetchAllTemplates(); 
    }, []);

    useEffect(() => {
        if (onSavingChange) {
            onSavingChange(isSaving || isSavingSlug);
        }
    }, [isSaving, isSavingSlug, onSavingChange]);

    const getSystemTemplateIcon = (name) => {
        const n = name.toLowerCase();
        const iconProps = { 
            size: 24, 
            style: { color: 'var(--platform-text-primary)' }
        };

        if (n.includes('shop') || n.includes('store')) {
            return <IconShoppingCart {...iconProps} />;
        }
        if (n.includes('business') || n.includes('pro')) {
            return <IconBriefcase {...iconProps} />;
        }
        if (n.includes('portfolio') || n.includes('art')) {
            return <IconImage {...iconProps} />;
        }
        if (n.includes('canvas') || n.includes('clean') || n.includes('blank')) {
            return <IconLayout {...iconProps} />;
        }
        return <IconGrid {...iconProps} />;
    };

    const fetchAllTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const [personalRes, systemRes] = await Promise.all([
                apiClient.get('/templates/personal'),
                apiClient.get('/sites/templates')
            ]);
            setPersonalTemplates(personalRes.data);
            setSystemTemplates(systemRes.data);
        } catch (error) {
            console.error("Error fetching templates:", error);
            toast.error("Не вдалося завантажити шаблони");
        } finally {
            setLoadingTemplates(false);
        }
    };

    const toggleSection = (sectionKey) => {
        const newState = { ...expandedSections, [sectionKey]: !expandedSections[sectionKey] };
        setExpandedSections(newState);
        localStorage.setItem('kendr_template_sections', JSON.stringify(newState));
    };

    const handleSaveTemplate = async (name, description, overwriteId) => {
        try {
            const payload = {
                siteId: siteData.id,
                templateName: name,
                description
            };
            if (overwriteId) {
                await apiClient.put(`/templates/personal/${overwriteId}`, payload);
                toast.success(`Шаблон "${name}" оновлено!`);
            } else {
                await apiClient.post('/templates/personal', payload);
                toast.success(`Шаблон "${name}" створено!`);
            }
            setIsSaveTemplateModalOpen(false);
            fetchAllTemplates();
        } catch (error) {
            toast.error('Помилка збереження шаблону');
        }
    };

    const handleDeleteTemplate = async (id, name) => {
        if (await confirm({
            title: "Видалити шаблон?",
            message: `Ви впевнені, що хочете видалити шаблон "${name}"?`,
            type: "danger",
            confirmLabel: "Видалити"
        })) {
            try {
                await apiClient.delete(`/templates/personal/${id}`);
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
                if (isPersonal) {
                    await apiClient.post(`/templates/personal/${templateId}/apply`, { siteId: siteData.id });
                } else {
                    await apiClient.put(`/sites/${siteData.id}/reset-template`, { templateId, isPersonal: false });
                }
                
                toast.update(toastId, { render: `Шаблон "${templateName}" застосовано! Перезавантаження...`, type: "success", isLoading: false, autoClose: 2000 });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                toast.update(toastId, { render: error.response?.data?.message || "Помилка застосування", type: "error", isLoading: false, autoClose: 3000 });
            }
        }
    };

    const handleTagToggle = (tagId) => {
        let newTags;
        if (selectedTags.includes(tagId)) {
            newTags = selectedTags.filter(id => id !== tagId);
        } else {
            if (selectedTags.length >= 5) {
                toast.warning("Максимум 5 тегів");
                return;
            }
            newTags = [...selectedTags, tagId];
        }
        setSelectedTags(newTags);
        handleChange('tags', newTags);
    };

    const cookieSettings = data.theme_settings?.cookie_banner || {
        enabled: false,
        text: "Ми використовуємо файли cookie для покращення роботи сайту.",
        acceptText: "Прийняти",
        rejectText: "Відхилити",
        showReject: true,
        position: "bottom"
    };

    const handleCookieChange = (field, value) => {
        const updatedCookieSettings = { ...cookieSettings, [field]: value };
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
        if (slug.length < 3) {
            setSlugError('Мінімум 3 символи');
            return;
        }
        setIsSavingSlug(true);
        try {
            await apiClient.put(`/sites/${siteData.site_path}/rename`, { newPath: slug });
            toast.success('Адресу сайту успішно змінено! Перезавантаження...');
            setTimeout(() => {
                navigate(`/dashboard/${slug}`);
                window.location.reload();
            }, 1500);
        } catch (error) {
            setSlugError(error.response?.data?.message || 'Помилка зміни адреси');
            setIsSavingSlug(false);
        } 
    };

    const handleDeleteSite = async () => {
        if (await confirm({ title: "Видалити сайт?", message: `Ви впевнені?`, type: "danger", confirmLabel: "Так, видалити сайт" })) {
            try {
                await apiClient.delete(`/sites/${siteData.site_path}`);
                toast.success('Сайт успішно видалено');
                navigate('/my-sites');
            } catch (err) {
                toast.error('Не вдалося видалити сайт');
            }
        }
    };

    const containerStyle = { maxWidth: '800px', margin: '0 auto', padding: '0 16px' };
    const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '16px' };
    const cardStyle = { background: 'var(--platform-card-bg)', borderRadius: '16px', border: '1px solid var(--platform-border-color)', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' };
    const cardHeaderStyle = { marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' };
    const cardTitleStyle = { fontSize: '1.3rem', fontWeight: '600', color: 'var(--platform-text-primary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' };
    const cardSubtitleStyle = { fontSize: '0.95rem', color: 'var(--platform-text-secondary)', margin: 0, lineHeight: '1.5' };
    const overlayStyle = (isHovered) => ({ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease', backdropFilter: 'blur(2px)', zIndex: 10 });
    const trashButtonStyle = { position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20, transition: 'background 0.2s' };
    
    const templateRowStyle = { 
        background: 'var(--platform-bg)', 
        border: '1px solid var(--platform-border-color)', 
        borderRadius: '12px', 
        padding: '16px 20px', 
        marginBottom: '12px', 
        transition: 'all 0.2s ease', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px' 
    };

    const accordionHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        padding: '16px 20px',
        userSelect: 'none',
        transition: 'all 0.2s'
    };

    return (
        <div style={containerStyle}>
            <style>
                {`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .btn-icon-danger { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--platform-border-color); background: var(--platform-bg); color: var(--platform-text-secondary); cursor: pointer; transition: all 0.2s; padding: 0; }
                .btn-icon-danger:hover:not(:disabled) { background: var(--platform-danger); border-color: var(--platform-danger); color: white; }
                .btn-icon-danger:disabled { opacity: 0.3; cursor: not-allowed; border-color: transparent; }
                .tag-chip { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--platform-border-color); background: var(--platform-bg); color: var(--platform-text-secondary); cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s ease; height: 32px; }
                .tag-chip:hover { border-color: var(--platform-accent); color: var(--platform-text-primary); background: var(--platform-bg); }
                .tag-chip.active { border-color: var(--platform-accent); background: var(--platform-accent); color: var(--platform-accent-text); }
                .tag-chip.active:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .layout-btn:hover { border-color: var(--platform-accent); background: rgba(var(--platform-accent-rgb), 0.05); }
                .rotate-icon { transition: transform 0.3s ease; }
                .rotate-180 { transform: rotate(180deg); }
                .template-icon-box { width: 48px; height: 48px; border-radius: 8px; background: var(--platform-bg); overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid var(--platform-border-color); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                
                .btn-apply-template {
                    border-color: var(--platform-warning) !important;
                    color: var(--platform-warning) !important;
                    transition: all 0.2s ease;
                }
                .btn-apply-template:hover {
                    background: var(--platform-warning) !important;
                    color: #fff !important;
                }
                `}
            </style>

            <div style={headerStyle}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <IconSettings size={28} />
                        Глобальні налаштування
                    </h2>
                    <p style={{ color: 'var(--platform-text-secondary)', margin: 0, fontSize: '0.9rem', paddingLeft: '38px' }}>
                        Керування основними параметрами вашого сайту
                    </p>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <div>
                        <h3 style={cardTitleStyle}>
                            <IconFileText size={22} style={{ color: 'var(--platform-accent)' }} />
                            Основна інформація
                        </h3>
                        <p style={cardSubtitleStyle}>Назва сайту та його видимість в інтернеті</p>
                    </div>
                </div>
                
                <Input 
                    label="Назва сайту"
                    value={data.title}
                    onChange={handleTitleChange}
                    placeholder="Мій інтернет-магазин"
                />

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <IconTag size={16} />
                            Категорії / Теги 
                            <span style={{ color: selectedTags.length >= 5 ? 'var(--platform-warning)' : 'var(--platform-text-secondary)', fontSize: '0.8rem', background: 'var(--platform-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--platform-border-color)' }}>
                                {selectedTags.length}/5
                            </span>
                        </label>
                        
                        <button type="button" className="btn-icon-danger" onClick={() => { setSelectedTags([]); handleChange('tags', []); }} title="Очистити всі теги" disabled={selectedTags.length === 0}>
                            <IconX size={16} />
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px', background: 'var(--platform-bg)', borderRadius: '12px', border: '1px solid var(--platform-border-color)' }}>
                        {availableTags.map(tag => {
                            const isActive = selectedTags.includes(tag.id);
                            return (
                                <button key={tag.id} onClick={() => handleTagToggle(tag.id)} type="button" className={`tag-chip ${isActive ? 'active' : ''}`}>
                                    {isActive && <IconCheck size={14} />}
                                    {tag.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>Адреса сайту</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ padding: '12px 16px', background: 'var(--platform-bg)', borderRadius: '8px', border: '1px solid var(--platform-border-color)', color: 'var(--platform-text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>/site/</div>
                        <input type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--platform-border-color)', background: 'var(--platform-bg)', color: 'var(--platform-text-primary)', fontSize: '0.9rem', boxSizing: 'border-box', transition: 'all 0.2s ease', fontWeight: '500' }} value={slug} onChange={handleSlugChange} />
                        {slug !== siteData.site_path && (
                            <Button onClick={saveSlug} disabled={isSavingSlug}>{isSavingSlug ? '...' : 'Зберегти'}</Button>
                        )}
                    </div>
                    {slugError && <div style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><IconAlertCircle size={14} /> {slugError}</div>}
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>Статус сайту</label>
                    {data.status === 'suspended' ? (
                        <div style={{ padding: '16px', background: 'linear-gradient(to right, #fff5f5, #fff)', border: '1px solid #fc8181', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#c53030' }}>
                            <IconLock size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '0.95rem' }}>Сайт призупинено адміністрацією</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.4' }}>Робота сайту тимчасово заблокована.</div>
                            </div>
                        </div>
                    ) : (
                        <Select value={data.status} onChange={(e) => handleChange('status', e.target.value)} options={[{ value: 'draft', label: 'Чернетка', icon: IconFileText }, { value: 'published', label: 'Опубліковано', icon: IconGlobe }]} />
                    )}
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <div>
                        <h3 style={cardTitleStyle}>
                            <IconImage size={22} style={{ color: 'var(--platform-accent)' }} />
                            Розумна Обкладинка
                        </h3>
                        <p style={cardSubtitleStyle}>Ця картка відображається в каталозі сайтів.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>Попередній перегляд:</label>
                        <ImageInput value={data.cover_image} onChange={(e) => handleChange('cover_image', e.target.value)} aspect={1.6} triggerStyle={{ display: 'block', padding: 0, border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}>
                            <div style={{ width: '100%', aspectRatio: '1.6 / 1', border: '1px solid var(--platform-border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', transition: 'all 0.2s ease' }} onMouseEnter={() => setIsCoverHovered(true)} onMouseLeave={() => setIsCoverHovered(false)}>
                                <SiteCoverDisplay site={{ ...siteData, title: data.title, cover_image: data.cover_image, cover_layout: data.cover_layout }} />
                                <div style={overlayStyle(isCoverHovered)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}><IconUpload size={20} /> Змінити обкладинку</div>
                                </div>
                                {data.cover_image && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleChange('cover_image', ''); }} style={trashButtonStyle} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--platform-danger)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'} title="Видалити зображення">
                                        <IconTrash size={16} />
                                    </button>
                                )}
                            </div>
                        </ImageInput>
                    </div>

                    <div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>Стиль генератора:</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {[
                                    { id: 'centered', label: 'Стандарт', icon: <IconGrid size={20} /> },
                                    { id: 'centered_reverse', label: 'Реверс', icon: <IconGrid size={20} style={{transform: 'rotate(180deg)'}} /> },
                                    { id: 'classic', label: 'Класика', icon: <IconList size={20} /> },
                                    { id: 'reverse', label: 'Справа', icon: <IconList size={20} style={{transform: 'scaleX(-1)'}} /> },
                                    { id: 'minimal', label: 'Текст', icon: <IconType size={20} /> },
                                    { id: 'logo_only', label: 'Лого', icon: <IconImage size={20} /> },
                                ].map(layout => (
                                    <button key={layout.id} className="layout-btn" onClick={() => handleChange('cover_layout', layout.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px', background: data.cover_layout === layout.id ? 'var(--platform-accent)' : 'var(--platform-bg)', color: data.cover_layout === layout.id ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)', border: data.cover_layout === layout.id ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s ease' }}>
                                        <span style={{ marginBottom: '6px' }}>{layout.icon}</span>
                                        {layout.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <div>
                        <h3 style={cardTitleStyle}>
                            <IconShield size={22} style={{ color: 'var(--platform-accent)' }} />
                            Конфіденційність
                        </h3>
                        <p style={cardSubtitleStyle}>Налаштування Cookie-банера та згоди користувачів</p>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Switch checked={cookieSettings.enabled} onChange={(e) => handleCookieChange('enabled', e.target.checked)} label="Ввімкнути Cookie-банер" />
                </div>

                {cookieSettings.enabled && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>Текст повідомлення</label>
                            <textarea value={cookieSettings.text} onChange={(e) => handleCookieChange('text', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--platform-border-color)', background: 'var(--platform-bg)', color: 'var(--platform-text-primary)', fontSize: '0.9rem', boxSizing: 'border-box', transition: 'all 0.2s ease', minHeight: '80px', resize: 'vertical' }} placeholder="Ми використовуємо cookies..." />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <Switch checked={cookieSettings.showReject !== false} onChange={(e) => handleCookieChange('showReject', e.target.checked)} label='Показати кнопку "Відхилити"' />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <Input label="Текст кнопки прийняття" value={cookieSettings.acceptText || cookieSettings.buttonText || ''} onChange={(e) => handleCookieChange('acceptText', e.target.value)} placeholder="Прийняти" />
                            {(cookieSettings.showReject !== false) && (
                                <Input label="Текст кнопки відхилення" value={cookieSettings.rejectText} onChange={(e) => handleCookieChange('rejectText', e.target.value)} placeholder="Відхилити" />
                            )}
                        </div>
                        <div style={{ marginBottom: '24px', marginTop: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>Розташування банера</label>
                            <Select value={cookieSettings.position || 'bottom'} onChange={(e) => handleCookieChange('position', e.target.value)} options={[{ value: 'bottom', label: 'Внизу екрану' }, { value: 'top', label: 'Вгорі екрану' }]} />
                        </div>
                    </div>
                )}
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <div>
                        <h3 style={cardTitleStyle}>
                            <IconGlobe size={22} style={{ color: 'var(--platform-accent)' }} />
                            SEO та Брендинг
                        </h3>
                        <p style={cardSubtitleStyle}>Налаштування вигляду у пошукових системах</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    <div style={{ width: '120px', flexShrink: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>Favicon</label>
                        <ImageInput value={data.favicon_url} onChange={(e) => handleChange('favicon_url', e.target.value)} aspect={1} circularCrop={false} triggerStyle={{ display: 'block', padding: 0, border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}>
                            <div style={{ width: '120px', height: '120px', border: '1px solid var(--platform-border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--platform-bg)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={() => setIsFaviconHovered(true)} onMouseLeave={() => setIsFaviconHovered(false)}>
                                {data.favicon_url ? (
                                    <img src={data.favicon_url.startsWith('http') ? data.favicon_url : `http://localhost:5000${data.favicon_url}`} alt="Favicon" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                                ) : (
                                    <IconGlobe size={40} style={{ color: 'var(--platform-text-secondary)', opacity: 0.5 }} />
                                )}
                                <div style={overlayStyle(isFaviconHovered)}><IconUpload size={24} /></div>
                                {data.favicon_url && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleChange('favicon_url', ''); }} style={trashButtonStyle} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--platform-danger)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'} title="Видалити іконку">
                                        <IconTrash size={14} />
                                    </button>
                                )}
                            </div>
                        </ImageInput>
                    </div>
                    <div style={{ flex: 1, paddingTop: '2px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <Input label="SEO Заголовок" value={data.site_title_seo} onChange={(e) => handleChange('site_title_seo', e.target.value)} placeholder="Заголовок, який побачать у Google" />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--platform-text-secondary)', lineHeight: '1.5' }}>
                            <IconAlertCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                            Favicon — це маленька іконка (16x16 або 32x32), яка відображається у вкладці браузера.
                        </div>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h3 style={cardTitleStyle}>
                            <IconPalette size={22} style={{ color: 'var(--platform-accent)' }} />
                            Керування шаблонами
                        </h3>
                        <p style={cardSubtitleStyle}>
                            Зберігайте поточний дизайн або змінюйте вигляд сайту
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="secondary" onClick={() => setIsSaveTemplateModalOpen(true)}>
                            <IconPlus size={18} />
                            Зберегти поточний
                        </Button>
                    </div>
                </div>

                {loadingTemplates ? (
                    <div style={{textAlign: 'center', padding: '30px', color: 'var(--platform-text-secondary)'}}>Завантаження шаблонів...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        <div style={{ border: '1px solid var(--platform-border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                            <div 
                                style={{ ...accordionHeaderStyle, background: 'var(--platform-bg)' }} 
                                onClick={() => toggleSection('personal')}
                            >
                                <div style={{ fontWeight: '600', color: 'var(--platform-text-primary)' }}>
                                    Ваші шаблони ({personalTemplates.length})
                                </div>
                                <IconChevronDown 
                                    size={20} 
                                    className={`rotate-icon ${expandedSections.personal ? 'rotate-180' : ''}`}
                                    style={{ color: 'var(--platform-text-secondary)' }}
                                />
                            </div>
                            
                            {expandedSections.personal && (
                                <div style={{ padding: '0 20px 20px 20px', background: 'var(--platform-bg)', borderTop: '1px solid var(--platform-border-color)' }}>
                                    {personalTemplates.length > 0 ? (
                                        <div style={{ marginTop: '16px' }}>
                                            {personalTemplates.map(template => (
                                                <div key={template.id} style={templateRowStyle}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--platform-text-primary)', fontSize: '1.05rem', marginBottom: '4px' }}>
                                                            {template.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--platform-text-secondary)' }}>
                                                            {template.description || 'Опис відсутній'} • {new Date(template.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => handleApplyTemplate(template.id, true, template.name)}
                                                            className="btn-apply-template"
                                                        >
                                                            <IconGrid size={16} />
                                                            Застосувати
                                                        </Button>
                                                        <Button 
                                                            variant="square-danger"
                                                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                                                            title="Видалити шаблон"
                                                        >
                                                            <IconTrash size={18} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--platform-text-secondary)', opacity: 0.8 }}>
                                            Список порожній. Збережіть поточний дизайн як шаблон.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ border: '1px solid var(--platform-border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                            <div 
                                style={{ ...accordionHeaderStyle, background: 'var(--platform-bg)' }} 
                                onClick={() => toggleSection('system')}
                            >
                                <div style={{ fontWeight: '600', color: 'var(--platform-text-primary)' }}>
                                    Системні шаблони ({systemTemplates.length})
                                </div>
                                <IconChevronDown 
                                    size={20} 
                                    className={`rotate-icon ${expandedSections.system ? 'rotate-180' : ''}`}
                                    style={{ color: 'var(--platform-text-secondary)' }}
                                />
                            </div>

                            {expandedSections.system && (
                                <div style={{ padding: '0 20px 20px 20px', background: 'var(--platform-bg)', borderTop: '1px solid var(--platform-border-color)' }}>
                                    {systemTemplates.length > 0 ? (
                                        <div style={{ marginTop: '16px' }}>
                                            {systemTemplates.map(template => (
                                                <div key={template.id} style={templateRowStyle}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div className="template-icon-box">
                                                            {getSystemTemplateIcon(template.name)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '600', color: 'var(--platform-text-primary)', fontSize: '1.05rem', marginBottom: '4px' }}>
                                                                {template.name}
                                                            </div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--platform-text-secondary)' }}>
                                                                {template.description || 'Базовий шаблон системи'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={() => handleApplyTemplate(template.id, false, template.name)}
                                                        className="btn-apply-template"
                                                    >
                                                        <IconGrid size={16} />
                                                        Застосувати
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--platform-text-secondary)' }}>
                                            Немає доступних системних шаблонів.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>

            <div style={{ ...cardStyle, borderColor: '#fed7d7', background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{flex: 1}}>
                        <h3 style={{ ...cardTitleStyle, color: '#c53030', marginBottom: '4px' }}>
                            <IconAlertCircle size={22} />
                            Небезпечна зона
                        </h3>
                        <p style={{ margin: 0, color: '#c53030', fontSize: '0.9rem', opacity: 0.8 }}>
                            Видалення сайту є незворотним.
                        </p>
                    </div>
                    <Button variant="danger" onClick={handleDeleteSite} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconTrash size={16} />
                        Видалити сайт
                    </Button>
                </div>
            </div>

            <SaveTemplateModal 
                isOpen={isSaveTemplateModalOpen} 
                onClose={() => setIsSaveTemplateModalOpen(false)} 
                onSave={handleSaveTemplate} 
            />
        </div>
    );
};

export default GeneralSettingsTab;