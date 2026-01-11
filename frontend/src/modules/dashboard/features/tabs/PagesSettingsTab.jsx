// frontend/src/modules/dashboard/features/tabs/PagesSettingsTab.jsx
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
                toast.success(`✅ Сторінку "${name}" оновлено!`);
            } else {
                await apiClient.post(`/sites/${siteId}/pages`, payload);
                toast.success(`✅ Сторінку "${name}" створено!`);
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

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2100, backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
    };

    const modalStyle = {
        backgroundColor: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '16px',
        width: '90%', maxWidth: '460px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out',
        boxSizing: 'border-box'
    };

    const contentStyle = { padding: '24px 24px 8px 24px' };
    
    const headerStyle = { display: 'flex', gap: '16px', alignItems: 'flex-start' };
    
    const iconBoxStyle = {
        width: '48px', height: '48px', borderRadius: '12px',
        backgroundColor: 'rgba(66, 153, 225, 0.1)', 
        color: 'var(--platform-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    };

    const footerStyle = {
        padding: '16px 24px',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px',
        backgroundColor: 'var(--platform-bg)',
        borderTop: '1px solid var(--platform-border-color)',
        marginTop: '16px'
    };
    
    const textareaStyle = { 
        width: '100%', padding: '10px 12px', border: '1px solid var(--platform-border-color)', borderRadius: '8px', 
        fontSize: '0.9rem', background: 'var(--platform-bg)', color: 'var(--platform-text-primary)', 
        outline: 'none', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit'
    };

    return (
        <div 
            ref={overlayRef}
            style={overlayStyle} 
            onMouseDown={(e) => {
                overlayRef.current.isSelfClick = (e.target === overlayRef.current);
            }}
            onMouseUp={(e) => {
                if (e.target === overlayRef.current && overlayRef.current.isSelfClick) {
                    onClose();
                }
            }}
        >
            <div style={modalStyle}>
                <div style={contentStyle}>
                    <div style={headerStyle}>
                        <div style={iconBoxStyle}>
                             {page ? <Settings size={24} /> : <Plus size={24} />}
                        </div>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '2px'}}>
                            <h3 style={{fontSize: '1.15rem', fontWeight: '600', margin: 0}}>
                                {page ? 'Налаштування сторінки' : 'Створити сторінку'}
                            </h3>
                            <p style={{margin: 0, fontSize: '0.95rem', color: 'var(--platform-text-secondary)', lineHeight: '1.5'}}>
                                {page ? 'Змініть основні налаштування та SEO параметри.' : 'Заповніть інформацію для створення нової сторінки.'}
                            </p>
                        </div>
                    </div>

                    <div style={{marginTop: '24px'}}>
                        <form id="page-form" onSubmit={handleSubmit}>
                            <div style={{marginBottom: '16px'}}>
                                <Input 
                                    label="Назва сторінки"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Наприклад: Про нас"
                                    disabled={loading}
                                    autoFocus={!page}
                                />
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <Input 
                                    label="URL (Slug)"
                                    value={slug}
                                    onChange={handleSlugChange}
                                    placeholder="about-us"
                                    disabled={loading}
                                    leftIcon={<span style={{fontSize: '1rem', color: 'var(--platform-text-secondary)', fontWeight: 'bold'}}>/</span>}
                                />
                            </div>

                            <div style={{ borderTop: '1px solid var(--platform-border-color)', paddingTop: '16px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowSeo(!showSeo)} style={{ background: 'none', border: 'none', color: 'var(--platform-accent)', cursor: 'pointer', fontSize: '0.9rem', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                    <Search size={16} /> SEO Налаштування {showSeo ? <X size={14}/> : null}
                                </button>
                                
                                {showSeo && (
                                    <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s ease' }}>
                                        <div style={{marginBottom: '16px'}}>
                                            <Input 
                                                label="Meta Title (Заголовок)"
                                                value={seoTitle}
                                                onChange={(e) => setSeoTitle(e.target.value)}
                                                placeholder={name}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--platform-text-primary)', fontSize: '0.85rem'}}>Meta Description</label>
                                            <textarea 
                                                value={seoDescription} 
                                                onChange={(e) => setSeoDescription(e.target.value)} 
                                                style={textareaStyle} 
                                                placeholder="Опис для пошукових систем..." 
                                                disabled={loading} 
                                                className="custom-input-textarea"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div style={footerStyle}>
                    <UIButton variant="outline" onClick={onClose} disabled={loading}>Скасувати</UIButton>
                    <UIButton type="submit" form="page-form" disabled={loading}>{page ? 'Зберегти' : 'Створити'}</UIButton>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .custom-input-textarea:focus {
                    border-color: var(--platform-accent) !important;
                    box-shadow: 0 0 0 3px var(--platform-accent-transparent, rgba(66, 153, 225, 0.15));
                }
            `}</style>
        </div>
    );
};

const GRID_LAYOUT = '2fr 1.5fr 110px 220px'; 

const CustomActionButton = ({ onClick, title, children, variant = 'default', loading = false }) => {
    const variants = {
        editor: { bg: '#10B981', hover: '#059669' },
        settings: { bg: '#6B7280', hover: '#4B5563' },
        home: { bg: '#F59E0B', hover: '#D97706' },
        delete: { bg: '#EF4444', hover: '#DC2626' }
    };
    const v = variants[variant] || variants.editor;
    const [hover, setHover] = useState(false);

    return (
        <button
            onClick={onClick} title={title} disabled={loading}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{
                padding: '8px 12px', border: 'none', borderRadius: '8px',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '0.85rem', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s ease',
                color: '#fff',
                background: hover ? v.hover : v.bg,
                opacity: loading ? 0.7 : 1
            }}
        >
            {children}
        </button>
    );
};

const ListRow = ({ icon, title, subtitle, badges, actions, isGlobal = false }) => {
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: isGlobal ? '1fr auto' : GRID_LAYOUT, 
        alignItems: 'center',
        gap: '16px',
        background: 'var(--platform-bg)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '12px',
        padding: '12px 20px',
        marginBottom: '12px',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={gridStyle} className="list-row-hover">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                <div style={{ 
                    padding: '8px',
                    background: isGlobal ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255, 0.05)', 
                    border: isGlobal ? 'none' : '1px solid var(--platform-border-color)',
                    borderRadius: '10px', 
                    color: isGlobal ? '#3b82f6' : 'var(--platform-text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                }}>
                    {icon}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--platform-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                    {subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--platform-text-secondary)', marginTop: '2px' }}>{subtitle}</div>}
                </div>
            </div>

            {!isGlobal && (
                <>
                    <div style={{ fontFamily: 'monospace', color: 'var(--platform-text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {badges.slug}
                    </div>
                    <div>{badges.status}</div>
                </>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {actions}
            </div>
            
            <style>{`
                .list-row-hover:hover {
                    border-color: var(--platform-accent);
                    background: rgba(255,255,255, 0.02);
                }
            `}</style>
        </div>
    );
};

const HeaderRow = () => (
    <div style={{ 
        display: 'grid', 
        gridTemplateColumns: GRID_LAYOUT,
        gap: '16px', 
        padding: '0 20px 10px 20px',
        color: 'var(--platform-text-secondary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'
    }}>
        <div>Назва</div>
        <div>URL (Slug)</div>
        <div>Статус</div>
        <div style={{textAlign: 'right'}}>Дії</div>
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
        <div style={{ background: 'var(--platform-card-bg)', padding: '32px', borderRadius: '20px', border: '1px solid var(--platform-border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <PageModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveSuccess} page={editingPage} siteId={siteId} onPageUpdate={onPageUpdate} onSavingChange={onSavingChange} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ color: 'var(--platform-text-primary)', margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: '700' }}>Структура сайту</h2>
                    <p style={{ margin: 0, color: 'var(--platform-text-secondary)', fontSize: '0.9rem' }}>Керуйте сторінками та глобальними блоками</p>
                </div>
                <UIButton onClick={handleOpenCreate}><Plus size={18} /> Додати сторінку</UIButton>
            </div>

            {loading ? (
                <div style={{textAlign: 'center', padding: '40px', color: 'var(--platform-text-secondary)'}}>Завантаження...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--platform-text-secondary)', marginBottom: '12px', letterSpacing: '0.05em' }}>
                            Глобальні області
                        </h4>
                        
                        <ListRow 
                            isGlobal={true}
                            icon={<PanelTop size={24} />}
                            title="Хедер (Шапка)"
                            subtitle="Верхній блок на всех сторінках"
                            actions={
                                <CustomActionButton variant="editor" onClick={onEditHeader}>
                                    <Edit size={16} /> Редактор
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
                                    <Edit size={16} /> Редактор
                                </CustomActionButton>
                            }
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '12px' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--platform-text-secondary)', margin: 0, letterSpacing: '0.05em' }}>
                                Сторінки ({pages.length})
                            </h4>
                        </div>
                        
                        <HeaderRow />

                        {pages.length === 0 ? (
                             <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed var(--platform-border-color)', borderRadius: '12px' }}>
                                <div style={{ color: 'var(--platform-text-secondary)', marginBottom: '16px' }}>Немає сторінок</div>
                                <UIButton onClick={handleOpenCreate} variant="outline">Створити першу</UIButton>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {pages.map(page => (
                                    <ListRow 
                                        key={page.id}
                                        icon={<FileText size={20} />}
                                        title={
                                            <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                {page.name}
                                                {!!page.is_homepage && <Star size={16} style={{color: '#F59E0B', fill: '#F59E0B'}} />}
                                            </span>
                                        }
                                        badges={{
                                            slug: <span style={{background: 'rgba(0,0,0,0.04)', padding: '4px 8px', borderRadius: '6px'}}>/{page.slug}</span>,
                                            status: !!page.is_homepage ? (
                                                <span style={{color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700'}}>ГОЛОВНА</span>
                                            ) : (
                                                <span style={{color: 'var(--platform-text-secondary)', fontSize: '0.85rem'}}>Звичайна</span>
                                            )
                                        }}
                                        actions={
                                            <>
                                                <CustomActionButton variant="editor" onClick={() => onEditPage(page.id)} title="Редактор">
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