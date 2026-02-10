// frontend/src/modules/editor/blocks/Text/TextSettings.jsx
import React, { useRef, useEffect, useState } from 'react';
import { ToggleGroup, SectionTitle } from '../../ui/configuration/SettingsUI';
import AlignmentControl from '../../ui/components/AlignmentControl';
import FontSelector from '../../ui/components/FontSelector';
import { FileText, Type, Heading1, Heading2, Heading3, Pilcrow, Bold, Italic, Underline } from 'lucide-react';

const TextSettings = ({ data, onChange, siteData }) => {
    const textareaRef = useRef(null);
    const [localContent, setLocalContent] = useState(data.content || '');
    const themeSettings = siteData?.theme_settings || {};
    const currentSiteFonts = {
        heading: themeSettings.font_heading,
        body: themeSettings.font_body
    };

    useEffect(() => {
        setLocalContent(data.content || '');
    }, [data.content]);

    const handleChange = (key, value) => {
        onChange({ ...data, [key]: value }, true);
    };

    const toggleStyle = (key) => {
        onChange({ ...data, [key]: !data[key] }, true);
    };
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [localContent]);

    const tagOptions = [
        { value: 'p', label: <div title="Параграф"><Pilcrow size={18} /></div> },
        { value: 'h1', label: <div title="Заголовок H1"><Heading1 size={18} /></div> },
        { value: 'h2', label: <div title="Заголовок H2"><Heading2 size={18} /></div> },
        { value: 'h3', label: <div title="Заголовок H3"><Heading3 size={18} /></div> },
    ];

    return (
        <div>
            <div className="mb-8">
                <SectionTitle icon={<FileText size={18}/>}>Вміст</SectionTitle>
                
                <div className="form-group">
                    <textarea 
                        ref={textareaRef}
                        className="custom-input custom-scrollbar"
                        value={localContent}
                        onChange={(e) => {
                            setLocalContent(e.target.value);
                            onChange({ ...data, content: e.target.value }, false);
                        }} 
                        onBlur={() => onChange({ ...data, content: localContent }, true)}
                        placeholder="Введіть текст..."
                        style={{
                            minHeight: '100px',
                            resize: 'none',
                            lineHeight: '1.5',
                            marginBottom: '12px',
                            height: 'auto'
                        }}
                    />

                    <div className="flex gap-2">
                        <button 
                            onClick={() => toggleStyle('isBold')}
                            className={`btn btn-icon-square ${data.isBold ? 'btn-primary' : 'btn-outline'}`}
                            title="Напівжирний"
                        >
                            <Bold size={18} />
                        </button>
                        <button 
                            onClick={() => toggleStyle('isItalic')}
                            className={`btn btn-icon-square ${data.isItalic ? 'btn-primary' : 'btn-outline'}`}
                            title="Курсив"
                        >
                            <Italic size={18} />
                        </button>
                        <button 
                            onClick={() => toggleStyle('isUnderline')}
                            className={`btn btn-icon-square ${data.isUnderline ? 'btn-primary' : 'btn-outline'}`}
                            title="Підкреслений"
                        >
                            <Underline size={18} />
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <AlignmentControl 
                        value={data.alignment}
                        onChange={(val) => handleChange('alignment', val)}
                        showJustify={true} 
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<Type size={18}/>}>Типографіка</SectionTitle>

                <div className="form-group">
                    <label className="form-label">Семантика</label>
                    <ToggleGroup 
                        options={tagOptions}
                        value={data.tag || 'p'}
                        onChange={(val) => handleChange('tag', val)}
                    />
                </div>

                <div className="form-group">
                    <FontSelector 
                        value={data.fontFamily}
                        onChange={(val) => handleChange('fontFamily', val)}
                        label="Шрифт"
                        siteFonts={currentSiteFonts}
                    />
                </div>
            </div>
        </div>
    );
};

export default TextSettings;