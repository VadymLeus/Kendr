// frontend/src/features/editor/settings/components/SpacingControl.jsx
import React, { useState, useEffect } from 'react';

const SpacingControl = ({ styles = {}, onChange }) => {
    const defaultPadding = 60;
    const minPadding = 1;
    const maxPadding = 200; 

    const getSafeValue = (val) => {
        if (val === undefined || val === null) {
            return defaultPadding;
        }
        
        if (val === '') {
            return defaultPadding;
        }
        
        const parsed = parseInt(val, 10);
        
        if (isNaN(parsed) || parsed < minPadding || parsed > maxPadding) {
            return defaultPadding;
        }
        
        return parsed;
    };
    
    const [paddingTop, setPaddingTop] = useState(getSafeValue(styles.paddingTop));
    const [paddingBottom, setPaddingBottom] = useState(getSafeValue(styles.paddingBottom));
    const [isLinked, setIsLinked] = useState(false);

    useEffect(() => {
        setPaddingTop(getSafeValue(styles.paddingTop));
        setPaddingBottom(getSafeValue(styles.paddingBottom));
    }, [styles.paddingTop, styles.paddingBottom]);

    const handleChange = (key, value) => {
        if (value === '') {
            if (key === 'paddingTop') setPaddingTop('');
            else setPaddingBottom('');
            return;
        }

        const val = parseInt(value, 10);
        if (isNaN(val)) return;
        
        const finalValue = Math.max(minPadding, Math.min(val, maxPadding));
        
        if (key === 'paddingTop') {
            setPaddingTop(finalValue);
            if (isLinked) setPaddingBottom(finalValue);
            
            const newStyles = { 
                ...styles, 
                paddingTop: finalValue, 
                ...(isLinked && { paddingBottom: finalValue }) 
            };
            onChange(newStyles, false);
        } else {
            setPaddingBottom(finalValue);
            if (isLinked) setPaddingTop(finalValue);

            const newStyles = { 
                ...styles, 
                paddingBottom: finalValue,
                ...(isLinked && { paddingTop: finalValue })
            };
            onChange(newStyles, false);
        }
    };

    const handleCommit = () => {
        const finalTop = paddingTop === '' ? defaultPadding : 
                        Math.max(minPadding, Math.min(paddingTop, maxPadding));
        const finalBottom = paddingBottom === '' ? defaultPadding : 
                           Math.max(minPadding, Math.min(paddingBottom, maxPadding));

        setPaddingTop(finalTop);
        setPaddingBottom(finalBottom);

        onChange({
            ...styles,
            paddingTop: finalTop,
            paddingBottom: finalBottom
        }, true);
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

    const linkBtnStyle = {
        background: isLinked ? 'rgba(var(--platform-accent-rgb), 0.15)' : 'transparent',
        border: '1px solid transparent',
        borderColor: isLinked ? 'var(--platform-accent)' : 'var(--platform-border-color)',
        color: isLinked ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        borderRadius: '4px',
        cursor: 'pointer',
        padding: '4px 8px',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s ease',
        fontWeight: isLinked ? '600' : '400'
    };

    const gridRowStyle = {
        display: 'grid',
        gridTemplateColumns: '24px 1fr 50px',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '8px'
    };

    const iconLabelStyle = {
        color: 'var(--platform-text-secondary)',
        fontSize: '1.2rem',
        display: 'flex',
        justifyContent: 'center',
        opacity: 0.8
    };

    const sliderStyle = {
        width: '100%',
        cursor: 'pointer',
        accentColor: 'var(--platform-accent)',
        height: '4px',
        borderRadius: '2px'
    };

    const numberInputStyle = {
        width: '100%',
        background: 'var(--platform-bg)', 
        border: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-primary)',
        borderRadius: '4px',
        padding: '4px',
        fontSize: '0.85rem',
        textAlign: 'center',
        outline: 'none',
        appearance: 'textfield',
        MozAppearance: 'textfield'
    };

    return (
        <div style={containerStyle}>
            <style>{`
                /* Стилізація слайдера */
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
                
                /* Приховуємо стрілки (spinners) в number input */
                input[type=number]::-webkit-outer-spin-button,
                input[type=number]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>

            <div style={headerStyle}>
                <div style={titleStyle}>
                    <span style={{ fontSize: '1rem' }}>↕</span> ВІДСТУПИ
                </div>
                <button 
                    type="button"
                    onClick={() => setIsLinked(!isLinked)}
                    style={linkBtnStyle}
                    title={isLinked ? "Роз'єднати" : "Зв'язати верх і низ"}
                >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{isLinked ? '🔗' : '🔓'}</span>
                </button>
            </div>

            <div style={gridRowStyle}>
                <div style={iconLabelStyle} title="Відступ зверху">
                    <span style={{ fontSize: '14px' }}>⬆</span>
                </div>
                
                <input
                    type="range"
                    min={minPadding}
                    max={maxPadding}
                    step="1"
                    value={paddingTop === '' ? defaultPadding : paddingTop}
                    onChange={(e) => handleChange('paddingTop', e.target.value)}
                    onMouseUp={handleCommit}
                    onTouchEnd={handleCommit}
                    className="custom-slider"
                    style={sliderStyle}
                />
                
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        min={minPadding}
                        max={maxPadding}
                        value={paddingTop}
                        onChange={(e) => handleChange('paddingTop', e.target.value)}
                        onBlur={handleCommit}
                        style={numberInputStyle}
                    />
                </div>
            </div>

            <div style={{ ...gridRowStyle, marginBottom: 0 }}>
                <div style={iconLabelStyle} title="Відступ знизу">
                    <span style={{ fontSize: '14px' }}>⬇</span>
                </div>
                
                <input
                    type="range"
                    min={minPadding}
                    max={maxPadding}
                    step="1"
                    value={paddingBottom === '' ? defaultPadding : paddingBottom}
                    onChange={(e) => handleChange('paddingBottom', e.target.value)}
                    onMouseUp={handleCommit}
                    onTouchEnd={handleCommit}
                    className="custom-slider"
                    style={sliderStyle}
                />
                
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        min={minPadding}
                        max={maxPadding}
                        value={paddingBottom}
                        onChange={(e) => handleChange('paddingBottom', e.target.value)}
                        onBlur={handleCommit}
                        style={numberInputStyle}
                    />
                </div>
            </div>

            <div style={{
                fontSize: '0.75rem',
                color: 'var(--platform-text-secondary)',
                textAlign: 'center',
                marginTop: '8px',
                opacity: 0.7
            }}>
                Діапазон: {minPadding}px - {maxPadding}px
            </div>
        </div>
    );
};

export default SpacingControl;