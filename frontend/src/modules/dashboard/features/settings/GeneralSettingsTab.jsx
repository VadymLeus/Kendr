// frontend/src/modules/dashboard/features/settings/GeneralSettingsTab.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../../shared/api/api';
import { useAutoSave } from '../../../../shared/hooks/useAutoSave';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import { AuthContext } from '../../../../app/providers/AuthContext';
import { exportSiteToZip } from '../../../../shared/utils/siteExporter';
import { BASE_URL } from '../../../../shared/config';
import { validateSiteSlug, validateSiteTitle } from '../../../../shared/utils/validationUtils';
import { Button } from '../../../../shared/ui/elements';
import GeneralIdentitySection from './components/GeneralIdentitySection';
import GeneralVisualsSection from './components/GeneralVisualsSection';
import GeneralTemplatesSection from './components/GeneralTemplatesSection';
import { Settings, AlertCircle, Trash, Download, Loader, FileDown } from 'lucide-react';

const GeneralSettingsTab = ({ siteData, onUpdate, onSavingChange }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { confirm } = useConfirm();
    const isAdmin = user?.role === 'admin';
    const isLocked = siteData?.status === 'suspended' || siteData?.status === 'probation';
    const [identityData, setIdentityData] = useState({ title: '', slug: '' });
    const [isSavingIdentity, setIsSavingIdentity] = useState(false);
    const [titleError, setTitleError] = useState(null);
    const [slugError, setSlugError] = useState(null);
    const [slugStatus, setSlugStatus] = useState('idle');
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
            liqpay_public_key: siteData.liqpay_public_key || '',
            liqpay_private_key: siteData.liqpay_private_key || '',
            tags: []
        }
    );

    const getImageUrl = (src) => {
        if (!src) return '';
        if (src instanceof File) return URL.createObjectURL(src);
        if (typeof src === 'string') {
            if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http')) return src;
            if (src.startsWith('/logos/')) return src;
            if (src.includes('/src/') || src.includes('/assets/') || src.includes('@fs')) return src;
            const cleanSrc = src.startsWith('/') ? src : `/${src}`;
            return `${BASE_URL}${cleanSrc}`;
        }
        return '';
    };

    useEffect(() => {
        if (siteData) {
            setIdentityData({ title: siteData.title || '', slug: siteData.site_path || '' });
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
                liqpay_public_key: siteData.liqpay_public_key || '',
                liqpay_private_key: siteData.liqpay_private_key || '',
                theme_settings: siteData.theme_settings || {}
            }));
            if (siteData.tags) setSelectedTags(siteData.tags.map(t => t.id));
        }
    }, [siteData, setData]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await apiClient.get('/tags');
                setAvailableTags(res.data);
                if (siteData.tags && selectedTags.length === 0) setSelectedTags(siteData.tags.map(t => t.id));
            } catch (err) { console.error("Failed to load tags", err); }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        if (onSavingChange) onSavingChange(isSaving || isSavingIdentity);
    }, [isSaving, isSavingIdentity, onSavingChange]);
    useEffect(() => {
        const currentSlug = identityData.slug;
        const originalSlug = siteData?.site_path;
        if (!currentSlug) { setSlugStatus('idle'); setSlugError(null); return; }
        if (currentSlug === originalSlug) { setSlugStatus('unchanged'); setSlugError(null); return; }
        const validation = validateSiteSlug(currentSlug);
        setSlugStatus(validation.status); setSlugError(validation.error);
        if (!validation.isValid) return;
        const checkSlug = async () => {
            try {
                const res = await apiClient.get(`/sites/check-slug?slug=${currentSlug}`);
                if (res.data.isAvailable) setSlugStatus('available');
                else { setSlugStatus('taken'); setSlugError(res.data.message || 'Ця адреса вже зайнята'); }
            } catch (err) { setSlugStatus('idle'); setSlugError('Помилка перевірки адреси'); }
        };
        const timer = setTimeout(checkSlug, 500);
        return () => clearTimeout(timer);
    }, [identityData.slug, siteData?.site_path]);
    const handleIdentityChange = (field, value) => {
        if (field === 'slug') {
            const val = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
            setIdentityData(prev => ({ ...prev, slug: val }));
        } else if (field === 'title') {
            const { val, error } = validateSiteTitle(value);
            setTitleError(error);
            setIdentityData(prev => ({ ...prev, title: val }));
        }
    };

    const handleSaveIdentity = async () => {
        const { title, slug } = identityData;
        const originalSlug = siteData.site_path;
        if (titleError || slugError || slugStatus === 'checking' || slugStatus === 'taken' || slugStatus === 'invalid') return;
        setIsSavingIdentity(true);
        try {
            const promises = [];
            let needRedirect = false;
            if (slug !== originalSlug) { promises.push(apiClient.put(`/sites/${originalSlug}/rename`, { newPath: slug })); needRedirect = true; }
            if (title !== siteData.title) promises.push(apiClient.put(`/sites/${originalSlug}/settings`, { title }));
            if (promises.length === 0) { setIsSavingIdentity(false); return; }
            await Promise.all(promises);
            toast.success('Зміни успішно збережено!');
            if (onUpdate) onUpdate({ title, site_path: slug });
            if (needRedirect) setTimeout(() => { navigate(`/dashboard/${slug}`); window.location.reload(); }, 1000);
        } catch (error) {
            setSlugError(error.response?.data?.message || 'Помилка збереження');
            toast.error('Не вдалося зберегти зміни');
        } finally { setIsSavingIdentity(false); }
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
        } catch (error) { toast.error("Сталася помилка при експорті"); } 
        finally { setIsExporting(false); }
    };

    const handleDeleteSite = () => {
        if (isLocked && !isAdmin) return toast.error("Видалення заблоковано для цього сайту.");
        confirm({
            title: 'Видалити сайт?',
            message: 'Ця дія незворотна. Всі дані будуть видалені. Напишіть "DELETE" для підтвердження.',
            requireInput: true, confirmText: 'Видалити сайт', danger: true,
            onConfirm: async (inputValue) => {
                if (inputValue !== 'DELETE') return toast.error('Невірне підтвердження.');
                try {
                    await apiClient.delete(`/sites/${siteData.site_path}`);
                    toast.success('Сайт успішно видалено');
                    navigate('/my-sites');
                } catch (err) { toast.error('Не вдалося видалити сайт'); }
            }
        });
    };
    const hasIdentityChanges = identityData.title !== siteData.title || identityData.slug !== siteData.site_path;
    return (
        <div className="w-full mx-auto px-4 pb-20 relative">
            <div className="max-w-4xl mx-auto mb-8 shrink-0 flex flex-col items-center text-center">
                <h2 className="text-2xl font-semibold m-0 mb-1 text-(--platform-text-primary) flex items-center justify-center gap-2.5">
                    <Settings size={28} /> Глобальні налаштування
                </h2>
                <p className="text-(--platform-text-secondary) m-0 text-sm">
                    Керування основними параметрами вашого сайту
                </p>
            </div>
            <div className="max-w-4xl mx-auto w-full">
                <GeneralIdentitySection 
                    data={data} handleChange={handleChange} identityData={identityData}
                    handleIdentityChange={handleIdentityChange} handleSaveIdentity={handleSaveIdentity}
                    isSavingIdentity={isSavingIdentity} titleError={titleError} slugError={slugError}
                    slugStatus={slugStatus} hasIdentityChanges={hasIdentityChanges} onUpdate={onUpdate}
                    getImageUrl={getImageUrl} isAdmin={isAdmin} isLocked={isLocked}
                />
                <GeneralVisualsSection 
                    data={data} handleChange={handleChange} availableTags={availableTags}
                    selectedTags={selectedTags} handleTagToggle={handleTagToggle}
                    setSelectedTags={setSelectedTags} siteData={siteData} identityData={identityData}
                    getImageUrl={getImageUrl}
                />
            </div>
            <div className="max-w-337.5 mx-auto w-full">
                <GeneralTemplatesSection siteData={siteData} isAdmin={isAdmin} />
            </div>
            <div className="max-w-4xl mx-auto w-full">
                {!isAdmin && (
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
                            <Button onClick={handleExportSite} disabled={isExporting} style={{ height: '46px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isExporting ? <Loader size={18} className="animate-spin" /> : <FileDown size={18} />}
                                {isExporting ? `Генерація...` : 'Завантажити .ZIP'}
                            </Button>
                        </div>
                    </div>
                )}
                {(!isLocked || isAdmin) && (
                    <div className="rounded-2xl border border-(--platform-danger) p-8 mb-6 shadow-sm" style={{ background: 'color-mix(in srgb, var(--platform-danger), transparent 95%)' }}>
                         <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-(--platform-danger) m-0 mb-1 flex items-center gap-2.5">
                                    <AlertCircle size={22} /> ВИДАЛЕННЯ САЙТУ
                                </h3>
                                <p className="text-sm text-(--platform-danger) m-0 opacity-80">
                                    Видалення сайту є <strong>незворотним</strong>. Всі дані будуть втрачені.
                                </p>
                            </div>
                            <Button variant="danger" onClick={handleDeleteSite} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <Trash size={18} /> Видалити сайт
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                 @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                 @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default GeneralSettingsTab;