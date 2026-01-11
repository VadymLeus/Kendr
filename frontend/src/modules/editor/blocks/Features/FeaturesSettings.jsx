// frontend/src/modules/editor/blocks/Features/FeaturesSettings.jsx
import React, { useState } from 'react';
import { generateBlockId } from '../../core/editorConfig';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import { commonStyles, SectionTitle, ToggleGroup, ToggleSwitch } from '../../controls/SettingsUI';
import { 
    List, Grid, AlignLeft, AlignCenter, AlignRight, Trash2, Plus, 
    Star, Zap, Shield, Truck, Gift, Clock, Phone, Settings, 
    User, Globe, Heart, ShoppingBag, Check 
} from 'lucide-react';

const itemWrapperStyle = {
    border: '1px solid var(--platform-border-color)', 
    borderRadius: '8px',
    marginBottom: '0.75rem', 
    background: 'var(--platform-card-bg)', 
    overflow: 'hidden',
    transition: 'border-color 0.2s ease'
};

const itemHeaderStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 1rem', cursor: 'pointer', background: 'var(--platform-bg)',
    borderBottom: '1px solid transparent',
    transition: 'background 0.2s'
};

const FeaturesSettings = ({ data, onChange }) => {
    const [openIndex, setOpenIndex] = useState(null);
    const { confirm } = useConfirm();
    const normalizedData = {
        title: data.title || 'Наші переваги',
        items: data.items || [],
        columns: data.columns || 2,
        layout: data.layout || 'cards',
        align: data.align || 'center',
        borderRadius: data.borderRadius || '8px',
        showIconBackground: data.showIconBackground || false
    };

    const updateData = (updates) => onChange({ ...normalizedData, ...updates });

    const iconOptions = [
        { key: 'star', icon: <Star size={20} /> },
        { key: 'zap', icon: <Zap size={20} /> },
        { key: 'shield', icon: <Shield size={20} /> },
        { key: 'truck', icon: <Truck size={20} /> },
        { key: 'gift', icon: <Gift size={20} /> },
        { key: 'clock', icon: <Clock size={20} /> },
        { key: 'phone', icon: <Phone size={20} /> },
        { key: 'settings', icon: <Settings size={20} /> },
        { key: 'user', icon: <User size={20} /> },
        { key: 'globe', icon: <Globe size={20} /> },
        { key: 'heart', icon: <Heart size={20} /> },
        { key: 'shop', icon: <ShoppingBag size={20} /> },
    ];

    const handleFeatureChange = (index, field, value) => {
        const newItems = normalizedData.items.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        );
        updateData({ items: newItems });
    };

    const handleAddFeature = () => {
        if (normalizedData.items.length >= 8) {
            return;
        }
        const newItem = { 
            id: generateBlockId(), 
            icon: 'star', 
            title: 'Перевага', 
            text: 'Опис переваги' 
        };
        updateData({ items: [...normalizedData.items, newItem] });
        setOpenIndex(normalizedData.items.length); 
    };

    const handleRemoveFeature = async (e, index) => {
        e.stopPropagation(); 
        const isConfirmed = await confirm({
            title: "Видалити елемент?",
            message: `Видалити "${normalizedData.items[index].title}"?`,
            type: "danger",
            confirmLabel: "Видалити"
        });

        if (isConfirmed) {
            updateData({ items: normalizedData.items.filter((_, i) => i !== index) });
            setOpenIndex(null);
        }
    };

    const getIconComponent = (key) => {
        const option = iconOptions.find(o => o.key === key);
        return option ? option.icon : <Star size={18} />;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
            <style>{`
                .settings-hover-item:hover {
                    border-color: var(--platform-accent) !important;
                }
                
                .settings-hover-btn:hover {
                    border-color: var(--platform-accent) !important;
                    color: var(--platform-accent) !important;
                    background-color: transparent !important;
                }
                
                .icon-grid-btn {
                    width: 100%; 
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    border: 1px solid var(--platform-border-color);
                    background: transparent; 
                    color: var(--platform-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .icon-grid-btn:hover {
                    border-color: var(--platform-accent) !important;
                    color: var(--platform-accent);
                }

                .icon-grid-btn.active {
                    border-color: var(--platform-accent);
                    color: var(--platform-accent);
                    box-shadow: 0 0 0 1px var(--platform-accent);
                }
            `}</style>
            
            <div>
                <SectionTitle icon={<Grid size={16}/>}>Загальні</SectionTitle>
                <Input 
                    label="Заголовок блоку"
                    value={normalizedData.title}
                    onChange={(e) => updateData({ title: e.target.value })}
                    placeholder="Введіть заголовок"
                />
            </div>

            <div>
                <SectionTitle icon={<List size={16}/>}>Макет та Вигляд</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Стиль відображення</label>
                    <ToggleGroup 
                        options={[
                            { value: 'cards', label: 'Картки' },
                            { value: 'minimal', label: 'Мінімалізм' },
                            { value: 'list', label: 'Список' },
                        ]}
                        value={normalizedData.layout}
                        onChange={(val) => updateData({ layout: val })}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Кількість колонок</label>
                    <ToggleGroup 
                        options={[
                            { value: 1, label: '1' },
                            { value: 2, label: '2' },
                            { value: 3, label: '3' },
                            { value: 4, label: '4' },
                        ]}
                        value={normalizedData.columns}
                        onChange={(val) => updateData({ columns: val })}
                    />
                </div>

                {normalizedData.layout !== 'list' && (
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Вирівнювання тексту</label>
                        <ToggleGroup 
                            options={[
                                { value: 'left', label: 'Зліва', icon: <AlignLeft size={14}/> },
                                { value: 'center', label: 'Центр', icon: <AlignCenter size={14}/> },
                                { value: 'right', label: 'Справа', icon: <AlignRight size={14}/> },
                            ]}
                            value={normalizedData.align}
                            onChange={(val) => updateData({ align: val })}
                        />
                    </div>
                )}
            </div>

            <div>
                <SectionTitle icon={<Check size={16}/>}>Стилізація</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <ToggleSwitch 
                        checked={normalizedData.showIconBackground}
                        onChange={(val) => updateData({ showIconBackground: val })}
                        label="Фон для іконок (кружечок)"
                    />
                </div>
            </div>

            <div>
                <SectionTitle>
                    Елементи ({normalizedData.items.length}/8)
                </SectionTitle>
                
                {normalizedData.items.map((item, index) => (
                    <div 
                        key={item.id || index} 
                        style={{
                            ...itemWrapperStyle,
                            borderColor: openIndex === index ? 'var(--platform-accent)' : 'var(--platform-border-color)'
                        }}
                        className="settings-hover-item"
                    >
                        <div 
                            style={itemHeaderStyle} 
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ 
                                    color: 'var(--platform-accent)', 
                                    display: 'flex', 
                                    background: 'var(--platform-card-bg)',
                                    padding: '6px', borderRadius: '6px', border: '1px solid var(--platform-border-color)'
                                }}>
                                    {getIconComponent(item.icon)}
                                </div>
                                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.title}</span>
                            </div>
                            
                            <Button 
                                variant="danger" 
                                size="sm"
                                onClick={(e) => handleRemoveFeature(e, index)} 
                                style={{ width: '28px', height: '28px', opacity: 0.6, padding: 0 }} 
                                title="Видалити"
                            >
                                <Trash2 size={14}/>
                            </Button>
                        </div>

                        {openIndex === index && (
                            <div style={{ padding: '16px', borderTop: '1px solid var(--platform-border-color)' }}>
                                
                                <div style={commonStyles.formGroup}>
                                    <label style={commonStyles.label}>Виберіть іконку</label>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        gap: '8px',
                                        width: '100%' 
                                    }}>
                                        {iconOptions.map(opt => (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                className={`icon-grid-btn ${item.icon === opt.key ? 'active' : ''}`}
                                                onClick={() => handleFeatureChange(index, 'icon', opt.key)}
                                                title={opt.key}
                                            >
                                                {opt.icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Input 
                                    label="Заголовок"
                                    value={item.title}
                                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                    placeholder="Назва переваги"
                                />

                                <div style={commonStyles.formGroup}>
                                    <label style={commonStyles.label}>Опис</label>
                                    <textarea 
                                        value={item.text} 
                                        onChange={(e) => handleFeatureChange(index, 'text', e.target.value)} 
                                        style={{...commonStyles.textarea, minHeight: '80px'}}
                                        className="custom-scrollbar"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <button 
                    type="button" 
                    onClick={handleAddFeature}
                    disabled={normalizedData.items.length >= 8}
                    className="settings-hover-btn"
                    style={{
                        width: '100%', 
                        padding: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: 'transparent', 
                        border: '1px dashed var(--platform-border-color)',
                        borderRadius: '8px',
                        cursor: normalizedData.items.length >= 8 ? 'not-allowed' : 'pointer',
                        color: 'var(--platform-text-secondary)',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        opacity: normalizedData.items.length >= 8 ? 0.5 : 1
                    }}
                >
                    <Plus size={18} />
                    Додати перевагу
                </button>
            </div>
        </div>
    );
};

export default FeaturesSettings;