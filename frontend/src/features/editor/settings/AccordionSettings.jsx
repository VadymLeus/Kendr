// frontend/src/features/editor/settings/AccordionSettings.jsx
import React, { useState, useRef, useEffect } from 'react';
import { generateBlockId, FONT_LIBRARY } from '../editorConfig';
import CustomSelect from '../../../components/common/CustomSelect';

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
const textareaStyle = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    overflow: 'hidden'
};
const itemWrapperStyle = {
    border: '1px solid var(--platform-border-color)',
    borderRadius: '8px',
    marginBottom: '1rem',
    background: 'var(--platform-card-bg)',
    overflow: 'hidden'
};
const itemHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    background: 'var(--platform-bg)',
    borderBottom: '1px solid var(--platform-border-color)'
};
const itemHeaderTitleStyle = {
    fontWeight: '500',
    color: 'var(--platform-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
};
const itemBodyStyle = {
    padding: '1.5rem'
};
const iconButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--platform-danger)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '4px',
    fontSize: '1.1rem',
    lineHeight: '1'
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
        // CustomSelect повертає подію з target.value
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
            setOpenIndex(null);
        }
    };
    
    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const autoResizeTextarea = (textarea) => {
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        if (openIndex !== null && textareaRefs.current[openIndex]) {
            autoResizeTextarea(textareaRefs.current[openIndex]);
        }
    }, [openIndex, data]);

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Шрифт блоку:</label>
                <CustomSelect
                    name="fontFamily"
                    value={data.fontFamily || 'global'}
                    onChange={handleFontChange}
                    options={FONT_LIBRARY}
                    style={inputStyle}
                />
            </div>

            <label style={labelStyle}>Елементи акордеону:</label>
            
            {(data.items || []).map((item, index) => (
                <div key={item.id || index} style={itemWrapperStyle}>
                    <div style={itemHeaderStyle} onClick={() => toggleItem(index)}>
                        <span style={itemHeaderTitleStyle}>
                            <span style={{fontSize: '1.2rem'}}>❓</span>
                            <span>{item.title}</span>
                        </span>
                        <button 
                            onClick={(e) => handleRemoveItem(e, index)} 
                            style={iconButtonStyle}
                            title="Видалити"
                        >
                            ❌
                        </button>
                    </div>

                    {openIndex === index && (
                        <div style={itemBodyStyle}>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Заголовок / Питання:</label>
                                <input 
                                    type="text" 
                                    value={item.title} 
                                    onChange={(e) => handleItemChange(index, 'title', e.target.value)} 
                                    style={inputStyle}
                                />
                            </div>
                            
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Вміст / Відповідь:</label>
                                <textarea
                                    ref={el => textareaRefs.current[index] = el}
                                    value={item.content} 
                                    onChange={(e) => {
                                        handleItemChange(index, 'content', e.target.value);
                                        autoResizeTextarea(e.target);
                                    }} 
                                    style={textareaStyle}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <button 
                type="button" 
                onClick={handleAddItem}
                style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    background: 'var(--platform-accent)',
                    color: 'var(--platform-accent-text)',
                    textAlign: 'center',
                    fontWeight: 500
                }}
            >
                ➕ Додати елемент
            </button>
        </div>
    );
};

export default AccordionSettings;