// frontend/src/modules/site-editor/components/common/AnimationSettings.jsx
import React, { useState, useEffect } from 'react';
import CustomSelect from '../../../../common/components/ui/CustomSelect';
import RangeSlider from '../../../../common/components/ui/RangeSlider';

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

    const rowStyle = {
        marginBottom: '20px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: 'var(--platform-text-primary)',
        marginBottom: '8px'
    };

    return (
        <div>
            <div style={rowStyle}>
                <label style={labelStyle}>Ефект появи</label>
                <CustomSelect 
                    value={config.type} 
                    onChange={(e) => handleChange('type', e.target.value)}
                    options={animationOptions}
                    placeholder="Оберіть ефект"
                />
            </div>

            {config.type !== 'none' && (
                <div style={{ 
                    paddingLeft: '12px', 
                    borderLeft: '2px solid var(--platform-border-color)',
                    marginLeft: '4px'
                }}>
                    <div style={rowStyle}>
                        <RangeSlider 
                            label="Тривалість"
                            value={Math.round((config.duration || 0.6) * 1000)} 
                            onChange={(val) => handleTimeChange('duration', val)}
                            min={100} 
                            max={2000} 
                            step={100}
                            unit="ms"
                        />
                    </div>

                    <div style={rowStyle}>
                        <RangeSlider 
                            label="Затримка"
                            value={Math.round((config.delay || 0) * 1000)} 
                            onChange={(val) => handleTimeChange('delay', val)}
                            min={0} 
                            max={2000} 
                            step={100}
                            unit="ms"
                        />
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <label style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            cursor: 'pointer', userSelect: 'none', fontSize: '0.9rem' 
                        }}>
                            <input
                                type="checkbox"
                                checked={config.repeat || false}
                                onChange={(e) => handleChange('repeat', e.target.checked)}
                                style={{ accentColor: 'var(--platform-accent)', width: '16px', height: '16px' }}
                            />
                            <span style={{ color: 'var(--platform-text-primary)' }}>Програвати щоразу (Loop)</span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimationSettings;