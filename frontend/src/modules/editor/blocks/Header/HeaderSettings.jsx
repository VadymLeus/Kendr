// frontend/src/modules/editor/blocks/Header/HeaderSettings.jsx
import React, { useState } from 'react';
import ImageInput from '../../../media/components/ImageInput';
import { generateBlockId } from '../../core/editorConfig';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../controls/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import { IconTrash, IconPlus, IconImage, IconType, IconLayout, IconList, IconAlignLeft, IconAlignCenter, IconAlignRight, IconLink, IconEdit, IconUpload, IconAlertCircle } from '../../../../shared/ui/elements/Icons';
import ConfirmModal from '../../../../shared/ui/complex/ConfirmModal';

const API_URL = 'http://localhost:5000';
const HeaderSettings = ({ data, onChange }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const updateData = (updates) => onChange({ ...data, ...updates });
    const getImageUrl = (src) => {
        if (!src) return '';
        if (src.startsWith('data:')) return src;
        if (src.startsWith('http')) return src;
        const cleanSrc = src.startsWith('/') ? src : `/${src}`;
        return `${API_URL}${cleanSrc}`;
    };

    const overlayStyle = (isHovered) => ({ 
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        color: 'white', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease', 
        backdropFilter: 'blur(2px)', zIndex: 10 
    });

    const trashButtonStyle = { 
        position: 'absolute', top: '6px', right: '6px', 
        background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', 
        borderRadius: '50%', width: '28px', height: '28px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        cursor: 'pointer', zIndex: 20, transition: 'background 0.2s' 
    };

    const handleNavItemChange = (id, field, value) => {
        const newItems = data.nav_items.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        updateData({ nav_items: newItems });
    };

    const addNavItem = () => {
        const newItem = { id: generateBlockId(), label: 'Нова сторінка', link: '/' };
        updateData({ nav_items: [...(data.nav_items || []), newItem] });
    };

    const requestDelete = (id) => {
        setItemToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDeleteId) {
            updateData({ nav_items: data.nav_items.filter(item => item.id !== itemToDeleteId) });
        }
        setIsDeleteModalOpen(false);
        setItemToDeleteId(null);
    };

    const handleLogoChange = (val) => {
        const newValue = val?.target ? val.target.value : val;
        updateData({ logo_src: newValue });
    };

    const navItemStyle = { 
        display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start',
        background: 'var(--platform-card-bg)', padding: '10px', 
        borderRadius: '8px', border: '1px solid var(--platform-border-color)'
    };

    const previewUrl = getImageUrl(data.logo_src);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Видалити пункт меню?"
                message="Цю дію не можна скасувати."
                confirmLabel="Видалити"
                cancelLabel="Скасувати"
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                type="danger"
            />

            <div>
                <SectionTitle icon={<IconImage size={18}/>}>Логотип та Назва</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Центральний логотип</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ width: '100%' }}>
                            <ImageInput 
                                value={data.logo_src} 
                                onChange={handleLogoChange} 
                                aspect={1}
                                triggerStyle={{ display: 'block', padding: 0, border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}
                            >
                                <div 
                                    style={{ 
                                        width: '100%', height: '120px',
                                        border: '1px solid var(--platform-border-color)', 
                                        borderRadius: '12px', overflow: 'hidden', 
                                        background: 'var(--platform-bg)', position: 'relative', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                    }} 
                                    onMouseEnter={() => setIsLogoHovered(true)} 
                                    onMouseLeave={() => setIsLogoHovered(false)}
                                >
                                    {data.logo_src ? (
                                        <img 
                                            src={previewUrl}
                                            alt="Logo" 
                                            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} 
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.style.backgroundImage = 'none';
                                            }}
                                        />
                                    ) : (
                                        <IconImage size={32} style={{ color: 'var(--platform-text-secondary)', opacity: 0.5 }} />
                                    )}
                                    
                                    <div style={overlayStyle(isLogoHovered)}>
                                        <IconUpload size={24} />
                                    </div>

                                    {data.logo_src && (
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); handleLogoChange(''); }} 
                                            style={trashButtonStyle} 
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--platform-danger)'} 
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'} 
                                            title="Видалити лого"
                                        >
                                            <IconTrash size={14} />
                                        </button>
                                    )}
                                </div>
                            </ImageInput>
                        </div>
                    </div>
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Розмір логотипу</label>
                    <ToggleGroup 
                        options={[
                            { value: 'small', label: 'S' },
                            { value: 'medium', label: 'M' },
                            { value: 'large', label: 'L' },
                        ]}
                        value={data.logo_size || 'medium'}
                        onChange={(val) => updateData({ logo_size: val })}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <RangeSlider 
                        label="Скруглення логотипу"
                        value={data.borderRadius || 0}
                        onChange={(val) => updateData({ borderRadius: val })}
                        min={0}
                        max={50}
                        unit="px"
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <Input 
                        label="Назва сайту (текст)"
                        value={data.site_title}
                        onChange={(e) => updateData({ site_title: e.target.value })}
                        leftIcon={<IconType size={16}/>}
                    />
                </div>

                <ToggleSwitch 
                    checked={data.show_title}
                    onChange={(checked) => updateData({ show_title: checked })}
                    label="Показувати назву поруч з лого"
                />
            </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--platform-text-secondary)', lineHeight: '1.4', display: 'flex', gap: '8px' }}>
                            <IconAlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--platform-accent)' }} />
                            <span>Логотип і назву сайту синхронізовано глобальними налаштуваннями.</span>
                        </div>
            <div>
                <SectionTitle icon={<IconLayout size={18}/>}>Розміщення</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Вирівнювання меню</label>
                    <ToggleGroup 
                        options={[
                            { value: 'left', label: <IconAlignLeft size={18}/> },
                            { value: 'center', label: <IconAlignCenter size={18}/> },
                            { value: 'right', label: <IconAlignRight size={18}/> },
                        ]}
                        value={data.nav_alignment || 'right'}
                        onChange={(val) => updateData({ nav_alignment: val })}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Стиль посилань</label>
                    <ToggleGroup 
                        options={[
                            { value: 'text', label: 'Текст' },
                            { value: 'button', label: 'Кнопки' },
                        ]}
                        value={data.nav_style || 'text'}
                        onChange={(val) => updateData({ nav_style: val })}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<IconList size={18}/>}>Пункти меню</SectionTitle>
                
                <div style={{ 
                    marginBottom: '12px', padding: '8px', 
                    background: 'rgba(66, 153, 225, 0.1)', color: 'var(--platform-accent)', 
                    borderRadius: '6px', fontSize: '0.8rem', lineHeight: '1.4'
                }}>
                    <strong>Формат посилань:</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                        <li><code>/page</code> - внутрішня сторінка</li>
                        <li><code>#blockId</code> - якір (скрол до блоку)</li>
                    </ul>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {data.nav_items && data.nav_items.map((item) => (
                        <div key={item.id} style={navItemStyle}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Input 
                                    value={item.label} 
                                    onChange={(e) => handleNavItemChange(item.id, 'label', e.target.value)}
                                    placeholder="Назва"
                                    leftIcon={<IconEdit size={14}/>}
                                    style={{fontSize: '0.9rem', padding: '8px 8px 8px 36px'}}
                                />
                                <Input 
                                    value={item.link} 
                                    onChange={(e) => handleNavItemChange(item.id, 'link', e.target.value)}
                                    placeholder="/page"
                                    leftIcon={<IconLink size={14}/>}
                                    style={{fontSize: '0.85rem', padding: '8px 8px 8px 36px', fontFamily: 'monospace'}}
                                />
                            </div>
                            <Button 
                                variant="danger"
                                size="sm"
                                onClick={() => requestDelete(item.id)}
                                title="Видалити"
                                style={{ height: 'auto', padding: '6px' }}
                            >
                                <IconTrash size={16} />
                            </Button>
                        </div>
                    ))}
                </div>

                <Button 
                    variant="outline"
                    onClick={addNavItem}
                    style={{ 
                        width: '100%', 
                        marginTop: '8px',
                        borderColor: 'var(--platform-accent)', 
                        color: 'var(--platform-accent)'
                    }}
                    icon={<IconPlus size={16} />}
                >
                    Додати пункт меню
                </Button>
            </div>
        </div>
    );
};

export default HeaderSettings;