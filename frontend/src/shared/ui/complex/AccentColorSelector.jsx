// frontend/src/shared/ui/complex/AccentColorSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { PRESET_COLORS, resolveAccentColor, isLightColor } from '../../utils/themeUtils';
import { Edit, Plus } from 'lucide-react';

const AccentColorSelector = ({ value, onChange, enableCustom = false }) => {
    const [hoveredValue, setHoveredValue] = useState(null);
    const [localColor, setLocalColor] = useState(() => resolveAccentColor(value));
    const timeoutRef = useRef(null);
    const visiblePresets = PRESET_COLORS.filter(p => p.id !== 'black' && p.color !== '#000000');
    useEffect(() => {
        setLocalColor(resolveAccentColor(value));
    }, [value]);

    const handleCustomColorChange = (newColor) => {
        setLocalColor(newColor);
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            onChange(newColor);
        }, 100);
    };

    const handlePresetClick = (presetId, presetColor) => {
        setLocalColor(presetColor);
        onChange(presetId);
    };

    const isPreset = visiblePresets.some(p => p.id === value);
    const currentPresetName = visiblePresets.find(p => p.id === value)?.name;
    const displayHex = localColor;
    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0">Акцентний колір</h3>
                <div 
                    className="text-sm font-semibold flex items-center gap-2"
                    style={{ color: displayHex }}
                >
                    <div 
                        className="w-4 h-4 rounded bg-current border border-(--platform-border-color)"
                        style={{ backgroundColor: displayHex }}
                    ></div>
                    {isPreset ? currentPresetName : (enableCustom ? 'Власний колір' : 'Обраний колір')}
                    {!isPreset && <span className="text-(--platform-text-secondary) text-xs font-normal">({displayHex})</span>}
                </div>
            </div>

            <div className="flex gap-3 flex-wrap py-2 justify-center">
                {visiblePresets.map(preset => {
                    const isSelected = value === preset.id;
                    const isHovered = hoveredValue === preset.id;
                    
                    return (
                        <button 
                            key={preset.id}
                            onClick={() => handlePresetClick(preset.id, preset.color)}
                            onMouseEnter={() => setHoveredValue(preset.id)}
                            onMouseLeave={() => setHoveredValue(null)}
                            title={preset.name}
                            className={`
                                w-10.5 h-10.5 rounded-[10px] cursor-pointer flex items-center justify-center p-0 transition-transform duration-200 ease-in-out
                                ${isSelected || isHovered ? 'scale-110' : 'scale-100'}
                            `}
                            style={{
                                background: preset.color,
                                border: isSelected 
                                    ? `3px solid var(--platform-card-bg)` 
                                    : `1px solid ${isHovered ? preset.color : 'var(--platform-border-color)'}`,
                                boxShadow: isSelected 
                                    ? `0 0 0 2px ${preset.color}` 
                                    : (isHovered ? `0 0 0 1px ${preset.color}` : 'none'),
                            }}
                        />
                    );
                })}

                {enableCustom && (
                    <label 
                        className={`
                            w-10.5 h-10.5 rounded-[10px] cursor-pointer flex items-center justify-center relative transition-transform duration-200 ease-in-out
                            ${(!isPreset || hoveredValue === 'custom') ? 'scale-110' : 'scale-100'}
                        `}
                        style={{
                            border: !isPreset 
                                ? `3px solid var(--platform-card-bg)` 
                                : (hoveredValue === 'custom' ? `1px solid ${displayHex}` : '2px dashed var(--platform-border-color)'),
                            boxShadow: !isPreset 
                                ? `0 0 0 2px ${displayHex}` 
                                : (hoveredValue === 'custom' ? `0 0 0 1px ${displayHex}` : 'none'),
                            backgroundColor: !isPreset ? displayHex : 'transparent',
                        }}
                        onMouseEnter={() => setHoveredValue('custom')}
                        onMouseLeave={() => setHoveredValue(null)}
                        title="Власний колір"
                    >
                        <input 
                            type="color" 
                            value={displayHex} 
                            onChange={(e) => handleCustomColorChange(e.target.value)}
                            className="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0"
                        />
                        {!isPreset ? (
                            <Edit size={18} color={isLightColor(displayHex) ? '#000' : '#fff'} />
                        ) : (
                            <Plus size={20} className="text-(--platform-text-secondary)" />
                        )}
                    </label>
                )}
            </div>

            <div className="mt-6 flex gap-3 flex-wrap items-center justify-center p-6 bg-(--platform-bg) rounded-xl border border-(--platform-border-color)">
                <button 
                    className="py-2.5 px-5 rounded-lg border-none cursor-default font-medium text-sm shadow-sm"
                    style={{
                        background: displayHex,
                        color: isLightColor(displayHex) ? '#000' : '#fff'
                    }}
                >
                    Основна кнопка
                </button>
                <button 
                    className="py-2.5 px-5 rounded-lg cursor-default font-medium text-sm bg-transparent"
                    style={{
                        border: `1px solid ${displayHex}`,
                        color: displayHex
                    }}
                >
                    Другорядна кнопка
                </button>
                <div 
                    className="py-2 px-3 rounded-lg text-xs font-semibold"
                    style={{ background: displayHex + '20', color: displayHex }}
                >
                    Активний елемент
                </div>
            </div>
        </div>
    );
};

export default AccentColorSelector;