// frontend/src/features/editor/settings/HeroSettings.jsx
import React from 'react';
import ImageInput from '../../media/ImageInput';

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
    resize: 'vertical'
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
const buttonGroupStyle = {
    display: 'flex',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid var(--platform-border-color)'
};
const toggleButtonStyle = (isActive) => ({
    flex: 1,
    padding: '0.6rem',
    border: 'none',
    background: isActive ? 'var(--platform-accent)' : 'var(--platform-card-bg)',
    color: isActive ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    borderRight: '1px solid var(--platform-border-color)'
});

const HeroSettings = ({ data, onChange }) => {
    
    const safeData = {
        bg_image: data.bg_image || data.imageUrl || '',
        overlay_color: data.overlay_color || 'rgba(0, 0, 0, 0.5)',
        title: data.title || '',
        subtitle: data.subtitle || '',
        button_text: data.button_text || data.buttonText || '',
        button_link: data.button_link || data.buttonLink || '',
        alignment: data.alignment || 'center',
        height: data.height || 'medium'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...safeData, [name]: value });
    };

    const handleImageChange = (newUrl) => {
        const relativeUrl = newUrl.replace(/^http:\/\/localhost:5000/, '');
        onChange({ ...safeData, bg_image: relativeUrl });
    };

    const handleAlignmentChange = (alignment) => {
        onChange({ ...safeData, alignment });
    };
    
    const handleHeightChange = (height) => {
        onChange({ ...safeData, height });
    };

    return (
        <div> 
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={sectionTitleStyle}>🖼️ Фон та вигляд</h4>
                
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Фонове зображення:</label>
                    <ImageInput 
                        value={safeData.bg_image}
                        onChange={handleImageChange} 
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
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem' }}>
                        CSS колір. Наприклад: <code>rgba(0, 0, 0, 0.6)</code> для затемнення.
                    </small>
                </div>
                
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Висота блоку:</label>
                    <select 
                        name="height" 
                        value={safeData.height} 
                        onChange={handleChange} 
                        style={inputStyle}
                    >
                        <option value="small">Маленька</option>
                        <option value="medium">Середня</option>
                        <option value="large">Велика</option>
                        <option value="full">На весь екран</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h4 style={sectionTitleStyle}>📝 Вміст</h4>
                
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Заголовок:</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={safeData.title}
                        onChange={handleChange}
                        placeholder="Головний заголовок"
                        style={inputStyle}
                    />
                </div>
                
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Підзаголовок:</label>
                    <textarea 
                        name="subtitle" 
                        value={safeData.subtitle}
                        onChange={handleChange}
                        placeholder="Короткий опис"
                        rows="3"
                        style={textareaStyle}
                    />
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>Вирівнювання тексту:</label>
                    <div style={buttonGroupStyle}>
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
                            style={{...toggleButtonStyle(safeData.alignment === 'right'), borderRight: 'none'}}
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
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.8rem' }}>
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
        </div>
    );
};

export default HeroSettings;