// frontend/src/modules/editor/blocks/Video/VideoSettings.jsx
import React from 'react';
import MediaInput from '../../../media/components/MediaInput';
import { commonStyles, SectionTitle, ToggleSwitch } from '../../controls/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import { 
    IconVideo, 
    IconPalette, 
    IconCheck,
    IconMaximize,
    IconSettings,
    IconPlay,
    IconVolumeX,
    IconRepeat
} from '../../../../shared/ui/elements/Icons';

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

const VideoSettings = ({ data, onChange }) => {
    
    const safeData = {
        url: data.url || '',
        overlay_color: data.overlay_color || '#000000', 
        overlay_opacity: (data.overlay_opacity !== undefined && !isNaN(data.overlay_opacity)) ? parseFloat(data.overlay_opacity) : 0.5,
        height: data.height || 'medium',
        autoplay: data.autoplay !== undefined ? data.autoplay : true,
        muted: data.muted !== undefined ? data.muted : true,
        loop: data.loop !== undefined ? data.loop : true,
        controls: data.controls !== undefined ? data.controls : false,
        
        ...data
    };

    const updateData = (updates) => onChange({ ...safeData, ...updates }, true);
    const sliderValue = Math.round((1 - safeData.overlay_opacity) * 100);
    const handleTransparencyChange = (newValue) => {
        const transparency = parseFloat(newValue); 
        const opacity = 1 - (transparency / 100);
        onChange({ ...safeData, overlay_opacity: opacity }, false); 
    };
    
    const handleColorChange = (colorValue) => {
        onChange({ ...safeData, overlay_color: colorValue }, true);
    };

    const handleVideoChange = (newUrl) => {
        const urlStr = typeof newUrl === 'string' ? newUrl : '';
        const relativeUrl = urlStr.replace(/^http:\/\/localhost:5000/, '');
        updateData({ url: relativeUrl });
    };

    const heightOptions = [
        { value: 'small', label: 'Маленька (300px)' },
        { value: 'medium', label: 'Середня (500px)' },
        { value: 'large', label: 'Велика (700px)' },
        { value: 'full', label: 'На весь екран' },
    ];

    const isPreset = OVERLAY_PRESETS.some(p => p.id === safeData.overlay_color);
    const isTransparent = safeData.overlay_color === 'transparent';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <SectionTitle icon={<IconVideo size={18}/>}>Відео контент</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Відео файл</label>
                    <div style={{height: '150px', marginBottom: '8px'}}>
                        <MediaInput 
                            type="video"
                            value={safeData.url}
                            onChange={handleVideoChange}
                            placeholder="Завантажити відео"
                        />
                    </div>
                </div>
            </div>

            <div>
                <SectionTitle icon={<IconSettings size={18}/>}>Поведінка плеєра</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <ToggleSwitch 
                        checked={safeData.autoplay}
                        onChange={(val) => updateData({ autoplay: val, muted: val ? true : safeData.muted })}
                        label="Автоплей (Autoplay)"
                        icon={<IconPlay size={16}/>}
                    />
                    {safeData.autoplay && (
                        <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.75rem', marginTop: '-8px', marginLeft: '34px' }}>
                            Більшість браузерів вимагають "Без звуку" для автоплею.
                        </small>
                    )}

                    <ToggleSwitch 
                        checked={safeData.muted}
                        onChange={(val) => updateData({ muted: val })}
                        label="Без звуку (Muted)"
                        icon={<IconVolumeX size={16}/>}
                    />

                    <ToggleSwitch 
                        checked={safeData.loop}
                        onChange={(val) => updateData({ loop: val })}
                        label="Зациклити (Loop)"
                        icon={<IconRepeat size={16}/>}
                    />

                    <ToggleSwitch 
                        checked={safeData.controls}
                        onChange={(val) => updateData({ controls: val })}
                        label="Показувати елементи керування"
                        icon={<IconSettings size={16}/>}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<IconPalette size={18}/>}>Вигляд та Фон</SectionTitle>

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
                                    transform: safeData.overlay_color === preset.id ? 'scale(1.1)' : 'scale(1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                                    position: 'relative'
                                }}
                            >
                                {safeData.overlay_color === preset.id && (
                                    <IconCheck size={14} style={{ color: (preset.isNone || isLightColor(preset.id)) ? 'black' : 'white' }} />
                                )}
                            </button>
                        ))}
                        
                        <label style={{
                            width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer',
                            border: (!isPreset && !isTransparent) ? `2px solid var(--platform-text-primary)` : '1px dashed var(--platform-border-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: (!isPreset && !isTransparent) ? safeData.overlay_color : 'transparent',
                            transform: (!isPreset && !isTransparent) ? 'scale(1.1)' : 'scale(1)',
                            position: 'relative'
                        }}>
                            <input 
                                type="color" 
                                value={(!isTransparent && safeData.overlay_color.length === 7) ? safeData.overlay_color : '#000000'}
                                onChange={(e) => handleColorChange(e.target.value)} 
                                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', top:0, left:0 }}
                            />
                            <span style={{ fontSize: '14px', lineHeight: 1, color: isLightColor(safeData.overlay_color) ? 'black' : 'white' }}>✎</span>
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
                        min={0} max={100} step={5} unit="%"
                    />
                </div>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Висота блоку</label>
                    <CustomSelect 
                        name="height" 
                        value={safeData.height} 
                        onChange={(e) => updateData({ height: e.target.value })} 
                        options={heightOptions}
                        leftIcon={<IconMaximize size={16}/>}
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoSettings;