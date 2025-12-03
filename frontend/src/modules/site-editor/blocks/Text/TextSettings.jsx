// frontend/src/modules/site-editor/blocks/Text/TextSettings.jsx
import React, { useRef, useEffect, useState } from 'react';
import { FONT_LIBRARY } from '../../core/editorConfig';
import CustomSelect from '../../../../common/components/ui/CustomSelect';

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
    
    const [localContent, setLocalContent] = useState(data.content || '');

    useEffect(() => {
        setLocalContent(data.content || '');
    }, [data.content]);

    const handleContentChange = (e) => {
        const val = e.target.value;
        setLocalContent(val);
        onChange({ ...data, content: val }, false);
        autoResizeTextarea();
    };

    const handleContentBlur = () => {
        if (localContent !== data.content) {
             onChange({ ...data, content: localContent }, true);
        }
    };

    const handleAttributeChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value }, true); 
    };
    
    const handleAlignmentChange = (alignment) => {
        onChange({ ...data, alignment }, true);
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
    }, [localContent]);

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
                    value={localContent}
                    onChange={handleContentChange} 
                    onBlur={handleContentBlur}
                    placeholder="Введіть основний текст тут..."
                    style={{
                        ...inputStyle, 
                        minHeight: '150px',
                        overflow: 'hidden'
                    }}
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
                        onChange={(e) => handleAttributeChange(e)}
                        options={styleOptions}
                        style={inputStyle}
                    />
                    <CustomSelect
                        name="fontFamily"
                        value={data.fontFamily || 'global'}
                        onChange={(e) => onChange({ ...data, fontFamily: e.target.value }, true)}
                        options={FONT_LIBRARY}
                        style={inputStyle}
                    />
                </div>
            </div>
        </div>
    );
};

export default TextSettings;