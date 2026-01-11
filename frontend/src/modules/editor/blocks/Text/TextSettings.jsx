// frontend/src/modules/editor/blocks/Text/TextSettings.jsx
import React, { useRef, useEffect, useState } from 'react';
import { FONT_LIBRARY } from '../../core/editorConfig';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { commonStyles, ToggleGroup, SectionTitle } from '../../controls/SettingsUI';
import apiClient from '../../../../shared/api/api';
import { 
    AlignLeft, 
    AlignCenter, 
    AlignRight,
    FileText,
    Type
} from 'lucide-react';

const TextSettings = ({ data, onChange }) => {
    const textareaRef = useRef(null);
    const [localContent, setLocalContent] = useState(data.content || '');
    const [uploadedFonts, setUploadedFonts] = useState([]);

    useEffect(() => {
        setLocalContent(data.content || '');
    }, [data.content]);
    
    useEffect(() => {
        const fetchCustomFonts = async () => {
            try {
                const res = await apiClient.get('/media');
                if (Array.isArray(res.data)) {
                    const fonts = res.data
                        .filter(f => 
                            f.file_type === 'font' || 
                            f.mime_type?.includes('font') || 
                            /\.(ttf|otf|woff|woff2)$/i.test(f.original_file_name)
                        )
                        .map(f => ({
                            value: f.path_full,
                            label: f.alt_text || f.original_file_name
                        }));
                    setUploadedFonts(fonts);
                }
            } catch (error) {
                console.error("Не вдалося завантажити список шрифтів:", error);
            }
        };

        fetchCustomFonts();
    }, []);

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
        { value: 'left', label: <AlignLeft size={18} /> },
        { value: 'center', label: <AlignCenter size={18} /> },
        { value: 'right', label: <AlignRight size={18} /> }
    ];

    const safeLibrary = Array.isArray(FONT_LIBRARY) 
        ? FONT_LIBRARY.filter(f => f.value !== 'global') 
        : [];
    
    const extendedFontOptions = [
        { value: 'global', label: 'За замовчуванням' },
        { value: 'site_heading', label: 'Шрифт заголовків' },
        { value: 'site_body', label: 'Шрифт тексту' },
        ...(uploadedFonts.length > 0 ? [
            { value: 'separator-custom', label: '--- Власні шрифти ---', disabled: true },
            ...uploadedFonts
        ] : []),
        
        { value: 'separator-google', label: '--- Google Fonts ---', disabled: true },
        ...safeLibrary
    ];

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <SectionTitle icon={<FileText size={18}/>}>Текст</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <textarea 
                        ref={textareaRef}
                        name="content" 
                        className="custom-scrollbar"
                        value={localContent}
                        onChange={handleContentChange} 
                        onBlur={handleContentBlur}
                        placeholder="Введіть основний текст тут..."
                        style={{
                            ...commonStyles.input, 
                            minHeight: '120px',
                            resize: 'vertical',
                            lineHeight: '1.5',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Вирівнювання</label>
                    <ToggleGroup 
                        options={alignOptions}
                        value={data.alignment || 'left'}
                        onChange={handleAlignmentChange}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<Type size={18}/>}>Стиль та Типографіка</SectionTitle>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Тип тексту</label>
                    <CustomSelect 
                        name="style" 
                        value={data.style || 'p'} 
                        onChange={handleAttributeChange}
                        options={styleOptions}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Шрифт</label>
                    <CustomSelect
                        name="fontFamily"
                        value={data.fontFamily || 'global'}
                        onChange={(e) => onChange({ ...data, fontFamily: e.target.value }, true)}
                        options={extendedFontOptions}
                    />
                </div>
            </div>
        </div>
    );
};

export default TextSettings;