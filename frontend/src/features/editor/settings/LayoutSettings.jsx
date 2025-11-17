// frontend/src/features/editor/settings/LayoutSettings.jsx
import React from 'react';

const formGroupStyle = { marginBottom: '1.5rem' };
const labelStyle = { 
    display: 'block', marginBottom: '0.5rem', 
    color: 'var(--platform-text-primary)', fontWeight: '500' 
};
const inputStyle = { 
    width: '100%', padding: '0.75rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '1rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box' 
};
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
            columns: updatedColumns
        });
    };
    
    const handleChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Пресет колонок:</label>
                <select
                    name="preset"
                    value={data.preset || '50-50'}
                    onChange={handlePresetChange}
                    style={inputStyle}
                >
                    {PRESETS.map(p => (
                        <option key={p.preset} value={p.preset}>
                            {p.name} ({p.columns} {p.columns === 1 ? 'колонка' : (p.columns > 1 && p.columns < 5 ? 'колонки' : 'колонок')})
                        </option>
                    ))}
                </select>
            </div>
            
            <div style={formGroupStyle}>
                <label style={labelStyle}>Вертикальне вирівнювання:</label>
                <select
                    name="verticalAlign"
                    value={data.verticalAlign || 'top'}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="top">Вгорі</option>
                    <option value="middle">Посередині</option>
                    <option value="bottom">Внизу</option>
                </select>
                <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'}}>
                    Вирівнює вміст колонок по вертикалі, якщо вони різної висоти.
                </small>
            </div>
        </div>
    );
};

export default LayoutSettings;