// frontend/src/modules/dashboard/components/TemplateModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../shared/api/api';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { Input, Button } from '../../../shared/ui/elements';
import { InputWithCounter } from '../../../shared/ui/complex/InputWithCounter';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import UniversalMediaInput from '../../../shared/ui/complex/UniversalMediaInput';
import { getMediaUrl } from '../../../shared/utils/mediaUtils';
import { Layout, FileText, Loader2, Check, ShoppingBag, Briefcase, Camera, Globe, Palette, Image, X } from 'lucide-react';

const CATEGORY_OPTIONS = [
    { value: 'General', label: 'Загальне', icon: Layout },
    { value: 'Business', label: 'Бізнес', icon: Briefcase },
    { value: 'Store', label: 'Магазин', icon: ShoppingBag },
    { value: 'Portfolio', label: 'Портфоліо', icon: Camera },
    { value: 'Landing', label: 'Лендінг', icon: Globe },
    { value: 'Blog', label: 'Блог', icon: FileText },
    { value: 'Creative', label: 'Креатив', icon: Palette },
];

const TemplateModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const isEditMode = !!initialData;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General'); 
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [existingTemplates, setExistingTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const { confirm } = useConfirm();
    const overlayRef = useRef(null);
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(initialData.name || '');
                setDescription(initialData.description || '');
                setThumbnailUrl(initialData.thumbnail_url || '');
                setCategory(initialData.category || 'General'); 
                setLoading(false);
            } else {
                setName('');
                setDescription('');
                setThumbnailUrl('');
                setCategory('General');
                setLoading(true);
                apiClient.get('/user-templates')
                    .then(res => setExistingTemplates(res.data))
                    .catch(err => console.error("Помилка перевірки шаблонів", err))
                    .finally(() => setLoading(false));
            }
        }
    }, [isOpen, initialData, isEditMode]);

    if (!isOpen) return null;
    const handleCategoryChange = (valOrEvent) => {
        if (valOrEvent && valOrEvent.target) {
            setCategory(valOrEvent.target.value);
        } else {
            setCategory(valOrEvent);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        if (isEditMode) {
            const isConfirmed = await confirm({
                title: "Зберегти зміни?",
                message: `Ви впевнені, що хочете оновити шаблон "${name}"?`,
                confirmLabel: "Зберегти",
                type: "info"
            });
            if (isConfirmed) {
                onSave(name, description, thumbnailUrl, category);
                onClose();
            }
            return;
        }
        const duplicate = existingTemplates.find(t => t.name.toLowerCase() === name.trim().toLowerCase());
        if (duplicate) {
            const isConfirmed = await confirm({
                title: "Шаблон вже існує",
                message: `Шаблон з назвою "${name}" вже існує. Оновити його вміст поточним станом сайту?`,
                confirmLabel: "Оновити шаблон",
                type: "warning"
            });
            if (isConfirmed) {
                onSave(name, description, thumbnailUrl, category, duplicate.id);
                onClose();
            }
        } else {
            onSave(name, description, thumbnailUrl, category, null);
            onClose();
        }
    };

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
        width: '95%', maxWidth: '480px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out',
        maxHeight: '90vh'
    };

    const displayThumbnailUrl = thumbnailUrl ? getMediaUrl({ path_full: thumbnailUrl }) : '';
    const isValidThumbnail = thumbnailUrl && typeof thumbnailUrl === 'string' && thumbnailUrl !== 'null' && !thumbnailUrl.includes('empty');
    return (
        <div 
            ref={overlayRef}
            style={overlayStyle} 
            onMouseDown={(e) => { overlayRef.current.isSelfClick = (e.target === overlayRef.current); }}
            onMouseUp={(e) => { if (e.target === overlayRef.current && overlayRef.current.isSelfClick) onClose(); }}
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .template-modal-content { padding: 24px 24px 8px 24px; overflow-y: auto; }
                .template-modal-footer { padding: 16px 24px; display: flex; justify-content: flex-end; align-items: center; gap: 12px; background-color: var(--platform-bg); border-top: 1px solid var(--platform-border-color); margin-top: 16px; }
                @media (max-width: 600px) {
                    .template-modal-content { padding: 16px 16px 8px 16px; }
                    .template-modal-footer { padding: 12px 16px; }
                }
            `}</style>
            <div style={modalStyle}>
                <div className="template-modal-content">
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            backgroundColor: isEditMode ? 'color-mix(in srgb, var(--platform-warning), transparent 90%)' : 'color-mix(in srgb, var(--platform-accent), transparent 90%)', 
                            color: isEditMode ? 'var(--platform-warning)' : 'var(--platform-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            transition: 'all 0.2s'
                        }}>
                            <Layout size={24} />
                        </div>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '2px'}}>
                            <h3 style={{fontSize: '1.15rem', fontWeight: '600', margin: 0}}>
                                {isEditMode ? 'Редагувати шаблон' : 'Зберегти як шаблон'}
                            </h3>
                            <p style={{margin: 0, fontSize: '0.95rem', color: 'var(--platform-text-secondary)', lineHeight: '1.5'}}>
                                {isEditMode 
                                    ? 'Змініть назву, категорію або банер.' 
                                    : 'Збережіть поточний дизайн як шаблон.'}
                            </p>
                        </div>
                    </div>
                    <div style={{marginTop: '24px'}}>
                        <form id="template-modal-form" onSubmit={handleSubmit}>
                            <div style={{marginBottom: '16px'}}>
                                <InputWithCounter 
                                    label="Назва шаблону"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Наприклад: Літній розпродаж"
                                    required
                                    autoFocus
                                    disabled={loading}
                                    leftIcon={<Layout size={18} />}
                                    customLimit={50}
                                />
                            </div>
                            <div style={{marginBottom: '16px'}}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: 'var(--platform-text-secondary)' }}>
                                    Категорія
                                </label>
                                <CustomSelect 
                                    name="category"
                                    value={category}
                                    onChange={handleCategoryChange}
                                    options={CATEGORY_OPTIONS}
                                    placeholder="Оберіть категорію"
                                    disabled={loading}
                                />
                            </div>
                            <div style={{marginBottom: '16px'}}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: 'var(--platform-text-secondary)' }}>
                                    Банер
                                </label>
                                <UniversalMediaInput 
                                    type="image"
                                    value={thumbnailUrl}
                                    aspect={1.6} 
                                    onChange={(val) => {
                                        const newVal = val && val.target ? val.target.value : val;
                                        setThumbnailUrl(newVal);
                                    }}
                                    triggerStyle={{ 
                                        display: 'block', 
                                        width: '100%', 
                                        height: '140px', 
                                        borderRadius: '12px', 
                                        overflow: 'hidden', 
                                        border: '1px dashed var(--platform-border-color)', 
                                        background: 'var(--platform-bg)', 
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isValidThumbnail ? (
                                            <>
                                                <img src={displayThumbnailUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setThumbnailUrl(''); }}
                                                    style={{ 
                                                        position: 'absolute', top: '8px', right: '8px', 
                                                        background: 'rgba(0,0,0,0.6)', color: 'white', 
                                                        border: 'none', borderRadius: '50%', width: '28px', height: '28px', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--platform-danger)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--platform-text-secondary)' }}>
                                                <Image size={28} />
                                                <span style={{ fontSize: '14px', fontWeight: '500' }}>Завантажити банер</span>
                                            </div>
                                        )}
                                    </div>
                                </UniversalMediaInput>
                            </div>
                            <div>
                                <Input 
                                    label="Опис"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Короткий опис призначення..."
                                    disabled={loading}
                                    leftIcon={<FileText size={18} />}
                                />
                            </div>
                            {!isEditMode && name && existingTemplates.some(t => t.name.toLowerCase() === name.trim().toLowerCase()) && (
                                <div style={{ 
                                    marginTop: '16px', fontSize: '0.85rem', color: 'var(--platform-warning)', 
                                    background: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', padding: '10px 12px', 
                                    borderRadius: '8px', border: '1px solid var(--platform-warning)',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    Шаблон з такою назвою вже існує.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
                <div className="template-modal-footer">
                    <Button variant="outline" onClick={onClose}>
                        Скасувати
                    </Button>
                    <Button 
                        type="submit" 
                        form="template-modal-form"
                        disabled={!name.trim() || loading}
                        icon={loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    >
                        {loading ? 'Завантаження...' : 'Зберегти'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TemplateModal;