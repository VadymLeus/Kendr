// frontend/src/modules/site-editor/blocks/Layout/LayoutSettings.jsx
import React from 'react';
import { commonStyles, ToggleGroup } from '../../components/common/SettingsUI';
import CustomSelect from '../../../../common/components/ui/CustomSelect';

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
    
    const handleChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value, direction: data.direction || 'row' });
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
        { value: 'row', label: 'Горизонтально' },
        { value: 'column', label: 'Вертикально' }
    ];

    const presetOptions = PRESETS.map(p => ({
        value: p.preset,
        label: `${p.name} (${p.columns} ${p.columns === 1 ? 'колонка' : (p.columns > 1 && p.columns < 5 ? 'колонки' : 'колонок')})`
    }));

    const verticalAlignOptions = [
        { value: 'top', label: 'Вгорі' },
        { value: 'middle', label: 'Посередині' },
        { value: 'bottom', label: 'Внизу' }
    ];

    const horizontalAlignOptions = [
        { value: 'start', label: 'Ліворуч' },
        { value: 'center', label: 'По центру' },
        { value: 'end', label: 'Праворуч' }
    ];
    
    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Напрямок:</label>
                <ToggleGroup 
                    options={directionOptions}
                    value={data.direction || 'row'}
                    onChange={handleDirectionChange}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Пресет колонок:</label>
                <CustomSelect
                    name="preset"
                    value={data.preset || '50-50'}
                    onChange={handlePresetChange}
                    options={presetOptions}
                    style={commonStyles.input}
                />
            </div>
            
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>
                    Вирівнювання:
                </label>
                
                {isHorizontal && (
                    <>
                        <CustomSelect
                            name="verticalAlign"
                            value={data.verticalAlign || 'top'}
                            onChange={handleChange}
                            options={verticalAlignOptions}
                            style={commonStyles.input}
                        />
                        <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'}}>
                            Вирівнює вміст колонок по вертикалі, якщо вони різної висоти
                        </small>
                    </>
                )}

                {isVertical && (
                    <>
                        <CustomSelect
                            name="horizontalAlign"
                            value={data.horizontalAlign || 'start'}
                            onChange={handleChange}
                            options={horizontalAlignOptions}
                            style={commonStyles.input}
                        />
                        <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'}}>
                            Вирівнює вміст вкладених блоків по горизонталі
                        </small>
                    </>
                )}
            </div>

            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--platform-border-color);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--platform-text-secondary);
                }
                `}
            </style>
        </div>
    );
};

export default LayoutSettings;