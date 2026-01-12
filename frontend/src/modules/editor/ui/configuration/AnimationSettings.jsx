// frontend/src/modules/editor/ui/configuration/AnimationSettings.jsx
import React, { useState, useEffect } from 'react';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import { Switch } from '../../../../shared/ui/elements/Switch';
import { Play, Clock, Hourglass, Repeat } from 'lucide-react';

const AnimationSettings = ({ animationConfig, onChange }) => {
    const defaultConfig = {
        type: 'none',
        duration: 0.6,
        delay: 0,
        repeat: false
    };

    const [config, setConfig] = useState({ ...defaultConfig, ...animationConfig });

    useEffect(() => {
        setConfig({ ...defaultConfig, ...animationConfig });
    }, [animationConfig]);

    const handleChange = (field, value) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        onChange(newConfig);
    };

    const handleTimeChange = (field, valStr) => {
        const ms = parseInt(valStr, 10);
        const seconds = ms / 1000;
        handleChange(field, seconds);
    };

    const animationOptions = [
        { value: "none", label: "Без анімації" },
        { value: "fadeIn", label: "Поява (Fade In)" },
        { value: "fadeUp", label: "Знизу вгору (Fade Up)" },
        { value: "fadeDown", label: "Зверху вниз (Fade Down)" },
        { value: "fadeLeft", label: "Зліва направо (Fade Left)" },
        { value: "fadeRight", label: "Справа наліво (Fade Right)" },
        { value: "zoomIn", label: "Масштабування (Zoom In)" }
    ];

    const labelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--platform-text-primary)',
        marginBottom: '8px'
    };

    const subLabelStyle = {
        ...labelStyle,
        fontSize: '0.8rem', 
        color: 'var(--platform-text-secondary)',
        marginBottom: '4px'
    };

    return (
        <div>
            <div style={{ marginBottom: config.type !== 'none' ? '20px' : '0' }}>
                <label style={labelStyle}>
                    <Play size={16} style={{ color: 'var(--platform-accent)' }} /> 
                    Ефект появи
                </label>
                <CustomSelect 
                    value={config.type} 
                    onChange={(e) => handleChange('type', e.target.value)}
                    options={animationOptions}
                    placeholder="Оберіть ефект"
                />
            </div>

            {config.type !== 'none' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div>
                        <div style={subLabelStyle}>
                            <Clock size={14} /> Тривалість: <span style={{ color: 'var(--platform-text-primary)' }}>{config.duration}s</span>
                        </div>
                        <RangeSlider 
                            value={Math.round((config.duration || 0.6) * 1000)} 
                            onChange={(val) => handleTimeChange('duration', val)}
                            min={100} 
                            max={2000} 
                            step={100}
                            unit="ms"
                        />
                    </div>

                    <div>
                        <div style={subLabelStyle}>
                            <Hourglass size={14} /> Затримка: <span style={{ color: 'var(--platform-text-primary)' }}>{config.delay}s</span>
                        </div>
                        <RangeSlider 
                            value={Math.round((config.delay || 0) * 1000)} 
                            onChange={(val) => handleTimeChange('delay', val)}
                            min={0} 
                            max={2000} 
                            step={100}
                            unit="ms"
                        />
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        paddingTop: '16px',
                        borderTop: '1px dashed var(--platform-border-color)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Repeat size={16} style={{ color: 'var(--platform-text-secondary)' }} />
                            <span style={{ fontSize: '0.9rem', color: 'var(--platform-text-primary)' }}>Зациклити анімацію</span>
                        </div>
                        <Switch 
                            checked={config.repeat || false}
                            onChange={(e) => handleChange('repeat', e.target.checked)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimationSettings;