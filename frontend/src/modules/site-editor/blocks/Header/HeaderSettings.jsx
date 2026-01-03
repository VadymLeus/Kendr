// frontend/src/modules/site-editor/blocks/Header/HeaderSettings.jsx
import React, { useState } from 'react';
import ImageInput from '../../../media/components/ImageInput';
import { generateBlockId } from '../../core/editorConfig';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../components/common/SettingsUI';
import { Input } from '../../../../common/components/ui/Input';
import { Button } from '../../../../common/components/ui/Button';
import ConfirmModal from '../../../../common/components/ui/ConfirmModal';
import { 
    IconTrash, IconPlus, IconImage, IconType, IconLayout, IconList,
    IconAlignLeft, IconAlignCenter, IconAlignRight, IconLink, IconEdit
} from '../../../../common/components/ui/Icons';

const HeaderSettings = ({ data, onChange }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);

    const updateData = (updates) => onChange({ ...data, ...updates });

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

    const navItemStyle = { 
        display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start',
        background: 'var(--platform-card-bg)', padding: '10px', 
        borderRadius: '8px', border: '1px solid var(--platform-border-color)'
    };

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
                    <label style={commonStyles.label}>Зображення логотипу</label>
                    <div style={{height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--platform-border-color)'}}>
                        <ImageInput 
                            value={data.logo_src} 
                            onChange={(url) => updateData({ logo_src: url })} 
                        />
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