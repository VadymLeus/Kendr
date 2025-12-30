// frontend/src/modules/site-editor/blocks/Text/TextSettings.jsx
import React, { useRef, useEffect, useState } from 'react';
import { FONT_LIBRARY } from '../../core/editorConfig';
import CustomSelect from '../../../../common/components/ui/CustomSelect';
import { commonStyles, ToggleGroup } from '../../components/common/SettingsUI';

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

    const alignOptions = [
        { value: 'left', label: 'Ліво' },
        { value: 'center', label: 'Центр' },
        { value: 'right', label: 'Право' }
    ];

    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Вміст блоку:</label>
                <textarea 
                    ref={textareaRef}
                    name="content" 
                    value={localContent}
                    onChange={handleContentChange} 
                    onBlur={handleContentBlur}
                    placeholder="Введіть основний текст тут..."
                    style={{
                        ...commonStyles.input, 
                        minHeight: '150px',
                        resize: 'none',
                        overflow: 'hidden'
                    }}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Вирівнювання:</label>
                <ToggleGroup 
                    options={alignOptions}
                    value={data.alignment || 'left'}
                    onChange={handleAlignmentChange}
                />
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Стиль та Шрифт:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <CustomSelect 
                        name="style" 
                        value={data.style || 'p'} 
                        onChange={handleAttributeChange}
                        options={styleOptions}
                        style={commonStyles.input}
                    />
                    <CustomSelect
                        name="fontFamily"
                        value={data.fontFamily || 'global'}
                        onChange={(e) => onChange({ ...data, fontFamily: e.target.value }, true)}
                        options={FONT_LIBRARY}
                        style={commonStyles.input}
                    />
                </div>
            </div>
        </div>
    );
};

export default TextSettings;