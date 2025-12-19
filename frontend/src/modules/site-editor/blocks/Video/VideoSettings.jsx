// frontend/src/modules/site-editor/blocks/Video/VideoSettings.jsx
import React, { useState } from 'react';
import MediaPickerModal from '../../../media/components/MediaPickerModal';
import { 
    IconVideo, IconTrash, IconPlus, IconCheck
} from '../../../../common/components/ui/Icons';
import CustomSelect from '../../../../common/components/ui/CustomSelect';

const API_URL = 'http://localhost:5000';

const formGroupStyle = { marginBottom: '1.5rem' };
const labelStyle = { 
    display: 'block', marginBottom: '0.5rem', 
    color: 'var(--platform-text-primary)', fontWeight: '500', fontSize: '0.9rem'
};
const inputStyle = { 
    width: '100%', padding: '0.75rem', 
    border: '1px solid var(--platform-border-color)', borderRadius: '4px', 
    fontSize: '0.9rem', background: 'var(--platform-card-bg)', 
    color: 'var(--platform-text-primary)', boxSizing: 'border-box',
    outline: 'none'
};

const toggleContainerStyle = {
    display: 'flex',
    background: 'var(--platform-bg)',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid var(--platform-border-color)',
    marginBottom: '1rem'
};

const toggleBtnStyle = (isActive) => ({
    flex: 1,
    padding: '8px',
    border: 'none',
    background: isActive ? 'var(--platform-card-bg)' : 'transparent',
    color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
    boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
    transition: 'all 0.2s'
});

const videoPreviewStyle = {
    width: '100%',
    aspectRatio: '16/9',
    background: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--platform-border-color)',
    marginBottom: '10px'
};

const VideoSettings = ({ data, onChange }) => {
    const initialSource = data.url && data.url.startsWith('/') ? 'library' : 'link';
    const [sourceType, setSourceType] = useState(initialSource);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleChange = (name, value) => {
        onChange({ ...data, [name]: value });
    };

    const handleMediaSelect = (file) => {
        const selected = Array.isArray(file) ? file[0] : file;
        if (selected) {
            handleChange('url', selected.path_full);
        }
        setIsPickerOpen(false);
    };

    const sizeOptions = [
        { value: 'small', label: 'Маленьке (400px)' },
        { value: 'medium', label: 'Середнє (650px)' },
        { value: 'large', label: 'На всю ширину' },
    ];

    return (
        <div>
            <MediaPickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleMediaSelect}
                multiple={false}
                allowedTypes={['video']}
                title="Виберіть відео"
            />

            <div style={formGroupStyle}>
                <label style={labelStyle}>Джерело відео:</label>
                <div style={toggleContainerStyle}>
                    <button 
                        type="button" 
                        style={toggleBtnStyle(sourceType === 'link')}
                        onClick={() => setSourceType('link')}
                    >
                        🔗 Посилання
                    </button>
                    <button 
                        type="button" 
                        style={toggleBtnStyle(sourceType === 'library')}
                        onClick={() => setSourceType('library')}
                    >
                        📁 Медіатека
                    </button>
                </div>

                {sourceType === 'link' ? (
                    <div>
                        <input 
                            type="text" 
                            value={data.url || ''} 
                            onChange={(e) => handleChange('url', e.target.value)} 
                            style={inputStyle} 
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem', display: 'block', marginTop: '6px'}}>
                            Підтримуються: YouTube, Vimeo.
                        </small>
                    </div>
                ) : (
                    <div>
                        {data.url && data.url.startsWith('/') ? (
                            <div>
                                <div style={videoPreviewStyle}>
                                    <video 
                                        src={`${API_URL}${data.url}`} 
                                        style={{width: '100%', height: '100%', objectFit: 'contain'}} 
                                        controls={false}
                                    />
                                    <button 
                                        onClick={() => handleChange('url', '')}
                                        style={{
                                            position: 'absolute', top: 5, right: 5,
                                            background: 'rgba(229, 62, 62, 0.9)', color: 'white',
                                            border: 'none', borderRadius: '50%', width: 24, height: 24,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title="Видалити"
                                    >
                                        <IconTrash size={12} />
                                    </button>
                                </div>
                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button 
                                        type="button"
                                        onClick={() => setIsPickerOpen(true)}
                                        style={{
                                            flex: 1, padding: '8px', borderRadius: '6px',
                                            border: '1px solid var(--platform-border-color)',
                                            background: 'var(--platform-card-bg)',
                                            color: 'var(--platform-text-primary)',
                                            cursor: 'pointer', fontSize: '0.9rem'
                                        }}
                                    >
                                        Змінити відео
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => setIsPickerOpen(true)}
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    borderRadius: '8px',
                                    border: '2px dashed var(--platform-border-color)',
                                    background: 'var(--platform-bg)',
                                    color: 'var(--platform-text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--platform-accent)';
                                    e.currentTarget.style.color = 'var(--platform-accent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                                    e.currentTarget.style.color = 'var(--platform-text-secondary)';
                                }}
                            >
                                <IconPlus size={24} />
                                <span>Обрати з бібліотеки</span>
                            </button>
                        )}
                        <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem', display: 'block', marginTop: '6px'}}>
                            MP4, WebM, OGG. Макс. розмір залежить від налаштувань сервера.
                        </small>
                    </div>
                )}
            </div>
            
            <div style={formGroupStyle}>
                <label style={labelStyle}>Розмір відео:</label>
                <CustomSelect 
                    name="sizePreset" 
                    value={data.sizePreset || 'medium'} 
                    onChange={(e) => handleChange('sizePreset', e.target.value)} 
                    options={sizeOptions}
                    style={inputStyle}
                />
                <small style={{color: 'var(--platform-text-secondary)', fontSize: '0.8rem', marginTop: '6px', display: 'block'}}>
                    Максимальна ширина контейнера відео.
                </small>
            </div>
        </div>
    );
};

export default VideoSettings;