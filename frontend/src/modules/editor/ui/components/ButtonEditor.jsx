// frontend/src/modules/editor/ui/components/ButtonEditor.jsx
import React from 'react';
import { ToggleGroup } from '../configuration/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import { Input } from '../../../../shared/ui/elements/Input';
import AlignmentControl from './AlignmentControl'; 
import FontSelector from './FontSelector';
import { Link, ArrowRight, ShoppingCart, Mail, Phone, Check, X, MousePointer2, FlipHorizontal, SquareArrowOutUpRight, Star } from 'lucide-react';

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
    const activeBtnStyle = {
        borderColor: 'var(--platform-accent)',
        backgroundColor: 'color-mix(in srgb, var(--platform-accent), transparent 90%)',
        color: 'var(--platform-accent)'
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-(--platform-text-secondary) mb-3 block">Текст кнопки</span>
                <div className="form-group">
                    <Input 
                        value={val('text', 'Кнопка')}
                        onChange={(e) => handleChange('text', e.target.value)}
                        placeholder="Текст кнопки"
                    />
                </div>
                {!hideLinks && (
                    <div className="form-group">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
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
                                className={`btn btn-icon-square ${!val('targetBlank') ? 'btn-outline' : ''}`}
                                style={val('targetBlank') ? activeBtnStyle : {}}
                            >
                                <SquareArrowOutUpRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="h-px bg-(--platform-border-color) opacity-50 my-1" />
            <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-(--platform-text-secondary) mb-3 block">Дизайн</span>
                <div className="form-group">
                    <div className="grid grid-cols-2 gap-2">
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

                <div className="form-group">
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
                    <div className="form-group">
                         <AlignmentControl 
                            label="Розміщення кнопки"
                            value={val('alignment', 'center')}
                            onChange={(val) => handleChange('alignment', val)}
                        />
                    </div>
                )}

                <div className="form-group">
                    <FontSelector 
                        value={val('fontFamily', 'global')}
                        onChange={(val) => handleChange('fontFamily', val)}
                        label="Шрифт"
                        siteFonts={currentSiteFonts}
                    />
                </div>

                <div className="form-group">
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
                    <div className="h-px bg-(--platform-border-color) opacity-50 my-1" />
                    <div className="flex flex-col w-full">
                        <span className="text-xs font-semibold uppercase tracking-wide text-(--platform-text-secondary) mb-3 block">Іконка</span>
                        <div className="grid grid-cols-4 gap-2 w-full">
                            {iconList.map((item) => {
                                const isActive = val('icon', 'none') === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => handleChange('icon', item.value)}
                                        title={item.label}
                                        className={`btn btn-icon-square w-full ${!isActive ? 'btn-outline' : ''}`}
                                        style={isActive ? activeBtnStyle : {}}
                                    >
                                        {item.icon}
                                    </button>
                                );
                            })}
                        </div>

                        <div 
                            className="flex items-stretch gap-2 mt-5 transition-opacity duration-200"
                            style={{
                                opacity: hasIcon ? 1 : 0.4,
                                pointerEvents: hasIcon ? 'auto' : 'none'
                            }}
                        >
                            <div className="flex-1">
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
                                className={`btn btn-icon-square ${!val('iconFlip') ? 'btn-outline' : ''}`}
                                style={val('iconFlip') ? activeBtnStyle : {}}
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