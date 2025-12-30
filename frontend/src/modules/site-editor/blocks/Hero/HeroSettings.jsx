// frontend/src/modules/site-editor/blocks/Hero/HeroSettings.jsx
import React, { useState, useEffect } from 'react';
import ImageInput from '../../../media/components/ImageInput';
import MediaInput from '../../../media/components/MediaInput';
import { FONT_LIBRARY } from '../../core/editorConfig';
import CustomSelect from '../../../../common/components/ui/CustomSelect';
import { commonStyles, ToggleGroup, SectionTitle } from '../../components/common/SettingsUI';

const HeroSettings = ({ data, onChange }) => {
    
    const safeData = {
        bg_type: data.bg_type || 'image',
        bg_image: data.bg_image || data.imageUrl || '',
        bg_video: data.bg_video || '',
        overlay_color: data.overlay_color || 'rgba(0, 0, 0, 0.5)',
        title: data.title || '',
        subtitle: data.subtitle || '',
        button_text: data.button_text || data.buttonText || '',
        button_link: data.button_link || data.buttonLink || '',
        alignment: data.alignment || 'center',
        height: data.height || 'medium',
        fontFamily: data.fontFamily || 'global',
        theme_mode: data.theme_mode || 'auto',
        overlay_opacity: data.overlay_opacity !== undefined ? data.overlay_opacity : 0.5,
        ...data
    };
    
    const [localTitle, setLocalTitle] = useState(safeData.title);
    const [localSubtitle, setLocalSubtitle] = useState(safeData.subtitle);

    useEffect(() => {
        setLocalTitle(safeData.title);
        setLocalSubtitle(safeData.subtitle);
    }, [safeData.title, safeData.subtitle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...safeData, [name]: value }, true);
    };

    const handleOpacityChange = (e) => {
        onChange({ ...safeData, overlay_opacity: parseFloat(e.target.value) }, false);
    };

    const handleOpacityCommit = (e) => {
        onChange({ ...safeData, overlay_opacity: parseFloat(e.target.value) }, true);
    };

    const handleTitleChange = (e) => {
        setLocalTitle(e.target.value);
        onChange({ ...safeData, title: e.target.value }, false);
    };

    const handleTitleBlur = () => {
        onChange({ ...safeData, title: localTitle }, true);
    };

    const handleSubtitleChange = (e) => {
        setLocalSubtitle(e.target.value);
        onChange({ ...safeData, subtitle: e.target.value }, false);
    };

    const handleSubtitleBlur = () => {
        onChange({ ...safeData, subtitle: localSubtitle }, true);
    };

    const handleImageChange = (newUrl) => {
        const relativeUrl = newUrl.replace(/^http:\/\/localhost:5000/, '');
        onChange({ ...safeData, bg_image: relativeUrl }, true);
    };

    const handleVideoChange = (newUrl) => {
        const relativeUrl = newUrl.replace(/^http:\/\/localhost:5000/, '');
        onChange({ ...safeData, bg_video: relativeUrl }, true);
    };

    const handleAlignmentChange = (alignment) => {
        onChange({ ...safeData, alignment }, true);
    };

    const handleChangeDirect = (name, value) => {
        onChange({ ...safeData, [name]: value }, true);
    };
    
    const heightOptions = [
        { value: 'small', label: 'Маленька (300px)' },
        { value: 'medium', label: 'Середня (500px)' },
        { value: 'large', label: 'Велика (700px)' },
        { value: 'full', label: 'На весь екран' },
    ];

    const bgTypeOptions = [
        { value: 'image', label: '🖼️ Картинка' },
        { value: 'video', label: '🎥 Відео' }
    ];

    const themeOptions = [
        { value: 'auto', label: '🌓 Авто', title: 'Як на сайті' },
        { value: 'light', label: '☀️ Світла', title: 'Чорний текст на білому' },
        { value: 'dark', label: '🌙 Темна', title: 'Білий текст на темному' },
    ];

    const alignOptions = [
        { value: 'left', label: '⬅️ Зліва' },
        { value: 'center', label: '⏺️ Центр' },
        { value: 'right', label: '➡️ Справа' },
    ];

    return (
        <div> 
            <div style={{ marginBottom: '2rem' }}>
                <SectionTitle>🖼️ Фон блоку</SectionTitle>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Тип фону:</label>
                    <ToggleGroup 
                        options={bgTypeOptions}
                        value={safeData.bg_type}
                        onChange={(val) => handleChangeDirect('bg_type', val)}
                    />
                </div>

                {safeData.bg_type === 'image' && (
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Зображення:</label>
                        <div style={{height: '150px'}}>
                            <ImageInput 
                                value={safeData.bg_image}
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                )}

                {safeData.bg_type === 'video' && (
                    <>
                        <div style={commonStyles.formGroup}>
                            <label style={commonStyles.label}>Відео файл (MP4/WebM):</label>
                            <div style={{height: '150px'}}>
                                <MediaInput 
                                    type="video"
                                    value={safeData.bg_video}
                                    onChange={handleVideoChange}
                                    placeholder="Завантажити відео"
                                />
                            </div>
                            <small style={{display:'block', marginTop:5, color:'var(--platform-text-secondary)', fontSize: '0.8rem'}}>
                                Рекомендовано: короткі зациклені відео до 15МБ.
                            </small>
                        </div>

                        <div style={commonStyles.formGroup}>
                            <label style={commonStyles.label}>Постер (показується, поки відео вантажиться):</label>
                            <div style={{height: '100px'}}>
                                <ImageInput 
                                    value={safeData.bg_image}
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>🎨 Тема блоку (Контраст):</label>
                    <ToggleGroup 
                        options={themeOptions}
                        value={safeData.theme_mode}
                        onChange={(val) => handleChangeDirect('theme_mode', val)}
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                        Оберіть "Темну", якщо використовуєте фотографію.
                    </small>
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>
                        🌑 Затемнення фону: {Math.round(safeData.overlay_opacity * 100)}%
                    </label>
                    <input 
                        type="range" 
                        name="overlay_opacity" 
                        min="0" 
                        max="0.9" 
                        step="0.1" 
                        value={safeData.overlay_opacity}
                        onChange={handleOpacityChange}
                        onMouseUp={handleOpacityCommit}
                        onTouchEnd={handleOpacityCommit}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Колір накладання:</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <input 
                            type="text" 
                            name="overlay_color" 
                            value={safeData.overlay_color}
                            onChange={handleChange}
                            placeholder="rgba(0,0,0,0.5)"
                            style={commonStyles.input}
                        />
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '4px', 
                            background: safeData.overlay_color,
                            border: '1px solid var(--platform-border-color)', flexShrink: 0
                        }} />
                    </div>
                </div>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Висота блоку:</label>
                    <CustomSelect 
                        name="height" 
                        value={safeData.height} 
                        onChange={handleChange} 
                        options={heightOptions}
                        style={commonStyles.input}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <SectionTitle>📝 Вміст</SectionTitle>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Шрифт тексту:</label>
                    <CustomSelect
                        name="fontFamily"
                        value={safeData.fontFamily}
                        onChange={handleChange}
                        options={FONT_LIBRARY}
                        style={commonStyles.input}
                    />
                </div>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Заголовок:</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={localTitle}
                        onChange={handleTitleChange} 
                        onBlur={handleTitleBlur}
                        placeholder="Головний заголовок"
                        style={commonStyles.input}
                    />
                </div>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Підзаголовок:</label>
                    <textarea 
                        name="subtitle" 
                        value={localSubtitle}
                        onChange={handleSubtitleChange} 
                        onBlur={handleSubtitleBlur}
                        placeholder="Короткий опис"
                        style={{
                            ...commonStyles.textarea, 
                            height: '180px',
                            minHeight: '180px',
                            maxHeight: '400px',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Вирівнювання тексту:</label>
                    <ToggleGroup 
                        options={alignOptions}
                        value={safeData.alignment}
                        onChange={handleAlignmentChange}
                    />
                </div>
            </div>

            <div>
                <SectionTitle>🔘 Кнопка дії</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Текст кнопки:</label>
                    <input 
                        type="text" 
                        name="button_text" 
                        value={safeData.button_text}
                        onChange={handleChange}
                        placeholder="Наприклад: Детальніше"
                        style={commonStyles.input}
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                        Залиште порожнім, щоб приховати кнопку.
                    </small>
                </div>
                
                {safeData.button_text && (
                    <div style={commonStyles.formGroup}>
                        <label style={commonStyles.label}>Посилання кнопки:</label>
                        <input 
                            type="text" 
                            name="button_link" 
                            value={safeData.button_link}
                            onChange={handleChange}
                            placeholder="/catalog"
                            style={commonStyles.input}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroSettings;