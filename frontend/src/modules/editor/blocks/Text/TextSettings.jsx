// frontend/src/modules/editor/blocks/Text/TextSettings.jsx
import React, { useRef, useEffect, useState } from 'react';
import { commonStyles, ToggleGroup, SectionTitle } from '../../ui/configuration/SettingsUI';
import AlignmentControl from '../../ui/components/AlignmentControl';
import FontSelector from '../../ui/components/FontSelector';
import { FileText, Type, Heading1, Heading2, Heading3, Pilcrow,Bold, Italic, Underline } from 'lucide-react';

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

    const formatBtnStyle = (isActive) => ({
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        cursor: 'pointer',
        borderRadius: '6px',
        border: isActive ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
        background: isActive ? 'var(--platform-accent-light)' : 'var(--platform-card-bg)',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        transition: 'all 0.2s ease'
    });

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <SectionTitle icon={<FileText size={18}/>}>Вміст</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <textarea 
                        ref={textareaRef}
                        className="custom-scrollbar"
                        value={localContent}
                        onChange={(e) => {
                            setLocalContent(e.target.value);
                            onChange({ ...data, content: e.target.value }, false);
                        }} 
                        onBlur={() => onChange({ ...data, content: localContent }, true)}
                        placeholder="Введіть текст..."
                        style={{
                            ...commonStyles.input, 
                            minHeight: '100px',
                            resize: 'none',
                            lineHeight: '1.5',
                            fontFamily: 'inherit',
                            marginBottom: '12px'
                        }}
                    />

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => toggleStyle('isBold')}
                            style={formatBtnStyle(data.isBold)}
                            title="Напівжирний"
                        >
                            <Bold size={18} />
                        </button>
                        <button 
                            onClick={() => toggleStyle('isItalic')}
                            style={formatBtnStyle(data.isItalic)}
                            title="Курсив"
                        >
                            <Italic size={18} />
                        </button>
                        <button 
                            onClick={() => toggleStyle('isUnderline')}
                            style={formatBtnStyle(data.isUnderline)}
                            title="Підкреслений"
                        >
                            <Underline size={18} />
                        </button>
                    </div>
                </div>

                <div style={commonStyles.formGroup}>
                    <AlignmentControl 
                        value={data.alignment}
                        onChange={(val) => handleChange('alignment', val)}
                        showJustify={true} 
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<Type size={18}/>}>Типографіка</SectionTitle>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Семантика</label>
                    <ToggleGroup 
                        options={tagOptions}
                        value={data.tag || 'p'}
                        onChange={(val) => handleChange('tag', val)}
                    />
                </div>

                <div style={commonStyles.formGroup}>
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