// frontend/src/shared/ui/elements/RangeSlider.jsx
import React from 'react';

const RangeSlider = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 50, 
    step = 1,
    unit = 'px',
    accentColor = 'var(--platform-accent)'
}) => {
    const numericValue = parseInt(value) || 0;

    const handleChange = (e) => {
        const val = e.target.value;
        onChange(`${val}${unit}`);
    };

    const handleInputChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        let num = parseInt(val);
        if (isNaN(num)) num = 0;
        
        if (num > max) {
            onChange(`${max}${unit}`);
        } else {
            onChange(`${num}${unit}`);
        }
    };

    const percentage = ((numericValue - min) / (max - min)) * 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {label && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--platform-text-primary)' }}>
                        {label}
                    </label>
                </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', height: '20px' }}>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={numericValue}
                        onChange={handleChange}
                        className="custom-range-slider"
                        style={{
                            width: '100%',
                            appearance: 'none',
                            height: '6px',
                            background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${percentage}%, var(--platform-border-color) ${percentage}%, var(--platform-border-color) 100%)`,
                            borderRadius: '3px',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    />
                </div>

                <div style={{ position: 'relative', width: '80px' }}>
                    <input
                        type="text"
                        value={numericValue}
                        onChange={handleInputChange}
                        style={{
                            width: '100%',
                            padding: '6px 30px 6px 8px',
                            borderRadius: '8px',
                            border: '1px solid var(--platform-border-color)',
                            background: 'var(--platform-bg)',
                            color: 'var(--platform-text-primary)',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = accentColor}
                        onBlur={(e) => e.target.style.borderColor = 'var(--platform-border-color)'}
                    />
                    <span style={{ 
                        position: 'absolute', 
                        right: '10px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: 'var(--platform-text-secondary)',
                        fontSize: '0.8rem',
                        pointerEvents: 'none'
                    }}>
                        {unit}
                    </span>
                </div>
            </div>

            <style>{`
                .custom-range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: var(--platform-card-bg);
                    border: 2px solid ${accentColor};
                    border-radius: 50%;
                    cursor: pointer;
                    transition: transform 0.1s, box-shadow 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin-top: -1px;
                }
                .custom-range-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                .custom-range-slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: var(--platform-card-bg);
                    border: 2px solid ${accentColor};
                    border-radius: 50%;
                    cursor: pointer;
                    transition: transform 0.1s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
};

export default RangeSlider;