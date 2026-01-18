// frontend/src/modules/editor/blocks/Header/HeaderSettings.jsx
import React, { useState } from 'react';
import { generateBlockId } from '../../core/editorConfig';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import ConfirmModal from '../../../../shared/ui/complex/ConfirmModal';
import AlignmentControl from '../../ui/components/AlignmentControl';
import ButtonEditor from '../../ui/components/ButtonEditor';
import FontSelector from '../../ui/components/FontSelector';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput';
import { Trash2, Plus, Image, Type, LayoutTemplate, List, Link, Pencil, AlertCircle, Upload } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const HeaderSettings = ({ data, onChange, siteData }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const MAX_NAV_ITEMS = 5;
    const navItemsCount = (data.nav_items || []).length;
    const isLimitReached = navItemsCount >= MAX_NAV_ITEMS;
    const updateData = (updates) => onChange({ ...data, ...updates });
    const handleNavItemChange = (id, field, value) => {
        const newItems = data.nav_items.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        updateData({ nav_items: newItems });
    };

    const addNavItem = () => {
        if (isLimitReached) return;
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

    const getLogoUrl = (src) => {
        if (!src) return '';
        if (src.startsWith('http')) return src;
        return `${API_URL}${src}`;
    };

    const navItemStyle = { 
        display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start',
        background: 'var(--platform-card-bg)', padding: '10px', 
        borderRadius: '8px', border: '1px solid var(--platform-border-color)'
    };

    const currentLogoRadius = data.logo_radius !== undefined ? data.logo_radius : (data.borderRadius || 0);
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
                <SectionTitle icon={<Image size={18}/>}>Логотип та Назва</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Центральний логотип</label>
                    <div style={{ 
                        background: 'var(--platform-bg)', 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--platform-border-color)' 
                    }}>
                        <div style={{ width: '100%', height: '200px' }}>
                            <UniversalMediaInput 
                                type="image"
                                value={data.logo_src} 
                                onChange={handleLogoChange} 
                                aspect={1}
                                triggerStyle={{ width: '100%', height: '100%', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                            >
                                <div 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        position: 'relative',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        backgroundColor: 'var(--platform-card-bg)',
                                        border: '1px dashed var(--platform-border-color)'
                                    }}
                                    onMouseEnter={() => setIsLogoHovered(true)}
                                    onMouseLeave={() => setIsLogoHovered(false)}
                                >
                                    {data.logo_src ? (
                                        <>
                                            <img 
                                                src={getLogoUrl(data.logo_src)} 
                                                alt="Logo" 
                                                style={{ 
                                                    maxWidth: '80%', 
                                                    maxHeight: '80%', 
                                                    objectFit: 'contain',
                                                    borderRadius: `${currentLogoRadius}px`,
                                                    transition: 'all 0.2s'
                                                }} 
                                            />
                                            <div style={{
                                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                opacity: isLogoHovered ? 1 : 0, transition: 'opacity 0.2s',
                                                backdropFilter: 'blur(2px)'
                                            }}>
                                                <div style={{ color: 'white', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
                                                    <Upload size={18} /> Змінити
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleLogoChange(''); }}
                                                    style={{
                                                        position: 'absolute', top: '8px', right: '8px',
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        background: 'rgba(0,0,0,0.5)', color: 'white',
                                                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                    title="Видалити"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--platform-text-secondary)', opacity: 0.6 }}>
                                            <Image size={32} />
                                            <span style={{ fontSize: '0.9rem' }}>Завантажити лого</span>
                                        </div>
                                    )}
                                </div>
                            </UniversalMediaInput>
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
                        value={currentLogoRadius}
                        onChange={(val) => updateData({ logo_radius: val })}
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
                        leftIcon={<Type size={16}/>}
                    />
                </div>

                <ToggleSwitch 
                    checked={data.show_title}
                    onChange={(checked) => updateData({ show_title: checked })}
                    label="Показувати назву поруч з лого"
                />
            </div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--platform-text-secondary)', lineHeight: '1.4', display: 'flex', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--platform-accent)' }} />
                <span>Логотип і назву сайту синхронізовано глобальними налаштуваннями.</span>
            </div>

            <div>
                <SectionTitle icon={<LayoutTemplate size={18}/>}>Розміщення та Стиль</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <AlignmentControl 
                        label="Вирівнювання меню"
                        value={data.nav_alignment || 'right'}
                        onChange={(val) => updateData({ nav_alignment: val })}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Тип відображення</label>
                    <ToggleGroup 
                        options={[
                            { value: 'text', label: 'Текст' },
                            { value: 'button', label: 'Кнопки' },
                        ]}
                        value={data.nav_style || 'text'}
                        onChange={(val) => updateData({ nav_style: val })}
                    />
                </div>

                {data.nav_style === 'button' ? (
                    <div style={{ 
                        marginTop: '16px', 
                        padding: '16px', 
                        background: 'var(--platform-bg)', 
                        borderRadius: '8px',
                        border: '1px solid var(--platform-border-color)'
                    }}>
                        <div style={{ marginBottom: '12px', fontWeight: '600', fontSize: '0.9rem' }}>Стиль кнопок меню</div>
                        <ButtonEditor 
                            data={data.buttonSettings || {}}
                            onChange={(val) => updateData({ buttonSettings: val })}
                            siteData={siteData}
                            showAlignment={false} 
                            hideLinks={true}      
                            hideIcons={true}
                        />
                    </div>
                ) : (
                    <div style={commonStyles.formGroup}>
                        <FontSelector 
                            label="Шрифт меню"
                            value={data.nav_fontFamily}
                            onChange={(val) => updateData({ nav_fontFamily: val })}
                            siteFonts={siteData?.theme_settings}
                        />
                    </div>
                )}
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <SectionTitle icon={<List size={18}/>} style={{marginBottom: 0}}>Пункти меню</SectionTitle>
                    <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '600', 
                        color: isLimitReached ? 'var(--platform-danger)' : 'var(--platform-text-secondary)',
                        background: isLimitReached ? 'rgba(var(--platform-danger-rgb), 0.1)' : 'var(--platform-bg)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        {navItemsCount} / {MAX_NAV_ITEMS}
                    </span>
                </div>
                
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
                                    leftIcon={<Pencil size={14}/>}
                                    style={{fontSize: '0.9rem', padding: '8px 8px 8px 36px'}}
                                />
                                <Input 
                                    value={item.link} 
                                    onChange={(e) => handleNavItemChange(item.id, 'link', e.target.value)}
                                    placeholder="/page"
                                    leftIcon={<Link size={14}/>}
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
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    ))}
                </div>

                <Button 
                    variant="outline"
                    onClick={addNavItem}
                    disabled={isLimitReached}
                    style={{ 
                        width: '100%', 
                        marginTop: '8px',
                        borderColor: isLimitReached ? 'var(--platform-border-color)' : 'var(--platform-accent)', 
                        color: isLimitReached ? 'var(--platform-text-secondary)' : 'var(--platform-accent)',
                        opacity: isLimitReached ? 0.6 : 1,
                        cursor: isLimitReached ? 'not-allowed' : 'pointer'
                    }}
                    icon={<Plus size={16} />}
                >
                    {isLimitReached ? 'Ліміт досягнуто' : 'Додати пункт меню'}
                </Button>
            </div>
        </div>
    );
};

export default HeaderSettings;