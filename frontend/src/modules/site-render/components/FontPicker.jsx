// frontend/src/modules/site-render/components/FontPicker.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';
import { FONT_LIBRARY } from '../../site-editor/core/editorConfig';
import { useConfirm } from '../../../common/hooks/useConfirm';

const API_URL = 'http://localhost:5000';

const FontPicker = ({ 
    label, 
    value, 
    onChange, 
    type = 'heading', 
    externalFonts, 
    onExternalChange 
}) => {
    const [localFonts, setLocalFonts] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewFont, setPreviewFont] = useState(value);
    
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    
    const fileInputRef = useRef(null);
    const { confirm } = useConfirm();

    const activeFonts = externalFonts || localFonts;

    const refreshFonts = () => {
        if (onExternalChange) {
            onExternalChange();
        } else {
            fetchLocalFonts();
        }
    };

    const fetchLocalFonts = async () => {
        try {
            const res = await apiClient.get('/media');
            const fonts = res.data.filter(f => 
                f.mime_type.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(f.original_file_name)
            );
            setLocalFonts(fonts);
        } catch (error) {
            console.error("Error fetching fonts", error);
        }
    };

    useEffect(() => {
        if (!externalFonts) {
            fetchLocalFonts();
        }
    }, [externalFonts]);

    useEffect(() => {
        setPreviewFont(value);
    }, [value]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('mediaFile', file);
        setIsUploading(true);

        try {
            await apiClient.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Шрифт завантажено!');
            
            refreshFonts(); 
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка завантаження');
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id, name, e) => {
        e.stopPropagation();
        
        const isConfirmed = await confirm({
            title: "Видалити шрифт?",
            message: `Ви впевнені, що хочете видалити шрифт "${name}"?`,
            type: "danger",
            confirmLabel: "Видалити"
        });
        
        if (!isConfirmed) return;
        
        try {
            await apiClient.delete(`/media/${id}`);
            
            refreshFonts();
            
            if (!externalFonts) {
                setLocalFonts(prev => prev.filter(f => f.id !== id));
            }

            toast.success('Шрифт видалено');
            if (value && value.includes(id)) {
                onChange("'Inter', sans-serif"); 
            }
        } catch (error) {
            toast.error('Помилка видалення');
        }
    };

    const startEditing = (font, e) => {
        e.stopPropagation();
        setEditingId(font.id);
        setEditName(font.alt_text || font.original_file_name);
    };

    const saveName = async (id, e) => {
        e.stopPropagation();
        try {
            await apiClient.put(`/media/${id}`, { alt_text: editName });
            
            refreshFonts();

            setEditingId(null);
            toast.success('Назву оновлено');
        } catch (error) {
            toast.error('Помилка перейменування');
        }
    };

    const { customList, googleList } = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();

        const custom = activeFonts.map(f => ({
            id: f.id,
            label: f.alt_text || f.original_file_name,
            value: f.path_full,
            isCustom: true,
            originalObj: f
        })).filter(f => f.label.toLowerCase().includes(lowerSearch));

        const google = FONT_LIBRARY.filter(f => f.value !== 'global').map(f => ({
            id: f.value,
            label: f.label,
            value: f.value,
            isCustom: false
        })).filter(f => f.label.toLowerCase().includes(lowerSearch));

        return { customList: custom, googleList: google };
    }, [activeFonts, searchTerm]);

    useEffect(() => {
        if (!previewFont || previewFont === 'global') return;

        const loadFontPreview = async () => {
            const isCustom = previewFont.includes('/uploads/');
            const previewEl = document.getElementById(`font-preview-${type}`);
            
            if (isCustom) {
                const url = previewFont.startsWith('http') ? previewFont : `${API_URL}${previewFont}`;
                const familyName = `Preview-${Date.now()}`;
                const fontFace = new FontFace(familyName, `url(${url})`);
                
                try {
                    const loadedFace = await fontFace.load();
                    document.fonts.add(loadedFace);
                    if (previewEl) previewEl.style.fontFamily = familyName;
                } catch (e) {
                    console.error("Failed to load custom font preview", e);
                }
            } else {
                const cleanName = previewFont.split(',')[0].replace(/['"]/g, '');
                
                const linkId = `google-font-preview-${cleanName.replace(/\s+/g, '-')}`;
                if (!document.getElementById(linkId)) {
                    const link = document.createElement('link');
                    link.id = linkId;
                    link.href = `https://fonts.googleapis.com/css2?family=${cleanName.replace(/ /g, '+')}:wght@400;700&display=swap`;
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                }

                if (previewEl) previewEl.style.fontFamily = cleanName;
            }
        };

        loadFontPreview();
    }, [previewFont, type]);

    const handleHover = (fontValue) => {
        setPreviewFont(fontValue);
    };

    const containerStyle = {
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        background: 'var(--platform-card-bg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '420px'
    };

    const headerStyle = {
        padding: '12px',
        borderBottom: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        display: 'flex',
        gap: '8px'
    };

    const bodyStyle = {
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
    };

    const listStyle = {
        width: '50%',
        borderRight: '1px solid var(--platform-border-color)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--platform-card-bg)'
    };

    const previewAreaStyle = {
        width: '50%',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--platform-bg)',
        textAlign: 'center',
        position: 'relative',
        color: 'var(--platform-text-primary)'
    };

    const sectionHeaderStyle = {
        padding: '8px 12px',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-secondary)',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid var(--platform-border-color)',
        borderTop: '1px solid var(--platform-border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 1
    };

    const listItemStyle = (isActive) => ({
        padding: '10px 12px',
        borderBottom: '1px solid var(--platform-border-color)',
        cursor: 'pointer',
        background: isActive ? 'var(--platform-accent)' : 'transparent',
        color: isActive ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
        fontSize: '0.9rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.2s'
    });

    const searchInputStyle = {
        flex: 1,
        padding: '8px 10px',
        borderRadius: '6px',
        border: '1px solid var(--platform-border-color)',
        fontSize: '0.9rem',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)'
    };

    const addButtonStyle = {
        padding: '8px 16px',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const addButtonHoverStyle = {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const iconBtnStyle = {
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        opacity: 0.7, 
        fontSize: '1rem', 
        padding: '4px',
        color: 'inherit',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--platform-text-primary)' }}>
                {label}
            </label>
            
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <input 
                        type="text" 
                        placeholder="🔍 Пошук..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                    />
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        style={addButtonStyle}
                        disabled={isUploading}
                        onMouseOver={(e) => {
                            if (!isUploading) {
                                Object.assign(e.target.style, addButtonHoverStyle);
                            }
                        }}
                        onMouseOut={(e) => {
                            Object.assign(e.target.style, addButtonStyle);
                        }}
                    >
                        {isUploading ? '⏳' : '➕'} Додати
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{display: 'none'}}
                        accept=".ttf,.otf,.woff,.woff2"
                        onChange={handleUpload}
                    />
                </div>

                <div style={bodyStyle}>
                    <div style={listStyle} className="custom-scrollbar">
                        
                        {customList.length > 0 && (
                            <>
                                <div style={sectionHeaderStyle}>📂 Мої шрифти</div>
                                {customList.map((font) => (
                                    <div 
                                        key={font.id}
                                        style={listItemStyle(value === font.value)}
                                        onMouseEnter={() => handleHover(font.value)}
                                        onClick={() => onChange(font.value)}
                                    >
                                        {editingId === font.id ? (
                                            <input 
                                                type="text" 
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                                onKeyDown={e => e.key === 'Enter' && saveName(font.id, e)}
                                                onBlur={(e) => saveName(font.id, e)}
                                                autoFocus
                                                style={{
                                                    width: '100%', 
                                                    padding: '4px 6px', 
                                                    borderRadius: '4px', 
                                                    border: '1px solid var(--platform-border-color)',
                                                    background: 'var(--platform-card-bg)',
                                                    color: 'var(--platform-text-primary)'
                                                }}
                                            />
                                        ) : (
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                                                {font.label}
                                            </span>
                                        )}

                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button 
                                                style={iconBtnStyle} 
                                                onClick={(e) => startEditing(font.originalObj, e)}
                                                title="Перейменувати"
                                                onMouseOver={(e) => {
                                                    e.target.style.background = 'var(--platform-hover-bg)';
                                                    e.target.style.opacity = '1';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.background = 'none';
                                                    e.target.style.opacity = '0.7';
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                style={{
                                                    ...iconBtnStyle, 
                                                    color: value === font.value ? 'inherit' : 'var(--platform-danger)'
                                                }} 
                                                onClick={(e) => handleDelete(font.id, font.label, e)}
                                                title="Видалити"
                                                onMouseOver={(e) => {
                                                    e.target.style.background = 'var(--platform-hover-bg)';
                                                    e.target.style.opacity = '1';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.background = 'none';
                                                    e.target.style.opacity = '0.7';
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        <div style={{
                            ...sectionHeaderStyle, 
                            borderTop: customList.length > 0 ? '1px solid var(--platform-border-color)' : 'none'
                        }}>
                            🌐 Стандартні (Google)
                        </div>
                        {googleList.map((font) => (
                            <div 
                                key={font.id}
                                style={listItemStyle(value === font.value)}
                                onMouseEnter={() => handleHover(font.value)}
                                onClick={() => onChange(font.value)}
                            >
                                <span style={{ flex: 1 }}>{font.label}</span>
                            </div>
                        ))}
                        
                        {googleList.length === 0 && customList.length === 0 && (
                            <div style={{ 
                                padding: '20px', 
                                textAlign: 'center', 
                                color: 'var(--platform-text-secondary)', 
                                fontSize: '0.85rem' 
                            }}>
                                Нічого не знайдено
                            </div>
                        )}
                    </div>

                    <div style={previewAreaStyle}>
                        <div 
                            id={`font-preview-${type}`}
                            style={{ 
                                transition: 'font-family 0.1s ease',
                                wordBreak: 'break-word'
                            }}
                        >
                            <h2 style={{ margin: '0 0 10px 0', fontWeight: 'normal' }}>Aa Bb Cc</h2>
                            <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: 'bold' }}>123</p>
                            <p style={{ 
                                fontSize: '0.9rem', 
                                margin: '20px 0 0 0', 
                                opacity: 0.8, 
                                lineHeight: 1.5 
                            }}>
                                {type === 'heading' 
                                    ? 'Це приклад заголовку. Оберіть шрифт зі списку, щоб побачити результат.' 
                                    : 'Це приклад основного тексту. Чудовий шрифт покращує читабельність контенту.'}
                            </p>
                        </div>
                        
                        {previewFont !== value && (
                            <div style={{ 
                                position: 'absolute', 
                                bottom: '15px', 
                                fontSize: '0.8rem', 
                                color: 'var(--platform-accent-text)',
                                background: 'var(--platform-accent)', 
                                padding: '6px 12px', 
                                borderRadius: '20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                animation: 'fadeIn 0.2s ease-out',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }} 
                            onClick={() => onChange(previewFont)}
                            onMouseOver={(e) => {
                                e.target.style.background = 'var(--platform-accent-hover)';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'var(--platform-accent)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                            >
                                Натисніть, щоб застосувати
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(5px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
};

export default FontPicker;