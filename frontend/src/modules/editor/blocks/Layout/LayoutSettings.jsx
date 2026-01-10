// frontend/src/modules/editor/blocks/Layout/LayoutSettings.jsx
import React from 'react';
import { commonStyles, ToggleGroup } from '../../controls/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { 
    IconColumns, 
    IconRows,
    IconAlignLeft,
    IconAlignCenter,
    IconAlignRight,
    IconAlignTop,
    IconAlignMiddle,
    IconAlignBottom
} from '../../../../shared/ui/elements/Icons';

const PRESETS = [
    { preset: '50-50', name: '50% / 50%', columns: 2 },
    { preset: '75-25', name: '75% / 25%', columns: 2 },
    { preset: '25-75', name: '25% / 75%', columns: 2 },
    { preset: '33-33-33', name: '33% / 33% / 33%', columns: 3 },
    { preset: '25-25-25-25', name: '25% / 25% / 25% / 25%', columns: 4 },
];

const LayoutSettings = ({ data, onChange }) => {
    
    const handlePresetChange = (e) => {
        const newPresetValue = e.target.value;
        const selectedPreset = PRESETS.find(p => p.preset === newPresetValue);
        
        if (!selectedPreset) return;

        const newColumnCount = selectedPreset.columns;
        const currentColumns = data.columns || [];
        const currentColumnCount = currentColumns.length;

        let updatedColumns = [...currentColumns];

        if (newColumnCount > currentColumnCount) {
            for (let i = 0; i < newColumnCount - currentColumnCount; i++) {
                updatedColumns.push([]);
            }
        } else if (newColumnCount < currentColumnCount) {
            const columnsToKeep = currentColumns.slice(0, newColumnCount);
            const columnsToMerge = currentColumns.slice(newColumnCount);
            const mergedBlocks = columnsToMerge.flat(); 

            if (columnsToKeep.length > 0) {
                columnsToKeep[newColumnCount - 1] = [
                    ...(columnsToKeep[newColumnCount - 1] || []), 
                    ...mergedBlocks
                ];
            }
            updatedColumns = columnsToKeep;
        }

        onChange({
            ...data,
            preset: newPresetValue,
            columns: updatedColumns,
            direction: data.direction || 'row'
        });
    };
    
    const handleChange = (name, value) => {
        onChange({ 
            ...data, 
            [name]: value, 
            direction: data.direction || 'row' 
        });
    };

    const handleDirectionChange = (direction) => {
        const update = { ...data, direction };
        if (direction === 'column') {
             update.horizontalAlign = data.horizontalAlign || 'start'; 
        } else if (direction === 'row') {
             update.verticalAlign = data.verticalAlign || 'top';
        }
        onChange(update);
    };

    const isHorizontal = data.direction === 'row' || !data.direction;
    const isVertical = data.direction === 'column';
    const directionOptions = [
        { 
            value: 'row', 
            label: <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><IconColumns size={16}/> Рядок</div> 
        },
        { 
            value: 'column', 
            label: <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><IconRows size={16}/> Стовпчик</div> 
        }
    ];

    const presetOptions = PRESETS.map(p => ({
        value: p.preset,
        label: `${p.name}`
    }));

    const verticalAlignOptions = [
        { value: 'top', label: <IconAlignTop size={18} title="Вгорі"/> },
        { value: 'middle', label: <IconAlignMiddle size={18} title="Посередині"/> },
        { value: 'bottom', label: <IconAlignBottom size={18} title="Внизу"/> }
    ];

    const horizontalAlignOptions = [
        { value: 'start', label: <IconAlignLeft size={18} title="Ліворуч"/> },
        { value: 'center', label: <IconAlignCenter size={18} title="По центру"/> },
        { value: 'end', label: <IconAlignRight size={18} title="Праворуч"/> }
    ];
    
    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Напрямок вмісту</label>
                <ToggleGroup 
                    options={directionOptions}
                    value={data.direction || 'row'}
                    onChange={handleDirectionChange}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Схема колонок</label>
                <CustomSelect
                    name="preset"
                    value={data.preset || '50-50'}
                    onChange={handlePresetChange}
                    options={presetOptions}
                    placeholder="Оберіть схему"
                />
            </div>
            
            <div style={{...commonStyles.formGroup, marginBottom: 0}}>
                <label style={commonStyles.label}>
                    {isHorizontal ? 'Вертикальне вирівнювання' : 'Горизонтальне вирівнювання'}
                </label>
                
                {isHorizontal && (
                    <>
                        <ToggleGroup
                            options={verticalAlignOptions}
                            value={data.verticalAlign || 'top'}
                            onChange={(val) => handleChange('verticalAlign', val)}
                        />
                        <div style={{fontSize: '0.75rem', color: 'var(--platform-text-secondary)', marginTop: '8px', lineHeight: '1.4'}}>
                            Вказує, як вирівнювати блоки по вертикалі, якщо вони мають різну висоту.
                        </div>
                    </>
                )}

                {isVertical && (
                    <>
                        <ToggleGroup
                            options={horizontalAlignOptions}
                            value={data.horizontalAlign || 'start'}
                            onChange={(val) => handleChange('horizontalAlign', val)}
                        />
                        <div style={{fontSize: '0.75rem', color: 'var(--platform-text-secondary)', marginTop: '8px', lineHeight: '1.4'}}>
                            Вказує, як вирівнювати блоки по ширині контейнера.
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LayoutSettings;