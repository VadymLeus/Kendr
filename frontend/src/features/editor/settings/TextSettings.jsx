// frontend/src/features/editor/settings/TextSettings.jsx
import React, { useRef, useEffect } from 'react';

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
                <label style={labelStyle}>Стиль тексту:</label>
                <select 
                    name="style" 
                    value={data.style || 'p'} 
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="p">Звичайний текст (p)</option>
                    <option value="h1">Заголовок 1 (h1)</option>
                    <option value="h2">Заголовок 2 (h2)</option>
                    <option value="h3">Заголовок 3 (h3)</option>
                </select>
            </div>
        </div>
    );
};

export default TextSettings;