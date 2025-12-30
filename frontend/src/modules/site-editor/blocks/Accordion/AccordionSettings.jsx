// frontend/src/modules/site-editor/blocks/Accordion/AccordionSettings.jsx
import React, { useState, useRef, useEffect } from 'react';
import { generateBlockId, FONT_LIBRARY } from '../../core/editorConfig';
import CustomSelect from '../../../../common/components/ui/CustomSelect';
import { commonStyles } from '../../components/common/SettingsUI';
import { IconPlus, IconTrash, IconSortDesc, IconSortAsc } from '../../../../common/components/ui/Icons';

const itemWrapperStyle = {
    border: '1px solid var(--platform-border-color)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    background: 'var(--platform-card-bg)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s'
};

const itemHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    background: 'var(--platform-bg)',
    borderBottom: '1px solid transparent',
    transition: 'background 0.2s'
};

const itemHeaderTitleStyle = {
    fontWeight: '500',
    color: 'var(--platform-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.9rem',
    flex: 1
};

const itemBodyStyle = {
    padding: '1rem',
    borderTop: '1px solid var(--platform-border-color)',
    background: 'var(--platform-card-bg)'
};

const deleteButtonStyle = {
    background: 'rgba(229, 62, 62, 0.1)', 
    border: '1px solid rgba(229, 62, 62, 0.2)', 
    color: '#e53e3e',
    cursor: 'pointer',
    padding: '0',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
    marginLeft: '10px'
};

const addButtonStyle = {
    ...commonStyles.input,
    cursor: 'pointer',
    background: 'var(--platform-accent)',
    color: 'var(--platform-accent-text)',
    textAlign: 'center',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    transition: 'opacity 0.2s'
};

const AccordionSettings = ({ data, onChange }) => {
    const [openIndex, setOpenIndex] = useState(null);
    const textareaRefs = useRef([]);

    const handleItemChange = (index, field, value) => {
        const newItems = data.items.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        );
        onChange({ ...data, items: newItems });
    };

    const handleFontChange = (e) => {
        onChange({ ...data, fontFamily: e.target.value });
    };

    const handleAddItem = () => {
        const newItem = { 
            id: generateBlockId(), 
            title: 'Нове питання', 
            content: 'Тут буде відповідь...' 
        };
        onChange({ ...data, items: [...(data.items || []), newItem] });
        setOpenIndex((data.items || []).length);
    };

    const handleRemoveItem = (e, index) => {
        e.stopPropagation();
        if (window.confirm(`Видалити елемент "${data.items[index].title}"?`)) {
            onChange({ ...data, items: data.items.filter((_, i) => i !== index) });
            if (openIndex === index) setOpenIndex(null);
        }
    };
    
    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Шрифт блоку:</label>
                <CustomSelect
                    name="fontFamily"
                    value={data.fontFamily || 'global'}
                    onChange={handleFontChange}
                    options={FONT_LIBRARY}
                    style={commonStyles.input}
                />
            </div>

            <label style={commonStyles.label}>Елементи акордеону:</label>
            
            {(data.items || []).map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div 
                        key={item.id || index} 
                        style={{
                            ...itemWrapperStyle,
                            boxShadow: isOpen ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            borderColor: isOpen ? 'var(--platform-accent)' : 'var(--platform-border-color)'
                        }}
                    >
                        <div 
                            style={{
                                ...itemHeaderStyle,
                                background: isOpen ? 'var(--platform-card-bg)' : 'var(--platform-bg)'
                            }} 
                            onClick={() => toggleItem(index)}
                        >
                            <span style={itemHeaderTitleStyle}>
                                <span style={{
                                    color: isOpen ? 'var(--platform-accent)' : 'var(--platform-text-secondary)', 
                                    display: 'flex', 
                                    alignItems: 'center'
                                }}>
                                    {isOpen ? <IconSortAsc size={16} /> : <IconSortDesc size={16} />}
                                </span>
                                <span>{item.title}</span>
                            </span>
                            <button 
                                onClick={(e) => handleRemoveItem(e, index)} 
                                style={deleteButtonStyle}
                                title="Видалити"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e53e3e';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(229, 62, 62, 0.1)';
                                    e.currentTarget.style.color = '#e53e3e';
                                }}
                            >
                                <IconTrash size={14} />
                            </button>
                        </div>

                        {isOpen && (
                            <div style={itemBodyStyle}>
                                <div style={commonStyles.formGroup}>
                                    <label style={commonStyles.label}>Заголовок / Питання:</label>
                                    <input 
                                        type="text" 
                                        value={item.title} 
                                        onChange={(e) => handleItemChange(index, 'title', e.target.value)} 
                                        style={commonStyles.input}
                                    />
                                </div>
                                
                                <div style={commonStyles.formGroup}>
                                    <label style={commonStyles.label}>Вміст / Відповідь:</label>
                                    <textarea
                                        value={item.content} 
                                        onChange={(e) => handleItemChange(index, 'content', e.target.value)} 
                                        style={{
                                            ...commonStyles.textarea, 
                                            minHeight: '120px',
                                            resize: 'vertical'
                                        }}
                                        rows="5"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            <button 
                type="button" 
                onClick={handleAddItem}
                style={addButtonStyle}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
                <IconPlus size={18} />
                Додати елемент
            </button>
        </div>
    );
};

export default AccordionSettings;