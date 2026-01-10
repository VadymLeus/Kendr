// frontend/src/shared/ui/complex/AccentColorSelector.jsx
import React from 'react';
import { PRESET_COLORS, resolveAccentColor, isLightColor } from '../../lib/utils/themeUtils';

const AccentColorSelector = ({ value, onChange, enableCustom = false }) => {
    const currentHex = resolveAccentColor(value);
    const isPreset = PRESET_COLORS.some(p => p.id === value);
    const currentPresetName = PRESET_COLORS.find(p => p.id === value)?.name;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--platform-text-primary)', margin: 0 }}>Акцентний колір</h3>
                <div style={{ fontSize: '0.9rem', color: currentHex, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: currentHex, border: '1px solid var(--platform-border-color)' }}></div>
                    {isPreset ? currentPresetName : 'Власний колір'}
                    {!isPreset && <span style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem'}}>({currentHex})</span>}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '8px 0', justifyContent: 'center' }}>
                {PRESET_COLORS.map(preset => (
                    <button 
                        key={preset.id}
                        onClick={() => onChange(preset.id)}
                        title={preset.name}
                        style={{
                            width: '42px', height: '42px', 
                            borderRadius: '10px', 
                            background: preset.color,
                            border: value === preset.id ? `3px solid var(--platform-card-bg)` : '1px solid var(--platform-border-color)',
                            boxShadow: value === preset.id ? `0 0 0 2px ${preset.color}` : 'none',
                            cursor: 'pointer', 
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: value === preset.id ? 'scale(1.1)' : 'scale(1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                        }}
                    />
                ))}

                {enableCustom && (
                    <label 
                        style={{
                            width: '42px', height: '42px', 
                            borderRadius: '10px', 
                            cursor: 'pointer',
                            border: !isPreset ? `3px solid var(--platform-card-bg)` : '2px dashed var(--platform-border-color)',
                            boxShadow: !isPreset ? `0 0 0 2px ${currentHex}` : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: !isPreset ? currentHex : 'transparent',
                            transition: 'all 0.2s ease',
                            transform: !isPreset ? 'scale(1.1)' : 'scale(1)',
                            position: 'relative'
                        }}
                        title="Власний колір"
                    >
                        <input 
                            type="color" 
                            value={currentHex}
                            onChange={(e) => onChange(e.target.value)} 
                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', top:0, left:0 }}
                        />
                        {!isPreset ? (
                            <span style={{ fontSize: '14px', color: isLightColor(currentHex) ? '#000' : '#fff' }}>✎</span>
                        ) : (
                            <span style={{ fontSize: '20px', color: 'var(--platform-text-secondary)', lineHeight: 1 }}>+</span>
                        )}
                    </label>
                )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--platform-bg)', borderRadius: '12px', border: '1px solid var(--platform-border-color)' }}>
                <button style={{
                    padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'default', fontWeight: '500', fontSize: '0.9rem',
                    background: currentHex,
                    color: isLightColor(currentHex) ? '#000' : '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    Основна кнопка
                </button>
                <button style={{
                    padding: '10px 20px', borderRadius: '8px', cursor: 'default', fontWeight: '500', fontSize: '0.9rem',
                    background: 'transparent',
                    border: `1px solid ${currentHex}`,
                    color: currentHex
                }}>
                    Другорядна кнопка
                </button>
                <div style={{ padding: '8px 12px', background: currentHex + '20', color: currentHex, borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                    Активний елемент
                </div>
            </div>
        </div>
    );
};

export default AccentColorSelector;