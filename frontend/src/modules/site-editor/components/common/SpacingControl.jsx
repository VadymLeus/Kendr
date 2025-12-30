// frontend/src/modules/site-editor/components/common/SpacingControl.jsx
import React, { useState, useEffect } from 'react';
import RangeSlider from '../../../../common/components/ui/RangeSlider';
import { IconArrowUp, IconArrowDown } from '../../../../common/components/ui/Icons';

const SpacingControl = ({ styles = {}, onChange }) => {
    const defaultPadding = 60;
    const minPadding = 0;
    const maxPadding = 200; 

    const getSafeValue = (val) => {
        if (val === undefined || val === null) return defaultPadding;
        if (val === '') return defaultPadding;
        const parsed = parseInt(val, 10);
        if (isNaN(parsed)) return defaultPadding;
        return parsed;
    };
    
    const [paddingTop, setPaddingTop] = useState(getSafeValue(styles.paddingTop));
    const [paddingBottom, setPaddingBottom] = useState(getSafeValue(styles.paddingBottom));
    const [isLinked, setIsLinked] = useState(false);

    useEffect(() => {
        setPaddingTop(getSafeValue(styles.paddingTop));
        setPaddingBottom(getSafeValue(styles.paddingBottom));
    }, [styles.paddingTop, styles.paddingBottom]);

    const handleSliderChange = (key, valueStr) => {
        const val = parseInt(valueStr, 10);
        const finalValue = isNaN(val) ? 0 : Math.max(minPadding, Math.min(val, maxPadding));
        
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

    const LinkIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
    );

    const UnlinkIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.5}}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--platform-text-primary)' }}>Внутрішні відступи</label>
                <button 
                    type="button"
                    onClick={() => setIsLinked(!isLinked)}
                    title={isLinked ? "Роз'єднати" : "Зв'язати верх і низ"}
                    style={{
                        background: isLinked ? 'var(--platform-accent)' : 'transparent',
                        border: isLinked ? 'none' : '1px solid var(--platform-border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: isLinked ? '#fff' : 'var(--platform-text-secondary)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        width: '28px',
                        height: '28px'
                    }}
                >
                    {isLinked ? <LinkIcon /> : <UnlinkIcon />}
                </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--platform-text-secondary)', fontSize: '0.8rem' }}>
                    <IconArrowUp size={14} /> Верх
                </div>
                <RangeSlider 
                    value={paddingTop} 
                    onChange={(val) => handleSliderChange('paddingTop', val)}
                    min={minPadding}
                    max={maxPadding}
                    unit="px"
                />
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--platform-text-secondary)', fontSize: '0.8rem' }}>
                    <IconArrowDown size={14} /> Низ
                </div>
                <RangeSlider 
                    value={paddingBottom} 
                    onChange={(val) => handleSliderChange('paddingBottom', val)}
                    min={minPadding}
                    max={maxPadding}
                    unit="px"
                />
            </div>
        </div>
    );
};

export default SpacingControl;