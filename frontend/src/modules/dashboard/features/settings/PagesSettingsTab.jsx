// frontend/src/modules/dashboard/features/settings/PagesSettingsTab.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../../../shared/api/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import { Button as UIButton } from '../../../../shared/ui/elements/Button'; 
import { Input } from '../../../../shared/ui/elements/Input'; 
import { FileText, Plus, Edit, Settings, Trash, Star, Search, X, PanelTop, PanelBottom } from 'lucide-react';

const PageModal = ({ isOpen, onClose, onSave, page, siteId, onPageUpdate, onSavingChange }) => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [showSeo, setShowSeo] = useState(false);
    const [loading, setLoading] = useState(false);
    const overlayRef = useRef(null);
    useEffect(() => {
        if (isOpen) {
            setName(page ? page.name : '');
            setSlug(page ? page.slug : '');
            setSeoTitle(page ? (page.seo_title || '') : '');
            setSeoDescription(page ? (page.seo_description || '') : '');
            setShowSeo(false);
        }
    }, [page, isOpen]);
    const handleSlugChange = (e) => {
        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !slug) {
            toast.warning('Назва та Slug є обов\'язковими.');
            return;
        }
        if (onSavingChange) onSavingChange(true);
        setLoading(true);
        try {
            const payload = { name, slug, seo_title: seoTitle, seo_description: seoDescription };
            if (page) {
                await apiClient.put(`/pages/${page.id}/settings`, payload);
                toast.success(`Сторінку "${name}" оновлено!`);
            } else {
                await apiClient.post(`/sites/${siteId}/pages`, payload);
                toast.success(`Сторінку "${name}" створено!`);
            }
            onSave();
            if (onPageUpdate) onPageUpdate();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Помилка збереження');
        } finally {
            setLoading(false);
            setTimeout(() => { if (onSavingChange) onSavingChange(false); }, 500);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            ref={overlayRef}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-2100 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
            onMouseDown={(e) => {
                overlayRef.current.isSelfClick = (e.target === overlayRef.current);
            }}
            onMouseUp={(e) => {
                if (e.target === overlayRef.current && overlayRef.current.isSelfClick) {
                    onClose();
                }
            }}
        >
            <div className="bg-(--platform-card-bg) text-(--platform-text-primary) border border-(--platform-border-color) rounded-2xl w-[90%] max-w-115 shadow-2xl overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out]">
                <div className="p-6 pb-2">
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-xl bg-(--platform-accent)/10 text-(--platform-accent) flex items-center justify-center shrink-0">
                             {page ? <Settings size={24} /> : <Plus size={24} />}
                        </div>
                        <div className="flex-1 flex flex-col gap-2 pt-0.5">
                            <h3 className="text-lg font-semibold m-0">
                                {page ? 'Налаштування сторінки' : 'Створити сторінку'}
                            </h3>
                            <p className="m-0 text-sm text-(--platform-text-secondary) leading-relaxed">
                                {page ? 'Змініть основні налаштування та SEO параметри.' : 'Заповніть інформацію для створення нової сторінки.'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <form id="page-form" onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <Input 
                                    label="Назва сторінки"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Наприклад: Про нас"
                                    disabled={loading}
                                    autoFocus={!page}
                                />
                            </div>
                            <div className="mb-4">
                                <Input 
                                    label="URL (Slug)"
                                    value={slug}
                                    onChange={handleSlugChange}
                                    placeholder="about-us"
                                    disabled={loading}
                                    leftIcon={<span className="text-base text-(--platform-text-secondary) font-bold">/</span>}
                                />
                            </div>
                            <div className="border-t border-(--platform-border-color) pt-4 mt-5">
                                <button 
                                    type="button" 
                                    onClick={() => setShowSeo(!showSeo)} 
                                    className="bg-transparent border-none text-(--platform-accent) cursor-pointer text-sm p-0 flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
                                >
                                    <Search size={16} /> SEO Налаштування {showSeo ? <X size={14}/> : null}
                                </button>
                                {showSeo && (
                                    <div className="mt-4 animate-[fadeIn_0.3s_ease]">
                                        <div className="mb-4">
                                            <Input 
                                                label="Meta Title (Заголовок)"
                                                value={seoTitle}
                                                onChange={(e) => setSeoTitle(e.target.value)}
                                                placeholder={name}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1.5 font-medium text-(--platform-text-primary) text-[0.85rem]">Meta Description</label>
                                            <textarea 
                                                value={seoDescription} 
                                                onChange={(e) => setSeoDescription(e.target.value)} 
                                                placeholder="Опис для пошукових систем..." 
                                                disabled={loading} 
                                                className="w-full p-2.5 border border-(--platform-border-color) rounded-lg text-sm bg-(--platform-bg) text-(--platform-text-primary) outline-none min-h-20 resize-y font-inherit focus:border-(--platform-accent) focus:shadow-[0_0_0_3px_var(--platform-accent-transparent,rgba(66,153,225,0.15))]"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
                <div className="p-4 px-6 flex justify-end items-center gap-3 bg-(--platform-bg) border-t border-(--platform-border-color) mt-4">
                    <UIButton variant="outline" onClick={onClose} disabled={loading}>Скасувати</UIButton>
                    <UIButton type="submit" form="page-form" disabled={loading}>{page ? 'Зберегти' : 'Створити'}</UIButton>
                </div>
            </div>
        </div>
    );
};

const GRID_COLS_CLASS = "grid grid-cols-[2fr_1.5fr_110px_220px] items-center gap-4";
const GLOBAL_GRID_COLS_CLASS = "grid grid-cols-[1fr_auto] items-center gap-4";
const CustomActionButton = ({ onClick, title, children, variant = 'default', loading = false }) => {
    const variantClasses = {
        editor: "bg-[#10B981] hover:bg-[#059669]",
        settings: "bg-[#6B7280] hover:bg-[#4B5563]",
        home: "bg-[#F59E0B] hover:bg-[#D97706]",
        delete: "bg-[#EF4444] hover:bg-[#DC2626]"
    };
    const bgClass = variantClasses[variant] || variantClasses.editor;
    return (
        <button
            onClick={onClick} title={title} disabled={loading}
            className={`
                px-3 py-2 border-none rounded-lg cursor-pointer text-[0.85rem] font-semibold 
                flex items-center gap-1.5 transition-all duration-200 text-white
                ${bgClass} ${loading ? 'opacity-70 cursor-wait' : ''}
            `}
        >
            {children}
        </button>
    );
};
const ListRow = ({ icon, title, subtitle, badges, actions, isGlobal = false }) => {
    return (
        <div className={`
            ${isGlobal ? GLOBAL_GRID_COLS_CLASS : GRID_COLS_CLASS}
            bg-(--platform-bg) border border-(--platform-border-color) rounded-xl p-3 px-5 mb-3 transition-all duration-200
            hover:border-(--platform-accent) hover:bg-white/5
        `}>
            <div className="flex items-center gap-4 overflow-hidden">
                <div className={`
                    p-2 rounded-xl flex items-center justify-center shrink-0
                    ${isGlobal 
                        ? 'bg-blue-500/10 text-blue-500 border-none' 
                        : 'bg-white/5 border border-(--platform-border-color) text-(--platform-text-secondary)'
                    }
                `}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="font-bold text-base text-(--platform-text-primary) whitespace-nowrap overflow-hidden text-ellipsis">
                        {title}
                    </div>
                    {subtitle && <div className="text-xs text-(--platform-text-secondary) mt-0.5">{subtitle}</div>}
                </div>
            </div>
            {!isGlobal && (
                <>
                    <div className="font-mono text-(--platform-text-secondary) text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {badges.slug}
                    </div>
                    <div>{badges.status}</div>
                </>
            )}
            <div className="flex gap-2 justify-end">
                {actions}
            </div>
        </div>
    );
};

const HeaderRow = () => (
    <div className={`${GRID_COLS_CLASS} px-5 pb-2.5 text-(--platform-text-secondary) text-xs font-bold uppercase tracking-wider`}>
        <div>Назва</div>
        <div>URL (Slug)</div>
        <div>Статус</div>
        <div className="text-right">Дії</div>
    </div>
);

const PagesSettingsTab = ({ siteId, onEditPage, onPageUpdate, onEditFooter, onEditHeader, onSavingChange }) => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { confirm } = useConfirm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const fetchPages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/sites/${siteId}/pages`);
            setPages(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [siteId]);
    useEffect(() => { fetchPages(); }, [fetchPages]);
    const handleOpenCreate = () => { setEditingPage(null); setIsModalOpen(true); };
    const handleOpenEdit = (page) => { setEditingPage(page); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingPage(null); };
    const handleSaveSuccess = () => { handleCloseModal(); fetchPages(); if (onPageUpdate) onPageUpdate(); };
    const handleDelete = async (page) => {
        if (page.is_homepage) return toast.warning('Неможливо видалити головну сторінку.');
        if (!await confirm({ title: "Видалити?", message: `Видалити сторінку "${page.name}"?`, type: "danger", confirmLabel: "Видалити" })) return;
        if (onSavingChange) onSavingChange(true);
        try {
            await apiClient.delete(`/pages/${page.id}`);
            fetchPages();
            if (onPageUpdate) onPageUpdate();
            toast.success('Сторінку видалено');
        } catch (err) { toast.error('Помилка видалення'); }
        finally { setTimeout(() => onSavingChange && onSavingChange(false), 500); }
    };

    const handleSetHome = async (pageId, pageName) => {
        if (onSavingChange) onSavingChange(true);
        try {
            await apiClient.post(`/pages/${pageId}/set-home`);
            fetchPages();
            if (onPageUpdate) onPageUpdate();
            toast.success(`Головна: ${pageName}`);
        } catch (err) { toast.error('Помилка'); }
        finally { setTimeout(() => onSavingChange && onSavingChange(false), 500); }
    };

    return (
        <div className="bg-(--platform-card-bg) p-8 rounded-[20px] border border-(--platform-border-color) shadow-sm">
            <PageModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveSuccess} page={editingPage} siteId={siteId} onPageUpdate={onPageUpdate} onSavingChange={onSavingChange} />
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-(--platform-text-primary) m-0 mb-1 text-2xl font-bold">Структура сайту</h2>
                    <p className="m-0 text-(--platform-text-secondary) text-sm">Керуйте сторінками та глобальними блоками</p>
                </div>
                <UIButton onClick={handleOpenCreate}><Plus size={18} /> Додати сторінку</UIButton>
            </div>
            {loading ? (
                <div className="text-center p-10 text-(--platform-text-secondary)">Завантаження...</div>
            ) : (
                <div className="flex flex-col gap-8">
                    <div>
                        <h4 className="text-[0.85rem] font-bold uppercase text-(--platform-text-secondary) mb-3 tracking-wider">
                            Глобальні області
                        </h4>
                        <ListRow 
                            isGlobal={true}
                            icon={<PanelTop size={24} />}
                            title="Хедер (Шапка)"
                            subtitle="Верхній блок на всех сторінках"
                            actions={
                                <CustomActionButton variant="editor" onClick={onEditHeader}>
                                    <Edit size={16} /> В редактор
                                </CustomActionButton>
                            }
                        />
                         <ListRow 
                            isGlobal={true}
                            icon={<PanelBottom size={24} />}
                            title="Футер (Підвал)"
                            subtitle="Нижній блок на всіх сторінках"
                            actions={
                                <CustomActionButton variant="editor" onClick={onEditFooter}>
                                    <Edit size={16} /> В редактор
                                </CustomActionButton>
                            }
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <h4 className="text-[0.85rem] font-bold uppercase text-(--platform-text-secondary) m-0 tracking-wider">
                                Сторінки ({pages.length})
                            </h4>
                        </div>
                        <HeaderRow />
                        {pages.length === 0 ? (
                             <div className="text-center p-10 border-2 dashed border-(--platform-border-color) rounded-xl">
                                <div className="text-(--platform-text-secondary) mb-4">Немає сторінок</div>
                                <UIButton onClick={handleOpenCreate} variant="outline">Створити першу</UIButton>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {pages.map(page => (
                                    <ListRow 
                                        key={page.id}
                                        icon={<FileText size={20} />}
                                        title={
                                            <span className="flex items-center gap-2">
                                                {page.name}
                                                {!!page.is_homepage && <Star size={16} className="text-amber-500 fill-amber-500" />}
                                            </span>
                                        }
                                        badges={{
                                            slug: <span className="bg-black/5 px-2 py-1 rounded-md">/{page.slug}</span>,
                                            status: !!page.is_homepage ? (
                                                <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-bold">ГОЛОВНА</span>
                                            ) : (
                                                <span className="text-(--platform-text-secondary) text-sm">Звичайна</span>
                                            )
                                        }}
                                        actions={
                                            <>
                                                <CustomActionButton variant="editor" onClick={() => onEditPage(page.id)} title="В редактор">
                                                    <Edit size={16} />
                                                </CustomActionButton>
                                                <CustomActionButton variant="settings" onClick={() => handleOpenEdit(page)} title="Налаштування">
                                                    <Settings size={16} />
                                                </CustomActionButton>
                                                {!page.is_homepage && (
                                                    <>
                                                        <CustomActionButton variant="home" onClick={() => handleSetHome(page.id, page.name)} title="Зробити головною">
                                                            <Star size={16} />
                                                        </CustomActionButton>
                                                        <CustomActionButton variant="delete" onClick={() => handleDelete(page)} title="Видалити">
                                                            <Trash size={16} />
                                                        </CustomActionButton>
                                                    </>
                                                )}
                                            </>
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagesSettingsTab;