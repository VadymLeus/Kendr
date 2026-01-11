// frontend/src/shared/ui/complex/AccentColorSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Edit, Plus } from 'lucide-react';
import { PRESET_COLORS, resolveAccentColor, isLightColor } from '../../lib/utils/themeUtils';

const AccentColorSelector = ({ value, onChange, enableCustom = false }) => {
    const [hoveredValue, setHoveredValue] = useState(null);
    const [localColor, setLocalColor] = useState(() => resolveAccentColor(value));
    
    const timeoutRef = useRef(null);

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

    const isPreset = PRESET_COLORS.some(p => p.id === value);
    const currentPresetName = PRESET_COLORS.find(p => p.id === value)?.name;
    const displayHex = localColor; 

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--platform-text-primary)', margin: 0 }}>Акцентний колір</h3>
                <div style={{ fontSize: '0.9rem', color: displayHex, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: displayHex, border: '1px solid var(--platform-border-color)' }}></div>
                    {isPreset ? currentPresetName : 'Власний колір'}
                    {!isPreset && <span style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem'}}>({displayHex})</span>}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '8px 0', justifyContent: 'center' }}>
                {PRESET_COLORS.map(preset => {
                    const isSelected = value === preset.id;
                    const isHovered = hoveredValue === preset.id;
                    
                    return (
                        <button 
                            key={preset.id}
                            onClick={() => handlePresetClick(preset.id, preset.color)}
                            onMouseEnter={() => setHoveredValue(preset.id)}
                            onMouseLeave={() => setHoveredValue(null)}
                            title={preset.name}
                            style={{
                                width: '42px', height: '42px', 
                                borderRadius: '10px', 
                                background: preset.color,
                                border: isSelected 
                                    ? `3px solid var(--platform-card-bg)` 
                                    : `1px solid ${isHovered ? preset.color : 'var(--platform-border-color)'}`,
                                boxShadow: isSelected 
                                    ? `0 0 0 2px ${preset.color}` 
                                    : (isHovered ? `0 0 0 1px ${preset.color}` : 'none'),
                                cursor: 'pointer', 
                                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: (isSelected || isHovered) ? 'scale(1.1)' : 'scale(1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                            }}
                        />
                    );
                })}

                {enableCustom && (
                    <label 
                        style={{
                            width: '42px', height: '42px', 
                            borderRadius: '10px', 
                            cursor: 'pointer',
                            border: !isPreset 
                                ? `3px solid var(--platform-card-bg)` 
                                : (hoveredValue === 'custom' ? `1px solid ${displayHex}` : '2px dashed var(--platform-border-color)'),
                            boxShadow: !isPreset 
                                ? `0 0 0 2px ${displayHex}` 
                                : (hoveredValue === 'custom' ? `0 0 0 1px ${displayHex}` : 'none'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: !isPreset ? displayHex : 'transparent',
                            transition: 'all 0.2s ease',
                            transform: (!isPreset || hoveredValue === 'custom') ? 'scale(1.1)' : 'scale(1)',
                            position: 'relative'
                        }}
                        onMouseEnter={() => setHoveredValue('custom')}
                        onMouseLeave={() => setHoveredValue(null)}
                        title="Власний колір"
                    >
                        <input 
                            type="color" 
                            value={displayHex} 
                            onChange={(e) => handleCustomColorChange(e.target.value)}
                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', top:0, left:0 }}
                        />
                        {!isPreset ? (
                            <Edit size={18} color={isLightColor(displayHex) ? '#000' : '#fff'} />
                        ) : (
                            <Plus size={20} color="var(--platform-text-secondary)" />
                        )}
                    </label>
                )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--platform-bg)', borderRadius: '12px', border: '1px solid var(--platform-border-color)' }}>
                <button style={{
                    padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'default', fontWeight: '500', fontSize: '0.9rem',
                    background: displayHex,
                    color: isLightColor(displayHex) ? '#000' : '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    Основна кнопка
                </button>
                <button style={{
                    padding: '10px 20px', borderRadius: '8px', cursor: 'default', fontWeight: '500', fontSize: '0.9rem',
                    background: 'transparent',
                    border: `1px solid ${displayHex}`,
                    color: displayHex
                }}>
                    Другорядна кнопка
                </button>
                <div style={{ padding: '8px 12px', background: displayHex + '20', color: displayHex, borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                    Активний елемент
                </div>
            </div>
        </div>
    );
};

export default AccentColorSelector;