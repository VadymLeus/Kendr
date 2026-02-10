// frontend/src/modules/editor/ui/configuration/SpacingControl.jsx
import React, { useState, useEffect } from 'react';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import { ArrowUp, ArrowDown, Link, Unlink } from 'lucide-react';

const SpacingControl = ({ styles = {}, onChange }) => {
    const defaultPadding = 60;
    const minPadding = 10;
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
        <div>
            <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-(--platform-text-primary)">
                    Внутрішні відступи
                </label>
                <button 
                    type="button"
                    onClick={() => setIsLinked(!isLinked)}
                    title={isLinked ? "Роз'єднати значення" : "Зв'язати верх і низ"}
                    className={`
                        w-7 h-7 flex items-center justify-center rounded transition-all duration-200 p-1 cursor-pointer border
                        ${isLinked 
                            ? 'bg-blue-500/10 border-(--platform-accent) text-(--platform-accent)' 
                            : 'bg-transparent border-(--platform-border-color) text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}
                    `}
                >
                    {isLinked ? <Link size={14} /> : <Unlink size={14} />}
                </button>
            </div>

            <div className="flex flex-col gap-5">
                <div>
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-(--platform-text-secondary)">
                        <ArrowUp size={14} /> 
                        <span>Відступ зверху: <span className="text-(--platform-text-primary)">{paddingTop}px</span></span>
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
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-(--platform-text-secondary)">
                        <ArrowDown size={14} />
                        <span>Відступ знизу: <span className="text-(--platform-text-primary)">{paddingBottom}px</span></span>
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