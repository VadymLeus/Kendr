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

    return (
        <div>
            <div className={`form-group ${config.type !== 'none' ? 'mb-5' : ''}`}>
                <label className="form-label flex items-center gap-2">
                    <Play size={16} className="text-(--platform-accent)" /> 
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
                <div className="flex flex-col gap-5">
                    
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-(--platform-text-secondary) mb-1">
                            <Clock size={14} /> Тривалість: <span className="text-(--platform-text-primary)">{config.duration}s</span>
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
                        <div className="flex items-center gap-2 text-xs font-medium text-(--platform-text-secondary) mb-1">
                            <Hourglass size={14} /> Затримка: <span className="text-(--platform-text-primary)">{config.delay}s</span>
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

                    <div className="flex items-center justify-between pt-4 border-t border-dashed border-(--platform-border-color)">
                        <div className="flex items-center gap-2">
                            <Repeat size={16} className="text-(--platform-text-secondary)" />
                            <span className="text-sm text-(--platform-text-primary)">Зациклити анімацію</span>
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