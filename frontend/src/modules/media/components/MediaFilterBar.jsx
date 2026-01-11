// frontend/src/modules/media/components/MediaFilterBar.jsx
import React, { useMemo, useState } from 'react';
import { Search, Star, Image, Video, File, Type } from 'lucide-react';

const MediaFilterBar = ({ filters, onFilterChange }) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const handleMainTypeChange = (type) => onFilterChange({ ...filters, type: type, extension: 'all' });
    const handleExtensionChange = (ext) => onFilterChange({ ...filters, extension: ext });
    const handleSearchChange = (val) => onFilterChange({ ...filters, search: val });
    const handleSortChange = (val) => onFilterChange({ ...filters, sort: val });

    const mainFilters = [
        { id: 'all', label: 'Всі', icon: null },
        { id: 'image', label: 'Фото', icon: <Image size={15} /> },
        { id: 'video', label: 'Відео', icon: <Video size={15} /> },
        { id: 'document', label: 'Док.', icon: <File size={15} /> },
        { id: 'font', label: 'Шрифти', icon: <Type size={15} /> },
    ];

    const subFilters = useMemo(() => {
        switch (filters.type) {
            case 'image': return [
                { id: 'all', label: 'Всі' }, 
                { id: 'jpg', label: 'JPG' }, { id: 'png', label: 'PNG' }, 
                { id: 'webp', label: 'WebP' }, { id: 'svg', label: 'SVG' }
            ];
            case 'video': return [
                { id: 'all', label: 'Всі' }, { id: 'mp4', label: 'MP4' }, { id: 'webm', label: 'WebM' }
            ];
            case 'document': return [
                { id: 'all', label: 'Всі' }, { id: 'pdf', label: 'PDF' }, 
                { id: 'docx', label: 'Word' }, { id: 'pptx', label: 'PPT' }
            ];
            case 'font': return [
                { id: 'all', label: 'Всі' }, { id: 'ttf', label: 'TTF' }, 
                { id: 'otf', label: 'OTF' }, { id: 'woff', label: 'WOFF' }
            ];
            default: return [];
        }
    }, [filters.type]);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '4px 0 20px 0',
    };

    const searchBarStyle = {
        display: 'flex',
        alignItems: 'center',
        background: 'var(--platform-bg)',
        border: `1px solid ${isFocused ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
        borderRadius: '16px',
        padding: '6px 8px',
        transition: 'all 0.2s ease',
        boxShadow: isFocused ? '0 0 0 3px rgba(var(--platform-accent-rgb), 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
    };

    const inputWrapperStyle = {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        paddingLeft: '10px'
    };

    const inputStyle = {
        width: '100%',
        border: 'none',
        background: 'transparent',
        color: 'var(--platform-text-primary)',
        fontSize: '0.95rem',
        outline: 'none',
        padding: '8px 0',
        height: '100%'
    };

    const dividerStyle = {
        width: '1px',
        height: '24px',
        background: 'var(--platform-border-color)',
        margin: '0 8px'
    };

    const selectStyle = {
        border: 'none',
        background: 'transparent',
        color: 'var(--platform-text-secondary)',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        outline: 'none',
        padding: '0 4px'
    };

    const favBtnStyle = (isActive) => ({
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        border: 'none',
        background: isActive ? 'rgba(var(--platform-accent-rgb), 0.1)' : 'transparent',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginLeft: '4px'
    });

    const filtersRowStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
    };

    const chipStyle = (isActive) => ({
        padding: '8px 16px',
        borderRadius: '50px',
        border: `1px solid ${isActive ? 'var(--platform-text-primary)' : 'var(--platform-border-color)'}`,
        background: isActive ? 'var(--platform-text-primary)' : 'var(--platform-bg)',
        color: isActive ? 'var(--platform-bg)' : 'var(--platform-text-secondary)',
        fontSize: '0.9rem',
        fontWeight: isActive ? '500' : '400',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: 0,
        lineHeight: 1
    });

    const subFiltersStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--platform-card-bg)',
        padding: '4px',
        borderRadius: '8px'
    };

    const subChipStyle = (isActive) => ({
        padding: '6px 12px',
        borderRadius: '6px',
        border: 'none',
        background: isActive ? 'white' : 'transparent',
        color: isActive ? 'black' : 'var(--platform-text-secondary)',
        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.2s'
    });

    return (
        <div style={containerStyle}>
            <div style={searchBarStyle}>
                <div style={inputWrapperStyle}>
                    <Search size={20} style={{ color: 'var(--platform-text-secondary)', display: 'block' }} />
                    <input 
                        type="text" 
                        placeholder="Пошук файлів..." 
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        style={inputStyle}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </div>

                <div style={dividerStyle}></div>

                <select 
                    value={filters.sort} 
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={selectStyle}
                >
                    <option value="newest">Нові</option>
                    <option value="oldest">Старі</option>
                    <option value="az">А-Я</option>
                    <option value="size_desc">Розмір</option>
                </select>

                <div style={dividerStyle}></div>

                <button 
                    onClick={() => onFilterChange({ ...filters, favorite: !filters.favorite })}
                    style={favBtnStyle(filters.favorite)}
                    title="Тільки обрані"
                >
                    <Star size={18} fill={filters.favorite ? "currentColor" : "none"} />
                </button>
            </div>

            <div style={filtersRowStyle}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {mainFilters.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => handleMainTypeChange(item.id)} 
                            style={chipStyle(filters.type === item.id)}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </div>

                {subFilters.length > 0 && (
                    <div style={subFiltersStyle}>
                        {subFilters.map(sub => (
                            <button 
                                key={sub.id} 
                                onClick={() => handleExtensionChange(sub.id)} 
                                style={subChipStyle(filters.extension === sub.id)}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaFilterBar;