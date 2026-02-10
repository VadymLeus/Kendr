// frontend/src/modules/editor/ui/components/OverlayControl.jsx
import React, { useState } from 'react';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import { Check, Pencil } from 'lucide-react';

const OVERLAY_PRESETS = [
    { id: 'transparent', name: 'Без заливки', isNone: true },
    { id: '#000000', name: 'Чорний' },
    { id: '#ffffff', name: 'Білий' },
    { id: '#1a202c', name: 'Темний' },
    { id: '#2c5282', name: 'Синій' },
    { id: '#276749', name: 'Зелений' },
    { id: '#742a2a', name: 'Червоний' },
];

const isLightColor = (color) => {
    if (!color || color === 'transparent') return true;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
};

const OverlayControl = ({ 
    color, 
    opacity, 
    onColorChange, 
    onOpacityChange 
}) => {
    const [hoveredValue, setHoveredValue] = useState(null);
    const sliderValue = Math.round((opacity !== undefined ? opacity : 0.5) * 100);
    const handleSliderChange = (newValue) => {
        const val = parseFloat(newValue); 
        const newOpacity = val / 100;
        onOpacityChange(newOpacity);
    };

    const isPreset = OVERLAY_PRESETS.some(p => p.id === color);
    const isTransparent = color === 'transparent';
    const activeColor = (!isTransparent && color && color.length === 7) ? color : '#000000';
    return (
        <>
            <div className="form-group">
                <label className="form-label">Колір накладання</label>
                <div className="grid grid-cols-4 gap-3 mb-3 p-1">
                    {OVERLAY_PRESETS.map(preset => {
                        const isSelected = color === preset.id;
                        const isHovered = hoveredValue === preset.id;
                        const borderColor = (preset.isNone || isLightColor(preset.id)) ? '#000000' : preset.id;
                        return (
                            <button 
                                key={preset.id}
                                onClick={() => onColorChange(preset.id)}
                                onMouseEnter={() => setHoveredValue(preset.id)}
                                onMouseLeave={() => setHoveredValue(null)}
                                title={preset.name}
                                className={`
                                    w-full aspect-square rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-200 cursor-pointer
                                    ${isSelected ? 'z-2' : 'z-1'}
                                `}
                                style={{
                                    background: preset.isNone ? 'transparent' : preset.id,
                                    backgroundImage: preset.isNone ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                                    backgroundSize: preset.isNone ? '8px 8px' : 'auto',
                                    backgroundPosition: preset.isNone ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'center',
                                    border: isSelected 
                                        ? `3px solid var(--platform-card-bg)` 
                                        : `1px solid ${isHovered ? borderColor : 'var(--platform-border-color)'}`,
                                    boxShadow: isSelected 
                                        ? `0 0 0 2px ${borderColor}` 
                                        : (isHovered ? `0 0 0 1px ${borderColor}` : 'none'),
                                    transform: (isSelected || isHovered) ? 'scale(1.1)' : 'scale(1)',
                                }}
                            >
                                {isSelected && (
                                    <Check size={16} style={{ color: (preset.isNone || isLightColor(preset.id)) ? 'black' : 'white' }} />
                                )}
                            </button>
                        );
                    })}

                    <label 
                        className={`
                            w-full aspect-square rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-200 cursor-pointer
                            ${((!isPreset && !isTransparent) || hoveredValue === 'custom') ? 'z-2' : 'z-1'}
                        `}
                        onMouseEnter={() => setHoveredValue('custom')}
                        onMouseLeave={() => setHoveredValue(null)}
                        title="Власний колір"
                        style={{
                            border: (!isPreset && !isTransparent) 
                                ? `3px solid var(--platform-card-bg)` 
                                : (hoveredValue === 'custom' ? `1px solid ${activeColor}` : '2px dashed var(--platform-border-color)'),
                            boxShadow: (!isPreset && !isTransparent) 
                                ? `0 0 0 2px ${activeColor}` 
                                : (hoveredValue === 'custom' ? `0 0 0 1px ${activeColor}` : 'none'),
                            backgroundColor: (!isPreset && !isTransparent) ? color : 'transparent',
                            transform: ((!isPreset && !isTransparent) || hoveredValue === 'custom') ? 'scale(1.1)' : 'scale(1)',
                        }}
                    >
                        <input 
                            type="color" 
                            value={activeColor}
                            onChange={(e) => onColorChange(e.target.value)} 
                            className="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0"
                        />
                        <Pencil size={16} style={{ color: isLightColor(color) ? 'black' : 'white' }} />
                    </label>
                </div>
            </div>

            <div 
                className="form-group transition-opacity duration-200"
                style={{
                    opacity: isTransparent ? 0.5 : 1, 
                    pointerEvents: isTransparent ? 'none' : 'auto',
                }}
            >
                <label className="form-label">Непрозорість заливки</label>
                <RangeSlider 
                    value={sliderValue}
                    onChange={handleSliderChange} 
                    min={0} max={100} step={5} unit="%"
                />
            </div>
        </>
    );
};

export default OverlayControl;