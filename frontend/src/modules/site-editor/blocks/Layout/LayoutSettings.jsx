// frontend/src/modules/site-editor/blocks/Layout/LayoutSettings.jsx
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
const toggleButtonContainerStyle = {
    display: 'flex',
    borderRadius: '6px',
    border: '1px solid var(--platform-border-color)',
    overflow: 'hidden'
};
const toggleButtonStyle = (isActive) => ({
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    background: isActive ? 'var(--platform-accent)' : 'var(--platform-card-bg)',
    color: isActive ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'background 0.2s, color 0.2s'
});

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
    
    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Напрямок:</label>
                <div style={toggleButtonContainerStyle}>
                    <button
                        type="button"
                        style={toggleButtonStyle(isHorizontal)}
                        onClick={() => handleDirectionChange('row')}
                    >
                        Горизонтально
                    </button>
                    <button
                        type="button"
                        style={toggleButtonStyle(isVertical)}
                        onClick={() => handleDirectionChange('column')}
                    >
                        Вертикально
                    </button>
                </div>
            </div>

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
                <label style={labelStyle}>
                    Вирівнювання:
                </label>
                
                {isHorizontal && (
                    <>
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
                            Вирівнює вміст колонок по вертикалі, якщо вони різної висоти
                        </small>
                    </>
                )}

                {isVertical && (
                    <>
                        <select
                            name="horizontalAlign"
                            value={data.horizontalAlign || 'start'}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="start">Ліворуч</option>
                            <option value="center">По центру</option>
                            <option value="end">Праворуч</option>
                        </select>
                        <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'}}>
                            Вирівнює вміст вкладених блоків по горизонталі
                        </small>
                    </>
                )}
            </div>
        </div>
    );
};

export default LayoutSettings;