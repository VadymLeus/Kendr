// frontend/src/common/components/ui/SiteFilters.jsx
import React from 'react';
import { 
    IconSearch, IconClear, IconGrid, IconList, IconSort, IconTag, 
    IconCalendar, IconEye, IconUser, IconTrendingUp, IconStar
} from './Icons';

const SORT_FIELD_OPTIONS = [
    { value: 'created_at', label: 'Дата', icon: <IconCalendar size={14} /> },
    { value: 'view_count', label: 'Перегляди', icon: <IconEye size={14} /> },
    { value: 'popularity', label: 'Популярність', icon: <IconTrendingUp size={14} /> },
    { value: 'author', label: 'Автор', icon: <IconUser size={14} /> }
];

const SiteFilters = ({
    searchTerm,
    onSearchChange,
    onSearchSubmit,
    onClearSearch,
    sortOption = 'created_at:desc',
    onSortChange,
    viewMode,
    onViewModeChange,
    tags,
    selectedTag,
    onTagSelect,
    loading,
    showStarFilter = false,
    isStarActive = false,
    onStarClick,
    starTitle = "Обране",
    extraButtons = null
}) => {
    
    const [sortField, sortOrder] = sortOption.split(':');
    
    const handleSortFieldChange = (field) => {
        onSortChange(`${field}:${sortOrder}`);
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
        onSortChange('popularity:desc');
    };

    const hasActiveFilters = searchTerm || selectedTag || sortField !== 'popularity' || sortOrder !== 'desc';

    return (
        <div style={{ 
            marginBottom: '2rem', 
            background: 'var(--platform-card-bg)', 
            padding: '1.25rem', 
            borderRadius: '12px', 
            border: '1px solid var(--platform-border-color)', 
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)', 
            width: '100%', 
            boxSizing: 'border-box' 
        }}>
            
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '1rem', 
                alignItems: 'center', 
                marginBottom: '1.25rem' 
            }}>
                
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <button 
                        onClick={onSearchSubmit}
                        style={{ 
                            position: 'absolute', 
                            left: '8px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'transparent', 
                            border: 'none', 
                            cursor: 'pointer', 
                            padding: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            color: 'var(--platform-text-secondary)', 
                            zIndex: 2 
                        }}
                        title="Знайти"
                    >
                        <IconSearch />
                    </button>

                    <input 
                        type="text" 
                        placeholder="Пошук сайтів..." 
                        value={searchTerm} 
                        onChange={(e) => onSearchChange(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        style={{ 
                            width: '100%', 
                            padding: '12px 40px 12px 40px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--platform-border-color)', 
                            background: 'var(--platform-bg)', 
                            color: 'var(--platform-text-primary)', 
                            fontSize: '0.95rem', 
                            boxSizing: 'border-box', 
                            transition: 'all 0.2s' 
                        }} 
                    />
                    
                    {searchTerm && (
                        <button 
                            onClick={onClearSearch} 
                            style={{ 
                                position: 'absolute', 
                                right: '8px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                border: 'none', 
                                background: 'transparent', 
                                cursor: 'pointer', 
                                color: 'var(--platform-text-secondary)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                padding: '6px', 
                                borderRadius: '50%', 
                                width: '28px', 
                                height: '28px' 
                            }}
                            title="Очистити пошук"
                        >
                            <IconClear size={16} />
                        </button>
                    )}
                </div>
                
                <div style={{ 
                    display: 'flex', 
                    gap: '0.75rem', 
                    flexWrap: 'wrap', 
                    alignItems: 'center'
                }}>
                    {extraButtons}

                    {showStarFilter && (
                        <button
                            onClick={onStarClick}
                            style={{
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--platform-border-color)',
                                background: isStarActive ? 'var(--platform-accent)' : 'var(--platform-card-bg)',
                                color: isStarActive ? 'var(--platform-accent-text)' : 'var(--platform-text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                boxShadow: isStarActive ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                            }}
                            title={starTitle}
                        >
                            <IconStar size={16} filled={isStarActive} />
                        </button>
                    )}

                    <div style={{ 
                        display: 'flex', 
                        gap: '2px', 
                        background: 'var(--platform-bg)', 
                        padding: '3px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--platform-border-color)' 
                    }}>
                        <button 
                            onClick={() => onViewModeChange('grid')} 
                            style={{ 
                                padding: '8px 10px', 
                                borderRadius: '6px', 
                                border: 'none', 
                                background: viewMode === 'grid' ? 'var(--platform-card-bg)' : 'transparent', 
                                color: viewMode === 'grid' ? 'var(--platform-accent)' : 'var(--platform-text-secondary)', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }} 
                            title="Сітка"
                        >
                            <IconGrid size={16} />
                        </button>
                        <button 
                            onClick={() => onViewModeChange('list')} 
                            style={{ 
                                padding: '8px 10px', 
                                borderRadius: '6px', 
                                border: 'none', 
                                background: viewMode === 'list' ? 'var(--platform-card-bg)' : 'transparent', 
                                color: viewMode === 'list' ? 'var(--platform-accent)' : 'var(--platform-text-secondary)', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }} 
                            title="Список"
                        >
                            <IconList size={16} />
                        </button>
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        alignItems: 'center',
                        background: 'var(--platform-bg)',
                        padding: '4px',
                        borderRadius: '8px',
                        border: '1px solid var(--platform-border-color)'
                    }}>
                        <div style={{ position: 'relative' }}>
                            <select 
                                value={sortField} 
                                onChange={(e) => handleSortFieldChange(e.target.value)} 
                                style={{ 
                                    padding: '8px 28px 8px 12px', 
                                    borderRadius: '6px', 
                                    border: 'none',
                                    background: 'transparent', 
                                    color: 'var(--platform-text-primary)', 
                                    fontSize: '0.9rem', 
                                    cursor: 'pointer', 
                                    minWidth: '140px', 
                                    appearance: 'none',
                                    outline: 'none'
                                }}
                                title="Сортувати за"
                            >
                                {SORT_FIELD_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <div style={{ 
                                position: 'absolute', 
                                right: '8px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                pointerEvents: 'none', 
                                color: 'var(--platform-text-secondary)', 
                                fontSize: '0.7rem' 
                            }}>
                                ▼
                            </div>
                        </div>
                        
                        <button 
                            onClick={toggleSortOrder}
                            style={{ 
                                padding: '8px 10px', 
                                borderRadius: '6px', 
                                border: 'none', 
                                background: 'var(--platform-card-bg)', 
                                color: 'var(--platform-text-primary)', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                minWidth: '40px',
                                transition: 'all 0.2s',
                                fontSize: '1.1rem',
                                fontWeight: 'bold'
                            }}
                            title={sortOrder === 'desc' ? 'Спочатку новіші (↓)' : 'Спочатку старіші (↑)'}
                        >
                            {sortOrder === 'desc' ? '↓' : '↑'}
                        </button>
                    </div>

                    <button 
                        onClick={handleClearAll}
                        style={{ 
                            padding: '8px', 
                            borderRadius: '6px', 
                            border: `1px solid ${hasActiveFilters ? '#feb2b2' : '#e2e8f0'}`, 
                            background: hasActiveFilters ? '#fff5f5' : 'var(--platform-card-bg)', 
                            color: hasActiveFilters ? '#e53e3e' : '#a0aec0', 
                            cursor: hasActiveFilters ? 'pointer' : 'default', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            transition: 'all 0.2s',
                            opacity: hasActiveFilters ? 1 : 0.6
                        }}
                        onMouseEnter={(e) => {
                            if (hasActiveFilters) {
                                e.target.style.background = '#e53e3e';
                                e.target.style.color = 'white';
                                e.target.style.borderColor = '#e53e3e';
                                e.target.style.transform = 'scale(1.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (hasActiveFilters) {
                                e.target.style.background = '#fff5f5';
                                e.target.style.color = '#e53e3e';
                                e.target.style.borderColor = '#feb2b2';
                                e.target.style.transform = 'scale(1)';
                            }
                        }}
                        title={hasActiveFilters ? "Очистити всі фільтри" : "Немає активних фільтрів"}
                        disabled={!hasActiveFilters}
                    >
                        <IconClear size={16} />
                    </button>
                </div>
            </div>

            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                flexWrap: 'wrap', 
                paddingTop: '12px', 
                borderTop: '1px solid var(--platform-border-color)' 
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    minWidth: '80px', 
                    color: 'var(--platform-text-secondary)', 
                    fontSize: '0.85rem', 
                    fontWeight: '500' 
                }}>
                    <IconTag size={14} /> Теги:
                </div>
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '6px', 
                    flex: 1, 
                    alignItems: 'center' 
                }}>
                    <button 
                        onClick={() => onTagSelect(null)} 
                        style={{ 
                            padding: '5px 12px', 
                            borderRadius: '16px', 
                            background: selectedTag === null ? 'var(--platform-accent)' : 'var(--platform-bg)', 
                            color: selectedTag === null ? 'white' : 'var(--platform-text-primary)', 
                            cursor: 'pointer', 
                            fontSize: '0.8rem', 
                            fontWeight: '500', 
                            transition: 'all 0.2s', 
                            border: selectedTag === null ? 'none' : '1px solid var(--platform-border-color)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Всі
                    </button>
                    {tags.map(tag => (
                        <button 
                            key={tag.id} 
                            onClick={() => onTagSelect(selectedTag === tag.id ? null : tag.id)} 
                            style={{ 
                                padding: '5px 12px', 
                                borderRadius: '16px', 
                                background: selectedTag === tag.id ? 'var(--platform-accent)' : 'var(--platform-bg)', 
                                color: selectedTag === tag.id ? 'white' : 'var(--platform-text-primary)', 
                                cursor: 'pointer', 
                                fontSize: '0.8rem', 
                                fontWeight: '500', 
                                transition: 'all 0.2s', 
                                border: selectedTag === tag.id ? 'none' : '1px solid var(--platform-border-color)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            #{tag.name}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                background: 'var(--platform-bg)', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                color: 'var(--platform-text-secondary)', 
                border: '1px solid var(--platform-border-color)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                flexWrap: 'wrap' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconSearch size={14} />
                    <span>Пошук:</span>
                    {searchTerm ? (
                        <strong style={{color: 'var(--platform-text-primary)'}}>"{searchTerm}"</strong>
                    ) : (
                        <span style={{opacity: 0.7, fontStyle: 'italic'}}>всі</span>
                    )}
                </div>
                
                <div style={{ width: '1px', height: '12px', background: 'var(--platform-border-color)' }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconTag size={14} />
                    <span>Тег:</span>
                    {selectedTag && tags.find(t => t.id === selectedTag) ? (
                        <strong style={{color: 'var(--platform-accent)'}}>#{tags.find(t => t.id === selectedTag).name}</strong>
                    ) : (
                        <span style={{opacity: 0.7, fontStyle: 'italic'}}>всі</span>
                    )}
                </div>
                
                <div style={{ width: '1px', height: '12px', background: 'var(--platform-border-color)' }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconSort size={14} />
                    <span>Сортування:</span>
                    <strong style={{color: 'var(--platform-text-primary)'}}>
                        {SORT_FIELD_OPTIONS.find(opt => opt.value === sortField)?.label} 
                        {' '}
                        {sortOrder === 'desc' ? '↓' : '↑'}
                    </strong>
                </div>
            </div>
        </div>
    );
};

export default SiteFilters;