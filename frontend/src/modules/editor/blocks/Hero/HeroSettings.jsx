// frontend/src/modules/editor/blocks/Hero/HeroSettings.jsx
import React, { useState, useEffect } from 'react';
import ImageInput from '../../../media/components/ImageInput';
import MediaInput from '../../../media/components/MediaInput';
import { FONT_LIBRARY } from '../../core/editorConfig';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { commonStyles, ToggleGroup, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import { 
    Image, 
    Video, 
    AlignLeft, 
    AlignCenter, 
    AlignRight, 
    Moon, 
    Sun, 
    Maximize, 
    Type, 
    Palette, 
    MousePointerClick, 
    Check 
} from 'lucide-react';

const isLightColor = (color) => {
    if (!color || color === 'transparent') return true;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
};

const OVERLAY_PRESETS = [
    { id: 'transparent', name: 'Без заливки', isNone: true },
    { id: '#000000', name: 'Чорний' },
    { id: '#ffffff', name: 'Білий' },
    { id: '#1a202c', name: 'Темний' },
    { id: '#2c5282', name: 'Синій' },
    { id: '#276749', name: 'Зелений' },
    { id: '#742a2a', name: 'Червоний' },
];

const HeroSettings = ({ data, onChange }) => {
    
    const safeData = {
        bg_type: data.bg_type || 'image',
        bg_image: data.bg_image || data.imageUrl || '',
        bg_video: data.bg_video || '',
        overlay_color: data.overlay_color || '#000000', 
        title: data.title || '',
        subtitle: data.subtitle || '',
        button_text: data.button_text || data.buttonText || '',
        button_link: data.button_link || data.buttonLink || '',
        alignment: data.alignment || 'center',
        height: data.height || 'medium',
        fontFamily: data.fontFamily || 'global',
        theme_mode: data.theme_mode || 'auto',
        overlay_opacity: (data.overlay_opacity !== undefined && !isNaN(data.overlay_opacity)) ? parseFloat(data.overlay_opacity) : 0.5,
        ...data
    };
    
    const [localTitle, setLocalTitle] = useState(safeData.title);
    const [localSubtitle, setLocalSubtitle] = useState(safeData.subtitle);

    useEffect(() => {
        setLocalTitle(safeData.title);
        setLocalSubtitle(safeData.subtitle);
    }, [safeData.title, safeData.subtitle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...safeData, [name]: value }, true);
    };
    const sliderValue = Math.round((1 - safeData.overlay_opacity) * 100);
    const handleTransparencyChange = (newValue) => {
        const transparency = parseFloat(newValue); 
        const opacity = 1 - (transparency / 100);
        onChange({ ...safeData, overlay_opacity: opacity }, false); 
    };
    
    const handleColorChange = (colorValue) => {
        onChange({ ...safeData, overlay_color: colorValue }, true);
    };

    const handleTitleChange = (e) => {
        setLocalTitle(e.target.value);
        onChange({ ...safeData, title: e.target.value }, false);
    };

    const handleTitleBlur = () => {
        onChange({ ...safeData, title: localTitle }, true);
    };

    const handleSubtitleChange = (e) => {
        setLocalSubtitle(e.target.value);
        onChange({ ...safeData, subtitle: e.target.value }, false);
    };

    const handleSubtitleBlur = () => {
        onChange({ ...safeData, subtitle: localSubtitle }, true);
    };

    const handleImageChange = (e) => {
        let finalUrl = '';
        if (e && e.target && typeof e.target.value === 'string') {
            finalUrl = e.target.value;
        } else if (typeof e === 'string') {
            finalUrl = e;
        } else if (e && typeof e === 'object') {
            finalUrl = e.url || e.src || '';
        }
        const relativeUrl = finalUrl.replace(/^http:\/\/localhost:5000/, '');
        onChange({ ...safeData, bg_image: relativeUrl }, true);
    };

    const handleVideoChange = (newUrl) => {
        const urlStr = typeof newUrl === 'string' ? newUrl : '';
        const relativeUrl = urlStr.replace(/^http:\/\/localhost:5000/, '');
        onChange({ ...safeData, bg_video: relativeUrl }, true);
    };

    const handleAlignmentChange = (alignment) => {
        onChange({ ...safeData, alignment }, true);
    };

    const handleChangeDirect = (name, value) => {
        onChange({ ...safeData, [name]: value }, true);
    };
    
    const heightOptions = [
        { value: 'small', label: 'Маленька (300px)' },
        { value: 'medium', label: 'Середня (500px)' },
        { value: 'large', label: 'Велика (700px)' },
        { value: 'full', label: 'На весь екран' },
    ];

    const bgTypeOptions = [
        { value: 'image', label: <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Image size={16}/> Фото</div> },
        { value: 'video', label: <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Video size={16}/> Відео</div> }
    ];

    const themeOptions = [
        { value: 'auto', label: 'Авто', title: 'Як на сайті' },
        { value: 'light', label: <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Sun size={16}/> Світла</div>, title: 'Темний текст на світлому' },
        { value: 'dark', label: <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Moon size={16}/> Темна</div>, title: 'Світлий текст на темному' },
    ];

    const alignOptions = [
        { value: 'left', label: <AlignLeft size={18} /> },
        { value: 'center', label: <AlignCenter size={18} /> },
        { value: 'right', label: <AlignRight size={18} /> },
    ];

    const isPreset = OVERLAY_PRESETS.some(p => p.id === safeData.overlay_color);
    const isTransparent = safeData.overlay_color === 'transparent';

    return (
        <div> 
            <div style={{ marginBottom: '2rem' }}>
                <SectionTitle icon={<Palette size={18}/>}>Фон блоку</SectionTitle>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Тип фону</label>
                    <ToggleGroup 
                        options={bgTypeOptions}
                        value={safeData.bg_type}
                        onChange={(val) => handleChangeDirect('bg_type', val)}
                    />
                </div>

                {safeData.bg_type === 'image' && (
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Зображення</label>
                        <div style={{height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--platform-border-color)'}}>
                            <ImageInput 
                                value={safeData.bg_image}
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                )}

                {safeData.bg_type === 'video' && (
                    <>
                        <div style={commonStyles.formGroup}>
                            <label style={commonStyles.label}>Відео файл (MP4/WebM)</label>
                            <div style={{height: '150px', marginBottom: '8px'}}>
                                <MediaInput 
                                    type="video"
                                    value={safeData.bg_video}
                                    onChange={handleVideoChange}
                                    placeholder="Завантажити відео"
                                />
                            </div>
                            <small style={{display:'block', color:'var(--platform-text-secondary)', fontSize: '0.75rem', lineHeight: '1.4'}}>
                                Рекомендовано: короткі зациклені відео до 15МБ.
                            </small>
                        </div>

                        <div style={commonStyles.formGroup}>
                            <label style={commonStyles.label}>Постер (заставка)</label>
                            <div style={{height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--platform-border-color)'}}>
                                <ImageInput 
                                    value={safeData.bg_image}
                                    onChange={handleImageChange}
                                />
                            </div>
                            <small style={{display:'block', marginTop: '4px', color:'var(--platform-text-secondary)', fontSize: '0.75rem'}}>
                                Показується, поки відео завантажується або на мобільних.
                            </small>
                        </div>
                    </>
                )}

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Тема тексту (Контраст)</label>
                    <ToggleGroup 
                        options={themeOptions}
                        value={safeData.theme_mode}
                        onChange={(val) => handleChangeDirect('theme_mode', val)}
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                        Оберіть "Темна", якщо фон темний (текст стане білим).
                    </small>
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Колір накладання</label>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {OVERLAY_PRESETS.map(preset => (
                            <button 
                                key={preset.id}
                                onClick={() => handleColorChange(preset.id)}
                                title={preset.name}
                                style={{
                                    width: '36px', height: '36px', 
                                    borderRadius: '8px', 
                                    background: preset.isNone ? 'transparent' : preset.id,
                                    backgroundImage: preset.isNone ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                                    backgroundSize: preset.isNone ? '8px 8px' : 'auto',
                                    backgroundPosition: preset.isNone ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'center',
                                    
                                    border: safeData.overlay_color === preset.id 
                                        ? `2px solid var(--platform-text-primary)` 
                                        : '1px solid var(--platform-border-color)',
                                    cursor: 'pointer', 
                                    transition: 'transform 0.1s ease',
                                    transform: safeData.overlay_color === preset.id ? 'scale(1.1)' : 'scale(1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    position: 'relative'
                                }}
                            >
                                {safeData.overlay_color === preset.id && (
                                    <Check size={14} style={{ color: (preset.isNone || isLightColor(preset.id)) ? 'black' : 'white' }} />
                                )}
                                {preset.isNone && safeData.overlay_color !== preset.id && (
                                    <div style={{width: '2px', height: '100%', background: '#ff4444', transform: 'rotate(45deg)'}}></div>
                                )}
                            </button>
                        ))}

                        <label 
                            style={{
                                width: '36px', height: '36px', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                border: (!isPreset && !isTransparent) ? `2px solid var(--platform-text-primary)` : '1px dashed var(--platform-border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: (!isPreset && !isTransparent) ? safeData.overlay_color : 'transparent',
                                transition: 'all 0.2s ease',
                                transform: (!isPreset && !isTransparent) ? 'scale(1.1)' : 'scale(1)',
                                position: 'relative',
                                color: 'var(--platform-text-secondary)'
                            }}
                            title="Власний колір"
                        >
                            <input 
                                type="color" 
                                value={(!isTransparent && safeData.overlay_color.length === 7) ? safeData.overlay_color : '#000000'}
                                onChange={(e) => handleColorChange(e.target.value)} 
                                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', top:0, left:0 }}
                            />
                            {(!isPreset && !isTransparent) ? (
                                <span style={{ fontSize: '14px', lineHeight: 1, color: isLightColor(safeData.overlay_color) ? 'black' : 'white' }}>✎</span>
                            ) : (
                                <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
                            )}
                        </label>
                    </div>
                </div>

                <div style={{
                    ...commonStyles.formGroup, 
                    opacity: isTransparent ? 0.5 : 1, 
                    pointerEvents: isTransparent ? 'none' : 'auto',
                    transition: 'opacity 0.2s'
                }}>
                    <label style={{...commonStyles.label, display: 'flex', justifyContent: 'space-between'}}>
                        <span>Прозорість заливки</span>
                        <span style={{color: 'var(--platform-accent)'}}>{sliderValue}%</span>
                    </label>
                    <RangeSlider 
                        value={sliderValue}
                        onChange={handleTransparencyChange} 
                        min={0}
                        max={100}
                        step={5}
                        unit="%"
                    />
                </div>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Висота блоку</label>
                    <CustomSelect 
                        name="height" 
                        value={safeData.height} 
                        onChange={handleChange} 
                        options={heightOptions}
                        leftIcon={<Maximize size={16}/>}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <SectionTitle icon={<Type size={18}/>}>Вміст</SectionTitle>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Шрифт</label>
                    <CustomSelect
                        name="fontFamily"
                        value={safeData.fontFamily}
                        onChange={handleChange}
                        options={FONT_LIBRARY}
                    />
                </div>
                
                <div style={commonStyles.formGroup}>
                    <Input 
                        label="Заголовок"
                        type="text" 
                        name="title" 
                        value={localTitle}
                        onChange={handleTitleChange} 
                        onBlur={handleTitleBlur}
                        placeholder="Головний заголовок"
                    />
                </div>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Підзаголовок</label>
                    <textarea 
                        name="subtitle" 
                        className="custom-scrollbar"
                        value={localSubtitle}
                        onChange={handleSubtitleChange} 
                        onBlur={handleSubtitleBlur}
                        placeholder="Короткий опис або слоган"
                        style={{
                            ...commonStyles.textarea, 
                            height: '100px',
                            minHeight: '80px',
                            maxHeight: '200px',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            overflowY: 'auto'
                        }}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Вирівнювання тексту</label>
                    <ToggleGroup 
                        options={alignOptions}
                        value={safeData.alignment}
                        onChange={handleAlignmentChange}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<MousePointerClick size={18}/>}>Кнопка дії</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <Input 
                        label="Текст кнопки"
                        type="text" 
                        name="button_text" 
                        value={safeData.button_text}
                        onChange={handleChange}
                        placeholder="Наприклад: Детальніше"
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        Залиште порожнім, щоб приховати кнопку.
                    </small>
                </div>
                
                {safeData.button_text && (
                    <div style={commonStyles.formGroup}>
                        <Input 
                            label="Посилання"
                            type="text" 
                            name="button_link" 
                            value={safeData.button_link}
                            onChange={handleChange}
                            placeholder="/catalog або https://..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroSettings;