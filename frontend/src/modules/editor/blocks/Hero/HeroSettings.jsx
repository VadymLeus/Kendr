// frontend/src/modules/editor/blocks/Hero/HeroSettings.jsx
import React, { useState, useEffect } from 'react';
import { commonStyles, ToggleGroup, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import AlignmentControl from '../../ui/components/AlignmentControl';
import FontSelector from '../../ui/components/FontSelector';
import OverlayControl from '../../ui/components/OverlayControl';
import ButtonEditor from '../../ui/components/ButtonEditor';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput';
import { Image, Video, Moon, Sun, Type, Palette, MousePointerClick, ImageIcon } from 'lucide-react';

const HeroSettings = ({ data, onChange, siteData }) => {
    const safeData = {
        bg_type: data.bg_type || 'image',
        bg_image: data.bg_image || data.imageUrl || '',
        bg_video: data.bg_video || '',
        overlay_color: data.overlay_color || '#000000', 
        title: data.title || '',
        subtitle: data.subtitle || '',
        alignment: data.alignment || 'center',
        height: data.height || 'medium',
        titleFontFamily: data.titleFontFamily || 'global',
        contentFontFamily: data.contentFontFamily || 'global',
        theme_mode: data.theme_mode || 'light',
        overlay_opacity: (data.overlay_opacity !== undefined && !isNaN(data.overlay_opacity)) ? parseFloat(data.overlay_opacity) : 0.5,
        button: data.button || {
            text: data.button_text || '',
            link: data.button_link || '',
            styleType: 'primary',
            size: 'large',
            variant: 'solid'
        },
        ...data
    };

    const themeSettings = siteData?.theme_settings || {};
    const currentSiteFonts = {
        heading: themeSettings.font_heading,
        body: themeSettings.font_body
    };
    
    const [localTitle, setLocalTitle] = useState(safeData.title);
    const [localSubtitle, setLocalSubtitle] = useState(safeData.subtitle);
    useEffect(() => {
        setLocalTitle(safeData.title);
        setLocalSubtitle(safeData.subtitle);
    }, [safeData.title, safeData.subtitle]);

    const handleChange = (name, value) => {
        onChange({ ...safeData, [name]: value }, true);
    };

    const handleTitleBlur = () => {
        onChange({ ...safeData, title: localTitle }, true);
    };

    const handleSubtitleBlur = () => {
        onChange({ ...safeData, subtitle: localSubtitle }, true);
    };

    const handleButtonChange = (newButtonData) => {
        onChange({ 
            ...safeData, 
            button: newButtonData,
            button_text: newButtonData.text, 
            button_link: newButtonData.link
        }, true);
    };

    const handleImageChange = (val) => {
        let finalUrl = '';
        if (val && val.target && typeof val.target.value === 'string') {
            finalUrl = val.target.value;
        } else if (typeof val === 'string') {
            finalUrl = val;
        }
        const relativeUrl = finalUrl.replace(/^http:\/\/localhost:5000/, '');
        onChange({ ...safeData, bg_image: relativeUrl }, true);
    };

    const handleVideoChange = (val) => {
        let finalUrl = '';
        if (val && val.target && typeof val.target.value === 'string') {
            finalUrl = val.target.value;
        } else if (typeof val === 'string') {
            finalUrl = val;
        }
        const relativeUrl = finalUrl.replace(/^http:\/\/localhost:5000/, '');
        onChange({ ...safeData, bg_video: relativeUrl }, true);
    };

    const bgTypeOptions = [
        { value: 'image', label: <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Image size={16}/> Фото</div> },
        { value: 'video', label: <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Video size={16}/> Відео</div> }
    ];

    const themeOptions = [
        { value: 'light', label: <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Sun size={16}/> Світла</div>, title: 'Темний текст на світлому' },
        { value: 'dark', label: <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Moon size={16}/> Темна</div>, title: 'Світлий текст на темному' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}> 
            <div>
                <SectionTitle icon={<Palette size={18}/>}>Фон блоку</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Тип фону</label>
                    <ToggleGroup 
                        options={bgTypeOptions}
                        value={safeData.bg_type}
                        onChange={(val) => handleChange('bg_type', val)}
                    />
                </div>

                {safeData.bg_type === 'image' && (
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Зображення</label>
                        <div style={{height: '200px'}}>
                            <UniversalMediaInput 
                                type="image"
                                value={safeData.bg_image}
                                onChange={handleImageChange}
                                aspect={16/9}
                            />
                        </div>
                    </div>
                )}

                {safeData.bg_type === 'video' && (
                    <>
                        <div style={commonStyles.formGroup}>
                            <label style={commonStyles.label}>Відео файл</label>
                            <div style={{height: '150px', marginBottom: '8px'}}>
                                <UniversalMediaInput 
                                    type="video"
                                    value={safeData.bg_video}
                                    onChange={handleVideoChange}
                                    placeholder="Завантажити відео"
                                />
                            </div>
                        </div>

                        <div style={commonStyles.formGroup}>
                            <label style={{...commonStyles.label, display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <ImageIcon size={14} />
                                Обкладинка (Poster)
                            </label>
                            <div style={{height: '150px'}}>
                                <UniversalMediaInput 
                                    type="image"
                                    value={safeData.bg_image}
                                    onChange={handleImageChange}
                                    aspect={16/9}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Тема тексту (Контраст)</label>
                    <ToggleGroup 
                        options={themeOptions}
                        value={safeData.theme_mode}
                        onChange={(val) => handleChange('theme_mode', val)}
                    />
                </div>

                <OverlayControl 
                    color={safeData.overlay_color}
                    opacity={safeData.overlay_opacity}
                    onColorChange={(val) => handleChange('overlay_color', val)}
                    onOpacityChange={(val) => onChange({ ...safeData, overlay_opacity: val }, false)}
                />
            </div>

            <div>
                <SectionTitle icon={<Type size={18}/>}>Вміст</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <FontSelector 
                        value={safeData.titleFontFamily}
                        onChange={(val) => handleChange('titleFontFamily', val)}
                        label="Шрифт заголовка"
                        siteFonts={currentSiteFonts}
                    />
                </div>
                
                <div style={commonStyles.formGroup}>
                    <Input 
                        label="Заголовок"
                        type="text" 
                        name="title" 
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)} 
                        onBlur={handleTitleBlur}
                        placeholder="Головний заголовок"
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <FontSelector 
                        value={safeData.contentFontFamily}
                        onChange={(val) => handleChange('contentFontFamily', val)}
                        label="Шрифт тексту"
                        siteFonts={currentSiteFonts}
                    />
                </div>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Підзаголовок</label>
                    <textarea 
                        name="subtitle" 
                        className="custom-scrollbar"
                        value={localSubtitle}
                        onChange={(e) => setLocalSubtitle(e.target.value)} 
                        onBlur={handleSubtitleBlur}
                        placeholder="Короткий опис або слоган"
                        style={{
                            ...commonStyles.textarea, 
                            height: '100px',
                            minHeight: '80px',
                            maxHeight: '200px',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            overflowY: 'auto'
                        }}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <AlignmentControl 
                        label="Вирівнювання тексту"
                        value={safeData.alignment}
                        onChange={(val) => handleChange('alignment', val)}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<MousePointerClick size={18}/>}>Кнопка дії</SectionTitle>
                <ButtonEditor 
                    data={safeData.button}
                    onChange={handleButtonChange}
                    siteData={siteData}
                    showAlignment={false} 
                />
            </div>
        </div>
    );
};

export default HeroSettings;