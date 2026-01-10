// frontend/src/modules/editor/controls/SpacingControl.jsx
import React, { useState, useEffect } from 'react';
import RangeSlider from '../../../shared/ui/elements/RangeSlider';
import { 
    IconArrowUp, 
    IconArrowDown, 
    IconLink, 
    IconUnlink 
} from '../../../shared/ui/elements/Icons';

const SpacingControl = ({ styles = {}, onChange }) => {
    const defaultPadding = 60;
    const minPadding = 0;
    const maxPadding = 240;
    const getSafeValue = (val) => {
        if (val === undefined || val === null || val === '') return defaultPadding;
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? defaultPadding : parsed;
    };
    
    const [paddingTop, setPaddingTop] = useState(getSafeValue(styles.paddingTop));
    const [paddingBottom, setPaddingBottom] = useState(getSafeValue(styles.paddingBottom));
    const [isLinked, setIsLinked] = useState(false);

    useEffect(() => {
        setPaddingTop(getSafeValue(styles.paddingTop));
        setPaddingBottom(getSafeValue(styles.paddingBottom));
    }, [styles.paddingTop, styles.paddingBottom]);

    const handleSliderChange = (key, value) => {
        const val = typeof value === 'string' ? parseInt(value, 10) : value;
        const finalValue = isNaN(val) ? 0 : Math.max(minPadding, Math.min(val, maxPadding));
        
        let newStyles = { ...styles };

        if (key === 'paddingTop') {
            setPaddingTop(finalValue);
            newStyles.paddingTop = finalValue;
            if (isLinked) {
                setPaddingBottom(finalValue);
                newStyles.paddingBottom = finalValue;
            }
        } else {
            setPaddingBottom(finalValue);
            newStyles.paddingBottom = finalValue;
            if (isLinked) {
                setPaddingTop(finalValue);
                newStyles.paddingTop = finalValue;
            }
        }
        
        onChange(newStyles, false); 
    };

    return (
        <div style={{ background: 'var(--platform-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--platform-text-primary)' }}>
                    Внутрішні відступи
                </label>
                
                <button 
                    type="button"
                    onClick={() => setIsLinked(!isLinked)}
                    title={isLinked ? "Роз'єднати значення" : "Зв'язати верх і низ"}
                    style={{
                        background: isLinked ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        border: isLinked ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: isLinked ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        width: '32px',
                        height: '32px'
                    }}
                >
                    {isLinked ? <IconLink size={16} /> : <IconUnlink size={16} />}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--platform-text-secondary)', fontSize: '0.8rem', fontWeight: '500' }}>
                        <IconArrowUp size={14} /> 
                        <span>Відступ зверху: <span style={{ color: 'var(--platform-text-primary)' }}>{paddingTop}px</span></span>
                    </div>
                    <RangeSlider 
                        value={paddingTop} 
                        onChange={(val) => handleSliderChange('paddingTop', val)}
                        min={minPadding}
                        max={maxPadding}
                        step={10}
                        unit="px"
                    />
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--platform-text-secondary)', fontSize: '0.8rem', fontWeight: '500' }}>
                        <IconArrowDown size={14} />
                        <span>Відступ знизу: <span style={{ color: 'var(--platform-text-primary)' }}>{paddingBottom}px</span></span>
                    </div>
                    <RangeSlider 
                        value={paddingBottom} 
                        onChange={(val) => handleSliderChange('paddingBottom', val)}
                        min={minPadding}
                        max={maxPadding}
                        step={10}
                        unit="px"
                    />
                </div>
            </div>
        </div>
    );
};

export default SpacingControl;