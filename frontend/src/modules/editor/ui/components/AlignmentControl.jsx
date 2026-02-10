// frontend/src/modules/editor/ui/components/AlignmentControl.jsx
import React from 'react';
import { ToggleGroup } from '../configuration/SettingsUI';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

const AlignmentControl = ({ value, onChange, label = "Вирівнювання", showJustify = false }) => {
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
            <label className="form-label">
                {label}
            </label>
            <ToggleGroup 
                options={options}
                value={value || 'left'}
                onChange={onChange}
            />
        </div>
    );
};

export default AlignmentControl;