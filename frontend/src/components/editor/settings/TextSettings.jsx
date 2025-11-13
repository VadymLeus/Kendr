// frontend/src/components/editor/settings/TextSettings.jsx
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

const TextSettings = ({ data, onChange }) => {
    const textareaRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
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
    }, [data.aboutText]);

    return (
        <div>
            <div className="form-group" style={formGroupStyle}>
                <label style={labelStyle}>Заголовок блоку:</label>
                <input 
                    type="text" 
                    name="headerTitle" 
                    value={data.headerTitle || ''} 
                    onChange={handleChange} 
                    placeholder="Заголовок текстового блоку"
                    style={inputStyle}
                />
            </div>

            <div className="form-group" style={formGroupStyle}>
                <label style={labelStyle}>Текст блоку:</label>
                <textarea 
                    ref={textareaRef}
                    name="aboutText" 
                    value={data.aboutText || ''} 
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
        </div>
    );
};

export default TextSettings;