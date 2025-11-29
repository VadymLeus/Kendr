// frontend/src/features/editor/settings/components/AnimationSettings.jsx
import React from 'react';

const AnimationSettings = ({ animationConfig, onChange }) => {
    const config = {
        type: 'none',
        duration: 0.6,
        delay: 0,
        repeat: false,
        ...animationConfig
    };

    const handleChange = (field, value) => {
        onChange({
            ...config,
            [field]: value
        });
    };

    const sectionStyle = {
        marginTop: '20px',
        padding: '16px',
        background: 'var(--platform-bg)',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)'
    };

    const titleStyle = {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'var(--platform-text-primary)',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const rowStyle = {
        marginBottom: '12px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.85rem',
        color: 'var(--platform-text-secondary)',
        marginBottom: '4px'
    };

    const checkboxLabelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        color: 'var(--platform-text-primary)',
        cursor: 'pointer',
        userSelect: 'none'
    };

    const selectStyle = {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '0.9rem'
    };

    const sliderContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const rangeStyle = {
        flex: 1,
        cursor: 'pointer'
    };

    const valueStyle = {
        fontSize: '0.85rem',
        width: '40px',
        textAlign: 'right',
        color: 'var(--platform-text-primary)'
    };

    return (
        <div style={sectionStyle}>
            <div style={titleStyle}>
                <span>✨</span> Анімація появи
            </div>

            <div style={rowStyle}>
                <label style={labelStyle}>Ефект:</label>
                <select 
                    value={config.type} 
                    onChange={(e) => handleChange('type', e.target.value)}
                    style={selectStyle}
                >
                    <option value="none">Немає (None)</option>
                    <option value="fadeIn">Fade In (Прозорість)</option>
                    <option value="fadeUp">Fade Up (Знизу)</option>
                    <option value="fadeDown">Fade Down (Зверху)</option>
                    <option value="fadeLeft">Fade Left (Зліва)</option>
                    <option value="fadeRight">Fade Right (Справа)</option>
                    <option value="zoomIn">Zoom In (Збільшення)</option>
                </select>
            </div>

            {config.type !== 'none' && (
                <>
                    <div style={rowStyle}>
                        <label style={labelStyle}>Тривалість (сек):</label>
                        <div style={sliderContainerStyle}>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="2.0" 
                                step="0.1"
                                value={config.duration}
                                onChange={(e) => handleChange('duration', parseFloat(e.target.value))}
                                style={rangeStyle}
                            />
                            <span style={valueStyle}>{config.duration}s</span>
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <label style={labelStyle}>Затримка (сек):</label>
                        <div style={sliderContainerStyle}>
                            <input 
                                type="range" 
                                min="0" 
                                max="2.0" 
                                step="0.1"
                                value={config.delay}
                                onChange={(e) => handleChange('delay', parseFloat(e.target.value))}
                                style={rangeStyle}
                            />
                            <span style={valueStyle}>{config.delay}s</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--platform-border-color)' }}>
                        <label style={checkboxLabelStyle}>
                            <input
                                type="checkbox"
                                checked={config.repeat || false}
                                onChange={(e) => handleChange('repeat', e.target.checked)}
                            />
                            Програвати щоразу (Replay)
                        </label>
                        <small style={{ display: 'block', marginTop: '4px', color: 'var(--platform-text-secondary)', fontSize: '0.75rem' }}>
                            Якщо увімкнено, анімація буде спрацьовувати кожного разу, коли ви скролите до блоку.
                        </small>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnimationSettings;