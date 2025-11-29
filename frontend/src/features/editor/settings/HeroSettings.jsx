// frontend/src/features/editor/settings/HeroSettings.jsx
import React, { useState, useEffect } from 'react';
import ImageInput from '../../media/ImageInput';
import MediaInput from '../../media/MediaInput';
import { FONT_LIBRARY } from '../editorConfig';
import CustomSelect from '../../../components/common/CustomSelect';

const formGroupStyle = { marginBottom: '1.5rem' };
const labelStyle = { 
    display: 'block', marginBottom: '0.5rem', 
    color: 'var(--platform-text-primary)', fontWeight: '500', fontSize: '0.9rem' 
};
const inputStyle = { 
    width: '100%', padding: '0.75rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '0.9rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box' 
};
const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
    overflow: 'auto',
    fontFamily: 'inherit',
    lineHeight: '1.5'
};
const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--platform-text-primary)',
    marginTop: '0',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--platform-border-color)'
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
    transition: 'background 0.2s, color 0.2s',
    fontSize: '0.9rem'
});

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

    return (
        <div> 
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={sectionTitleStyle}>🖼️ Фон блоку</h4>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>Тип фону:</label>
                    <div style={toggleButtonContainerStyle}>
                        <button 
                            type="button"
                            style={toggleButtonStyle(safeData.bg_type === 'image')}
                            onClick={() => handleChangeDirect('bg_type', 'image')}
                        >
                            🖼️ Картинка
                        </button>
                        <button 
                            type="button"
                            style={toggleButtonStyle(safeData.bg_type === 'video')}
                            onClick={() => handleChangeDirect('bg_type', 'video')}
                        >
                            🎥 Відео
                        </button>
                    </div>
                </div>

                {safeData.bg_type === 'image' && (
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Зображення:</label>
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
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Відео файл (MP4/WebM):</label>
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

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Постер (показується, поки відео вантажиться):</label>
                            <div style={{height: '100px'}}>
                                <ImageInput 
                                    value={safeData.bg_image}
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div style={formGroupStyle}>
                    <label style={labelStyle}>🎨 Тема блоку (Контраст):</label>
                    <div style={toggleButtonContainerStyle}>
                        <button 
                            type="button"
                            style={toggleButtonStyle(safeData.theme_mode === 'auto')}
                            onClick={() => handleChangeDirect('theme_mode', 'auto')}
                            title="Як на сайті"
                        >
                            🌓 Авто
                        </button>
                        <button 
                            type="button"
                            style={toggleButtonStyle(safeData.theme_mode === 'light')}
                            onClick={() => handleChangeDirect('theme_mode', 'light')}
                            title="Чорний текст на білому"
                        >
                            ☀️ Світла
                        </button>
                        <button 
                            type="button"
                            style={toggleButtonStyle(safeData.theme_mode === 'dark')}
                            onClick={() => handleChangeDirect('theme_mode', 'dark')}
                            title="Білий текст на темному"
                        >
                            🌙 Темна
                        </button>
                    </div>
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                        Оберіть "Темну", якщо використовуєте фотографію.
                    </small>
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>
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

                <div style={formGroupStyle}>
                    <label style={labelStyle}>Колір накладання:</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <input 
                            type="text" 
                            name="overlay_color" 
                            value={safeData.overlay_color}
                            onChange={handleChange}
                            placeholder="rgba(0,0,0,0.5)"
                            style={inputStyle}
                        />
                        <div style={{
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '4px', 
                            background: safeData.overlay_color,
                            border: '1px solid var(--platform-border-color)',
                            flexShrink: 0
                        }} />
                    </div>
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                        CSS колір. Наприклад: <code>rgba(0, 0, 0, 0.6)</code> для затемнення.
                    </small>
                </div>
                
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Висота блоку:</label>
                    <CustomSelect 
                        name="height" 
                        value={safeData.height} 
                        onChange={handleChange} 
                        options={heightOptions}
                        style={inputStyle}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h4 style={sectionTitleStyle}>📝 Вміст</h4>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>Шрифт тексту:</label>
                    <CustomSelect
                        name="fontFamily"
                        value={safeData.fontFamily}
                        onChange={handleChange}
                        options={FONT_LIBRARY}
                        style={inputStyle}
                    />
                </div>
                
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Заголовок:</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={localTitle}
                        onChange={handleTitleChange} 
                        onBlur={handleTitleBlur}
                        placeholder="Головний заголовок"
                        style={inputStyle}
                    />
                </div>
                
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Підзаголовок:</label>
                    <textarea 
                        name="subtitle" 
                        value={localSubtitle}
                        onChange={handleSubtitleChange} 
                        onBlur={handleSubtitleBlur}
                        placeholder="Короткий опис"
                        rows="3"
                        style={textareaStyle}
                    />
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>Вирівнювання тексту:</label>
                    <div style={toggleButtonContainerStyle}>
                        <button 
                            type="button"
                            style={toggleButtonStyle(safeData.alignment === 'left')}
                            onClick={() => handleAlignmentChange('left')}
                        >
                            ⬅️ Зліва
                        </button>
                        <button 
                            type="button"
                            style={toggleButtonStyle(safeData.alignment === 'center')}
                            onClick={() => handleAlignmentChange('center')}
                        >
                            ⏺️ Центр
                        </button>
                        <button 
                            type="button"
                            style={toggleButtonStyle(safeData.alignment === 'right')}
                            onClick={() => handleAlignmentChange('right')}
                        >
                            ➡️ Справа
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h4 style={sectionTitleStyle}>🔘 Кнопка дії</h4>
                
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Текст кнопки:</label>
                    <input 
                        type="text" 
                        name="button_text" 
                        value={safeData.button_text}
                        onChange={handleChange}
                        placeholder="Наприклад: Детальніше"
                        style={inputStyle}
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                        Залиште порожнім, щоб приховати кнопку.
                    </small>
                </div>
                
                {safeData.button_text && (
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Посилання кнопки:</label>
                        <input 
                            type="text" 
                            name="button_link" 
                            value={safeData.button_link}
                            onChange={handleChange}
                            placeholder="/catalog"
                            style={inputStyle}
                        />
                    </div>
                )}
            </div>

            <style>
                {`
                textarea {
                    overflow: auto !important;
                    resize: vertical !important;
                }
                textarea::-webkit-scrollbar {
                    width: 8px;
                }
                textarea::-webkit-scrollbar-track {
                    background: var(--platform-bg);
                    border-radius: 4px;
                }
                textarea::-webkit-scrollbar-thumb {
                    background: var(--platform-border-color);
                    border-radius: 4px;
                }
                textarea::-webkit-scrollbar-thumb:hover {
                    background: var(--platform-text-secondary);
                }
                `}
            </style>
        </div>
    );
};

export default HeroSettings;