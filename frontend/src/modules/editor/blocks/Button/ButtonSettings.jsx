// frontend/src/modules/editor/blocks/Button/ButtonSettings.jsx
import React from 'react';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../controls/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import { 
    IconType, IconLink, IconImage, IconMaximize, IconStar, 
    IconArrowRight, IconShoppingCart, IconMail, IconPhone, IconCheck, IconX,
    IconMousePointer
} from '../../../../shared/ui/elements/Icons';

const ButtonSettings = ({ data, onChange }) => {

    const normalizedData = {
        text: data.text || 'Кнопка',
        link: data.link || '#',
        styleType: data.styleType || 'primary',
        variant: data.variant || 'solid',
        size: data.size || 'medium',
        width: data.width || 'auto',
        borderRadius: data.borderRadius || '4px',
        withShadow: data.withShadow || false,
        alignment: data.alignment || 'center',
        targetBlank: data.targetBlank || false,
        icon: data.icon || 'none',
        iconPosition: data.iconPosition || 'right'
    };

    const handleChange = (name, value) => {
        onChange({ ...normalizedData, [name]: value });
    };

    const iconList = [
        { value: 'none', icon: <IconX size={18} />, label: 'Ні' },
        { value: 'arrowRight', icon: <IconArrowRight size={18} />, label: 'Стрілка' },
        { value: 'cart', icon: <IconShoppingCart size={18} />, label: 'Кошик' },
        { value: 'mail', icon: <IconMail size={18} />, label: 'Пошта' },
        { value: 'phone', icon: <IconPhone size={18} />, label: 'Дзвінок' },
        { value: 'check', icon: <IconCheck size={18} />, label: 'Ок' },
        { value: 'star', icon: <IconStar size={18} />, label: 'Зірка' },
        { value: 'pointer', icon: <IconMousePointer size={18} />, label: 'Клік' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
                <SectionTitle icon={<IconType size={16}/>}>Текст та Посилання</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Текст на кнопці</label>
                    <input 
                        type="text" 
                        value={normalizedData.text} 
                        onChange={(e) => handleChange('text', e.target.value)} 
                        style={commonStyles.input} 
                        placeholder="Наприклад: Детальніше"
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Посилання</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--platform-text-secondary)' }}>
                            <IconLink size={14} />
                        </div>
                        <input 
                            type="text" 
                            value={normalizedData.link} 
                            onChange={(e) => handleChange('link', e.target.value)} 
                            style={{ ...commonStyles.input, paddingLeft: '30px' }} 
                            placeholder="https:// або /contacts" 
                        />
                    </div>
                    <div style={{ marginTop: '8px' }}>
                        <ToggleSwitch 
                            checked={normalizedData.targetBlank}
                            onChange={(val) => handleChange('targetBlank', val)}
                            label="Відкривати у новій вкладці"
                        />
                    </div>
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Іконка</label>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        {iconList.map((item) => (
                            <button
                                key={item.value}
                                onClick={() => handleChange('icon', item.value)}
                                title={item.label}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '40px',
                                    borderRadius: '8px',
                                    border: normalizedData.icon === item.value 
                                        ? '2px solid var(--platform-accent)' 
                                        : '1px solid var(--platform-border-color)',
                                    background: normalizedData.icon === item.value 
                                        ? 'var(--platform-accent-light, rgba(59, 130, 246, 0.1))' 
                                        : 'var(--platform-card-bg)',
                                    color: normalizedData.icon === item.value 
                                        ? 'var(--platform-accent)' 
                                        : 'var(--platform-text-primary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {item.icon}
                            </button>
                        ))}
                    </div>

                    {normalizedData.icon !== 'none' && (
                        <ToggleGroup 
                            options={[
                                { value: 'left', label: 'Зліва' },
                                { value: 'right', label: 'Справа' }
                            ]}
                            value={normalizedData.iconPosition}
                            onChange={(val) => handleChange('iconPosition', val)}
                        />
                    )}
                </div>
            </div>

            <div>
                <SectionTitle icon={<IconImage size={16}/>}>Дизайн</SectionTitle>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Колір</label>
                    <CustomSelect 
                        value={normalizedData.styleType}
                        onChange={(e) => handleChange('styleType', e.target.value)}
                        options={[
                            { value: 'primary', label: 'Акцентний (Primary)' },
                            { value: 'secondary', label: 'Текст (Theme)' },
                        ]}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Заливка</label>
                    <CustomSelect 
                        value={normalizedData.variant}
                        onChange={(e) => handleChange('variant', e.target.value)}
                        options={[
                            { value: 'solid', label: 'Повна (Solid)' },
                            { value: 'outline', label: 'Лише контур (Outline)' },
                        ]}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Розмір</label>
                    <ToggleGroup 
                        options={[
                            { value: 'small', label: 'S' },
                            { value: 'medium', label: 'M' },
                            { value: 'large', label: 'L' },
                        ]}
                        value={normalizedData.size}
                        onChange={(val) => handleChange('size', val)}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <RangeSlider 
                        label="Скруглення кутів"
                        value={normalizedData.borderRadius}
                        onChange={(val) => handleChange('borderRadius', val)}
                        min={0}
                        max={50}
                        unit="px"
                    />
                </div>

                <div style={commonStyles.formGroup}>
                     <ToggleSwitch 
                        checked={normalizedData.withShadow}
                        onChange={(val) => handleChange('withShadow', val)}
                        label="Тінь під кнопкою"
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<IconMaximize size={16}/>}>Розміщення</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Ширина</label>
                    <ToggleGroup 
                        options={[
                            { value: 'auto', label: 'Авто' },
                            { value: 'full', label: 'Вся ширина' },
                        ]}
                        value={normalizedData.width}
                        onChange={(val) => handleChange('width', val)}
                    />
                </div>

                {normalizedData.width !== 'full' && (
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Вирівнювання</label>
                        <ToggleGroup 
                            options={[
                                { value: 'left', label: 'Зліва' },
                                { value: 'center', label: 'Центр' },
                                { value: 'right', label: 'Справа' },
                            ]}
                            value={normalizedData.alignment}
                            onChange={(val) => handleChange('alignment', val)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ButtonSettings;