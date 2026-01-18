// frontend/src/modules/editor/blocks/Layout/LayoutSettings.jsx
import React from 'react';
import { commonStyles, SectionTitle } from '../../ui/configuration/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import OverlayControl from '../../ui/components/OverlayControl';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput';
import { Columns, Rows, ArrowUpToLine, AlignVerticalJustifyCenter, ArrowDownToLine, Palette, Layout, Image, Video, X, ImageIcon } from 'lucide-react';

const PRESETS = [
    { preset: '50-50', name: '50% / 50%', columns: 2 },
    { preset: '75-25', name: '75% / 25%', columns: 2 },
    { preset: '25-75', name: '25% / 75%', columns: 2 },
    { preset: '33-33-33', name: '33% / 33% / 33%', columns: 3 },
    { preset: '25-25-25-25', name: '25% / 25% / 25% / 25%', columns: 4 },
];

const LayoutSettings = ({ data, onChange }) => {
    const updateData = (newData) => onChange({ ...data, ...newData });
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
        updateData({
            preset: newPresetValue,
            columns: updatedColumns
        });
    };
    const handleImageChange = (val) => {
        let finalUrl = '';
        if (val && val.target && typeof val.target.value === 'string') finalUrl = val.target.value;
        else if (typeof val === 'string') finalUrl = val;
        
        const relativeUrl = finalUrl.replace(/^http:\/\/localhost:5000/, '');
        updateData({ bg_image: relativeUrl });
    };
    const handleVideoChange = (val) => {
        let finalUrl = '';
        if (val && val.target && typeof val.target.value === 'string') finalUrl = val.target.value;
        else if (typeof val === 'string') finalUrl = val;

        const relativeUrl = finalUrl.replace(/^http:\/\/localhost:5000/, '');
        updateData({ bg_video: relativeUrl });
    };
    const bgTypeOptions = [
        { value: 'none', label: 'Немає', icon: <X size={16}/> },
        { value: 'color', label: 'Колір', icon: <Palette size={16}/> },
        { value: 'image', label: 'Фото', icon: <Image size={16}/> },
        { value: 'video', label: 'Відео', icon: <Video size={16}/> }
    ];
    const directionOptions = [
        { value: 'row', label: <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Columns size={16}/> Рядок</div> },
        { value: 'column', label: <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Rows size={16}/> Стовпчик</div> }
    ];
    const presetOptions = PRESETS.map(p => ({ value: p.preset, label: p.name }));
    const verticalAlignOptions = [
        { value: 'top', label: <ArrowUpToLine size={18} title="Вгорі"/> },
        { value: 'middle', label: <AlignVerticalJustifyCenter size={18} title="По центру"/> },
        { value: 'bottom', label: <ArrowDownToLine size={18} title="Внизу"/> },
        { value: 'stretch', label: <div title="Розтягнути" style={{fontSize:'12px', fontWeight:'bold'}}>↕</div> }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <SectionTitle icon={<Palette size={18}/>}>Фон блоку</SectionTitle>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px', 
                    marginBottom: '16px' 
                }}>
                    {bgTypeOptions.map((opt) => {
                        const isActive = (data.bg_type || 'none') === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => updateData({ bg_type: opt.value })}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: isActive ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
                                    background: isActive ? 'var(--platform-accent-light)' : 'var(--platform-card-bg)',
                                    color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}
                            >
                                {opt.icon}
                                {opt.label}
                            </button>
                        );
                    })}
                </div>

                {data.bg_type === 'color' && (
                    <OverlayControl 
                        color={data.bg_color || '#f7fafc'}
                        opacity={1} 
                        onColorChange={(val) => updateData({ bg_color: val })}
                        onOpacityChange={() => {}} 
                    />
                )}

                {data.bg_type === 'image' && (
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Зображення</label>
                        <div style={{ height: '200px' }}>
                            <UniversalMediaInput 
                                type="image"
                                value={data.bg_image}
                                onChange={handleImageChange}
                                aspect={16/9} 
                            />
                        </div>
                    </div>
                )}

                {data.bg_type === 'video' && (
                    <>
                        <div style={commonStyles.formGroup}>
                            <label style={commonStyles.label}>Відео файл</label>
                            <div style={{ height: '200px' }}>
                                <UniversalMediaInput 
                                    type="video"
                                    value={data.bg_video}
                                    onChange={handleVideoChange}
                                    placeholder="Завантажити відео"
                                />
                            </div>
                        </div>
                        <div style={commonStyles.formGroup}>
                            <label style={{...commonStyles.label, display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <ImageIcon size={14} /> Обкладинка (Poster)
                            </label>
                            <div style={{ height: '200px' }}>
                                <UniversalMediaInput 
                                    type="image"
                                    value={data.bg_image}
                                    onChange={handleImageChange}
                                    aspect={16/9}
                                />
                            </div>
                        </div>
                    </>
                )}

                {(data.bg_type === 'image' || data.bg_type === 'video') && (
                    <OverlayControl 
                        color={data.overlay_color || '#000000'}
                        opacity={data.overlay_opacity}
                        onColorChange={(val) => updateData({ overlay_color: val })}
                        onOpacityChange={(val) => updateData({ overlay_opacity: val })}
                    />
                )}
            </div>

            <div>
                <SectionTitle icon={<Layout size={18}/>}>Макет</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Схема колонок</label>
                    <CustomSelect
                        value={data.preset || '50-50'}
                        onChange={handlePresetChange}
                        options={presetOptions}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Напрямок вмісту</label>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '8px' 
                    }}>
                         {directionOptions.map((opt) => {
                            const isActive = (data.direction || 'row') === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => updateData({ direction: opt.value })}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: isActive ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
                                        background: isActive ? 'var(--platform-accent-light)' : 'var(--platform-card-bg)',
                                        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Вертикальне вирівнювання</label>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '4px' 
                    }}>
                        {verticalAlignOptions.map((opt) => {
                             const isActive = (data.verticalAlign || 'top') === opt.value;
                             return (
                                <button
                                    key={opt.value}
                                    onClick={() => updateData({ verticalAlign: opt.value })}
                                    title={opt.label.props?.title}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: isActive ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
                                        background: isActive ? 'var(--platform-accent-light)' : 'var(--platform-card-bg)',
                                        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {opt.label}
                                </button>
                             );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayoutSettings;