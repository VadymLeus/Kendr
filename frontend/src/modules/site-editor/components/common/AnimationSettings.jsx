// frontend/src/modules/site-editor/components/common/AnimationSettings.jsx
import React, { useState, useEffect } from 'react';

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

    const containerStyle = {
        background: 'var(--platform-card-bg)', 
        border: '1px solid var(--platform-border-color)',
        borderRadius: '4px',
        padding: '12px',
        marginTop: '8px'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
    };

    const titleStyle = {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--platform-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    };

    const rowStyle = {
        marginBottom: '12px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.85rem',
        color: 'var(--platform-text-secondary)',
        marginBottom: '6px'
    };

    const selectStyle = {
        width: '100%',
        background: 'var(--platform-bg)',
        border: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-primary)',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '0.85rem',
        outline: 'none',
        cursor: 'pointer'
    };

    const sliderContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const sliderStyle = {
        flex: 1,
        cursor: 'pointer',
        accentColor: 'var(--platform-accent)',
        height: '4px',
        borderRadius: '2px'
    };

    const valueStyle = {
        fontSize: '0.85rem',
        width: '40px',
        textAlign: 'right',
        color: 'var(--platform-text-primary)'
    };

    const checkboxContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--platform-border-color)'
    };

    const checkboxStyle = {
        accentColor: 'var(--platform-accent)',
        cursor: 'pointer'
    };

    const checkboxLabelStyle = {
        fontSize: '0.85rem',
        color: 'var(--platform-text-primary)',
        cursor: 'pointer',
        userSelect: 'none'
    };

    return (
        <div style={containerStyle}>
            <style>{`
                input[type=range].custom-slider {
                    -webkit-appearance: none; 
                    background: transparent; 
                }
                input[type=range].custom-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 14px;
                    width: 14px;
                    border-radius: 50%;
                    background: var(--platform-accent);
                    cursor: pointer;
                    margin-top: -5px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    border: 2px solid var(--platform-card-bg);
                }
                input[type=range].custom-slider::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    background: var(--platform-border-color);
                    border-radius: 2px;
                }
            `}</style>

            <div style={headerStyle}>
                <div style={titleStyle}>
                    АНІМАЦІЯ
                </div>
            </div>

            <div style={rowStyle}>
                <label style={labelStyle}>Ефект:</label>
                <select 
                    value={config.type} 
                    onChange={(e) => handleChange('type', e.target.value)}
                    style={selectStyle}
                >
                    <option value="none">Без анімації</option>
                    <option value="fadeIn">Поява (Fade In)</option>
                    <option value="fadeUp">Знизу вгору (Fade Up)</option>
                    <option value="fadeDown">Зверху вниз (Fade Down)</option>
                    <option value="fadeLeft">Зліва направо (Fade Left)</option>
                    <option value="fadeRight">Справа наліво (Fade Right)</option>
                    <option value="zoomIn">Масштабування (Zoom In)</option>
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
                                className="custom-slider"
                                style={sliderStyle}
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
                                className="custom-slider"
                                style={sliderStyle}
                            />
                            <span style={valueStyle}>{config.delay}s</span>
                        </div>
                    </div>

                    <div style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            checked={config.repeat || false}
                            onChange={(e) => handleChange('repeat', e.target.checked)}
                            style={checkboxStyle}
                        />
                        <label style={checkboxLabelStyle}>
                            Програвати щоразу (Replay)
                        </label>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnimationSettings;