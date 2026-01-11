// frontend/src/shared/ui/complex/SiteFilters.jsx
import React from 'react';
import { Button } from '../elements/Button';
import { Input } from '../elements/Input';
import { Select } from '../elements';
import { Search, X, Calendar, Eye, User, TrendingUp, Star, Type, Tag } from 'lucide-react';

const SORT_OPTIONS = [
    { value: 'created_at', label: 'Дата', icon: Calendar },
    { value: 'view_count', label: 'Перегляди', icon: Eye },
    { value: 'popularity', label: 'Популярність', icon: TrendingUp },
    { value: 'title', label: 'За назвою', icon: Type },
    { value: 'author', label: 'Автор', icon: User }
];

const SiteFilters = ({
    searchTerm, onSearchChange, onSearchSubmit,
    sortOption = 'created_at:desc', onSortChange,
    tags = [], selectedTag, onTagSelect,
    showStarFilter = false, isStarActive = false, onStarClick, starTitle = "Обране",
    extraButtons = null
}) => {
    const [sortField, sortOrder] = sortOption.split(':');

    const handleSortFieldChange = (e) => onSortChange(`${e.target.value}:${sortOrder}`);
    const toggleSortOrder = () => onSortChange(`${sortField}:${sortOrder === 'desc' ? 'asc' : 'desc'}`);
    const handleClearAll = () => { onSearchChange(''); onTagSelect(null); };

    return (
        <div style={{
            position: 'sticky', top: '20px', zIndex: 40, marginBottom: '2rem',
            background: 'var(--platform-card-bg)', opacity: 0.98, backdropFilter: 'blur(10px)',
            padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--platform-border-color)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.75rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                
                <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Input 
                        placeholder="Пошук..." 
                        value={searchTerm} 
                        onChange={(e) => onSearchChange(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit && onSearchSubmit()}
                        leftIcon={<Search size={18} />}
                        wrapperStyle={{ marginBottom: 0 }}
                        style={{ height: '38px' }} 
                    />
                </div>

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    flexWrap: 'wrap',
                    flexShrink: 0, 
                    marginLeft: 'auto'
                }}>
                    {extraButtons}

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{ width: '160px' }}>
                            <Select
                                value={sortField}
                                onChange={handleSortFieldChange}
                                options={SORT_OPTIONS}
                                placeholder="Сортування"
                                style={{ height: '38px', padding: '6px 10px' }}
                            />
                        </div>

                        <Button 
                            variant="outline"
                            onClick={toggleSortOrder} 
                            title={sortOrder === 'desc' ? "За спаданням" : "За зростанням"}
                            style={{ 
                                padding: '0', height: '38px', width: '38px', minWidth: '38px',
                                background: 'var(--platform-card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{sortOrder === 'desc' ? '↓' : '↑'}</span>
                        </Button>
                    </div>

                    {showStarFilter && (
                        <Button
                            variant="square-accent"
                            active={isStarActive}
                            onClick={onStarClick}
                            title={starTitle}
                            style={{ height: '38px', width: '38px', padding: 0 }}
                        >
                            <Star size={18} fill={isStarActive ? "currentColor" : "none"} />
                        </Button>
                    )}

                    <Button 
                        variant="square-danger"
                        onClick={handleClearAll} 
                        title="Очистити"
                        style={{ height: '38px', width: '38px', padding: 0 }}
                    >
                        <X size={18} />
                    </Button>
                </div>
            </div>

            {tags && tags.length > 0 && (
                <div style={{ 
                    borderTop: '1px solid var(--platform-border-color)', 
                    paddingTop: '0.75rem', 
                    display: 'flex', 
                    gap: '8px', 
                    flexWrap: 'wrap', 
                    alignItems: 'center' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--platform-text-primary)', flexShrink: 0 }}>
                        <Tag size={14} /> Теги:
                    </div>
                    <Button variant="outline" onClick={() => onTagSelect(null)}
                        style={{ 
                            borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', height: 'auto',
                            ...(selectedTag === null ? { borderColor: 'var(--platform-accent)', color: 'var(--platform-accent)', background: 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.1)' } : { color: 'var(--platform-text-secondary)' })
                        }}
                    >
                        Всі
                    </Button>
                    {tags.map(tag => (
                        <Button key={tag.id} variant="outline" onClick={() => onTagSelect(selectedTag === tag.id ? null : tag.id)}
                            style={{ 
                                borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', height: 'auto', whiteSpace: 'nowrap',
                                ...(selectedTag === tag.id ? { borderColor: 'var(--platform-accent)', color: 'var(--platform-accent)', background: 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.1)' } : { color: 'var(--platform-text-secondary)' })
                            }}
                        >
                            #{tag.name}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SiteFilters;