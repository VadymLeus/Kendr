// frontend/src/modules/editor/ui/components/ButtonEditor.jsx
import React from 'react';
import { commonStyles, ToggleGroup } from '../configuration/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import { Input } from '../../../../shared/ui/elements/Input';
import AlignmentControl from './AlignmentControl'; 
import FontSelector from './FontSelector';
import { Link, ArrowRight, ShoppingCart, Mail, Phone, Check, X,MousePointer2, FlipHorizontal, SquareArrowOutUpRight, Star } from 'lucide-react';

const ButtonEditor = ({ 
    data, 
    onChange, 
    siteData, 
    showAlignment = true, 
    hideLinks = false, 
    hideIcons = false 
}) => {
    
    const themeSettings = siteData?.theme_settings || {};
    const currentSiteFonts = {
        heading: themeSettings.font_heading,
        body: themeSettings.font_body
    };

    const val = (key, def) => (data && data[key] !== undefined ? data[key] : def);

    const handleChange = (name, value) => {
        onChange({ ...data, [name]: value });
    };

    const iconList = [
        { value: 'none', icon: <X size={18} />, label: 'Ні' },
        { value: 'arrowRight', icon: <ArrowRight size={18} />, label: 'Стрілка' },
        { value: 'cart', icon: <ShoppingCart size={18} />, label: 'Кошик' },
        { value: 'mail', icon: <Mail size={18} />, label: 'Пошта' },
        { value: 'phone', icon: <Phone size={18} />, label: 'Дзвінок' },
        { value: 'check', icon: <Check size={18} />, label: 'Ок' },
        { value: 'star', icon: <Star size={18} />, label: 'Зірка' },
        { value: 'pointer', icon: <MousePointer2 size={18} />, label: 'Клік' },
    ];

    const hasIcon = val('icon', 'none') !== 'none';
    
    const dividerStyle = {
        height: '1px',
        backgroundColor: 'var(--platform-border-color)',
        margin: '12px 0',
        opacity: 0.5
    };

    const sectionLabelStyle = {
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--platform-text-secondary)',
        marginBottom: '12px',
        display: 'block'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <span style={sectionLabelStyle}>Текст кнопки</span>
                
                <div style={commonStyles.formGroup}>
                    <Input 
                        value={val('text', 'Кнопка')}
                        onChange={(e) => handleChange('text', e.target.value)}
                        placeholder="Текст кнопки"
                    />
                </div>

                {!hideLinks && (
                    <div style={commonStyles.formGroup}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <Input 
                                    value={val('link', '')}
                                    onChange={(e) => handleChange('link', e.target.value)}
                                    placeholder="https://..."
                                    leftIcon={<Link size={14} />}
                                />
                            </div>
                            <button
                                title="Відкривати у новій вкладці"
                                onClick={() => handleChange('targetBlank', !val('targetBlank', false))}
                                style={{
                                    width: '40px', height: '40px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '8px',
                                    border: '1px solid var(--platform-border-color)',
                                    background: val('targetBlank') ? 'var(--platform-accent-light)' : 'var(--platform-input-bg)',
                                    color: val('targetBlank') ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                <SquareArrowOutUpRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div style={dividerStyle} />

            <div>
                <span style={sectionLabelStyle}>Дизайн</span>

                <div style={commonStyles.formGroup}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <CustomSelect 
                            value={val('styleType', 'primary')}
                            onChange={(e) => handleChange('styleType', e.target.value)}
                            options={[
                                { value: 'primary', label: 'Primary' },
                                { value: 'secondary', label: 'Secondary' },
                            ]}
                        />
                        <CustomSelect 
                            value={val('variant', 'solid')}
                            onChange={(e) => handleChange('variant', e.target.value)}
                            options={[
                                { value: 'solid', label: 'Solid' },
                                { value: 'outline', label: 'Outline' },
                            ]}
                        />
                    </div>
                </div>

                <div style={commonStyles.formGroup}>
                    <ToggleGroup 
                        options={[
                            { value: 'small', label: 'S' },
                            { value: 'medium', label: 'M' },
                            { value: 'large', label: 'L' },
                        ]}
                        value={val('size', 'medium')}
                        onChange={(v) => handleChange('size', v)}
                    />
                </div>

                {showAlignment && val('width') !== 'full' && (
                    <div style={commonStyles.formGroup}>
                         <AlignmentControl 
                            label="Розміщення кнопки"
                            value={val('alignment', 'center')}
                            onChange={(val) => handleChange('alignment', val)}
                        />
                    </div>
                )}

                <div style={commonStyles.formGroup}>
                    <FontSelector 
                        value={val('fontFamily', 'global')}
                        onChange={(val) => handleChange('fontFamily', val)}
                        label="Шрифт"
                        siteFonts={currentSiteFonts}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <RangeSlider 
                        label="Скруглення"
                        value={val('borderRadius', 4)}
                        onChange={(v) => handleChange('borderRadius', v)}
                        min={0}
                        max={30}
                        unit="px"
                    />
                </div>
            </div>

            {!hideIcons && (
                <>
                    <div style={dividerStyle} />
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <span style={sectionLabelStyle}>Іконка</span>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(4, 1fr)', 
                            gap: '8px',
                            width: '100%'
                        }}>
                            {iconList.map((item) => {
                                const isActive = val('icon', 'none') === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => handleChange('icon', item.value)}
                                        title={item.label}
                                        style={{
                                            height: '36px',
                                            borderRadius: '6px',
                                            border: isActive ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
                                            background: isActive ? 'var(--platform-accent-light)' : 'var(--platform-card-bg)',
                                            color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: '100%',
                                        }}
                                    >
                                        {item.icon}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'stretch',
                            gap: '8px',
                            opacity: hasIcon ? 1 : 0.4,
                            pointerEvents: hasIcon ? 'auto' : 'none',
                            transition: 'opacity 0.2s ease',
                            height: '40px',
                            marginTop: '20px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <ToggleGroup 
                                    options={[
                                        { value: 'left', label: 'Зліва' },
                                        { value: 'right', label: 'Справа' }
                                    ]}
                                    value={val('iconPosition', 'right')}
                                    onChange={(v) => handleChange('iconPosition', v)}
                                />
                            </div>
                            
                            <button
                                onClick={() => handleChange('iconFlip', !val('iconFlip', false))}
                                title="Віддзеркалити"
                                style={{
                                    width: '40px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid var(--platform-border-color)',
                                    borderRadius: '8px',
                                    background: val('iconFlip', false) ? 'var(--platform-accent-light)' : 'var(--platform-card-bg)',
                                    color: val('iconFlip', false) ? 'var(--platform-accent)' : 'var(--platform-text-primary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FlipHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ButtonEditor;