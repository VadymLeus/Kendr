// frontend/src/modules/editor/ui/components/AlignmentControl.jsx
import React from 'react';
import { ToggleGroup } from '../configuration/SettingsUI';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

const AlignmentControl = ({ value, onChange, label, showJustify = false, gridMode = false }) => {
    if (gridMode) {
        const normalizedValue = value === 'left' ? 'middle-left' :
                                value === 'right' ? 'middle-right' :
                                value === 'center' ? 'middle-center' : 
                                value || 'middle-center';
        const positions = [
            'top-left', 'top-center', 'top-right',
            'middle-left', 'middle-center', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right'
        ];
        return (
            <div className="mb-4">
                {label && <label className="form-label block mb-3 text-center">{label}</label>}
                <div className="flex justify-center">
                    <div className="grid grid-cols-3 gap-1.5 w-24 h-24 p-2 bg-black/5 dark:bg-white/5 border border-(--platform-border-color) rounded-lg shadow-inner">
                        {positions.map(pos => (
                            <button
                                key={pos}
                                type="button"
                                onClick={() => onChange(pos)}
                                title={pos.replace('-', ' ')}
                                className={`w-full h-full rounded-[3px] transition-all duration-200 cursor-pointer ${
                                    normalizedValue === pos 
                                    ? 'bg-(--platform-accent) scale-110 shadow-sm relative z-10' 
                                    : 'bg-black/20 hover:bg-black/40 dark:bg-white/20 dark:hover:bg-white/40'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    const options = [
        { value: 'left', label: <AlignLeft size={18} />, title: 'Зліва' },
        { value: 'center', label: <AlignCenter size={18} />, title: 'По центру' },
        { value: 'right', label: <AlignRight size={18} />, title: 'Справа' },
    ];

    if (showJustify) {
        options.push({ value: 'justify', label: <AlignJustify size={18} />, title: 'По ширині' });
    }

    return (
        <div className="mb-4">
            {label && <label className="form-label block mb-2">{label}</label>}
            <ToggleGroup 
                options={options}
                value={value || 'left'}
                onChange={onChange}
            />
        </div>
    );
};

export default AlignmentControl;