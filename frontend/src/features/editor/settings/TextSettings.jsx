// frontend/src/features/editor/settings/TextSettings.jsx
import React, { useRef, useEffect } from 'react';
import { FONT_LIBRARY } from '../editorConfig';
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
    color: 'var(--platform-text-primary)', boxSizing: 'border-box',
    resize: 'none'
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

const TextSettings = ({ data, onChange }) => {
    const textareaRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };
    
    const handleAlignmentChange = (alignment) => {
        onChange({ ...data, alignment });
    };

    const autoResizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        autoResizeTextarea();
    }, [data.content]);

    const styleOptions = [
        { value: 'p', label: 'Звичайний текст (p)' },
        { value: 'h1', label: 'Заголовок 1 (h1)' },
        { value: 'h2', label: 'Заголовок 2 (h2)' },
        { value: 'h3', label: 'Заголовок 3 (h3)' }
    ];

    return (
        <div>
            <div className="form-group" style={formGroupStyle}>
                <label style={labelStyle}>Вміст блоку:</label>
                <textarea 
                    ref={textareaRef}
                    name="content" 
                    value={data.content || ''} 
                    onChange={handleChange} 
                    placeholder="Введіть основний текст тут..."
                    style={{
                        ...inputStyle, 
                        minHeight: '150px',
                        overflow: 'hidden'
                    }}
                    onInput={autoResizeTextarea}
                />
            </div>

            <div className="form-group" style={formGroupStyle}>
                <label style={labelStyle}>Вирівнювання:</label>
                <div style={toggleButtonContainerStyle}>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(data.alignment === 'left' || !data.alignment)} 
                        onClick={() => handleAlignmentChange('left')}
                    >
                        Ліво
                    </button>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(data.alignment === 'center')} 
                        onClick={() => handleAlignmentChange('center')}
                    >
                        Центр
                    </button>
                    <button 
                        type="button" 
                        style={toggleButtonStyle(data.alignment === 'right')} 
                        onClick={() => handleAlignmentChange('right')}
                    >
                        Право
                    </button>
                </div>
            </div>

            <div className="form-group" style={formGroupStyle}>
                <label style={labelStyle}>Стиль та Шрифт:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <CustomSelect 
                        name="style" 
                        value={data.style || 'p'} 
                        onChange={handleChange}
                        options={styleOptions}
                        style={inputStyle}
                    />
                    <CustomSelect
                        name="fontFamily"
                        value={data.fontFamily || 'global'}
                        onChange={handleChange}
                        options={FONT_LIBRARY}
                        style={inputStyle}
                    />
                </div>
            </div>
        </div>
    );
};

export default TextSettings;