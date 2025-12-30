// frontend/src/modules/site-editor/blocks/Features/FeaturesSettings.jsx
import React, { useState } from 'react';
import { generateBlockId } from '../../core/editorConfig';
import { useConfirm } from '../../../../common/hooks/useConfirm';
import CustomSelect from '../../../../common/components/ui/CustomSelect';
import { commonStyles, SectionTitle } from '../../components/common/SettingsUI';

const itemWrapperStyle = {
    border: '1px solid var(--platform-border-color)', borderRadius: '8px',
    marginBottom: '1rem', background: 'var(--platform-card-bg)', overflow: 'hidden'
};

const itemHeaderStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 1rem', cursor: 'pointer', background: 'var(--platform-bg)',
    borderBottom: '1px solid var(--platform-border-color)'
};

const iconPresetGridStyle = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
    gap: '0.5rem', marginTop: '0.75rem'
};

const FeaturesSettings = ({ data, onChange }) => {
    const [openIndex, setOpenIndex] = useState(null);
    const { confirm } = useConfirm();

    const presetIcons = ['⭐', '💡', '🚀', '🛡️', '💬', '✅', '📦', '🚚', '📈', '⚙️', '🔒', '🌍'];

    const handleDataChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    const handleFeatureChange = (index, field, value) => {
        const newItems = data.items.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        );
        onChange({ ...data, items: newItems });
    };

    const handleAddFeature = () => {
        if (data.items && data.items.length >= 8) {
            alert("Можна додати максимум 8 переваг.");
            return;
        }
        const newItem = { 
            id: generateBlockId(), 
            icon: '⭐', title: 'Нова перевага', text: 'Короткий опис' 
        };
        onChange({ ...data, items: [...(data.items || []), newItem] });
        setOpenIndex((data.items || []).length);
    };

    const handleRemoveFeature = async (e, index) => {
        e.stopPropagation(); 
        
        const isConfirmed = await confirm({
            title: "Видалити перевагу?",
            message: `Ви впевнені, що хочете видалити елемент "${data.items[index].title}"?`,
            type: "danger",
            confirmLabel: "Видалити",
            cancelLabel: "Скасувати"
        });

        if (isConfirmed) {
            onChange({ ...data, items: data.items.filter((_, i) => i !== index) });
            setOpenIndex(null);
        }
    };
    
    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const columnOptions = [
        { value: 1, label: '1 колонка' },
        { value: 2, label: '2 колонки' },
        { value: 3, label: '3 колонки' },
        { value: 4, label: '4 колонки' },
    ];

    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Заголовок розділу:</label>
                <input 
                    type="text" 
                    name="title"
                    value={data.title || 'Наші переваги'} 
                    onChange={handleDataChange}
                    style={commonStyles.input}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Кількість колонок:</label>
                <CustomSelect 
                    name="columns" 
                    value={data.columns || 3} 
                    onChange={(e) => onChange({ ...data, columns: parseInt(e.target.value) })}
                    options={columnOptions}
                    style={commonStyles.input}
                />
            </div>

            <SectionTitle>
                Список переваг ({(data.items || []).length} / 8)
            </SectionTitle>
            
            {(data.items || []).map((item, index) => (
                <div key={item.id || index} style={itemWrapperStyle}>
                    <div style={itemHeaderStyle} onClick={() => toggleItem(index)}>
                        <span style={{ fontWeight: '500', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{fontSize: '1.2rem'}}>{item.icon}</span>
                            <span>{item.title}</span>
                        </span>

                        <button 
                            onClick={(e) => handleRemoveFeature(e, index)} 
                            style={{ background: 'none', border: 'none', color: 'var(--platform-danger)', cursor: 'pointer', fontSize: '1.1rem' }}
                            title="Видалити"
                        >
                            ❌
                        </button>
                    </div>

                    {openIndex === index && (
                        <div style={{ padding: '1.5rem' }}>
                            <div style={commonStyles.formGroup}>
                                <label style={commonStyles.label}>Іконка:</label>
                                <input 
                                    type="text" 
                                    value={item.icon} 
                                    onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)} 
                                    style={commonStyles.input}
                                    maxLength="5"
                                />
                                <div style={iconPresetGridStyle}>
                                    {presetIcons.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            style={{
                                                border: '1px solid var(--platform-border-color)',
                                                color: 'var(--platform-text-primary)',
                                                fontSize: '1.25rem',
                                                background: 'var(--platform-card-bg)',
                                                cursor: 'pointer', borderRadius: '4px', padding: '0.5rem'
                                            }}
                                            onClick={() => handleFeatureChange(index, 'icon', icon)}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={commonStyles.formGroup}>
                                <label style={commonStyles.label}>Заголовок:</label>
                                <input 
                                    type="text" 
                                    value={item.title} 
                                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)} 
                                    style={commonStyles.input}
                                />
                            </div>
                            
                            <div style={commonStyles.formGroup}>
                                <label style={commonStyles.label}>Опис:</label>
                                <textarea 
                                    value={item.text} 
                                    onChange={(e) => handleFeatureChange(index, 'text', e.target.value)} 
                                    style={{...commonStyles.textarea, minHeight: '100px'}}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <button 
                type="button" 
                onClick={handleAddFeature}
                disabled={(data.items || []).length >= 8}
                style={{
                    width: '100%', padding: '0.6rem', marginTop: '0.5rem',
                    background: 'var(--platform-card-bg)', border: '1px dashed var(--platform-border-color)',
                    cursor: (data.items || []).length >= 8 ? 'not-allowed' : 'pointer',
                    color: 'var(--platform-text-primary)',
                    opacity: (data.items || []).length >= 8 ? 0.7 : 1
                }}
            >
                ➕ Додати перевагу
            </button>
        </div>
    );
};

export default FeaturesSettings;