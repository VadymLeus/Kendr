// frontend/src/common/components/ui/SiteFilters.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
    IconSearch, IconClear, IconSort, IconTag, 
    IconCalendar, IconEye, IconUser, IconTrendingUp, IconStar, IconX, IconCheck, IconType
} from './Icons';

const SORT_FIELD_OPTIONS = [
    { value: 'created_at', label: 'Дата', icon: <IconCalendar size={14} /> },
    { value: 'view_count', label: 'Перегляди', icon: <IconEye size={14} /> },
    { value: 'popularity', label: 'Популярність', icon: <IconTrendingUp size={14} /> },
    { value: 'title', label: 'За назвою', icon: <IconType size={14} /> },
    { value: 'author', label: 'Автор', icon: <IconUser size={14} /> }
];

const SiteFilters = ({
    searchTerm,
    onSearchChange,
    onSearchSubmit,
    onClearSearch,
    sortOption = 'created_at:desc',
    onSortChange,
    tags = [],
    selectedTag,
    onTagSelect,
    showStarFilter = false,
    isStarActive = false,
    onStarClick,
    starTitle = "Обране",
    extraButtons = null
}) => {
    const [sortField, sortOrder] = sortOption.split(':');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isClearHovered, setIsClearHovered] = useState(false);
    const [hoveredTag, setHoveredTag] = useState(null);
    const sortRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleSortFieldSelect = (field) => {
        onSortChange(`${field}:${sortOrder}`);
        setIsSortOpen(false);
    };

    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        onSortChange(`${sortField}:${newOrder}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearchSubmit();
        }
    };

    const handleClearAll = () => {
        onSearchChange('');
        onTagSelect(null);
    };

    const hasActiveFilters = searchTerm || selectedTag || isStarActive;

    const stickyWrapperStyle = {
        position: 'sticky',
        top: '20px',
        zIndex: 40,
        marginBottom: '2rem',
        background: 'var(--platform-card-bg)', 
        opacity: 0.98,
        backdropFilter: 'blur(10px)',
        padding: '0.75rem',
        borderRadius: '12px',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'all 0.3s ease'
    };

    const topRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap'
    };

    const searchInputWrapperStyle = {
        position: 'relative',
        flex: '1 1 300px',
        display: 'flex',
        alignItems: 'center'
    };

    const controlsWrapperStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0,
        marginLeft: 'auto'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 36px',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        height: '38px', 
        boxSizing: 'border-box'
    };

    const iconButtonStyle = (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: isActive ? 'var(--platform-accent)' : 'var(--platform-bg)',
        color: isActive ? 'white' : 'var(--platform-text-secondary)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        height: '38px', 
        boxSizing: 'border-box'
    });

    const tagsRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        maskImage: 'linear-gradient(to right, black 95%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, black 95%, transparent 100%)'
    };

    const tagButtonStyle = (isActive, isHovered) => ({
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        padding: '6px 14px', 
        borderRadius: '20px',
        fontSize: '0.85rem', 
        fontWeight: 500, 
        cursor: 'pointer',
        border: isActive 
            ? '1px solid var(--platform-accent)' 
            : '1px solid var(--platform-border-color)',
        backgroundColor: isActive 
            ? 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.1)' 
            : (isHovered ? 'rgba(0,0,0,0.02)' : 'transparent'),
        color: isActive 
            ? 'var(--platform-accent)' 
            : 'var(--platform-text-secondary)',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        flexShrink: 0
    });

    const sortContainerStyle = {
        display: 'flex', 
        gap: '0.5rem', 
        alignItems: 'center',
        background: 'var(--platform-bg)',
        padding: '4px',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        flexShrink: 0 
    };

    const sortTriggerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: 'var(--platform-text-primary)',
        minWidth: '130px',
        gap: '8px',
        userSelect: 'none',
        height: '30px'
    };

    const sortDropdownStyle = {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: '-1px',
        width: 'calc(100% + 2px)',
        minWidth: '150px',
        backgroundColor: 'var(--platform-card-bg)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 100,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '4px'
    };

    const sortOptionStyle = (isActive) => ({
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-primary)',
        backgroundColor: isActive ? 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.05)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        gap: '8px'
    });

    const sortDirectionBtnStyle = {
        padding: '0 10px', 
        borderRadius: '6px', 
        border: 'none', 
        background: 'var(--platform-card-bg)', 
        color: 'var(--platform-text-primary)', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minWidth: '36px',
        height: '30px',
        transition: 'all 0.2s',
        fontSize: '1.1rem',
        fontWeight: 'bold'
    };

    return (
        <div style={stickyWrapperStyle}>
            <div style={topRowStyle}>
                
                {/* Пошук */}
                <div style={searchInputWrapperStyle}>
                    <button 
                        onClick={() => {}} 
                        style={{
                            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                            background: 'transparent', border: 'none', color: 'var(--platform-text-secondary)',
                            display: 'flex', alignItems: 'center', padding: 0, pointerEvents: 'none'
                        }}
                    >
                        <IconSearch size={18} />
                    </button>
                    
                    <input 
                        type="text" 
                        placeholder="Пошук сайтів..." 
                        value={searchTerm} 
                        onChange={(e) => onSearchChange(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--platform-accent)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--platform-border-color)'; }}
                    />
                    
                    {searchTerm && (
                        <button 
                            onClick={() => onSearchChange('')}
                            style={{
                                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', padding: 0,
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--platform-text-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--platform-text-secondary)'}
                            title="Очистити"
                        >
                            {IconX ? <IconX size={16} /> : <IconClear size={16} />}
                        </button>
                    )}
                </div>

                <div style={controlsWrapperStyle}>
                    
                    {extraButtons}

                    {/* ОНОВЛЕНИЙ БЛОК СОРТУВАННЯ */}
                    <div style={sortContainerStyle}>
                        <div style={{ position: 'relative' }} ref={sortRef}>
                            {/* Тригер */}
                            <div 
                                style={sortTriggerStyle}
                                onClick={() => setIsSortOpen(!isSortOpen)}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {SORT_FIELD_OPTIONS.find(opt => opt.value === sortField)?.icon}
                                    {SORT_FIELD_OPTIONS.find(opt => opt.value === sortField)?.label || 'Сортування'}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', transform: isSortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                    ▼
                                </span>
                            </div>
                            
                            {/* Випадаючий список */}
                            {isSortOpen && (
                                <div style={sortDropdownStyle}>
                                    {SORT_FIELD_OPTIONS.map(opt => {
                                        const isActive = sortField === opt.value;
                                        return (
                                            <div
                                                key={opt.value}
                                                style={sortOptionStyle(isActive)}
                                                onClick={() => handleSortFieldSelect(opt.value)}
                                                onMouseEnter={(e) => {
                                                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {opt.icon}
                                                    {opt.label}
                                                </div>
                                                {isActive && (
                                                    <span style={{ color: 'var(--platform-accent)' }}>
                                                        {IconCheck ? <IconCheck size={14} /> : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        
                        {/* Кнопка напрямку */}
                        <button 
                            onClick={toggleSortOrder} 
                            style={sortDirectionBtnStyle}
                            title={sortOrder === 'desc' ? "За спаданням" : "За зростанням"}
                        >
                            {sortOrder === 'desc' ? '↓' : '↑'}
                        </button>
                    </div>

                    {showStarFilter && (
                        <button 
                            onClick={onStarClick} 
                            style={iconButtonStyle(isStarActive)}
                            title={starTitle}
                            onMouseEnter={(e) => {
                                if (!isStarActive) {
                                    e.currentTarget.style.borderColor = 'var(--platform-accent)';
                                    e.currentTarget.style.color = 'var(--platform-accent)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isStarActive) {
                                    e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                                    e.currentTarget.style.color = 'var(--platform-text-secondary)';
                                }
                            }}
                        >
                            <IconStar size={18} filled={isStarActive} />
                        </button>
                    )}

                    {/* Кнопка очищення фільтрів */}
                    <button 
                        onClick={handleClearAll} 
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                            borderRadius: '8px',
                            border: '1px solid var(--platform-border-color)',
                            background: 'var(--platform-card-bg)',
                            color: 'var(--platform-text-secondary)',
                            cursor: 'pointer',
                            width: '38px',
                            height: '38px', 
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }} 
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e53e3e';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = '#e53e3e';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--platform-card-bg)';
                            e.currentTarget.style.color = 'var(--platform-text-secondary)';
                            e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                        }}
                        title="Очистити всі фільтри"
                    >
                        <IconClear size={18} />
                    </button>
                </div>
            </div>

            {tags && tags.length > 0 && (
                <div style={{ borderTop: '1px solid var(--platform-border-color)', paddingTop: '0.75rem' }}>
                    <div style={tagsRowStyle} className="hide-scrollbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--platform-text-primary)', marginRight: '8px' }}>
                            <IconTag size={14} /> Теги:
                        </div>
                        <button 
                            onClick={() => onTagSelect(null)} 
                            style={tagButtonStyle(selectedTag === null, hoveredTag === 'all')}
                            onMouseEnter={() => setHoveredTag('all')}
                            onMouseLeave={() => setHoveredTag(null)}
                        >
                            Всі
                        </button>
                        {tags.map(tag => (
                            <button 
                                key={tag.id} 
                                onClick={() => onTagSelect(selectedTag === tag.id ? null : tag.id)} 
                                style={tagButtonStyle(selectedTag === tag.id, hoveredTag === tag.id)}
                                onMouseEnter={() => setHoveredTag(tag.id)}
                                onMouseLeave={() => setHoveredTag(null)}
                            >
                                #{tag.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default SiteFilters;