// frontend/src/modules/dashboard/components/TemplateModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../shared/api/api';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { Input, Button } from '../../../shared/ui/elements';
import { InputWithCounter } from '../../../shared/ui/complex/InputWithCounter';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Layout, FileText, Loader2, Check, ShoppingBag, Briefcase, Camera, Coffee, Music, Star, Heart, Globe, Palette, Tag } from 'lucide-react';

const ICON_OPTIONS = [
    { id: 'Layout', component: Layout },
    { id: 'ShoppingBag', component: ShoppingBag },
    { id: 'Briefcase', component: Briefcase },
    { id: 'FileText', component: FileText },
    { id: 'Camera', component: Camera },
    { id: 'Coffee', component: Coffee },
    { id: 'Music', component: Music },
    { id: 'Star', component: Star },
    { id: 'Heart', component: Heart },
    { id: 'Globe', component: Globe },
];

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
    const [selectedIcon, setSelectedIcon] = useState('Layout');
    const [existingTemplates, setExistingTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const { confirm } = useConfirm();
    const overlayRef = useRef(null);
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(initialData.name || '');
                setDescription(initialData.description || '');
                setSelectedIcon(initialData.icon || 'Layout');
                setCategory(initialData.category || 'General'); 
                setLoading(false);
            } else {
                setName('');
                setDescription('');
                setSelectedIcon('Layout');
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
                onSave(name, description, selectedIcon, category);
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
                onSave(name, description, selectedIcon, category, duplicate.id);
                onClose();
            }
        } else {
            onSave(name, description, selectedIcon, category, null);
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
        width: '90%', maxWidth: '480px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out',
        maxHeight: '90vh'
    };

    const contentStyle = { padding: '24px 24px 8px 24px', overflowY: 'auto' };
    const CurrentIconComponent = ICON_OPTIONS.find(i => i.id === selectedIcon)?.component || Layout;
    const headerStyle = { display: 'flex', gap: '16px', alignItems: 'flex-start' };
    const iconBoxStyle = {
        width: '48px', height: '48px', borderRadius: '12px',
        backgroundColor: isEditMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(66, 153, 225, 0.1)', 
        color: isEditMode ? 'var(--platform-warning)' : 'var(--platform-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'all 0.2s'
    };

    const footerStyle = {
        padding: '16px 24px',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px',
        backgroundColor: 'var(--platform-bg)',
        borderTop: '1px solid var(--platform-border-color)',
        marginTop: '16px'
    };

    const iconGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
        marginTop: '8px',
        padding: '4px'
    };

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
                
                .icon-btn {
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    border: 1px solid var(--platform-border-color);
                    background: var(--platform-bg);
                    color: var(--platform-text-secondary);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .icon-btn:hover {
                    background: var(--platform-hover-bg);
                    color: var(--platform-text-primary);
                    border-color: var(--platform-border-color);
                }
                .icon-btn.active {
                    background: var(--platform-accent);
                    border-color: var(--platform-accent);
                    color: white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
            `}</style>
            
            <div style={modalStyle}>
                <div style={contentStyle}>
                    <div style={headerStyle}>
                        <div style={iconBoxStyle}>
                            <CurrentIconComponent size={24} />
                        </div>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '2px'}}>
                            <h3 style={{fontSize: '1.15rem', fontWeight: '600', margin: 0}}>
                                {isEditMode ? 'Редагувати шаблон' : 'Зберегти як шаблон'}
                            </h3>
                            <p style={{margin: 0, fontSize: '0.95rem', color: 'var(--platform-text-secondary)', lineHeight: '1.5'}}>
                                {isEditMode 
                                    ? 'Змініть назву, категорію або іконку.' 
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
                                    leftIcon={<CurrentIconComponent size={18} />}
                                    customLimit={50}
                                />
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: 'var(--platform-text-secondary)' }}>
                                    Категорія (Тег)
                                </label>
                                <CustomSelect 
                                    name="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    options={CATEGORY_OPTIONS}
                                    placeholder="Оберіть категорію"
                                    disabled={loading}
                                />
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: 'var(--platform-text-secondary)' }}>
                                    Іконка прев'ю
                                </label>
                                <div style={iconGridStyle}>
                                    {ICON_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            className={`icon-btn ${selectedIcon === opt.id ? 'active' : ''}`}
                                            onClick={() => setSelectedIcon(opt.id)}
                                            title={opt.id}
                                        >
                                            <opt.component size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Input 
                                    label="Опис (необов'язково)"
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
                                    background: 'rgba(236, 201, 75, 0.1)', padding: '10px 12px', 
                                    borderRadius: '8px', border: '1px solid var(--platform-warning)',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    Шаблон з такою назвою вже існує.
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                <div style={footerStyle}>
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